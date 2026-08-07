import React, { useState, useEffect } from 'react';
import { Submission, Language, CalendarType, BrandingSettings, StoredCertificate } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import { CertificateGeneratorModal } from './CertificateGeneratorModal';
import {
  Award,
  Search,
  Printer,
  Download,
  RotateCw,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  User as UserIcon,
  Calendar,
  Eye,
  FileText,
  Filter,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface CertificatesArchiveViewProps {
  submissions: Submission[];
  language: Language;
  calendar: CalendarType;
  brandingSettings?: BrandingSettings;
  onSelectSubmissionForCert: (sub: Submission) => void;
  onVerifyPublic: (refNo: string) => void;
}

export const CertificatesArchiveView: React.FC<CertificatesArchiveViewProps> = ({
  submissions,
  language,
  calendar,
  brandingSettings,
  onSelectSubmissionForCert,
  onVerifyPublic,
}) => {
  const t = translations[language];

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REGENERATED' | 'REVOKED'>('ALL');
  const [storedCerts, setStoredCerts] = useState<StoredCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuditHistory, setSelectedAuditHistory] = useState<StoredCertificate[] | null>(null);
  const [activeCertModalSub, setActiveCertModalSub] = useState<Submission | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Fetch certificates from API / populate from approved submissions
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setStoredCerts(data.data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to client state:', err);
    }

    // Fallback sync from approved submissions
    const approvedSubs = submissions.filter((s) => s.status === 'APPROVED');
    const localCerts: StoredCertificate[] = approvedSubs.map((sub) => {
      const cert = sub.approvalCertificate;
      return {
        id: `cert-${sub.id}`,
        certNo: cert?.refNo || sub.refNo,
        protocolId: sub.id,
        refNo: sub.refNo,
        researchTitle: sub.title,
        principalInvestigator: sub.principalInvestigator.name,
        institution: sub.principalInvestigator.institution,
        approvalDate: cert?.approvalDate || sub.updatedAt || new Date().toISOString(),
        expiryDate: cert?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        irbDecision: 'APPROVED',
        qrCodeUrl: cert?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(sub.refNo)}`,
        signatureName: cert?.signatureName || 'Prof. Gemechu Hunduma (Chairperson)',
        generatedDate: cert?.approvalDate || sub.updatedAt || new Date().toISOString(),
        generatedBy: 'OHB IRB Secretariat',
        status: 'ACTIVE',
        version: 1,
      };
    });

    setStoredCerts(localCerts);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, [submissions]);

  // Handle Certificate Regeneration
  const handleRegenerateCertificate = async (submissionId: string) => {
    try {
      const res = await fetch('/api/certificates/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setActionSuccessMsg(`Certificate ${data.data.certNo} successfully regenerated (Version ${data.data.version}). Original Ref No preserved.`);
          fetchCertificates();
          setTimeout(() => setActionSuccessMsg(''), 5000);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to call regenerate API:', err);
    }

    // Local state fallback update
    setStoredCerts((prev) => {
      return prev.map((c) => {
        if (c.protocolId === submissionId || c.refNo === submissionId) {
          return {
            ...c,
            version: c.version + 1,
            generatedDate: new Date().toISOString(),
            status: 'ACTIVE',
          };
        }
        return c;
      });
    });

    setActionSuccessMsg(`Certificate regenerated successfully. Original Certificate Ref No retained.`);
    setTimeout(() => setActionSuccessMsg(''), 5000);
  };

  // Filtered Certificates
  const filteredCerts = storedCerts.filter((c) => {
    const matchesSearch =
      c.certNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.researchTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.principalInvestigator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.approvalDate.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>OHB IRB Ethics Clearance Certificate Repository</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Searchable Certificate Repository & Archive</h1>
          <p className="text-blue-100 text-xs mt-1 max-w-2xl">
            Search, preview, print, download, and regenerate official A4 Portrait ethical clearance certificates.
            All certificates are permanently stored with full version audit trails.
          </p>
        </div>
        <button
          onClick={fetchCertificates}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Repository</span>
        </button>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs font-bold rounded-r-xl shadow-xs flex justify-between items-center animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900">
            ×
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative max-w-lg w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Certificate #, Protocol ID, Title, PI, Institution, Date..."
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#005BAC]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl">
          {(['ALL', 'ACTIVE', 'REGENERATED', 'REVOKED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#005BAC] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {filteredCerts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700 text-sm">No Clearance Certificates Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No certificates matched your search or status filter. Try clearing your search parameters.'
              : 'Clearance certificates are automatically issued when research protocols achieve official APPROVED status.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCerts.map((cert) => {
            const matchingSub = submissions.find((s) => s.id === cert.protocolId || s.refNo === cert.refNo);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5 relative overflow-hidden"
              >
                {/* Top Badge Row */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#005BAC] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {cert.certNo}
                        </span>
                        <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                          Version {cert.version}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">Protocol Ref: {cert.refNo}</p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                        cert.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : cert.status === 'REGENERATED'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : 'bg-red-50 text-red-800 border-red-300'
                      }`}
                    >
                      {cert.status} CLEARANCE
                    </span>
                  </div>

                  {/* Protocol Title */}
                  <h3 className="font-bold text-gray-900 text-sm mt-3 leading-snug line-clamp-2">
                    {cert.researchTitle}
                  </h3>

                  {/* Investigators & Institution Metadata */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate"><strong>PI:</strong> {cert.principalInvestigator}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate"><strong>Institution:</strong> {cert.institution}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span><strong>Issued:</strong> {formatDateWithCalendar(cert.approvalDate, calendar, language)}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Valid to:</strong> {formatDateWithCalendar(cert.expiryDate, calendar, language)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (matchingSub) {
                          setActiveCertModalSub(matchingSub);
                        } else {
                          // Fallback mock submission object
                          setActiveCertModalSub({
                            id: cert.protocolId,
                            refNo: cert.refNo,
                            title: cert.researchTitle,
                            principalInvestigator: {
                              name: cert.principalInvestigator,
                              institution: cert.institution,
                              email: 'pi@ohb.gov.et',
                              phone: '+251911002233',
                            },
                            approvalCertificate: {
                              refNo: cert.certNo,
                              approvalDate: cert.approvalDate,
                              expiryDate: cert.expiryDate,
                              signatureName: cert.signatureName,
                              qrCodeUrl: cert.qrCodeUrl,
                              verificationUrl: `/verify/${encodeURIComponent(cert.certNo)}`,
                            },
                            status: 'APPROVED',
                            abstract: '',
                            keywords: [],
                            studyType: 'EPIDEMIOLOGICAL',
                            fundingSource: 'Grant',
                            sponsor: 'OHB',
                            zone: 'Finfinnee',
                            woreda: 'Special Zone',
                            submittedAt: cert.approvalDate,
                            updatedAt: cert.approvalDate,
                            documents: [],
                            reviews: [],
                            comments: [],
                            checklist: {
                              humanSubjects: true,
                              animalStudy: false,
                              clinicalTrial: false,
                              secondaryData: false,
                              geneticResearch: false,
                              biologicalSamples: false,
                              vulnerablePopulation: {
                                children: false,
                                pregnantWomen: false,
                                prisoners: false,
                                disabled: false,
                                refugees: false,
                              },
                            },
                          });
                        }
                      }}
                      className="bg-[#005BAC] hover:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>A4 Certificate</span>
                    </button>

                    <button
                      onClick={() => handleRegenerateCertificate(cert.protocolId)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-2.5 py-1.5 rounded-lg border border-purple-200 transition-colors cursor-pointer flex items-center space-x-1"
                      title="Regenerate Certificate without changing original Certificate Number"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-purple-600" />
                      <span>Regenerate</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onVerifyPublic(cert.refNo)}
                      className="text-[#005BAC] hover:underline font-bold text-xs cursor-pointer flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render Certificate Modal if Active */}
      {activeCertModalSub && (
        <CertificateGeneratorModal
          submission={activeCertModalSub}
          language={language}
          calendar={calendar}
          brandingSettings={brandingSettings}
          onClose={() => setActiveCertModalSub(null)}
          onVerifyPublic={onVerifyPublic}
          onRegenerateCertificate={async (subId) => {
            await handleRegenerateCertificate(subId);
          }}
        />
      )}
    </div>
  );
};
