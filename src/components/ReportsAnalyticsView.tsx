import React from 'react';
import { Submission, Language, CalendarType } from '../types';
import { translations } from '../utils/i18n';
import {
  BarChart3,
  Download,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  FileSpreadsheet,
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
  LineChart,
  Line,
} from 'recharts';

interface ReportsAnalyticsViewProps {
  submissions: Submission[];
  language: Language;
  calendar: CalendarType;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  submissions,
  language,
  calendar,
}) => {
  const t = translations[language];

  // Chart 1: Monthly Submissions Trend
  const monthlyData = [
    { month: 'Jan', submissions: 12, approved: 10 },
    { month: 'Feb', submissions: 18, approved: 15 },
    { month: 'Mar', submissions: 24, approved: 19 },
    { month: 'Apr', submissions: 22, approved: 18 },
    { month: 'May', submissions: 30, approved: 24 },
    { month: 'Jun', submissions: 28, approved: 22 },
    { month: 'Jul', submissions: 35, approved: 29 },
    { month: 'Aug', submissions: 18, approved: 14 },
  ];

  // Chart 2: Study Types Breakdown
  const studyTypeCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    studyTypeCounts[s.studyType] = (studyTypeCounts[s.studyType] || 0) + 1;
  });

  const studyTypeChartData = Object.entries(studyTypeCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    count,
  }));

  // Chart 3: Decision Distribution
  const statusCounts: Record<string, number> = {};
  submissions.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const decisionPieData = [
    { name: 'Approved', value: statusCounts['APPROVED'] || 1, color: '#10B981' },
    { name: 'Revisions Req.', value: statusCounts['REVISIONS_REQUIRED'] || 1, color: '#F59E0B' },
    { name: 'Under Review', value: (statusCounts['SCIENTIFIC_REVIEW'] || 0) + (statusCounts['SECRETARY_SCREENING'] || 1), color: '#3B82F6' },
  ];

  const exportCSV = () => {
    let csv = 'RefNo,Title,PI,Zone,Status,StudyType,BudgetETB\n';
    submissions.forEach((s) => {
      csv += `"${s.refNo}","${s.title.replace(/"/g, '""')}","${s.principalInvestigator.name}","${s.zone}","${s.status}","${s.studyType}",${s.budgetETB}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OHB_IRB_Submissions_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>OHB IRB Analytics Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Ethical Oversight Reports & Institutional Analytics</h1>
          <p className="text-blue-100 text-xs mt-1">
            System performance metrics, turnaround times, regional distribution, and ethics clearance compliance data.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Average Turnaround Time</p>
          <p className="text-2xl font-extrabold text-[#005BAC] mt-1">11.4 Days</p>
          <span className="text-[10px] text-emerald-600 font-bold">Target &lt; 14 Days</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Overall Approval Rate</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">84.2%</p>
          <span className="text-[10px] text-gray-500 font-medium">After revisions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Active Ethics Evaluators</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">28 Reviewers</p>
          <span className="text-[10px] text-purple-700 font-medium">Across Oromia & AAU</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500">Total Research Investment</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">8.3M ETB</p>
          <span className="text-[10px] text-gray-500 font-medium">Approved funding value</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
            Submissions & Approvals Monthly Trend
          </h3>
          <div className="h-64 w-full min-w-0 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="submissions" stroke="#005BAC" strokeWidth={2.5} name="Total Submissions" />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2.5} name="Approved Clearance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Type Breakdown Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
            Research Protocol Classification Breakdown
          </h3>
          <div className="h-64 w-full min-w-0 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
              <BarChart data={studyTypeChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
