import os
import json
import base64
import requests
import langchain
from langchain.chat_models import ChatOpenAI
from typing import Sequence
from threading import Thread
from queue import Queue, Empty
from langchain.callbacks.base import BaseCallbackHandler
from typing import Any, Callable
from langchain.vectorstores.pinecone import Pinecone
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate, ChatPromptTemplate
import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from openai import OpenAI
from langchain.chains.openai_functions import (
    create_structured_output_runnable,
)
from langchain.pydantic_v1 import BaseModel, Field



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

def generate_message(query, behavior, temp, model, chat, template, openai_api_key = None):
    load_dotenv()

    if openai_api_key is None:
        openai_api_key = os.getenv('OPENAI_API_KEY')

    q = Queue()
    job_done = object()
    print('This is template : \n\n', template)
    prompt = PromptTemplate(
        input_variables=["context", "question"], template=template)
    chain_type_kwargs = {"prompt": prompt}

    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=openai_api_key)
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-1106",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=openai_api_key)
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-4-1106-preview",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=openai_api_key)


    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
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
            next_token = q.get(True, timeout=0)
            if next_token is job_done:
                break
            content += next_token
            yield next_token, content
        except Empty:
            continue


def generate_AI_message(query, history, behavior, temp, model, openai_api_key):
    load_dotenv()

    if openai_api_key is None:
        openai_api_key = os.getenv('OPENAI_API_KEY')


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
                         openai_api_key=openai_api_key)
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-1106",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=openai_api_key)
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-4-1106-preview",
                         temperature=temp,
                         streaming=True,
                         callbacks=[QueueCallback(q)],
                         openai_api_key=openai_api_key)


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
            next_token = q.get(True, timeout=0)
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

    llm = ChatOpenAI(model_name="gpt-3.5-turbo-1106",
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

def image_understanding(image_files, prompt):
    base64_images = [base64.b64encode(image_file.read()).decode('utf-8') for image_file in image_files]
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    image_prompt = [{
                        "type": "text",
                        "text": prompt
                    }]
    for base64_image in base64_images:
        image_prompt.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                    })
    content = ""
    response = client.chat.completions.create(
        model="gpt-4-vision-preview",
        temperature=0.3,
        stream=True,
        max_tokens=4000,
        messages=[
            {
            "role": "user",
            "content": image_prompt
            }
        ])
    
    for chunk in response:
        next_token = chunk.choices[0].delta.content
        if next_token is not None:
            content += next_token
            yield next_token, content