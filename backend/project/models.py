import os
from . import db
from flask_login import UserMixin
from flask_dance.consumer.storage.sqla import OAuthConsumerMixin
import jwt
import uuid
from sqlalchemy.dialects.postgresql import UUID
from time import time
from datetime import datetime


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    username = db.Column(db.String(255))
    role = db.Column(db.Integer)
    subscription_id = db.Column(db.String(255))
    customer_id = db.Column(db.String(255))
    query = db.Column(db.Integer)
    contact = db.Column(db.String(255))
    state = db.Column(db.String(255))
    city = db.Column(db.String(255))
    country = db.Column(db.String(255))
    status = db.Column(db.Integer)
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return 'User {}'.format(self.username)

    def get_reset_token(self, expires=1000):
        return jwt.encode(
            {'reset_password': self.username, 'exp': time() + expires},
            os.getenv('SECRET_KEY', 'random_key'), algorithm='HS256')

    @staticmethod
    def verify_reset_token(token):
        try:
            username = jwt.decode(token, os.getenv('SECRET_KEY', 'random_key'),
                                  algorithm='HS256')['reset_password']
        except:
            return
        return User.query.filter_by(username=username).first()

    @staticmethod
    def verify_email(email):
        user = User.query.filter_by(email=email).first()
        return user


class Chat(UserMixin, db.Model):
    __tablename__ = 'chat'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))
    model = db.Column(db.String(255))
    conversation = db.Column(db.String(255))
    access = db.Column(db.Integer)
    creativity = db.Column(db.Float)
    behavior = db.Column(db.String(255))
    behaviormodel = db.Column(db.String(255))
    train = db.Column(db.JSON)
    chat_logo = db.Column(db.JSON)
    chat_title = db.Column(db.JSON)
    chat_description = db.Column(db.JSON)
    chat_copyright = db.Column(db.JSON)
    chat_1_logo = db.Column(db.JSON)
    chat_1_description = db.Column(db.JSON)
    chat_2_logo = db.Column(db.JSON)
    chat_2_description = db.Column(db.JSON)
    chat_3_logo = db.Column(db.JSON)
    chat_3_description = db.Column(db.JSON)
    chat_button = db.Column(db.JSON)
    bubble = db.Column(db.JSON)
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)
    uuid = db.Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)

    def __repr__(self):
        return f'Chat {self.label}'

    @staticmethod
    def get_chat(label, description):
        return Chat.query.filter_by(label=label, description=description).first()


class Message(UserMixin, db.Model):
    __tablename__ = 'message'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    chat_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.JSON)
    behavior = db.Column(db.String(255))
    creativity = db.Column(db.Float)
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)
    uuid = db.Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)

    def __repr__(self):
        return f'message {self.id}'

    @staticmethod
    def get_message(chat_id):
        return Message.query.filter_by(chat_id=chat_id).first()


class Organization(UserMixin, db.Model):
    __tablename__ = 'organization'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255))
    organization = db.Column(db.String(255))
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)
    uuid = db.Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)

    def __repr__(self):
        return f'message {self.id}'


class Train(UserMixin, db.Model):
    __tablename__ = 'traindata'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    label = db.Column(db.String(255))
    type = db.Column(db.String(255))
    status = db.Column(db.String(255))
    chat = db.Column(db.String(255))
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'train {self.id}'


class Production(UserMixin, db.Model):
    __tablename__ = 'production'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    price_id = db.Column(db.String(255))
    name = db.Column(db.String(255))
    description = db.Column(db.JSON)
    role = db.Column(db.Integer)
    create_date = db.Column(db.Date, default=datetime.utcnow)
    update_date = db.Column(
        db.Date, default=datetime.utcnow, onupdate=datetime.utcnow)


class OAuth(OAuthConsumerMixin, db.Model):
    __table_args__ = (db.UniqueConstraint("provider", "provider_user_id"),)
    provider_user_id = db.Column(db.String(255), nullable=False)
    provider_user_login = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User)
