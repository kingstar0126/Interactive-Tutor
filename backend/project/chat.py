from flask import Blueprint, jsonify, request, send_file
from .models import Chat, Message, Train, User, Organization
from . import db
from collections import Counter
import json
import pinecone
import openai
import os
import uuid
from dotenv import load_dotenv
from .auth import generate_pin_password
from werkzeug.utils import secure_filename
from .generate_response import generate_system_prompt_role
import datetime

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
openai.openai_api_key = OPENAI_API_KEY


chat = Blueprint('chat', __name__)


def delete_vectore(source, chat):
    index = pinecone.Index(PINECONE_INDEX_NAME)
    return index.delete(
        filter={
            "source": f"{source}",
            "chat": f"{chat}"
        }
    )


def is_valid_uuid(value):
    try:
        uuid.UUID(value)
        return True
    except ValueError:
        return False


def generate_final_report_data(source_data):
    current_date = datetime.datetime.now().date()

    # Count the occurrences of each date in the source data
    date_counts = Counter(source_data)

    # Generate the final data based on the current day
    final_data = []
    cumulative_sum = 0

    for i in range(1, current_date.day + 1):
        date_str = current_date.replace(day=i).strftime('%Y-%m-%d')
        cumulative_sum += date_counts[date_str]
        final_data.append(cumulative_sum)

    return final_data


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
    chat_logo = json.dumps({"user": "https://app.interactive-tutor.com/api/imageupload/default_user.png", "ai": "https://app.interactive-tutor.com/api/imageupload/default_ai.png"})
    chat_title = json.dumps({})
    chat_description = json.dumps({})
    chat_copyright = json.dumps(
        {'description': 'powered by interactive-tutor.com', 'status': 'false', 'color': '#ff0000'})
    chat_button = json.dumps({})
    bubble = json.dumps({"position": {"value": 0, "label": "Right"}})

    user = db.session.query(User).filter_by(id=user_id).first()
    ct = db.session.query(Chat).filter_by(user_id=user_id).count() + 1

    if not user.role == 1:
        if ct > user.tutors:
            return jsonify({
                'success': False,
                'code': 401,
                'message': "You can no longer create AI Tutors.",
            })
    new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button)
    db.session.add(new_chat)
    db.session.commit()

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

        chats = db.session.query(Chat).filter_by(inviteId=chat.user_id).all()
        for item in chats:
            if item.label == chat.label and item.description == chat.description and item.model == chat.model and item.conversation == chat.conversation and item.creativity == chat.creativity and item.behavior == chat.behavior:
                item.label = label
                item.description = description
                item.model = model
                item.conversation = conversation
                item.creativity = creativity
                item.behavior = behavior
                item.behaviormodel = behaviormodel
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
            messages = db.session.query(Message).filter_by(chat_id=chat.id).all()
            for row in messages:
                _messages = json.loads(row.message)
                if len(_messages) < 2:
                    db.session.delete(row)
            db.session.commit()
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
                'role': user.role,
                'inviteId': chat.inviteId
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
        Organization, Organization.email == User.email).filter(Organization.uuid == organization).filter(Chat.access == pin).first()

    if not chat:
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
            'role': user.role,
            'inviteId': chat.inviteId
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
            source = db.session.query(Train).filter_by(id=id).first()
            delete_vectore(source.label, chat.uuid)
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

    user = db.session.query(User).filter_by(id=id).first()
    chats = db.session.query(Chat).filter_by(user_id=id).all()

    current_month = datetime.datetime.now().month
    messages = []
    labels = []
    for chat in chats:
        data = []
        labels.append(chat.label)
        message = db.session.query(Message).filter_by(
            chat_id=chat.id).order_by(Message.create_date).all()
        if user.role == 7:
            invite_chat = db.session.query(Chat).filter_by(inviteId=id, label=chat.label).first()
            if invite_chat:
                invite_message = db.session.query(Message).filter_by( chat_id=invite_chat.id ).order_by(Message.create_date).all()
                message.extend(invite_message)
        for msg in message:
            if msg.create_date.month == current_month:
                data.append(msg.create_date.strftime("%Y-%m-%d"))
        messages.append(generate_final_report_data(data))
    messages.append(labels)
    return jsonify({'success': True, 'data': messages})


@chat.route('/api/getaccess_ai_tutor', methods=['POST'])
def get_access_AI_tutor():
    email = request.json['email']
    organization_id = db.session.query(
        Organization).filter_by(email=email).first().uuid
    return jsonify({'success': True, 'data': organization_id, 'code': 200})


@chat.route('/api/transfer_tutor', methods=['POST'])
def transfer_tutor_customer():
    email = request.json['email']
    id = request.json['id']
    chat = db.session.query(Chat).filter_by(id=id).first()
    user = db.session.query(User).filter_by(email=email).first()
    chat.user_id = user.id
    db.session.commit()
    return jsonify({'success': True, 'message': f'You have successfully transferred your tutor to {email}!', 'code': 200})

@chat.route('/api/generate_system_prompt', methods=['POST'])
def generate_system_prompt():
    role = request.json['role']
    return generate_system_prompt_role(role)