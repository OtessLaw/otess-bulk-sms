import React, { useEffect, useState } from 'react';
import { Moon, Sun, Menu, RefreshCw, Send, Radio } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance';

const Navbar = ({ onToggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await API.get('/analytics/dashboard');
      if (res.data?.cards?.smsBalance !== undefined) {
        setBalance(res.data.cards.smsBalance);
      }
    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <header className="glass-header h-16 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
            Arkesel SMS Ready
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* SMS Credit Balance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs">
          <Send className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="text-slate-600 dark:text-slate-400 hidden xs:inline">Balance:</span>
          <strong className="text-brand-700 dark:text-brand-300 font-bold">
            {balance !== null ? `${balance} Credits` : 'Loading...'}
          </strong>
          <button
            onClick={fetchBalance}
            disabled={loadingBalance}
            title="Refresh SMS Balance"
            className="p-1 rounded-md text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 transition"
          >
            <RefreshCw className={`w-3 h-3 ${loadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
