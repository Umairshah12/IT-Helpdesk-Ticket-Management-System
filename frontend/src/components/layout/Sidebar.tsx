import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building2,
  Tags,
  Clock,
  BarChart3,
  ShieldAlert,
  Settings,
  UserCheck,
  PlusCircle,
  UserCircle,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, isSuperAdmin, isAdmin, isTechnician, isEmployee } = useAuth();

  const getNavLinks = () => {
    if (isSuperAdmin) {
      return [
        { to: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/super-admin/admins', label: 'Admins', icon: Shield },
        { to: '/super-admin/users', label: 'All Users', icon: Users },
        { to: '/super-admin/departments', label: 'Departments', icon: Building2 },
        { to: '/super-admin/tickets', label: 'Tickets', icon: Ticket },
        { to: '/super-admin/categories', label: 'Categories', icon: Tags },
        { to: '/super-admin/sla', label: 'SLA Policies', icon: Clock },
        { to: '/super-admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
        { to: '/super-admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
        { to: '/super-admin/settings', label: 'System Settings', icon: Settings },
      ];
    }
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
        { to: '/admin/users', label: 'Employees', icon: Users },
        { to: '/admin/technicians', label: 'Technicians', icon: UserCheck },
        { to: '/admin/departments', label: 'Departments', icon: Building2 },
        { to: '/admin/categories', label: 'Categories', icon: Tags },
        { to: '/admin/sla', label: 'SLA Monitoring', icon: Clock },
        { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
      ];
    }
    if (isTechnician) {
      return [
        { to: '/technician/dashboard', label: 'Technician Hub', icon: LayoutDashboard },
        { to: '/technician/my-tickets', label: 'Assigned Tickets', icon: Ticket },
        { to: '/technician/profile', label: 'My Profile', icon: UserCircle },
      ];
    }
    if (isEmployee) {
      return [
        { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/employee/create-ticket', label: 'Create Ticket', icon: PlusCircle },
        { to: '/employee/my-tickets', label: 'My Tickets', icon: Ticket },
        { to: '/employee/profile', label: 'Profile & Settings', icon: UserCircle },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-navy-800 text-slate-300 transition-all duration-300 ease-in-out border-r border-navy-700/60 shadow-xl',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-700/80 bg-navy-900/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="leading-none">
                <span className="font-extrabold text-base tracking-tight text-white block">
                  HELPDESK<span className="text-brand-500">PRO</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                  Enterprise ITSM
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Tag */}
        {!collapsed && user && (
          <div className="mx-4 mt-4 p-2.5 rounded-lg bg-navy-900/60 border border-navy-700/50 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-brand-500/20 text-brand-400 mt-0.5">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-navy-700">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                      : 'text-slate-300 hover:bg-navy-700/70 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}

                {/* Tooltip on collapsed desktop view */}
                {collapsed && (
                  <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        {!collapsed && (
          <div className="p-4 border-t border-navy-700/60 text-[11px] text-slate-400 bg-navy-900/30 flex items-center justify-between">
            <span>Helpdesk Pro v1.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        )}
      </aside>
    </>
  );
};

