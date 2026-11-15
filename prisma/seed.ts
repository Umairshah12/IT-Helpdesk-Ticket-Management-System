import { PrismaClient, Role, UserStatus, TicketPriority, TicketStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PostgreSQL Database for Helpdesk Pro...');

  // Upsert Default Departments
  const deptIT = await prisma.department.upsert({
    where: { code: 'IT-OPS' },
    update: {},
    create: {
      name: 'Information Technology',
      code: 'IT-OPS',
      description: 'Enterprise IT infrastructure, cybersecurity and end-user computing.',
      isActive: true,
    },
  });

  const deptENG = await prisma.department.upsert({
    where: { code: 'ENG' },
    update: {},
    create: {
      name: 'Software Engineering',
      code: 'ENG',
      description: 'Core product engineering, QA, DevOps and cloud operations.',
      isActive: true,
    },
  });

  // Upsert Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@Secure2026!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@helpdeskpro.internal' },
    update: {},
    create: {
      email: 'superadmin@helpdeskpro.internal',
      passwordHash: superAdminPassword,
      fullName: 'David Sterling (Super Admin)',
      employeeId: 'EMP-0001',
      phone: '+1 (555) 019-2831',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      designation: 'Chief Information Officer (CIO)',
      departmentId: deptIT.id,
    },
  });

  // Upsert IT Admin
  const adminPassword = await bcrypt.hash('Admin@Secure2026!', 10);
  const itAdmin = await prisma.user.upsert({
    where: { email: 'admin@helpdeskpro.internal' },
    update: {},
    create: {
      email: 'admin@helpdeskpro.internal',
      passwordHash: adminPassword,
      fullName: 'Elena Vance (IT Admin)',
      employeeId: 'EMP-0002',
      phone: '+1 (555) 019-2832',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      designation: 'IT Service Desk Manager',
      departmentId: deptIT.id,
    },
  });

  // Upsert Technician
  const techPassword = await bcrypt.hash('Tech@Secure2026!', 10);
  const technician = await prisma.user.upsert({
    where: { email: 'technician@helpdeskpro.internal' },
    update: {},
    create: {
      email: 'technician@helpdeskpro.internal',
      passwordHash: techPassword,
      fullName: 'Marcus Brody (Senior Tech)',
      employeeId: 'TECH-0001',
      phone: '+1 (555) 019-2833',
      role: Role.TECHNICIAN,
      status: UserStatus.ACTIVE,
      designation: 'Senior Systems Administrator',
      departmentId: deptIT.id,
    },
  });

  // Upsert Employee
  const employeePassword = await bcrypt.hash('Employee@Secure2026!', 10);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@helpdeskpro.internal' },
    update: {},
    create: {
      email: 'employee@helpdeskpro.internal',
      passwordHash: employeePassword,
      fullName: 'Jane Doe (Product Designer)',
      employeeId: 'EMP-1001',
      phone: '+1 (555) 019-2835',
      role: Role.EMPLOYEE,
      status: UserStatus.ACTIVE,
      designation: 'Lead UI/UX Designer',
      departmentId: deptENG.id,
    },
  });

  // Default SLA Policies
  const slaCritical = await prisma.sLAPolicy.upsert({
    where: { priority: TicketPriority.CRITICAL },
    update: {},
    create: {
      name: 'Critical Severity SLA',
      description: 'System down, high-impact business halt. Target: 15 min response, 4 hr resolution.',
      priority: TicketPriority.CRITICAL,
      responseTimeMinutes: 15,
      resolutionTimeMinutes: 240,
      isBusinessHoursOnly: false,
    },
  });

  const slaHigh = await prisma.sLAPolicy.upsert({
    where: { priority: TicketPriority.HIGH },
    update: {},
    create: {
      name: 'High Priority SLA',
      description: 'Major impairment with workaround available. Target: 1 hr response, 8 hr resolution.',
      priority: TicketPriority.HIGH,
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 480,
      isBusinessHoursOnly: true,
    },
  });

  // Default Categories
  const catHardware = await prisma.ticketCategory.upsert({
    where: { code: 'HW-01' },
    update: {},
    create: {
      name: 'Hardware Issues',
      code: 'HW-01',
      description: 'Laptops, monitors, workstations and physical accessories.',
      defaultPriority: TicketPriority.MEDIUM,
    },
  });

  const catNetwork = await prisma.ticketCategory.upsert({
    where: { code: 'NET-01' },
    update: {},
    create: {
      name: 'Network Issues',
      code: 'NET-01',
      description: 'LAN, Wi-Fi, Ethernet ports and switch connectivity.',
      defaultPriority: TicketPriority.HIGH,
    },
  });

  console.log('Database seeded successfully with initial users, departments, categories and SLA policies!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

