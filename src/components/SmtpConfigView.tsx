import React, { useState, useEffect } from 'react';
import { User, SmtpConfig } from '../types';
import {
  Mail,
  Server,
  Shield,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Save,
  Lock,
  Globe,
  Terminal,
  Info,
  Check,
  X,
} from 'lucide-react';

interface SmtpConfigViewProps {
  currentUser: User;
  onSaveSmtpSettings?: (config: SmtpConfig) => void;
}

export const SmtpConfigView: React.FC<SmtpConfigViewProps> = ({
  currentUser,
  onSaveSmtpSettings,
}) => {
  // Security guard check
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [form, setForm] = useState<SmtpConfig>({
    smtpHost: 'smtp.ohb.gov.et',
    smtpPort: 587,
    smtpUsername: 'irb-notifications@ohb.gov.et',
    smtpPassword: '••••••••••••',
    smtpSecurity: 'TLS',
    smtpFromName: 'Oromia Health Bureau IRB System',
    smtpFromEmail: 'irb-noreply@ohb.gov.et',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Test Connection States
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testConnResult, setTestConnResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    banner?: string;
  } | null>(null);

  // Send Test Email States
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState(currentUser.email || 'admin@ohb.gov.et');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
    smtpLogs?: string[];
  } | null>(null);

  // Fetch initial config from backend
  useEffect(() => {
    let isMounted = true;
    const loadSmtpConfig = async () => {
      try {
        const res = await fetch('/api/smtp/config');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setForm({
              smtpHost: json.data.smtpHost || 'smtp.ohb.gov.et',
              smtpPort: json.data.smtpPort || 587,
              smtpUsername: json.data.smtpUsername || 'irb-notifications@ohb.gov.et',
              smtpPassword: json.data.smtpPassword || '••••••••••••',
              smtpSecurity: json.data.smtpSecurity || 'TLS',
              smtpFromName: json.data.smtpFromName || 'Oromia Health Bureau IRB System',
              smtpFromEmail: json.data.smtpFromEmail || 'irb-noreply@ohb.gov.et',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load SMTP config from server:', err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    loadSmtpConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          The Email Configuration page is restricted to <span className="font-bold text-red-700">SUPER_ADMIN</span> users. Please switch roles or contact your system administrator.
        </p>
      </div>
    );
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestConnResult(null);
    try {
      const res = await fetch('/api/smtp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: form.smtpHost,
          smtp_host: form.smtpHost,
          smtpPort: form.smtpPort,
          smtp_port: form.smtpPort,
          smtpSecurity: form.smtpSecurity,
          smtp_security: form.smtpSecurity,
        }),
      });
      const data = await res.json();
      setTestConnResult({
        success: data.success,
        message: data.message || 'SMTP Server ping response received.',
        latencyMs: data.latencyMs,
        banner: data.banner,
      });
    } catch (err: any) {
      setTestConnResult({
        success: false,
        message: `Connection failed: ${err?.message || 'Network error connecting to SMTP host'}`,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/smtp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testRecipient,
          smtpHost: form.smtpHost,
          smtp_host: form.smtpHost,
          smtpPort: form.smtpPort,
          smtp_port: form.smtpPort,
          smtpUsername: form.smtpUsername,
          smtp_username: form.smtpUsername,
          smtpFromName: form.smtpFromName,
          smtp_from_name: form.smtpFromName,
          smtpFromEmail: form.smtpFromEmail,
          smtp_from_email: form.smtpFromEmail,
        }),
      });
      const data = await res.json();
      setTestEmailResult({
        success: data.success,
        message: data.message,
        messageId: data.messageId,
        smtpLogs: data.smtpLogs,
      });
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: `Test email dispatch failed: ${err?.message || 'Server error'}`,
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const payload = {
        smtpHost: form.smtpHost,
        smtp_host: form.smtpHost,
        smtpPort: form.smtpPort,
        smtp_port: form.smtpPort,
        smtpUsername: form.smtpUsername,
        smtp_username: form.smtpUsername,
        smtpPassword: form.smtpPassword,
        smtp_password: form.smtpPassword,
        smtpSecurity: form.smtpSecurity,
        smtp_security: form.smtpSecurity,
        smtpFromName: form.smtpFromName,
        smtp_from_name: form.smtpFromName,
        smtpFromEmail: form.smtpFromEmail,
        smtp_from_email: form.smtpFromEmail,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      };

      const res = await fetch('/api/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('SMTP configuration updated and persisted to system_settings database.');
        if (onSaveSmtpSettings) {
          onSaveSmtpSettings(form);
        }
      } else {
        setSaveErrorMsg(data.message || 'Failed to save SMTP configuration.');
      }
    } catch (err: any) {
      setSaveErrorMsg(`Database save error: ${err?.message || 'Server connection failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Navigation Menu Identifier */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span>/</span>
              <span className="text-[#005BAC] font-bold">Email Configuration</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Mail className="w-7 h-7 text-[#005BAC]" />
              <span>SMTP Server Configuration</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure system-wide outbound SMTP credentials (`system_settings`) for notification dispatch and ethics certificate emails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              SUPER_ADMIN CLEARANCE
            </span>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveErrorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
          <button onClick={() => setSaveErrorMsg('')} className="text-red-600 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#005BAC]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Database Table: system_settings</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">OHB-IRB Mailer v4.2</span>
        </div>

        <form onSubmit={handleSaveConfiguration} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMTP Host */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP Host <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={form.smtpHost}
                  onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                  placeholder="smtp.ohb.gov.et"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Hostname or IP address of the relay server (e.g., `smtp.ohb.gov.et` or `smtp.gmail.com`)</p>
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: parseInt(e.target.value) || 587 })}
                placeholder="587"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Standard ports: 587 (TLS/STARTTLS), 465 (SSL), or 25</p>
            </div>

            {/* SMTP Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.smtpUsername}
                onChange={(e) => setForm({ ...form, smtpUsername: e.target.value })}
                placeholder="irb-notifications@ohb.gov.et"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Authentication username or system mailbox address</p>
            </div>

            {/* SMTP Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.smtpPassword}
                  onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-16 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1.5 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 rounded cursor-pointer"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Encrypted in `system_settings` database storage</p>
            </div>

            {/* SMTP Encryption */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                SMTP Encryption Protocol <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.smtpSecurity === 'TLS'
                      ? 'border-[#005BAC] bg-blue-50/50 text-[#005BAC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="smtpSecurity"
                    value="TLS"
                    checked={form.smtpSecurity === 'TLS'}
                    onChange={() => setForm({ ...form, smtpSecurity: 'TLS' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block text-xs font-bold">TLS / STARTTLS</span>
                    <span className="text-[10px] opacity-75">Port 587 (Recommended)</span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.smtpSecurity === 'SSL'
                      ? 'border-[#005BAC] bg-blue-50/50 text-[#005BAC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="smtpSecurity"
                    value="SSL"
                    checked={form.smtpSecurity === 'SSL'}
                    onChange={() => setForm({ ...form, smtpSecurity: 'SSL' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block text-xs font-bold">SSL Encryption</span>
                    <span className="text-[10px] opacity-75">Port 465</span>
                  </div>
                </label>

                <label
                  className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.smtpSecurity === 'NONE'
                      ? 'border-[#005BAC] bg-blue-50/50 text-[#005BAC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="smtpSecurity"
                    value="NONE"
                    checked={form.smtpSecurity === 'NONE'}
                    onChange={() => setForm({ ...form, smtpSecurity: 'NONE' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block text-xs font-bold">None (Plaintext)</span>
                    <span className="text-[10px] opacity-75">Local development only</span>
                  </div>
                </label>
              </div>
            </div>

            {/* SMTP From Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP From Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.smtpFromName}
                onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                placeholder="Oromia Health Bureau IRB System"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-sans"
              />
              <p className="text-[10px] text-slate-400 mt-1">Display sender name shown in user email inboxes</p>
            </div>

            {/* SMTP From Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                SMTP From Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.smtpFromEmail}
                onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })}
                placeholder="irb-noreply@ohb.gov.et"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] focus:border-[#005BAC] outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Outbound address matching domain SPF / DKIM record</p>
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Server className="w-4 h-4 text-slate-600" />
                )}
                <span>Test SMTP Connection</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTestEmailModalOpen(true)}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#005BAC] text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer border border-blue-200"
              >
                <Send className="w-4 h-4 text-[#005BAC]" />
                <span>Send Test Email</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsTestingConnection(true);
                  try {
                    const res = await fetch('/api/admin/email/test', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipientEmail: currentUser.email || 'admin@ohb.gov.et', userId: currentUser.id }),
                    });
                    const data = await res.json();
                    setTestConnResult({
                      success: data.success,
                      message: data.message,
                      latencyMs: data.diagnostics?.latencyMs,
                      banner: `Host: ${data.diagnostics?.smtpHost}:${data.diagnostics?.smtpPort} | Verified: ${data.diagnostics?.connectionVerified ? 'YES' : 'NO'}`,
                    });
                  } catch (err: any) {
                    setTestConnResult({
                      success: false,
                      message: `Admin Email Test Error: ${err?.message || 'Server error'}`,
                    });
                  } finally {
                    setIsTestingConnection(false);
                  }
                }}
                disabled={isTestingConnection}
                className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer border border-purple-200"
              >
                <Shield className="w-4 h-4 text-purple-700" />
                <span>Run Admin Email Audit</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* Test Connection Output Box */}
      {testConnResult && (
        <div
          className={`rounded-2xl border p-5 transition-all ${
            testConnResult.success
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-red-50/70 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            {testConnResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm">{testConnResult.success ? 'SMTP Connection Successful' : 'SMTP Connection Failed'}</h4>
              <p className="mt-1">{testConnResult.message}</p>
              {testConnResult.banner && (
                <div className="mt-2.5 bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
                  <div>
                    <span className="text-emerald-400">Response Banner:</span> {testConnResult.banner}
                  </div>
                  {testConnResult.latencyMs && (
                    <div>
                      <span className="text-blue-400">Handshake Latency:</span> {testConnResult.latencyMs} ms
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {isTestEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-[#005BAC]" />
                <h3 className="font-extrabold text-base text-slate-900">Send Test Email</h3>
              </div>
              <button
                onClick={() => {
                  setIsTestEmailModalOpen(false);
                  setTestEmailResult(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="admin@ohb.gov.et"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div>
                  <span className="font-bold">Sender:</span> {form.smtpFromName} &lt;{form.smtpFromEmail}&gt;
                </div>
                <div>
                  <span className="font-bold">Relay Host:</span> {form.smtpHost}:{form.smtpPort} ({form.smtpSecurity})
                </div>
              </div>

              {testEmailResult && (
                <div
                  className={`p-3 rounded-xl text-xs space-y-2 ${
                    testEmailResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <p className="font-bold">{testEmailResult.message}</p>
                  {testEmailResult.smtpLogs && (
                    <div className="bg-slate-900 text-slate-300 p-2.5 rounded-lg font-mono text-[10px] max-h-36 overflow-y-auto space-y-0.5">
                      {testEmailResult.smtpLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTestEmailModalOpen(false);
                    setTestEmailResult(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSendingTestEmail}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#005BAC] hover:bg-blue-800 rounded-lg shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSendingTestEmail ? 'Sending...' : 'Dispatch Test'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
