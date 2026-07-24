import React, { useEffect, useState } from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Checkbox Selection state for Bulk Delete
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    phone: '',
    email: '',
    groupName: 'Agents',
    status: 'Active'
  });

  // Excel Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const [contRes, grpRes] = await Promise.all([
        API.get(`/contacts?search=${encodeURIComponent(search)}&group=${encodeURIComponent(selectedGroup)}`),
        API.get('/groups')
      ]);

      if (contRes.data.success) {
        setContacts(contRes.data.contacts);
      }
      if (grpRes.data.success) {
        setGroups(grpRes.data.groups);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search, selectedGroup]);

  // Handle Add Contact Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/contacts', formData);
      if (res.data.success) {
        setAddModalOpen(false);
        setFormData({ _id: '', name: '', phone: '', email: '', groupName: 'Agents', status: 'Active' });
        fetchContacts();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add contact.');
    }
  };

  // Handle Edit Contact Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/contacts/${formData._id}`, formData);
      if (res.data.success) {
        setEditModalOpen(false);
        fetchContacts();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update contact.');
    }
  };

  // Handle Delete Single Contact
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await API.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (error) {
      alert('Failed to delete contact.');
    }
  };

  // Handle Bulk Delete Contacts
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected contact(s)?`)) return;

    try {
      const res = await API.post('/contacts/bulk-delete', { ids: selectedIds });
      if (res.data.success) {
        setSelectedIds([]);
        fetchContacts();
      }
    } catch (error) {
      alert('Bulk delete failed.');
    }
  };

  // Select / Deselect All Checkboxes
  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map((c) => c._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle Excel / CSV Import Submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please choose an Excel (.xlsx) or CSV file.');

    setUploading(true);
    setImportMsg('');

    const form = new FormData();
    form.append('file', uploadFile);

    try {
      const res = await API.post('/contacts/import', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setImportMsg(res.data.message);
        setTimeout(() => {
          setImportModalOpen(false);
          setUploadFile(null);
          setImportMsg('');
          fetchContacts();
        }, 1500);
      }
    } catch (error) {
      setImportMsg(error.response?.data?.message || 'Import failed.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Export to Excel
  const handleExport = () => {
    window.open(`/api/contacts/export?group=${encodeURIComponent(selectedGroup)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Contact Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage agents and customer lists with Excel/CSV auto-detection import & export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            <Upload className="w-4 h-4" /> Import Excel / CSV
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" /> Export Excel
          </button>

          <button
            onClick={() => {
              setFormData({ _id: '', name: '', phone: '', email: '', groupName: 'Agents', status: 'Active' });
              setAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
            </button>
          )}
        </div>
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
              placeholder="Search by contact name, phone, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 font-semibold"
            >
              <option value="All">All Groups</option>
              {groups.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Contacts Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p>No contacts found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.length === contacts.length ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Group</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contacts.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 text-center">
                      <button onClick={() => toggleSelectOne(c._id)}>
                        {selectedIds.includes(c._id) ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                    <td className="p-3 font-mono font-medium text-slate-600 dark:text-slate-300">{c.phone}</td>
                    <td className="p-3 text-slate-500">{c.email || 'N/A'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {c.groupName || 'General'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setFormData(c);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Contact Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Contact">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Lawrence Addo"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 0241234567 or 233241234567"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="agent@otessdata.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Group</label>
              <select
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">
              Save Contact
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Contact">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Group</label>
              <select
                value={formData.groupName}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">
              Update Contact
            </button>
          </div>
        </form>
      </Modal>

      {/* Excel / CSV Import Modal */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Contacts from Excel (.xlsx) or CSV">
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-xs text-brand-800 dark:text-brand-300">
            <p className="font-bold flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="w-4 h-4" /> Automatic Header Detection Enabled
            </p>
            <p>
              Your file headers will automatically detect <strong>Name</strong>, <strong>Phone</strong>, <strong>Email</strong>, <strong>Group</strong>, and <strong>Status</strong> columns.
            </p>
          </div>

          {importMsg && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-brand-600">
              {importMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-2">Select Spreadsheet File</label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-600 file:text-white hover:file:bg-brand-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2"
            >
              {uploading ? <Spinner size="sm" className="border-white" /> : 'Start Auto Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Contacts;
