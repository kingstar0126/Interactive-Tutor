from flask import Blueprint, jsonify
from . import db

health_check = Blueprint('health_check', __name__)

def get_system_uptime():
    try:
        with open("/proc/uptime", "r") as f:
            uptime_seconds = float(f.readline().split()[0])
            return uptime_seconds
    except Exception as e:
        return f"Error: {e}"
    
def health_database_status():
    is_database_working = True
    output = 'database is ok'

    try:
        # to check database we will execute raw query
        session = db.session.query('SELECT 1')
        
    except Exception as e:
        output = str(e)
        is_database_working = False

    return is_database_working, output


@health_check.route('/health-check',  methods=['GET'])
def healthCheckSetup():
    uptime = get_system_uptime()
    db_status = health_database_status()
    return jsonify({
            'uptime': uptime,
            'dbstatus': db_status,
            'success': True,
            'code': 200,
            'message': 'Application is now up',
        })
