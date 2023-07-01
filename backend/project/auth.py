from flask import Blueprint, render_template, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required
from flask_mail import Mail, Message
from flask_jwt_extended import jwt_required, create_access_token
from .models import User, OAuth
from . import db, mail
import os
import string
import secrets
from rich import print, pretty

pretty.install()


def generate_password(length=12):
    """Generate a random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


auth = Blueprint('auth', __name__)


@auth.route('/api/login',  methods=['POST', 'OPTIONS'])
def login_post():
    if request.method == 'OPTIONS':  # check for OPTIONS method
        headers = {
            'Access-Control-Allow-Origin': '*',  # Required for cors access
            'Access-Control-Allow-Methods': 'POST',  # Required for cors access
            'Access-Control-Allow-Headers': 'content-type',  # Required for cors access
        }
        return '', 200, headers

    print(request.json)
    email = request.json['email']
    password = request.json['password']
    remember = False

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Please check your login details and try again.',
        })
    login_user(user, remember=remember)
    new_user = {
        'id': user.id,
        'username': user.username,
        'role': user.role
    }
    response = {
        'success': True,
        'code': 200,
        'data': new_user
    }
    return jsonify(response)


def send_email(user):
    token = User.get_reset_token(user)

    msg = Message('Interactive', sender='popstar0982@outlook.com',
                  recipients=[user.email])
    password = generate_password()
    msg.html = render_template(
        'reset_pwd.html', user=user.username, password=password, token=token)

    mail.send(msg)
    return password


@auth.route('/api/reset', methods=['POST'])
def reset():
    print(request.json)
    email = request.json['email']
    user = User.verify_email(email)
    print(user)
    if user:
        password = send_email(user)
        user.password = generate_password_hash(password, method='sha256')
        db.session.commit()
        data = {
            'message': 'An email has been sent with instructions to reset your password.', 'success': True}
    return jsonify(data)


@auth.route('/api/change', methods=['POST'])
def changepassword():
    print(request.json)
    email = request.json['email']
    current_password = request.json['old password']
    password = request.json['password']

    user = User.query.filter_by(email=email).first()

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
    role = 0
    user = User.query.filter_by(email=email).first()

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})
    new_user = User(username=username, email=email, role=role,
                    password=generate_password_hash(password, method='sha256'))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True})


@auth.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'success': True})
