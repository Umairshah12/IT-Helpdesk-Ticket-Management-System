# Architecture & System Design
## HELPDESK PRO – Enterprise IT Service Management Platform

### 1. Overview
Helpdesk Pro is an enterprise-grade IT Service Management (ITSM) web application engineered to orchestrate incident resolution, service request fulfillment, SLA monitoring, asset/department coordination, and real-time team collaboration.

### 2. High-Level Architecture Diagram
```
+-----------------------------------------------------------------------------------+
|                                  CLIENT TIER                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                 React.js 18 + Vite + TypeScript Frontend SPA                |  |
|  |   - Tailwind CSS (Clean Navy & Blue Enterprise Theme, Dark/Light Support)   |  |
|  |   - Role-Based Dynamic Routing (Super Admin / Admin / Tech / Employee)      |  |
|  |   - Recharts Analytics & TanStack Data Tables                               |  |
|  |   - React Hook Form + Zod Client-Side Validations                           |  |
|  |   - Axios Interceptors (Token Refresh & Auth Guard)                         |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST API
                                           v
+-----------------------------------------------------------------------------------+
|                                 APPLICATION TIER                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                       Node.js + Express.js API Server                       |  |
|  |   - Express Validation Layer (Zod Schemas)                                  |  |
|  |   - Security Middleware (Helmet, CORS, Rate Limiters)                       |  |
|  |   - JWT Authentication & Refresh Token Rotation                             |  |
|  |   - RBAC Policy Authorization Layer                                         |  |
|  |   - SLA Calculation Engine & Event Handlers                                 |  |
|  |   - Audit Logging Engine                                                    |  |
|  |   - Local/Cloud File Storage Engine                                         |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           | Prisma ORM (Connection Pool)
                                           v
+-----------------------------------------------------------------------------------+
|                                   DATA TIER                                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                         PostgreSQL 16 Relational DB                         |  |
|  |   - Strict Foreign Key Constraints & Cascade Safeguards                     |  |
|  |   - Optimized B-Tree Indexes on Status, Priority, Assignee & Creation Dates |  |
|  |   - Audit Logging & Historical Activity Records                             |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 3. Role-Based Access Matrix (RBAC)
| Capability / Module | Super Admin | Admin | Technician | Employee |
| :--- | :---: | :---: | :---: | :---: |
| Full System Settings & Policy Config | YES | NO | NO | NO |
| Manage Admins & Global Audit Logs | YES | NO | NO | NO |
| Manage Technicians & Departments | YES | YES | NO | NO |
| View All Tickets & Global Analytics | YES | YES | NO | NO |
| Assign / Reassign Tickets | YES | YES | Self-Accept | NO |
| Manage SLA Targets & Categories | YES | YES | NO | NO |
| View Assigned Tickets | YES | YES | YES (Assigned) | NO |
| Post Internal Troubleshooting Notes | YES | YES | YES | NO (Hidden) |
| Create Support Tickets | YES | YES | YES | YES |
| View Personal Tickets & History | YES | YES | YES | YES (Own Only) |
| Rate Support & Reopen Resolved Ticket| NO | NO | NO | YES (Own Only) |

### 4. Core Lifecycle State Machine
```
[New Ticket] ---> [OPEN] 
                   |
                   v (Assigned to tech)
               [ASSIGNED]
                   |
                   v (Technician starts work)
              [IN_PROGRESS] <--------------------+
              /           \                      |
             v             v                     |
     [PENDING_USER]  [PENDING_THIRD_PARTY] ------+
             \             /
              v           v
             [IN_PROGRESS]
                   |
                   v (Work completed)
               [RESOLVED]
                /        \
 (Employee Reopens)       (Employee confirms / Auto-close)
              v            v
        [IN_PROGRESS]   [CLOSED]
```

### 5. SLA Calculation Logic
1. **Target Evaluation**: When a ticket is created, the system matches its priority (CRITICAL, HIGH, MEDIUM, LOW) against active `SLAPolicy` records.
2. **Deadline Timestamping**:
   - `responseDueAt = createdAt + policy.responseTimeMinutes`
   - `resolutionDueAt = createdAt + policy.resolutionTimeMinutes`
3. **Business Hours Filtering**: When `isBusinessHoursOnly` is enabled, the duration calculations skip non-working hours (09:00 - 18:00 UTC) and weekends.
4. **Breach Determination**: A background monitor and query checks `status != RESOLVED && status != CLOSED && resolutionDueAt < NOW()`, setting `isOverdue = true` and dispatching breach alerts.

