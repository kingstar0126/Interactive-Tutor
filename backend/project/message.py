from flask import Blueprint, jsonify, request
from flask import Response,stream_with_context
from .models import Message, Train, User, Chat, Invite
from bs4 import BeautifulSoup
import requests
import uuid
from . import db
import io
import datetime
from rich import print, pretty
import time
import os
import shutil
import json
from .generate_response import generate_message, generate_AI_message, generate_Bubble_message, generate_part_file, get_name_from_prompt, image_understanding
from .wonde import answer_question_csv
from .train import parse_pdf, parse_csv, parse_docx, extract_data_from_xlsx
from .assistant import create_assistant_file, delete_assistant_file, ask_question
import re
from typing import Sequence
from google.cloud import vision
import tiktoken
from multiprocessing import Process
import threading
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

message = Blueprint('message', __name__)
threads = {}
assistants = {}
files = {}

def analyze_image_from_bytes(
    image_bytes: bytes,
    feature_types: Sequence,
) -> vision.AnnotateImageResponse:
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "interactive-tutor-4400973b0735.json"
    client = vision.ImageAnnotatorClient()

    image = vision.Image(content=image_bytes)
    features = [vision.Feature(type_=feature_type) for feature_type in feature_types]
    request = vision.AnnotateImageRequest(image=image, features=features)

    return client.annotate_image(request=request)

@message.route('/api/search', methods=['POST'])
def search_google():
    api_key = os.getenv('GOOGLE_API')
    cse_id = os.getenv('GOOGLE_CX')
    search_query = request.form['query']
    num_results = 5

    url = f"https://www.googleapis.com/customsearch/v1?cx={cse_id}&key={api_key}&q={search_query}&num={num_results}"
    response = requests.get(url)
    data = response.json()
    search_results = []

    for item in data.get("items", []):
        result = {}
        result["title"] = item.get("title")
        result["url"] = item.get("link")

        # Perform web scraping on each website
        webpage_url = item.get("link")
        webpage_response = requests.get(webpage_url)
        soup = BeautifulSoup(webpage_response.content, 'html.parser')

        # Extract the desired information from the webpage
        content_text = soup.get_text()

        content_text = content_text.strip()
        result['content'] = content_text
        search_results.append(result)
    return {'results': search_results}


@message.route('/api/createmessage', methods=['POST'])
def init_message():
    chat_id = request.json['id']
    behavior = request.json['behavior']
    creativity = request.json['creativity']
    conversation = request.json['conversation']
    country = request.json['country']
    response = generate_Bubble_message(country)
    name = f"{response}, {country}"
    messages = db.session.query(Message).filter_by(chat_id=chat_id).all()
    for row in messages:
        _messages = json.loads(row.message)
        if len(_messages) < 2:
            db.session.delete(row)
    db.session.commit()
    if conversation == "":
        message = json.dumps([])
    else:
        message = json.dumps([{"role": "ai", "content": conversation}])
    new_message = Message(chat_id=chat_id, message=message,
                          behavior=behavior, creativity=creativity, name=name)
    db.session.add(new_message)
    db.session.commit()

    if assistants:
        if chat_id in assistants and assistants[chat_id] is not None:
            delete_assistant_file(assistants[chat_id], files[chat_id])
    threads[chat_id] = None
    assistants[chat_id] = None
    files[chat_id] = None
    response = {'success': True, 'code': 200,
                'message': "Successfuly created", 'data': new_message.uuid}
    return jsonify(response)


