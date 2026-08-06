import React from 'react';
import {
  Submission,
  MeetingItem,
  AuditLog,
  UserRole,
  Language,
  CalendarType,
} from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
  User,
  MapPin,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  submissions: Submission[];
  meetings: MeetingItem[];
  auditLogs: AuditLog[];
  currentRole: UserRole;
  language: Language;
  calendar: CalendarType;
  onSelectSubmission: (sub: Submission) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  submissions,
  meetings,
  auditLogs,
  currentRole,
  language,
  calendar,
  onSelectSubmission,
  onNavigateTab,
}) => {
  const t = translations[language];

  const total = submissions.length;
  const approved = submissions.filter((s) => s.status === 'APPROVED').length;
  const underReview = submissions.filter(
    (s) => s.status === 'SCIENTIFIC_REVIEW' || s.status === 'ETHICS_REVIEW' || s.status === 'REVIEWER_ASSIGNMENT'
  ).length;
  const revisions = submissions.filter((s) => s.status === 'REVISIONS_REQUIRED').length;
  const pendingMeetings = meetings.filter((m) => m.status === 'SCHEDULED').length;

  // Chart 1 Data: Geographic Distribution across Oromia Zones
  const zoneCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    zoneCounts[s.zone] = (zoneCounts[s.zone] || 0) + 1;
  });

  const zoneChartData = Object.entries(zoneCounts).map(([zone, count]) => ({
    zone: zone.replace(' Zone', ''),
    count,
  }));

  // Chart 2 Data: Status breakdown
  const statusPieData = [
    { name: 'Approved', value: approved, color: '#10B981' },
    { name: 'Under Review', value: underReview, color: '#3B82F6' },
    { name: 'Revisions', value: revisions, color: '#F59E0B' },
    { name: 'Screening', value: submissions.filter((s) => s.status === 'SECRETARY_SCREENING').length, color: '#8B5CF6' },
  ].filter((d) => d.value > 0);

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">APPROVED</span>;
      case 'REVISIONS_REQUIRED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">REVISIONS REQ.</span>;
      case 'SECRETARY_SCREENING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">SCREENING</span>;
      case 'COMMITTEE_MEETING':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">IN MEETING</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">UNDER REVIEW</span>;
    }
  };

  return (
    <div className="space-[#005BAC] space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#005BAC] to-blue-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center justify-end pr-10">
          <Award className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Oromia Health Bureau Ethical Review Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Review Board (OHB-IRB)
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Enterprise ethical oversight system ensuring human subject protection, scientific integrity, and compliance with Ethiopian National Research Guidelines across all health facilities in Oromia.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('submit-new')}
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{t.navSubmitNew}</span>
            </button>
            <button
              onClick={() => onNavigateTab('verify-public')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg text-xs backdrop-blur-xs transition-all border border-white/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{t.navVerifyPublic}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Widget KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">{t.pendingReviews}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{underReview}</p>
            <span className="text-[10px] text-blue-600 font-medium">In active pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">{t.approvedStudies}</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{approved}</p>
            <span className="text-[10px] text-emerald-700 font-medium">Clearance issued</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">{t.statusRevisions}</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{revisions}</p>
            <span className="text-[10px] text-amber-700 font-medium">Action requested</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">{t.upcomingMeetings}</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">{pendingMeetings}</p>
            <span className="text-[10px] text-purple-700 font-medium">Scheduled panel</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Protocols</p>
            <p className="text-2xl font-extrabold text-[#005BAC] mt-1">{total}</p>
            <span className="text-[10px] text-gray-500 font-medium">Registrations in system</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#005BAC] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Protocol Table & Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Protocols Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/60">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#005BAC]" />
                <span>Active Protocols & Submissions</span>
              </h2>
              <p className="text-[11px] text-gray-500">Overview of recent research ethical clearance applications</p>
            </div>
            <button
              onClick={() => onNavigateTab('submissions')}
              className="text-xs font-bold text-[#005BAC] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All ({submissions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100 overflow-x-auto">
            {submissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub)}
                className="p-4 hover:bg-blue-50/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="font-mono text-xs font-bold text-[#005BAC] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {sub.refNo}
                    </span>
                    {getStatusBadge(sub.status)}
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                      {sub.studyType}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1 hover:text-[#005BAC]">
                    {sub.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-[11px] text-gray-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span>{sub.principalInvestigator.name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{sub.zone}</span>
                    </span>
                    <span>{formatDateWithCalendar(sub.submittedAt, calendar, language)}</span>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <button className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">
                    View Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Status Pie Chart & Next Committee Meeting */}
        <div className="space-y-6">
          {/* Status Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Submission Status Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} protocols`, 'Count']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Next Committee Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-purple-600" />
                <span>Next IRB Committee Panel</span>
              </h3>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                SCHEDULED
              </span>
            </div>

            {meetings.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-bold text-gray-900">{meetings[0].title}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {formatDateWithCalendar(meetings[0].date, calendar, language)} ({meetings[0].time})
                    </span>
                  </p>
                  <p className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{meetings[0].location}</span>
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('committee-meetings')}
                    className="w-full text-center text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 py-1.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    View Meeting Agenda ({meetings[0].protocolIds.length} Protocols)
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-2">No meetings currently scheduled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Zone Distribution Bar Chart & Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Bar Chart: Distribution across Oromia Zones */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Geographic Protocol Distribution by Oromia Zones
              </h3>
              <p className="text-[11px] text-gray-500">Research activity across zonal health departments</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="zone" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${val} studies`, 'Submissions']} />
                <Bar dataKey="count" fill="#005BAC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
            {t.recentActivity}
          </h3>
          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="text-xs pb-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-gray-900 font-bold">{log.userName}</span>
                  <span className="text-[10px] text-gray-400">
                    {formatDateWithCalendar(log.timestamp, calendar, language)}
                  </span>
                </div>
                <p className="text-blue-700 font-mono text-[11px] mt-0.5">{log.action}</p>
                <p className="text-gray-500 text-[10px] truncate">{log.newValue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
