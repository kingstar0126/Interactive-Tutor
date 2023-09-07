from flask import Blueprint, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_mail import Message
from .models import User, Organization, Invite, Chat
from . import db, mail
import os
import string
import secrets
from rich import print, pretty
from sqlalchemy import exc
import stripe
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, decode_token
from sqlalchemy.sql import text

load_dotenv()

pretty.install()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


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
    print(hours)
    return hours


def compare_month():
    today = datetime.today()
    is_new_month = today.day == 1

    if is_new_month:
        users = db.session.query(User).all()
        for user in users:
            query = user.query
            user.usage = 0
            if user.role == 2:
                user.query = 500
            elif user.role == 3:
                user.query = 3000
            elif user.role == 4:
                user.query = 10000
            db.session.commit()


auth = Blueprint('auth', __name__)


@auth.route('/api/login',  methods=['POST', 'OPTIONS', 'GET'])
def login_post():
    if request.method == 'OPTIONS':  # check for OPTIONS method
        headers = {
            'Access-Control-Allow-Origin': '*',  # Required for cors access
            'Access-Control-Allow-Methods': 'POST',  # Required for cors access
            'Access-Control-Allow-Headers': 'content-type',  # Required for cors access
        }
        return '', 200, headers

    email = request.json['email']
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
        days = calculate_days(user.create_date)
        if days < 0:
            user.role = 0
            db.session.commit()
            new_user = {
                'id': user.id,
                'username': user.username,
                'query': user.query - user.usage,
                'role': user.role,
            }
            response = {
                'success': True,
                'code': 200,
                'data': new_user,
                'message': 'Your free trial has ended.'
            }
            return jsonify(response)
        new_user = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'query': user.query - user.usage,
            'days': days
        }
    else:
        new_user = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'query': user.query - user.usage
        }
    response = {
        'success': True,
        'code': 200,
        'data': new_user
    }
    return jsonify(response)


@auth.route('/api/getuseraccount', methods=['POST'])
def get_user_account():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    if user.role == 5:
        days = calculate_days(user.create_date)
        if days < 0:
            user.role = 0
            db.session.commit()
            new_user = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'contact': user.contact,
                'state': user.state,
                'city': user.city,
                'role': user.role,
                'maxquery': user.query,
                'query': user.query - user.usage,
                'country': user.country,
                'tutors': user.tutors,
                'training_datas': user.training_datas,
                'training_words': user.training_words
            }
            response = {
                'success': True,
                'code': 200,
                'data': new_user,
                'message': 'Your free trial has ended.'
            }
            return jsonify(response)
        new_user = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'contact': user.contact,
            'state': user.state,
            'city': user.city,
            'role': user.role,
            'maxquery': user.query,
            'query': user.query - user.usage,
            'country': user.country,
            'tutors': user.tutors,
            'training_datas': user.training_datas,
            'training_words': user.training_words,
            'days': days
        }
    else:
        new_user = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'contact': user.contact,
            'state': user.state,
            'city': user.city,
            'role': user.role,
            'maxquery': user.query,
            'query': user.query - user.usage,
            'country': user.country,
            'tutors': user.tutors,
            'training_datas': user.training_datas,
            'training_words': user.training_words
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
    role = 5
    status = 0
    query = 500
    usage = 0
    tutors = 1
    training_datas = 1
    training_words = 100000
    customer = stripe.Customer.create(name=username, email=email)
    new_user = User(username=username, query=query, tutors=tutors, training_datas=training_datas, training_words=training_words, status=status, email=email, role=role, customer_id=customer.id, usage=usage,
                    password=generate_password_hash(password, method='sha256'))
    db.session.add(new_user)
    db.session.commit()
    new_organization = Organization(email=email)
    db.session.add(new_organization)
    db.session.commit()
    msg = Message('Welcome to Interactive Tutor', sender=os.getenv('MAIL_USERNAME'),
                  recipients=[email])
    msg.html = render_template(
        'welcome.html', username=username)
    mail.send(msg)

    return True


@auth.route('/api/reset', methods=['POST'])
def reset():
    email = request.json['email']
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
    password = request.json['password']
    user = db.session.query(User).filter_by(email=email).first()

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})
    verification_token = create_access_token(identity={'username': username, 'email': email, 'password': password},
                                             expires_delta=timedelta(minutes=30))
    verification_link = f"https://app.interactive-tutor.com/verify-email/token={verification_token}"

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


@auth.route('/api/adduseraccount', methods=['POST'])
def add_user_account():
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']
    role = 5
    status = 0
    query = 500
    usage = 0
    tutors = 1
    training_datas = 1
    training_words = 100000
    user = db.session.query(User).filter_by(email=email).first()

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})

    new_user = User(username=username, query=query, status=status, email=email, usage=usage, tutors=tutors, training_words=training_words, training_datas=training_datas, role=role,
                    password=generate_password_hash(password, method='sha256'))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True})


