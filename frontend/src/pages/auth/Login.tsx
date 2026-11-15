import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        // Navigate based on role
        switch (res.data.user.role) {
          case 'SUPER_ADMIN':
            navigate('/super-admin/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'TECHNICIAN':
            navigate('/technician/dashboard');
            break;
          case 'EMPLOYEE':
            navigate('/employee/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        setError(res.error?.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 text-white shadow-xl shadow-blue-500/20 mb-4">
          <Headphones className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          HELPDESK<span className="text-brand-600">PRO</span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
          Enterprise IT Service Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 dark:border-slate-800 sm:px-10">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sign in to your portal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your corporate credentials to access the service desk
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Corporate Email Address"
              type="email"
              required
              placeholder="user@helpdeskpro.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> One-Click Role Testing Logins
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('superadmin@helpdeskpro.internal', 'SuperAdmin@Secure2026!')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Super Admin</span>
                <span className="text-[10px] text-slate-400 truncate block">Full System Access</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@helpdeskpro.internal', 'Admin@Secure2026!')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">IT Admin</span>
                <span className="text-[10px] text-slate-400 truncate block">Department & SLA</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('technician@helpdeskpro.internal', 'Tech@Secure2026!')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Technician</span>
                <span className="text-[10px] text-slate-400 truncate block">Tickets & Notes</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('employee@helpdeskpro.internal', 'Employee@Secure2026!')}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Employee</span>
                <span className="text-[10px] text-slate-400 truncate block">Ticket Submission</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Protected by Enterprise 256-bit TLS encryption, RBAC and audit trail.
        </p>
      </div>
    </div>
  );
};

