from flask import Blueprint, render_template,request, jsonify 
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required
from flask_mail import Mail, Message
from flask_jwt_extended import jwt_required, create_access_token
from .models import User, OAuth
from . import db, mail
import os
import string
import secrets

def generate_password(length=12):
    """Generate a random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

auth = Blueprint('auth', __name__)

@auth.route('/api/login', methods=['POST'])
def login_post():
  email = request.json['email']
  password = request.json['password']
  remember = True

  user = User.query.filter_by(email=email).first()

  if not user or not check_password_hash(user.password, password):
    return jsonify({
        'success': False,
        'code': 401,
        'message': 'Please check your login details and try again.',
    })
  login_user(user, remember=remember)
  response = {
    'success': True, 
    'code': 200,
    'data': user.username
  }
  return jsonify(response)

def send_email(user):
  token = user.get_reset_token()

  msg = Message()
  msg.subject = "Login System: Password Reset Request"
  msg.sender = 'chatbot@gmail.com'
  msg.recipients = [user.email]
  password = generate_password()
  msg.html = render_template('reset_pwd.html', user = user, password = password, token = token)

  mail.send(msg)

@auth.route('/api/reset', methods=['POST'])
def reset():
    email = request.json['email']
    user = User.verify_email(email)

    if user:
      send_email(user)
      data = {'message': 'An email has been sent with instructions to reset your password.', 'success': True}
    return jsonify(data)
  
@auth.route('/api/change', methods = ['POST'])
def changepassword():
  email = request.json['email']
  current_password = request.json['old_password']
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
        'message':'Your password has been updated! You are now able to log in',
        'success': True,
    })
  
@auth.route('/api/signup', methods=['POST'])
def signup_post():
    username = request.json['username']
    email = request.json['email']
    password = request.json['password']
    
    user = User.query.filter_by(email = email).first() 

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})
    new_user = User(username = username, email = email, password = generate_password_hash(password, method='sha256'))

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True})
@auth.route('/api/logout')
@login_required
def logout():
  logout_user()
  return jsonify({'success': True})