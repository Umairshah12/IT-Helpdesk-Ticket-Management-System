import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { ticketService } from '../../services/ticketService';
import { DashboardStats, Ticket } from '../../types';
import { StatCards } from '../../components/dashboard/StatCards';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Card, CardHeader } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [deptReports, setDeptReports] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('30days');

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, deptsRes, ticketsRes] = await Promise.all([
        reportService.getDashboardStats(dateRange),
        reportService.getTicketTrends('monthly'),
        reportService.getDepartmentReports(),
        ticketService.getTickets({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (deptsRes.success) setDeptReports(deptsRes.data);
      if (ticketsRes.success) setRecentTickets(ticketsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Super Administrator Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System-wide operational intelligence, incident analytics, and SLA compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs py-2 px-3 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          <Button variant="outline" size="sm" onClick={loadData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <StatCards stats={stats} />
      ) : null}

      {/* Analytics Charts */}
      {stats && <DashboardCharts stats={stats} trends={trends} deptReports={deptReports} />}

      {/* Recent High-Priority & Latest Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Service Requests</h3>
          <Link
            to="/super-admin/tickets"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            View All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TicketTable tickets={recentTickets} loading={loading} baseDetailPath="/super-admin/tickets" />
      </div>
    </div>
  );
};

