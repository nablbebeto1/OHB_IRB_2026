import React, { useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Language,
  CalendarType,
  Submission,
  SubmissionStatus,
  MeetingItem,
  ProgressReport,
  AuditLog,
  NotificationItem,
  SystemSettings,
  ReviewScoreCard,
} from './types';
import {
  initialUsers,
  initialSubmissions,
  initialMeetings,
  initialProgressReports,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
} from './data/initialData';
import { translations } from './utils/i18n';
import { formatDateWithCalendar } from './utils/calendar';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SubmissionWizard } from './components/SubmissionWizard';
import { SubmissionDetailModal } from './components/SubmissionDetailModal';
import { ReviewerWorkspace } from './components/ReviewerWorkspace';
import { CommitteeMeetingModule } from './components/CommitteeMeetingModule';
import { ResearchMonitoringModule } from './components/ResearchMonitoringModule';
import { CertificateGeneratorModal } from './components/CertificateGeneratorModal';
import { CertificateVerificationView } from './components/CertificateVerificationView';
import { ReportsAnalyticsView } from './components/ReportsAnalyticsView';
import { UserManagementView } from './components/UserManagementView';
import { SmtpConfigView } from './components/SmtpConfigView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { OromiaLogo } from './components/OromiaLogo';
import { LoginPage } from './components/LoginPage';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';

