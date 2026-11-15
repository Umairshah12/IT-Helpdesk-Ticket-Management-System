import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';

// Public Pages
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Super Admin Pages
import { SuperAdminDashboard } from '../pages/super-admin/SuperAdminDashboard';
import { UserManagement } from '../pages/super-admin/UserManagement';
import { DepartmentManagement } from '../pages/super-admin/DepartmentManagement';
import { CategoryManagement } from '../pages/super-admin/CategoryManagement';
import { SLAManagement } from '../pages/super-admin/SLAManagement';
import { ReportsAnalytics } from '../pages/super-admin/ReportsAnalytics';
import { AuditLogs } from '../pages/super-admin/AuditLogs';
import { SystemSettings } from '../pages/super-admin/SystemSettings';
import { TicketManagement } from '../pages/super-admin/TicketManagement';
import { TicketDetailView } from '../components/tickets/TicketDetailView';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminTechnicians } from '../pages/admin/AdminTechnicians';

// Technician Pages
import { TechnicianDashboard } from '../pages/technician/TechnicianDashboard';
import { MyTickets } from '../pages/technician/MyTickets';
import { TechnicianProfile } from '../pages/technician/TechnicianProfile';

// Employee Pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { CreateTicket } from '../pages/employee/CreateTicket';
import { EmployeeMyTickets } from '../pages/employee/MyTickets';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route
            path="/super-admin/admins"
            element={<UserManagement filterRole="ADMIN" title="IT Administrators Registry" />}
          />
          <Route path="/super-admin/users" element={<UserManagement />} />
          <Route path="/super-admin/departments" element={<DepartmentManagement />} />
          <Route path="/super-admin/tickets" element={<TicketManagement />} />
          <Route path="/super-admin/tickets/:id" element={<TicketDetailView />} />
          <Route path="/super-admin/categories" element={<CategoryManagement />} />
          <Route path="/super-admin/sla" element={<SLAManagement />} />
          <Route path="/super-admin/reports" element={<ReportsAnalytics />} />
          <Route path="/super-admin/audit-logs" element={<AuditLogs />} />
          <Route path="/super-admin/settings" element={<SystemSettings />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<TicketManagement />} />
          <Route path="/admin/tickets/:id" element={<TicketDetailView />} />
          <Route path="/admin/users" element={<UserManagement filterRole="EMPLOYEE" title="Employee Directory" />} />
          <Route path="/admin/technicians" element={<AdminTechnicians />} />
          <Route path="/admin/departments" element={<DepartmentManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/sla" element={<SLAManagement />} />
          <Route path="/admin/reports" element={<ReportsAnalytics />} />
        </Route>
      </Route>

      {/* Technician Routes */}
      <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/technician/my-tickets" element={<MyTickets />} />
          <Route path="/technician/tickets/:id" element={<TicketDetailView />} />
          <Route path="/technician/profile" element={<TechnicianProfile />} />
        </Route>
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
        <Route element={<MainLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/create-ticket" element={<CreateTicket />} />
          <Route path="/employee/my-tickets" element={<EmployeeMyTickets />} />
          <Route path="/employee/tickets/:id" element={<TicketDetailView />} />
          <Route path="/employee/profile" element={<TechnicianProfile />} />
        </Route>
      </Route>

      {/* Catch-all: Root redirect based on role or login */}
      <Route path="/" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

