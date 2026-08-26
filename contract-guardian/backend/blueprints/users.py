from flask import Blueprint, request, jsonify
from models import User
from extensions import db
from utils.auth import jwt_required, admin_required

users_bp = Blueprint('users_bp', __name__)


@users_bp.route('/', methods=['GET'])
@jwt_required
@admin_required
def list_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [user.serialize() for user in users]})


@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user.serialize()})


@users_bp.route('/', methods=['POST'])
@jwt_required
@admin_required
def create_user():
    data = request.get_json() or {}
    user = User(name=data.get('name', ''), email=data.get('email', ''), role=data.get('role', 'user'))
    user.set_password(data.get('password', 'Password123'))
    db.session.add(user)
    db.session.commit()
    return jsonify({'user': user.serialize()}), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required
def update_user(user_id):
    current_user = request.current_user
    if current_user.role != 'admin' and current_user.id != user_id:
        return jsonify({'message': 'Unauthorized access'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    user.name = data.get('name', user.name)
    user.role = data.get('role', user.role)
    if data.get('password'):
        user.set_password(data.get('password'))
    db.session.commit()
    return jsonify({'user': user.serialize()})


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'})
