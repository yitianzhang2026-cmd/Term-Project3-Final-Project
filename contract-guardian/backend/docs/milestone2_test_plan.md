# Milestone 2 — Test Plan and Test Cases

Run tests against `http://127.0.0.1:5001` (adjust `PORT` if running elsewhere).

Tools: `curl`, `pytest` (requests), or Postman.

## Smoke test — Health
- Request: `GET /api/health`
- Expect: 200 with `{ "service": "ContractGuardian API", "status": "ok" }`
- Sample command:
```bash
curl -sS http://127.0.0.1:5001/api/health
```

## Auth tests
1. Register new user
  - POST `/api/auth/register` with example body
  - Expect 201, user created, email unique
2. Login
  - POST `/api/auth/login` -> expect access_token and user object
3. Access protected endpoint
  - GET `/api/auth/me` with `Authorization` header -> expect 200 and user data

## Contracts tests
1. List contracts (no auth or with auth depending on app)
  - GET `/api/contracts` -> 200 and `contracts` array
2. Create contract (upload)
  - POST `/api/contracts` multipart/form-data with `file` and metadata
  - Expect 201 and contract record with `file_path`
3. Get contract
  - GET `/api/contracts/:id` -> contract details including notes/risks
4. Update contract
  - PATCH `/api/contracts/:id` -> 200 and changed fields
5. Delete contract
  - DELETE `/api/contracts/:id` -> 204

## Notes tests
- POST `/api/contracts/:id/notes` -> 201 and note included in GET `/api/contracts/:id`

## Notifications tests
- GET `/api/notifications` -> 200 list
- PATCH `/api/notifications/:id` to mark read -> 200 updated

## Admin tests (admin user required)
- GET `/api/admin/stats` -> 200 and stats payload
- GET `/api/users` -> list of users (admin-only)

## File download
- GET `/uploads/<filename>` -> returns PDF with `Content-Type: application/pdf`

## Example curl sequence (happy path)
```bash
# health
curl -sS http://127.0.0.1:5001/api/health

# register
curl -sS -X POST http://127.0.0.1:5001/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"t@example.com","password":"pass"}'

# login
curl -sS -X POST http://127.0.0.1:5001/api/auth/login -H "Content-Type: application/json" -d '{"email":"t@example.com","password":"pass"}'

# use returned token for subsequent requests (Authorization: Bearer <token>)
```

## Test Results
- Run the smoke health check now (example):
```bash
curl -sS http://127.0.0.1:5001/api/health
```
- Record actual outputs here for the assignment submission.

# Automation
- Add `backend/tests/test_health.py` with a simple `requests` assertion and run with `pytest`.


# Notes
- For Milestone 2, include test evidence (screenshots or terminal logs) in `backend/docs/test_results/` or append to this document.
