from langchain.callbacks import get_openai_callback
from langchain.chat_models import ChatOpenAI
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
            manager="map", data_dir=f"map_cache_{hashed_llm}"),
    )


def generate_message(query, history, behavior, temp, model, chat, trains=[]):
    load_dotenv()

    template = """ {behavior}

    Training data: {examples}

    Chathistory: {history}
    Human: {human_input}
    Assistant:"""

    prompt = PromptTemplate(
        input_variables=["history", "examples", "human_input", "behavior"], template=template)

    langchain.llm_cache = GPTCache(init_gptcache)
    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))

    conversation = LLMChain(
        llm=llm,
        verbose=True,
        prompt=prompt
    )
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
    docsearch = Pinecone.from_existing_index(
        index_name=PINECONE_INDEX_NAME, embedding=embeddings)
    docs = docsearch.similarity_search_with_score(query=query, k=5)

    examples = ""
    for doc, _ in docs:
        for source in trains:
            if doc.metadata['source'] == source and doc.metadata['chat'] == str(chat):
                examples += doc.page_content + '\n'

    with get_openai_callback() as cb:

        chat_history = history
        chat_history.append({"role": "human", "content": query})
        response = conversation.run(
            human_input=query,
            history=history,
            behavior=behavior,
            examples=examples
        )

        chat_history.append({"role": "ai", "content": response})
        token = cb.total_tokens
        return response, chat_history, token


def generate_AI_message(query, history, behavior, temp, model):
    load_dotenv()

    template = """ {behavior}

    {history}
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
                manager="map", data_dir=f"map_cache_{hashed_llm}"),
        )

    langchain.llm_cache = GPTCache(init_gptcache)

    if model == "1":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "2":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo-16k",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))
    elif model == "3":
        llm = ChatOpenAI(model_name="gpt-3.5-turbo",
                         temperature=temp,
                         openai_api_key=os.getenv('OPENAI_API_KEY'))

    conversation = LLMChain(
        llm=llm,
        verbose=True,
        prompt=prompt
    )

    with get_openai_callback() as cb:

        chat_history = history
        chat_history.append({"role": "human", "content": query})
        response = conversation.run(
            human_input=query,
            history=history,
            behavior=behavior,
        )

        chat_history.append({"role": "ai", "content": response})
        token = cb.total_tokens
        return response, chat_history, token


def generate_Bubble_message(query):
    load_dotenv()
    chat = ChatOpenAI(model_name="gpt-3.5-turbo",
                      temperature=0.3,
                      openai_api_key=os.getenv('OPENAI_API_KEY'))
    return chat.predict(query)
