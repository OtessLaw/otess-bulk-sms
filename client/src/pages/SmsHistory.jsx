import React, { useEffect, useState } from 'react';
import { Download, Search, History } from 'lucide-react';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const SmsHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/sms/logs?search=${encodeURIComponent(search)}&status=${encodeURIComponent(statusFilter)}`
      );
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (error) {
      console.error('Error loading SMS history logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, statusFilter]);

  const handleExport = () => {
    window.open(`/api/sms/logs/export?status=${encodeURIComponent(statusFilter)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">SMS Delivery History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit logs of sent SMS messages, delivery status, and credit cost.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          <Download className="w-4 h-4" /> Export Logs to Excel
        </button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by recipient, phone, or message text..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* History Logs Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-2">
            <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p>No SMS logs found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Message Content</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Sender ID</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{log.recipientName}</td>
                    <td className="p-3 font-mono font-medium text-slate-600 dark:text-slate-300">{log.recipientPhone}</td>
                    <td className="p-3 max-w-sm truncate text-slate-700 dark:text-slate-300">{log.message}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.status === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.status === 'Failed'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-500">{log.senderId}</td>
                    <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{log.cost} Credit</td>
                    <td className="p-3 text-right text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
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

export default SmsHistory;
