from flask import Blueprint, jsonify, request
from .models import Message, Train, User, Chat, Invite
from bs4 import BeautifulSoup
import requests
from . import db
import datetime
from rich import print, pretty
import time
import os
import json
from .generate_response import generate_message, generate_AI_message, generate_Bubble_message
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import pos_tag

pretty.install()
message = Blueprint('message', __name__)


def correct_grammar(text):
    # Tokenize the text into sentences
    sentences = nltk.sent_tokenize(text)

    # Correct each sentence separately
    corrected_sentences = []
    for sentence in sentences:
        # Tokenize the sentence into words and tag their parts of speech
        words = nltk.word_tokenize(sentence)
        tagged_words = nltk.pos_tag(words)

        # Perform grammar correction based on POS tags
        corrected_words = []
        for word, tag in tagged_words:
            # Perform grammar correction as needed
            # Example correction: singularize nouns, use proper verb forms, etc.
            corrected_word = word  # Placeholder for correction logic
            corrected_words.append(corrected_word)

        # Reconstruct the corrected sentence
        corrected_sentence = " ".join(corrected_words)
        corrected_sentences.append(corrected_sentence)

    # Reconstruct the entire corrected text
    corrected_text = " ".join(corrected_sentences)
    return corrected_text


@message.route('/api/search', methods=['POST'])
def search_google():
    nltk.download('stopwords')
    nltk.download('punkt')
    nltk.download('averaged_perceptron_tagger')
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
        content_text = correct_grammar(content_text)

        content_text = content_text.strip()
        result['content'] = content_text
        # sentences = sent_tokenize(content_text.lower())
        # word_freq = nltk.FreqDist(word_tokenize(content_text))
        # stop_words = set(stopwords.words('english'))

        # ranking = {}
        # for i, sentence in enumerate(sentences):
        #     sentence_tokens = word_tokenize(sentence)
        #     sentence_score = sum(
        #         word_freq[token] for token in sentence_tokens if token not in stop_words)
        #     ranking[i] = sentence_score

        # top_sentences = sorted(ranking, key=ranking.get, reverse=True)[:10]

        # summary = ''
        # for i in top_sentences:
        #     summary += ' '.join(sentence[i])
        # result['summary'] = summary
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
    # messages = db.session.query(Message).all()
    # for row in messages:
    #     _messages = json.loads(row.message)
    #     if len(_messages) < 2:
    #         db.session.delete(row)
    # db.session.commit()
    if conversation == "":
        message = json.dumps([])
    else:
        message = json.dumps([{"role": "ai", "content": conversation}])
    new_message = Message(chat_id=chat_id, message=message,
                          behavior=behavior, creativity=creativity, name=name)
    db.session.add(new_message)
    db.session.commit()
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
            return jsonify({'query': user.query, 'usage': user.usage})
    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
    Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    return jsonify({'query': user.query, 'usage': user.usage})


@message.route('/api/sendchat', methods=['POST'])
def send_message():
    uuid = request.json['id']
    query = request.json['_message']
    behaviormodel = request.json['behaviormodel']
    model = request.json['model']

    current_message = db.session.query(Message).filter_by(uuid=uuid).first()
    if current_message is None:
        return jsonify({
            'success': False,
            'code': 404,
            'message': 'Not found your Tutor. Please recreate Tutor.',
        })

    chat = db.session.query(Chat).filter_by(id=current_message.chat_id).first()
    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
            Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()

    invite_account = db.session.query(Invite).filter_by(email=user.email).first()
    user_check = db.session.query(User).filter_by(id=invite_account.user_id).first() if invite_account else None
    user = user_check if user_check and user_check.role == 7 else user

    if user and user.query - user.usage == 0:
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Insufficient queries remaining!',
        })

    user.usage += 1

    temp = current_message.creativity
    history = json.loads(current_message.message)
    last_history = history[-6:] if len(history) > 6 else history
    behavior = current_message.behavior if behaviormodel == "Behave like the default ChatGPT" \
        else current_message.behavior + "\n\n" + behaviormodel
    response = generate_message(
        query, last_history, behavior, temp, model, chat.uuid) if behaviormodel != "Behave like the default ChatGPT" \
        else generate_AI_message(query, last_history, behavior, temp, model)

    history.append({"role": "human", "content": query})
    history.append({"role": "ai", "content": response})
    current_message.message = json.dumps(history)
    current_message.update_date = datetime.datetime.now()
    db.session.commit()

    _response = {
        'success': True,
        'code': 200,
        'query': user.query - user.usage,
        'message': 'Your messageBot created generated!!!',
        'data': response
    }

    return jsonify(_response)

@message.route('/api/sendchatbubble', methods=['POST'])
def send_chat_bubble():
    message = request.json['_message']
    chat = db.session.query(Chat).filter_by(
        uuid='83137bf2-a589-476b-b9ad-43f63f4a7574').first()
    chat.train = eval(chat.train)
    response = generate_message(
        message, [], chat.behavior, chat.creativity, '2', chat.uuid)
    data = {
        'success': True,
        'code': 200,
        'data': response
    }
    return jsonify(data)


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
    current_messages = db.session.query(
        Message).filter_by(chat_id=chat_id).all()
    response = []
    for _message in current_messages:
        message_data = {
            'uuid': _message.uuid,
            'name': _message.name,
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
