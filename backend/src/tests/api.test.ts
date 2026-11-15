import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { slaCalculator } from '../utils/slaCalculator';

describe('HELPDESK PRO – ENTERPRISE API TEST SUITE', () => {
  let superAdminToken: string;
  let adminToken: string;
  let technicianToken: string;
  let employeeToken: string;

  let createdTicketId: string;

  // 1. Authentication & Role Logins
  it('Scenario 1: Super Admin login returns access token and SUPER_ADMIN role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'superadmin@helpdeskpro.internal',
        password: 'SuperAdmin@Secure2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('SUPER_ADMIN');
    expect(res.body.data.token).toBeDefined();
    superAdminToken = res.body.data.token;
  });

  it('Admin login returns access token and ADMIN role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@helpdeskpro.internal',
        password: 'Admin@Secure2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('ADMIN');
    adminToken = res.body.data.token;
  });

  it('Technician login returns access token and TECHNICIAN role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'technician@helpdeskpro.internal',
        password: 'Tech@Secure2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('TECHNICIAN');
    technicianToken = res.body.data.token;
  });

  it('Employee login returns access token and EMPLOYEE role', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'employee@helpdeskpro.internal',
        password: 'Employee@Secure2026!',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('EMPLOYEE');
    employeeToken = res.body.data.token;
  });

  // 2. Unauthorized API calls rejected
  it('Scenario 7: Unauthorized request without token is rejected with 401', async () => {
    const res = await request(app).get('/api/tickets');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 3. Employee Scope Isolation
  it('Scenario 3: Employee only queries their own tickets', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Every ticket returned must belong to the requesting employee
    res.body.data.forEach((ticket: any) => {
      expect(ticket.requester.email).toBe('employee@helpdeskpro.internal');
    });
  });

  // 4. Ticket Creation and SLA Calculation
  it('Employee creates a new support ticket with SLA deadlines calculated', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'VPN Connection Fails With TLS Handshake Timeout',
        description: 'Unable to connect to internal staging cluster via WireGuard VPN since morning.',
        categoryId: 'cat-03',
        priority: 'HIGH',
        location: 'Remote Workstation',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ticketNumber).toMatch(/^TKT-2026-\d{4}$/);
    expect(res.body.data.responseDueAt).toBeDefined();
    expect(res.body.data.resolutionDueAt).toBeDefined();
    createdTicketId = res.body.data.id;
  });

  // 5. Admin can assign ticket
  it('Scenario 2: Admin assigns ticket to technician', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assigneeId: 'user-003',
        reason: 'Assigned to senior network technician Marcus Brody.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.assignee.id).toBe('user-003');
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  // 6. Technician updates status to IN_PROGRESS
  it('Scenario 4: Technician can update assigned ticket status to IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        status: 'IN_PROGRESS',
        note: 'Started analyzing VPN gateway peer logs.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  // 7. Internal Notes Protection
  it('Technician posts internal note and public comment', async () => {
    // Internal Note
    const resInternal = await request(app)
      .post(`/api/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        content: 'INTERNAL NOTE: Re-keyed WireGuard peer public key in salt-stack.',
        isInternal: true,
      });
    expect(resInternal.status).toBe(200);

    // Public Comment
    const resPublic = await request(app)
      .post(`/api/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${technicianToken}`)
      .send({
        content: 'Please re-download your updated client configuration from the portal.',
        isInternal: false,
      });
    expect(resPublic.status).toBe(200);
  });

  it('Scenario 5: Internal notes are strictly hidden from Employee view', async () => {
    const res = await request(app)
      .get(`/api/tickets/${createdTicketId}`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    const comments = res.body.data.comments;
    // None of the employee visible comments should have isInternal = true
    const internalFound = comments.some((c: any) => c.isInternal === true);
    expect(internalFound).toBe(false);

    // Verify public comment is present
    const publicFound = comments.some((c: any) => c.content.includes('re-download your updated client'));
    expect(publicFound).toBe(true);
  });

  // 8. Super Admin System Management & Audit Logging
  it('Scenario 1: Super Admin queries system audit logs', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Non-super admin cannot access audit logs', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
  });

  // 9. Dashboard Statistics match database data
  it('Scenario 9: Dashboard statistics return valid metrics calculated from real records', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalTickets).toBeGreaterThan(0);
    expect(res.body.data.totalEmployees).toBeGreaterThan(0);
    expect(res.body.data.totalTechnicians).toBeGreaterThan(0);
    expect(res.body.data.slaCompliancePercentage).toBeGreaterThanOrEqual(0);
    expect(res.body.data.slaCompliancePercentage).toBeLessThanOrEqual(100);
  });

  // 10. SLA Deadline Calculation Unit Test
  it('Scenario 10: SLA deadlines calculate business hours correctly', () => {
    const createdAt = new Date('2026-11-16T10:00:00Z'); // Monday 10:00 UTC
    const { responseDueAt, resolutionDueAt } = slaCalculator.calculateDeadlines({
      createdAt,
      responseTimeMinutes: 60, // 1 hour -> 11:00 UTC
      resolutionTimeMinutes: 480, // 8 hours -> 18:00 UTC
      isBusinessHoursOnly: true,
    });

    expect(responseDueAt.getUTCHours()).toBe(11);
    expect(resolutionDueAt.getUTCHours()).toBe(18);
  });
});

