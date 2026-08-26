# Milestone 2 Submission — ContractGuardian (Backend)

This README explains how to run the backend, reproduce test results, and what is included in the submission archive.

## Contents included
- `backend/` — Flask backend source code (blueprints, models, services, utils)
- `backend/docs/` — API spec, DB schema, test plan, test results, and this README
- `backend/tests/` — pytest test suite used for Milestone 2
- `backend/requirements.txt` — Python dependencies (install into a venv)

Files of note:
- `backend/docs/milestone2_api_spec.md`
- `backend/docs/milestone2_db_schema.md`
- `backend/docs/milestone2_test_plan.md`
- `backend/docs/test_results/pytest_results.txt`
- `backend/tests/test_api.py`

## How to run locally (macOS / Linux)
1. Create and activate a Python virtualenv from the `backend` folder:

```bash
cd contract-guardian/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Initialize the database and seed demo data (optional):

```bash
# create schema
python init_db.py
# seed demo users and a contract
python seed_data.py
```

3. Run the backend server:

```bash
# server runs on port 5001 by default
python app.py
```

4. Run tests (from `contract-guardian/backend`):

```bash
source venv/bin/activate
python -m pytest -q
```

Test output is saved in `backend/docs/test_results/pytest_results.txt` in this submission.

## How to reproduce curl examples used in the test plan
Examples are in `backend/docs/milestone2_test_plan.md`. Save outputs like:

```bash
curl -sS http://127.0.0.1:5001/api/health -o backend/docs/test_results/health.json
```

## Notes and assumptions
- The project uses SQLite by default via `DATABASE_URL` in `backend/.env` or the default in `config.py`.
- Uploaded files are stored under `backend/uploads/` (ensure `UPLOAD_FOLDER` config is writable).
- JWT auth is used for protected endpoints. Use the login endpoint to obtain a token.

## Submission archive
A zip file `milestone2_backend.zip` (created alongside this repository) contains the `backend/` folder and documentation, excluding the Python virtual environment.

If you want, I can also:
- Add more test coverage for file upload/download and contract CRUD (I can implement and run them now),
- Prepare a single PDF report summarizing the work for upload to your course site.

---
Submitted by: [Your Name]
Date: 2026-07-26
