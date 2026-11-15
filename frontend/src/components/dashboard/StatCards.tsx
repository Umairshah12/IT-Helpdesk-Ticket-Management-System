import React from 'react';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Users, Building, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card } from '../common/Card';
import { DashboardStats } from '../../types';

export const StatCards: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Tickets',
      value: stats.totalTickets,
      icon: Ticket,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/50',
      subtext: `${stats.openTickets} open, ${stats.assignedTickets} assigned`,
    },
    {
      label: 'In Progress',
      value: stats.inProgressTickets,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      subtext: `${stats.pendingTickets} pending third-party/user`,
    },
    {
      label: 'Resolved & Closed',
      value: stats.resolvedTickets + stats.closedTickets,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      subtext: `${stats.resolvedTickets} resolved, ${stats.closedTickets} closed`,
    },
    {
      label: 'SLA Overdue',
      value: stats.overdueTickets,
      icon: AlertTriangle,
      color: stats.overdueTickets > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500',
      bg: stats.overdueTickets > 0 ? 'bg-red-50 dark:bg-red-950/50' : 'bg-slate-100 dark:bg-slate-800',
      subtext: stats.overdueTickets > 0 ? 'Urgent attention required' : 'Zero SLA breaches',
    },
    {
      label: 'SLA Compliance',
      value: `${stats.slaCompliancePercentage}%`,
      icon: ShieldCheck,
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      subtext: 'Target compliance: >= 90%',
    },
    {
      label: 'Avg Response Time',
      value: `${stats.avgResponseTimeMinutes}m`,
      icon: TrendingUp,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
      subtext: 'First response target: < 30m',
    },
    {
      label: 'Avg Resolution Time',
      value: `${stats.avgResolutionTimeHours}h`,
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      subtext: 'Resolution speed metric',
    },
    {
      label: 'IT Technicians',
      value: stats.totalTechnicians,
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/50',
      subtext: `${stats.totalEmployees} active employees`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="p-4" hoverEffect>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{c.value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">{c.subtext}</p>
          </Card>
        );
      })}
    </div>
  );
};

