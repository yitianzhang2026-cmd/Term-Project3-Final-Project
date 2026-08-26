from flask import Blueprint, request, jsonify
from models import User, Company, AuditLog
from extensions import db
from utils.auth import create_token

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    company_name = data.get('company') or 'Default Company'

    if not all([name, email, password]):
        return jsonify({'message': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    company = Company.query.filter_by(name=company_name).first()
    if not company:
        company = Company(name=company_name)
        db.session.add(company)
        db.session.flush()

    user = User(name=name, email=email, role='user', company=company)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_token(user)
    return jsonify({'token': token, 'user': user.serialize()}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_token(user)
    return jsonify({'token': token, 'user': user.serialize()}), 200


@auth_bp.route('/profile', methods=['GET'])
@auth_bp.route('/me', methods=['GET'])
def profile():
    from utils.auth import jwt_required

    @jwt_required
    def inner():
        user = request.current_user
        return jsonify({'user': user.serialize()})

    return inner()
