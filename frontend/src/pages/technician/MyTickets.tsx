import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { TicketTable } from '../../components/tickets/TicketTable';

export const MyTickets: React.FC = () => {
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
          myTickets: 'true' as any,
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
      console.error('Failed to load technician assigned tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, status, priority, categoryId, dateRange, isOverdue, page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          My Assigned Workload
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Service tickets dispatched and routed to your queue
        </p>
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
        baseDetailPath="/technician/tickets"
      />
    </div>
  );
};

