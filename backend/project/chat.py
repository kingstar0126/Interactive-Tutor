from flask import Blueprint, jsonify, request
from .models import Chat
from . import db

chat = Blueprint('chat', __name__)


@chat.route('/api/addchat', methods=['POST'])
def add_chat():
    print(request.json)
    label = request.json['label']
    description = request.json['chatdescription']
    model = request.json['chatmodel']
    conversation = request.json['Conversation']
    access = request.json['access']
    creativity = request.json['Creativity']
    behavior = request.json['behavior']
    behaviormodel = request.json['behaviormodel']

    chat = Chat.query.filter_by(label=label, description=description).first()

    if chat:
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'A chart with the same name already exists. Please change the Name and description',
        })
    new_chat = Chat(label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel)
    db.session.add(new_chat)
    db.session.commit()
    response = {
        'success': True,
        'code': 200,
        'message': 'Your ChatBot created successfully!!!'
    }
    return jsonify(response)


@chat.route('/api/updatechat', methods=['POST'])
def update_chat():
    id = request.json['id']
    label = request.json['label']
    description = request.json['description']
    model = request.json['model']
    conversation = request.json['conversation']
    access = request.json['access']
    creativity = request.json['creativity']
    behavior = request.json['behavior']
    behaviormodel = request.json['behaviormodel']

    chat = Chat.query.filter_by(id=id).first()

    if chat is None:
        # If no such chat exists, return an error response
        response = {
            'success': False,
            'code': 404,
            'message': 'ChatBot not found'
        }
    else:
        # Update the chat's properties with the new values
        chat.label = label
        chat.description = description
        chat.model = model
        chat.conversation = conversation
        chat.access = access
        chat.creativity = creativity
        chat.behavior = behavior
        chat.behaviormodel = behaviormodel

        # Save the updated chat to the database
        db.session.commit()

        # Return a success response
        response = {
            'success': True,
            'code': 200,
            'message': 'Your ChatBot was updated successfully'
        }

    return jsonify(response)


@chat.route('/api/getchats', methods=['GET'])
def get_chats():
    chats = Chat.query.all()

    response = []
    for chat in chats:
        print(chat.id)
        chat_data = {
            'id': chat.id,
            'label': chat.label,
            'description': chat.description,
            'model': chat.model,
            'conversation': chat.conversation,
            'access': chat.access,
            'creativity': chat.creativity,
            'behavior': chat.behavior,
            'behaviormodel': chat.behaviormodel
        }
        response.append(chat_data)

    data = {
        'success': True,
        'code': 200,
        'data': response
    }

    return jsonify(data)


@chat.route('/api/deletechat/<int:id>', methods=['DELETE'])
def delete_chat(id):
    if chat := Chat.query.filter_by(id=id).first():
        db.session.delete(chat)
        db.session.commit()

        response = {
            'success': True,
            'message': 'Chat has been deleted from the database.'
        }
    else:
        response = {
            'success': False,
            'message': 'Chat with label not found in the database.'
        }

    return jsonify(response)
