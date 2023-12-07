from flask import Blueprint, jsonify


health_check = Blueprint('health_check', __name__)


@health_check.route('/health-check',  methods=['GET'])
def healthCheckSetup():
    return jsonify({
            'success': True,
            'code': 200,
            'message': 'Application is now up',
        })
