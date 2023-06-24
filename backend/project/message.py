from flask import Blueprint, jsonify, request
from .models import Message
from . import db
from rich import print, pretty
import datetime
import time
import json
from .generate_response import generate_message
pretty.install()

message = Blueprint('message', __name__)


@message.route('/api/createmessage', methods=['POST'])
def init_message():
    print(request.json)
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
                'message': "Successfuly created", 'data': new_message.id}
    return jsonify(response)


@message.route('/api/sendchat', methods=['POST'])
def send_message():
    id = request.json['id']
    query = request.json['_message']
    current_message = Message.query.filter_by(id=id).first()
    temp = current_message.creativity
    history = json.loads(current_message.message)
    behavior = current_message.behavior
    start_time = time.time()
    response, chat_history, token = generate_message(
        query, history, behavior, temp)
    end_time = time.time()
    wall_time = end_time - start_time
    print("This is the response data->", chat_history, token, wall_time)

    current_message.message = json.dumps(chat_history)
    current_message.update_date = datetime.datetime.now()

    db.session.commit()
    _response = {
        'success': True,
        'code': 200,
        'message': 'Your messageBot created successfully!!!',
        'data': response
    }
    return jsonify(_response)


@message.route('/api/getchatmessage', methods=['POST'])
def get_message():
    id = request.json['id']
    print("HIHIHI---------------------------", request.json)
    current_message = Message.query.filter_by(id=id).first()
    response = {
        'id': current_message.id,
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
