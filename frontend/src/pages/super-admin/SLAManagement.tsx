import React, { useState, useEffect } from 'react';
import { slaService } from '../../services/slaService';
import { SLAPolicy, TicketPriority } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Card, CardHeader } from '../../components/common/Card';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Plus, Clock, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { getPriorityBadgeConfig } from '../../utils/formatters';

export const SLAManagement: React.FC = () => {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [responseTimeMinutes, setResponseTimeMinutes] = useState(60);
  const [resolutionTimeMinutes, setResolutionTimeMinutes] = useState(480);
  const [isBusinessHoursOnly, setIsBusinessHoursOnly] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [policiesRes, complianceRes] = await Promise.all([
        slaService.getPolicies(),
        slaService.getSLACompliance(),
      ]);
      if (policiesRes.success) setPolicies(policiesRes.data);
      if (complianceRes.success) setCompliance(complianceRes.data);
    } catch (err) {
      console.error('Failed to load SLA policies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (p: SLAPolicy) => {
    setEditingPolicy(p);
    setName(p.name);
    setPriority(p.priority);
    setResponseTimeMinutes(p.responseTimeMinutes);
    setResolutionTimeMinutes(p.resolutionTimeMinutes);
    setIsBusinessHoursOnly(p.isBusinessHoursOnly);
    setDescription(p.description || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPolicy) {
        const res = await slaService.updatePolicy(editingPolicy.id, {
          name,
          responseTimeMinutes: Number(responseTimeMinutes),
          resolutionTimeMinutes: Number(resolutionTimeMinutes),
          isBusinessHoursOnly,
          description,
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
            Service Level Agreement (SLA) Policies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define first-response and full-resolution targets with business-hour calculations
          </p>
        </div>
      </div>

      {/* SLA Compliance KPI Cards */}
      {compliance && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">SLA Compliance Rate</span>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
              {compliance.complianceRate}%
            </p>
            <span className="text-[10px] text-slate-500">Benchmark target: 95%</span>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Tickets Evaluated</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              {compliance.totalEvaluated}
            </p>
            <span className="text-[10px] text-slate-500">Total active & completed</span>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Near Breach (&lt; 1h)</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {compliance.nearBreachCount}
            </p>
            <span className="text-[10px] text-slate-500">Requires prompt action</span>
          </Card>

          <Card className="p-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Overdue Breached</span>
            <p className="text-2xl font-extrabold text-red-600 mt-1">
              {compliance.breachedCount}
            </p>
            <span className="text-[10px] text-slate-500">SLA target violated</span>
          </Card>
        </div>
      )}

      {/* Policies Table */}
      {loading ? (
        <div className="bg-white dark:bg-surface-cardDark p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Policy Name</th>
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">First Response Target</th>
                  <th className="py-3 px-4">Resolution Target</th>
                  <th className="py-3 px-4">Calculation Mode</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {policies.map((p) => {
                  const pCfg = getPriorityBadgeConfig(p.priority);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                        {p.description && (
                          <p className="text-[11px] text-slate-400 font-normal mt-0.5">{p.description}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pCfg.dot}`} />
                          {pCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {p.responseTimeMinutes >= 60
                          ? `${p.responseTimeMinutes / 60} hour(s)`
                          : `${p.responseTimeMinutes} minutes`}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {p.resolutionTimeMinutes >= 60
                          ? `${p.resolutionTimeMinutes / 60} hour(s)`
                          : `${p.resolutionTimeMinutes} minutes`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {p.isBusinessHoursOnly ? '09:00 - 18:00 (Mon-Fri)' : '24x7 Calendar Hours'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                        >
                          Configure
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

      {/* Edit Policy Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Configure SLA Policy Target"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} loading={submitting}>
              Save SLA Policy
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Policy Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">First Response (Minutes) *</label>
              <input
                type="number"
                required
                min={1}
                value={responseTimeMinutes}
                onChange={(e) => setResponseTimeMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Full Resolution (Minutes) *</label>
              <input
                type="number"
                required
                min={1}
                value={resolutionTimeMinutes}
                onChange={(e) => setResolutionTimeMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBusinessHoursOnly}
                onChange={(e) => setIsBusinessHoursOnly(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Business Hours Only (Excludes weekends and after 18:00 UTC)
              </span>
            </label>
          </div>

          <div>
            <label className="block font-semibold mb-1">Policy Description</label>
            <textarea
              rows={3}
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

