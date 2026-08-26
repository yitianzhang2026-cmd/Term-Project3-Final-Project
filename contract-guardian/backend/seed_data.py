from datetime import date, timedelta
from app import create_app
from extensions import db
from models import Company, User, Contract, ContractRisk, Deadline, Notification, Note, AuditLog
from services.ai_service import summarize_contract, calculate_risk_score, extract_deadlines, find_risky_clauses

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

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

    note = Note(contract_id=contract.id, user_id=manager.id, content='Review renewal terms before the end of quarter.')
    db.session.add(note)

    db.session.add(Notification(user_id=manager.id, message='Contract ERP Support Agreement uploaded and analyzed.'))
    db.session.add(AuditLog(user_id=admin.id, action='seed_database', target_type='system', target_id=0, details='Seeded demo company, users, and contract.'))

    db.session.commit()
    print('Seed data created successfully.')
