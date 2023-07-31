from flask import Blueprint, jsonify, request, send_file
from .models import Chat, Message, Train, User, Organization
from . import db
from rich import print, pretty
import json
import pinecone
import openai
import os
import uuid
from dotenv import load_dotenv
from .auth import generate_pin_password
from werkzeug.utils import secure_filename

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


def is_valid_uuid(value):
    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False


@chat.route('/api/addchat', methods=['POST'])
def add_chat():
    user_id = request.json['user_id']
    label = request.json['label']
    description = request.json['chatdescription']
    model = request.json['chatmodel']
    conversation = request.json['Conversation']
    access = generate_pin_password()
    creativity = request.json['Creativity']
    behavior = request.json['behavior']
    behaviormodel = request.json['behaviormodel']
    train = json.dumps([])
    chat_logo = json.dumps({})
    chat_title = json.dumps({})
    chat_description = json.dumps({})
    chat_copyright = json.dumps(
        {'description': 'powered by interactive-tutor.com', 'status': 'false', 'color': '#ff0000'})
    chat_button = json.dumps({})
    bubble = json.dumps({})

    user = db.session.query(User).filter_by(id=user_id).first()
    ct = db.session.query(Chat).filter_by(user_id=user_id).count() + 1

    if user.role == 2 or user.role == 5:
        if ct > 1:
            return jsonify({
                'success': False,
                'code': 401,
                'message': "You can no longer create AI Tutors.",
            })
    elif user.role == 3:
        if ct > 3:
            return jsonify({
                'success': False,
                'code': 401,
                'message': "You can no longer create AI Tutors.",
            })
    elif user.role == 4:
        if ct > 10:
            return jsonify({
                'success': False,
                'code': 401,
                'message': "You can no longer create AI Tutors.",
            })
    if chat := db.session.query(Chat).filter_by(label=label).first():
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'A chart with the same name already exists. Please change the Name and description',
        })
    new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button)
    db.session.add(new_chat)
    db.session.commit()
    # Create index in the pinecone

    response = {
        'success': True,
        'code': 200,
        'message': 'Your ChatBot created successfully!!!'
    }
    return jsonify(response)


@chat.route('/api/imageupload', methods=['POST'])
def upload_image():
    try:
        file = request.files.get('file', None)
        if not file:
            return {"success": False, "message": "Invalid file"}, 400

        filename = str(uuid.uuid4()) + secure_filename(file.filename)
        filepath = os.path.join("project/image", filename)
        with open(filepath, 'wb') as f:
            while True:
                chunk = file.stream.read(1024)
                if not chunk:
                    break
                f.write(chunk)
        return jsonify({'success': True, 'data': f"/api/imageupload/{filename}", 'code': 200})
    except Exception as e:
        return {"success": False, "message": str(e)}, 400


@chat.route('/api/imageupload/<image_id>', methods=['GET'])
def view_image(image_id):
    image_folder = f'image/{image_id}'
    return send_file(image_folder, mimetype='image/jpeg')


@chat.route('/api/sendbrandingdata', methods=['POST'])
def update_brandingData():
    id = request.json['id']
    chat_logo = request.json['chat_logo']
    chat_title = request.json['chat_title']
    chat_description = request.json['chat_description']
    chat_copyright = request.json['chat_copyright']
    chat_button = request.json['chat_button']
    bubble = request.json['bubble']

    chat = db.session.query(Chat).filter_by(id=id).first()
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
        chat.chat_button = json.dumps(chat_button)
        chat.bubble = json.dumps(bubble)

        db.session.commit()
        response = {
            'success': True,
            'code': 200,
            'message': 'Your ChatBot was updated successfully,'
        }
    return jsonify(response)


@chat.route('/api/updatechat', methods=['POST'])
def update_chat():
    id = request.json['id']
    label = request.json['label']
    description = request.json['description']
    model = request.json['model']
    conversation = request.json['conversation']
    creativity = request.json['creativity']
    behavior = request.json['behavior']
    behaviormodel = request.json['behaviormodel']

    chat = db.session.query(Chat).filter_by(id=id).first()

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
    chats = db.session.query(Chat).filter_by(user_id=user_id).all()

    response = []
    if chats:
        for chat in chats:
            user = db.session.query(User).filter_by(id=chat.user_id).first()
            organization = db.session.query(Organization).filter_by(
                email=user.email).first().uuid
            chat_data = {
                'id': chat.id,
                'label': chat.label,
                'description': chat.description,
                'model': chat.model,
                'user_id': chat.user_id,
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
                'chat_button': json.loads(chat.chat_button),
                'bubble': json.loads(chat.bubble),
                'organization': organization,
                'role': user.role
            }
            response.append(chat_data)

    data = {
        'success': True,
        'code': 200,
        'data': response
    }

    return jsonify(data)


