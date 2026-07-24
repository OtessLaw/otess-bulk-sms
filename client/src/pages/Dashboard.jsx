import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Send,
  AlertTriangle,
  CreditCard,
  FolderGit2,
  Megaphone,
  ArrowUpRight,
  SendHorizontal
} from 'lucide-react';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cards: {
      totalContacts: 0,
      smsSentToday: 0,
      smsFailedToday: 0,
      smsBalance: 0,
      balanceCurrency: 'SMS Credits',
      simulatedBalance: false,
      totalGroups: 0,
      totalCampaigns: 0
    },
    recentActivities: []
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, groupRes] = await Promise.all([
          API.get('/analytics/dashboard'),
          API.get('/groups')
        ]);

        if (dashRes.data.success) {
          setData(dashRes.data);
        }
        if (groupRes.data.success) {
          setGroups(groupRes.data.groups);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = data.cards;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">OTESS DATA Dashboard</h1>
          <p className="text-xs text-brand-200 mt-1">Overview of contacts, daily SMS dispatches, balance & active agent groups.</p>
        </div>
        <Link
          to="/send-sms"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-lg shadow-brand-500/30 transition"
        >
          <SendHorizontal className="w-4 h-4" /> Compose & Send SMS
        </Link>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <Card className="hover:border-brand-300 dark:hover:border-brand-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Contacts</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {cards.totalContacts.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* SMS Sent Today */}
        <Card className="hover:border-emerald-300 dark:hover:border-emerald-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">SMS Sent Today</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {cards.smsSentToday.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* SMS Failed */}
        <Card className="hover:border-rose-300 dark:hover:border-rose-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">SMS Failed Today</p>
              <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {cards.smsFailedToday.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* SMS Balance */}
        <Card className="hover:border-amber-300 dark:hover:border-amber-700 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Arkesel SMS Balance</p>
              <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {cards.smsBalance.toLocaleString()}
              </h3>
              <span className="text-[10px] text-slate-400">{cards.balanceCurrency}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Middle Grid: Contact Groups & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups Breakdown */}
        <Card
          title="Contact Groups"
          subtitle="Agent & Customer segmentation"
          action={
            <Link to="/groups" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              Manage Groups <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            {groups.slice(0, 5).map((g) => (
              <div
                key={g._id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: g.color || '#3b82f6' }}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{g.name}</p>
                    <p className="text-[10px] text-slate-400">{g.description || 'Category group'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs">
                  {g.contactCount || 0} Contacts
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card
          title="Recent Dispatches"
          subtitle="Latest SMS delivery statuses"
          action={
            <Link to="/history" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              View All History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
          className="lg:col-span-2"
        >
          {data.recentActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No recent SMS activity logged yet. Click <strong>Compose & Send SMS</strong> to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2">Recipient</th>
                    <th className="pb-2">Phone</th>
                    <th className="pb-2">Message Snippet</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.recentActivities.map((act) => (
                    <tr key={act._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{act.recipientName}</td>
                      <td className="py-2.5 font-mono text-slate-500">{act.recipientPhone}</td>
                      <td className="py-2.5 max-w-xs truncate text-slate-600 dark:text-slate-400">{act.message}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            act.status === 'Success'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {act.status}
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
    </div>
  );
};

export default Dashboard;
