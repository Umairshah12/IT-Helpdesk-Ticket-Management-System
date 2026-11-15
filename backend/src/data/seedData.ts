import bcrypt from 'bcryptjs';

// Pre-hashed passwords
const superAdminHash = bcrypt.hashSync('SuperAdmin@Secure2026!', 10);
const adminHash = bcrypt.hashSync('Admin@Secure2026!', 10);
const techHash = bcrypt.hashSync('Tech@Secure2026!', 10);
const employeeHash = bcrypt.hashSync('Employee@Secure2026!', 10);

export interface SeedDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeedCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  defaultPriority: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeedSlaPolicy {
  id: string;
  name: string;
  description: string;
  priority: string;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  isBusinessHoursOnly: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeedNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface SeedActivity {
  id: string;
  ticketId: string;
  actorId: string;
  actionType: string;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface SeedTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  location: string | null;
  categoryId: string;
  departmentId: string;
  requesterId: string;
  assigneeId: string | null;
  slaPolicyId: string | null;
  responseDueAt: Date | null;
  resolutionDueAt: Date | null;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  closedAt: Date | null;
  isOverdue: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const SEED_DEPARTMENTS: SeedDepartment[] = [
  {
    id: 'dept-001',
    name: 'Information Technology',
    code: 'IT-OPS',
    description: 'Enterprise IT infrastructure, cybersecurity and end-user computing.',
    managerId: 'user-002',
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'dept-002',
    name: 'Software Engineering',
    code: 'ENG',
    description: 'Core product engineering, QA, DevOps and cloud operations.',
    managerId: null,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'dept-003',
    name: 'Human Resources',
    code: 'HR',
    description: 'Talent acquisition, onboarding, people ops and workplace experience.',
    managerId: null,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'dept-004',
    name: 'Finance & Accounting',
    code: 'FIN',
    description: 'Financial reporting, payroll, budgeting and procurement.',
    managerId: null,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'dept-005',
    name: 'Customer Success',
    code: 'CS',
    description: 'Client onboarding, retention, support and client relationship management.',
    managerId: null,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
];

export const SEED_USERS = [
  {
    id: 'user-001',
    email: 'superadmin@helpdeskpro.internal',
    passwordHash: superAdminHash,
    fullName: 'David Sterling (Super Admin)',
    employeeId: 'EMP-0001',
    phone: '+1 (555) 019-2831',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    designation: 'Chief Information Officer (CIO)',
    departmentId: 'dept-001',
    avatarUrl: null,
    joiningDate: new Date('2024-01-10T09:00:00Z'),
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
  {
    id: 'user-002',
    email: 'admin@helpdeskpro.internal',
    passwordHash: adminHash,
    fullName: 'Elena Vance (IT Admin)',
    employeeId: 'EMP-0002',
    phone: '+1 (555) 019-2832',
    role: 'ADMIN',
    status: 'ACTIVE',
    designation: 'IT Service Desk Manager',
    departmentId: 'dept-001',
    avatarUrl: null,
    joiningDate: new Date('2024-03-15T09:00:00Z'),
    createdAt: new Date('2024-03-15T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
  {
    id: 'user-003',
    email: 'technician@helpdeskpro.internal',
    passwordHash: techHash,
    fullName: 'Marcus Brody (Senior Tech)',
    employeeId: 'TECH-0001',
    phone: '+1 (555) 019-2833',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    designation: 'Senior Systems Administrator',
    departmentId: 'dept-001',
    avatarUrl: null,
    joiningDate: new Date('2024-06-01T09:00:00Z'),
    createdAt: new Date('2024-06-01T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
  {
    id: 'user-004',
    email: 'alex.rivera@helpdeskpro.internal',
    passwordHash: techHash,
    fullName: 'Alex Rivera (IT Technician)',
    employeeId: 'TECH-0002',
    phone: '+1 (555) 019-2834',
    role: 'TECHNICIAN',
    status: 'ACTIVE',
    designation: 'Network & Desktop Support Engineer',
    departmentId: 'dept-001',
    avatarUrl: null,
    joiningDate: new Date('2024-08-15T09:00:00Z'),
    createdAt: new Date('2024-08-15T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
  {
    id: 'user-005',
    email: 'employee@helpdeskpro.internal',
    passwordHash: employeeHash,
    fullName: 'Jane Doe (Product Designer)',
    employeeId: 'EMP-1001',
    phone: '+1 (555) 019-2835',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    designation: 'Lead UI/UX Designer',
    departmentId: 'dept-002',
    avatarUrl: null,
    joiningDate: new Date('2024-10-01T09:00:00Z'),
    createdAt: new Date('2024-10-01T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
  {
    id: 'user-006',
    email: 'sarah.connor@helpdeskpro.internal',
    passwordHash: employeeHash,
    fullName: 'Sarah Connor (Financial Analyst)',
    employeeId: 'EMP-1002',
    phone: '+1 (555) 019-2836',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    designation: 'Senior Financial Analyst',
    departmentId: 'dept-004',
    avatarUrl: null,
    joiningDate: new Date('2024-11-15T09:00:00Z'),
    createdAt: new Date('2024-11-15T09:00:00Z'),
    updatedAt: new Date('2026-01-01T09:00:00Z'),
  },
];

export const SEED_CATEGORIES: SeedCategory[] = [
  { id: 'cat-01', name: 'Hardware Issues', code: 'HW-01', description: 'Laptops, monitors, workstations and physical accessories.', defaultPriority: 'MEDIUM', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-02', name: 'Software Issues', code: 'SW-01', description: 'Desktop applications, IDEs, office suites and licenses.', defaultPriority: 'MEDIUM', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-03', name: 'Network Issues', code: 'NET-01', description: 'LAN, Wi-Fi, Ethernet ports and switch connectivity.', defaultPriority: 'HIGH', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-04', name: 'Internet Connectivity', code: 'NET-02', description: 'Bandwidth drops, DNS issues, external routing outages.', defaultPriority: 'HIGH', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-05', name: 'Email and Outlook', code: 'EML-01', description: 'Mailboxes, calendar invites, spam filters and distribution lists.', defaultPriority: 'MEDIUM', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-06', name: 'Printer and Scanner', code: 'PRN-01', description: 'Office badge printing, network scanners and drivers.', defaultPriority: 'LOW', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-07', name: 'Account and Password', code: 'SEC-01', description: 'SSO login, MFA resets, locked accounts and credential updates.', defaultPriority: 'HIGH', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-08', name: 'Access and Permissions', code: 'SEC-02', description: 'VPN access, GitHub org membership, AWS IAM and folder ACLs.', defaultPriority: 'MEDIUM', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-09', name: 'Operating System', code: 'OS-01', description: 'Windows 11 / macOS / Ubuntu crashes, kernel panics and updates.', defaultPriority: 'MEDIUM', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-10', name: 'Application Errors', code: 'APP-01', description: 'Enterprise ERP, CRM, and internal portal bugs.', defaultPriority: 'HIGH', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-11', name: 'IT Equipment', code: 'EQ-01', description: 'Peripherals, headsets, docking stations and webcams.', defaultPriority: 'LOW', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
  { id: 'cat-12', name: 'Other IT Issues', code: 'OTH-01', description: 'General IT support requests and technical inquiries.', defaultPriority: 'LOW', isActive: true, createdAt: new Date('2026-01-01T08:00:00Z'), updatedAt: new Date('2026-01-01T08:00:00Z') },
];

export const SEED_SLA_POLICIES: SeedSlaPolicy[] = [
  {
    id: 'sla-001',
    name: 'Critical Severity SLA',
    description: 'System down, high-impact business halt. Target: 15 min response, 4 hr resolution.',
    priority: 'CRITICAL',
    responseTimeMinutes: 15,
    resolutionTimeMinutes: 240, // 4 hours
    isBusinessHoursOnly: false,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'sla-002',
    name: 'High Priority SLA',
    description: 'Major impairment with workaround available. Target: 1 hr response, 8 hr resolution.',
    priority: 'HIGH',
    responseTimeMinutes: 60,
    resolutionTimeMinutes: 480, // 8 hours
    isBusinessHoursOnly: true,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'sla-003',
    name: 'Medium Priority SLA',
    description: 'Standard technical request. Target: 4 hr response, 24 hr resolution.',
    priority: 'MEDIUM',
    responseTimeMinutes: 240,
    resolutionTimeMinutes: 1440, // 24 hours
    isBusinessHoursOnly: true,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'sla-004',
    name: 'Low Priority SLA',
    description: 'Routine maintenance, enhancement or inquiry. Target: 8 hr response, 48 hr resolution.',
    priority: 'LOW',
    responseTimeMinutes: 480,
    resolutionTimeMinutes: 2880, // 48 hours
    isBusinessHoursOnly: true,
    isActive: true,
    createdAt: new Date('2026-01-01T08:00:00Z'),
    updatedAt: new Date('2026-01-01T08:00:00Z'),
  },
];

export const SEED_TICKETS: SeedTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TKT-2026-0001',
    title: 'Core Production Gateway Latency & SSL Handshake Failures',
    description: 'Multiple microservices reporting connection timeouts when initiating SSL handshakes with the primary ingress gateway. Affecting internal API communication in production.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    location: 'Building B - Server Room 4',
    categoryId: 'cat-04',
    departmentId: 'dept-002',
    requesterId: 'user-005',
    assigneeId: 'user-003',
    slaPolicyId: 'sla-001',
    responseDueAt: new Date(Date.now() + 10 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() + 180 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 25 * 60 * 1000),
    resolvedAt: null,
    closedAt: null,
    isOverdue: false,
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'tkt-002',
    ticketNumber: 'TKT-2026-0002',
    title: 'Developer MacBook Pro Kernel Panic on External Display Connect',
    description: 'Whenever connecting the USB-C dock to the 4K external display, macOS Sonoma crashes with a GPU panic. Need replacement dock or hardware inspection.',
    priority: 'HIGH',
    status: 'ASSIGNED',
    location: 'Floor 3, Desk 304',
    categoryId: 'cat-01',
    departmentId: 'dept-002',
    requesterId: 'user-005',
    assigneeId: 'user-004',
    slaPolicyId: 'sla-002',
    responseDueAt: new Date(Date.now() + 30 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() + 360 * 60 * 1000),
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    isOverdue: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'tkt-003',
    ticketNumber: 'TKT-2026-0003',
    title: 'VPN Certificate Renewal for Financial Audit Portal',
    description: 'The OpenVPN client fails with certificate expired error when attempting to access the secure accounting subnet for quarterly audits.',
    priority: 'HIGH',
    status: 'OPEN',
    location: 'Remote / Floor 2',
    categoryId: 'cat-08',
    departmentId: 'dept-004',
    requesterId: 'user-006',
    assigneeId: null,
    slaPolicyId: 'sla-002',
    responseDueAt: new Date(Date.now() + 45 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() + 420 * 60 * 1000),
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    isOverdue: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'tkt-004',
    ticketNumber: 'TKT-2026-0004',
    title: 'Accounting Multi-function Network Printer Jam & Toner Empty',
    description: 'The Floor 2 main HP LaserJet enterprise printer shows error code 59.F0 and cyan/magenta toner cartridges are depleted.',
    priority: 'LOW',
    status: 'RESOLVED',
    location: 'Floor 2, Copy Center',
    categoryId: 'cat-06',
    departmentId: 'dept-004',
    requesterId: 'user-006',
    assigneeId: 'user-004',
    slaPolicyId: 'sla-004',
    responseDueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    closedAt: null,
    isOverdue: false,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'tkt-005',
    ticketNumber: 'TKT-2026-0005',
    title: 'Outlook Email Search Indexing Corrupt on Workstation',
    description: 'Searching for emails received prior to this month returns zero results in Outlook 365. Tried rebuilding index through Windows indexing options.',
    priority: 'MEDIUM',
    status: 'CLOSED',
    location: 'Remote Workstation',
    categoryId: 'cat-05',
    departmentId: 'dept-003',
    requesterId: 'user-005',
    assigneeId: 'user-003',
    slaPolicyId: 'sla-003',
    responseDueAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
    closedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    isOverdue: false,
    createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: 'tkt-006',
    ticketNumber: 'TKT-2026-0006',
    title: 'Urgent: Legacy ERP System Database Connection Pool Starvation',
    description: 'Financial month-end batch reconciliation script failed because max pool size (50) was exhausted by zombie connections.',
    priority: 'CRITICAL',
    status: 'PENDING_THIRD_PARTY',
    location: 'Cloud Infrastructure / US-East',
    categoryId: 'cat-10',
    departmentId: 'dept-004',
    requesterId: 'user-006',
    assigneeId: 'user-003',
    slaPolicyId: 'sla-001',
    responseDueAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    resolutionDueAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    firstResponseAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resolvedAt: null,
    closedAt: null,
    isOverdue: true, // Overdue SLA breach demo!
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export const SEED_COMMENTS = [
  {
    id: 'comment-001',
    ticketId: 'tkt-001',
    authorId: 'user-003',
    content: 'Investigating the ingress certificates and HAProxy reload logs. It appears a recent cert-manager rotation generated an intermediate bundle with an incomplete trust chain.',
    isInternal: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: 'comment-002',
    ticketId: 'tkt-001',
    authorId: 'user-003',
    content: 'INTERNAL NOTE: Found that Let\'s Encrypt rate limits were hit on staging. Swapped to corporate wildcard cert in staging secret vault.',
    isInternal: true, // Only visible to admin & tech!
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    updatedAt: new Date(Date.now() - 18 * 60 * 1000),
  },
  {
    id: 'comment-003',
    ticketId: 'tkt-004',
    authorId: 'user-004',
    content: 'Replaced toner cartridges and cleared paper path sensor. Performed test page print successfully.',
    isInternal: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

export const SEED_ACTIVITIES: SeedActivity[] = [
  {
    id: 'act-001',
    ticketId: 'tkt-001',
    actorId: 'user-005',
    actionType: 'CREATED',
    fieldChanged: null,
    oldValue: null,
    newValue: null,
    description: 'Ticket created by Jane Doe with CRITICAL priority.',
    metadata: null,
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    id: 'act-002',
    ticketId: 'tkt-001',
    actorId: 'user-002',
    actionType: 'ASSIGNED',
    fieldChanged: 'assigneeId',
    oldValue: null,
    newValue: 'user-003',
    description: 'Ticket assigned to Marcus Brody by Elena Vance.',
    metadata: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'act-003',
    ticketId: 'tkt-001',
    actorId: 'user-003',
    actionType: 'STATUS_CHANGED',
    fieldChanged: 'status',
    oldValue: 'ASSIGNED',
    newValue: 'IN_PROGRESS',
    description: 'Marcus Brody changed status to IN_PROGRESS.',
    metadata: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
];

export const SEED_NOTIFICATIONS: SeedNotification[] = [
  {
    id: 'notif-001',
    userId: 'user-003',
    title: 'Critical Ticket Assigned',
    message: 'Ticket TKT-2026-0001 (Core Production Gateway Latency) has been assigned to you.',
    type: 'TICKET_ASSIGNED',
    entityType: 'TICKET',
    entityId: 'tkt-001',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    title: 'SLA Breach Detected',
    message: 'Ticket TKT-2026-0006 has breached its resolution SLA target of 4 hours.',
    type: 'SLA_BREACH',
    entityType: 'TICKET',
    entityId: 'tkt-006',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: 'notif-003',
    userId: 'user-005',
    title: 'New Message on Ticket',
    message: 'Marcus Brody replied to your ticket TKT-2026-0001.',
    type: 'NEW_COMMENT',
    entityType: 'TICKET',
    entityId: 'tkt-001',
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
];

export interface SeedAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  details: any;
  createdAt: Date;
}

export const SEED_AUDIT_LOGS: SeedAuditLog[] = [
  {
    id: 'audit-001',
    actorId: 'user-001',
    action: 'SYSTEM_INITIALIZED',
    entity: 'SYSTEM',
    entityId: 'ROOT',
    ipAddress: '127.0.0.1',
    userAgent: 'HelpdeskPro/1.0 Engine',
    details: { version: '1.0.0', seedRecords: 6 },
    createdAt: new Date('2026-01-01T08:00:00Z'),
  },
  {
    id: 'audit-002',
    actorId: 'user-002',
    action: 'TICKET_ASSIGNED',
    entity: 'TICKET',
    entityId: 'tkt-001',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { ticketNumber: 'TKT-2026-0001', assignee: 'user-003' },
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];
