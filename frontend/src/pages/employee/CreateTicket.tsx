import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { TicketCategory, TicketPriority } from '../../types';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PlusCircle, Paperclip, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        if (res.success) {
          setCategories(res.data.filter((c) => c.isActive));
          if (res.data.length > 0) setCategoryId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !categoryId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await ticketService.createTicket({
        title,
        description,
        categoryId,
        priority,
        location,
      });

      if (res.success && res.data) {
        // If file selected, upload
        if (selectedFile) {
          try {
            await ticketService.uploadAttachment(res.data.id, selectedFile);
          } catch (fileErr) {
            console.warn('File upload warning', fileErr);
          }
        }

        setSuccess(true);
        setTimeout(() => {
          navigate(`/employee/tickets/${res.data.id}`);
        }, 1500);
      } else {
        setError(res.error?.message || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Submit IT Service & Support Request
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provide detailed information to assist the service desk with prompt diagnosis and resolution
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Support ticket submitted successfully! Redirecting to ticket tracker...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Issue Subject / Summary <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dual monitor flickering and USB hub disconnection"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Urgency & Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="CRITICAL">Critical — Complete work stoppage, urgent system down</option>
                <option value="HIGH">High — Severe disruption with limited workaround</option>
                <option value="MEDIUM">Medium — Normal request, standard business operations</option>
                <option value="LOW">Low — Minor inconvenience, non-urgent inquiry</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Workstation / Physical Location
            </label>
            <input
              type="text"
              placeholder="e.g. Floor 3, Desk 312 or Remote Home Office"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Please describe when the issue began, what application was open, error messages, and steps already attempted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Upload Screenshot or Log (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200"
              />
              {selectedFile && (
                <span className="text-xs text-slate-400 truncate max-w-xs">{selectedFile.name}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading} icon={<PlusCircle className="w-4 h-4" />}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

