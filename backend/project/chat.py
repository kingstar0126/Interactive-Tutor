from flask import Blueprint, jsonify, request
from .models import Chat, Message, Train
from . import db
from rich import print, pretty
import json
import pinecone
import openai
import os
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
openai.openai_api_key = OPENAI_API_KEY

pretty.install()

chat = Blueprint('chat', __name__)


def delete_vectore(source):
    index = pinecone.Index(PINECONE_INDEX_NAME)
    return index.delete(
        filter={
            "source": f"{source}",
        }
    )

# def create_index(uuid):
#     name = f"{uuid}"
#     pinecone.create_index(name, dimension=1536)


# def delete_index(uuid):
#     name = f"{uuid}"
#     pinecone.delete_index(name)

@chat.route('/api/addchat', methods=['POST'])
def add_chat():
    user_id = request.json['user_id']
    label = request.json['label']
    description = request.json['chatdescription']
    model = request.json['chatmodel']
    conversation = request.json['Conversation']
    access = request.json['access']
    creativity = request.json['Creativity']
    behavior = request.json['behavior']
    behaviormodel = request.json['behaviormodel']
    train = json.dumps([])
    chat_logo = json.dumps({})
    chat_title = json.dumps({})
    chat_description = json.dumps({})
    chat_copyright = json.dumps({})
    chat_1_logo = json.dumps({})
    chat_1_description = json.dumps({})
    chat_2_logo = json.dumps({})
    chat_2_description = json.dumps({})
    chat_3_logo = json.dumps({})
    chat_3_description = json.dumps({})
    chat_button = json.dumps({})
    bubble = json.dumps({})

    if chat := Chat.query.filter_by(label=label).first():
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'A chart with the same name already exists. Please change the Name and description',
        })
    new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, chat_1_description=chat_1_description, chat_2_description=chat_2_description, chat_3_description=chat_3_description, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_1_logo=chat_1_logo, chat_2_logo=chat_2_logo, chat_3_logo=chat_3_logo, chat_button=chat_button)
    db.session.add(new_chat)
    db.session.commit()
    # Create index in the pinecone

    response = {
        'success': True,
        'code': 200,
        'message': 'Your ChatBot created successfully!!!'
    }
    return jsonify(response)


@chat.route('/api/sendbrandingdata', methods=['POST'])
def update_brandingData():
    print(request.json)
    id = request.json['id']
    chat_logo = request.json['chat_logo']
    chat_title = request.json['chat_title']
    chat_description = request.json['chat_description']
    chat_copyright = request.json['chat_copyright']
    # chat_1_logo = request.json['chat_1_logo']
    # chat_1_description = request.json['chat_1_description']
    # chat_2_logo = request.json['chat_2_logo']
    # chat_2_description = request.json['chat_2_description']
    # chat_3_logo = request.json['chat_3_logo']
    # chat_3_description = request.json['chat_3_description']
    chat_button = request.json['chat_button']
    bubble = request.json['bubble']

    chat = Chat.query.filter_by(id=id).first()
    if chat is None:
        # If no such chat exists, return an error response
        response = {
            'success': False,
            'code': 404,
            'message': 'ChatBot not found'
        }
    else:
        chat.chat_logo = json.dumps(chat_logo)
        chat.chat_title = json.dumps(chat_title)
        chat.chat_description = json.dumps(chat_description)
        chat.chat_copyright = json.dumps(chat_copyright)
        # chat.chat_1_logo = chat_1_logo
        # chat.chat_1_description = chat_1_description
        # chat.chat_2_logo = chat_2_logo
        # chat.chat_2_description = chat_2_description
        # chat.chat_3_logo = chat_3_logo
        # chat.chat_3_description = chat_3_description
        chat.chat_button = json.dumps(chat_button)
        chat.bubble = json.dumps(bubble)

        db.session.commit()
        response = {
            'success': True,
            'code': 200,
            'message': 'Your ChatBot was updated successfully'
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


@chat.route('/api/getchats', methods=['POST'])
def get_chats():
    
    user_id = request.json['user_id']
    chats = Chat.query.filter_by(user_id=user_id).all()

    response = []
    if chats:
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
                'behaviormodel': chat.behaviormodel,
                'uuid': chat.uuid,
                'train': json.loads(chat.train),
                'chat_logo': json.loads(chat.chat_logo),
                'chat_title': json.loads(chat.chat_title),
                'chat_description': json.loads(chat.chat_description),
                'chat_copyright': json.loads(chat.chat_copyright),
                # 'chat_1_logo': json.loads(chat.chat_1_logo),
                # 'chat_1_description': json.loads(chat.chat_1_description),
                # 'chat_2_logo': json.loads(chat.chat_2_logo),
                # 'chat_2_description': json.loads(chat.chat_2_description),
                # 'chat_3_logo': json.loads(chat.chat_3_logo),
                # 'chat_3_description': json.loads(chat.chat_3_description),
                'chat_button': json.loads(chat.chat_button),
                'bubble': json.loads(chat.bubble),
            }
            response.append(chat_data)

    data = {
        'success': True,
        'code': 200,
        'data': response
    }

    return jsonify(data)


