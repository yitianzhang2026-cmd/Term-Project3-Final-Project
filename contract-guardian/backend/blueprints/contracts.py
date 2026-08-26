import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from datetime import datetime
from werkzeug.utils import secure_filename
from models import Contract, ContractRisk, Deadline, Note, Notification, AuditLog, Company
from extensions import db
from services.ai_service import summarize_contract, calculate_risk_score, extract_deadlines, find_risky_clauses
from utils.auth import jwt_required, admin_required

contracts_bp = Blueprint('contracts_bp', __name__)
ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def create_audit(user, action, target_type, target_id, details=None):
    audit = AuditLog(user_id=user.id if user else None, action=action, target_type=target_type, target_id=target_id, details=details)
    db.session.add(audit)


def parse_optional_date(value):
    if not value:
        return None
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            return None
    return value


@contracts_bp.route('/', methods=['GET'])
@jwt_required
def list_contracts():
    query = Contract.query
    search = request.args.get('search')
    category = request.args.get('category')
    status = request.args.get('status')

    if search:
        query = query.filter(
            Contract.name.ilike(f'%{search}%') |
            Contract.vendor.ilike(f'%{search}%') |
            Contract.description.ilike(f'%{search}%')
        )
    if category:
        query = query.filter_by(category=category)
    if status:
        query = query.filter_by(status=status)

    contracts = query.order_by(Contract.created_at.desc()).all()
    return jsonify({'contracts': [contract.serialize() for contract in contracts]})


@contracts_bp.route('/<int:contract_id>', methods=['GET'])
@jwt_required
def get_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify({'contract': contract.serialize()})


@contracts_bp.route('/', methods=['POST'])
@jwt_required
def create_contract():
    data = request.get_json() or {}
    contract = Contract(
        name=data.get('name', 'Untitled Contract'),
        vendor=data.get('vendor', 'Unknown Vendor'),
        category=data.get('category', 'General'),
        status=data.get('status', 'Active'),
        start_date=parse_optional_date(data.get('start_date')),
        end_date=parse_optional_date(data.get('end_date')),
        amount=data.get('amount'),
        description=data.get('description'),
        company_id=data.get('company_id'),
    )

    summary = summarize_contract(contract.description or '')
    risk = calculate_risk_score(contract.description or '', {'category': contract.category})
    contract.ai_summary = summary
    contract.risk_score = risk['risk_score']
    contract.risk_level = risk['risk_level']

    db.session.add(contract)
    db.session.flush()

    for item in find_risky_clauses(contract.description or ''):
        db.session.add(ContractRisk(contract_id=contract.id, **item))

    for item in extract_deadlines(contract.description or ''):
        db.session.add(Deadline(contract_id=contract.id, title=item['title'], due_date=datetime.fromisoformat(item['due_date']).date(), status=item['status']))

    create_audit(request.current_user, 'create_contract', 'contract', contract.id, f'Created contract {contract.name}')
    db.session.commit()
    return jsonify({'contract': contract.serialize()}), 201


@contracts_bp.route('/upload', methods=['POST'])
@jwt_required
def upload_contract():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part provided'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'message': 'Invalid file format. Only PDF allowed.'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    data = request.form.to_dict()
    contract = Contract(
        name=data.get('name', filename),
        vendor=data.get('vendor', 'Unknown Vendor'),
        category=data.get('category', 'General'),
        status=data.get('status', 'Active'),
        start_date=parse_optional_date(data.get('start_date')),
        end_date=parse_optional_date(data.get('end_date')),
        amount=data.get('amount'),
        description=data.get('description', 'Uploaded contract document.'),
        file_path=filename,
        company_id=data.get('company_id'),
    )

    summary = summarize_contract(contract.description)
    risk = calculate_risk_score(contract.description, {'category': contract.category})
    contract.ai_summary = summary
    contract.risk_score = risk['risk_score']
    contract.risk_level = risk['risk_level']

    db.session.add(contract)
    db.session.flush()

    for item in find_risky_clauses(contract.description):
        db.session.add(ContractRisk(contract_id=contract.id, **item))

    for item in extract_deadlines(contract.description):
        db.session.add(Deadline(contract_id=contract.id, title=item['title'], due_date=datetime.fromisoformat(item['due_date']).date(), status=item['status']))

    create_audit(request.current_user, 'upload_contract', 'contract', contract.id, f'Uploaded contract file {filename}')
    db.session.commit()

    return jsonify({'contract': contract.serialize()}), 201


