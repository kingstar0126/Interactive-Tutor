from flask import Blueprint, jsonify, request
from . import db
from rich import print, pretty
import datetime
from bs4 import BeautifulSoup
import requests
import os
import json
from .models import Chat, Train, User
import re
from langchain.docstore.document import Document
from typing import List
from pypdf import PdfReader
from .traindata import *
from io import BytesIO
import pandas as pd
import docx
from ebooklib import epub
import ebooklib
import pinecone
import openai
from dotenv import load_dotenv
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import csv
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import pos_tag

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
openai.openai_api_key = OPENAI_API_KEY
nltk.download('stopwords')
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

pretty.install()

train = Blueprint('train', __name__)


def count_tokens(string):
    words = string.split()
    return len(words)


def compare_token_words(ct, chatbot):
    current_chat = db.session.query(Chat).filter_by(uuid=chatbot).first()
    user = db.session.query(User).filter_by(id=current_chat.user_id).first()

    if user.role == 1:
        return True

    elif ct >= user.training_words:
        return False
    return True


def delete_vectore(source, chat):
    index = pinecone.Index(PINECONE_INDEX_NAME)
    return index.delete(
        filter={
            "source": f"{source}",
            "chat": f"{chat}"
        }
    )


def create_vector(docs):
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    Pinecone.from_documents(
        docs, embeddings, index_name=PINECONE_INDEX_NAME)


def parse_pdf(file: BytesIO) -> List[str]:
    pdf = PdfReader(file)
    output = []
    for page in pdf.pages:
        text = page.extract_text()
        # Merge hyphenated words
        text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
        # Fix newlines in the middle of sentences
        text = re.sub(r"(?<!\n\s)\n(?!\s\n)", " ", text.strip())
        # Remove multiple newlines
        text = re.sub(r"\n\s*\n", "\n\n", text)
        text = correct_grammar(text)
        output.append(text)
    return output


def parse_csv(file):
    data = file.read()
    string_data = str(data)
    string_data = correct_grammar(string_data)
    text = []
    text.append(string_data)
    return text


def parse_docx(file):
    doc = docx.Document(file)
    fullText = []
    for para in doc.paragraphs:
        text = correct_grammar(para.text)
        fullText.append(text)
    return '\n'.join(fullText)

# This is that change the .srt, .txt, .json, .md


def parse_srt(file):
    lines = file.read().decode("utf-8")
    string = correct_grammar(lines)
    text = []
    text.append(string)
    return text


def parse_epub(filename):
    book = epub.read_epub(filename)
    text = []
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            bodyContent = item.get_body_content().decode()
            soup = BeautifulSoup(bodyContent, 'html.parser')
            text_ = set()  # Store unique sentences using a set
            cleaned_text = soup.get_text()
            cleaned_text = correct_grammar(cleaned_text)
            text_.add(cleaned_text)

            text.extend(text_)
    return (text)


def text_to_docs(text: str, filename: str, chat: str) -> List[Document]:
    """Converts a string or list of strings to a list of Documents
    with metadata."""
    if isinstance(text, str):
        # Take a single string as one page
        text = [text]
    page_docs = [Document(page_content=page) for page in text]

    # Add page numbers as metadata
    for i, doc in enumerate(page_docs):
        doc.metadata["page"] = i + 1

    # Split pages into chunks
    doc_chunks = []

    for i, doc in enumerate(page_docs):
        text_splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n"],
            chunk_size=1000,
            chunk_overlap=200,
        )
        if doc.page_content == "":
            continue
        chunks = text_splitter.split_text(doc.page_content)

        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk, metadata={
                    "page": doc.metadata["page"], "chunk": i}
            )
            # Add sources a metadata
            doc.metadata["source"] = f"{filename}"
            doc.metadata["chat"] = f"{chat}"
            doc_chunks.append(doc)
    return doc_chunks


