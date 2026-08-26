from flask import Blueprint, jsonify
from sqlalchemy import func
from models import User, Contract, ContractRisk, Deadline, Notification, AuditLog
from extensions import db
from utils.auth import jwt_required, admin_required

admin_bp = Blueprint('admin_bp', __name__)


@admin_bp.route('/stats', methods=['GET'])
@jwt_required
@admin_required
def admin_stats():
    total_users = User.query.count()
    total_contracts = Contract.query.count()
    high_risk_contracts = Contract.query.filter(Contract.risk_level == 'High').count()
    upcoming_renewals = Deadline.query.filter(Deadline.due_date >= func.current_date()).count()
    contracts_by_category = [
        {'category': category, 'count': count}
        for category, count in Contract.query.with_entities(Contract.category, func.count(Contract.id)).group_by(Contract.category).all()
    ]
    risk_distribution = [
        {'risk_level': level, 'count': count}
        for level, count in Contract.query.with_entities(Contract.risk_level, func.count(Contract.id)).group_by(Contract.risk_level).all()
    ]
    bind = db.session.get_bind()
    dialect_name = bind.dialect.name if bind is not None else None

    if dialect_name == 'sqlite':
        monthly_uploads = [
            {'month': month, 'count': count}
            for month, count in Contract.query.with_entities(func.strftime('%Y-%m', Contract.created_at), func.count(Contract.id)).group_by(func.strftime('%Y-%m', Contract.created_at)).order_by(func.strftime('%Y-%m', Contract.created_at)).all()
        ]
    else:
        monthly_uploads = [
            {'month': month, 'count': count}
            for month, count in Contract.query.with_entities(func.to_char(Contract.created_at, 'YYYY-MM'), func.count(Contract.id)).group_by(func.to_char(Contract.created_at, 'YYYY-MM')).order_by(func.to_char(Contract.created_at, 'YYYY-MM')).all()
        ]
    recent_activity = [log.serialize() for log in AuditLog.query.order_by(AuditLog.created_at.desc()).limit(8).all()]

    return jsonify({
        'total_users': total_users,
        'total_contracts': total_contracts,
        'high_risk_contracts': high_risk_contracts,
        'upcoming_renewals': upcoming_renewals,
        'contracts_by_category': contracts_by_category,
        'risk_distribution': risk_distribution,
        'monthly_uploads': monthly_uploads,
        'recent_activity': recent_activity,
    })
