import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { Ticket } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Button } from '../../components/common/Button';
import { Ticket as TicketIcon, Clock, CheckCircle2, AlertTriangle, RefreshCw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getTickets({ myTickets: 'true' as any });
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load technician tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const assignedActive = tickets.filter((t) => t.status === 'ASSIGNED');
  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status.startsWith('PENDING'));
  const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');
  const overdue = tickets.filter((t) => t.isOverdue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Technician Service Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back, {user?.fullName}. Here is your current workload and active service queue.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
          Refresh Queue
        </Button>
      </div>

      {/* Technician KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Awaiting Action</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{assignedActive.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tickets newly assigned</p>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{inProgress.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Under troubleshooting</p>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{resolved.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Successfully closed</p>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">SLA Breached</span>
            <div className={`w-8 h-8 rounded-lg ${overdue.length > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${overdue.length > 0 ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>
            {overdue.length}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Requires immediate attention</p>
        </Card>
      </div>

      {/* Active Workload Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            My Assigned Service Requests
          </h3>
          <Link
            to="/technician/my-tickets"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Open All ({tickets.length})
          </Link>
        </div>

        <TicketTable tickets={tickets} loading={loading} baseDetailPath="/technician/tickets" />
      </div>
    </div>
  );
};

