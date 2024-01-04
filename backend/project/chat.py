from flask import Blueprint, jsonify, request, send_file
from sqlalchemy import and_, or_, desc
from .models import Chat, Message, Train, User, Organization, Invite, Library, Review
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
from .train import duplicate_train_data
import datetime
import shutil

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
    api_select = 0

    user = db.session.query(User).filter_by(id=user_id).first()
    # ct = db.session.query(Chat).filter_by(user_id=user_id).count() + 1

    # if not user.role == 1 or user.role == 7:
    #     if ct > user.tutors:
    #         return jsonify({
    #             'success': False,
    #             'code': 401,
    #             'message': "You can no longer create AI Bots.",
    #         })
    new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button, api_select=api_select)
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

@chat.route('/api/sendreview', methods=['POST'])
def submit_review():
    try:
        library = json.loads(request.form.get('chat'))
        username = request.form.get('username')
        message = request.form.get('message')
        rating = request.form.get('rating')
        file = request.files['file']
        filename = str(uuid.uuid4()) + secure_filename(file.filename)
        filepath = os.path.join("project/image", filename)
        with open(filepath, 'wb') as f:
            while True:
                chunk = file.stream.read(1024)
                if not chunk:
                    break
                f.write(chunk)
        review = Review(username=username, message=message, useravatar=f'http://18.133.183.77/api/imageupload/{filename}', rating=rating)
        db.session.add(review)
        db.session.commit()
        current_library = db.session.query(Library).filter_by(id=library['id']).first()
        review_id = json.loads(current_library.review_id)
        review_id.append(review.id)
        current_library.review_id = json.dumps(review_id)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Success'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@chat.route('/api/getallreviews', methods=['POST'])
def get_all_reviews():
    library = request.json['chat']
    response = []
    current_library = db.session.query(Library).filter_by(id=library['id']).first()
    for review_id in json.loads(current_library.review_id):
        review = db.session.query(Review).filter_by(id=review_id).first()
        new_data = {
            'username': review.username,
            'message': review.message,
            'useravatar': review.useravatar,
            'rating': review.rating
        }
        response.append(new_data)
    return jsonify({'success': True, 'data': response})

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