@chat.route('/api/getchat', methods=['POST'])
def get_chat():
    print(request.json)
    uuid = request.json['id']
    chat = Chat.query.filter_by(uuid=uuid).first()
    if chat is None:
        return jsonify({
            'success': False,
            'code': 404,
            'message': 'The Data not excited'
        })
    chat_data = {
        'id': chat.id,
        'label': chat.label,
        'description': chat.description,
        'model': chat.model,
        'conversation': chat.conversation,
        'access': chat.access,
        'creativity': chat.creativity,
        'behavior': chat.behavior,
        'behaviormodel': chat.behaviormodel,
        'uuid': chat.uuid,
        'train': json.loads(chat.train),
        'chat_logo': json.loads(chat.chat_logo),
        'chat_title': json.loads(chat.chat_title),
        'chat_description': json.loads(chat.chat_description),
        'chat_copyright': json.loads(chat.chat_copyright),
        # 'chat_1_logo': json.loads(chat.chat_1_logo),
        # 'chat_1_description': json.loads(chat.chat_1_description),
        # 'chat_2_logo': json.loads(chat.chat_2_logo),
        # 'chat_2_description': json.loads(chat.chat_2_description),
        # 'chat_3_logo': json.loads(chat.chat_3_logo),
        # 'chat_3_description': json.loads(chat.chat_3_description),
        'chat_button': json.loads(chat.chat_button),
        'bubble': json.loads(chat.bubble),
    }

    data = {
        'success': True,
        'code': 200,
        'data': chat_data
    }

    return jsonify(data)


@chat.route('/api/getbubble/<string:widgetID>', methods=['GET'])
def get_bubble(widgetID):
    print("--------------")
    print(widgetID)
    chat = Chat.query.filter_by(uuid=widgetID).first()
    if chat is None:
        return jsonify({
            'success': False,
            'code': 404,
            'data': 'chat_data'
        })
    chat_data = {
        'id': chat.id,
        'label': chat.label,
        'description': chat.description,
        'model': chat.model,
        'conversation': chat.conversation,
        'access': chat.access,
        'creativity': chat.creativity,
        'behavior': chat.behavior,
        'behaviormodel': chat.behaviormodel,
        'uuid': chat.uuid,
        'train': json.loads(chat.train),
        'chat_logo': json.loads(chat.chat_logo),
        'chat_title': json.loads(chat.chat_title),
        'chat_description': json.loads(chat.chat_description),
        'chat_copyright': json.loads(chat.chat_copyright),
        # 'chat_1_logo': json.loads(chat.chat_1_logo),
        # 'chat_1_description': json.loads(chat.chat_1_description),
        # 'chat_2_logo': json.loads(chat.chat_2_logo),
        # 'chat_2_description': json.loads(chat.chat_2_description),
        # 'chat_3_logo': json.loads(chat.chat_3_logo),
        # 'chat_3_description': json.loads(chat.chat_3_description),
        'chat_button': json.loads(chat.chat_button),
        'bubble': json.loads(chat.bubble),
        'embed_url': 'http://3.11.9.37/chat/embedding/',
    }

    data = {
        'success': True,
        'code': 200,
        'data': chat_data
    }

    return jsonify(data)


@chat.route('/api/deletechat/<int:id>', methods=['DELETE'])
def delete_chat(id):
    if chat := Chat.query.filter_by(id=id).first():
        Message.query.filter_by(chat_id=id).delete()
        train_ids = json.loads(chat.train)
        # delete index in the pinecone

        for id in train_ids:
            source = Train.query.filter_by(id=id).first().label
            delete_vectore(source)
            Train.query.filter_by(id=id).delete()
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
