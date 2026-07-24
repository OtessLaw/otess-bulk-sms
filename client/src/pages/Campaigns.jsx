import React, { useEffect, useState } from 'react';
import { Megaphone, Copy, Trash2, BarChart2, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats Modal
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState(null);

  // New Campaign Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'Group',
    groupName: 'Agents'
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await API.get('/campaigns');
      if (res.data.success) {
        setCampaigns(res.data.campaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/campaigns', formData);
      if (res.data.success) {
        setCreateModalOpen(false);
        setFormData({ title: '', message: '', targetType: 'Group', groupName: 'Agents' });
        fetchCampaigns();
      }
    } catch (error) {
      alert('Failed to save campaign draft.');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await API.post(`/campaigns/${id}/duplicate`);
      if (res.data.success) {
        fetchCampaigns();
      }
    } catch (error) {
      alert('Failed to duplicate campaign.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign record?')) return;
    try {
      await API.delete(`/campaigns/${id}`);
      fetchCampaigns();
    } catch (error) {
      alert('Failed to delete campaign.');
    }
  };

  const handleViewStats = async (id) => {
    try {
      const res = await API.get(`/campaigns/${id}/stats`);
      if (res.data.success) {
        setSelectedStats(res.data);
        setStatsModalOpen(true);
      }
    } catch (error) {
      alert('Failed to load campaign statistics.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">SMS Campaigns</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Save draft campaigns, duplicate previous broadcasts, and view execution metrics.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Save New Campaign
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="py-20 text-center text-slate-400 text-xs">
          <Megaphone className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p>No campaigns saved yet. Create a campaign to re-use broadcasts easily.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <Card key={camp._id} className="flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-700 transition">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      camp.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : camp.status === 'Scheduled'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {camp.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(camp._id)}
                      title="Duplicate Campaign"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp._id)}
                      title="Delete Campaign"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">{camp.title}</h3>
                <p className="text-[11px] text-slate-400 mb-3">Target: <strong className="text-slate-700 dark:text-slate-300">{camp.groupName || 'Group'}</strong></p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {camp.message}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Recipients: <strong className="text-slate-800 dark:text-slate-200">{camp.totalRecipients || 0}</strong></span>
                <button
                  onClick={() => handleViewStats(camp._id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold text-xs hover:bg-brand-100 transition"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> View Stats
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Save Campaign Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Save Campaign Draft">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Campaign Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Monthly Commission Broadcast"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Target Group</label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder="Agents, VIP..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Message Content</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Type message template with {{name}} variables..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">
              Save Campaign
            </button>
          </div>
        </form>
      </Modal>

      {/* Campaign Statistics Modal */}
      <Modal isOpen={statsModalOpen} onClose={() => setStatsModalOpen(false)} title="Campaign Performance Statistics">
        {selectedStats && (
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{selectedStats.campaign.title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{selectedStats.stats.total}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-500 font-semibold uppercase">Delivered</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{selectedStats.stats.success}</p>
              </div>
              <div>
                <p className="text-[10px] text-rose-500 font-semibold uppercase">Failed</p>
                <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{selectedStats.stats.failed}</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-500 font-semibold uppercase">Success Rate</p>
                <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">{selectedStats.stats.successRate}%</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStatsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Campaigns;
