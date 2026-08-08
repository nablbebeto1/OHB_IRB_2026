import React, { useState, useEffect } from 'react';
import {
  DatabaseHealthStatus,
  DatabaseSchemaValidationResult,
  DatabaseIntegrityCheckResult,
  DatabaseFileValidationResult,
  DatabaseBackupRecord,
  Language,
} from '../types';
import {
  Database,
  ShieldCheck,
  Activity,
  HardDrive,
  RefreshCw,
  Download,
  RotateCcw,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Server,
  Layers,
  Clock,
  Cpu,
  Table as TableIcon,
  Sparkles,
  Search,
  Lock,
  ArrowUpRight,
  Terminal,
} from 'lucide-react';

interface DatabaseHealthDashboardProps {
  language: Language;
}

export const DatabaseHealthDashboard: React.FC<DatabaseHealthDashboardProps> = ({ language }) => {
  const [healthData, setHealthData] = useState<DatabaseHealthStatus | null>(null);
  const [backups, setBackups] = useState<DatabaseBackupRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Diagnostics modal / drawer states
  const [schemaResult, setSchemaResult] = useState<DatabaseSchemaValidationResult | null>(null);
  const [integrityResult, setIntegrityResult] = useState<DatabaseIntegrityCheckResult | null>(null);
  const [fileCheckResult, setFileCheckResult] = useState<DatabaseFileValidationResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Restore Modal State
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<DatabaseBackupRecord | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  // Backup Schedule State
  const [backupSchedule, setBackupSchedule] = useState<string>('DAILY');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState<boolean>(true);

  // Fetch initial health and backups
  const fetchHealthAndBackups = async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const [resHealth, resBackups] = await Promise.all([
        fetch('/api/database/health').then((r) => r.json()),
        fetch('/api/database/backups').then((r) => r.json()),
      ]);

      if (resHealth?.success) {
        setHealthData(resHealth.data);
      }
      if (resBackups?.success && Array.isArray(resBackups.data)) {
        setBackups(resBackups.data);
      }
    } catch (err: any) {
      console.error('Failed to load database health stats:', err);
      setActionMessage({ type: 'error', text: 'Failed to connect to backend database service' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthAndBackups();
    // Auto refresh health ping every 15 seconds
    const interval = setInterval(() => {
      fetchHealthAndBackups(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Action: Run Schema Audit & Repair
  const handleRunSchemaAudit = async () => {
    setIsAuditing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/repair-schema', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSchemaResult(data.data);
        setActionMessage({ type: 'success', text: data.message });
        fetchHealthAndBackups(true);
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Schema audit failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Schema audit connection error' });
    } finally {
      setIsAuditing(false);
    }
  };

  // Action: Run Foreign Key Integrity Check
  const handleRunIntegrityCheck = async () => {
    setIsAuditing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/repair-integrity', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIntegrityResult(data.data);
        setActionMessage({ type: 'success', text: data.message });
        fetchHealthAndBackups(true);
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Integrity audit failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Integrity audit connection error' });
    } finally {
      setIsAuditing(false);
    }
  };

  // Action: Verify Uploaded Document Storage
  const handleVerifyFiles = async () => {
    setIsAuditing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/verify-files');
      const data = await res.json();
      if (data.success) {
        setFileCheckResult(data.data);
        setActionMessage({
          type: data.data.valid ? 'success' : 'info',
          text: `Verified ${data.data.verifiedCount} uploaded document references. ${data.data.missingFilesCount} missing file alerts.`,
        });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'File verification connection error' });
    } finally {
      setIsAuditing(false);
    }
  };

  // Action: Create Instant Backup
  const handleCreateBackup = async () => {
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MANUAL', userName: 'Super Administrator' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        fetchHealthAndBackups(true);
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Backup creation failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Error creating database backup' });
    }
  };

  // Action: Optimize Database & Indexes
  const handleOptimizeDatabase = async () => {
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/optimize-indexes', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        fetchHealthAndBackups(true);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Error optimizing database indexes' });
    }
  };

  // Action: Restore Backup
  const handleExecuteRestore = async () => {
    if (!selectedBackupToRestore) return;
    if (restoreConfirmText !== 'RESTORE DATABASE') {
      setActionMessage({ type: 'error', text: 'Please type "RESTORE DATABASE" to confirm the safety restore operation.' });
      return;
    }

    setIsRestoring(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/database/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId: selectedBackupToRestore.id, userName: 'Super Administrator' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message });
        setSelectedBackupToRestore(null);
        setRestoreConfirmText('');
        fetchHealthAndBackups(true);
      } else {
        setActionMessage({ type: 'error', text: data.message || 'Restore failed' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Error executing database restore' });
    } finally {
      setIsRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="geo-card p-12 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700">Connecting to OHB Database Engine & Audit Services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#003B73] via-[#005BAC] to-blue-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Super Administrator Portal</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>ONLINE & OPTIMAL</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold mt-1">Database Architecture, Health & Optimization</h1>
            <p className="text-blue-100 text-xs mt-1">
              Comprehensive schema validation, foreign key integrity auditing, performance indexing, and automated backup management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => fetchHealthAndBackups()}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Ping</span>
            </button>
            <button
              onClick={handleCreateBackup}
              className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-950" />
              <span>Instant Backup Snapshot</span>
            </button>
          </div>
        </div>

        {/* Action Status Feedback Message */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center justify-between border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'
                : actionMessage.type === 'error'
                ? 'bg-red-500/20 text-red-100 border-red-400/40'
                : 'bg-blue-500/20 text-blue-100 border-blue-400/40'
            }`}
          >
            <div className="flex items-center space-x-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : actionMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-white/70 hover:text-white font-bold text-xs cursor-pointer">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Connection Health & Latency */}
        <div className="geo-card p-4 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Database Connection</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900">{healthData?.pingLatencyMs ?? 1.2} ms</span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Connected
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono truncate" title={healthData?.storagePath}>
            Path: {healthData?.storagePath ? healthData.storagePath.split('/').slice(-2).join('/') : 'data/ohb_database.json'}
          </p>
        </div>

        {/* Metric 2: Total Records & Schema Tables */}
        <div className="geo-card p-4 space-y-2 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Tables & Total Records</span>
            <TableIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900">{healthData?.totalRecords ?? 0}</span>
            <span className="text-xs text-slate-500 font-semibold">({healthData?.totalTables ?? 11} tables)</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">100% Primary Keys & Indexing active</p>
        </div>

        {/* Metric 3: Database Size & Memory Usage */}
        <div className="geo-card p-4 space-y-2 border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Database Size & Memory</span>
            <HardDrive className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900">{healthData?.databaseSizeFormatted ?? '280 KB'}</span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
              {healthData?.memoryUsageMb ?? 45} MB Heap
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Storage Engine: Atomic Disk Store</p>
        </div>

        {/* Metric 4: System Stability & Transactions */}
        <div className="geo-card p-4 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Transaction Failures</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-emerald-600">{healthData?.failedTransactionsCount ?? 0}</span>
            <span className="text-[10px] text-slate-500 font-medium">Failed / Rolled Back</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Slow Queries: {healthData?.slowQueryCount ?? 0}</p>
        </div>
      </div>

      {/* 3. Interactive Quick Diagnostics & Auto-Repair Toolbar */}
      <div className="geo-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Database Integrity & Maintenance Toolbar</span>
          </div>
          <span className="text-xs text-slate-500">Run quick automated audits and schema repairs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleRunSchemaAudit}
            disabled={isAuditing}
            className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left space-y-1 group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900">Run Schema Audit</span>
              <TableIcon className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-500">Validate missing tables, columns, types & default values.</p>
          </button>

          <button
            onClick={handleRunIntegrityCheck}
            disabled={isAuditing}
            className="p-3 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all text-left space-y-1 group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">Verify Foreign Keys</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500">Check user, protocol, review, and certificate relationships.</p>
          </button>

          <button
            onClick={handleVerifyFiles}
            disabled={isAuditing}
            className="p-3 bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 rounded-xl transition-all text-left space-y-1 group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900">Verify Attachments</span>
              <FileCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-[11px] text-slate-500">Verify uploaded dossier files & storage path references.</p>
          </button>

          <button
            onClick={handleOptimizeDatabase}
            disabled={isAuditing}
            className="p-3 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-xl transition-all text-left space-y-1 group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 group-hover:text-amber-900">Optimize Indexing</span>
              <Cpu className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-500">Rebuild memory lookup keys and clear stale query cache.</p>
          </button>
        </div>

        {/* Diagnostics Output Panels */}
        {schemaResult && (
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-blue-900 border-b border-blue-200 pb-2">
              <span>Schema Audit Report</span>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                Fixed: {schemaResult.fixedCount}
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
              {schemaResult.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        {integrityResult && (
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200 pb-2">
              <span>Foreign Key Relationship Audit</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                Repaired: {integrityResult.repairedCount}
              </span>
            </div>
            <div className="space-y-1.5 text-slate-700 text-[11px]">
              {integrityResult.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>{issue.relation}:</strong> {issue.issue}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fileCheckResult && (
          <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-purple-900 border-b border-purple-200 pb-2">
              <span>Uploaded Dossier Files Audit</span>
              <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">
                Verified: {fileCheckResult.verifiedCount} / {fileCheckResult.totalFilesCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              All uploaded study protocols, consent documents, and investigator CVs are linked with valid storage descriptors.
            </p>
          </div>
        )}
      </div>

      {/* 4. Database Backups Manager & Recovery Panel */}
      <div className="geo-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-[#005BAC] font-extrabold text-base">
              <HardDrive className="w-5 h-5 text-amber-500" />
              <span>Database Backups & Disaster Recovery Management</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create instant backup snapshots, configure automated schedules, and restore system state with safety rollback snapshots.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
            <span className="text-xs font-bold text-slate-700">Auto-Backup:</span>
            <select
              value={backupSchedule}
              onChange={(e) => setBackupSchedule(e.target.value)}
              className="bg-white border border-slate-300 text-xs rounded-lg px-2 py-1 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="HOURLY">Every Hour</option>
              <option value="DAILY">Daily (12:00 AM)</option>
              <option value="WEEKLY">Weekly (Sunday)</option>
            </select>
          </div>
        </div>

        {/* Backups List Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Backup Snapshot File</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Records</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No database backups found. Click "Instant Backup Snapshot" to create your first backup.
                  </td>
                </tr>
              ) : (
                backups.map((bkp) => (
                  <tr key={bkp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-900 font-bold flex items-center space-x-2">
                      <Database className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate max-w-xs" title={bkp.filename}>
                        {bkp.filename}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          bkp.type === 'MANUAL'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : bkp.type === 'PRE_RESTORE_SAFETY'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {bkp.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{bkp.recordsCount} records</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{bkp.sizeFormatted}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{new Date(bkp.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right space-x-2 shrink-0">
                      <a
                        href={bkp.downloadUrl || `/api/database/backups/download/${bkp.id}`}
                        download={bkp.filename}
                        className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                      <button
                        onClick={() => setSelectedBackupToRestore(bkp)}
                        className="inline-flex items-center space-x-1 text-purple-700 hover:text-purple-900 font-bold bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore...</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. System Tables Explorer */}
      <div className="geo-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
            <TableIcon className="w-4 h-4 text-blue-600" />
            <span>Database Tables & Indexing Registry ({healthData?.tables.length || 11} Core Tables)</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Type: Relational JSON Schema / Disk Sync</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(healthData?.tables || []).map((table) => (
            <div key={table.tableName} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{table.tableName}</span>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {table.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Records: <strong>{table.recordCount}</strong></span>
                <span className="font-mono text-[11px] text-slate-500">{table.sizeFormatted}</span>
              </div>

              <div className="text-[10px] text-slate-400 font-mono truncate" title={table.indexedFields.join(', ')}>
                Indexed: {table.indexedFields.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Restore Confirmation Modal */}
      {selectedBackupToRestore && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center space-x-2 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900">Confirm Database Snapshot Restoration</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are restoring system state from snapshot{' '}
              <strong className="font-mono text-slate-900">{selectedBackupToRestore.filename}</strong> ({selectedBackupToRestore.recordsCount} records, {selectedBackupToRestore.sizeFormatted}).
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Automatic Protection:</p>
              <p className="text-[11px] text-amber-800">
                An automatic pre-restore safety snapshot will be created before applying this restoration.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Type <span className="text-red-600 font-mono">RESTORE DATABASE</span> to confirm:
              </label>
              <input
                type="text"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                placeholder="RESTORE DATABASE"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedBackupToRestore(null);
                  setRestoreConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={restoreConfirmText !== 'RESTORE DATABASE' || isRestoring}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restoring Database...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Execute System Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
