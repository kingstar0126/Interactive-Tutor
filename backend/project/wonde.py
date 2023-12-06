from flask import Blueprint, jsonify, request
import requests
import io
import os
import json
import pandas as pd
from dotenv import load_dotenv
from .models import User, Chat, Train
from . import db
import re
import base64
import uuid
import shutil
from pandasai import SmartDataframe
from langchain.chat_models import ChatOpenAI
import threading
from threading import Lock
from . import app
import numpy as np

from langchain.agents import AgentType, initialize_agent
from langchain.tools import E2BDataAnalysisTool

from langchain_experimental.agents.agent_toolkits import create_csv_agent
from .train import create_train, insert_train_chat, train_status_chanage

load_dotenv()
wonde = Blueprint('wonde', __name__)

lock = Lock()

@wonde.route('/api/wonde/sendapikey', methods=['POST'])
def init_wonde_api():
    id = request.json.get('id')
    apikey = request.json.get('apikey')
    chatbot = request.json.get('chatbot')
    user = db.session.query(User).filter_by(id=id).first()
    if user.role != 7:
        return jsonify({'success': False, 'message': 'You do not have permission'})

    # user.wonde_key = apikey
    # db.session.commit()

    headers = {'Authorization': f'Bearer {apikey}'}
    response = requests.get(
            f'https://api.wonde.com/v1.0/schools',
            headers=headers
        )
    data = response.json().get('data')
    if data is None:
        return jsonify({'success': False, 'message': 'Your API key is not correct'})
    school_id = data[0].get('id')
    if school_id is None:
        return jsonify({'success': False, 'message': 'Your API key is not correct'})
    user.wonde_key = apikey
    db.session.commit()

    train_id = create_train('Wonde API', 'API', True, chatbot)
    chat = insert_train_chat(chatbot, train_id)
    return jsonify({'success': True, 'message': 'Successful!', 'data': chat})


@wonde.route('/api/wonde/getapikey', methods=['POST'])
def get_wonde_api():
    id = request.json.get('id')
    user = db.session.query(User).filter_by(id=id).first()
    apikey = user.wonde_key
    
    if apikey is None:
        apikey = ''
    return jsonify({'success': True, 'data': apikey})

def sanitize_data(d):
    # A set of keys to ignore from the data
    keys_to_ignore = {'date', 'timezone_type', 'timezone', 'created_at', 'end_date', 'start_date', 'collection_date', 'result_date', 'updated_at', 'restored_at', 'recorded_date', 'achievement_date', 'action_date', 'incident_date', 'id', 'mis_id', 'resultset', 'student', 'meta', 'code', 'admission_number', 'upn', 'local_upn', 'former_upn', 'learner_number', 'admission_date', 'leaving_date', 'student_id', 'fsm_review_date', 'upi', 'priority', 'notes', 'division', 'min_value', 'max_value', 'initials'}

    if isinstance(d, dict):
        return {k: sanitize_data(v) for k, v in d.items() if k not in keys_to_ignore}
    elif isinstance(d, list):
        return [sanitize_data(v) for v in d]
    else:
        return d


@wonde.route('/api/wonde/webhook', methods=['POST'])
def get_webhook():
    data = request.json
    return Response(status=200)

def sanitize_data(d):
    # A set of keys to ignore from the data
    keys_to_ignore = {'date', 'timezone_type', 'timezone', 'created_at', 'end_date', 'start_date', 'collection_date', 'result_date', 'updated_at', 'restored_at', 'recorded_date', 'achievement_date', 'action_date', 'incident_date', 'id', 'mis_id', 'resultset', 'student', 'meta', 'code', 'admission_number', 'upn', 'local_upn', 'former_upn', 'learner_number', 'admission_date', 'leaving_date', 'student_id', 'fsm_review_date', 'upi', 'priority', 'notes', 'division', 'min_value', 'max_value', 'initials'}

    if isinstance(d, dict):
        return {k: sanitize_data(v) for k, v in d.items() if k not in keys_to_ignore}
    elif isinstance(d, list):
        return [sanitize_data(v) for v in d]
    else:
        return d

def check_files_in_folder(full_chart_path):
    if os.path.exists(full_chart_path):
        if os.path.isdir(full_chart_path):
            files = os.listdir(full_chart_path)
            files = [f for f in files if os.path.isfile(os.path.join(full_chart_path, f))]
            if files:
                return files[0]
            else:
                return None
        else:
            return None
    else:
        return None

def cleanup_empty_folders(path):
    # Check if the path exists
    if not os.path.exists(path):
        return "The directory does not exist."

    # Check if the path is a directory
    if not os.path.isdir(path):
        return "The path is not a directory."

    # Walk through all subdirectories
    for root, dirs, _ in os.walk(path, topdown=False):
        # Check each subdirectory
        for name in dirs:
            full_path = os.path.join(root, name)
            # If the subdirectory is empty, remove it
            if not os.listdir(full_path):
                try:
                    shutil.rmtree(full_path)
                except Exception as e:
                    print(f"Failed to remove {full_path}. Reason: {e}")

    return "Cleanup completed."

