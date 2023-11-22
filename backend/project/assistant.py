import json
from dotenv import load_dotenv
import os
from openai import OpenAI
import time
import uuid
import shutil

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def submit_message(assistant_id, thread, user_message):
    client.beta.threads.messages.create(
        thread_id=thread.id, role="user", content=user_message
    )
    return client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id,
    )

def get_response(thread):
    return client.beta.threads.messages.list(thread_id=thread.id, order="asc")
    
def create_thread_and_run(assistant_id, user_input):
    thread = client.beta.threads.create()
    run = submit_message(assistant_id, thread, user_input)
    return thread, run
    
def show_answer(response, thread, uuid):
    m = response.data[-1]
    last_printed_text = None # Variable to remember the last printed text
    file_path = None
    full_chart_path = f"exports/charts/{uuid}"
    if not os.path.exists(full_chart_path):
        os.makedirs(full_chart_path)

    for data in m.content:
        if data.type == "text":
            last_printed_text = data.text.value
        else:
            data_type = data.type
            specific_data = getattr(data, data_type, None)
            if specific_data is not None and hasattr(specific_data, 'file_id'):
                file_id = specific_data.file_id
                file_data = client.files.content(file_id)
                file_data_byte = file_data.read()
                with open(f"{full_chart_path}/{file_id}.png", "wb") as file:
                    file.write(file_data_byte)
                    file_path = f"![chart](http://18.133.183.77/image/{full_chart_path}/{file_id}.png)"
    return last_printed_text, file_path

def wait_on_run(run, thread):
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        time.sleep(0.5)
    return run


################   START  ###################
def create_assistant_file(filepath):
    with open(filepath, 'rb') as f:
        _file = client.files.create(
            file=open(
                f.name,
                "rb",
            ),
            purpose="assistants",
        )
        assistant = client.beta.assistants.create(
            name="Math Tutor",
            instructions="You are a personal math tutor. Answer questions briefly, in a sentence or less.",
            model="gpt-4-1106-preview",
            tools=[{"type": "code_interpreter"}],
            file_ids=[_file.id]
        )
        return assistant.id, _file.id

def delete_assistant_file(assistant_id, file_id):
    client.beta.assistants.files.delete(
                assistant_id=assistant_id,
                file_id=file_id
            )
    client.beta.assistants.delete(assistant_id)

def ask_question(assistant_id, prompt, thread, uuid):
    if thread is None:
        thread, run = create_thread_and_run(assistant_id, prompt)
    else:
        run = submit_message(assistant_id, thread, prompt)
    run = wait_on_run(run, thread)
    response = get_response(thread)
    text, file_path = show_answer(response, thread, uuid)
    return text, file_path, thread

#############################################
