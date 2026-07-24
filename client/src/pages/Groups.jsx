import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FolderGit2, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await API.get('/groups');
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/groups/${formData._id}`, formData);
      } else {
        await API.post('/groups', formData);
      }
      setModalOpen(false);
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save group.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete group "${name}"? Contacts will be reassigned to General.`)) return;
    try {
      await API.delete(`/groups/${id}`);
      fetchGroups();
    } catch (error) {
      alert('Failed to delete group.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Contact Groups</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Segment agents into targeted lists (Agents, Customers, VIP, Inactive Agents).
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({ _id: '', name: '', description: '', color: '#3b82f6' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Create New Group
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card key={g._id} className="hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md font-bold"
                    style={{ backgroundColor: g.color || '#3b82f6' }}
                  >
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{g.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{g.description || 'Custom category group'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setFormData(g);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g._id, g.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Total Active Contacts
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-extrabold text-xs">
                  {g.contactCount || 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Group Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Group' : 'Create New Group'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Group Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Agents, VIP, Inactive Agents"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of contacts in this group"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Badge Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs font-mono text-slate-500">{formData.color}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">
              {isEditing ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Groups;
