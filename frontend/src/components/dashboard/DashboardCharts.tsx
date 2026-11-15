import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader } from '../common/Card';
import { DashboardStats } from '../../types';

interface DashboardChartsProps {
  stats: DashboardStats;
  trends?: Array<{ label: string; created: number; resolved: number }>;
  deptReports?: Array<{ departmentName: string; totalTickets: number; resolvedTickets: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  Open: '#2563EB',
  Assigned: '#6366F1',
  'In Progress': '#F59E0B',
  Pending: '#A855F7',
  Resolved: '#10B981',
  Closed: '#64748B',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats, trends = [], deptReports = [] }) => {
  const statusData = [
    { name: 'Open', value: stats.openTickets },
    { name: 'Assigned', value: stats.assignedTickets },
    { name: 'In Progress', value: stats.inProgressTickets },
    { name: 'Pending', value: stats.pendingTickets },
    { name: 'Resolved', value: stats.resolvedTickets },
    { name: 'Closed', value: stats.closedTickets },
  ].filter((d) => d.value > 0);

  const fallbackTrends = trends.length > 0 ? trends : [
    { label: 'Jun', created: 24, resolved: 21 },
    { label: 'Jul', created: 32, resolved: 29 },
    { label: 'Aug', created: 28, resolved: 26 },
    { label: 'Sep', created: 40, resolved: 36 },
    { label: 'Oct', created: 35, resolved: 33 },
    { label: 'Nov', created: stats.totalTickets + 12, resolved: stats.resolvedTickets + 10 },
  ];

  const deptData = deptReports.length > 0 ? deptReports : [
    { departmentName: 'IT Ops', totalTickets: 8, resolvedTickets: 6 },
    { departmentName: 'Software Eng', totalTickets: 12, resolvedTickets: 10 },
    { departmentName: 'HR Ops', totalTickets: 5, resolvedTickets: 4 },
    { departmentName: 'Finance', totalTickets: 9, resolvedTickets: 7 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* 1. Monthly Ticket Trends Line Chart */}
      <Card>
        <CardHeader
          title="Ticket Volume & Resolution Trends"
          subtitle="Monthly creation vs resolution velocity"
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fallbackTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Ticket Status Breakdown Donut Chart */}
      <Card>
        <CardHeader
          title="Ticket Status Distribution"
          subtitle="Real-time proportion of active and completed tickets"
        />
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Department-Wise Distribution Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader
          title="Department-Wise Ticket Distribution"
          subtitle="Incident density and resolution breakdown across departments"
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="departmentName" stroke="#64748b" fontSize={11} />
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
              <Bar dataKey="totalTickets" name="Total Tickets" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolvedTickets" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

