# API Documentation

## Authentication

### POST /api/auth/register

- Request body: `{ name, email, password, company }`
- Response: `{ token, user }`

### POST /api/auth/login

- Request body: `{ email, password }`
- Response: `{ token, user }`

### GET /api/auth/profile

- Headers: `Authorization: Bearer <token>`
- Response: `{ user }`

## Users

### GET /api/users/

- Admin only
- Response: `{ users: [...] }`

### GET /api/users/:id

- Response: `{ user }`

### POST /api/users/

- Admin only
- Request body: `{ name, email, password, role }`
- Response: `{ user }`

### PUT /api/users/:id

- Request body: `{ name, role, password }`
- Response: `{ user }`

### DELETE /api/users/:id

- Admin only
- Response: `{ message }`

## Contracts

### GET /api/contracts

- Query parameters: `search`, `category`, `status`
- Response: `{ contracts: [...] }`

### GET /api/contracts/:id

- Response: `{ contract }`

### POST /api/contracts

- Request body: `{ name, vendor, category, status, start_date, end_date, amount, description, company_id }`
- Response: `{ contract }`

### POST /api/contracts/upload

- Multipart form: `file` (PDF), `name`, `vendor`, `category`, `status`, `start_date`, `end_date`, `amount`, `description`
- Response: `{ contract }`

### PUT /api/contracts/:id

- Request body: same as create
- Response: `{ contract }`

### DELETE /api/contracts/:id

- Response: `{ message }`

### POST /api/contracts/:id/notes

- Request body: `{ content }`
- Response: `{ note }`

### DELETE /api/contracts/:id/notes/:note_id

- Response: `{ message }`

### GET /api/contracts/:id/download

- Downloads PDF file attachment if available.

## Notifications

### GET /api/notifications/

- Response: `{ notifications: [...] }`

### PUT /api/notifications/mark-read/:notification_id

- Response: `{ notification }`

### GET /api/notifications/count

- Response: `{ unread_count }`

## Admin

### GET /api/admin/stats

- Admin only
- Response: statistics and summaries for dashboard charts.
