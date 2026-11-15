import React from 'react';
import { Search, Filter, Download, X, Clock } from 'lucide-react';
import { TicketPriority, TicketStatus, TicketCategory } from '../../types';
import { Button } from '../common/Button';

interface TicketFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: TicketStatus | '';
  onStatusChange: (val: TicketStatus | '') => void;
  priority: TicketPriority | '';
  onPriorityChange: (val: TicketPriority | '') => void;
  categoryId: string;
  onCategoryChange: (val: string) => void;
  dateRange: string;
  onDateRangeChange: (val: string) => void;
  isOverdue: boolean;
  onOverdueToggle: () => void;
  onReset: () => void;
  onExportCsv?: () => void;
  categories: TicketCategory[];
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  categoryId,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
  isOverdue,
  onOverdueToggle,
  onReset,
  onExportCsv,
  categories,
}) => {
  const hasActiveFilters = Boolean(
    search || status || priority || categoryId || dateRange || isOverdue
  );

  return (
    <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft mb-6 space-y-3">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket ID, subject, or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant={isOverdue ? 'danger' : 'outline'}
            size="sm"
            onClick={onOverdueToggle}
            icon={<Clock className="w-3.5 h-3.5" />}
          >
            {isOverdue ? 'SLA Overdue Only' : 'Filter Overdue'}
          </Button>

          {onExportCsv && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset} icon={<X className="w-3.5 h-3.5" />}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Selects Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as TicketStatus | '')}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PENDING_USER">Pending User</option>
          <option value="PENDING_THIRD_PARTY">Pending 3rd Party</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as TicketPriority | '')}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Category */}
        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-1.5 px-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>
    </div>
  );
};

