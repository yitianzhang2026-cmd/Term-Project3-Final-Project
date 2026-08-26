import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from config import SECRET_KEY, JWT_EXPIRATION_DELTA
from models import User
from extensions import db


def create_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + JWT_EXPIRATION_DELTA,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except Exception:
        return None


def jwt_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Missing or invalid authorization header'}), 401

        token = auth_header.replace('Bearer ', '', 1)
        payload = decode_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401

        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404

        request.current_user = user
        return func(*args, **kwargs)

    return wrapper


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not hasattr(request, 'current_user'):
            return jsonify({'message': 'Authentication required'}), 401

        if request.current_user.role != 'admin':
            return jsonify({'message': 'Admin access required'}), 403

        return func(*args, **kwargs)

    return wrapper
