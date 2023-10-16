from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
import os
import random
from dotenv import load_dotenv
import time
import logging
from sqlalchemy.exc import SQLAlchemyError
from rich import print, pretty
from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail
import requests
import json

pretty.install()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
load_dotenv()
jwt = JWTManager()
mail = Mail()
db = SQLAlchemy()
sendgrid_client = SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY'))

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    handler = logging.FileHandler('application.log')
    handler.setLevel(logging.ERROR)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.config['SECRET_KEY'] = 'key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:postgres@interactive-tutor.crzdypgejusl.eu-west-2.rds.amazonaws.com/postgres'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
    app.config['SQLALCHEMY_POOL_TIMEOUT'] = 60
    app.config['SQLALCHEMY_POOL_SIZE'] = 20
    app.config['SQLALCHEMY_POOL_RECYCLE'] = 1
    app.config['SQLALCHEMY_POOL_PRE_PING'] = True
    

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    from .models import User

    # Register blueprints for auth routes
    from .auth import auth as auth_blueprint

    # Register any extensions required by blueprints
    auth_blueprint.db = db

    app.register_blueprint(auth_blueprint)

    # Register blueprints for chat routes
    from .chat import chat as chat_blueprint
    chat_blueprint.db = db
    app.register_blueprint(chat_blueprint)

    # # Register blueprints for chatmessage routes
    from .message import message as message_blueprint
    message_blueprint.db = db
    app.register_blueprint(message_blueprint)

    # # Register blueprints for traindata routes
    from .train import train as train_blueprint
    train_blueprint.db = db
    app.register_blueprint(train_blueprint)

    # Register blueprints for stripe routes
    from .stripe import payment as payment_blueprint
    payment_blueprint.db = db
    app.register_blueprint(payment_blueprint)

    from .production import product as product_blueprint
    product_blueprint.db = db
    app.register_blueprint(product_blueprint)
    
    return app

def send_email_with_template(to_email, template_id, dynamic_template_data):
    message = Mail(
        from_email='from_email@example.com',  # Replace with your sender's email
        to_emails=to_email,
        subject="Welcome to Interactive Tutor"
    )
    # Set the template id and provide the dynamic data
    message.subject=subject,
    message.template_id = template_id
    message.dynamic_template_data = dynamic_template_data
    try:
        response = sendgrid_client.send(message)
        print(response.status_code)
    except Exception as e:
        print(f"Error: {e.message}")

def add_email_to_sendgrid_marketing(list_id, name, email):
    # Step 1: Add the contact to SendGrid
    url = "https://api.sendgrid.com/v3/marketing/contacts"

    headers = {
        'authorization': f"Bearer {os.getenv('SENDGRID_API_KEY')}",
        'content-type': "application/json"
    }

    data = {
        "list_ids": [list_id],
        "contacts": [
            {
                "email": email,
                "first_name": name
            }
        ]
    }

    response = requests.put(url, headers=headers, data=json.dumps(data))

    if response.status_code == 202:
        print("Contact added successfully.")
    else:
        print(f"Failed to add contact: {response.content}")


def delete_email_to_sendgrid_marketing(list_id, email):
    url = "https://api.sendgrid.com/v3/marketing/contacts/search"

    headers = {
        'authorization': f"Bearer {os.getenv('SENDGRID_API_KEY')}",
        'content-type': "application/json"
    }

    data = {
        "query": f"email = '{email}'"
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))

    if response.status_code == 200:
        results = response.json().get('result', [])
        if results:
            contact_id = results[0]['id']
        else:
            print(f"No contact found with email {email}")
            return
    else:
        print(f"Failed to retrieve contact ID: {response.content}")
        return

    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

    params = {'contact_ids': contact_id}

    response = sg.client.marketing.lists._(list_id).contacts.delete(
        query_params=params
    )

    # print(response.status_code)
    # print(response.body)
    # print(response.headers)

def get_sendgrid_list_ids():
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

    params = {'page_size': 100}

    response = sg.client.marketing.lists.get(
        query_params=params
    )

    # print(response.status_code)
    # print(response.body)
    # print(response.headers)