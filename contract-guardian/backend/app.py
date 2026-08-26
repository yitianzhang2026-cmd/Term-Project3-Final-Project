import os
from datetime import date, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY, UPLOAD_FOLDER
from extensions import db
from blueprints.auth import auth_bp
from blueprints.users import users_bp
from blueprints.contracts import contracts_bp
from blueprints.notifications import notifications_bp
from blueprints.admin import admin_bp
from models import Company, User, Contract, ContractRisk, Deadline, Note, Notification, AuditLog
from services.ai_service import summarize_contract, calculate_risk_score, extract_deadlines, find_risky_clauses


def seed_demo_data_if_empty():
    if Company.query.count() > 0:
        return

    company = Company(name='Guardian Solutions')
    db.session.add(company)
    db.session.flush()

    admin = User(name='Admin User', email='admin@guardian.com', role='admin', company=company)
    admin.set_password('AdminPass123')
    manager = User(name='Jane Doe', email='jane@guardian.com', role='user', company=company)
    manager.set_password('UserPass123')
    db.session.add_all([admin, manager])
    db.session.flush()

    sample_text = (
        'This document covers a service agreement with a 90-day automatic renewal and an indemnity clause. '
        'The vendor requires a 30-day notice period for termination and includes a data protection section.'
    )

    contract = Contract(
        name='ERP Support Agreement',
        vendor='Velocity Systems',
        category='Vendor',
        status='Active',
        start_date=date.today(),
        end_date=date.today() + timedelta(days=365),
        amount=120000.00,
        description=sample_text,
        ai_summary=summarize_contract(sample_text),
        company=company,
    )
    risk = calculate_risk_score(sample_text, {'category': 'Vendor'})
    contract.risk_score = risk['risk_score']
    contract.risk_level = risk['risk_level']
    db.session.add(contract)
    db.session.flush()

    for clause in find_risky_clauses(sample_text):
        db.session.add(ContractRisk(contract_id=contract.id, **clause))

    for deadline in extract_deadlines(sample_text):
        db.session.add(Deadline(contract_id=contract.id, title=deadline['title'], due_date=date.fromisoformat(deadline['due_date']), status=deadline['status']))

    db.session.add(Note(contract_id=contract.id, user_id=manager.id, content='Review renewal terms before the end of quarter.'))
    db.session.add(Notification(user_id=manager.id, message='Contract ERP Support Agreement uploaded and analyzed.'))
    db.session.add(AuditLog(user_id=admin.id, action='seed_database', target_type='system', target_id=0, details='Seeded demo company, users, and contract.'))
    db.session.commit()


def create_app():
    app = Flask(__name__, static_folder='uploads', static_url_path='/uploads')
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    upload_folder = app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = os.path.abspath(upload_folder)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        db.create_all()
        seed_demo_data_if_empty()

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(contracts_bp, url_prefix='/api/contracts')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'service': 'ContractGuardian API'})

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Endpoint not found'}), 404

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', os.getenv('FLASK_RUN_PORT', '5001')))
    app.run(host='0.0.0.0', port=port, debug=True)
