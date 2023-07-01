from flask import Blueprint, jsonify, request
from . import db
from .models import User
import stripe
from rich import print, pretty
import json
import os
from dotenv import load_dotenv

load_dotenv()
pretty.install()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
payment = Blueprint('payment', __name__)


# This is the create product
@payment.route('/api/create/product', methods=['POST'])
def create_product():  # sourcery skip: avoid-builtin-shadow
    req_data = request.json
    print("\n", req_data)
    # Get the required product details from the request
    id = req_data['user_id']
    user = User.query.filter_by(id=id).first()

    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson', 'code': 404})

    name = req_data['name']
    price = req_data['price']
    description = req_data['description']
    currency = req_data['currency']

    # Create the product on Stripe
    product = stripe.Product.create(
        name=name,
        description=description,
        attributes=['name']
    )

    # Create the price for the product
    stripe.Price.create(
        product=product.id,
        recurring={"interval": "month"},
        unit_amount=int(float(price) * 100),
        currency=currency
    )

    return jsonify({'message': 'Product created successfully', 'code': 200})


# This is the get all products
@payment.route('/api/getproducts', methods=['GET'])
def get_products():
    products = stripe.Product.list()
    products_with_price = []
    for product in products:
        print(product)
        if product.active == True:
            prices = stripe.Price.list(product=product.id).data
            for price in prices:
                if price.active == True:
                    product_with_price = {
                        'product': product,
                        'price': price.unit_amount / 100,
                        'price_id': price.id,
                    }
                    products_with_price.append(product_with_price)
    return jsonify(products_with_price)


# This is the update the product
@payment.route('/api/update/product', methods=['POST'])
def update_product():
    print("\n\n", request.json, "\n\n")
    id = request.json['user_id']
    product_id = request.json['product_id']
    user = User.query.filter_by(id=id).first()

    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson'})
    new_product_name = request.json.get('name')
    new_price = request.json.get('price')
    new_description = request.json.get('description')
    currency = request.json.get('currency')
    # Update the product name in Stripe
    stripe.Product.modify(
        product_id,
        name=new_product_name,
        description=new_description
    )
    price_id = request.json.get('price_id')
    print("\n", int(float(new_price) * 100), "\n")
    stripe.Price.modify(
        price_id,
        # assuming price is in the smallest currency unit (e.g., cents)
        active=False
    )
    stripe.Price.create(
        product=product_id,
        recurring={"interval": "month"},
        unit_amount=int(float(new_price) * 100),
        currency=currency
    )
    return 'Product and price updated successfully'


# This is the delete the product
@payment.route('/api/delete/product', methods=['POST'])
def delete_product():
    print(request.json)
    id = request.json['user_id']
    product_id = request.json['product_id']
    user = User.query.filter_by(id=id).first()

    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson'})
    # Delete the product from Stripe
    stripe.Product.modify(product_id, active=False)

    return 'Product and associated prices deleted successfully'


# This is the delete all products
@payment.route('/api/delete/all_products', methods=['POST'])
def delete_all_products():

    id = request.json['user_id']
    user = User.query.filter_by(id=id).first()
    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson'})

    products = stripe.Product.list().data
    print(user.role, "<---------", products)
    for product in products:
        if product.active == True:
            stripe.Product.modify(product.id, active=False)

    return 'Product and associated prices deleted successfully'


# This is the checkout for the product
@payment.route('/api/create/checkout/session', methods=['POST'])
def create_checkout_session():

    subscription_plan_id = request.json['subscriptionPlanId']
    print("\n\n->", subscription_plan_id)
    # Validate and process the subscription plan ID if needed

    # Additional logic to determine the price, success URL, and cancel URL based on the selected plan

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': subscription_plan_id,
            'quantity': 1,
        }],
        mode='subscription',
        success_url="http://3.11.9.37/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
        cancel_url='http://3.11.9.37/chatbot/subscription',
    )
    print(session)

    return jsonify({'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})
