import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { UserCheck, Shield, Star, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminTechnicians: React.FC = () => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await userService.getTechnicians();
      if (res.success) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.error('Failed to load technicians', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-brand-600" />
          Technician Staff & Queue Management
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Workload-aware assignment tracking, capacity balancing, and technician availability
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-44 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((t) => (
            <Card key={t.id} hoverEffect className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm">
                    {t.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.fullName}</h4>
                    <p className="text-[11px] text-slate-500">{t.email}</p>
                    <span className="text-[10px] text-slate-400 font-mono font-medium block mt-0.5">
                      ID: {t.employeeId}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}
                >
                  {t.isAvailable ? 'Available' : 'High Load'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Active Workload</span>
                  <span className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                    {t.activeWorkload} tickets
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Resolved</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {t.resolvedCount} tickets
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Role: {t.designation || 'IT Specialist'}</span>
                <span className="text-emerald-600 font-semibold">Ready for Dispatch</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

