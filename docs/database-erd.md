# Database Entity Relationship Diagram (ERD)
## HELPDESK PRO – Relational Database Design

```mermaid
erDiagram
    User ||--o{ Ticket : "creates (requester)"
    User ||--o{ Ticket : "assigned_to"
    User ||--o{ TicketComment : "authors"
    User ||--o{ TicketAssignment : "assigned_by"
    User ||--o{ TicketActivity : "performs"
    User ||--o{ Notification : "receives"
    User ||--o{ RefreshToken : "owns"
    User ||--o{ AuditLog : "initiates"
    User ||--o{ ServiceRating : "rates / rated"
    Department ||--o{ User : "members"
    Department ||--o{ Ticket : "categorized_by_dept"
    TicketCategory ||--o{ Ticket : "classifies"
    SLAPolicy ||--o{ Ticket : "governs"
    Ticket ||--o{ TicketComment : "contains"
    Ticket ||--o{ TicketAttachment : "includes"
    Ticket ||--o{ TicketAssignment : "history"
    Ticket ||--o{ TicketActivity : "audit_trail"
    Ticket ||--o| ServiceRating : "feedback"

    User {
        uuid id PK
        string email UK
        string passwordHash
        string fullName
        string employeeId UK
        string phone
        enum role "SUPER_ADMIN | ADMIN | TECHNICIAN | EMPLOYEE"
        enum status "ACTIVE | INACTIVE | SUSPENDED"
        uuid departmentId FK
        string designation
        string avatarUrl
        datetime joiningDate
        datetime createdAt
        datetime updatedAt
    }

    Department {
        uuid id PK
        string name UK
        string code UK
        string description
        uuid managerId FK
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    TicketCategory {
        uuid id PK
        string name UK
        string code UK
        string description
        enum defaultPriority "LOW | MEDIUM | HIGH | CRITICAL"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    SLAPolicy {
        uuid id PK
        string name UK
        string description
        enum priority "LOW | MEDIUM | HIGH | CRITICAL" UK
        int responseTimeMinutes
        int resolutionTimeMinutes
        boolean isBusinessHoursOnly
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Ticket {
        uuid id PK
        string ticketNumber UK
        string title
        text description
        uuid categoryId FK
        enum priority "LOW | MEDIUM | HIGH | CRITICAL"
        enum status "OPEN | ASSIGNED | IN_PROGRESS | PENDING_USER | PENDING_THIRD_PARTY | RESOLVED | CLOSED"
        uuid requesterId FK
        uuid assigneeId FK
        uuid departmentId FK
        string location
        uuid slaPolicyId FK
        datetime responseDueAt
        datetime resolutionDueAt
        datetime firstResponseAt
        datetime resolvedAt
        datetime closedAt
        boolean isOverdue
        datetime createdAt
        datetime updatedAt
    }

    TicketComment {
        uuid id PK
        uuid ticketId FK
        uuid authorId FK
        text content
        boolean isInternal
        json attachmentsMeta
        datetime createdAt
        datetime updatedAt
    }

    TicketAttachment {
        uuid id PK
        uuid ticketId FK
        uuid commentId FK
        string fileName
        string originalName
        string mimeType
        int sizeBytes
        string fileUrl
        uuid uploadedById FK
        datetime createdAt
    }

    TicketAssignment {
        uuid id PK
        uuid ticketId FK
        uuid previousAssigneeId FK
        uuid newAssigneeId FK
        uuid assignedById FK
        string reason
        datetime createdAt
    }

    TicketActivity {
        uuid id PK
        uuid ticketId FK
        uuid actorId FK
        string actionType
        string fieldChanged
        text oldValue
        text newValue
        text description
        json metadata
        datetime createdAt
    }

    Notification {
        uuid id PK
        uuid userId FK
        string title
        text message
        string type
        string entityType
        uuid entityId
        boolean isRead
        datetime readAt
        datetime createdAt
    }

    RefreshToken {
        uuid id PK
        uuid userId FK
        string tokenHash
        datetime expiresAt
        boolean isRevoked
        datetime createdAt
    }

    AuditLog {
        uuid id PK
        uuid actorId FK
        string action
        string entity
        string entityId
        string ipAddress
        string userAgent
        json details
        datetime createdAt
    }

    ServiceRating {
        uuid id PK
        uuid ticketId FK UK
        uuid requesterId FK
        uuid technicianId FK
        int rating
        text feedback
        datetime createdAt
    }
```

