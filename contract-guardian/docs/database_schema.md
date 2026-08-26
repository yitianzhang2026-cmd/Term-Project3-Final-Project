# Database Schema

See `backend/models.py` for the SQLAlchemy model definitions. This schema includes the following tables:

- companies
- users
- contracts
- contract_risks
- deadlines
- notifications
- notes
- audit_logs

Use `python init_db.py` to create the schema and `python seed_data.py` to insert demo data.
