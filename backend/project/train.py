from flask import Blueprint, jsonify, request
from . import db
from rich import print, pretty
import datetime
from bs4 import BeautifulSoup
import requests
import os
import json
from .models import Chat, Train
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

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
openai.openai_api_key = OPENAI_API_KEY

pretty.install()

train = Blueprint('train', __name__)


def delete_vectore(source):
    index = pinecone.Index(PINECONE_INDEX_NAME)
    print("\n\n", source)
    return index.delete(
        filter={
            "source": f"{source}",
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
        output.append(text)
    return output


def parse_csv(file):
    df = pd.read_csv(file)
    text = []
    text.append(df.to_string(index=False))
    return text


def parse_docx(file):
    doc = docx.Document(file)
    fullText = []
    for para in doc.paragraphs:
        fullText.append(para.text)
    return '\n'.join(fullText)

# This is that change the .srt, .txt, .json, .md


def parse_srt(file):
    lines = file.readlines()
    text = []
    for line in lines:
        text.append(line)
    return (text)


def parse_epub(file):
    print(file)
    file.save(file.filename)
    book = epub.read_epub(file.filename)
    text = []
    for item in book.get_items():
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            bodyContent = item.get_body_content().decode()
            soup = BeautifulSoup(bodyContent, 'html.parser')
            text_ = [para.get_text(strip=True) for para in soup.find_all(
                ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'ul', 'ol'])]
            text.extend(text_)
    os.remove(file.filename)
    return (text)


def text_to_docs(text: str, filename: str) -> List[Document]:
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
            chunk_size=400,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
            chunk_overlap=0,
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
            doc_chunks.append(doc)
    return doc_chunks


def web_scraping(url):
    response = requests.get(url)
    if response.status_code != 200:
        return False
    soup = BeautifulSoup(response.content, 'html.parser')
    all_strings = [
        tag.string
        for tag in soup.find_all(
            ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'li', 'code']
        )
    ]
    text = [string.strip() for string in all_strings if string is not None]
    return text


def create_train(label, _type, status):

    if train := Train.query.filter_by(label=label).first():
        return False
    new_train = Train(label=label, type=_type, status=status)
    db.session.add(new_train)
    db.session.flush()
    db.session.commit()

    return new_train.id


def insert_train_chat(chatbot, train_id):
    current_chat = Chat.query.filter_by(uuid=chatbot).first()
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
    data = web_scraping(url)
    if data == False:
        return jsonify({
            'success': False,
            'code': 405,
            'message': 'Invalid URL.',
        })

    trainid = create_train(url, 'url', True)

    result = text_to_docs(data, url)
    create_vector(result)
    print(result)
    if (trainid == False):
        return jsonify({
            'success': False,
            'code': 405,
            'message': 'Training data already exist.',
        })
    chat = insert_train_chat(chatbot, trainid)
    return jsonify({
        'success': True,
        'code': 200,
        'data': chat,
        'message': "create train successfully",
    })


@train.route('/api/data/sendtext', methods=['POST'])
def create_train_text():
    text = request.json['text']
    chatbot = request.json['chatbot']
    trainid = create_train(text[:20], 'text', True)
    result = text_to_docs(text, text[:20])
    create_vector(result)
    if (trainid == False):
        return jsonify({
            'success': False,
            'code': 405,
            'message': 'Training data already exist.',
        })
    chat = insert_train_chat(chatbot, trainid)
    
    return jsonify({
        'success': True,
        'code': 200,
        'data': chat,
        'message': "create train successfully",
    })


@train.route('/api/data/sendfile', methods=['POST'])
def create_train_file():

    file = request.files['file']
    chatbot = request.form.get('chatbot')
    print("\n\nThis is the file name ->", file, chatbot)
    if (file.filename.split('.')[-1] == 'pdf'):
        output = parse_pdf(file)
    elif (file.filename.split('.')[-1] == 'csv'):
        output = parse_csv(file)
    elif (file.filename.split('.')[-1] == 'docx'):
        output = parse_docx(file)
    elif file.filename.split('.')[-1] in ['srt', 'txt', 'md', 'json']:
        output = parse_srt(file)
    elif (file.filename.split('.')[-1] == 'epub'):
        output = parse_epub(file)
    print(output)
    result = text_to_docs(output, file.filename)
    print(result)
    create_vector(result)
    trainid = create_train(file.filename, 'file', True)

    if (trainid == False):
        return jsonify({
            'success': False,
            'code': 401,
            'message': 'Training data already exist.',
        })
    chat = insert_train_chat(chatbot, trainid)
    print(chat)
    return jsonify({
        'success': True,
        'code': 200,
        'data': chat,
        'message': "create train successfully",
    })


@train.route('/api/data/gettraindatas', methods=['POST'])
def get_traindatas():
    print(request.json, "\n\n")
    uuid = request.json['uuid']
    chat = Chat.query.filter_by(uuid=uuid).first()
    train_ids = json.loads(chat.train)
    print(train_ids)
    data = []
    for id in train_ids:
        train_data = Train.query.filter_by(id=id).first()
        data.append({'id': train_data.id, 'label': train_data.label,
                    'type': train_data.type, 'status': train_data.status})
    print("----------->", data)
    return jsonify(data)


@train.route('/api/data/deletetrain', methods=['POST'])
def delete_traindatas():
    print(request.json, "\n\n")
    uuid = request.json['uuid']
    id = request.json['id']
    chat = Chat.query.filter_by(uuid=uuid).first()
    train_ids = json.loads(chat.train)
    train_ids.remove(id)
    chat.train = json.dumps(train_ids)
    source = Train.query.filter_by(id=id).first().label
    # delete vectors in the pinecone
    delete_vectore(source)
    Train.query.filter_by(id=id).delete()
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
