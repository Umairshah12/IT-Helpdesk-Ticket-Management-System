import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  UserCheck,
  Building,
  Calendar,
  AlertCircle,
  Send,
  Lock,
  Paperclip,
  CheckCircle,
  RotateCcw,
  Star,
  History,
  MessageSquare,
  FileText,
  User,
  ArrowLeft,
} from 'lucide-react';
import { Ticket, Role } from '../../types';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTimeAgo, getPriorityBadgeConfig, getStatusBadgeConfig, getSLAStatus } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Card, CardHeader } from '../common/Card';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';

export const TicketDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin, isAdmin, isTechnician, isEmployee } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments & Notes State
  const [activeTab, setActiveTab] = useState<'conversation' | 'history'>('conversation');
  const [commentContent, setCommentContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [submittingResolve, setSubmittingResolve] = useState(false);

  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingUpload, setSubmittingUpload] = useState(false);

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await ticketService.getTicketById(id);
      if (res.success && res.data) {
        setTicket(res.data);
      } else {
        setError(res.error?.message || 'Ticket could not be loaded');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const loadTechnicians = async () => {
    try {
      const res = await userService.getTechnicians();
      if (res.success && res.data) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.warn('Could not load technicians', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      const res = await ticketService.updateStatus(ticket.id, newStatus as any);
      if (res.success && res.data) {
        setTicket(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !commentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await ticketService.addComment(ticket.id, {
        content: commentContent,
        isInternal: user?.role === 'EMPLOYEE' ? false : isInternal,
      });
      if (res.success && res.data) {
        setTicket(res.data);
        setCommentContent('');
        setIsInternal(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssignSubmit = async () => {
    if (!ticket) return;
    setSubmittingAssign(true);
    try {
      const res = await ticketService.assignTicket(ticket.id, selectedTechId || null, assignReason);
      if (res.success && res.data) {
        setTicket(res.data);
        setAssignModalOpen(false);
        setAssignReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to assign ticket');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!ticket || !resolutionNote.trim()) return;
    setSubmittingResolve(true);
    try {
      const res = await ticketService.resolveTicket(ticket.id, resolutionNote);
      if (res.success && res.data) {
        setTicket(res.data);
        setResolveModalOpen(false);
        setResolutionNote('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to resolve ticket');
    } finally {
      setSubmittingResolve(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!ticket || !reopenReason.trim()) return;
    setSubmittingReopen(true);
    try {
      const res = await ticketService.reopenTicket(ticket.id, reopenReason);
      if (res.success && res.data) {
        setTicket(res.data);
        setReopenModalOpen(false);
        setReopenReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to reopen ticket');
    } finally {
      setSubmittingReopen(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!ticket) return;
    setSubmittingRating(true);
    try {
      const res = await ticketService.rateTicket(ticket.id, {
        rating: ratingValue,
        feedback: ratingFeedback,
      });
      if (res.success && res.data) {
        setTicket(res.data);
        setRatingModalOpen(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !selectedFile) return;

    setSubmittingUpload(true);
    try {
      await ticketService.uploadAttachment(ticket.id, selectedFile);
      setUploadModalOpen(false);
      setSelectedFile(null);
      fetchTicket();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to upload attachment');
    } finally {
      setSubmittingUpload(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-8 text-center bg-white dark:bg-surface-cardDark rounded-2xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          {error || 'Ticket Not Found'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          The requested ticket does not exist or you lack permission to view it.
        </p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Go Back
        </Button>
      </div>
    );
  }

  const priorityCfg = getPriorityBadgeConfig(ticket.priority);
  const statusCfg = getStatusBadgeConfig(ticket.status);
  const isClosedOrResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const slaInfo = getSLAStatus(ticket.resolutionDueAt, isClosedOrResolved);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
              {ticket.ticketNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.text}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${priorityCfg.dot} mr-1.5`} />
              {priorityCfg.label} Priority
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
              {statusCfg.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Opened {formatTimeAgo(ticket.createdAt)}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{ticket.title}</h2>
        </div>

        {/* Action Buttons for Roles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Technician: Accept or start work */}
          {isTechnician && ticket.assigneeId === user?.id && ticket.status === 'ASSIGNED' && (
            <Button
              size="sm"
              onClick={() => handleStatusChange('IN_PROGRESS')}
              icon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Start Progress
            </Button>
          )}

          {/* Technician / Admin: Resolve */}
          {(isTechnician || isAdmin) && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setResolveModalOpen(true)}
              icon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Resolve Ticket
            </Button>
          )}

          {/* Employee: Reopen or Rate */}
          {isEmployee && ticket.status === 'RESOLVED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReopenModalOpen(true)}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reopen Ticket
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRatingModalOpen(true)}
                icon={<Star className="w-3.5 h-3.5 text-amber-300" />}
              >
                Rate Support
              </Button>
            </>
          )}

          {/* Admin: Reassign button */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadTechnicians();
                setAssignModalOpen(true);
              }}
              icon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Assign Technician
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            icon={<Paperclip className="w-3.5 h-3.5" />}
          >
            Attach File
          </Button>
        </div>
      </div>

      {/* Main Grid: 2 Cols content, 1 Col metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Conversation & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description Card */}
          <Card>
            <CardHeader title="Issue Description" subtitle={`Category: ${ticket.category?.name || 'General'}`} />
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>

            {/* Attachments List */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> Attachments ({ticket.attachments.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 hover:border-brand-500 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span className="truncate max-w-[160px]">{att.originalName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Conversation and Activity Tabs */}
          <div className="bg-white dark:bg-surface-cardDark rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 px-4">
              <button
                onClick={() => setActiveTab('conversation')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'conversation'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Conversation ({ticket.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail ({ticket.activities?.length || 0})
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'conversation' ? (
                <div className="space-y-6">
                  {/* Comments Timeline */}
                  <div className="space-y-4">
                    {ticket.comments && ticket.comments.length > 0 ? (
                      ticket.comments.map((comment) => {
                        const isInternalNote = comment.isInternal;
                        return (
                          <div
                            key={comment.id}
                            className={`p-4 rounded-xl border text-xs transition-colors ${
                              isInternalNote
                                ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                                : 'bg-slate-50/80 border-slate-200/80 dark:bg-slate-900/50 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-200">
                                  {comment.author?.fullName?.charAt(0) || 'U'}
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {comment.author?.fullName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  {comment.author?.role?.replace('_', ' ')}
                                </span>
                                {isInternalNote && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                                    <Lock className="w-3 h-3" />
                                    Internal Note
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>

                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">No comments or notes yet.</p>
                    )}
                  </div>

                  {/* Add Comment Input Form */}
                  <form onSubmit={handleAddComment} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Add Response or Update
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Type your message, troubleshooting step or answer..."
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Internal Note Checkbox (Only for Admins & Techs) */}
                      {!isEmployee ? (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300 select-none">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            Internal Troubleshooting Note (Hidden from employee)
                          </span>
                        </label>
                      ) : (
                        <div />
                      )}

                      <Button
                        type="submit"
                        size="sm"
                        loading={submittingComment}
                        icon={<Send className="w-3.5 h-3.5" />}
                      >
                        {isInternal ? 'Post Internal Note' : 'Post Reply'}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* History / Audit Log Tab */
                <div className="space-y-3">
                  {ticket.activities && ticket.activities.length > 0 ? (
                    ticket.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-slate-800 dark:text-slate-200">{act.description}</p>
                          <span className="text-[10px] text-slate-400">{formatDate(act.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No activity history recorded.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Metadata, SLA, Personnel, Ratings */}
        <div className="space-y-6">
          {/* SLA Status Card */}
          <Card>
            <CardHeader title="SLA Monitoring" icon={<Clock className="w-4 h-4 text-brand-500" />} />
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Resolution Target</span>
                <span className={`text-sm font-bold block mt-0.5 ${slaInfo.breached ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>
                  {slaInfo.text}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Deadline: {formatDate(ticket.resolutionDueAt)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">First Response</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {ticket.firstResponseAt ? formatDate(ticket.firstResponseAt) : 'Pending'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block">SLA Policy</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                    {ticket.slaPolicy?.name || 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Technician Card */}
          <Card>
            <CardHeader
              title="Assigned Personnel"
              action={
                isAdmin && (
                  <button
                    onClick={() => {
                      loadTechnicians();
                      setAssignModalOpen(true);
                    }}
                    className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                  >
                    Change
                  </button>
                )
              }
            />
            {ticket.assignee ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-600 dark:text-brand-400 font-bold text-sm flex items-center justify-center">
                  {ticket.assignee.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {ticket.assignee.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500">{ticket.assignee.email}</p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Active Technician
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 mb-2">No technician currently assigned</p>
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      loadTechnicians();
                      setAssignModalOpen(true);
                    }}
                  >
                    Assign Technician
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Requester Information */}
          <Card>
            <CardHeader title="Requester Information" />
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {ticket.requester?.fullName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{ticket.department?.name || 'Department Member'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Employee ID: {ticket.requester?.employeeId || 'EMP'}</span>
              </div>
            </div>
          </Card>

          {/* Rating Display if already rated */}
          {ticket.rating && (
            <Card className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
              <CardHeader title="Employee Satisfaction Rating" />
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < ticket.rating!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-2">
                    {ticket.rating.rating}/5 Stars
                  </span>
                </div>
                {ticket.rating.feedback && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    "{ticket.rating.feedback}"
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Ticket to Technician"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignSubmit} loading={submittingAssign}>
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Select Technician</label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            >
              <option value="">-- Unassigned --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} (Workload: {t.activeWorkload} active)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Assignment Reason / Notes</label>
            <input
              type="text"
              placeholder="e.g. Specialized hardware experience required..."
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
            />
          </div>
        </div>
      </Modal>

      {/* Resolution Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Ticket"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleResolveSubmit} loading={submittingResolve}>
              Mark Resolved
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Provide a clear resolution summary for the requester detailing the steps taken to fix the issue.
          </p>
          <textarea
            rows={4}
            required
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Detailed resolution note..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
          />
        </div>
      </Modal>

      {/* Reopen Modal */}
      <Modal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        title="Reopen Support Ticket"
        maxWidth="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setReopenModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReopenSubmit} loading={submittingReopen}>
              Reopen
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Explain why the resolution did not resolve your issue or what remains outstanding.
          </p>
          <textarea
            rows={3}
            required
            value={reopenReason}
            onChange={(e) => setReopenReason(e.target.value)}
            placeholder="Reason for reopening..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5"
          />
        </div>
      </Modal>

      {/* Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title="Rate IT Support Experience"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRatingModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRatingSubmit} loading={submittingRating}>
              Submit Rating
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-center">
          <p className="text-slate-600 dark:text-slate-400">
            How satisfied are you with the resolution of your ticket?
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRatingValue(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-left">
            <label className="block font-semibold mb-1">Feedback Comments (Optional)</label>
            <textarea
              rows={3}
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              placeholder="Share your experience..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs"
            />
          </div>
        </div>
      </Modal>

      {/* Upload Attachment Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Attachment"
        maxWidth="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleFileUpload} loading={submittingUpload} disabled={!selectedFile}>
              Upload File
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            Accepted formats: PNG, JPG, PDF, DOCX, XLSX, TXT, ZIP (Max 10MB).
          </p>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>
      </Modal>
    </div>
  );
};

