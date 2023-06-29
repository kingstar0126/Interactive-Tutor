from flask import Blueprint, jsonify, request

from . import db
from rich import print, pretty
import datetime
import time
import json
pretty.install()

stripe = Blueprint('stripe', __name__)


@stripe.route('/api/createstripe', methods=['POST'])
def init_stripe():
    print(request.json)
    chat_id = request.json['id']
    behavior = request.json['behavior']
    creativity = request.json['creativity']
    conversation = request.json['conversation']
    if conversation == "":
        stripe = json.dumps([])
    else:
        stripe = json.dumps([{"role": "ai", "content": conversation}])
    new_stripe = stripe(chat_id=chat_id, stripe=stripe,
                        behavior=behavior, creativity=creativity)
    db.session.add(new_stripe)
    db.session.commit()
    response = {'success': True, 'code': 200,
                'stripe': "Successfuly created", 'data': new_stripe.uuid}
    return jsonify(response)
