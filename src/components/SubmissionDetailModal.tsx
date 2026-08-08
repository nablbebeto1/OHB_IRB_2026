import React, { useState } from 'react';
import {
  Submission,
  UserRole,
  Language,
  CalendarType,
  SubmissionStatus,
} from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  X,
  FileText,
  User,
  MapPin,
  Building2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Award,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCode,
  Check,
  Edit,
  Send,
  Lock,
  BookOpen,
  UserCheck,
  DollarSign,
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: Submission | null;
  currentRole: UserRole;
  language: Language;
  calendar: CalendarType;
  onClose: () => void;
  onUpdateStatus: (submissionId: string, newStatus: SubmissionStatus) => void;
  onOpenCertificate: (sub: Submission) => void;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  currentRole,
  language,
  calendar,
  onClose,
  onUpdateStatus,
  onOpenCertificate,
}) => {
  if (!submission) return null;
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'overview' | 'proposal_fields' | 'ethics' | 'docs' | 'ai' | 'reviews'>('overview');
  const [selectedNewStatus, setSelectedNewStatus] = useState<SubmissionStatus>(submission.status);
  const [showStatusChanger, setShowStatusChanger] = useState<boolean>(false);

  const handleStatusChangeSubmit = () => {
    onUpdateStatus(submission.id, selectedNewStatus);
    setShowStatusChanger(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="bg-[#005BAC] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold bg-white/10 text-amber-300 px-2.5 py-1 rounded border border-white/20">
              {submission.refNo}
            </span>
            <div>
              <h2 className="text-base font-bold line-clamp-1">{submission.title}</h2>
              <p className="text-xs text-blue-100 flex items-center space-x-2">
                <span>{submission.principalInvestigator.name}</span>
                <span>•</span>
                <span>{submission.zone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {submission.approvalCertificate && (
              <button
                onClick={() => onOpenCertificate(submission)}
                className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>View Certificate</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-gray-200 px-6 text-xs font-bold text-gray-600 space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'overview' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('proposal_fields')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'proposal_fields' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            Proposal Submission Fields
          </button>
          <button
            onClick={() => setActiveTab('ethics')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'ethics' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            Ethics Checklist
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'docs' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            Documents ({submission.documents.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'ai' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            AI Audit Report
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 border-b-2 cursor-pointer ${activeTab === 'reviews' ? 'border-[#005BAC] text-[#005BAC]' : 'border-transparent hover:text-gray-900'}`}
          >
            Reviews ({submission.reviews.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Executive Abstract</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  {submission.abstract || 'No abstract provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Study Type</span>
                  <span className="font-bold text-gray-900">{submission.studyType}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Risk Level</span>
                  <span className="font-bold text-amber-800">{submission.riskLevel}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Budget (ETB)</span>
                  <span className="font-bold text-emerald-800">{submission.budgetETB.toLocaleString()} ETB</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Duration</span>
                  <span className="font-bold text-gray-900">{submission.studyDurationMonths} Months</span>
                </div>
              </div>

              {/* Terms and Conditions Agreement Status Block */}
              <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Mandatory Investigator Agreement Audit Trail</span>
                  </h4>
                  <span className="bg-emerald-200 text-emerald-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    VERIFIED & SIGNED
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[11px] text-gray-700 space-y-1">
                  <p>
                    <strong>Accepted Agreement:</strong> "I acknowledge that I must comply with the requirements and responsibilities as the investigator or professional responsible for this proposal, as set forth in the Committee's Standard Operating Procedures (SOPs)..."
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-gray-500 pt-1 border-t border-gray-100">
                    <span>Accepted Date: <strong>{submission.agreement?.acceptedDate ? new Date(submission.agreement.acceptedDate).toLocaleString() : new Date().toLocaleString()}</strong></span>
                    <span>User ID: <strong>{submission.agreement?.userId || submission.principalInvestigator.email}</strong></span>
                    <span>IP Address: <strong>{submission.agreement?.ipAddress || '197.156.98.20'}</strong></span>
                    <span>Digital Signature: <strong>{submission.digitalSignatureName || submission.principalInvestigator.name}</strong></span>
                  </div>
                </div>
              </div>

              {/* PI Details */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Principal Investigator & Institution
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-gray-500 text-[10px]">PI Name</span>
                    <p className="font-bold text-gray-900">{submission.principalInvestigator.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Institution</span>
                    <p className="font-bold text-gray-900">{submission.principalInvestigator.institution}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Contact Email</span>
                    <p className="font-bold text-blue-700">{submission.principalInvestigator.email}</p>
                  </div>
                </div>
              </div>

              {/* Oromia Location & Primary Site Details */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-[#005BAC] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>Primary Research Site & Oromia Location Hierarchy</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white p-3 rounded-lg border border-blue-100">
                  <div>
                    <span className="text-gray-500 text-[10px]">Region</span>
                    <p className="font-bold text-gray-900">{submission.region || 'Oromia'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Zone</span>
                    <p className="font-bold text-blue-900">{submission.zone || 'Jimma Zone'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Woreda</span>
                    <p className="font-bold text-gray-900">{submission.woreda || 'Jimma Town'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Town / Sub-city</span>
                    <p className="font-bold text-gray-800">{submission.town || 'Central'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Health Facility</span>
                    <p className="font-extrabold text-[#005BAC]">
                      {submission.facility_name || 'Jimma University Medical Center'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSAL SUBMISSION FIELDS */}
          {activeTab === 'proposal_fields' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b pb-2">
                Complete Proposal Fields (ProEthos2 IRB Spec)
              </h3>

              {/* Research Information */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="font-bold text-[#005BAC] text-xs uppercase tracking-wider flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Research Information</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px]">Keywords</span>
                    <span className="font-bold text-gray-900">
                      {Array.isArray(submission.keywords) ? submission.keywords.join(', ') : submission.keywords || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block text-[10px]">Study Design</span>
                    <span className="font-bold text-gray-900">{submission.studyDesign || 'Cross-sectional observational study'}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-500 font-bold block text-[10px]">Introduction</span>
                    <p className="bg-white p-2.5 rounded border border-gray-200 text-gray-800">
                      {submission.introduction || 'Antimicrobial resistance and epidemiological dynamics in healthcare settings.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[10px]">Justification</span>
                    <p className="bg-white p-2.5 rounded border border-gray-200 text-gray-800">
                      {submission.justification || 'Addressing critical public health priorities in Oromia region.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold block text-[10px]">Goals & Objectives</span>
                    <p className="bg-white p-2.5 rounded border border-gray-200 text-gray-800">
                      {submission.goalsObjectives || '1. Measure prevalence rates. 2. Identify risk factors.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participant Information & Eligibility */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="font-bold text-[#005BAC] text-xs uppercase tracking-wider flex items-center space-x-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Participant Information & Eligibility Criteria</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    <span className="text-gray-500 text-[10px]">Gender</span>
                    <p className="font-bold text-gray-900">{submission.gender || 'All Genders'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Target Sample Size</span>
                    <p className="font-bold text-blue-900">{submission.targetSampleSize || 450} participants</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Age Range</span>
                    <p className="font-bold text-gray-900">{submission.minimumAge || 18} - {submission.maximumAge || 75} Years</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Initial Recruitment Date</span>
                    <p className="font-bold text-emerald-800">{submission.initialRecruitmentDate || '2026-09-15'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-emerald-800 font-bold text-[10px]">Inclusion Criteria</span>
                    <p className="bg-white p-2.5 rounded border border-emerald-200 text-gray-800">
                      {submission.inclusionCriteria || 'All consented patients admitted to study facilities.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-red-800 font-bold text-[10px]">Exclusion Criteria</span>
                    <p className="bg-white p-2.5 rounded border border-red-200 text-gray-800">
                      {submission.exclusionCriteria || 'Patients unable or unwilling to provide informed consent.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Details & Financial */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="font-bold text-[#005BAC] text-xs uppercase tracking-wider flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Research Interventions & Financial Sponsors</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 font-bold text-[10px]">Interventions</span>
                    <p className="bg-white p-2 rounded border border-gray-200">{submission.interventions || 'Observational data collection & questionnaires'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold text-[10px]">Primary Outcome</span>
                    <p className="bg-white p-2 rounded border border-gray-200">{submission.primaryOutcome || 'Infection rate reduction at 12 months'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-gray-200">
                  <div>
                    <span className="text-gray-500 text-[10px]">Funding Source</span>
                    <p className="font-bold text-gray-900">{submission.fundingSource || 'Oromia Health Research Fund'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Primary Sponsor</span>
                    <p className="font-bold text-gray-900">{submission.primarySponsor || submission.sponsor || 'Oromia Health Bureau'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px]">Scientific Contact</span>
                    <p className="font-bold text-blue-800">{submission.scientificContact || 'Dr. Tolosa Megersa'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ETHICS CHECKLIST */}
          {activeTab === 'ethics' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Declared Ethics Checklist Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl space-y-2 bg-gray-50">
                  <h4 className="font-bold text-gray-800 text-xs">Research Characteristics</h4>
                  <div className="space-y-1">
                    <p>• Human Subjects: {submission.ethicsChecklist.humanSubjects ? 'Yes' : 'No'}</p>
                    <p>• Clinical Trial: {submission.ethicsChecklist.clinicalTrial ? 'Yes' : 'No'}</p>
                    <p>• Biological Samples: {submission.ethicsChecklist.biologicalSamples ? 'Yes' : 'No'}</p>
                    <p>• Genetic Research: {submission.ethicsChecklist.geneticResearch ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="p-4 border border-amber-200 rounded-xl space-y-2 bg-amber-50/50">
                  <h4 className="font-bold text-amber-900 text-xs">Vulnerable Populations Protection</h4>
                  <div className="space-y-1 text-amber-900">
                    <p>• Children/Minors: {submission.ethicsChecklist.vulnerablePopulation.children ? 'YES (Assent required)' : 'No'}</p>
                    <p>• Pregnant Women: {submission.ethicsChecklist.vulnerablePopulation.pregnantWomen ? 'YES' : 'No'}</p>
                    <p>• Prisoners: {submission.ethicsChecklist.vulnerablePopulation.prisoners ? 'YES (Extra protections)' : 'No'}</p>
                    <p>• Refugees/IDPs: {submission.ethicsChecklist.vulnerablePopulation.refugees ? 'YES' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Attached Proposal Documents & Consent Forms</h3>
              <div className="border rounded-xl divide-y overflow-hidden">
                {submission.documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-bold text-gray-900">{doc.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {doc.type} • {doc.size} • v{doc.version}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${doc.name}...`)}
                      className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI AUDIT */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {submission.aiAuditResult ? (
                <div className="bg-gradient-to-r from-purple-900 to-blue-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-white/20 pb-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <h4 className="font-extrabold text-sm">Gemini AI Audit Report</h4>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-300">
                      Score: {submission.aiAuditResult.completenessScore}/100
                    </span>
                  </div>

                  {submission.aiAuditResult.flaggedIssues.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-300 block mb-1">Flagged Completeness Issues:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-red-200">
                        {submission.aiAuditResult.flaggedIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-blue-200 block mb-1">Ethical Recommendations:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-100">
                      {submission.aiAuditResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-[10px] text-gray-300 italic pt-2 border-t border-white/10">
                    Audit Evaluated At: {submission.aiAuditResult.evaluatedAt}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p>AI Audit report has not been triggered for this protocol yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Assigned Reviewers & Scores</h3>
              {submission.reviews.length > 0 ? (
                <div className="space-y-3">
                  {submission.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border rounded-xl bg-gray-50 space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-gray-900">{rev.reviewerName}</span>
                        <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          {rev.recommendation}
                        </span>
                      </div>
                      <p className="text-gray-700 italic">"{rev.comments}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No completed reviewer reports yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Status: </span>
            <span className="font-bold text-blue-900 text-xs">{submission.status}</span>
          </div>

          <div className="flex items-center space-x-3">
            {['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY'].includes(currentRole) && (
              <div className="relative">
                {showStatusChanger ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedNewStatus}
                      onChange={(e) => setSelectedNewStatus(e.target.value as SubmissionStatus)}
                      className="text-xs p-1.5 rounded-lg border border-gray-300 bg-white font-bold"
                    >
                      <option value="SECRETARY_SCREENING">Secretary Screening</option>
                      <option value="ADMIN_REVIEW">Admin Review</option>
                      <option value="REVIEWER_ASSIGNMENT">Reviewer Assignment</option>
                      <option value="SCIENTIFIC_REVIEW">Scientific Review</option>
                      <option value="COMMITTEE_MEETING">Committee Panel</option>
                      <option value="APPROVED">APPROVED (Issue Clearance)</option>
                      <option value="REVISIONS_REQUIRED">Revisions Required</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <button
                      onClick={handleStatusChangeSubmit}
                      className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      Save Status
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowStatusChanger(true)}
                    className="bg-blue-50 text-[#005BAC] font-bold px-3.5 py-2 rounded-lg text-xs border border-blue-200 hover:bg-blue-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Transition Workflow Status</span>
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
