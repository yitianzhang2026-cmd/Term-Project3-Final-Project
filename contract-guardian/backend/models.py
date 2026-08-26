from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db


class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', back_populates='company', cascade='all, delete-orphan')
    contracts = db.relationship('Contract', back_populates='company', cascade='all, delete-orphan')

    def serialize(self):
        return {'id': self.id, 'name': self.name}


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(140), unique=True, nullable=False)
    password_hash = db.Column(db.String(260), nullable=False)
    role = db.Column(db.String(30), default='user', nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    company = db.relationship('Company', back_populates='users')
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    notes = db.relationship('Note', back_populates='author', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role, 'company_id': self.company_id}


class Contract(db.Model):
    __tablename__ = 'contracts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(180), nullable=False)
    vendor = db.Column(db.String(180), nullable=False)
    category = db.Column(db.String(120), default='General')
    status = db.Column(db.String(80), default='Active')
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=True)
    description = db.Column(db.Text, nullable=True)
    file_path = db.Column(db.String(260), nullable=True)
    ai_summary = db.Column(db.Text, nullable=True)
    risk_score = db.Column(db.Integer, default=0)
    risk_level = db.Column(db.String(50), default='Low')
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = db.relationship('Company', back_populates='contracts')
    risks = db.relationship('ContractRisk', back_populates='contract', cascade='all, delete-orphan')
    deadlines = db.relationship('Deadline', back_populates='contract', cascade='all, delete-orphan')
    notes = db.relationship('Note', back_populates='contract', cascade='all, delete-orphan')

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'vendor': self.vendor,
            'category': self.category,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'amount': float(self.amount) if self.amount is not None else None,
            'description': self.description,
            'file_path': self.file_path,
            'ai_summary': self.ai_summary,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'company_id': self.company_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'risks': [risk.serialize() for risk in self.risks],
            'deadlines': [deadline.serialize() for deadline in self.deadlines],
            'notes': [note.serialize() for note in self.notes],
        }


class ContractRisk(db.Model):
    __tablename__ = 'contract_risks'
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    risk_type = db.Column(db.String(140), nullable=False)
    severity = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False)

    contract = db.relationship('Contract', back_populates='risks')

    def serialize(self):
        return {'id': self.id, 'risk_type': self.risk_type, 'severity': self.severity, 'description': self.description}


class Deadline(db.Model):
    __tablename__ = 'deadlines'
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    title = db.Column(db.String(140), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='Pending')

    contract = db.relationship('Contract', back_populates='deadlines')

    def serialize(self):
        return {'id': self.id, 'title': self.title, 'due_date': self.due_date.isoformat(), 'status': self.status}


class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    message = db.Column(db.String(260), nullable=False)
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='notifications')

    def serialize(self):
        return {'id': self.id, 'user_id': self.user_id, 'message': self.message, 'read': self.read, 'created_at': self.created_at.isoformat()}


class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    contract_id = db.Column(db.Integer, db.ForeignKey('contracts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    contract = db.relationship('Contract', back_populates='notes')
    author = db.relationship('User', back_populates='notes')

    def serialize(self):
        return {
            'id': self.id,
            'contract_id': self.contract_id,
            'user_id': self.user_id,
            'content': self.content,
            'author': self.author.name if self.author else None,
            'created_at': self.created_at.isoformat(),
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(180), nullable=False)
    target_type = db.Column(db.String(120), nullable=True)
    target_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='audit_logs')

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'details': self.details,
            'created_at': self.created_at.isoformat(),
        }
