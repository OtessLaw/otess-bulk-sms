import React, { useEffect, useState } from 'react';
import { Sliders, Key, Send, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import API from '../api/axiosInstance';

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: 'OTESS DATA',
    arkeselApiKey: '',
    arkeselSenderId: 'OTESS DATA'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Test Connection State
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/settings');
      if (res.data.success) {
        setFormData({
          companyName: res.data.settings.companyName || 'OTESS DATA',
          arkeselApiKey: res.data.settings.arkeselApiKey || '',
          arkeselSenderId: res.data.settings.arkeselSenderId || 'OTESS DATA'
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');

    try {
      const res = await API.put('/settings', formData);
      if (res.data.success) {
        setSaveMsg('Settings saved successfully in MongoDB database.');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (error) {
      setSaveMsg(error.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await API.post('/settings/test-connection', { apiKey: formData.arkeselApiKey });
      setTestResult(res.data);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Failed to connect to Arkesel API.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Arkesel Gateway Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure your Arkesel SMS API credentials, default Sender ID, and test gateway connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Configuration Form */}
        <div className="lg:col-span-2">
          <Card title="Arkesel API & Sender Credentials">
            {saveMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Company / App Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="OTESS DATA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-brand-500" /> Arkesel API Key
                </label>
                <input
                  type="password"
                  value={formData.arkeselApiKey}
                  onChange={(e) => setFormData({ ...formData, arkeselApiKey: e.target.value })}
                  placeholder="Enter your Arkesel API key (or leave empty for Sandbox mode)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to use the built-in <strong>Arkesel Sandbox Simulator</strong> mode during development.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5 text-brand-500" /> Arkesel Sender ID
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.arkeselSenderId}
                  onChange={(e) => setFormData({ ...formData, arkeselSenderId: e.target.value })}
                  placeholder="OTESS DATA"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-wider"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Sender ID displayed on mobile phones (Max 11 alphanumeric characters).
                </p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings in Database'}
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  {testing ? <Spinner size="sm" className="border-white" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Test Connection & Fetch Balance
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Test Connection Output Card */}
        <div className="lg:col-span-1">
          <Card title="Gateway Connection Status">
            {testResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl text-xs font-semibold border ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm mb-1">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    )}
                    {testResult.success ? 'Gateway Online' : 'Connection Failed'}
                  </div>
                  <p>{testResult.message}</p>
                </div>

                {testResult.success && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Available SMS Credits</p>
                    <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                      {testResult.balance}
                    </p>
                    <span className="text-xs text-slate-500 font-semibold">{testResult.currency}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Click <strong>Test Connection & Fetch Balance</strong> to verify your API credentials with Arkesel.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
