# Milestone 2 — Database Schema

This schema is designed for SQLAlchemy / SQLite (works in Postgres with minor type changes).

-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  company TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contracts
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  vendor TEXT,
  category TEXT,
  status TEXT,
  ai_summary TEXT,
  risk_level TEXT,
  risk_score INTEGER,
  file_path TEXT,
  start_date DATE,
  end_date DATE,
  amount NUMERIC,
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contract files (if multiple files per contract needed)
CREATE TABLE contract_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contract notes (internal comments)
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT 0,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contract risks (structured extraction)
CREATE TABLE contract_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  risk_type TEXT,
  severity TEXT,
  description TEXT
);

-- Deadlines (renewals etc.)
CREATE TABLE deadlines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
  title TEXT,
  due_date DATE,
  status TEXT DEFAULT 'open'
);

-- Indexes (examples)
CREATE INDEX idx_contracts_created_at ON contracts(created_at);
CREATE INDEX idx_notes_contract_id ON notes(contract_id);


# Example ORM models
- `User` -> users
- `Contract` -> contracts (relationship to `notes`, `contract_files`, `contract_risks`, `deadlines`)
- `Note` -> notes
- `Notification` -> notifications

# Migration
- Use Alembic for migrations in production; for Milestone 2, creating tables on startup via SQLAlchemy `create_all()` is acceptable.
