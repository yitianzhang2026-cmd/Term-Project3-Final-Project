import io
import os
import tempfile
import pytest

from extensions import db
from models import User, Company, Contract

@pytest.fixture(scope='module')
def test_client():
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'

    # Import app and models after DATABASE_URL is set so config picks it up.
    from app import create_app
    from extensions import db
    from models import User, Company, Contract

    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()
        company = Company(name='TestCompany')
        db.session.add(company)
        db.session.flush()
        admin = User(name='Admin User', email='admin@test.com', role='admin', company=company)
        admin.set_password('AdminPass123')
        db.session.add(admin)
        db.session.commit()

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    os.unlink(db_path)


def test_health(test_client):
    response = test_client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert data['service'] == 'ContractGuardian API'


def test_register_and_login(test_client):
    payload = {'name': 'Test User', 'email': 'user@test.com', 'password': 'Password123', 'company': 'TestCompany'}
    response = test_client.post('/api/auth/register', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert 'token' in data
    assert data['user']['email'] == payload['email']

    login_response = test_client.post('/api/auth/login', json={'email': payload['email'], 'password': payload['password']})
    assert login_response.status_code == 200
    login_data = login_response.get_json()
    assert 'token' in login_data
    assert login_data['user']['email'] == payload['email']


def test_profile_requires_auth(test_client):
    response = test_client.get('/api/auth/me')
    assert response.status_code == 401


def test_admin_stats_requires_auth(test_client):
    response = test_client.get('/api/admin/stats')
    assert response.status_code == 401


def get_token(test_client, email='admin@test.com', password='AdminPass123'):
    response = test_client.post('/api/auth/login', json={'email': email, 'password': password})
    return response.get_json()['token']


def test_admin_stats_with_admin(test_client):
    token = get_token(test_client)
    response = test_client.get('/api/admin/stats', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    data = response.get_json()
    assert 'total_users' in data
    assert 'total_contracts' in data


def test_upload_contract_ignores_invalid_dates(test_client):
    token = get_token(test_client)
    response = test_client.post(
        '/api/contracts/upload',
        headers={'Authorization': f'Bearer {token}'},
        data={
            'name': 'Sample Contract',
            'vendor': 'Vendor',
            'category': 'Vendor',
            'status': 'Active',
            'start_date': '11111-11-11',
            'end_date': '11111-11-11',
            'description': 'Contract uploaded during regression test.',
            'file': (io.BytesIO(b'%PDF-1.4\n%test pdf'), 'sample-contract.pdf'),
        },
    )

    assert response.status_code == 201
    payload = response.get_json()
    assert payload['contract']['name'] == 'Sample Contract'
    assert payload['contract']['start_date'] is None
    assert payload['contract']['end_date'] is None


def test_open_uploaded_contract_file(test_client):
    token = get_token(test_client)
    upload_dir = test_client.application.config['UPLOAD_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, 'sample-contract.pdf')
    with open(file_path, 'wb') as handle:
        handle.write(b'%PDF-1.4\n%test pdf')

    with test_client.application.app_context():
        contract = Contract(name='Sample Contract', vendor='Vendor', category='Vendor', status='Active', file_path='sample-contract.pdf')
        db.session.add(contract)
        db.session.commit()
        contract_id = contract.id

    response = test_client.get(f'/api/contracts/{contract_id}/view', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.mimetype == 'application/pdf'
