from flask import request
from flask import Blueprint, jsonify, request
from . import db
from .models import User, Production, Organization, Invite
import stripe
import json
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash
from . import add_email_to_sendgrid_marketing, get_sendgrid_list_ids, delete_email_to_sendgrid_marketing

load_dotenv()

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
payment = Blueprint('payment', __name__)
SERVER_URL = 'https://app.interactive-tutor.com'

@payment.route('/api/create-customer', methods=['POST'])
def create_customer():
    id = request.json['id']
    username = request.json['name']
    email = request.json['email']
    email = email.lower()
    city = request.json['city']
    state = request.json['state']
    country = request.json['country']
    organization = request.json['organization']
    password = request.json['password']
    phone = request.json['phone']

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

@payment.route('/api/create/checkout/session/query', methods=['POST'])
def create_checkout_session_query():
    id = request.json['id']
    clientReferenceId = request.json['clientReferenceId']
    user = db.session.query(User).filter_by(id=id).first()
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': os.getenv('TOP_UP_QUERY_PRICE'),
            'quantity': 1,
            'tax_rates': [os.getenv('TAX_RATE_ID')],
        }],
        mode='payment',
        success_url= SERVER_URL + "/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=f'{SERVER_URL}/chatbot/subscription',
        customer=user.customer_id,
        allow_promotion_codes=True,
        client_reference_id=clientReferenceId,
    )

    return jsonify({'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})


@payment.route('/api/create/checkout/session', methods=['POST'])
def create_checkout_session():
    try:
        id = request.json['id']
        subscription_plan_id = request.json['subscriptionPlanId']
        clientReferenceId = request.json['clientReferenceId']
        user = db.session.query(User).filter_by(id=id).first()
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': subscription_plan_id,
                'quantity': 1,
            }],
            payment_method_collection='always',
            mode='subscription',
            subscription_data={
                'default_tax_rates': [os.getenv('TAX_RATE_ID')],
            },
            success_url= SERVER_URL + "/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=f'{SERVER_URL}/chatbot/subscription',
            customer=user.customer_id,
            allow_promotion_codes=True,
            client_reference_id=clientReferenceId,
        )

        return jsonify({'success': True, 'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@payment.route('/api/stripe/webhooks', methods=['POST'])
def stripe_webhook():
    try:
        payload = json.loads(request.get_data(as_text=True))
        print('This is payload: ', payload, '\n')
        if payload["type"] == "checkout.session.completed":
            session = payload["data"]["object"]
            customer_id = payload["data"]["object"]["customer"]
            user = db.session.query(User).filter_by(
                customer_id=customer_id).first()
            if session["mode"] == "subscription":
                _subscription_id = payload["data"]["object"]["subscription"]
                price_id = stripe.Subscription.retrieve(
                    _subscription_id)['items']['data'][0]['price']['id']
                
                user.subscription_id = _subscription_id
                price_item = db.session.query(Production).filter_by(
                    price_id=price_id).first()
                user.role = price_item.role
                query = user.query

                delete_email_to_sendgrid_marketing(os.getenv('SENDGRID_FREE_TRIAL_LIST_ID'), user.email)
                add_email_to_sendgrid_marketing(os.getenv('SENDGRID_SUBSCRIPTION_USERS_LIST_ID'), user.username, user.email)
                
                if price_item.role == 2:
                    query = 500
                    tutors = 1
                    training_datas = 1
                    training_words = 100000
                elif price_item.role== 3:
                    query = 3000
                    tutors = 5
                    training_datas = 3
                    training_words = 10000000
                elif price_item.role == 4:
                    query = 10000
                    tutors = 10
                    training_datas = 10
                    training_words = 20000000
                elif price_item.role == 7:
                    query = 30000
                    tutors = 10000
                    training_datas = 100000
                    training_words = 20000000
                user.query = query
                user.tutors = tutors
                user.training_datas = training_datas
                user.training_words = training_words
                invite_user = db.session.query(Invite).filter_by(email=user.email).first()
                if invite_user:
                    invite_user.status = True
            elif session["mode"] == "payment":
                stripe_session = stripe.checkout.Session.retrieve(session["id"], expand=['line_items'])
                for item in stripe_session.line_items.data:
                    price_id = item.price.id
                    if price_id == os.getenv('TOP_UP_QUERY_PRICE'):
                        current_query = user.query
                        user.query = current_query + 500

            db.session.commit()
        elif payload["type"] == "customer.subscription.deleted":
            customer_id = payload["data"]["object"]["customer"]
            user = db.session.query(User).filter_by(
                customer_id=customer_id).first()
            user.subscription_id = ''
            user.query = 500
            user.role = 5
            db.session.commit()
        return jsonify(message="Success"), 200
    except Exception as e:
        print(e)
        return jsonify(message=str(e)), 500


@payment.route('/api/cancel/subscription', methods=['POST'])
def cancel_subscription():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    session = stripe.billing_portal.Session.create(
        customer=user.customer_id,
        return_url=f"{SERVER_URL}/"
    )
    return jsonify({'message': 'Canceled the Subscription', 'code': 200, 'success': True, 'url': session.url})


@payment.route('/api/update/subscription', methods=['POST'])
def update_subscription():
    id = request.json['id']
    user = db.session.query(User).filter_by(id=id).first()
    subscriptionPlanId = request.json['subscriptionPlanId']
    clientReferenceId = request.json['clientReferenceId']

    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': subscriptionPlanId,
            'quantity': 1,
        }],
        payment_method_collection='always',
        mode='subscription',
        subscription_data={
            'default_tax_rates': [os.getenv('TAX_RATE_ID')],
        },
        success_url= SERVER_URL + "/chatbot/subscription?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=f'{SERVER_URL}/chatbot/subscription',
        customer=user.customer_id,
        allow_promotion_codes=True,
        client_reference_id=clientReferenceId,
    )
    return jsonify({'sessionId': session['id'], 'key': os.getenv('STRIPE_PUBLISHABLE_KEY')})
