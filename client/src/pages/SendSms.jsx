import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Clock, FileSpreadsheet, Users, User, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ProgressBar from '../components/common/ProgressBar';
import VariableTags from '../components/sms/VariableTags';
import LivePreview from '../components/sms/LivePreview';
import API from '../api/axiosInstance';

const SendSms = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [targetType, setTargetType] = useState('Group'); // 'Group', 'Individual', 'UploadedList'
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [individualPhone, setIndividualPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  const [message, setMessage] = useState(
    location.state?.templateMessage ||
      'Hello {{name}},\n\nWe are pleased to inform you that our MTN service is now fully stable.\n\nThank you for your patience.\n\nOTESS DATA'
  );

  const [groups, setGroups] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Progress & Sending state
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);

  // Result modal state
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grpRes, tplRes] = await Promise.all([
          API.get('/groups'),
          API.get('/templates')
        ]);
        if (grpRes.data.success) setGroups(grpRes.data.groups);
        if (tplRes.data.success) setTemplates(tplRes.data.templates);
      } catch (err) {
        console.error('Error loading dropdown choices:', err);
      }
    };
    fetchData();
  }, []);

  const handleInsertTag = (tagLabel) => {
    setMessage((prev) => prev + tagLabel);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!message || message.trim() === '') {
      return alert('Please enter a message.');
    }

    setSending(true);
    setProgress(20);

    try {
      // Simulate incremental progress bar animation
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const res = await API.post(
        '/sms/send',
        {
          targetType,
          groupName: selectedGroup,
          individualPhone,
          message,
          scheduledDate: scheduledDate || null
        },
        { timeout: 0 } // Unlimited timeout for bulk SMS dispatches
      );

      clearInterval(interval);
      setProgress(100);

      if (res.data.success) {
        setSummary(res.data.summary);
        setTimeout(() => {
          setSending(false);
          setResultModalOpen(true);
        }, 500);
      }
    } catch (error) {
      setSending(false);
      setProgress(0);
      alert(error.response?.data?.message || error.message || 'SMS dispatch failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Send Bulk SMS</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Compose personalized SMS messages for your agents, groups, or direct contact lists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Target Recipients & Settings">
            <form onSubmit={handleSend} className="space-y-4">
              {/* Target Type Selector */}
              <div>
                <label className="block text-xs font-semibold mb-2">Select Target Recipient Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetType('Group')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                      targetType === 'Group'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Users className="w-5 h-5 text-brand-500" />
                    <span>Group List</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('Individual')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                      targetType === 'Individual'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <User className="w-5 h-5 text-brand-500" />
                    <span>Individual Phone</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('UploadedList')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition ${
                      targetType === 'UploadedList'
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 text-brand-500" />
                    <span>Excel Contact List</span>
                  </button>
                </div>
              </div>

              {/* Conditional Inputs */}
              {targetType === 'Group' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Choose Contact Group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="All">All Active Contacts</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g.name}>
                        {g.name} ({g.contactCount || 0} contacts)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'Individual' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Individual Phone Number(s)</label>
                  <input
                    type="text"
                    required
                    value={individualPhone}
                    onChange={(e) => setIndividualPhone(e.target.value)}
                    placeholder="Enter phone numbers separated by comma: e.g. 0241234567, 0509876543"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              )}

              {/* Load Template Preset Dropdown */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Load Saved Template Preset</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) setMessage(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200"
                  >
                    <option value="">-- Choose a Saved Template --</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t.message}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variable Insertion Pills */}
              <VariableTags onInsertTag={handleInsertTag} />

              {/* Message Input Box */}
              <div>
                <label className="block text-xs font-semibold mb-1">Message Body</label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Schedule Optional Timestamp */}
              <div>
                <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Schedule Delivery (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Batch Sending Progress Bar */}
              {sending && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <ProgressBar progress={progress} label="Dispatching SMS through Arkesel Gateway..." />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {scheduledDate ? 'Schedule SMS Campaign' : 'Send SMS Now'}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Live Phone Preview */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Live Mobile Phone Preview">
            <LivePreview rawMessage={message} />
          </Card>
        </div>
      </div>

      {/* Result Modal */}
      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title="SMS Dispatch Summary">
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            SMS Batch Execution Finished!
          </h3>

          <div className="grid grid-cols-3 gap-3 my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Total</p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{summary.total}</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-500 font-semibold uppercase">Success</p>
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{summary.success}</p>
            </div>
            <div>
              <p className="text-[10px] text-rose-500 font-semibold uppercase">Failed</p>
              <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{summary.failed}</p>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => {
                setResultModalOpen(false);
                navigate('/history');
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
            >
              View Delivery History Logs
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SendSms;