def correct_grammar(text):
    # Tokenize the text into sentences
    sentences = nltk.sent_tokenize(text)

    # Correct each sentence separately
    corrected_sentences = []
    for sentence in sentences:
        # Tokenize the sentence into words and tag their parts of speech
        words = nltk.word_tokenize(sentence)
        tagged_words = nltk.pos_tag(words)

        # Perform grammar correction based on POS tags
        corrected_words = []
        for word, tag in tagged_words:
            # Perform grammar correction as needed
            # Example correction: singularize nouns, use proper verb forms, etc.
            corrected_word = word  # Placeholder for correction logic
            corrected_words.append(corrected_word)

        # Reconstruct the corrected sentence
        corrected_sentence = " ".join(corrected_words)
        corrected_sentences.append(corrected_sentence)

    # Reconstruct the entire corrected text
    corrected_text = " ".join(corrected_sentences)
    return corrected_text


def web_scraping(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        soup = BeautifulSoup(response.content, 'html.parser')

        text = set()  # Store unique sentences using a set
        cleaned_text = soup.get_text()
        cleaned_text = correct_grammar(cleaned_text)
        text.add(cleaned_text)

        # Generate the sentences from the set and remove unnecessary repeated text
        result = list(text)
        return result
    except requests.exceptions.RequestException as e:
        return []


def create_train(label, _type, status, chat):
    new_train = Train(label=label, type=_type, status=status, chat=chat)
    db.session.add(new_train)
    db.session.flush()
    db.session.commit()

    return new_train.id


def compare_role_user(chatbot):
    current_chat = db.session.query(Chat).filter_by(uuid=chatbot).first()
    traindata = json.loads(current_chat.train)
    ct = len(traindata)
    user = db.session.query(User).filter_by(id=current_chat.user_id).first()
    if not user.role == 1:
        if ct >= user.training_datas:
            return False
    return True


def insert_train_chat(chatbot, train_id):
    current_chat = db.session.query(Chat).filter_by(uuid=chatbot).first()
    traindata = json.loads(current_chat.train)
    traindata.append(train_id)
    current_chat.train = json.dumps(traindata)
    db.session.commit()
    chat_data = {
        'id': current_chat.id,
        'label': current_chat.label,
        'description': current_chat.description,
        'model': current_chat.model,
        'conversation': current_chat.conversation,
        'access': current_chat.access,
        'creativity': current_chat.creativity,
        'behavior': current_chat.behavior,
        'behaviormodel': current_chat.behaviormodel,
        'uuid': current_chat.uuid,
        'train': json.loads(current_chat.train),
        'chat_logo': json.loads(current_chat.chat_logo),
        'chat_title': json.loads(current_chat.chat_title),
        'chat_description': json.loads(current_chat.chat_description),
        'chat_copyright': json.loads(current_chat.chat_copyright),
        'chat_button': json.loads(current_chat.chat_button),
        'bubble': json.loads(current_chat.bubble),
    }
    return chat_data


@train.route('/api/data/sendurl', methods=['POST'])
def create_train_url():
    url = request.json['url']
    chatbot = request.json['chatbot']
    if compare_role_user(chatbot):
        data = web_scraping(url)
        if data == False:
            return jsonify({
                'success': False,
                'code': 405,
                'message': 'Invalid URL.',
            })

        trainid = create_train(url, 'url', True, chatbot)

        result = text_to_docs(data, url, chatbot)

        if (trainid == False):
            return jsonify({
                'success': False,
                'code': 405,
                'message': 'Training data already exist.',
            })
        create_vector(result)
        chat = insert_train_chat(chatbot, trainid)
        return jsonify({
            'success': True,
            'code': 200,
            'data': chat,
            'message': "create train successfully",
        })
    else:
        return jsonify({
            'success': False,
            'code': 401,
            'message': "No more creating training data!",
        })


@train.route('/api/data/sendtext', methods=['POST'])
def create_train_text():
    text = request.json['text']
    chatbot = request.json['chatbot']
    if compare_role_user(chatbot):
        trainid = create_train(text[:20], 'text', True, chatbot)
        result = text_to_docs(text, text[:20], chatbot)

        if (trainid == False):
            return jsonify({
                'success': False,
                'code': 405,
                'message': 'Training data already exist.',
            })
        create_vector(result)
        chat = insert_train_chat(chatbot, trainid)
        return jsonify({
            'success': True,
            'code': 200,
            'data': chat,
            'message': "create train successfully",
        })
    else:
        return jsonify({
            'success': False,
            'code': 401,
            'message': "No more creating training data!",
        })


@train.route('/api/data/sendfile', methods=['POST'])
def create_train_file():
    try:
        file = request.files.get('file', None)
        chatbot = request.form.get('chatbot', None)

        if not file or not chatbot:
            return {"success": False, "message": "Invalid file or chatbot data"}, 400

        filename = secure_filename(file.filename)
        file.save(filename)

        with open(filename, 'rb') as f:
            if (filename.split('.')[-1] == 'pdf'):
                output = parse_pdf(f)
            elif (filename.split('.')[-1] == 'csv'):
                output = parse_csv(f)
            elif (filename.split('.')[-1] == 'docx'):
                output = parse_docx(f)
            elif filename.split('.')[-1] in ['srt', 'txt', 'md', 'json']:
                output = parse_srt(f)
            elif (filename.split('.')[-1] == 'epub'):
                output = parse_epub(filename)
            os.remove(filename)

            ct = 0
            for text in output:
                ct += count_tokens(text)
            if compare_role_user(chatbot):
                if compare_token_words(ct, chatbot):
                    result = text_to_docs(output, filename, chatbot)
                    trainid = create_train(filename, 'file', True, chatbot)
                    if (trainid == False):
                        return jsonify({
                            'success': False,
                            'code': 401,
                            'message': 'Training data already exist.',
                        })
                    create_vector(result)

                    chat = insert_train_chat(chatbot, trainid)
                    return jsonify({
                        'success': True,
                        'code': 200,
                        'data': chat,
                        'message': "create train successfully",
                    })
                return jsonify({
                    'success': False,
                    'code': 401,
                    'message': "Training word limit exceeded. Please reduce the number of training words.",
                })
            else:
                return jsonify({
                    'success': False,
                    'code': 401,
                    'message': "No more creating training data!",
                })

    except Exception as e:
        return {"success": False, "message": str(e)}, 400


@train.errorhandler(RequestEntityTooLarge)
def handle_request_entity_too_large(error):
    return jsonify({'error_message': 'File size too large. Maximum allowed size is 16MB.'}), 413


@train.route('/api/data/gettraindatas', methods=['POST'])
def get_traindatas():
    uuid = request.json['uuid']
    chat = db.session.query(Chat).filter_by(uuid=uuid).first()
    if not chat:
        return jsonify({'success': False, 'message': 'Not found', 'code': 404})
    train_ids = json.loads(chat.train)

    data = []
    for id in train_ids:
        train_data = db.session.query(Train).filter_by(id=id).first()
        if train_data:
            data.append({'id': train_data.id, 'label': train_data.label,
                    'type': train_data.type, 'status': train_data.status})
    return jsonify({'data': data, 'success': True})


@train.route('/api/data/deletetrain', methods=['POST'])
def delete_traindatas():
    uuid = request.json['uuid']
    id = request.json['id']
    chat = db.session.query(Chat).filter_by(uuid=uuid).first()
    train_ids = json.loads(chat.train)
    train_ids.remove(id)
    chat.train = json.dumps(train_ids)
    source = db.session.query(Train).filter_by(id=id).first()
    # delete vectors in the pinecone
    delete_vectore(source.label, uuid)
    db.session.query(Train).filter_by(id=id).delete()
    db.session.commit()
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
    }
    data = {
        'code': 200,
        'message': "Succesfullu delete",
        'data': chat_data,
        'success': True
    }
    return jsonify(data)


@train.route('/api/data/deletetrain_vectore', methods=['POST'])
def delete_pinecone_vectore():

    password = request.json['password']
    source = request.json['source']
    if password == 'QWE@#$asd234':
        delete_vectore(source)
        return jsonify({'data': 'okay'})
    return jsonify({'data': 'You are unautherize'})
