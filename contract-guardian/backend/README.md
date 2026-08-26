Backend for ContractGuardian

Setup

1. Create virtual environment

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

2. Create `.env` from `.env.example`
3. Initialize database

python init_db.py
python seed_data.py

4. Run server

python app.py

