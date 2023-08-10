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
pretty.install()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
load_dotenv()
jwt = JWTManager()
mail = Mail()
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    CORS(app)

    handler = logging.FileHandler('application.log')
    handler.setLevel(logging.ERROR)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    app.logger.addHandler(handler)
    app.config['SECRET_KEY'] = 'key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://postgres:postgres@localhost/postgres'
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
