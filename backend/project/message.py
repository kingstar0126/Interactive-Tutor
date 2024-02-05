from flask import Blueprint, jsonify, request
from flask import Response, stream_with_context
from .models import Message, Train, User, Chat, Invite
from bs4 import BeautifulSoup
from sqlalchemy import and_
import requests
from io import BytesIO
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
from .assistant import create_assistant_file, delete_assistant_file, ask_question, create_image_file, create_pollinations_prompt
import re
from typing import Sequence
from google.cloud import vision
import tiktoken
import threading
from werkzeug.utils import secure_filename
import boto3

message = Blueprint('message', __name__)
threads = {}
assistants = {}
files = {}

S3_CLIENT = boto3.client(
    's3',
    aws_access_key_id=os.getenv('ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('ACCESS_SECRET_KEY'),
    region_name=os.getenv('REGION')
)
S3_PRIVATE_BUCKET = os.getenv('S3_PRIVATE')

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
    try:
        chat_id = request.json['id']
        behavior = request.json['behavior']
        creativity = request.json['creativity']
        conversation = request.json['conversation']
        # country = request.json['country']
        response = generate_Bubble_message('any country')
        name = f"{response}"

        current_date = datetime.datetime.now()
        messages = db.session.query(Message).filter(
            and_(
                Message.chat_id == chat_id, 
                Message.update_date < current_date
            )
        ).all()
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
    except Exception as e:
        print(f"init_message error: {e}")
        return jsonify({'success': False, 'message': str(e)})


@message.route('/api/getquery', methods=['POST'])
def get_query():
    data = request.get_json()
    uuid = data.get('id')
    user_id = data.get('user_id')
    if user_id:
        user = db.session.query(User).filter_by(id=user_id).first()
    else:
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
    if 'image' in request.form:
        images = request.form.getlist('image')  # Get all files under 'image' key
        files = []
        for image in images:
            file_obj = S3_CLIENT.get_object(Bucket=S3_PRIVATE_BUCKET, Key=image)
            file_content = file_obj['Body'].read()
            file = BytesIO(file_content)
            files.append(file)
        text = image_understanding(files, query)
        return text
    else:
        return None

@message.route('/api/sendchat', methods=['POST'])
def send_message():
    uuid = request.form.get('id')
    query = request.form.get('_message')
    behaviormodel = request.form.get('behaviormodel')
    model = request.form.get('model')
    user_id = request.form.get('user_id')
    context = ""
    count = 0
    file_link = None
    model_check = None
    file_upload_check = False
    openai_api_key = None
    current_message = db.session.query(Message).filter_by(uuid=uuid).first()
    if current_message is None:
        return jsonify({
            'Message': 'Not found your Tutor. Please recreate Tutor.',
        })

    chat = db.session.query(Chat).filter_by(id=current_message.chat_id).first()
    
    if model != "4" or model != "5":
        file = request.form.get('file')
        if file:
            file_upload_check = True
        # if assistants:
            if chat.id in assistants and assistants[chat.id] is not None:
                delete_assistant_file(assistants[chat.id], files[chat.id])
                assistants[chat.id] = None
                files[chat.id] = None
            if chat.id in threads and threads[chat.id] is not None:
                threads[chat.id] = None
            assistants[chat.id], files[chat.id] = create_assistant_file(file)
            if assistants[chat.id] is None:
                return jsonify({
                    'Message': '''Interactive Tutor can only read certain file types, please ensure your files are in one of the following formats: 'c', 'cpp', 'css', 'csv', 'docx', 'gif', 'html', 'java', 'jpeg', 'jpg', 'js', 'json', 'md', 'pdf', 'php', 'png', 'pptx', 'py', 'rb', 'tar', 'tex', 'ts', 'txt', 'xlsx', 'xml', 'zip'.''',
                })

            assistant_id=assistants.get(chat.id, None)
            thread_id_from_assistant=threads.get(chat.id, None)
            context, file_link, thread = ask_question(assistant_id, query, thread_id_from_assistant, uuid)
            threads[chat.id] = thread
            count = 18
        if chat.id in assistants and assistants[chat.id] is not None and file_upload_check == False:
            file_upload_check = True
            context, file_link, thread = ask_question(assistants[chat.id], query, threads[chat.id], uuid)
            threads[chat.id] = thread
        text = handle_image_uploads(request, query)
    if user_id:
        user = db.session.query(User).filter_by(id=user_id).first()
    else:
        user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
                Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
        invite_account = db.session.query(Invite).filter_by(email=user.email).first()
        user_check = db.session.query(User).filter_by(id=invite_account.user_id).first() if invite_account else None
        user = user_check if user_check and user_check.role == 7 else user
    ######################################
    '''For the Wonde API'''
    if user.role == 7 and chat.api_select == 1:
        if behaviormodel != "Remove training data ring fencing and perform like ChatGPT":
            behaviormodel = "Remove training data ring fencing and perform like ChatGPT"
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
        count = 1
    elif model == '2':
        count = 3
    elif model == '3':
        count = 15
    elif model == '4':
        count = 20
    elif model == '5':
        count = 10
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

    # image_text = f"Images:  {text}" if text is not None else ''
    context_text = f"Context: {context}" if context is not None else ''

    template = f""" {behavior}

    ==============
    {context_text}
    {prompt_content}

    ==============
    {prompt_input}
    """

    if model == "4":
        if 'image' in request.form:
            images = request.form.getlist('image')
            file_obj = S3_CLIENT.get_object(Bucket=S3_PRIVATE_BUCKET, Key=images[0])
            file_content = file_obj['Body'].read()
            image_data = BytesIO(file_content)
            response = create_image_file(query, current_message.behavior, uuid, image_data)
        else:
            response = create_image_file(query, current_message.behavior, uuid)
    elif model == "5":
        response = create_pollinations_prompt(query)
    elif text is not None:
        response = text
    elif file_upload_check:
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
            f"{behavior} \n\n======================\n\n {context_text}" if context_text 
            else f"{behavior}", 
            temp, 
            model,
            openai_api_key
        )
    def generate():
        try:
            content = None
            if model == "4":
                content = response
                yield content.encode('utf-8')
            elif model == "5":
                content == response
                yield content.encode('utf-8')
            elif text is not None:
                content = None
                for next_token, content in response:
                    data_chunk = next_token
                    yield data_chunk.encode('utf-8')
            elif context is None:
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
                print(f"current_message successfull: {str(current_message.query)}, {str(current_message.uuid)}")
        except Exception as e:
            ## need to check issue generate function error: UPDATE statement on table 'message' expected to update 
            print(f"generate function error current_message uuid: {str(current_message.uuid)}")
            yield f"Error in generate function: {str(e)}".encode('utf-8')
    try:
        return Response(stream_with_context(generate()), mimetype="text/event-stream", direct_passthrough=True, headers={'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})
    except Exception as e:
        print(f"generate function stream_with_context error: {e}")
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
        print(f"send_chat_bubble function stream_with_context error: {e}")
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
    try:
        chat_id = request.json['id']
        current_messages = db.session.query(Message).filter_by(chat_id=chat_id).order_by(Message.update_date.desc()).all()
        response = []
        for _message in current_messages:
            if len(json.loads(_message.message)) > 1:
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
    except Exception as e:
        print(f"get_messages error: {e}")
        return jsonify({'success': False, 'message': str(e)})


@message.route('/api/deletemessage', methods=['POST'])
def delete_message():
    uuid = request.json['id']
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