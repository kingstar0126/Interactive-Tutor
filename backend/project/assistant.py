import json
from dotenv import load_dotenv
import os
from .wonde import cleanup_empty_folders
from openai import OpenAI
import time
import uuid
import openai
import re
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
    cleanup_empty_folders('exports/charts/')
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
            name="Data Analtze",
            instructions="You are a personal data analytics instructor. Please provide detailed information about the prompt in the uploaded file.",
            model="gpt-4-1106-preview",
            tools=[{"type": "code_interpreter"}],
            file_ids=[_file.id]
        )
        return assistant.id, _file.id

def delete_assistant_file(assistant_id, file_id):
    response = client.beta.assistants.files.delete(
                assistant_id=assistant_id,
                file_id=file_id
            )
    client.files.delete(file_id)
    print(response, '\n', assistant_id, '\n', file_id)
    # assistants = client.beta.assistants.list()    
    # delete_all_assistants(assistants)
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

def create_image_prompt(prompt):

    print(prompt)
    try:
        response = client.chat.completions.create(
            model='gpt-4-1106-preview',
            
            messages=[
                {"role": "system", "content": '''
                I want you generate the perfect and detail prompt for dalle.

                Change the user's prompt to the perfect and good prompt.

                Here is the formula of the perfect and detail prompt.

                Prompt = subject + activity + background + light + angle + style.

                1. Be Specific and Detailed: The more specific your prompt, the better the image quality. Include details like the setting, objects, colors, mood, and any specific elements you want in the image. If the object is a person or anthropomorphic object, describe it in more detail, including the head, body, background, etc.
                2. Mood and Atmosphere: Describe the mood or atmosphere you want to convey. Words like “serene,” “chaotic,” “mystical,” or “futuristic” can guide the AI in setting the right tone.
                3. Use Descriptive Adjectives: Adjectives help in refining the image. For example, instead of saying “a dog,” say “a fluffy, small, brown dog.”
                4. Consider Perspective and Composition: Mention if you want a close-up, a wide shot, a bird’s-eye view, or a specific angle. This helps in framing the scene correctly.
                5. Specify Lighting and Time of Day: Lighting can dramatically change the mood of an image. Specify if it’s day or night, sunny or cloudy, or if there’s a specific light source like candlelight or neon lights.
                6. Incorporate Action or Movement: If you want a dynamic image, describe actions or movements. For instance, “a cat jumping over a fence” is more dynamic than just “a cat.”
                7. Avoid Overloading the Prompt: While details are good, too many can confuse the AI. Try to strike a balance between being descriptive and being concise.
                8. Use Analogies or Comparisons: Sometimes it helps to compare what you want with something well-known, like “in the style of Van Gogh” or “resembling a scene from a fantasy novel.”
                9. Specify Desired Styles or Themes: A super reality, digital artist, Movie Poster or Cartoon, yet with a detailed and clear style. not style like painting.

                Only output the updated prompt and don't response any description.'''},
                {"role": "user", "content": f"{prompt}"},
            ]

        )
        print(response)
        return response.choices[0].message.content
    except Exception as e:
        print('This is the Error: ', e)
        return None

def create_image_file(prompt):
    try:
        prompt = create_image_prompt(prompt)
        response = client.images.generate(
            model="dall-e-3",
            style="vivid",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            response_format="url",
            n=1
        )
        print(response)

        image_url=response.data[0].url
        return f"![image]({image_url})"
    except openai.BadRequestError as e:
        print(e)
        dict_str = re.search(r"\{.*\}", str(e)).group()
        dict_obj = eval(dict_str)
        message = dict_obj['error']['message']
        return message
#############################################

def delete_all_assistants(items):
    assistants = items.data
    for assistant in assistants:
        if assistant.file_ids:
            file_id = assistant.file_ids[0]
            client.beta.assistants.files.delete(assistant_id=assistant.id, file_id=file_id)

        client.beta.assistants.delete(assistant.id)
