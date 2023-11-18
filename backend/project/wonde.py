from flask import Blueprint, jsonify, request
import requests
import io
import os
import json
import pandas as pd
from dotenv import load_dotenv
from .models import User
from . import db
import re
import base64
import uuid
import shutil
from pandasai import SmartDataframe
from langchain.chat_models import ChatOpenAI
import threading


load_dotenv()
wonde = Blueprint('wonde', __name__)

task_status = {}

@wonde.route('/api/wonde/sendapikey', methods=['POST'])
def init_wonde_api():
    id = request.json.get('id')
    apikey = request.json.get('apikey')
    user = db.session.query(User).filter_by(id=id).first()
    if user.role != 7:
        return jsonify({'success': False, 'message': 'You do not have permission'})

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

    def long_running_task(apikey, user):
        global task_status
        df = make_csv_file(apikey)
        if df is not None:
            df.to_csv(f'wonde_csvs/{user.id}students.csv', index=False)
            task_status[user.id] = 'done'

    threading.Thread(target=long_running_task, args=(apikey, user)).start()
    task_status[user.id] = 'processing'

    return jsonify({'success': True, 'message': 'Successful! Now you can read the data from the Wonde.'})

@wonde.route('/api/wonde/taskstatus/<id>', methods=['GET'])
def get_task_status(id):
    status = task_status.get(id, 'not started')
    return jsonify({'status': status})


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
    keys_to_ignore = {'date', 'timezone_type', 'timezone', 'created_at', 'end_date', 'start_date', 'collection_date', 'result_date', 'updated_at', 'restored_at', 'recorded_date', 'achievement_date', 'action_date', 'incident_date', 'id', 'mis_id', 'resultset', 'student', 'meta', 'code', 'admission_number', 'upn', 'local_upn', 'former_upn', 'learner_number', 'admission_date', 'leaving_date', 'student_id', 'fsm_review_date', 'upi'}

    if isinstance(d, dict):
        return {k: sanitize_data(v) for k, v in d.items() if k not in keys_to_ignore}
    elif isinstance(d, list):
        return [sanitize_data(v) for v in d]
    else:
        return d


def make_csv_file(api_token):
    headers = {'Authorization': f'Bearer {api_token}'}

    response = requests.get(
            f'https://api.wonde.com/v1.0/schools',
            headers=headers
        )
    response.raise_for_status()
    data = response.json().get('data', [])
    print(data[0].get('id'))
    school_id = data[0].get('id')
    if school_id is not None:
        students = []
        
        st_includes = [
            "classes",
            "classes.subject",
            "education_details",
            "contact_details",
            "attendance_summary",
            "extended_details",
            "contacts.contact_details",
            "year",
            "groups",
            "sen_needs",
            "permissions",
            "identifiers",
            "behaviours",
            "achievements",
            "results",
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
                id  = student.get('id')
                print('ID: ', id)
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
                cleaned_data['contact_details'] = cleaned_data['contact_details']['data']
                cleaned_data['education_details'] = cleaned_data['education_details']['data']
                cleaned_data['extended_details'] = cleaned_data['extended_details']['data']
                cleaned_data['groups'] = cleaned_data['groups']['data']
                cleaned_data['identifiers'] = cleaned_data['identifiers']['data']
                cleaned_data['permissions'] = cleaned_data['permissions']['data']
                cleaned_data['results'] = cleaned_data['results']['data']
                cleaned_data['sen_needs'] = cleaned_data['sen_needs']['data']
                cleaned_data['year'] = cleaned_data['year']['data']
                dataLakes.append(cleaned_data)
            
            updated_dict_list = [{k: v for k, v in d.items() if v is not None} for d in dataLakes]

            changed_data = []
            for item in updated_dict_list:
                new_item = {}
                for key, value in item.items():
                    if isinstance(value, list):
                        new_key = {}
                        for i, achievement in enumerate(value, 1):
                            if 'total_points' in achievement:
                                del achievement['total_points']
                            new_key[f'{key}_{i}'] = achievement
                        new_item.update(new_key)
                    else:
                        new_item[key] = value
                changed_data.append(new_item)

            df = pd.json_normalize(changed_data)
            df.head()
            df.dropna(axis=1, how='all', inplace=True)
            return df
        else:
            return None
    return None


@wonde.route('/api/wonde/webhook', methods=['POST'])
def get_webhook():
    data = request.json
    print(data)
    return Response(status=200)

def sanitize_data(d):
    # A set of keys to ignore from the data
    keys_to_ignore = {'date', 'timezone_type', 'timezone', 'created_at', 'end_date', 'start_date', 'collection_date', 'result_date', 'updated_at', 'restored_at', 'recorded_date', 'achievement_date', 'action_date', 'incident_date', 'id', 'mis_id', 'resultset', 'student', 'meta', 'code', 'admission_number', 'upn', 'local_upn', 'former_upn', 'learner_number', 'admission_date', 'leaving_date', 'student_id', 'fsm_review_date', 'upi'}

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
                    print(f"Removing empty directory: {full_path}")
                    shutil.rmtree(full_path)
                except Exception as e:
                    print(f"Failed to remove {full_path}. Reason: {e}")

    return "Cleanup completed."

def answer_question(prompt, message_id, user_id):
    csv_file_path = f'wonde_csvs/{user_id}students.csv'
    if os.path.exists(csv_file_path):

        file_link = None
        print(cleanup_empty_folders('exports/charts/'))
        llm = ChatOpenAI(model_name="gpt-4-1106-preview", temperature=0, openai_api_key=os.getenv('OPENAI_API_KEY_PRO'))
        
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