@auth.route('/api/getaccount', methods=['POST'])
def get_useraccount():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    if user.role == 5:
        days = calculate_days(user.create_date)
        if days < 0:
            user.role = 0
            db.session.commit()
            new_user = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'contact': user.contact,
                'state': user.state,
                'city': user.city,
                'role': user.role,
                'maxquery': user.query,
                'query': user.query - user.usage,
                'country': user.country,
                'tutors': user.tutors,
                'training_datas': user.training_datas,
                'training_words': user.training_words
            }
            response = {
                'success': True,
                'code': 200,
                'data': new_user,
                'message': 'Your free trial has ended.'
            }
            return jsonify(response)
        else:
            new_user = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'contact': user.contact,
                'state': user.state,
                'city': user.city,
                'role': user.role,
                'maxquery': user.query,
                'query': user.query - user.usage,
                'country': user.country,
                'tutors': user.tutors,
                'training_datas': user.training_datas,
                'training_words': user.training_words,
                'days': days
            }
            return jsonify({'success': True, 'data': new_user, 'code': 200})
    else:
        new_user = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'contact': user.contact,
            'state': user.state,
            'city': user.city,
            'maxquery': user.query,
            'role': user.role,
            'query': user.query - user.usage,
            'country': user.country,
            'tutors': user.tutors,
            'training_datas': user.training_datas,
            'training_words': user.training_words
        }
        return jsonify({'success': True, 'data': new_user, 'code': 200})


@auth.route('/api/getallaccounts', methods=['POST'])
def get_all_useraccount():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    if user.role != 1 and user.role != 7:
        return jsonify({
            'success': False,
            'code': 405,
            'message': "You have not permission"
        })
    current_users = []
    seen_users = []
    users = db.session.query(User).all()
    for current_user in users:
        if current_user.id == id:
            continue
        if user.role == 1:
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
        else:
            chats = db.session.query(Chat).filter_by(inviteId=id).all()
            for chat in chats:
                _user = db.session.query(User).filter_by(id=chat.user_id).first()
                if _user.id not in seen_users:
                    seen_users.append(_user.id)
                    new_user = {
                        'id': _user.id,
                        'username': _user.username,
                        'email': _user.email,
                        'query': _user.query,
                        'usage': _user.usage
                    }
                    current_users.append(new_user)
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
    user.role = int(role)
    # if user.subscription_id is not None:
    #     stripe.Subscription.cancel(user.subscription_id)
    db.session.commit()
    return jsonify({'success': True, 'code': 200, 'message': 'Updated Successfully'})


@auth.route('/api/changeaccount', methods=['POST'])
def change_useraccount():
    id = request.json['id']
    username = request.json['username']
    email = request.json['email']
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

@auth.route('/api/inviteEmail', methods=['POST'])
def invite_email():
    id = request.json['id']
    email = request.json['email']
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
        'invite.html', username=user.username, url="https://app.interactive-tutor.com"
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
    query = db.session.query(Invite).filter_by(user_id=id, email=email)
    if query:
        query.delete()
        db.session.commit()
    return jsonify({'success': True, 'code': 200, 'message': 'Email successfully removed'})

@auth.route('/api/userInvite', methods=['POST'])
def sendUserInvite():
    id = request.json['id']
    email = request.json['email']
    user = db.session.query(User).filter_by(email=email).first()
    if user is None:
        return jsonify({ 'success': False, 'message': "Not found User." })
    chats = db.session.query(Chat).filter_by(user_id=id).all()
    for chat in chats:
        chat_dict = {c.name: getattr(chat, c.name) for c in chat.__table__.columns if c.name != 'id'}
        chat_dict['user_id'] = user.id
        chat_dict['inviteId'] = id
        new_chat = Chat(**chat_dict)
        db.session.add(new_chat)
    db.session.commit()
    return jsonify({ 'success': True, 'message': 'Successfully sent invitation' })

@auth.route('/api/userInviteRemove', methods=['POST'])
def removeUserInvite():
    id = request.json['id']
    userId = request.json['userId']
    user = db.session.query(User).filter_by(id=userId).first()
    if user is None:
        return jsonify({ 'success': False, 'message': "Not found User." })
    chats = Chat.query.filter((Chat.user_id==userId) & (Chat.inviteId==id)).all()
    for chat in chats:
        db.session.delete(chat)
    db.session.commit()
    return jsonify({ 'success': True, 'message': 'Successfully removed invitation User' })