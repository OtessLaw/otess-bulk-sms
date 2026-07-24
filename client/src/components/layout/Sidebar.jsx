import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  Users,
  FolderGit2,
  FileText,
  History,
  Megaphone,
  BarChart3,
  Sliders,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Send SMS', path: '/send-sms', icon: Send },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Groups', path: '/groups', icon: FolderGit2 },
    { name: 'Templates', path: '/templates', icon: FileText },
    { name: 'SMS History', path: '/history', icon: History },
    { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Arkesel Settings', path: '/settings', icon: Sliders },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Branding */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-brand-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-black text-lg text-white shadow-md">
                O
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-wide leading-tight">OTESS DATA</h1>
                <p className="text-[10px] text-brand-300 uppercase tracking-wider font-semibold">Bulk SMS Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Account & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@otessdata.com'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