@contracts_bp.route('/<int:contract_id>', methods=['PUT'])
@jwt_required
def update_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    data = request.get_json() or {}
    contract.name = data.get('name', contract.name)
    contract.vendor = data.get('vendor', contract.vendor)
    contract.category = data.get('category', contract.category)
    contract.status = data.get('status', contract.status)
    if 'start_date' in data:
        contract.start_date = parse_optional_date(data.get('start_date'))
    if 'end_date' in data:
        contract.end_date = parse_optional_date(data.get('end_date'))
    contract.amount = data.get('amount', contract.amount)
    contract.description = data.get('description', contract.description)

    summary = summarize_contract(contract.description or '')
    risk = calculate_risk_score(contract.description or '', {'category': contract.category})
    contract.ai_summary = summary
    contract.risk_score = risk['risk_score']
    contract.risk_level = risk['risk_level']

    db.session.query(ContractRisk).filter_by(contract_id=contract.id).delete()
    db.session.query(Deadline).filter_by(contract_id=contract.id).delete()
    db.session.query(Note).filter_by(contract_id=contract.id).delete()

    for item in find_risky_clauses(contract.description or ''):
        db.session.add(ContractRisk(contract_id=contract.id, **item))
    for item in extract_deadlines(contract.description or ''):
        db.session.add(Deadline(contract_id=contract.id, title=item['title'], due_date=datetime.fromisoformat(item['due_date']).date(), status=item['status']))

    create_audit(request.current_user, 'update_contract', 'contract', contract.id, f'Updated contract {contract.name}')
    db.session.commit()
    return jsonify({'contract': contract.serialize()})


@contracts_bp.route('/<int:contract_id>', methods=['DELETE'])
@jwt_required
def delete_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    db.session.delete(contract)
    create_audit(request.current_user, 'delete_contract', 'contract', contract.id, f'Deleted contract {contract.name}')
    db.session.commit()
    return jsonify({'message': 'Contract deleted successfully'})


@contracts_bp.route('/<int:contract_id>/notes', methods=['POST'])
@jwt_required
def add_note(contract_id):
    payload = request.get_json() or {}
    contract = Contract.query.get_or_404(contract_id)
    note = Note(contract_id=contract.id, user_id=request.current_user.id, content=payload.get('content', ''))
    db.session.add(note)
    create_audit(request.current_user, 'add_note', 'contract', contract.id, f'Added note to contract {contract.name}')
    db.session.commit()
    return jsonify({'note': note.serialize()}), 201


@contracts_bp.route('/<int:contract_id>/notes/<int:note_id>', methods=['DELETE'])
@jwt_required
def delete_note(contract_id, note_id):
    note = Note.query.filter_by(id=note_id, contract_id=contract_id, user_id=request.current_user.id).first_or_404()
    db.session.delete(note)
    create_audit(request.current_user, 'delete_note', 'note', note.id, f'Deleted note from contract {contract_id}')
    db.session.commit()
    return jsonify({'message': 'Note deleted successfully'})


@contracts_bp.route('/<int:contract_id>/download', methods=['GET'])
@jwt_required
def download_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    if not contract.file_path:
        return jsonify({'message': 'No file available for download'}), 404

    upload_folder = os.path.abspath(current_app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_folder, exist_ok=True)
    return send_from_directory(upload_folder, contract.file_path, as_attachment=True)


@contracts_bp.route('/<int:contract_id>/view', methods=['GET'])
@jwt_required
def view_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    if not contract.file_path:
        return jsonify({'message': 'No file available to view'}), 404

    upload_folder = os.path.abspath(current_app.config['UPLOAD_FOLDER'])
    os.makedirs(upload_folder, exist_ok=True)
    return send_from_directory(upload_folder, contract.file_path, as_attachment=False)
