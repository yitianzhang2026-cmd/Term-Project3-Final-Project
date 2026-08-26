from flask import Blueprint, request, jsonify
from models import Notification
from extensions import db
from utils.auth import jwt_required

notifications_bp = Blueprint('notifications_bp', __name__)


@notifications_bp.route('/', methods=['GET'])
@jwt_required
def list_notifications():
    user = request.current_user
    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).all()
    return jsonify({'notifications': [note.serialize() for note in notifications]})


@notifications_bp.route('/mark-read/<int:notification_id>', methods=['PUT'])
@jwt_required
def mark_read(notification_id):
    user = request.current_user
    notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first_or_404()
    notification.read = True
    db.session.commit()
    return jsonify({'notification': notification.serialize()})


@notifications_bp.route('/count', methods=['GET'])
@jwt_required
def count_notifications():
    user = request.current_user
    unread = Notification.query.filter_by(user_id=user.id, read=False).count()
    return jsonify({'unread_count': unread})
