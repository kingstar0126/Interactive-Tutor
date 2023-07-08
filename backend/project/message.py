from flask import Blueprint, jsonify, request
from .models import Message, Train, User, Chat
from . import db
from rich import print, pretty
import datetime
import time
import json
from .generate_response import generate_message, generate_AI_message, generate_Bubble_message
pretty.install()

message = Blueprint('message', __name__)


@message.route('/api/createmessage', methods=['POST'])
def init_message():
    chat_id = request.json['id']
    behavior = request.json['behavior']
    creativity = request.json['creativity']
    conversation = request.json['conversation']
    if conversation == "":
        message = json.dumps([])
    else:
        message = json.dumps([{"role": "ai", "content": conversation}])
    new_message = Message(chat_id=chat_id, message=message,
                          behavior=behavior, creativity=creativity)
    db.session.add(new_message)
    db.session.commit()
    response = {'success': True, 'code': 200,
                'message': "Successfuly created", 'data': new_message.uuid}
    return jsonify(response)


@message.route('/api/getquery', methods=['POST'])
def get_query():
    uuid = request.json['id']
    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
        Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    return user.query


@message.route('/api/sendchat', methods=['POST'])
def send_message():
    uuid = request.json['id']
    query = request.json['_message']
    behaviormodel = request.json['behaviormodel']
    train = request.json['train']
    model = request.json['model']
    trains = []
    for source_id in train:
        source = db.session.query(Train).filter_by(id=source_id).first()
        trains.append(source.label)
    current_message = db.session.query(Message).filter_by(uuid=uuid).first()

    user = db.session.query(User).join(Chat, User.id == Chat.user_id).join(
        Message, Chat.id == Message.chat_id).filter(Message.uuid == uuid).first()
    if user.query != 0:
        user.query -= 1
    else:
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Insufficient queries remaining!',
        })

    temp = current_message.creativity
    history = json.loads(current_message.message)
    behavior = ""
    if behaviormodel == "Behave like the default ChatGPT":
        behavior = current_message.behavior
        response, chat_history, token = generate_AI_message(
            query, history, behavior, temp, model)
    else:
        behavior = current_message.behavior + "\n" + behaviormodel
        response, chat_history, token = generate_message(
            query, history, behavior, temp, model, trains)
    current_message.message = json.dumps(chat_history)
    current_message.update_date = datetime.datetime.now()

    db.session.commit()
    _response = {
        'success': True,
        'code': 200,
        'query': user.query,
        'message': 'Your messageBot created successfully!!!',
        'data': response
    }
    return jsonify(_response)


@message.route('/api/sendchatbubble', methods=['POST'])
def send_chat_bubble():
    message = request.json['_message']
    data = {
        'success': True,
        'code': 200,
        'data': generate_Bubble_message(message)
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
