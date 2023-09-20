from langchain.chat_models import ChatOpenAI

from threading import Thread
from queue import Queue, Empty
from threading import Thread
from collections.abc import Generator
from langchain.llms import OpenAI
from langchain.callbacks.base import BaseCallbackHandler
from typing import Any, Callable
import json
from gptcache import Cache
from gptcache.manager.factory import manager_factory
from gptcache.processor.pre import get_prompt
from langchain.cache import GPTCache
import langchain
import hashlib
import os
from langchain.vectorstores.pinecone import Pinecone
from dotenv import load_dotenv
from langchain import PromptTemplate, LLMChain
import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')


def get_hashed_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def init_gptcache(cache_obj: Cache, llm: str):
    hashed_llm = get_hashed_name(llm)
    cache_obj.init(
        pre_embedding_func=get_prompt,
        data_manager=manager_factory(
            manager="map", data_dir=f"map/map_cache_{hashed_llm}"),
    )

class QueueCallback(BaseCallbackHandler):
    """Callback handler for streaming LLM responses to a queue."""

    def __init__(self, q):
        self.q = q

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.q.put(token)

    def on_llm_end(self, *args, **kwargs: Any) -> None:
        return self.q.empty()

def generate_message(query, behavior, temp, model, chat, template):
    load_dotenv()
    q = Queue()
    job_done = object()

    prompt = PromptTemplate(
        input_variables=["context", "question"], template=template)
    chain_type_kwargs = {"prompt": prompt}

    langchain.llm_cache = GPTCache(init_gptcache)

    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-4",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY_PRO'))

    

    # conversation = LLMChain(
    #     llm=llm,
    #     verbose=True,
    #     prompt=prompt
    # )

    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    docsearch = Pinecone.from_existing_index(
        index_name=PINECONE_INDEX_NAME, embedding=embeddings)
    # _query = query
    # docs = docsearch.similarity_search_with_score(_query, filter={"chat": str(chat)})

    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=docsearch.as_retriever(search_kwargs={'filter': {"chat": str(chat)}}), chain_type_kwargs=chain_type_kwargs)
    

    # examples = ""
    # for doc, _ in docs:
    #     if doc.metadata['chat'] == str(chat):
    #         doc.page_content = doc.page_content.replace('\n\n', ' ')
    #         examples += doc.page_content + '\n'

    def task():
        try:
            qa.run(query)
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            q.put(job_done)

    t = Thread(target=task)
    t.start()

    content = ""

    # Get each new token from the queue and yield for our generator
    while True:
        try:
            next_token = q.get(True, timeout=1)
            if next_token is job_done:
                break
            content += next_token
            yield next_token, content
        except Empty:
            continue


def generate_AI_message(query, history, behavior, temp, model):
    load_dotenv()

    q = Queue()
    job_done = object()

    template = """ {behavior}

    ==========
    {history}
    ==========
    
    Human: {human_input}
    Assistant:"""

    prompt = PromptTemplate(
        input_variables=["history", "human_input", "behavior"], template=template)

    def get_hashed_name(name):
        return hashlib.sha256(name.encode()).hexdigest()

    def init_gptcache(cache_obj: Cache, llm: str):
        hashed_llm = get_hashed_name(llm)
        cache_obj.init(
            pre_embedding_func=get_prompt,
            data_manager=manager_factory(
                manager="map", data_dir=f"map/map_cache_{hashed_llm}"),
        )

    langchain.llm_cache = GPTCache(init_gptcache)

    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-4",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY_PRO'))
    conversation = LLMChain(
        llm=llm,
        verbose=True,
        prompt=prompt
    )

    def task():
        try:
            response = conversation.run(
                human_input=query,
                history=history,
                behavior=behavior,
            )
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            q.put(job_done)

    t = Thread(target=task)
    t.start()

    content = ""

    # Get each new token from the queue and yield for our generator
    while True:
        try:
            next_token = q.get(True, timeout=1)
            if next_token is job_done:
                break
            content += next_token
            yield next_token, content
        except Empty:
            continue


def generate_Bubble_message(query):
    load_dotenv()

    template = "Generate a title for a fantasy animal, character or fairy in {query}. A title must two words, first is adjective and second is noun. Do not provide any explanations. Do not respond with anything except the output of the title."

    prompt = PromptTemplate(
        input_variables=["query"], template=template)

    def get_hashed_name(name):
        return hashlib.sha256(name.encode()).hexdigest()

    def init_gptcache(cache_obj: Cache, llm: str):
        hashed_llm = get_hashed_name(llm)
        cache_obj.init(
            pre_embedding_func=get_prompt,
            data_manager=manager_factory(
                manager="map", data_dir=f"map/map_cache_{hashed_llm}"),
        )

    langchain.llm_cache = GPTCache(init_gptcache)

    llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                     temperature=1,
                     streaming=True,
                     openai_api_key=os.getenv('OPENAI_API_KEY'))
    conversation = LLMChain(
        llm=llm,
        verbose=True,
        prompt=prompt
    )
    response = conversation.run(
        query=query
    )
    response = response.replace('"', '')
    return response

def generate_system_prompt_role(role):
    load_dotenv()

    template = '''You are a OpenAI GPT system role expert. Your job is to analyze the needs of users and generate system roles for users' 'Interactive Tutors' that they embed to change the role of the 'tutor' powered by OpenAI API to deliver on what they need. The user will give you details on what they need the system behavior prompt to deliver. 

            Once you have this information, do not ask any further questions and please provide JSON object: A short name, description, a conversation starter and the system role written out in full.

            {{
            "name": "",
            "system_role": "",
            "starter" : "",
            "description": ""
            }}

            The system role should be well detailed, clearly detail what steps the AI should take and to use British English if communicating in English. Most importantly, the system role's maximum character length must be less than 65500.

            Consider this: The output must be a JSON object.
            =========================
            user: {role}
            '''

    prompt = PromptTemplate(
        input_variables=["role"], template=template)

    def get_hashed_name(name):
        return hashlib.sha256(name.encode()).hexdigest()

    def init_gptcache(cache_obj: Cache, llm: str):
        hashed_llm = get_hashed_name(llm)
        cache_obj.init(
            pre_embedding_func=get_prompt,
            data_manager=manager_factory(
                manager="map", data_dir=f"map/map_cache_{hashed_llm}"),
        )

    langchain.llm_cache = GPTCache(init_gptcache)

    llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                     temperature=0.2,
                     openai_api_key=os.getenv('OPENAI_API_KEY'))
    conversation = LLMChain(
        llm=llm,
        prompt=prompt
    )
    response = conversation.run(
        role=role
    )
    if type(response) == str:
        response = json.loads(response)
    return response