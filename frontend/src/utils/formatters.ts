import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { TicketPriority, TicketStatus } from '../types';

export function formatDate(dateString?: string | null, pattern = 'MMM dd, yyyy HH:mm'): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, pattern);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeConfig(status: TicketStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
    case 'ASSIGNED':
      return { label: 'Assigned', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' };
    case 'IN_PROGRESS':
      return { label: 'In Progress', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'PENDING_USER':
      return { label: 'Pending User', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' };
    case 'PENDING_THIRD_PARTY':
      return { label: 'Pending 3rd Party', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    case 'RESOLVED':
      return { label: 'Resolved', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'CLOSED':
      return { label: 'Closed', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' };
    default:
      return { label: status, bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

export function getPriorityBadgeConfig(priority: TicketPriority): { label: string; bg: string; text: string; dot: string } {
  switch (priority) {
    case 'CRITICAL':
      return { label: 'Critical', bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' };
    case 'HIGH':
      return { label: 'High', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' };
    case 'MEDIUM':
      return { label: 'Medium', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' };
    case 'LOW':
      return { label: 'Low', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' };
    default:
      return { label: priority, bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  }
}

export function getSLAStatus(dueAt?: string | null, isResolvedOrClosed = false) {
  if (!dueAt) return { text: 'No SLA', breached: false, nearBreach: false, label: '—' };
  if (isResolvedOrClosed) return { text: 'Met / Closed', breached: false, nearBreach: false, label: 'Closed' };

  try {
    const dueDate = parseISO(dueAt);
    const breached = isPast(dueDate);

    if (breached) {
      return {
        text: `Overdue by ${formatDistanceToNow(dueDate)}`,
        breached: true,
        nearBreach: false,
        label: 'Breached'
      };
    }

    const diffMinutes = (dueDate.getTime() - Date.now()) / (1000 * 60);
    const nearBreach = diffMinutes <= 60; // Less than 1 hour remaining

    return {
      text: `${formatDistanceToNow(dueDate)} left`,
      breached: false,
      nearBreach,
      label: nearBreach ? 'Near Breach' : 'On Track'
    };
  } catch {
    return { text: 'Invalid Date', breached: false, nearBreach: false, label: '—' };
  }
}

