import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Button } from '../../components/common/Button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmployeeMyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, catRes] = await Promise.all([
        ticketService.getTickets({
          search,
          status,
          priority,
          categoryId,
          dateRange,
          isOverdue: isOverdue ? true : undefined,
          page,
          limit: 15,
        }),
        categoryService.getCategories(),
      ]);

      if (ticketsRes.success) {
        setTickets(ticketsRes.data);
        if (ticketsRes.meta) {
          setTotalPages(ticketsRes.meta.totalPages);
          setTotal(ticketsRes.meta.total);
        }
      }
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, priority, categoryId, dateRange, isOverdue, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            My Submitted Support Tickets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track real-time progress, response statuses, and feedback requests on your tickets
          </p>
        </div>

        <Link to="/employee/create-ticket">
          <Button size="sm" icon={<PlusCircle className="w-4 h-4" />}>
            New Ticket
          </Button>
        </Link>
      </div>

      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isOverdue={isOverdue}
        onOverdueToggle={() => setIsOverdue(!isOverdue)}
        onReset={() => {
          setSearch('');
          setStatus('');
          setPriority('');
          setCategoryId('');
          setDateRange('');
          setIsOverdue(false);
        }}
        categories={categories}
      />

      <TicketTable
        tickets={tickets}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        baseDetailPath="/employee/tickets"
      />
    </div>
  );
};

