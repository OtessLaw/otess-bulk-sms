import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileText, SendHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import VariableTags from '../components/sms/VariableTags';
import LivePreview from '../components/sms/LivePreview';
import API from '../api/axiosInstance';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    message: '',
    category: 'General'
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await API.get('/templates');
      if (res.data.success) {
        setTemplates(res.data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleInsertTag = (tagLabel) => {
    setFormData((prev) => ({
      ...prev,
      message: prev.message + tagLabel
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/templates/${formData._id}`, formData);
      } else {
        await API.post('/templates', formData);
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save template.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this SMS template?')) return;
    try {
      await API.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (error) {
      alert('Failed to delete template.');
    }
  };

  // Quick use template in Send SMS page
  const handleUseTemplate = (tpl) => {
    navigate('/send-sms', { state: { templateMessage: tpl.message } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Message Templates</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create reusable message templates with dynamic variable placeholders like <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{`{{name}}`}</code>.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              _id: '',
              title: '',
              message: 'Hello {{name}},\n\nWe are pleased to inform you that our MTN service is now fully stable.\n\nThank you for your patience.\n\nOTESS DATA',
              category: 'General'
            });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Create New Template
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <Card key={tpl._id} className="flex flex-col justify-between hover:border-brand-300 dark:hover:border-brand-700 transition">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {tpl.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setFormData(tpl);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-2">{tpl.title}</h3>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {tpl.message}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
                >
                  <SendHorizontal className="w-3.5 h-3.5" /> Send with Template
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Template' : 'Create New Template'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Template Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. MTN Service Update"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="General, Agents, VIP..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          {/* Interactive Variable Pills */}
          <VariableTags onInsertTag={handleInsertTag} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Template Message Content</label>
              <textarea
                required
                rows={8}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Type your message here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Live Mobile Preview</label>
              <LivePreview rawMessage={formData.message} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs">
              {isEditing ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Templates;
