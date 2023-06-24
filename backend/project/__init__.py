from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
import os
from rich import print, pretty
pretty.install()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

jwt = JWTManager()
mail = Mail()
db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.config['SECRET_KEY'] = 'key-goes-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://chatbot:1@localhost/chatbot'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAIL_SERVER'] = 'popstar0982.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'username@gmail.com'
    app.config['MAIL_PASSWORD'] = "password"

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    jwt.init_app(app)
    mail.init_app(app)

    from .models import User, OAuth

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

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

    return app