import {
  Search,
  X,
  FileText,
  Shield,
  Bell,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  Award,
  Sparkles,
  Settings as SettingsIcon,
  Globe,
  Building,
  Save,
  Check,
  History,
  Info,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ohb_irb_authenticated') === 'true';
  });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('IRB_ADMIN');
  const [language, setLanguage] = useState<Language>('en');
  const [calendar, setCalendar] = useState<CalendarType>('GC');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Core State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [meetings, setMeetings] = useState<MeetingItem[]>(initialMeetings);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>(initialProgressReports);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);

  // Modal / Interactivity States
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedCertSubmission, setSelectedCertSubmission] = useState<Submission | null>(null);
  const [verificationRefNo, setVerificationRefNo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Submissions Tab Filter State
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<string>('ALL');
  const [submissionFilterType, setSubmissionFilterType] = useState<string>('ALL');

  const t = translations[language];

  // Dynamic Current User derived from active role
  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const handleLoginSuccess = (user: User) => {
    setCurrentRole(user.role);
    setIsAuthenticated(true);
    localStorage.setItem('ohb_irb_authenticated', 'true');
    localStorage.setItem('ohb_irb_token', 'jwt_simulated_token_' + Date.now());

    // Record login in audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      timestamp: new Date().toISOString(),
      ipAddress: '196.188.12.44',
      browser: 'Chrome 128.0',
      newValue: `Successful JWT user sign-in from ${user.email}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogoutConfirm = () => {
    // Record logout event in audit log
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      userId: currentUser ? currentUser.id : 'usr-00',
      userName: currentUser ? currentUser.name : 'System User',
      userRole: currentRole,
      action: 'USER_LOGOUT',
      timestamp: new Date().toISOString(),
      ipAddress: '196.188.12.44',
      browser: 'Chrome 128.0',
      newValue: `User explicitly initiated logout session destroy and JWT token revocation.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Clear session & tokens
    setIsAuthenticated(false);
    setIsLogoutModalOpen(false);
    localStorage.removeItem('ohb_irb_authenticated');
    localStorage.removeItem('ohb_irb_token');
  };

  // Pending Counts
  const pendingReviewsCount = submissions.filter((s) =>
    ['SCIENTIFIC_REVIEW', 'ETHICS_REVIEW', 'REVIEWER_ASSIGNMENT'].includes(s.status)
  ).length;

  const upcomingMeetingsCount = meetings.filter((m) => m.status === 'SCHEDULED').length;

  // Keyboard shortcut Ctrl+K handler for quick global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update Submission Status & Append Audit Log
  const handleUpdateStatus = (submissionId: string, newStatus: SubmissionStatus) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const isApproval = newStatus === 'APPROVED';
          const approvalCert = isApproval
            ? {
                refNo: sub.refNo,
                approvalDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                signatureName: 'Prof. Gemechu Hunduma (Chairperson)',
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(sub.refNo)}`,
                verificationUrl: `/verify/${encodeURIComponent(sub.refNo)}`,
              }
            : sub.approvalCertificate;

          return {
            ...sub,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            approvalCertificate: approvalCert,
          };
        }
        return sub;
      })
    );

    // Append Audit Log
    const targetSub = submissions.find((s) => s.id === submissionId);
    if (targetSub) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentRole,
        action: `UPDATED_STATUS_TO_${newStatus}`,
        timestamp: new Date().toISOString(),
        ipAddress: '197.156.98.50',
        browser: 'Chrome 128.0 (Linux)',
        oldValue: `Status: ${targetSub.status}`,
        newValue: `Status: ${newStatus}`,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      // Add Notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetSub.principalInvestigator.email,
        title: `Protocol Status Changed`,
        message: `Your protocol ${targetSub.refNo} status has been updated to ${newStatus.replace('_', ' ')}.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: newStatus === 'APPROVED' ? 'APPROVAL' : 'SUBMISSION',
        linkId: targetSub.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Create New Submission
  const handleSubmitNewProtocol = (newSub: Submission) => {
    setSubmissions((prev) => [newSub, ...prev]);

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: 'SUBMITTED_NEW_PROTOCOL',
      timestamp: new Date().toISOString(),
      ipAddress: '197.156.102.88',
      browser: 'Chrome 128.0',
      oldValue: 'None',
      newValue: `Ref: ${newSub.refNo} (${newSub.title.slice(0, 40)}...)`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setActiveTab('submissions');
  };

  // Reviewer Submit Scorecard
  const handleSubmitReview = (
    submissionId: string,
    recommendation: 'APPROVE' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT',
    scoreCard: ReviewScoreCard,
    comments: string
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const newReview = {
            id: `rev-${Date.now()}`,
            submissionId,
            reviewerId: currentUser.id,
            reviewerName: currentUser.name,
            conflictOfInterestDeclared: true,
            hasConflict: false,
            assignedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            recommendation,
            scoreCard,
            comments,
            status: 'COMPLETED' as const,
          };
          return {
            ...sub,
            reviews: [...sub.reviews, newReview],
            status: 'COMMITTEE_MEETING' as SubmissionStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return sub;
      })
    );

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentRole,
      action: 'SUBMITTED_ETHICS_REVIEW',
      timestamp: new Date().toISOString(),
      ipAddress: '197.156.98.12',
      browser: 'Chrome 128.0',
      oldValue: 'Review Pending',
      newValue: `Recommendation: ${recommendation}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Schedule Committee Meeting
  const handleScheduleMeeting = (meetingData: Partial<MeetingItem>) => {
    const newMtg: MeetingItem = {
      id: `mtg-${Date.now()}`,
      title: meetingData.title || 'OHB IRB Panel Meeting',
      date: meetingData.date || new Date().toISOString().split('T')[0],
      time: meetingData.time || '09:00 AM - 01:00 PM',
      location: meetingData.location || 'OHB Conference Room 1',
      status: 'SCHEDULED',
      protocolIds: meetingData.protocolIds || [],
      attendees: [
        { userId: currentUser.id, name: currentUser.name, role: currentRole },
      ],
      discussionNotes: meetingData.discussionNotes || '',
    };
    setMeetings((prev) => [newMtg, ...prev]);
  };

  // Add Monitoring Progress Report
  const handleAddReport = (reportData: Partial<ProgressReport>) => {
    const newReport: ProgressReport = {
      id: `prg-${Date.now()}`,
      submissionId: reportData.submissionId || submissions[0]?.id || '',
      refNo: reportData.refNo || 'OHB-IRB/2026/000',
      title: reportData.title || 'Research Monitoring Update',
      piName: currentUser.name,
      type: reportData.type || 'ANNUAL_RENEWAL',
      submittedDate: new Date().toISOString(),
      status: 'PENDING',
      summary: reportData.summary || 'Periodic monitoring protocol update.',
      participantsEnrolled: reportData.participantsEnrolled || 0,
      adverseEventsCount: reportData.adverseEventsCount || 0,
    };
    setProgressReports((prev) => [newReport, ...prev]);
  };

  // Update User Role
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // Filtered Submissions for Submissions List tab
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.principalInvestigator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.zone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      submissionFilterStatus === 'ALL' || s.status === submissionFilterStatus;

    const matchesType =
      submissionFilterType === 'ALL' || s.studyType === submissionFilterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Open Public Certificate Verification View
  const handleOpenVerifyPublic = (refNo: string) => {
    setVerificationRefNo(refNo);
    setActiveTab('verify-public');
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        language={language}
        onLanguageChange={setLanguage}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={(newUser) => setUsers((prev) => [newUser, ...prev])}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Geometric Balance Top Header & Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        language={language}
        onLanguageChange={setLanguage}
        calendar={calendar}
        onCalendarChange={setCalendar}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPublicPortal={() => setActiveTab('public-portal')}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Geometric Balance Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentRole={currentRole}
          language={language}
          pendingReviewsCount={pendingReviewsCount}
          upcomingMeetingsCount={upcomingMeetingsCount}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {/* 1. DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <DashboardView
              submissions={submissions}
              meetings={meetings}
              auditLogs={auditLogs}
              currentRole={currentRole}
              language={language}
              calendar={calendar}
              onSelectSubmission={(sub) => setSelectedSubmission(sub)}
              onNavigateTab={setActiveTab}
            />
          )}

          {/* 2. SUBMISSIONS LIST VIEW */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>Research Ethics Protocols Repository</span>
                  </div>
                  <h1 className="text-2xl font-extrabold mt-1">Ethical Submissions Directory</h1>
                  <p className="text-blue-100 text-xs mt-1">
                    Track, evaluate, and manage all research ethics protocols submitted to the OHB IRB panel.
                  </p>
                </div>
                {['SUPER_ADMIN', 'IRB_ADMIN', 'RESEARCHER'].includes(currentRole) && (
                  <button
                    onClick={() => setActiveTab('submit-new')}
                    className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-xs flex items-center space-x-2 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-950" />
                    <span>Submit New Protocol</span>
                  </button>
                )}
              </div>

              {/* Filters Bar */}
              <div className="geo-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, ref no, PI, zone..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Status:</span>
                  </div>
                  <select
                    value={submissionFilterStatus}
                    onChange={(e) => setSubmissionFilterStatus(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses ({submissions.length})</option>
                    <option value="APPROVED">Approved</option>
                    <option value="COMMITTEE_MEETING">Committee Review</option>
                    <option value="SCIENTIFIC_REVIEW">Scientific Review</option>
                    <option value="SECRETARY_SCREENING">Secretary Screening</option>
                    <option value="REVISION_REQUESTED">Revision Requested</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
                    <span>Study Type:</span>
                  </div>
                  <select
                    value={submissionFilterType}
                    onChange={(e) => setSubmissionFilterType(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Types</option>
                    <option value="CLINICAL_TRIAL">Clinical Trial</option>
                    <option value="EPIDEMIOLOGICAL">Epidemiological</option>
                    <option value="QUALITATIVE">Qualitative</option>
                    <option value="GENETIC">Genomic / Genetic</option>
                  </select>
                </div>
              </div>

              {/* Submissions Cards Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="geo-card p-12 text-center text-slate-500">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-700">No matching protocols found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing search filters or submitting a new research protocol.
                    </p>
                  </div>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className="geo-card p-5 geo-card-interactive cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="geo-badge-navy text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                            {sub.refNo}
                          </span>
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                            {sub.studyType.replace('_', ' ')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              sub.riskLevel === 'HIGH_RISK'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : sub.riskLevel === 'MODERATE_RISK'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {sub.riskLevel.replace('_', ' ')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                          {sub.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            <strong>PI:</strong> {sub.principalInvestigator.name} ({sub.principalInvestigator.institution})
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Zone:</strong> {sub.zone}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Submitted:</strong> {formatDateWithCalendar(sub.submittedAt, calendar, language)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                            sub.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : sub.status === 'COMMITTEE_MEETING'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : sub.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {sub.status.replace('_', ' ')}
                        </span>

                        {sub.status === 'APPROVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCertSubmission(sub);
                            }}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="View Ethics Clearance Certificate"
                          >
                            <Award className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. SUBMISSION WIZARD */}
          {activeTab === 'submit-new' && (
            <SubmissionWizard
              language={language}
              onSubmitSuccess={handleSubmitNewProtocol}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {/* 4. REVIEWER WORKSPACE */}
          {activeTab === 'reviewer-workspace' && (
            <ReviewerWorkspace
              submissions={submissions}
              currentUser={currentUser}
              language={language}
              calendar={calendar}
              onSubmitReview={handleSubmitReview}
              onSelectSubmission={(sub) => setSelectedSubmission(sub)}
            />
          )}

          {/* 5. COMMITTEE MEETINGS */}
          {activeTab === 'committee-meetings' && (
            <CommitteeMeetingModule
              meetings={meetings}
              submissions={submissions}
              language={language}
              calendar={calendar}
              currentUser={currentUser}
              onScheduleMeeting={handleScheduleMeeting}
              onSelectSubmission={(sub) => setSelectedSubmission(sub)}
            />
          )}

          {/* 6. POST-APPROVAL RESEARCH MONITORING */}
          {activeTab === 'monitoring' && (
            <ResearchMonitoringModule
              progressReports={progressReports}
              submissions={submissions}
              language={language}
              calendar={calendar}
              onAddReport={handleAddReport}
            />
          )}

          {/* 7. CERTIFICATES GALLERY */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Official Ethics Clearance Repository</span>
                  </div>
                  <h1 className="text-2xl font-extrabold mt-1">Ethics Clearance Certificates</h1>
                  <p className="text-blue-100 text-xs mt-1">
                    Download and verify official digital ethical clearance credentials issued by OHB IRB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submissions
                  .filter((s) => s.status === 'APPROVED')
                  .map((sub) => (
                    <div key={sub.id} className="geo-card p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="geo-badge-gold text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                            {sub.refNo}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                            ACTIVE CLEARANCE
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug line-clamp-2">
                          {sub.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">
                          <strong>Investigator:</strong> {sub.principalInvestigator.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          <strong>Institution:</strong> {sub.principalInvestigator.institution}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          Valid until:{' '}
                          {formatDateWithCalendar(
                            sub.approvalCertificate?.expiryDate || new Date().toISOString(),
                            calendar,
                            language
                          )}
                        </span>
                        <button
                          onClick={() => setSelectedCertSubmission(sub)}
                          className="bg-[#005BAC] hover:bg-blue-800 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-300" />
                          <span>View Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 7.5. GOOGLE DRIVE WORKSPACE & CERTIFICATE SYNC */}
          {activeTab === 'google-drive' && (
            <GoogleDriveView
              submissions={submissions}
              language={language}
              calendar={calendar}
              onVerifyPublic={handleOpenVerifyPublic}
            />
          )}

          {/* 8. PUBLIC CERTIFICATE VERIFICATION VIEW */}
          {activeTab === 'verify-public' && (
            <CertificateVerificationView
              language={language}
              calendar={calendar}
              initialRefNo={verificationRefNo}
              onBackToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {/* 9. REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <ReportsAnalyticsView
              submissions={submissions}
              language={language}
              calendar={calendar}
            />
          )}

          {/* 10. AUDIT TRAIL LOGS */}
          {activeTab === 'audit-trail' && (
            <div className="space-y-6">
              <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md">
                <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  <span>Immutable System Governance</span>
                </div>
                <h1 className="text-2xl font-extrabold mt-1">Audit Trail & Access Logs</h1>
                <p className="text-blue-100 text-xs mt-1">
                  Cryptographically track all protocol updates, reviewer scores, votes, and system interactions.
                </p>
              </div>

              <div className="geo-card overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>SYSTEM AUDIT HISTORY ({auditLogs.length} LOGS)</span>
                  <span className="text-slate-500 font-normal">Compliance Mode: GCP & CIOMS Active</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{log.userName}</span>
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                            {log.userRole}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{log.ipAddress}</span>
                        </div>
                        <p className="font-semibold text-blue-900">{log.action}</p>
                        <p className="text-slate-500 text-[11px]">
                          <strong>Old:</strong> {log.oldValue} | <strong>New:</strong> {log.newValue}
                        </p>
                      </div>

                      <div className="text-slate-400 text-[11px] shrink-0">
                        {formatDateWithCalendar(log.timestamp, calendar, language)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 11. USER MANAGEMENT (RBAC) */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <UserManagementView
                users={users}
                language={language}
                onUpdateRole={handleUpdateUserRole}
              />

              {/* System Configuration Section */}
              <div className="geo-card p-6 space-y-4">
                <div className="flex items-center space-x-2 text-[#005BAC] font-bold text-base border-b border-slate-100 pb-3">
                  <SettingsIcon className="w-5 h-5 text-amber-500" />
                  <span>Institutional Review Board Configuration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={settings.institutionName}
                      onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">IRB Secretariat Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Federal Ethics Registration Code</label>
                    <input
                      type="text"
                      value={settings.irbCode}
                      onChange={(e) => setSettings({ ...settings, irbCode: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Standard Review Window (Days)</label>
                    <input
                      type="number"
                      value={settings.standardReviewDays}
                      onChange={(e) => setSettings({ ...settings, standardReviewDays: parseInt(e.target.value) || 14 })}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => alert('System settings saved successfully.')}
                    className="bg-[#005BAC] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer hover:bg-blue-800 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Institutional Settings</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11.5 EMAIL CONFIGURATION (SMTP) - SUPER_ADMIN ONLY */}
          {activeTab === 'email-config' && (
            <SmtpConfigView
              currentUser={currentUser}
              onSaveSmtpSettings={(newSmtp) => {
                setSettings((prev) => ({ ...prev, smtpConfig: newSmtp }));
              }}
            />
          )}
          {activeTab === 'public-portal' && (
            <div className="space-y-8 max-w-4xl mx-auto py-4">
              <div className="bg-gradient-to-r from-[#003B73] to-[#005BAC] text-white p-8 rounded-2xl shadow-xl text-center space-y-4 border-b-4 border-amber-400">
                <div className="mx-auto flex justify-center">
                  <OromiaLogo variant="emblem" size="lg" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Oromia Health Bureau IRB Portal</h1>
                <p className="text-blue-100 text-sm max-w-xl mx-auto leading-relaxed">
                  Welcome to the official public portal for research ethics oversight in Oromia Regional State, Ethiopia.
                </p>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handleOpenVerifyPublic('OHB-IRB/2026/0482')}
                    className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-950" />
                    <span>Verify Ethics Certificate</span>
                  </button>
                </div>
              </div>

              {/* Public Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="geo-card p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#005BAC] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Submit Online</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Researchers upload complete proposals with multi-lingual consent forms in Afaan Oromo, Amharic, or English.
                  </p>
                </div>

                <div className="geo-card p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Panel Assessment</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Independent scientific and ethics reviewers assess risk-benefit ratios and vulnerable population protections.
                  </p>
                </div>

                <div className="geo-card p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Digital Certificate</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Approved protocols receive official QR-verified clearance credentials recognized across regional health facilities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}

      {/* 1. Submission Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          currentRole={currentRole}
          language={language}
          calendar={calendar}
          onClose={() => setSelectedSubmission(null)}
          onUpdateStatus={handleUpdateStatus}
          onOpenCertificate={(sub) => {
            setSelectedSubmission(null);
            setSelectedCertSubmission(sub);
          }}
        />
      )}

      {/* 2. Certificate Generator Modal */}
      {selectedCertSubmission && (
        <CertificateGeneratorModal
          submission={selectedCertSubmission}
          language={language}
          calendar={calendar}
          onClose={() => setSelectedCertSubmission(null)}
          onVerifyPublic={(refNo) => {
            setSelectedCertSubmission(null);
            handleOpenVerifyPublic(refNo);
          }}
        />
      )}

      {/* 3. Global Search Modal (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-4 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Search className="w-4 h-4 text-[#005BAC]" />
                <span>Search OHB Ethical Database</span>
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Protocol Title, Ref Number, PI Name, Zone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredSubmissions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No matching items found</p>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setIsSearchOpen(false);
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-bold text-[#005BAC]">{sub.refNo}</span>
                      <span className="font-semibold text-slate-500">{sub.status}</span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 line-clamp-1">{sub.title}</p>
                    <p className="text-[10px] text-slate-500">{sub.principalInvestigator.name}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Notifications Slide-over Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>System Notifications</span>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-2">
              {notifications.map((n) => (
                <div key={n.id} className="py-3 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                    <span className="text-[9px] text-slate-400">
                      {formatDateWithCalendar(n.timestamp, calendar, language)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                setIsNotificationsOpen(false);
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}

      {/* Geometric Balance Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-6 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <OromiaLogo variant="emblem" size="md" />
            <div>
              <p className="font-bold text-white text-xs">Oromia Health Bureau Ethical Review Portal</p>
              <p className="text-[10px] text-slate-500">Biiroo Fayyaa Oromiyaa • Government of Oromia Regional State, Ethiopia</p>
            </div>
          </div>

          <div className="text-[11px] text-center md:text-right text-slate-400 space-y-0.5">
            <p>© 2026 OHB Directorate of Health Research & Technology Transfer. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
