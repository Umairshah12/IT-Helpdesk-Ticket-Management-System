import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import { ticketService } from '../../services/ticketService';
import { DashboardStats, Ticket } from '../../types';
import { StatCards } from '../../components/dashboard/StatCards';
import { DashboardCharts } from '../../components/dashboard/DashboardCharts';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [deptReports, setDeptReports] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, deptsRes, ticketsRes] = await Promise.all([
        reportService.getDashboardStats('30days'),
        reportService.getTicketTrends('monthly'),
        reportService.getDepartmentReports(),
        ticketService.getTickets({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (deptsRes.success) setDeptReports(deptsRes.data);
      if (ticketsRes.success) setRecentTickets(ticketsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">IT Administration Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of department workloads, technician assignments, and SLA resolution tracking
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Overview
        </Button>
      </div>

      {/* KPI Cards */}
      {stats && <StatCards stats={stats} />}

      {/* Analytics Charts */}
      {stats && <DashboardCharts stats={stats} trends={trends} deptReports={deptReports} />}

      {/* Recent Tickets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Service Incidents</h3>
          <Link
            to="/admin/tickets"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Manage All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TicketTable tickets={recentTickets} loading={loading} baseDetailPath="/admin/tickets" />
      </div>
    </div>
  );
};