@chat.route('/api/sendemail', methods=['POST'])
def send_email():
    try:
        email = request.json['email']
        email = email.lower()
        library = request.json['chat']
        user = db.session.query(User).filter_by(email=email).first()
        if user is None:
            return jsonify({'success': False, 'message': 'You have to sign up before add library'})
        
        current_library = db.session.query(Library).filter_by(id=library['id']).first()
        badges = json.loads(current_library.badge)
        if library['downloads'] == 5:
            badges.append(9)
        elif library['downloads'] == 20:
            badges.append(10)
        elif library['downloads'] == 50:
            badges.append(11)
        else:
            current_library.downloads = current_library.downloads + 1
        current_library.badge = json.dumps(badges)
        db.session.commit()
        chat = db.session.query(Chat).filter_by(id=library['chat_id']).first()
        if chat is None:
            return jsonify({'success': False, 'message': 'Not Found the Tutor'})
        user_id = user.id
        islibrary = True
        label = chat.label
        description = chat.description
        model = chat.model
        conversation = chat.conversation
        access = generate_pin_password()
        creativity = chat.creativity
        behavior = chat.behavior
        behaviormodel = chat.behaviormodel
        train = json.dumps([])
        chat_copyright = json.dumps(json.loads(chat.chat_copyright))
        chat_button = json.dumps(json.loads(chat.chat_button))
        bubble = json.dumps(json.loads(chat.bubble))
        chat_logo = json.dumps(json.loads(chat.chat_logo))
        chat_title = json.dumps(json.loads(chat.chat_title))
        chat_description = json.dumps(json.loads(chat.chat_description))
        new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button, islibrary=islibrary)
        db.session.add(new_chat)
        db.session.commit()

        train = json.dumps(duplicate_train_data(json.loads(chat.train), new_chat.uuid))
        new_chat.train = train
        db.session.commit()

        return jsonify({'success': True, 'message': 'Successfully add in your account'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

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
                item.uuid = str(uuid.uuid4())
        chat.label = label
        chat.description = description
        chat.model = model
        chat.conversation = conversation
        chat.creativity = creativity
        chat.behavior = behavior
        chat.behaviormodel = behaviormodel
        chat.uuid = str(uuid.uuid4())
        # Save the updated chat to the database
        db.session.commit()

        # Return a success response
        response = {
            'success': True,
            'code': 200,
            'message': 'Your ChatBot was updated successfully'
        }

    return jsonify(response)


@chat.route('/api/sharechatbot', methods=['POST'])
def share_chat():
    chat = request.json['chat']
    user_id = request.json['id']
    
    current_user = db.session.query(User).filter_by(id=user_id).first()
    if current_user is None:
        return jsonify({'success': False, 'message': 'User does not exist in the database!'})
    if current_user.role == 7:
        users = db.session.query(Invite, User.id).join(User, User.email == Invite.email).filter(Invite.user_id == user_id).all()
    else:
        users = db.session.query(Invite, User.id).join(User, User.email == Invite.email).filter(Invite.user_id == shareChat.inviteId).all()

    for user in users:
        user_id = user.id
        islibrary = True
        label = chat['label']
        description = chat['description']
        model = chat['model']
        conversation = chat['conversation']
        access = generate_pin_password()
        creativity = chat['creativity']
        behavior = chat['behavior']
        behaviormodel = chat['behaviormodel']
        train = json.dumps([])
        chat_copyright = json.dumps(chat['chat_copyright'])
        chat_button = json.dumps(chat['chat_button'])
        bubble = json.dumps(chat['bubble'])
        chat_logo = json.dumps(chat['chat_logo'])
        chat_title = json.dumps(chat['chat_title'])
        chat_description = json.dumps(chat['chat_description'])
        new_chat = Chat(user_id=user_id, label=label, description=description, model=model, conversation=conversation,
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button, islibrary=islibrary)
        db.session.add(new_chat)
        db.session.commit()
        train = json.dumps(duplicate_train_data(chat['train'], new_chat.uuid))
        new_chat.train = train
        db.session.commit()
    return jsonify({'success': True, 'message': 'Share Chatbot'})

@chat.route('/api/publishchat', methods=['POST'])
def publish_chat():
    try:
        chat = request.json['chat']
        user_id = request.json['id']
        library = db.session.query(Library).filter_by(chat_id=chat['id']).first()
        if library:
            return jsonify({'success': False, 'message': 'This Tutor already published'})

        current_user = db.session.query(User).filter_by(id=user_id).first()
        if current_user is None:
            return jsonify({'success': False, 'message': 'User does not exist in the database!'})
        chat_id = chat['id']
        downloads = 0
        review_id = json.dumps([])
        username = chat['username']
        userrole = chat['userrole']
        menu = chat['menu']
        submenu = chat['subMenu']
        status = chat['status']
        url = chat.get('url', '')
        badge = json.dumps([])
        library = Library(chat_id=chat_id, user_id=user_id, review_id=review_id, username=username, userrole=userrole, downloads=downloads, menu=menu, submenu=submenu, status=status, url=url, badge=badge)
        db.session.add(library)
        db.session.commit()
        return jsonify({
            'success': True,
            'message': 'Successful'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@chat.route('/api/getpublishchats', methods=['POST'])
def get_publish_chats():
    try:
        menu = request.json['menu']
        submenu = request.json['subMenu']
        sortby = request.json['sortby']
        page = request.json['page']
        perpage = request.json['perpage']
        
        chats = db.session.query(Library, Chat, User).join(Chat, Library.chat_id == Chat.id).join(User, Library.user_id == User.id)

        if sortby == 1:
            chats = chats.order_by(desc(Library.downloads))
        elif sortby == 0:
            chats = chats.order_by(desc(Library.create_date))
        print(type(menu), menu)
        if menu is not None:
            chats = chats.filter(Library.menu == menu)

        chats = chats.paginate(page=page, per_page=perpage, error_out=False)
        
        response = []
        for library, chat, user in chats.items:
            response.append({
                'id': library.id,
                'chat_logo': json.loads(chat.chat_logo),
                'label': chat.label,
                'description': chat.description,
                'name': user.username,
                'downloads': library.downloads,
                'menu': library.menu,
                'submenu': library.submenu,
                'status': library.status,
                'url': library.url,
                'username': library.username,
                'userrole': library.userrole,
                'badge': json.loads(library.badge),
                'review_id': json.loads(library.review_id),
                'chat_id': chat.id
            })

        return jsonify({'success': True, 'data': response, 'pageCount': chats.pages})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@chat.route('/api/addbadge', methods=['POST'])
def add_badge():
    library = request.json['chat']
    badgeData = request.json['badge']
    current_library = db.session.query(Library).filter_by(id=library['id']).first()
    
    badges = json.loads(current_library.badge)
    badges.append(badgeData)
    current_library.badge = json.dumps(badges)

    db.session.commit()
    return jsonify({'success': True, 'message': 'Success!'})



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
                'inviteId': chat.inviteId,
                'api_select': chat.api_select,
                'islibrary': chat.islibrary,
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
        'organization': organization,
        'role': user.role,
        'inviteId': chat.inviteId,
        'api_select': chat.api_select
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
            'inviteId': chat.inviteId,
            'api_select': chat.api_select
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
    user = db.session.query(User).filter_by(id=chat.user_id).first()
    organization = db.session.query(Organization).filter_by(
            email=user.email).first().uuid
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
        'inviteId': chat.inviteId,
        'organization': organization,
        'role': user.role,
        'api_select': chat.api_select,
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
        folders_to_remove = []
        messages = db.session.query(Message).filter_by(chat_id=id).all()
        for message in messages:
            ###################################
            # Remove the chart folder of message.
            folder_path = f'exports/charts/{message.uuid}'
            if os.path.exists(folder_path):
                folders_to_remove.append(folder_path)
            db.session.delete(message)
            ###################################
        db.session.commit()
        
        for folder_path in folders_to_remove:
            shutil.rmtree(folder_path)

        train_ids = json.loads(chat.train)
        # delete index in the pinecone

        for id in train_ids:
            source = db.session.query(Train).filter_by(id=id).first()
            delete_vectore(source.label, chat.uuid)
            db.session.query(Train).filter_by(id=id).delete()
        
        library = db.session.query(Library).filter_by(chat_id=id).first()
        if library:
            review_ids = json.loads(library.review_id)
            for review_id in review_ids:
                db.session.query(Review).filter_by(id=review_id).delete()
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


@chat.route('/api/transfer_tutor', methods=['POST'])
def transfer_tutor_customer():
    email = request.json['email']
    email = email.lower()
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