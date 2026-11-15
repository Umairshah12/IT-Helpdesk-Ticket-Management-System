import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { Ticket, TicketCategory, TicketPriority, TicketStatus } from '../../types';
import { TicketFilters } from '../../components/tickets/TicketFilters';
import { TicketTable } from '../../components/tickets/TicketTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus } from 'lucide-react';

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Create Ticket Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newLocation, setNewLocation] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

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

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setDateRange('');
    setIsOverdue(false);
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      const blob = await ticketService.exportCsv({
        search,
        status,
        priority,
        categoryId,
        isOverdue: isOverdue ? true : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export tickets to CSV');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory) {
      alert('Please select a category');
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await ticketService.createTicket({
        title: newTitle,
        description: newDescription,
        categoryId: newCategory,
        priority: newPriority,
        location: newLocation,
      });
      if (res.success) {
        setCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewCategory('');
        setNewLocation('');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Enterprise Support Ticket Registry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor, assign, and manage enterprise incidents across all operational queues
          </p>
        </div>

        <Button size="sm" onClick={() => setCreateModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Create New Ticket
        </Button>
      </div>

      {/* Filters Component */}
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
        onReset={handleResetFilters}
        onExportCsv={handleExportCsv}
        categories={categories}
      />

      {/* Ticket Table */}
      <TicketTable
        tickets={tickets}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        baseDetailPath="/super-admin/tickets"
      />

      {/* Create Ticket Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create IT Support Request"
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateSubmit} loading={submittingTicket}>
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Issue Subject / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ingress Gateway SSL handshake failure on prod"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Category *</label>
              <select
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Priority Level *</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
              >
                <option value="CRITICAL">Critical (Immediate Service Halt)</option>
                <option value="HIGH">High (Major Work Impairment)</option>
                <option value="MEDIUM">Medium (Normal Operations)</option>
                <option value="LOW">Low (Inquiry / Non-critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Office / Device Location</label>
            <input
              type="text"
              placeholder="e.g. Building B - 4th Floor, Desk 402"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              placeholder="Describe the problem, steps to reproduce, error codes or logs..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

