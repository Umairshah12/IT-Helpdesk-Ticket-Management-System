import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Settings, Save, CheckCircle2, Shield, Bell, HardDrive } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    systemName: 'Helpdesk Pro Enterprise',
    allowRegistration: 'true',
    defaultSlaEnforced: 'true',
    emailNotificationsEnabled: 'true',
    maxAttachmentSizeMb: '10',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          Enterprise System Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Global ITSM parameters, security controls, and infrastructure policies
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          System configuration successfully updated and saved to audit registry.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Application Identity */}
        <Card>
          <CardHeader title="Platform Identity" subtitle="Branding and portal name displayed across headers and alerts" />
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portal Display Name
              </label>
              <input
                type="text"
                value={settings.systemName || ''}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full sm:max-w-md rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </Card>

        {/* Security & Access Policies */}
        <Card>
          <CardHeader title="Access & Security Controls" subtitle="User provisioning policies and SLA enforcement" />
          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration === 'true'}
                onChange={(e) =>
                  setSettings({ ...settings, allowRegistration: e.target.checked ? 'true' : 'false' })
                }
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Allow Employee Self-Registration
                </span>
                <span className="text-slate-500 text-[11px]">
                  When enabled, employees can register their account using verified corporate email domains.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-3 border-t border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                checked={settings.defaultSlaEnforced === 'true'}
                onChange={(e) =>
                  setSettings({ ...settings, defaultSlaEnforced: e.target.checked ? 'true' : 'false' })
                }
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Enforce SLA Policy on Ticket Creation
                </span>
                <span className="text-slate-500 text-[11px]">
                  Automatically compute and attach response and resolution deadlines based on ticket priority.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Storage & Limits */}
        <Card>
          <CardHeader title="Attachment Storage Limits" subtitle="Constrain file sizes to protect server storage" />
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Maximum File Attachment Size (MB)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={settings.maxAttachmentSizeMb || '10'}
                onChange={(e) => setSettings({ ...settings, maxAttachmentSizeMb: e.target.value })}
                className="w-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">Recommended limit: 10MB per attachment.</p>
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

