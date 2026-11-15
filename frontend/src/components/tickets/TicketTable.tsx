import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../../types';
import { formatDate, getStatusBadgeConfig, getPriorityBadgeConfig, getSLAStatus } from '../../utils/formatters';
import { TableSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ChevronLeft, ChevronRight, Eye, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  baseDetailPath?: string;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  loading,
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  baseDetailPath,
}) => {
  const { isSuperAdmin, isAdmin, isTechnician } = useAuth();

  const getDetailUrl = (ticketId: string) => {
    if (baseDetailPath) return `${baseDetailPath}/${ticketId}`;
    if (isSuperAdmin) return `/super-admin/tickets/${ticketId}`;
    if (isAdmin) return `/admin/tickets/${ticketId}`;
    if (isTechnician) return `/technician/tickets/${ticketId}`;
    return `/employee/tickets/${ticketId}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No support tickets found"
        description="There are currently no tickets matching the selected filters or search query."
      />
    );
  }

  return (
    <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4 min-w-[220px]">Subject & Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Requester</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">SLA Deadline</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
            {tickets.map((t) => {
              const statusCfg = getStatusBadgeConfig(t.status);
              const priorityCfg = getPriorityBadgeConfig(t.priority);
              const isClosedOrResolved = t.status === 'RESOLVED' || t.status === 'CLOSED';
              const slaInfo = getSLAStatus(t.resolutionDueAt, isClosedOrResolved);

              return (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Ticket Number */}
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                    <Link to={getDetailUrl(t.id)} className="hover:underline">
                      {t.ticketNumber}
                    </Link>
                  </td>

                  {/* Title & Category */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={getDetailUrl(t.id)}
                      className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
                    >
                      {t.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {t.category?.name || 'General'}
                      </span>
                      {t.location && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          • {t.location}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${priorityCfg.bg} ${priorityCfg.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
                      {priorityCfg.label}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                    >
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Requester */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="leading-tight">
                      <span className="font-medium text-slate-900 dark:text-slate-100 block">
                        {t.requester?.fullName || '—'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {t.department?.name || 'Employee'}
                      </span>
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {t.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-brand-600/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold flex items-center justify-center">
                          {t.assignee.fullName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {t.assignee.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* SLA Countdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {slaInfo.breached ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {slaInfo.text}
                      </span>
                    ) : slaInfo.nearBreach ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        {slaInfo.text}
                      </span>
                    ) : isClosedOrResolved ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {slaInfo.text}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Link
                      to={getDetailUrl(t.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{tickets.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{total}</strong> tickets
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-slate-700 dark:text-slate-300 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

