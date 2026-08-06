import React, { useState } from 'react';
import { OromiaLogo } from './OromiaLogo';
import { Language, CalendarType } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import { Search, ShieldCheck, CheckCircle2, XCircle, Award, Loader2, Building, ArrowLeft } from 'lucide-react';

interface CertificateVerificationViewProps {
  language: Language;
  calendar: CalendarType;
  initialRefNo?: string;
  onBackToDashboard: () => void;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({
  language,
  calendar,
  initialRefNo = '',
  onBackToDashboard,
}) => {
  const t = translations[language];

  const [refNo, setRefNo] = useState<string>(initialRefNo || 'OHB-IRB/2026/0482');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    valid: boolean;
    status: string;
    data?: {
      refNo: string;
      title: string;
      principalInvestigator: string;
      institution: string;
      zone: string;
      studyType: string;
      approvalDate: string;
      expiryDate: string;
      chairpersonSignature: string;
      issuedBy: string;
    };
    message?: string;
  } | null>(null);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refNo.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(refNo.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        valid: false,
        status: 'ERROR',
        message: 'Network error verifying certificate reference.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBackToDashboard}
        className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center space-x-1 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* Hero Search Box */}
      <div className="bg-gradient-to-r from-[#005BAC] to-blue-900 text-white rounded-2xl p-8 shadow-md text-center space-y-4">
        <div className="mx-auto flex justify-center">
          <OromiaLogo variant="emblem" size="lg" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Public Ethics Certificate Verification Portal</h1>
        <p className="text-xs text-blue-100 max-w-xl mx-auto">
          Verify the legal authenticity of research ethics approval clearance certificates issued by the Oromia Health Bureau Institutional Review Board (OHB-IRB).
        </p>

        <form onSubmit={handleVerify} className="max-w-xl mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="Enter Reference Number (e.g. OHB-IRB/2026/0482)"
              className="w-full bg-white text-gray-900 text-xs pl-9 pr-4 py-3 rounded-xl border border-gray-200 outline-none font-mono font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-extrabold px-6 py-3 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Certificate</span>}
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
          {result.valid && result.data ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-sm text-emerald-950">
                    AUTHENTIC & VALID ETHICS CLEARANCE CERTIFICATE
                  </h3>
                  <p className="text-xs text-emerald-800">
                    This protocol has undergone full ethical review and holds active clearance from OHB-IRB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-gray-50 p-6 rounded-xl border">
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Reference Number</span>
                  <span className="font-mono font-extrabold text-[#005BAC] text-sm">{result.data.refNo}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Principal Investigator</span>
                  <span className="font-bold text-gray-900">{result.data.principalInvestigator}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-500 font-semibold block text-[10px]">Approved Research Title</span>
                  <span className="font-bold text-gray-900">{result.data.title}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Institution</span>
                  <span className="font-bold text-gray-900">{result.data.institution}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Study Zone</span>
                  <span className="font-bold text-gray-900">{result.data.zone}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Approval Issued Date</span>
                  <span className="font-bold text-gray-900">
                    {formatDateWithCalendar(result.data.approvalDate, calendar, language)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-[10px]">Validity Expiry Date</span>
                  <span className="font-bold text-emerald-700">
                    {formatDateWithCalendar(result.data.expiryDate, calendar, language)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 text-center border-t pt-3">
                Issued by {result.data.issuedBy} • Official Verification Stamp
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-900">
              <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-red-950">INVALID OR EXPIRED REFERENCE NUMBER</h3>
                <p className="text-xs text-red-800">
                  {result.message || 'No matching active ethics clearance certificate was found for this reference.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
