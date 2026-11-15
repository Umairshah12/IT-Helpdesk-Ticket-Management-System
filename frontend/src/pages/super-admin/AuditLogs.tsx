import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ShieldAlert, Search, RefreshCw, Eye, Terminal } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');

  // JSON Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: {
          search: search || undefined,
          action: selectedAction || undefined,
          entity: selectedEntity || undefined,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [search, selectedAction, selectedEntity]);

  const viewDetails = (log: AuditLogItem) => {
    setActiveLog(log);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-600" />
            Security & System Audit Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable chronicle of administrative interventions, role modifications, and authentication events
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadLogs} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Logs
        </Button>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-surface-cardDark p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Actions</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_CREATED">USER_CREATED</option>
          <option value="USER_ROLE_ELEVATED">USER_ROLE_ELEVATED</option>
          <option value="TICKET_CREATED">TICKET_CREATED</option>
          <option value="TICKET_ASSIGNED">TICKET_ASSIGNED</option>
          <option value="SYSTEM_SETTINGS_UPDATED">SYSTEM_SETTINGS_UPDATED</option>
        </select>

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Entities</option>
          <option value="USER">USER</option>
          <option value="TICKET">TICKET</option>
          <option value="DEPARTMENT">DEPARTMENT</option>
          <option value="SLA_POLICY">SLA_POLICY</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="bg-white dark:bg-surface-cardDark p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <TableSkeleton rows={7} cols={6} />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No audit log entries found"
          description="There are no security records matching the current filter options."
        />
      ) : (
        <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(log.createdAt, 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-brand-600 dark:text-brand-400 font-semibold">{log.entity}</td>
                    <td className="py-3 px-4 font-sans">
                      {log.actor ? (
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                            {log.actor.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.actor.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Process</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => viewDetails(log)}
                        className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Payload Inspector Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Audit Log Event Payload"
        maxWidth="lg"
        footer={
          <Button variant="outline" size="sm" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        }
      >
        {activeLog && (
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto max-h-96">
              <pre>{JSON.stringify(activeLog, null, 2)}</pre>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Recorded User Agent: {activeLog.userAgent || 'Internal API Client'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

