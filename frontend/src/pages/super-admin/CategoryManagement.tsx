import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { TicketCategory, TicketPriority } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Card, CardHeader } from '../../components/common/Card';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Plus, Tags, CheckCircle2, XCircle } from 'lucide-react';
import { getPriorityBadgeConfig } from '../../utils/formatters';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPriority, setDefaultPriority] = useState<TicketPriority>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setDescription('');
    setDefaultPriority('MEDIUM');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: TicketCategory) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code);
    setDescription(cat.description || '');
    setDefaultPriority(cat.defaultPriority);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory.id, {
          name,
          code,
          description,
          defaultPriority,
        });
        if (res.success) {
          setModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await categoryService.createCategory({
          name,
          code,
          description,
          defaultPriority,
        });
        if (res.success) {
          setModalOpen(false);
          loadCategories();
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
            Ticket Categories & Taxonomies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define incident classes, service request categories, and default priority levels
          </p>
        </div>

        <Button size="sm" onClick={handleOpenCreate} icon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="bg-white dark:bg-surface-cardDark p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <TableSkeleton rows={8} cols={5} />
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Category Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Default Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {categories.map((cat) => {
                  const pCfg = getPriorityBadgeConfig(cat.defaultPriority);
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">{cat.code}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-sm truncate">
                        {cat.description || '—'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                          {pCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Ticket Category'}
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={submitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Database Connectivity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Category Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. DB-01"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Default Priority *</label>
            <select
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value as TicketPriority)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what falls under this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

