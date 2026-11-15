import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { userService } from '../../services/userService';
import { Department, User } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Card, CardHeader } from '../../components/common/Card';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Plus, Building2, Users, Ticket, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptsRes, usersRes] = await Promise.all([
        departmentService.getDepartments(),
        userService.getUsers(),
      ]);
      if (deptsRes.success) setDepartments(deptsRes.data);
      if (usersRes.success) setTechnicians(usersRes.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setManagerId('');
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
    setManagerId(dept.managerId || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDept) {
        const res = await departmentService.updateDepartment(editingDept.id, {
          name,
          code,
          description,
          managerId: managerId || undefined,
        });
        if (res.success) {
          setModalOpen(false);
          loadData();
        }
      } else {
        const res = await departmentService.createDepartment({
          name,
          code,
          description,
          managerId: managerId || undefined,
        });
        if (res.success) {
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Department & Organizational Units
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure enterprise departments, routing queues, and designated managers
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Department
        </Button>
      </div>

      {/* Grid of Departments */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-44 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{dept.name}</h4>
                      <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">
                        CODE: {dept.code}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      dept.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    }`}
                  >
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {dept.description || 'Enterprise functional business unit.'}
                </p>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-300 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.memberCount || 0} Members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-500" />
                    <span>{dept.openTicketCount || 0} Open Tickets</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Manager: <strong className="text-slate-700 dark:text-slate-200">{dept.manager?.fullName || 'Unassigned'}</strong>
                </span>
                <button
                  onClick={() => handleOpenEdit(dept)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Edit
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department Details' : 'Create New Department'}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={submitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cybersecurity & Compliance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SEC-OPS"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Department Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            >
              <option value="">-- No Manager Assigned --</option>
              {technicians.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe department responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

