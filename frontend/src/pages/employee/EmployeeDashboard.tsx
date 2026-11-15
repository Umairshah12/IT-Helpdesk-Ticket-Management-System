import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { Ticket } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TicketTable } from '../../components/tickets/TicketTable';
import { PlusCircle, Ticket as TicketIcon, Clock, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ticketService.getTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load employee tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status.startsWith('PENDING'));
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-800 to-brand-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
            Self-Service IT Portal
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            How can IT support assist you today, {user?.fullName?.split(' ')[0]}?
          </h2>
          <p className="text-xs text-blue-100 max-w-xl">
            Submit equipment issues, network disruptions, access requests, or track progress on your existing tickets.
          </p>
        </div>

        <Link to="/employee/create-ticket">
          <Button
            size="lg"
            className="bg-white text-navy-800 hover:bg-slate-100 font-bold shadow-lg"
            icon={<PlusCircle className="w-5 h-5 text-brand-600" />}
          >
            Create Support Ticket
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Awaiting Response</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{openTickets.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tickets queued for IT review</p>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Under Investigation</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{inProgressTickets.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Assigned to technician</p>
        </Card>

        <Card className="p-4" hoverEffect>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Resolved & Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{resolvedTickets.length}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Successfully closed</p>
        </Card>
      </div>

      {/* Recent My Tickets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            My Recent Support Requests
          </h3>
          <Link
            to="/employee/my-tickets"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            View Ticket History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TicketTable tickets={tickets} loading={loading} baseDetailPath="/employee/tickets" />
      </div>
    </div>
  );
};

