# REST API Documentation
## HELPDESK PRO – IT Service Management API

### Standard Response Envelope
All API endpoints return JSON in the standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
Error response:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid credentials",
    "details": []
  }
}
```

### Endpoints Directory

#### 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email/password, issues JWT access token & HTTP-only refresh cookie.
- `POST /api/auth/logout`: Revoke active refresh token and clear cookies.
- `POST /api/auth/refresh`: Issue new access token using valid refresh token cookie.
- `POST /api/auth/forgot-password`: Send password reset verification email/token.
- `POST /api/auth/reset-password`: Set new password with valid token.
- `GET  /api/auth/me`: Get current authenticated user session and role profile.

#### 2. User Management (`/api/users`)
- `GET    /api/users`: Search, filter by role/dept/status, and paginate users.
- `POST   /api/users`: Admin creation of new user.
- `GET    /api/users/:id`: Get user profile and ticket statistics.
- `PUT    /api/users/:id`: Update user profile data.
- `PATCH  /api/users/:id/status`: Activate / Deactivate / Suspend account.
- `PATCH  /api/users/:id/role`: Change user role (Super Admin only).

#### 3. Department Management (`/api/departments`)
- `GET    /api/departments`: List all departments with member count & open tickets.
- `POST   /api/departments`: Create department.
- `GET    /api/departments/:id`: Department details with associated technicians & employees.
- `PUT    /api/departments/:id`: Update department metadata and assigned manager.
- `DELETE /api/departments/:id`: Safe deactivation/delete checking dependencies.

#### 4. Ticket Management (`/api/tickets`)
- `GET    /api/tickets`: Query tickets with full filter suite (status, priority, category, assignee, dept, search, date range, pagination).
- `POST   /api/tickets`: Create ticket with auto-generated ticketNumber (e.g. `TICK-2026-1001`) and SLA target calculation.
- `GET    /api/tickets/:id`: Detailed ticket view with SLA status, comments, attachments, and activity history.
- `PATCH  /api/tickets/:id/assign`: Assign/reassign ticket to technician.
- `PATCH  /api/tickets/:id/status`: Transition ticket status (OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED).
- `PATCH  /api/tickets/:id/priority`: Update priority and recompute SLA targets.
- `POST   /api/tickets/:id/comments`: Add public comment or internal note.
- `POST   /api/tickets/:id/attachments`: Upload attachment files.
- `PATCH  /api/tickets/:id/resolve`: Resolve ticket with resolution summary.
- `PATCH  /api/tickets/:id/reopen`: Reopen resolved ticket (Employee only within eligible window).
- `POST   /api/tickets/:id/rate`: Employee rating and feedback for resolved ticket.
- `GET    /api/tickets/export/csv`: Export filtered ticket dataset to CSV.

#### 5. Categories (`/api/categories`)
- `GET    /api/categories`: List ticket categories.
- `POST   /api/categories`: Create category.
- `PUT    /api/categories/:id`: Update category.
- `DELETE /api/categories/:id`: Deactivate category.

#### 6. SLA Policies (`/api/sla`)
- `GET    /api/sla/policies`: List configured SLA policies.
- `POST   /api/sla/policies`: Create new SLA policy.
- `PUT    /api/sla/policies/:id`: Update response and resolution thresholds.
- `GET    /api/sla/compliance`: Get current compliance metrics and breach logs.

#### 7. Notifications (`/api/notifications`)
- `GET    /api/notifications`: Retrieve current user notifications.
- `PATCH  /api/notifications/:id/read`: Mark notification as read.
- `PATCH  /api/notifications/read-all`: Mark all notifications as read.

#### 8. Reports & Analytics (`/api/reports`)
- `GET /api/reports/dashboard`: Summary counts, SLA compliance rate, avg response & resolution times.
- `GET /api/reports/tickets`: Ticket trend aggregation by day/week/month.
- `GET /api/reports/technicians`: Technician workload, resolution speed, and rating metrics.
- `GET /api/reports/departments`: Ticket volume and SLA performance per department.

#### 9. Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs`: Query security and administrative action logs (Super Admin).

