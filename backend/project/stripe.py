from flask import request
from flask import Blueprint, jsonify, request
from . import db
from .models import User, Production, Organization
import stripe
from rich import print, pretty
import json
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()
pretty.install()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
payment = Blueprint('payment', __name__)


@payment.route('/api/create-customer', methods=['POST'])
def create_customer():
    id = request.json['id']
    username = request.json['name']
    email = request.json['email']
    city = request.json['city']
    state = request.json['state']
    country = request.json['country']
    organization = request.json['organization']
    password = request.json['password']
    phone = request.json['phone']
    # payment_method = request.json['paymentMethod']
    # subscription = request.json['subscription']

    # product_id = ''
    # if subscription == 'Starter':
    #     product_id = os.getenv('STRIPE_STARTER_PRODUCT_ID')
    #     role = 2
    # elif subscription == 'Standard':
    #     product_id = os.getenv('STRIPE_STANDARD_PRODUCT_ID')
    #     role = 3
    # elif subscription == 'Pro':
    #     product_id = os.getenv('STRIPE_PRO_PRODUCT_ID')
    #     role = 4

    user = db.session.query(User).filter_by(id=id).first()

    if user.subscription_id:
        return jsonify({
            'success': False,
            'message': 'Customer had already subscription.',
            'code': 405
        })
    role = 5
    status = 0
    query = 500
    user = db.session.query(User).filter_by(email=email).first()

    if user:
        return jsonify({'message': 'Email address already exists', 'success': False})

    customer = stripe.Customer.create(name=username, email=email, phone=phone)
    new_user = User(username=username, query=query, status=status, contact=phone, email=email, role=role, customer_id=customer.id, state=state, city=city, country=country,
                    password=generate_password_hash(password, method='sha256'))
    db.session.add(new_user)
    db.session.commit()
    new_organization = Organization(
        organization=organization, email=email)
    db.session.add(new_organization)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Register successful'})


@payment.route('/api/create/product', methods=['POST'])
def create_product():  # sourcery skip: avoid-builtin-shadow
    req_data = request.json
    # Get the required product details from the request
    id = req_data['user_id']
    user = db.session.query(User).filter_by(id=id).first()

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
    id = request.json['user_id']
    product_id = request.json['product_id']
    user = db.session.query(User).filter_by(id=id).first()

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
    id = request.json['user_id']
    product_id = request.json['product_id']
    user = db.session.query(User).filter_by(id=id).first()

    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson'})
    # Delete the product from Stripe
    stripe.Product.modify(product_id, active=False)

    return 'Product and associated prices deleted successfully'


# This is the delete all products
@payment.route('/api/delete/all_products', methods=['POST'])
def delete_all_products():

    id = request.json['user_id']
    user = db.session.query(User).filter_by(id=id).first()
    if user is None or user.role != 1:
        return jsonify({'message': 'The user is not excited or have not persmisson'})

    products = stripe.Product.list().data
    for product in products:
        if product.active == True:
            stripe.Product.modify(product.id, active=False)

    return 'Product and associated prices deleted successfully'


# This is the checkout for the product
@payment.route('/api/create/checkout/session', methods=['POST'])
def create_checkout_session():
    id = request.json['id']
    subscription_plan_id = request.json['subscriptionPlanId']

    user = db.session.query(User).filter_by(id=id).first()
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': subscription_plan_id,
        }],
        payment_method_collection='always',
        mode='subscription',
        success_url="https://app.interactive-tutor.com/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
        cancel_url='https://app.interactive-tutor.com/chatbot/subscription',
        customer=user.customer_id
    )
    return jsonify({'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})


@payment.route('/api/stripe/webhooks', methods=['POST'])
def stripe_webhook():
    payload = json.loads(request.get_data(as_text=True))
    if payload["type"] == "checkout.session.completed":
        # TODO: run some custom code here
        customer_id = payload["data"]["object"]["customer"]
        subscription_id = payload["data"]["object"]["subscription"]

        price_id = stripe.Subscription.retrieve(
            subscription_id)['items']['data'][0]['price']['id']

        user = db.session.query(User).filter_by(
            customer_id=customer_id).first()
        user.subscription_id = subscription_id
        user.role = db.session.query(Production).filter_by(
            price_id=price_id).first().role
        query = user.query
        if user.role == 2:
            query += 500
        elif user.role == 3:
            query += 3000
        elif user.role == 4:
            query += 10000
        user.query = query
        db.session.commit()

    elif payload["type"] == "customer.subscription.deleted":
        customer_id = payload["data"]["object"]["customer"]
        user = db.session.query(User).filter_by(
            customer_id=customer_id).first()
        user.subscription_id = ''
        db.session.commit()
    return jsonify(message="Success"), 200


@payment.route('/api/cancel/subscription', methods=['POST'])
def cancel_subscription():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    subscription = stripe.Subscription.list(
        customer=user.customer_id, status='active').data[0]


@payment.route('/api/update/subscription', methods=['POST'])
def update_subscription():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    subscriptionPlanId = request.json['subscriptionPlanId']
    stripe.Subscription.cancel(user.subscription_id)
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': subscriptionPlanId,
        }],
        payment_method_collection='always',
        mode='subscription',
        success_url="https://app.interactive-tutor.com/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
        cancel_url='https://app.interactive-tutor.com/chatbot/subscription',
        customer=user.customer_id
    )
    return jsonify({'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})
