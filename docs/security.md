# Security & Compliance Specification
## HELPDESK PRO – Application Security Model

### 1. Authentication & Session Management
- **Passwords**: Hashed with `bcryptjs` using a minimum work factor of 12 salt rounds. Plaintext passwords never hit logs or databases.
- **Access Tokens**: Short-lived JSON Web Tokens (15-minute expiration) containing user ID, role, and department.
- **Refresh Tokens**: Cryptographically strong random 64-byte tokens hashed via SHA-256 before database storage. Delivered exclusively via `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- **Refresh Token Rotation**: Each refresh invalidates the prior token and generates a new pair. Reuse detection triggers revocation of all active sessions for that user.

### 2. Authorization (RBAC) & Tenancy Enforcement
- **Route-level Guard**: Express middleware verifies JWT and checks role permissions against target route whitelist.
- **Entity-level Guard**:
  - Employees can only query tickets where `requesterId == req.user.id`.
  - Technicians can only view unassigned open tickets or tickets assigned to them.
  - Internal comments (`isInternal: true`) are stripped at the ORM layer whenever `req.user.role === 'EMPLOYEE'`.
- **Privilege Escalation Prevention**: Only Super Admins can alter roles or assign Admin privileges.

### 3. Input Validation & Injection Safeguards
- **Zod Schema Validation**: All request bodies, query params, and route parameters pass through typed Zod validators before controller dispatch.
- **SQL Injection Prevention**: Prisma ORM uses parameterized queries for all operations.
- **Cross-Site Scripting (XSS)**: Frontend React escapes rendered output by default; dangerous HTML injection is banned; sanitize user-generated inputs.
- **HTTP Headers**: Helmet middleware automatically configures:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security`

### 4. File Upload Hardening
- Allowed file types: `.png`, `.jpg`, `.jpeg`, `.pdf`, `.docx`, `.xlsx`, `.txt`, `.zip`.
- File content MIME sniffing and extension verification.
- Maximum file size: 10MB per attachment.
- Files stored with non-guessable UUID filenames in restricted directory, avoiding direct web root execution.

### 5. Audit Logging
- Every sensitive operation (user activation, role elevation, ticket assignment, SLA adjustment, password changes) records:
  - `actorId` (acting user)
  - `action` (e.g. `USER_ROLE_CHANGED`)
  - `entity` & `entityId`
  - `ipAddress` & `userAgent`
  - JSON payload diff (excluding passwords/tokens)