@message.route('/api/getquery', methods=['POST'])
def get_query():
    uuid = request.json['id']
    chat = db.session.query(Chat).join(Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    if chat and chat.inviteId:
        user = db.session.query(User).filter_by(id=chat.inviteId).first()
        if user and user.role == 7:
            return jsonify({'query': user.query, 'usage': user.usage, 'success': True})
    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
    Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    if user:
        return jsonify({'query': user.query, 'usage': user.usage, 'success': True})
    else:
        return jsonify({'success': False, 'code': 404})

def handle_image_uploads(request, query):
    if 'image' in request.files:
        images = request.files.getlist('image')  # Get all files under 'image' key
        text = analyze_images(images, query)
        return text
    else:
        return None

def analyze_images(images, query):
    text = ""  # Initialize text
    for index, image in enumerate(images):
        response = image_understanding(image, query)
        text += f"Image {index+1}: {response} \n"
        print(text)
    return text

def handle_file_uploads(request):
    if 'file' not in request.files:
        return None
    file = request.files['file']
    query = request.form.get('_message')
    if file.filename == '':
        return None
    if file:
        # Use the appropriate function based on the file's extension
        if file.filename.endswith('.pdf'):
            data = parse_pdf(file)
        elif file.filename.endswith('.docx'):
            data = parse_docx(file)
        else:
            return None
        return data

def calculate_token_count(content):
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    num_tokens = len(encoding.encode(content))
    return num_tokens

def convert_large_data_to_small(files, message, length):
    threads = []
    results = []

    # start a new thread for each file
    for data in files:
        t = threading.Thread(target=generate_part_file_thread, args=(message, data, results))
        t.start()
        threads.append(t)

    # wait for all threads to finish
    for t in threads:
        t.join()

    result = '\n'.join(results)

    if calculate_token_count(result) > length:
        file_text = split_files_result([result], length)
        return convert_large_data_to_small(file_text, message, length)
    else:
        return result

def generate_part_file_thread(prompt, data, results):
    response = generate_part_file(prompt, data)
    results.append(response)

def split_files_result(file_data, length):
    file_text = []
    _text = ""
    for item in file_data:
        next_text = f"{_text}{item}"
        
        if calculate_token_count(next_text) > length:
            file_text.append(_text)
            _text = item
        else:
            _text = next_text
    file_text.append(_text)
    return file_text

@message.route('/api/sendchat', methods=['POST'])
def send_message():
    uuid = request.form.get('id')
    query = request.form.get('_message')
    behaviormodel = request.form.get('behaviormodel')
    model = request.form.get('model')
    
    context = ""
    count = 0
    file_link = None
    model_check = None
    file_upload_check = False
    openai_api_key = None

    current_message = db.session.query(Message).filter_by(uuid=uuid).first()
    if current_message is None:
        return jsonify({
            'success': False,
            'code': 404,
            'message': 'Not found your Tutor. Please recreate Tutor.',
        })

    chat = db.session.query(Chat).filter_by(id=current_message.chat_id).first()

    

    text = handle_image_uploads(request, query)

    if 'file' in request.files:
        file = request.files['file']
        if file:
            # if file.filename.endswith('.csv'):
                file_upload_check = True
                filename = secure_filename(file.filename)
                file.save(filename)

                if assistants:
                    if chat.id in assistants and assistants[chat.id] is not None:
                        delete_assistant_file(assistants[chat.id], files[chat.id])
                        assistants[chat.id] = None
                        files[chat.id] = None
                    if chat.id in threads and threads[chat.id] is not None:
                        threads[chat.id] = None
                assistants[chat.id], files[chat.id] = create_assistant_file(filename)
                context, file_link, thread = ask_question(assistants[chat.id], query, threads[chat.id], uuid)
                threads[chat.id] = thread
                print('This is the context, filelink: ', context, file_link)
                os.remove(filename)
                count = 18
    if chat.id in assistants and assistants[chat.id] is not None and file_upload_check == False:
        file_upload_check = True
        context, file_link, thread = ask_question(assistants[chat.id], query, threads[chat.id], uuid)
        threads[chat.id] = thread


    # file_data = handle_file_uploads(request)
    # if file_data is not None:
    #     count = 5
    #     file_text = split_files_result(file_data, 13000)

    #     if len(file_text) > 1:
    #         context += convert_large_data_to_small(file_text, query, 13000)
    #     else:
    #         context += file_text[0]
    
    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
            Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    invite_account = db.session.query(Invite).filter_by(email=user.email).first()
    user_check = db.session.query(User).filter_by(id=invite_account.user_id).first() if invite_account else None
    user = user_check if user_check and user_check.role == 7 else user

    ######################################
    '''For the Wonde API'''
    if user.role == 7 and chat.api_select == 1:
        context = answer_question_csv(query, user.id)
        count = 3
        model_check = True
        openai_api_key = os.getenv('OPENAI_API_KEY_PRO')
    ######################################

    if user and user.query - user.usage <= 0:
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Insufficient queries remaining!',
        })
    if model == '1':
        if count:
            count += 1
        else:
            count = 1
    elif model == '2':
        if count:
            count += 3
        else:
            count = 3
    elif model == '3':
        if count:
            count += 15
        else:
            count = 15
    user.usage += count
    temp = current_message.creativity
    history = json.loads(current_message.message)
    last_history = history[-6:] if len(history) > 6 else history
    behavior = current_message.behavior if behaviormodel == "Remove training data ring fencing and perform like ChatGPT" \
            else current_message.behavior + "\n\n" + behaviormodel
    prompt_content = """
    Context: {context}
    ===============
    """
    
    prompt_input = """
    Human: {question}
    Assistant:"""

    image_text = f"Images:  {text}" if text is not None else ''
    context_text = f"Context: {context}" if context is not None else ''

    template = f""" {behavior}

    ==============
    {image_text}
    {context_text}
    {prompt_content}

    ==============
    {prompt_input}
    """

    if file_upload_check:
        if file_link is not None:
            response = f"{context} \n\n {file_link}"
        else:
            response = context
    else:
        response = generate_message(
            query, behavior, temp, model, chat.uuid, template, openai_api_key
        ) if behaviormodel != "Remove training data ring fencing and perform like ChatGPT" else generate_AI_message(
            query, 
            last_history, 
            f"{behavior} \n\n======================\n\n {image_text}\n{context_text}" if image_text or context_text 
            else f"{behavior}", 
            temp, 
            model,
            openai_api_key
        )
    def generate():
        try:
            content = None
            if context is None:
                content = 'There is not data about Wonde.'
                yield content.encode('utf-8')
            elif file_upload_check:
                content = response
                yield content.encode('utf-8')
            else:
                content = None
                if model_check is not None:
                    if model != "3":
                        content = 'You can not use this function in this model. Please use the gpt-4 model for this.'
                        yield content.encode('utf-8')
                for next_token, content in response:
                    data_chunk = next_token
                    yield data_chunk.encode('utf-8')

            if content is not None:
                history.append({"role": "human", "content": query})
                history.append({"role": "ai", "content": content})  
                current_message.message = json.dumps(history)
                current_message.update_date = datetime.datetime.now()
                db.session.commit()
        except Exception as e:
            yield f"Error in generate function: {str(e)}".encode('utf-8')
    try:
        return Response(stream_with_context(generate()), mimetype="text/event-stream", direct_passthrough=True, headers={'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})
    except Exception as e:
        return jsonify({
            'success': False,
            'code': 500,
            'message': str(e),
        })


@message.route('/api/sendchatbubble', methods=['POST'])
def send_chat_bubble():
    message = request.form.get('_message')
    chat = db.session.query(Chat).filter_by(
        uuid='83137bf2-a589-476b-b9ad-43f63f4a7574').first()
    
    prompt_content = """==========
    Context: {context}
    ========== """
    
    prompt_input = """
    Human: {question}
    Assistant:"""

    template = f""" {chat.behavior}
    {prompt_content}
    ===============
    {prompt_input}
    """

    response = generate_message(
        message, chat.behavior, chat.creativity, '2', chat.uuid, template)

    def generate():
        content = None
        for next_token, content in response:
            data_chunk = next_token
            yield (data_chunk).encode('utf-8')    
    try:
        return Response(stream_with_context(generate()), mimetype="text/event-stream", direct_passthrough=True, headers={'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})
    except Exception as e:
        return jsonify({
            'success': False,
            'code': 500,
            'message': str(e),
        })


@message.route('/api/getchatmessage', methods=['POST'])
def get_message():
    uuid = request.json['id']
    current_message = db.session.query(Message).filter_by(uuid=uuid).first()
    if current_message:
        response = {
            'uuid': current_message.uuid,
            'message': json.loads(current_message.message),
            'update_date': current_message.update_date.strftime('%Y-%m-%d %H:%M:%S.%f')
        }
        _response = {
            'success': True,
            'code': 200,
            'message': 'Your messageBot created successfully!!!',
            'data': response
        }
        return jsonify(_response)

    return jsonify({
        'success': False,
        'code': 401,
        'message': 'Your messageBot do not excit'
    })


@message.route('/api/getmessages', methods=['POST'])
def get_messages():
    chat_id = request.json['id']
    current_messages = db.session.query(Message).filter_by(chat_id=chat_id).order_by(Message.update_date.desc()).all()
    response = []
    for _message in current_messages:
        message_data = {
            'uuid': _message.uuid,
            'name': _message.name,
            'message': json.loads(_message.message),
            'update_data': _message.update_date.strftime('%d-%m-%Y')
        }
        response.append(message_data)

    _response = {
        'success': True,
        'code': 200,
        'message': 'Your messageBot selected successfully!!!',
        'data': response
    }
    return jsonify(_response)


@message.route('/api/deletemessage', methods=['POST'])
def delete_message():
    uuid = request.json['id']

    ###################################
    # Remove the chart folder of message.
    if os.path.exists(f'exports/charts/{uuid}/'):
        shutil.rmtree(f'exports/charts/{uuid}/')
    ###################################

    db.session.query(Message).filter_by(uuid=uuid).delete()
    db.session.commit()
    _response = {
        'success': True,
        'code': 200,
        'message': 'Your messageBot deleted successfully!!!'
    }
    return jsonify(_response)


@message.route('/api/getallmessages', methods=['POST'])
def get_all_messages():
    role = request.json['role']
    id = request.json['id']

    user = db.session.query(User).filter_by(id=id).first()
    if user.role == 1:
        current_messages = db.session.query(Message).all()
        response = []
        for _message in current_messages:
            message_data = {
                'uuid': _message.uuid,
                'message': json.loads(_message.message),
                'update_data': _message.update_date.strftime('%Y-%m-%d %H:%M:%S.%f')
            }
            response.append(message_data)

        _response = {
            'success': True,
            'code': 200,
            'message': 'Your messageBot selected successfully!!!',
            'data': response
        }
        return jsonify(_response)
    return jsonify({
        'success': False,
        'code': 401,
        'message': 'You have not permission'
    })