@chat.route('/api/getchatwithpin', methods=['POST'])
def get_chat_with_pin_organization():
    json_data = request.get_json()
    if not json_data:
        return jsonify({'success': False, 'code': 404, 'message': 'No data'})

    organization = json_data['organization']
    pin = json_data['pin']

    if not is_valid_uuid(organization):
        return jsonify({'success': False, 'code': 404, 'message': 'Your organization ID is incorrect.'})

    user = db.session.query(User).join(Organization, Organization.email == User.email).filter(
        Organization.uuid == organization).first()

    if not user:
        return jsonify({'success': False, 'code': 404, 'message': 'Organization does not exist.'})

    chat = db.session.query(Chat).join(User, User.id == Chat.user_id).join(
        Organization, Organization.email == User.email).filter(Organization.uuid == organization).first()
    if pin != str(chat.access):
        return jsonify({'success': False, 'code': 404, 'message': 'Your PIN or Organization ID is incorrect'})

    chat_data = {
        'id': chat.id,
        'label': chat.label,
        'description': chat.description,
        'model': chat.model,
        'conversation': chat.conversation,
        'user_id': chat.user_id,
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
        'chat_button': json.loads(chat.chat_button),
        'bubble': json.loads(chat.bubble),
        'role': user.role
    }

    data = {
        'success': True,
        'code': 200,
        'data': chat_data
    }

    return jsonify(data)


@chat.route('/api/getchat', methods=['POST'])
def get_chat():
    json_data = request.get_json()
    if json_data:
        uuid = request.json['id']
        chat = db.session.query(Chat).filter_by(uuid=uuid).first()
        if chat is None:
            return jsonify({
                'success': False,
                'code': 404,
                'message': 'The Data not excited'
            })
        user = db.session.query(User).filter_by(id=chat.user_id).first()
        organization = db.session.query(Organization).filter_by(
            email=user.email).first().uuid
        chat_data = {
            'id': chat.id,
            'label': chat.label,
            'description': chat.description,
            'model': chat.model,
            'conversation': chat.conversation,
            'user_id': chat.user_id,
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
            'chat_button': json.loads(chat.chat_button),
            'bubble': json.loads(chat.bubble),
            'organization': organization,
            'role': user.role
        }

        data = {
            'success': True,
            'code': 200,
            'data': chat_data
        }

        return jsonify(data)
    else:
        return jsonify({"'success": False, "code": 404, "message": "No data"})


@chat.route('/api/getbubble/<string:widgetID>', methods=['GET'])
def get_bubble(widgetID):
    chat = db.session.query(Chat).filter_by(uuid=widgetID).first()
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
        'chat_button': json.loads(chat.chat_button),
        'bubble': json.loads(chat.bubble),
        'embed_url': 'https://app.interactive-tutor.com/chat/embedding/',
    }

    data = {
        'success': True,
        'code': 200,
        'data': chat_data
    }

    return jsonify(data)


@chat.route('/api/deletechat/<int:id>', methods=['DELETE'])
def delete_chat(id):
    if chat := db.session.query(Chat).filter_by(id=id).first():
        db.session.query(Message).filter_by(chat_id=id).delete()
        train_ids = json.loads(chat.train)
        # delete index in the pinecone

        for id in train_ids:
            source = db.session.query(Train).filter_by(id=id).first().label
            delete_vectore(source)
            db.session.query(Train).filter_by(id=id).delete()
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


@chat.route('/api/getreportdata', methods=['POST'])
def get_report_data():
    id = request.json['id']
    chats = db.session.query(Chat).filter_by(user_id=id).all()
    messages = []
    labels = []
    for chat in chats:
        data = []
        labels.append(chat.label)
        message = db.session.query(Message).filter_by(chat_id=chat.id).all()
        for msg in message:
            data.append(msg.create_date.strftime("%Y-%m-%d").split('-')[2])
        messages.append(data)
    messages.append(labels)
    return jsonify({'success': True, 'data': messages})


@chat.route('/api/getaccess_ai_tutor', methods=['POST'])
def get_access_AI_tutor():
    email = request.json['email']
    organization_id = db.session.query(
        Organization).filter_by(email=email).first().uuid
    return jsonify({'success': True, 'data': organization_id, 'code': 200})
