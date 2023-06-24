from langchain.callbacks import get_openai_callback
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from rich import print, pretty
from gptcache import Cache
from gptcache.manager.factory import manager_factory
from gptcache.processor.pre import get_prompt
from langchain.cache import GPTCache
import langchain
import hashlib
import time
import os
from dotenv import load_dotenv
from langchain import PromptTemplate, LLMChain

pretty.install()


def generate_message(query, history, behavior, temp):
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
            behavior=behavior
        )
        chat_history.append({"role": "ai", "content": response})
        token = cb.total_tokens
        return response, chat_history, token


# my_class = MyClass(0.3)
# history = {"human": [], "ai": []}
# behavior = input("\nInput behavior here: ")
# while True:

#     query = input("\nInput query here: ")
#     start_time = time.time()

#     response, history, token = my_class.generate_message(
#         query, history, behavior)
#     end_time = time.time()
#     wall_time = end_time - start_time
#     print(response, history, token, f"Wall time: {wall_time} s")
