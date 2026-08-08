import React, { useState, useEffect, useRef } from 'react';
import { OromiaLogo } from './OromiaLogo';
import { resolveAssetUrl } from '../utils/assetResolver';
import { Submission, Language, CalendarType, BrandingSettings } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  Award,
  Printer,
  X,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Download,
  Maximize,
  HelpCircle,
  HardDrive,
  Loader2,
} from 'lucide-react';
import { getCachedAccessToken, googleDriveSignIn, exportCertificateToDrive } from '../lib/googleDriveService';

interface CertificateGeneratorModalProps {
  submission: Submission | null;
  language: Language;
  calendar: CalendarType;
  brandingSettings?: BrandingSettings;
  onClose: () => void;
  onVerifyPublic: (refNo: string) => void;
  onRegenerateCertificate?: (submissionId: string) => Promise<void> | void;
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  submission,
  language,
  calendar,
  brandingSettings,
  onClose,
  onVerifyPublic,
  onRegenerateCertificate,
}) => {
  if (!submission) return null;
  const t = translations[language];

  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1; // Single official certificate page
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratedMsg, setRegeneratedMsg] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const cert = submission.approvalCertificate || {
    refNo: submission.refNo,
    approvalDate: submission.updatedAt || new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    signatureName: 'Prof. Gemechu Hunduma (Chairperson)',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(submission.refNo)}`,
    verificationUrl: `/verify/${encodeURIComponent(submission.refNo)}`,
  };

  const handleRegenerate = async () => {
    if (!onRegenerateCertificate) return;
    setIsRegenerating(true);
    try {
      await onRegenerateCertificate(submission.id);
      setRegeneratedMsg('Certificate regenerated! Ref No retained.');
      setTimeout(() => setRegeneratedMsg(''), 4000);
    } catch (err) {
      console.error('Failed to regenerate certificate:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const [isExportingDrive, setIsExportingDrive] = useState(false);
  const [driveExportSuccess, setDriveExportSuccess] = useState(false);

  const handleExportToDrive = async () => {
    setIsExportingDrive(true);
    setDriveExportSuccess(false);
    try {
      let token = getCachedAccessToken();
      if (!token) {
        const signInRes = await googleDriveSignIn();
        token = signInRes?.accessToken || null;
      }
      if (token) {
        await exportCertificateToDrive(token, submission);
        setDriveExportSuccess(true);
        setTimeout(() => setDriveExportSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to export certificate to Google Drive:', err);
    } finally {
      setIsExportingDrive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create simulated PDF download
    const link = document.createElement('a');
    link.href = cert.qrCodeUrl;
    link.download = `OHB_IRB_Ethics_Certificate_${submission.refNo.replace(/\//g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // ESC: Exit full screen if active, or close viewer
      if (e.key === 'Escape') {
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        } else {
          onClose();
        }
      }

      // Ctrl + P: Print
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrint();
      }

      // Ctrl + D: Download
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        handleDownload();
      }

      // Zoom In (Ctrl + + or +)
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(200, prev + 10));
      }

      // Zoom Out (Ctrl + - or -)
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(50, prev - 10));
      }

      // Reset Zoom (0)
      if (e.key === '0' && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoomLevel(100);
        setRotationDeg(0);
      }

      // Page Navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentPage((prev) => Math.max(1, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setCurrentPage(1);
      }
      if (e.key === 'End') {
        e.preventDefault();
        setCurrentPage(totalPages);
      }

      // Toggle Fullscreen (F key)
      if ((e.key === 'f' || e.key === 'F') && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden print:p-0 print:static print:bg-white"
    >
      {/* Top Toolbar Navigation Header */}
      <div className="w-full max-w-6xl bg-slate-800 text-white rounded-xl shadow-2xl px-4 py-2.5 flex items-center justify-between gap-2 z-20 border border-slate-700 print:hidden">
        {/* Left Section: Back & Page Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Return to Previous Page (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="hidden md:flex items-center space-x-2 text-xs font-bold border-l border-slate-700 pl-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="truncate max-w-[200px]">{submission.title}</span>
          </div>
        </div>

        {/* Center Section: Page Navigation & Zoom & Rotate Controls */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Pagination */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
              title="Previous Page (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] px-1 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
              title="Next Page (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-1 hover:text-amber-400 cursor-pointer"
              title="Zoom Out (Ctrl + -)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] font-bold w-12 text-center text-amber-300">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
              className="p-1 hover:text-amber-400 cursor-pointer"
              title="Zoom In (Ctrl + +)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(100);
                setRotationDeg(0);
              }}
              className="px-2 py-0.5 text-[10px] bg-slate-700 hover:bg-slate-600 rounded font-bold cursor-pointer"
              title="Reset Zoom / Fit Screen (0)"
            >
              Reset
            </button>
          </div>

          {/* Rotate Button */}
          <button
            onClick={() => setRotationDeg((r) => (r + 90) % 360)}
            className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 cursor-pointer"
            title="Rotate Certificate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right Section: Print, Download, Fullscreen, Close */}
        <div className="flex items-center space-x-2 shrink-0">
          {onRegenerateCertificate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer shadow-sm transition-colors disabled:opacity-50"
              title="Regenerate Certificate (retains Ref No)"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <RotateCw className="w-4 h-4 text-white" />
              )}
              <span className="hidden lg:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer shadow-sm"
            title="Print Certificate (Ctrl + P)"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden lg:inline">Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-[#005BAC] hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer shadow-sm"
            title="Download PDF (Ctrl + D)"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">Download</span>
          </button>

          <button
            onClick={handleExportToDrive}
            disabled={isExportingDrive}
            className={`font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer shadow-sm transition-colors ${
              driveExportSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
            }`}
            title="Save Certificate to Google Drive"
          >
            {isExportingDrive ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : driveExportSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <HardDrive className="w-4 h-4 text-slate-900" />
            )}
            <span className="hidden lg:inline">
              {driveExportSuccess ? 'Saved to Drive!' : 'Save to Drive'}
            </span>
          </button>

          <button
            onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer"
            title="Toggle Full Screen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-red-400 hover:text-white hover:bg-red-600/80 rounded-lg cursor-pointer transition-colors"
            title="Close Certificate Viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal Overlay */}
      {showShortcutsHelp && (
        <div className="absolute top-16 right-6 z-40 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl p-4 shadow-2xl max-w-sm text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h4 className="font-bold text-amber-400">Keyboard Shortcuts</h4>
            <button onClick={() => setShowShortcutsHelp(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">Esc</kbd> Exit Fullscreen / Close</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">Ctrl + P</kbd> Print Certificate</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">Ctrl + D</kbd> Download PDF</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">Ctrl + +</kbd> Zoom In</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">Ctrl + -</kbd> Zoom Out</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">0</kbd> Reset Zoom</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">← / →</kbd> Prev / Next Page</div>
            <div><kbd className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">F</kbd> Toggle Full Screen</div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CANVAS AREA */}
      <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4 print:p-0 print:overflow-visible">
        <div
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotationDeg}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="bg-white rounded-2xl shadow-2xl max-w-[210mm] w-full min-h-[297mm] aspect-[1/1.414] flex flex-col justify-between overflow-hidden border border-gray-200 print:shadow-none print:border-none print:max-w-none print:w-full print:h-full print:transform-none"
        >
          {/* CERTIFICATE PRINTABLE CONTENT */}
          <div className="p-8 sm:p-12 space-y-6 border-8 border-double border-[#005BAC] m-4 rounded-xl bg-gradient-to-b from-blue-50/20 via-white to-amber-50/20 relative overflow-hidden flex-1 flex flex-col justify-between">
            {/* Header Seals */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex justify-center items-center h-16 pb-1">
                <img
                  src={resolveAssetUrl('certificate_logo', brandingSettings)}
                  alt="Certificate Header Logo"
                  className="max-h-full max-w-xs object-contain"
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#005BAC] tracking-tight">
                OROMIA HEALTH BUREAU
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-t border-gray-300 py-1 inline-block px-4">
                INSTITUTIONAL REVIEW BOARD (OHB-IRB) ETHICAL CLEARANCE
              </h2>
            </div>

            {/* Reference Info Box */}
            <div className="flex justify-between items-center text-xs font-mono font-bold border-b pb-3">
              <div>
                <span className="text-gray-500 font-sans">Certificate Ref No: </span>
                <span className="text-[#005BAC] text-sm">{cert.refNo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-sans">Date of Approval: </span>
                <span className="text-gray-900">{formatDateWithCalendar(cert.approvalDate, calendar, language)}</span>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-xs text-gray-800 leading-relaxed space-y-4">
              <p className="text-center italic text-gray-600 font-serif text-sm">
                This is to certify that the research protocol detailed below has been rigorously evaluated and granted official ethical clearance by the Oromia Health Bureau Institutional Review Board (OHB-IRB).
              </p>

              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                <div>
                  <span className="font-bold text-gray-500 text-[10px] uppercase">Research Protocol Title:</span>
                  <p className="font-extrabold text-gray-900 text-sm">{submission.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px]">
                  <div>
                    <span className="text-gray-500 font-semibold">Principal Investigator: </span>
                    <span className="font-bold">{submission.principalInvestigator.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">Institution: </span>
                    <span className="font-bold">{submission.principalInvestigator.institution}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">Study Region & Zone: </span>
                    <span className="font-bold">Oromia, {submission.zone} ({submission.woreda})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold">Validity Expiry Date: </span>
                    <span className="font-bold text-red-700">{formatDateWithCalendar(cert.expiryDate, calendar, language)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-gray-600">
                Clearance is granted strictly on condition that the Principal Investigator complies with the approved protocol, submits progress reports every 6 months, and reports any adverse events immediately to the OHB IRB Secretariat.
              </p>
            </div>

            {/* Signatures & Verification QR Code */}
            <div className="pt-6 border-t border-gray-300 flex items-center justify-between relative">
              <div className="space-y-1">
                <div className="h-10 flex items-center">
                  {brandingSettings?.signature_image ? (
                    <img
                      src={brandingSettings.signature_image}
                      alt="Chairperson Signature"
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <div className="font-serif italic text-sm font-bold text-blue-900 underline decoration-amber-400">
                      {brandingSettings?.signatory_name || 'Prof. Gemechu Hunduma'}
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-extrabold text-gray-900 border-t border-gray-400 pt-0.5">
                  {brandingSettings?.signatory_name || 'Prof. Gemechu Hunduma'}
                </p>
                <p className="text-[10px] font-bold text-gray-600 uppercase">
                  {brandingSettings?.signatory_title || 'Chairperson, OHB Institutional Review Board'}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Digitally Verified Signature</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center space-y-1 z-10">
                <img
                  src={cert.qrCodeUrl}
                  alt="Verification QR Code"
                  className="w-20 h-20 border-2 border-[#005BAC] rounded-lg mx-auto p-1 bg-white"
                />
                <button
                  onClick={() => onVerifyPublic(cert.refNo)}
                  className="text-[9px] font-bold text-[#005BAC] hover:underline cursor-pointer print:hidden"
                >
                  Verify Online
                </button>
              </div>

              {/* Official Stamp Overlay */}
              {brandingSettings?.stamp_enabled !== false && (
                <div
                  className={`absolute bottom-0 ${
                    brandingSettings?.stamp_position === 'bottom-center'
                      ? 'left-1/2 -translate-x-1/2'
                      : brandingSettings?.stamp_position === 'bottom-left'
                      ? 'left-24'
                      : 'right-24'
                  } pointer-events-none z-0`}
                >
                  <img
                    src={resolveAssetUrl('certificate_stamp', brandingSettings)}
                    alt="Official Stamp"
                    style={{
                      width: `${brandingSettings?.stamp_size || 130}px`,
                      opacity: brandingSettings?.stamp_opacity ?? 0.85,
                    }}
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Official Seal Footer */}
            <div className="text-center text-[9px] text-gray-400 border-t pt-2">
              Official Document of Oromia Health Bureau • Finfinnee / Addis Ababa, Ethiopia • Verification: irb.ohb.gov.et/verify
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
