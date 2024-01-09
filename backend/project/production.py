from flask import Blueprint, render_template, request, jsonify
from .models import Production, User
from . import db
from rich import print, pretty
import os
import json
import stripe
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
pretty.install()
product = Blueprint('product', __name__)


@product.route('/api/getallproducts', methods=['POST'])
def get_all_product():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    current_user = {}
    if user is not None:
        return jsonify({
            'success': False,
            'code': 500,
            'message': 'No Data'
        })
    if user.subscription_id:
        subscription = stripe.Subscription.retrieve(user.subscription_id)
        if subscription['status'] != 'past_due' and subscription['status'] != 'canceled' and subscription['status'] != 'unpaid':
            current_user = {
                'subscription_id': user.subscription_id,
                'price_id': subscription['items']['data'][0]['price']['id'],
                'product_id': subscription['items']['data'][0]['price']['product']
            }
    productions = db.session.query(Production).all()
    sorted_productions = sorted(productions, key=lambda p: p.id)
    new_production = []
    for production in sorted_productions:
        price = stripe.Price.retrieve(production.price_id)
        data = {
            'id': production.id,
            'price': price.unit_amount/100,
            'price_id': production.price_id,
            'name': production.name,
            'description': json.loads(production.description)
        }
        new_production.append(data)
    current_user['data'] = new_production

    return jsonify({
        'success': True,
        'data': current_user,
        'code': 200
    })

@product.route('/api/updateproducts', methods=['POST'])
def update_product():
    id = request.json['id']
    price_id = request.json['price_id']
    name = request.json['name']
    price = request.json['price']
    description = request.json['description']
    product = db.session.query(Production).filter_by(id=id).first()
    if product:
        product.price_id = price_id
        product.name = name
        product.price = price
        product.description = json.dumps(description)
        db.session.commit()
    return jsonify({
        'success': True
    })



@product.route('/api/createproduct', methods=['POST'])
def create_product():
    price_id = request.form['price_id']
    name = request.form['name']
    description = json.dumps(request.form['description'])
    production = Production(price_id=price_id, name=name,
                            description=description)
    db.session.add(production)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Create the production successfully!',
        'code': 200
    })