def answer_question(prompt, message_id, user_id):
    csv_file_path = f'wonde_csvs/{user_id}students.csv'
    if os.path.exists(csv_file_path):

        file_link = None
        print(cleanup_empty_folders('exports/charts/'))
        llm = ChatOpenAI(model_name="gpt-4-1106-preview", temperature=0, openai_api_key=os.getenv('OPENAI_API_KEY'))
        
        chart_id = str(uuid.uuid4())
        df = pd.read_csv(csv_file_path)
        full_chart_path = f"exports/charts/{message_id}/{chart_id}/"
        agent = SmartDataframe(df, config={"llm":llm, 'verbose':True, 'max_retries': 6, 'save_charts':True, "custom_whitelisted_dependencies": ["any_module"], "enable_cache": False, "save_charts_path": full_chart_path})

        try:
            response = agent.chat(prompt)
            if response is None:
                file_link = f'![chart](http://18.133.183.77/image/{full_chart_path}/{check_files_in_folder(full_chart_path)})'
            
            print('\n\n', f'human: {prompt} \n output: {response}')
            return f'human: {prompt} \n output: {response}', file_link
        except Exception as e:
            return str(e), file_link
    else:
        return None, None

def search_data_in_wonde(keys, wondekey):
    print('This is the wondekey', wondekey)
    headers = {'Authorization': f'Bearer {wondekey}'}
    response = requests.get(
            f'https://api.wonde.com/v1.0/schools',
            headers=headers
        )
    data = response.json().get('data')
    for item in data:
        school_id = item.get('id')
        response = requests.get(f'https://api.wonde.com/v1.0/schools/{school_id}/students', headers=headers)
        print('This is the response of Requests test: ', response.status_code)
        if response.status_code == 200:
            students = []
            
            st_includes = [
                "classes",
                "classes.subject",
                "attendance_summary",
                "year",
                "groups",
                "sen_needs",
                "behaviours",
                "achievements",
                "results",
                "medical_notes",
                "results.aspect"
            ]
            page = 1
            per_page = 100
            while True:
                response = requests.get(
                    f'https://api.wonde.com/v1.0/schools/{school_id}/students?per_page={per_page}&page={page}',
                    headers=headers
                )
                response.raise_for_status()
                data = response.json().get('data', [])
                if not data:
                    break
                for student in data:
                    if student.get('forename') is None or student.get('surname') is None:
                        break
                    for key in keys:
                        names = key.split()
                        if len(names) > 1:
                            if student.get('forename').lower() == names[0].lower() and student.get('surname').lower() == names[-1].lower():
                                id  = student.get('id')
                                response = requests.get(
                                    f'https://api.wonde.com/v1.0/schools/{school_id}/students/{id}/?include={",".join(st_includes)}',
                                    headers=headers
                                )
                                response.raise_for_status()
                                student_related_data = response.json()
                                print('This is student_related_data: \n', student_related_data)
                                students.append(student_related_data)
                        else:
                            if student.get('forename').lower() == names[0].lower() or student.get('surname').lower() == names[0].lower():
                                id  = student.get('id')
                                response = requests.get(
                                    f'https://api.wonde.com/v1.0/schools/{school_id}/students/{id}/?include={",".join(st_includes)}',
                                    headers=headers
                                )
                                response.raise_for_status()
                                student_related_data = response.json()
                                students.append(student_related_data)
                page += 1

            dataLakes = []
            if students:
                for item in students:
                    data = item.get('data')
                    cleaned_data = sanitize_data(data)
                    cleaned_data['achievements'] = cleaned_data['achievements']['data']
                    cleaned_data['attendance_summary'] = cleaned_data['attendance_summary']['data']
                    cleaned_data['behaviours'] = cleaned_data['behaviours']['data']
                    cleaned_data['classes'] = cleaned_data['classes']['data']
                    print('This is classes: \n\n', cleaned_data['classes'])
                    for i in range(len(cleaned_data['classes'])):
                        print('This is type of i: ', cleaned_data['classes'][i])
                        cleaned_data['classes'][i]['subject.data.name'] = cleaned_data['classes'][i]['subject']['data']['name']
                        cleaned_data['classes'][i]['subject.data.active'] = cleaned_data['classes'][i]['subject']['data']['active']
                        del cleaned_data['classes'][i]['subject']
                    cleaned_data['groups'] = cleaned_data['groups']['data']
                    cleaned_data['results'] = cleaned_data['results']['data']
                    for i in range(len(cleaned_data['results'])):
                        cleaned_data['results'][i]['aspect.data.name'] = cleaned_data['results'][i]['aspect']['data']['name']
                        cleaned_data['results'][i]['aspect.data.type'] = cleaned_data['results'][i]['aspect']['data']['type']
                        del cleaned_data['results'][i]['aspect']
                    cleaned_data['sen_needs'] = cleaned_data['sen_needs']['data']
                    cleaned_data['year'] = cleaned_data['year']['data']
                    dataLakes.append(cleaned_data)
                
                return dataLakes
            else:
                return None
    return None

def answer_question_csv(prompt, user_id):
    from .generate_response import get_name_from_prompt
    search_keys = get_name_from_prompt(prompt)

    user = db.session.query(User).filter_by(id=user_id).first()
    wonde_key = user.wonde_key
    
    if wonde_key is None:
        return None
    result = search_data_in_wonde(search_keys, wonde_key)
    if result is not None:
        if len(result) > 1:
            student_names = "\n".join([f"{student['forename']} {student['surname']}" for student in result])
            data = f'''There are several students with the same name. Please specify by providing the full name of the student. Here are the options:\n{student_names}'''
        else:
            data = result[0]
    else:
        data = None
    return data