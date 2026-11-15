import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { ticketService } from '../../services/ticketService';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { Download, RefreshCw, Star, TrendingUp, BarChart3, Users, Building } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [deptReports, setDeptReports] = useState<any[]>([]);
  const [techReports, setTechReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendsRes, deptsRes, techsRes] = await Promise.all([
        reportService.getTicketTrends('monthly'),
        reportService.getDepartmentReports(),
        reportService.getTechnicianReports(),
      ]);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (deptsRes.success) setDeptReports(deptsRes.data);
      if (techsRes.success) setTechReports(techsRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCsv = async () => {
    try {
      const blob = await ticketService.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `itsm_report_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Reports & Service Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit departmental ticket loads, technician resolution velocity, and customer satisfaction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} icon={<RefreshCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={handleExportCsv} icon={<Download className="w-3.5 h-3.5" />}>
            Export Master CSV
          </Button>
        </div>
      </div>

      {/* Main Trends Chart */}
      <Card>
        <CardHeader
          title="Operational Throughput"
          subtitle="Monthly volume of incident creation vs completed resolutions"
        />
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="created" name="Tickets Created" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Tickets Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Technician Performance Table */}
      <Card>
        <CardHeader
          title="Technician Performance & CSAT Scorecard"
          subtitle="Workload volume, resolution speed, and employee satisfaction rating"
        />
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Assigned Tickets</th>
                  <th className="py-3 px-4">Resolved Tickets</th>
                  <th className="py-3 px-4">Avg Resolution Time</th>
                  <th className="py-3 px-4 text-right">CSAT Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {techReports.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{t.fullName}</p>
                      <p className="text-[11px] text-slate-400">{t.email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold">{t.assignedCount}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {t.resolvedCount}
                    </td>
                    <td className="py-3 px-4 font-mono">{t.avgResolutionHours} hrs</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {t.ratingAverage} / 5.0
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Department SLA Scorecard */}
      <Card>
        <CardHeader
          title="Department Service SLA Compliance"
          subtitle="Ticket volume and SLA compliance percentage per department"
        />
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Total Tickets</th>
                  <th className="py-3 px-4">Resolved</th>
                  <th className="py-3 px-4 text-right">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                {deptReports.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                      {d.departmentName}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">{d.code}</td>
                    <td className="py-3 px-4">{d.totalTickets}</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                      {d.resolvedTickets}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          d.slaCompliance >= 90
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {d.slaCompliance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

