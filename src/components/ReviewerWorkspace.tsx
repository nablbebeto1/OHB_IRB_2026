import React, { useState } from 'react';
import {
  Submission,
  ReviewScoreCard,
  User,
  Language,
  CalendarType,
} from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Send,
  Lock,
  Star,
  UserCheck,
} from 'lucide-react';

interface ReviewerWorkspaceProps {
  submissions: Submission[];
  currentUser: User;
  language: Language;
  calendar: CalendarType;
  onSubmitReview: (
    submissionId: string,
    recommendation: 'APPROVE' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT',
    scoreCard: ReviewScoreCard,
    comments: string
  ) => void;
  onSelectSubmission: (sub: Submission) => void;
}

export const ReviewerWorkspace: React.FC<ReviewerWorkspaceProps> = ({
  submissions,
  currentUser,
  language,
  calendar,
  onSubmitReview,
  onSelectSubmission,
}) => {
  const t = translations[language];

  // Selected protocol for active review
  const [selectedSub, setSelectedSub] = useState<Submission | null>(
    submissions.find((s) => s.status === 'SCIENTIFIC_REVIEW' || s.status === 'REVIEWER_ASSIGNMENT') || submissions[0] || null
  );

  // Conflict of interest declaration state
  const [coiDeclared, setCoiDeclared] = useState<boolean>(false);
  const [hasConflict, setHasConflict] = useState<boolean>(false);

  // Review scores state
  const [scoreCard, setScoreCard] = useState<ReviewScoreCard>({
    scientificMerit: 8,
    ethicalPrinciples: 9,
    riskBenefitRatio: 8,
    confidentialityProtection: 9,
    informedConsentQuality: 8,
    communityEngagement: 8,
  });

  const [recommendation, setRecommendation] = useState<'APPROVE' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT'>('APPROVE');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coiDeclared) {
      alert('You must sign the Conflict of Interest Declaration before submitting your review.');
      return;
    }
    if (hasConflict) {
      alert('You have declared a conflict of interest. The system will re-assign this protocol to another reviewer.');
      return;
    }
    if (!selectedSub) return;

    onSubmitReview(selectedSub.id, recommendation, scoreCard, comments);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ClipboardCheck className="w-4 h-4" />
            <span>OHB IRB Reviewer Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Ethical & Scientific Review Workspace</h1>
          <p className="text-blue-100 text-xs mt-1">
            Logged in as Evaluator: <span className="font-bold text-white">{currentUser.name}</span> ({currentUser.institution})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Protocols List */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Assigned Ethical Reviews ({submissions.length})
          </h2>

          <div className="space-y-3">
            {submissions.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub);
                    setCoiDeclared(false);
                    setHasConflict(false);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#005BAC] bg-blue-50/70 shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#005BAC]">{sub.refNo}</span>
                    <span className="text-[10px] bg-gray-100 font-bold px-2 py-0.5 rounded text-gray-700">
                      {sub.studyType}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 mt-1.5 line-clamp-2">{sub.title}</h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    <span>PI: {sub.principalInvestigator.name}</span>
                    <span className="font-semibold text-amber-800">{sub.riskLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Active Review Evaluation Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSub ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
              {/* Protocol Header */}
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-blue-50 text-[#005BAC] px-2.5 py-1 rounded border border-blue-100">
                      {selectedSub.refNo}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {selectedSub.riskLevel}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-gray-900 mt-2">{selectedSub.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    PI: {selectedSub.principalInvestigator.name} • {selectedSub.principalInvestigator.institution}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSubmission(selectedSub)}
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200"
                >
                  Inspect Dossier
                </button>
              </div>

              {/* COI Declaration Box */}
              <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Conflict of Interest (COI) Declaration</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  Before proceeding with ethical review, you must declare whether you have any financial, personal, or collaborative conflict of interest regarding this research.
                </p>

                <div className="flex items-center space-x-6 text-xs font-bold pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="coi"
                      checked={coiDeclared && !hasConflict}
                      onChange={() => {
                        setCoiDeclared(true);
                        setHasConflict(false);
                      }}
                      className="w-4 h-4 text-[#005BAC]"
                    />
                    <span>I declare NO Conflict of Interest</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer text-red-700">
                    <input
                      type="radio"
                      name="coi"
                      checked={coiDeclared && hasConflict}
                      onChange={() => {
                        setCoiDeclared(true);
                        setHasConflict(true);
                      }}
                      className="w-4 h-4 text-red-600"
                    />
                    <span>I have a Conflict of Interest</span>
                  </label>
                </div>
              </div>

              {/* Ethical Score Matrix */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Ethical Evaluation Score Matrix (1-10 Scale)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {[
                    { key: 'scientificMerit', label: 'Scientific Merit & Rationale' },
                    { key: 'ethicalPrinciples', label: 'Adherence to Ethical Principles' },
                    { key: 'riskBenefitRatio', label: 'Favorable Risk-Benefit Ratio' },
                    { key: 'confidentialityProtection', label: 'Confidentiality & Data Privacy' },
                    { key: 'informedConsentQuality', label: 'Informed Consent Quality' },
                    { key: 'communityEngagement', label: 'Community Engagement Plan' },
                  ].map((item) => (
                    <div key={item.key} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex justify-between font-bold text-gray-800 mb-1">
                        <span>{item.label}</span>
                        <span className="text-[#005BAC]">{scoreCard[item.key as keyof ReviewScoreCard]}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scoreCard[item.key as keyof ReviewScoreCard]}
                        onChange={(e) =>
                          setScoreCard({
                            ...scoreCard,
                            [item.key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-[#005BAC] cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments & Annotation */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Evaluator Detailed Ethical Comments & Required Modifications
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide detailed feedback on methodology, consent translation accuracy, vulnerability protection, and risk mitigation..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none"
                />
              </div>

              {/* Recommendation Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-900">Final Recommendation</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                  {[
                    { val: 'APPROVE', label: 'Approve Protocol', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                    { val: 'MINOR_REVISION', label: 'Minor Revision', bg: 'bg-blue-50 text-blue-800 border-blue-300' },
                    { val: 'MAJOR_REVISION', label: 'Major Revision', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
                    { val: 'REJECT', label: 'Reject Protocol', bg: 'bg-red-50 text-red-800 border-red-300' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setRecommendation(r.val as any)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        recommendation === r.val ? `${r.bg} ring-2 ring-current shadow-xs` : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Review Button */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={!coiDeclared || hasConflict}
                  className="bg-[#005BAC] hover:bg-blue-800 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ethical Review Report</span>
                </button>
              </div>

              {isSubmitted && (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Review successfully submitted to OHB IRB Secretariat!</span>
                </div>
              )}
            </form>
          ) : (
            <div className="bg-white p-12 rounded-xl text-center text-gray-500 border">
              Select an assigned protocol on the left to begin review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
