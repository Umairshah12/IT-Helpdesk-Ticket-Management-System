# HELPDESK PRO – Enterprise IT Service Management Platform

![Helpdesk Pro Banner](https://img.shields.io/badge/ITSM-Enterprise%20Service%20Desk-2563EB?style=for-the-badge)
![Status](https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-14213D?style=for-the-badge)

**Helpdesk Pro** is a modern, production-grade IT Service Management (ITSM) web application engineered to orchestrate incident resolution, service request fulfillment, SLA monitoring, department coordination, and real-time team collaboration.

---

## 🚀 Key Features by User Role

### 🛡️ Super Administrator
- **Full System Governance**: Complete application access, global configuration, and security settings.
- **Identity & Role Management**: Provision, elevate, suspend, or deactivate Administrators, Technicians, and Employees.
- **Department & Category Administration**: Create business units, assign department managers, configure incident taxonomy.
- **SLA Policy Engine**: Define priority-based response and resolution targets with business-hour calculations.
- **Executive Analytics & Reporting**: Global ticket density, SLA compliance rate, CSAT ratings, CSV master export.
- **Security Audit Logs**: Immutable audit trail recording user logins, role elevation, ticket assignments, and setting adjustments.

### 💼 IT Administrator
- **Operational Dashboard**: Real-time visibility into open incidents, active technician workloads, and department queues.
- **Ticket Queue Management**: Assign and reassign incidents with workload-aware suggestions and reason tracking.
- **Departmental Oversight**: Track performance metrics and ticket volumes across business departments.
- **SLA Monitoring**: Real-time breach alerts and near-breach notifications.

### 🛠️ IT Support Agent / Technician
- **Technician Hub**: Dedicated personal queue of assigned service requests.
- **Troubleshooting Lifecycle**: Accept tickets, transition status (`IN_PROGRESS`, `PENDING_USER`, `PENDING_THIRD_PARTY`, `RESOLVED`).
- **Internal Notes**: Confidential troubleshooting scratchpad strictly hidden from employees.
- **File Attachments**: Upload diagnostic logs, patch screenshots, and technical documentation.
- **Resolution Summaries**: Record formal resolution notes upon resolving incidents.

### 👤 Employee / End User
- **Self-Service Portal**: Submit tickets with category classification, urgency priority, and screenshots.
- **Personal Ticket Tracker**: Real-time status tracking, estimated SLA completion countdown, and technician responses.
- **Reopen Resolved Incidents**: Reopen tickets with detailed justifications if problems persist.
- **CSAT Service Rating**: Rate completed support quality on a 1–5 star scale with optional feedback comments.
- **Profile & Security**: Manage contact information, phone numbers, and update login credentials.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend SPA** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts, React Router DOM v6, Axios, React Hook Form, Zod |
| **Backend REST API** | Node.js v20+, Express.js 4, TypeScript, JWT (Access + Rotating HTTP-only Refresh tokens), bcryptjs, Helmet, CORS, Multer, Zod |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 5.22, Relational constraints, B-Tree indexes, Cascade rules, Embedded store fallback |
| **DevOps & Containers** | Docker Compose, Multi-stage Dockerfiles, Postman/Swagger API schemas |
| **Testing** | Vitest, Supertest, Automated integration & unit test suites |

---

## 🔑 Pre-Configured Seed Accounts for Demonstration

All accounts are pre-seeded and ready for instant testing. The login page also provides **One-Click Quick Login Buttons** for convenience.

| Role | Email | Password | Employee ID |
|---|---|---|---|
| **Super Admin** | `superadmin@helpdeskpro.internal` | `SuperAdmin@Secure2026!` | `EMP-0001` |
| **IT Admin** | `admin@helpdeskpro.internal` | `Admin@Secure2026!` | `EMP-0002` |
| **Senior Technician** | `technician@helpdeskpro.internal` | `Tech@Secure2026!` | `TECH-0001` |
| **IT Technician 2** | `alex.rivera@helpdeskpro.internal` | `Tech@Secure2026!` | `TECH-0002` |
| **Employee (Designer)** | `employee@helpdeskpro.internal` | `Employee@Secure2026!` | `EMP-1001` |
| **Employee (Finance)** | `sarah.connor@helpdeskpro.internal` | `Employee@Secure2026!` | `EMP-1002` |

---

## ⚡ Quick Start & Installation

### Option 1: Local Development (Recommended)

#### Prerequisites
- Node.js v20+ and npm v10+

#### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "IT Helpdesk Ticket Management System"

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

#### 2. Start Development Servers
In two separate terminal windows:

**Backend Server (Runs on port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Client (Runs on port 5173):**
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

### Option 2: Docker Compose

To run the full stack with live PostgreSQL 16 container, backend REST API, and frontend web client:

```bash
docker-compose up -d
```

- **Frontend Client**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`
- **PostgreSQL Database**: `localhost:5432`

To stop:
```bash
docker-compose down
```

---

## 🧪 Running Automated Tests

The platform includes an automated test suite verifying 15 mission-critical security and operational scenarios (RBAC authorization, SLA calculation, ticket lifecycle, and internal note isolation).

```bash
cd backend
npm test
```

### Verified Test Scenarios
1. ✅ Super Admin login returns valid JWT token and `SUPER_ADMIN` role.
2. ✅ Admin login returns valid JWT token and `ADMIN` role.
3. ✅ Technician login returns valid JWT token and `TECHNICIAN` role.
4. ✅ Employee login returns valid JWT token and `EMPLOYEE` role.
5. ✅ Unauthorized API calls without token are rejected with HTTP 401.
6. ✅ Employees are strictly scoped to only view their own tickets.
7. ✅ Ticket creation automatically computes SLA response & resolution deadlines.
8. ✅ Admins can reassign tickets to technicians with audit reason logging.
9. ✅ Technicians can transition status to `IN_PROGRESS`.
10. ✅ Technicians can post both public comments and internal troubleshooting notes.
11. ✅ **Internal notes are strictly filtered and hidden from Employee API responses.**
12. ✅ Super Admins can query security audit logs.
13. ✅ Non-super admins are rejected with HTTP 403 when requesting audit logs.
14. ✅ Executive dashboard statistics calculate real relational metrics.
15. ✅ SLA business-hours calculator correctly accounts for working hours (09:00–18:00 UTC) and weekends.

---

## 📐 Database Schema & Architecture

Detailed database ERD and architectural diagrams are located in the `docs/` folder:
- [Architecture & High-Level Design](file:///d:/Antigrity%20Project/IT%20Helpdesk%20Ticket%20Management%20System/docs/architecture.md)
- [Database Entity Relationship Diagram](file:///d:/Antigrity%20Project/IT%20Helpdesk%20Ticket%20Management%20System/docs/database-erd.md)
- [REST API Endpoint Catalog](file:///d:/Antigrity%20Project/IT%20Helpdesk%20Ticket%20Management%20System/docs/api-documentation.md)
- [Application Security Specification](file:///d:/Antigrity%20Project/IT%20Helpdesk%20Ticket%20Management%20System/docs/security.md)

### Prisma Models (16 Entities)
- `User`: Corporate identity, role, department, designation, employee ID.
- `Department`: Organizational units with assigned managers.
- `TicketCategory`: Categorization taxonomy with default priorities.
- `SLAPolicy`: Priority-governed response and resolution thresholds.
- `Ticket`: Core lifecycle entity with status, dates, and deadlines.
- `TicketComment`: Threaded conversation messages with internal flag.
- `TicketAttachment`: File metadata with MIME type and size enforcement.
- `TicketAssignment`: Historical re-assignment log with reasons.
- `TicketActivity`: Comprehensive audit trail of all ticket events.
- `Notification`: In-app notification center with read states.
- `RefreshToken`: SHA-256 hashed rotating refresh token session records.
- `AuditLog`: Security audit log tracking sensitive admin actions.
- `ServiceRating`: 1–5 star employee CSAT rating and feedback.
- `SystemSetting`: Global configuration key-values.

---

## ⏱️ SLA Calculation Engine Logic

When a ticket is created or its priority is updated:
1. The engine checks active `SLAPolicy` records for that priority.
2. If `isBusinessHoursOnly` is enabled:
   - Evaluates working hours: **09:00 to 18:00 UTC**.
   - Skips Saturdays and Sundays, rolling time over to Monday 09:00 UTC.
   - Skips non-working evening hours, rolling remaining minutes to the next working day.
3. If `isBusinessHoursOnly` is false (e.g. Critical 24/7 severity):
   - Computes calendar-time deadlines directly.
4. Overdue detection flags `isOverdue: true` whenever `resolutionDueAt < NOW()` on unresolved tickets, triggering breach alerts.

---

## 🔒 Security Measures

- **No Plaintext Passwords**: Hashed via bcrypt with work factor 10.
- **Refresh Token Rotation**: Each token refresh issues a new token pair and revokes the old one.
- **Strict Data Isolation**: Backend filters guarantee employees never receive internal notes or other users' tickets.
- **Input Validation**: Strongly typed Zod schemas validate every API request body and query.
- **Security Headers**: Helmet sets `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Upload Hardening**: Restricts MIME types to safe formats, limits size to 10MB, and prevents executable uploads.

---

## 📄 License

This project is licensed under the MIT License. Developed for enterprise IT service operations.
