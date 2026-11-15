import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/departmentService';
import { User, Role, UserStatus, Department } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Plus, Search, Shield, UserX, UserCheck, Edit3 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface UserManagementProps {
  filterRole?: Role;
  title?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ filterRole, title }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | ''>(filterRole || '');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | ''>('');

  // Add User Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formRole, setFormRole] = useState<Role>(filterRole || 'EMPLOYEE');
  const [formDeptId, setFormDeptId] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        userService.getUsers({
          role: selectedRole || undefined,
          status: selectedStatus || undefined,
          search: search || undefined,
        }),
        departmentService.getDepartments(),
      ]);

      if (usersRes.success) setUsers(usersRes.data);
      if (deptsRes.success) setDepartments(deptsRes.data);
    } catch (err) {
      console.error('Failed to load user management records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRole, selectedStatus, search]);

  const handleStatusToggle = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await userService.updateStatus(user.id, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user status');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      const res = await userService.createUser({
        email: formEmail,
        fullName: formFullName,
        employeeId: formEmployeeId,
        role: formRole,
        departmentId: formDeptId || undefined,
        designation: formDesignation,
        phone: formPhone,
      });

      if (res.success) {
        setAddModalOpen(false);
        // Reset form
        setFormEmail('');
        setFormFullName('');
        setFormEmployeeId('');
        setFormDesignation('');
        setFormPhone('');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setSubmittingUser(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {title || 'Enterprise User & Role Management'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provision identities, manage roles, departments, and account access
          </p>
        </div>

        <Button size="sm" onClick={() => setAddModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add New User
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-surface-cardDark p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {!filterRole && (
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role | '')}
            className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="TECHNICIAN">Technician</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        )}

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as UserStatus | '')}
          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white dark:bg-surface-cardDark p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your filter criteria or provision a new user."
        />
      ) : (
        <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-xs">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{u.fullName}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">{u.employeeId}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{u.department?.name || 'General'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{formatDate(u.joiningDate, 'MMM dd, yyyy')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleStatusToggle(u)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title={u.status === 'ACTIVE' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.status === 'ACTIVE' ? (
                          <UserX className="w-4 h-4 text-red-500" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Provision New Corporate Account"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateUser} loading={submittingUser}>
              Create User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rachel Adams"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Corporate Email *</label>
            <input
              type="email"
              required
              placeholder="rachel.adams@helpdeskpro.internal"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Employee ID *</label>
            <input
              type="text"
              required
              placeholder="EMP-1045"
              value={formEmployeeId}
              onChange={(e) => setFormEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Access Role *</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as Role)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="TECHNICIAN">IT Technician</option>
              <option value="ADMIN">IT Administrator</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Department</label>
            <select
              value={formDeptId}
              onChange={(e) => setFormDeptId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            >
              <option value="">-- Assign Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Designation</label>
            <input
              type="text"
              placeholder="e.g. Systems Engineer"
              value={formDesignation}
              onChange={(e) => setFormDesignation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 (555) 019-2840"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

