from flask import Blueprint, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from .models import User, Organization, Invite, Chat
from .train import duplicate_train_data
from . import db, mail
import re
import string
import json
import secrets
from rich import print, pretty
import stripe
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, decode_token
import csv
import tempfile
from . import add_email_to_sendgrid_marketing, get_sendgrid_list_ids, delete_email_to_sendgrid_marketing

load_dotenv()

pretty.install()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

SERVER_URL = os.getenv('SERVER_URL')

def generate_password(length=12):
    """Generate a random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


def generate_pin_password(length=6):
    """Generate a random password."""
    alphabet = string.digits
    password = ''.join(secrets.choice(alphabet) for _ in range(length))

    if len(password) < length:
        password += ''.join(secrets.choice(alphabet)
                            for _ in range(length - len(password)))

    return password


def calculate_days(signup_date):
    current_time = datetime.utcnow()
    time_difference = current_time - signup_date
    hours = 24 * 7 - int(time_difference.total_seconds() / 3600)
    return hours

auth = Blueprint('auth', __name__)


@auth.route('/api/login',  methods=['POST'])
def login_post():
    email = request.json['email']
    email = email.lower()
    password = request.json['password']
    user = db.session.query(User).filter_by(email=email).first()

    if not user:
        return jsonify({
            'success': False,
            'code': 401,
            'message': "Your information does not exist. Please register your information.",
        })
    if not check_password_hash(user.password, password):
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Your password is incorrect.',
        })
    if user.status != '0':
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'You are blocked.',
        })
    if user.role == 5:
        new_user = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'query': max(user.query - user.usage, 0),
        }
    else:
        new_user = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'query': max(user.query - user.usage, 0)
        }
    response = {
        'success': True,
        'code': 200,
        'data': new_user
    }

    return jsonify(response)


def send_email(user):
    token = User.get_reset_token(user)

    msg = Message('Welcome to Interactive Tutor', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[user.email])
    password = generate_password()
    msg.html = render_template(
        'reset_pwd.html', user=user.username, password=password, token=token)

    mail.send(msg)
    return password


def register_new_user(username, email, password):
    user = db.session.query(User).filter_by(email=email).first()
    if user is not None:
        return False
    db.session.add(Organization(email=email))

    invite_user = db.session.query(Invite).filter_by(email=email).first()
    
    # Setting default values for new user
    role = 5
    status = 0
    query = 500
    usage = 0
    tutors = 1
    training_datas = 1
    training_words = 100000

    if invite_user:
        invite_user.status = True
        user = db.session.query(User).filter_by(id=invite_user.user_id).first()
        if user and user.role == 7:  # Ensure user exists and has role 7
            # Updating values for user with role 7
            role = 4
            query = 30000
            tutors = 100
            training_datas = 100
            training_words = 20000000

    # Create stripe customer
    customer = stripe.Customer.create(name=username, email=email)

    if role == 5:
        add_email_to_sendgrid_marketing(os.getenv('SENDGRID_FREE_TRIAL_LIST_ID'), username, email)
    elif role == 7:
        add_email_to_sendgrid_marketing(os.getenv('SENDGRID_ENTERPRISE_USERS_LIST_ID'), username, email)
    elif invite_user:
        user = db.session.query(User).filter_by(id=invite_user.user_id).first()
        if user and user.role == 7:
            add_email_to_sendgrid_marketing(os.getenv('SENDGRID_ENTERPRISE_USERS_LIST_ID'), username, email)
    else:
        add_email_to_sendgrid_marketing(os.getenv('SENDGRID_SUBSCRIPTION_USERS_LIST_ID'), username, email)
    
    # Create new user
    new_user = User(
        username=username, 
        query=query, 
        tutors=tutors, 
        training_datas=training_datas, 
        training_words=training_words, 
        status=status, 
        email=email, 
        role=role, 
        customer_id=customer.id, 
        usage=usage,
        password=generate_password_hash(password, method='sha256')
    )

    db.session.add(new_user)
    db.session.commit()

    msg = Message(
        'Welcome to Interactive Tutor', 
        sender=os.getenv('MAIL_USERNAME'),
        recipients=[email]
    )
    msg.html = render_template('welcome.html', username=username)
    mail.send(msg)

    return True


@auth.route('/api/reset', methods=['POST'])
def reset():
    email = request.json['email']
    email = email.lower()
    user = User.verify_email(email)
    if user:
        password = send_email(user)
        user.password = generate_password_hash(password, method='sha256')
        db.session.commit()
        data = {
            'message': 'An email has been sent with instructions to reset your password.', 'success': True}
        return jsonify(data)


@auth.route('/api/change', methods=['POST'])
def changepassword():
    email = request.json['email']
    email = email.lower()
    current_password = request.json['old password']
    password = request.json['password']

    user = db.session.query(User).filter_by(email=email).first()

    if not user or not check_password_hash(user.password, current_password):
        return jsonify({
            'success': False,
            'message': 'Your current password is incorrect.',
        })
    # if len(password or ()) < 8:
    #   flash('Your password needs to be at least 8 characters', 'error')
    if password:
        hashed_password = generate_password_hash(password, method='sha256')
        user.password = hashed_password

        db.session.commit()
        return jsonify({
            'message': 'Your password has been updated! You are now able to log in',
            'success': True,
        })


@auth.route('/api/signup', methods=['POST'])
def signup_post():
    username = request.json['username']
    email = request.json['email']
    email = email.lower()
    password = request.json['password']
    user = db.session.query(User).filter_by(email=email).first()

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})
    
    invite_account = db.session.query(Invite).filter_by(email=email).first()
    if invite_account:
        invite_user = db.session.query(User).filter_by(id=invite_account.user_id).first()
        if invite_user.role == 7:
            register_new_user(username, email, password)
            return jsonify({'success': True, 'message': 'You have registered successfully!'})

    verification_token = create_access_token(identity={'username': username, 'email': email, 'password': password},
                                             expires_delta=timedelta(minutes=30))
    verification_link = f"{SERVER_URL}/verify-email/token={verification_token}"
    msg = Message('Welcome to Interactive Tutor', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[email])
    msg.html = render_template(
        'email_verification.html', username=username, url=verification_link, support_email=os.getenv('MAIL_USERNAME'))
    mail.send(msg)

    return jsonify({'success': True, 'message': 'A message has been sent to your email. Check your message.'})


@auth.route('/api/email_verification', methods=['POST'])
def email_verification():
    token = request.json['token']
    if not token:
        return jsonify({'message': 'Token is missing', 'success': False})
    try:
        token = decode_token(token)
        if register_new_user(token['sub']['username'], token['sub']['email'], token['sub']['password']):
            return jsonify({'message': 'You have successfully registered!', 'success': True})
        else:
            return jsonify({'message': 'Something is wrong!', 'success': False})
    except Exception as e:
        return jsonify({'message': 'Your token expired', 'success': False})


# @auth.route('/api/adduseraccount', methods=['POST'])
# def add_user_account():
#     username = request.json['username']
#     email = request.json['email']
#     email = email.lower()
#     password = request.json['password']
#     role = 5
#     status = 0
#     query = 500
#     usage = 0
#     tutors = 1
#     training_datas = 1
#     training_words = 100000
#     user = db.session.query(User).filter_by(email=email).first()

#     if user:
#         return jsonify({'message': 'Email address already exists', 'success': False})

#     new_user = User(username=username, query=query, status=status, email=email, usage=usage, tutors=tutors, training_words=training_words, training_datas=training_datas, role=role,
#                     password=generate_password_hash(password, method='sha256'))

#     db.session.add(new_user)
#     db.session.commit()

#     return jsonify({'success': True})


@auth.route('/api/getaccount', methods=['POST'])
def get_useraccount():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    if user.role == 5:
        new_user = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'contact': user.contact,
            'state': user.state,
            'city': user.city,
            'role': user.role,
            'maxquery': user.query,
            'query': max(user.query - user.usage, 0),
            'country': user.country,
            'tutors': user.tutors,
            'training_datas': user.training_datas,
            'training_words': user.training_words,
        }
        return jsonify({'success': True, 'data': new_user, 'code': 200})
    else:
        invite_account = db.session.query(Invite).filter_by(email=user.email).first()
        if invite_account:
            invite_user = db.session.query(User).filter_by(id=invite_account.user_id).first()
            if invite_user and invite_user.role == 7:
                new_user = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'contact': user.contact,
                    'state': user.state,
                    'city': user.city,
                    'maxquery': user.query,
                    'role': user.role,
                    'query': invite_user.query - invite_user.usage,
                    'country': user.country,
                    'tutors': user.tutors,
                    'training_datas': user.training_datas,
                    'training_words': user.training_words
                }
                return jsonify({'success': True, 'data': new_user, 'code': 200})
        new_user = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'contact': user.contact,
                'state': user.state,
                'city': user.city,
                'maxquery': user.query,
                'role': user.role,
                'query': max(user.query - user.usage, 0),
                'country': user.country,
                'tutors': user.tutors,
                'training_datas': user.training_datas,
                'training_words': user.training_words
            }
        return jsonify({'success': True, 'data': new_user, 'code': 200})

from sqlalchemy import or_

@auth.route('/api/getallaccounts', methods=['POST'])
def get_all_useraccount():
    id = request.json['id']
    search = request.json['search']
    user = db.session.query(User).filter_by(id=id).first()
    
    if user.role != 1 and user.role != 7:
        return jsonify({
            'success': False,
            'code': 405,
            'message': "You have not permission"
        })
    current_users = []
    if user.role == 1:
        if search:
            users = db.session.query(User).filter(
                or_(
                    User.username.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            ).all()
        else:
            users = db.session.query(User).all()
            
        for current_user in users:
            if current_user.id == id:
                continue

            new_user = {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email,
                'contact': current_user.contact,
                'state': current_user.state,
                'city': current_user.city,
                'country': current_user.country,
                'status': current_user.status,
                'query': current_user.query,
                'usage': current_user.usage,
                'tutors': current_user.tutors,
                'role': current_user.role,
                'training_datas': current_user.training_datas,
                'training_words': current_user.training_words
            }
            current_users.append(new_user)

        return jsonify({'success': True, 'data': current_users, 'code': 200})
    
    else:
        invite_users = db.session.query(Invite).filter_by(user_id=id).all()
        
        for invite_user in invite_users:
            if invite_user.status: #already signed up user
                _user = db.session.query(User).filter_by(email=invite_user.email).first()
                _chat = []
                if _user is not None:
                    if search:
                        chats = db.session.query(Chat).filter(
                            Chat.inviteId == id, 
                            Chat.user_id == _user.id, 
                            or_(
                                Chat.label.ilike(f"%{search}%"),
                                Chat.description.ilike(f"%{search}%"),
                                Chat.model.ilike(f"%{search}%")
                            )
                        ).all()
                    else:
                        chats = db.session.query(Chat).filter_by(inviteId=id, user_id=_user.id).all()
                
                    for chat in chats:
                        chat_data = {
                            'id': chat.id,
                            'label': chat.label,
                            'description': chat.description,
                            'model': chat.model,
                            'user_id': chat.user_id,
                            'access': chat.access,
                            'uuid': chat.uuid,
                        }
                        _chat.append(chat_data)
                    new_user = {
                        'email': _user.email,
                        'username': _user.username,
                        'query': _user.query,
                        'usage': _user.usage,
                        'chats': _chat,
                        'status': invite_user.status
                    }
                    current_users.append(new_user)
            else:                   # not sign up user
                new_user = {
                    'email': invite_user.email,
                    'query': 0,
                    'usage': 0,
                    'chats': [],
                    'status': invite_user.status
                }
                current_users.append(new_user)
        return jsonify({'success': True, 'data': current_users, 'code': 200})
        # chats = db.session.query(Chat).filter_by(inviteId=id).all()
        # for chat in chats:
        #     _user = db.session.query(User).filter_by(id=chat.user_id).first()
        #     if _user.id not in seen_users:
        #         seen_users.append(_user.id)
        #         new_user = {
        #             'id': _user.id,
        #             'username': _user.username,
        #             'email': _user.email,
        #             'query': _user.query,
        #             'usage': _user.usage
        #         }
                # current_users.append(new_user)
        return jsonify({'success': True, 'data': current_users, 'code': 200})


@auth.route('/api/changeaccountstatus', methods=['POST'])
def change_account_status():
    id = request.json['id']
    status = request.json['status']

    user = db.session.query(User).filter_by(id=id).first()
    if user:
        user.status = status
        db.session.commit()
        return jsonify({'success': True, 'code': 200, 'message': 'Updated successfully'})
    else:
        return jsonify({'success': False, 'code': 404, 'message': 'User not found'})


@auth.route('/api/change_user_limitation', methods=['POST'])
def Change_user_limitation():
    email = request.json['email']
    email = email.lower()
    query = request.json['query']
    train = request.json['train']
    tutors = request.json['tutor']
    word = request.json['word']
    role = request.json['role']

    user = db.session.query(User).filter_by(email=email).first()
    user.query = query
    user.training_datas = train
    user.tutors = tutors
    user.training_words = word
    if user.role != int(role):
        user.role = int(role)
        if role == 7 or role == 6:
            if role == 7:
                delete_email_to_sendgrid_marketing(os.getenv('SENDGRID_FREE_TRIAL_LIST_ID'), user.email)
                delete_email_to_sendgrid_marketing(os.getenv('SENDGRID_SUBSCRIPTION_USERS_LIST_ID'), user.email)
                add_email_to_sendgrid_marketing(os.getenv('SENDGRID_ENTERPRISE_USERS_LIST_ID'), user.username, user.email)
            if user.subscription_id is not None:
                stripe.Subscription.cancel(user.subscription_id)
    db.session.commit()
    return jsonify({'success': True, 'code': 200, 'message': 'Updated Successfully'})


@auth.route('/api/changeaccount', methods=['POST'])
def change_useraccount():
    id = request.json['id']
    username = request.json['username']
    email = request.json['email']
    email = email.lower()
    contact = request.json['phone']
    state = request.json['state']
    city = request.json['city']
    country = request.json['country']

    user = db.session.query(User).filter_by(id=id).first()
    user.username = username
    user.email = email
    user.contact = contact
    user.state = state
    user.city = city
    user.country = country
    db.session.commit()

    return jsonify({'success': True, 'code': 200})


@auth.route('/api/subscription/custom_plan', methods=['POST'])
def subscription_custom_plan():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    msg = Message('Customer wants to use custom plan !!!', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[os.getenv('MAIL_USERNAME')])
    msg.html = render_template(
        'send_custom_plan.html', username=user.username, email=user.email, phone=user.contact)
    mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'We have sent your request to the manager.'})

@auth.route('/api/subscription/upgrade_query', methods=['POST'])
def upgrade_custom_plan():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    msg = Message('Customer wants to upgrade Query !!!', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[os.getenv('MAIL_USERNAME')])
    msg.html = render_template(
        'send_query_upgrade.html', username=user.username, email=user.email, phone=user.contact)
    mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'We have sent your request to the manager.'})

@auth.route('/api/inviteEmail', methods=['POST'])
def invite_email():
    id = request.json['id']
    email = request.json['email']
    email = email.lower()
    index = request.json['index']
    user = db.session.query(User).filter_by(id=id).first()
    invite_user = db.session.query(User).filter_by(email=email).first()
    if invite_user:
        return jsonify({'success': False, 'code': 409, 'message': 'Email address already exists!'})
    new_invite = Invite(user_id=id, email=email, index=index, status=False)

    db.session.add(new_invite)
    db.session.commit()
    msg = Message('Invite to the interactive tutor', sender=os.getenv('MAIL_USERNAME'), recipients=[email])
    msg.html = render_template(
        'invite.html', username=user.username, url=f"{SERVER_URL}/register?email={email}"
    )
    mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'You have successfully sent the invitation!'})


@auth.route('/api/getInviteEmails', methods=['POST'])
def get_invite_emails():
    id = request.json['id']
    invite_emails = db.session.query(Invite).filter_by(user_id=id).all()
    user = db.session.query(User).filter_by(id=id).first()
    response = []
    count = 0
    for invite_email in invite_emails:
        item = {
            'email': invite_email.email,
            'index': invite_email.index,
            'status': invite_email.status
        }
        if invite_email.status:
            count += 1
        response.append(item)
    if count >= 5:
        if not user.discount:
            user.discount = True
            db.session.commit()
            msg = Message('Discount of Interactive tutor', sender=os.getenv('MAIL_USERNAME'), recipients=[user.email])
            msg.html = render_template(
                'discount.html', username=user.username, coupon=os.getenv('COUPON')
            )
            mail.send(msg)
    data = {
        'success': True,
        'code': 200, 
        'data': response
    }
    return jsonify(data)

@auth.route('/api/removeInvite', methods=['POST'])
def remove_invite_email():
    id = request.json['id']
    email = request.json['email']
    email = email.lower()
    invite = db.session.query(Invite).filter_by(user_id=id, email=email)
    if invite:
        invite.delete()
        db.session.commit()
    return jsonify({'success': True, 'code': 200, 'message': 'Email successfully removed'})

@auth.route('/api/resendInvitation', methods=['POST'])
def resendInvitation():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    email = request.json['email']
    email = email.lower()
    msg = Message('Invite to the interactive tutor', sender=os.getenv('MAIL_USERNAME'), recipients=[email])
    msg.html = render_template(
        'enterprise.html', username=user.username, url=f"{SERVER_URL}/register?email={email}"
    )
    mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'You have successfully Resent the invitation!'})

@auth.route('/api/userInvite', methods=['POST'])
def sendUserInvite():
    id = request.json['id']
    emails = request.json['email']
    enterpriseUser = db.session.query(User).filter_by(id=id).first()
    for email in emails:
        if email == enterpriseUser.email:
            continue
        existInvite = db.session.query(Invite).filter_by(email=email).first()
        if existInvite is not None:
            continue
        user = db.session.query(User).filter_by(email=email).first()
        if user is None:
            new_invite = Invite(user_id=id, email=email, index=0, status=False)
        else:
            new_invite = Invite(user_id=id, email=email, index=0, status=True)
            user.role = 4
            user.query = 30000
            user.tutors = 100
            user.training_datas = 100
            user.training_words = 20000000
        db.session.add(new_invite)
        db.session.commit()
        msg = Message('Invite to the interactive tutor', sender=os.getenv('MAIL_USERNAME'), recipients=[email])
        msg.html = render_template(
            'enterprise.html', username=enterpriseUser.username, url=f"{SERVER_URL}/register?email={email}"
        )
        mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'You have successfully sent the invitation!'})


@auth.route('/api/userInviteRemove', methods=['POST'])
def removeUserInvite():
    id = request.json['id']
    email = request.json['email']
    email = email.lower()
    user = db.session.query(User).filter_by(email=email).first()
    if user:
        chats = db.session.query(Chat).filter_by(user_id=user.id, inviteId=id).all()
        if chats:
            for chat in chats:
                db.session.delete(chat)
        db.session.delete(user)
    organization = db.session.query(Organization).filter_by(email=email).first()
    if organization:
        db.session.delete(organization)
    invite = db.session.query(Invite).filter_by(user_id=id, email=email)
    if invite:
        invite.delete()
    db.session.commit()
    return jsonify({ 'success': True, 'message': 'Successfully removed invitation User' })


@auth.route('/api/setTutors', methods=['POST'])
def setTutors():
    id = request.json['id']
    email = request.json['email']
    email = email.lower()
    chats = request.json['chats']
    user = db.session.query(User).filter_by(id=id).first()
    invite_user = db.session.query(User).filter_by(email=email).first()
    if user is None and user.role == 7:
        return jsonify({ 'success': False, 'message': 'User Not Found or Not Authorized' })
    originalChats = db.session.query(Chat).filter_by(user_id=invite_user.id, inviteId=id).all()
    if originalChats:
        for chat in originalChats:
            db.session.delete(chat)
    for chat in chats:
        user_id = invite_user.id
        inviteId = id
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
                    access=access, creativity=creativity, behavior=behavior, behaviormodel=behaviormodel, train=train, bubble=bubble, chat_logo=chat_logo, chat_title=chat_title, chat_description=chat_description, chat_copyright=chat_copyright, chat_button=chat_button, inviteId=inviteId)
        db.session.add(new_chat)
        db.session.commit()

        train = json.dumps(duplicate_train_data(chat['train'], new_chat.uuid))
        new_chat.train = train
        db.session.commit()

    return jsonify({ 'success': True, 'message': 'Successfully set Tutors' })


@auth.route('/api/checkUserInvite', methods=['POST'])
def checkUserInvite():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    invite_account = db.session.query(Invite).filter_by(email=user.email).first()
    if invite_account:
            invite_user = db.session.query(User).filter_by(id=invite_account.user_id).first()
            if invite_user and invite_user.role == 7:
                return jsonify({'success': True})
    return jsonify({'success': False})


@auth.route('/api/uploadInviteFile', methods=['POST'])
def uploadInviteFile():
    file = request.files.get('file', None)
    if not file:
        return {"success": False, "message": "Invalid file data"}, 400
    filename = secure_filename(file.filename)
    temp_file = tempfile.NamedTemporaryFile(delete=False)
    file.save(temp_file.name)
    try:
        with open(temp_file.name, 'r') as f:
            data = parse_csv(f)
    finally:
        temp_file.close()
        os.unlink(temp_file.name)
    
    return {"success": True, "data": data, "message": "Successfully"}, 200


def parse_csv(file):
    data = csv.reader(file)
    email = []
    for row in data:
        for col in row:
            if is_email(col):
                email.append(col)
    return email

def is_email(s):
    pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    return bool(re.match(pattern, s))


@auth.route('/api/closeAccunt', methods=['POST'])
def closeAccunt():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    msg = Message('Customer wants to delete their account !!!', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[os.getenv('MAIL_USERNAME')])
    msg.html = render_template(
        'delete_account.html', username=user.username, email=user.email, phone=user.contact)
    mail.send(msg)
    return jsonify({'success': True, 'code': 200, 'message': 'We have sent your request to the manager.'})
