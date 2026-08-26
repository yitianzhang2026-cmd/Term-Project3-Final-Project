# ContractGuardian

AI-Powered Contract Risk Management Platform

## Overview

ContractGuardian is a full-stack SaaS application for small and medium-sized businesses to securely store contracts, track renewals, detect risks, manage users, and generate AI-powered contract summaries.

## Features

- Secure user registration and login
- Role-based user and admin management
- Contract upload, search, filtering, and details
- AI-powered contract summary, risk analysis, and deadline extraction
- Notifications, notes, deadlines, and audit logs
- Responsive React + Tailwind dashboard with dark mode
- Flask REST API backend with PostgreSQL support

## Project Structure

- `backend/` — Flask API, SQLAlchemy models, JWT auth, blueprints, seed data
- `frontend/` — React + Vite UI with pages, components, context, and Tailwind styling
- `docs/` — Mermaid ER diagram, API documentation, database schema

## Getting Started

### Backend

1. Create a Python virtual environment

```bash
cd contract-guardian/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Configure environment

```bash
cp .env.example .env
```

3. Run database initialization and seed data

```bash
python init_db.py
python seed_data.py
```

4. Start the API server

```bash
python app.py
```

### Frontend

```bash
cd contract-guardian/frontend
npm install
npm run dev
```

## Notes

- The AI service is currently mocked for demo purposes.
- Replace `AI_SERVICE_ENDPOINT` or update `backend/services/ai_service.py` to connect to OpenAI in production.
