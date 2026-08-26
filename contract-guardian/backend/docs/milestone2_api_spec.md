# Milestone 2 — API Specification

This document lists the backend APIs for ContractGuardian. Each endpoint includes method, authentication requirement, sample JSON input and output, and notes.

Base URL: `http://localhost:5001/api`

---

## Health
- URL: `/api/health`
- Method: GET
- Auth: none
- Response 200:
```json
{ "service": "ContractGuardian API", "status": "ok" }
```

---

## Auth — Register
- URL: `/api/auth/register`
- Method: POST
- Auth: none
- Sample request:
```json
{
  "name": "Alice Admin",
  "email": "alice@example.com",
  "password": "s3cret123",
  "company": "Acme"
}
```
- Sample response 201:
```json
{ "user": { "id": 1, "name": "Alice Admin", "email": "alice@example.com", "role": "user" } }
```
- Notes: server should hash password and return user object (no password).

---

## Auth — Login
- URL: `/api/auth/login`
- Method: POST
- Auth: none
- Sample request:
```json
{ "email": "alice@example.com", "password": "s3cret123" }
```
- Sample response 200:
```json
{ "access_token": "<jwt>", "user": { "id":1, "name":"Alice Admin", "email":"alice@example.com", "role":"admin" } }
```
- Notes: Use JWT (or token) in `Authorization: Bearer <token>` for protected endpoints.

---

## Auth — Current user
- URL: `/api/auth/me`
- Method: GET
- Auth: required
- Sample response 200:
```json
{ "id":1, "name":"Alice Admin", "email":"alice@example.com", "role":"admin" }
```

---

## Users (Admin)
- URL: `/api/users`
- Method: GET
- Auth: admin
- Sample response:
```json
{ "users": [ { "id":1, "name":"Alice", "email":"alice@example.com", "role":"admin" } ] }
```

- URL: `/api/users/:id`
- Method: GET, PATCH, DELETE
- Auth: admin
- PATCH sample request:
```json
{ "role": "admin", "company": "Acme" }
```

---

## Contracts — List
- URL: `/api/contracts`
- Method: GET
- Auth: required
- Query params: `?search=...&limit=20&page=1` (optional)
- Response 200:
```json
{ "contracts": [ { "id": 12, "name": "MSA - Vendor", "vendor": "VendorCo", "category":"Service", "status":"Active", "risk_level":"Medium", "created_at":"2026-07-26T10:00:00Z" } ], "total": 123 }
```

---

## Contracts — Create (upload)
- URL: `/api/contracts`
- Method: POST
- Auth: required
- Content-Type: `multipart/form-data`
- Form fields: `file` (pdf), plus optional metadata fields `name`, `vendor`, `category`, `status`, `start_date`, `end_date`, `amount`, `description`
- Response 201:
```json
{ "contract": { "id": 45, "name": "Example Contract", "file_path": "uploads/uuid.pdf", "vendor":"VendorCo" } }
```
- Notes: server must store file under `backend/uploads/` and create contract record referencing file path. Should kick off async AI processing (optional) to populate `ai_summary` and `risks`.

---

## Contracts — Get single
- URL: `/api/contracts/:id`
- Method: GET
- Auth: required
- Sample response 200:
```json
{
  "contract": {
    "id":45,
    "name":"Example Contract",
    "vendor":"VendorCo",
    "category":"Service",
    "status":"Active",
    "file_path":"uploads/uuid.pdf",
    "ai_summary":"Summary text...",
    "risks": [{ "id":1, "risk_type":"Termination","severity":"High","description":"Early termination clause..." }],
    "deadlines":[{"id":1,"title":"Renewal","due_date":"2026-08-01","status":"open"}],
    "notes": [{"id":1,"author":"Alice","content":"Check clause X","created_at":"..."}]
  }
}
```

---

## Contracts — Update
- URL: `/api/contracts/:id`
- Method: PATCH
- Auth: required
- Sample request:
```json
{ "status": "Expired", "category": "Vendor" }
```
- Response 200: updated contract object.

---

## Contracts — Delete
- URL: `/api/contracts/:id`
- Method: DELETE
- Auth: required
- Authorization: owner or admin
- Response 204 No Content

---

## Contract Notes
- URL: `/api/contracts/:id/notes`
- Method: POST
- Auth: required
- Request JSON:
```json
{ "content": "Internal TODO: negotiate clause 5." }
```
- Response 201:
```json
{ "note": { "id": 101, "author_id": 1, "content": "Internal TODO...", "created_at": "2026-07-26T10:12:00Z" } }
```

---

## Notifications
- URL: `/api/notifications`
- Method: GET
- Auth: required
- Response 200:
```json
{ "notifications": [ { "id":1, "message":"Contract X renewed", "read": false, "created_at":"..." } ] }
```
- Mark read: `POST /api/notifications/:id/read` or `PATCH /api/notifications/:id` with `{ "read": true }`.

---

## Admin — Stats
- URL: `/api/admin/stats`
- Method: GET
- Auth: admin required
- Response 200:
```json
{ "total_users": 12, "total_contracts": 234, "high_risk_contracts": 5, "upcoming_renewals": 8 }
```

---

## File download
- URL: `/uploads/<filename>` (served statically)
- Method: GET
- Auth: optional (private files should require auth)
- Response: PDF stream with appropriate `Content-Type: application/pdf` and `Content-Disposition`.

---

# Notes & Authentication
- Use JWT tokens set in `Authorization: Bearer <token>` header for protected endpoints.
- All POST/PATCH/DELETE endpoints should validate input and return helpful 4xx errors with a JSON `{ "message": "..." }` payload.

---

# Next steps
- Implement endpoints in `backend/blueprints/` using these specs.
- Add unit and integration tests under `backend/tests/`.
