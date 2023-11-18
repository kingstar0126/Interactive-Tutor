from langchain.chat_models import ChatOpenAI
from typing import Sequence
from threading import Thread
from queue import Queue, Empty
from langchain.llms import OpenAI
from langchain.callbacks.base import BaseCallbackHandler
from typing import Any, Callable
import json
import langchain
import os
from langchain.vectorstores.pinecone import Pinecone
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate, ChatPromptTemplate
import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA

from pandasai import SmartDataframe
from langchain.chat_models import ChatOpenAI

from langchain.pydantic_v1 import BaseModel, Field
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import tempfile
import pandas as pd
from .wonde import cleanup_empty_folders, check_files_in_folder
import uuid
import shutil
import chardet
from io import StringIO

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_ENV = os.getenv('PINECONE_ENV')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
PINECONE_INDEX_NAME = os.getenv('PINECONE_INDEX_NAME')


class Person(BaseModel):
    """Identifying information about a person."""

    name: str = Field(..., description="The person's name")

class People(BaseModel):
    """Identifying information about all people in a text."""

    people: Sequence[Person] = Field(..., description="The people in the text")

class QueueCallback(BaseCallbackHandler):
    """Callback handler for streaming LLM responses to a queue."""

    def __init__(self, q):
        self.q = q

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.q.put(token)

    def on_llm_end(self, *args, **kwargs: Any) -> None:
        return self.q.empty()

def get_name_from_prompt(query):
    llm = ChatOpenAI(model="gpt-4-1106-preview", temperature=0)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a world class algorithm for extracting information in structured formats.",
            ),
            (
                "human",
                "Use the given format to extract information from the following input: {input}",
            ),
            ("human", "Tip: Make sure to answer in the correct format"),
        ]
    )
    runnable = create_structured_output_runnable(People, llm, prompt)
    result = runnable.invoke({"input": query})
    peoples = result.people
    print(peoples)
    names = [person.name for person in peoples]
    print('THIS IS THE NAME: ', names)
    return names

def generate_message(query, behavior, temp, model, chat, template):
    load_dotenv()
    q = Queue()
    job_done = object()
    
    prompt = PromptTemplate(
        input_variables=["context", "question"], template=template)
    chain_type_kwargs = {"prompt": prompt}

    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         streaming=True,
                         max_tokens=500,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                         temperature=temp,
                         streaming=True,
                         max_tokens=3000,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-4-1106-preview",
                         temperature=temp,
                         streaming=True,
                         max_tokens=3000,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=os.getenv('OPENAI_API_KEY_PRO'))


    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    docsearch = Pinecone.from_existing_index(
        index_name=PINECONE_INDEX_NAME, embedding=embeddings)

    docs = docsearch.similarity_search_with_score(" ", filter={"chat": str(chat)})

    qa = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=docsearch.as_retriever(search_kwargs={'filter': {"chat": str(chat)}}), chain_type_kwargs=chain_type_kwargs)
    
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
        llm = ChatOpenAI(model_name="gpt-4-1106-preview",
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

def generate_part_file(prompt, data):
    load_dotenv()
    template = '''Answer using the sentences below Context. If you cannot find an appropriate answer to the question in the Context, return "".
            Context: {{ {text} }}
            =========================
            user: {prompt}
            '''

    prompt = PromptTemplate(
        input_variables=["text", "prompt"], template=template)

    llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                     temperature=0.2,
                     openai_api_key=os.getenv('OPENAI_API_KEY'))
    conversation = LLMChain(
        llm=llm,
        prompt=prompt
    )
    response = conversation.run(
        text=data,
        prompt=prompt
    )
    return response

def get_data_from_csv(file, prompt, message_id):

    print('\n\n', file, '\n\n\n\n')
    file_link = None
    print(cleanup_empty_folders('exports/charts/'))
    llm = ChatOpenAI(model_name="gpt-4-1106-preview", temperature=0, openai_api_key=os.getenv('OPENAI_API_KEY_PRO'))
    
    chart_id = str(uuid.uuid4())
    
    rawdata = file.read()
    result = chardet.detect(rawdata)
    file_content = rawdata.decode(result['encoding'])

    df = pd.read_csv(StringIO(file_content))
    full_chart_path = f"exports/charts/{message_id}/{chart_id}/"
    agent = SmartDataframe(df, config={"llm":llm, 'verbose':True, 'max_retries': 6, 'save_charts':True, "custom_whitelisted_dependencies": ["any_module"], "enable_cache": True, "save_charts_path": full_chart_path})

    try:
        response = agent.chat(prompt)
        if response is None:
            file_link = f'![chart](http://18.133.183.77/image/{full_chart_path}/{check_files_in_folder(full_chart_path)})'
        
        print('\n\n', f'human: {prompt} \n output: {response}')
        return f'human: {prompt} \n output: {response}', file_link
    except Exception as e:
        return str(e), file_link

