
import os
import pinecone
import openai
from dotenv import load_dotenv

from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Pinecone
from langchain.document_loaders import TextLoader

# Load env variables from .env file
load_dotenv()

# Get env variables
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')

# Connect to Pinecone
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
openai.openai_api_key = OPENAI_API_KEY


def text_spliter(text):
    text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=20)
    docs = text_splitter.split_documents(text)
    print(docs)


# loader = TextLoader('data.txt')
# documents = loader.load()
# print(documents)
# text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=20)

# docs = text_splitter.split_documents(documents)

# for i, data in enumerate(docs):
#     print("\nID -> ", i)
#     print("\nData -> ", data, '\n')

# print(docs)
# # Setting up embeddings provider

# embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

# # Generate embeddings using OpenAI and store them in the Pinecone index
# docsearch = Pinecone.from_documents(
#     docs, embeddings, index_name=PINECONE_INDEX_NAME)


# embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
# index = pinecone.Index(PINECONE_INDEX_NAME)


# res = index.delete(
#     filter={
#         "source": 'data.txt',
#     }
# )
# print(res)
