import React, { useState } from 'react';
import { ProgressReport, Submission, Language, CalendarType } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  FileCheck2,
  Plus,
  Send,
  CheckCircle,
  FileText,
  Search,
} from 'lucide-react';

interface ResearchMonitoringModuleProps {
  progressReports: ProgressReport[];
  submissions: Submission[];
  language: Language;
  calendar: CalendarType;
  onAddReport: (report: Partial<ProgressReport>) => void;
}

export const ResearchMonitoringModule: React.FC<ResearchMonitoringModuleProps> = ({
  progressReports,
  submissions,
  language,
  calendar,
  onAddReport,
}) => {
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'ANNUAL_RENEWAL' | 'SITE_MONITORING' | 'ADVERSE_EVENT' | 'PROTOCOL_DEVIATION' | 'FINAL_REPORT'>('ANNUAL_RENEWAL');
  const [showModal, setShowModal] = useState(false);

  // New Report State
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(submissions[0]?.id || '');
  const [summary, setSummary] = useState('');
  const [enrolledCount, setEnrolledCount] = useState(500);
  const [aeCount, setAeCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = submissions.find((s) => s.id === selectedSubmissionId);
    if (!sub) return;

    onAddReport({
      submissionId: sub.id,
      refNo: sub.refNo,
      title: sub.title,
      piName: sub.principalInvestigator.name,
      type: activeTab,
      submittedDate: new Date().toISOString(),
      summary,
      participantsEnrolled: enrolledCount,
      adverseEventsCount: aeCount,
    });

    setShowModal(false);
    setSummary('');
  };

  const filteredReports = progressReports.filter((r) => r.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>OHB Post-Approval Monitoring</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Research Monitoring & Adverse Event Oversight</h1>
          <p className="text-blue-100 text-xs mt-1">
            Track annual renewals, site audits, protocol deviations, and safety monitoring for active approved studies in Oromia.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Monitoring Report</span>
        </button>
      </div>

      {/* Monitoring Module Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl p-1 shadow-xs overflow-x-auto text-xs font-bold">
        {[
          { key: 'ANNUAL_RENEWAL', label: 'Annual Renewals', icon: RefreshCw },
          { key: 'SITE_MONITORING', label: 'Site Monitoring Logs', icon: Activity },
          { key: 'ADVERSE_EVENT', label: 'Adverse Events (SAE)', icon: AlertTriangle },
          { key: 'PROTOCOL_DEVIATION', label: 'Protocol Deviations', icon: FileCheck2 },
          { key: 'FINAL_REPORT', label: 'Study Closures & Final Reports', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-[#005BAC] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reports List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-blue-50 text-[#005BAC] px-2.5 py-1 rounded border border-blue-100">
                {report.refNo}
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {report.status}
              </span>
            </div>

            <h3 className="text-xs font-bold text-gray-900">{report.title}</h3>

            <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg border">
              <p className="font-semibold text-gray-800">PI: {report.piName}</p>
              <p className="text-gray-600 italic">"{report.summary}"</p>
              <div className="flex space-x-4 text-[10px] text-gray-500 pt-2 border-t border-gray-200">
                <span>Enrolled: {report.participantsEnrolled}</span>
                <span>Adverse Events: {report.adverseEventsCount}</span>
                <span>Submitted: {formatDateWithCalendar(report.submittedDate, calendar, language)}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-2 bg-white p-12 rounded-xl text-center text-gray-500 border">
            No active monitoring reports under this category.
          </div>
        )}
      </div>

      {/* Submit Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 border shadow-xl">
            <h3 className="text-base font-extrabold text-gray-900">Submit Post-Approval Monitoring Report</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Approved Protocol</label>
                <select
                  value={selectedSubmissionId}
                  onChange={(e) => setSelectedSubmissionId(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  {submissions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.refNo} - {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Report Category</label>
                <input
                  type="text"
                  disabled
                  value={activeTab.replace('_', ' ')}
                  className="w-full p-2.5 border rounded-lg bg-gray-100 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Participants Enrolled to Date</label>
                <input
                  type="number"
                  value={enrolledCount}
                  onChange={(e) => setEnrolledCount(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Adverse Events Count</label>
                <input
                  type="number"
                  value={aeCount}
                  onChange={(e) => setAeCount(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Progress & Oversight Narrative Summary</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Detail ongoing field work, participant retention, safety protocols, and key milestones achieved..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005BAC] text-white rounded-lg font-bold"
                >
                  Submit Monitoring Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
