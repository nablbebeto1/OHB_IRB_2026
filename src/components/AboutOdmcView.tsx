import React from 'react';
import { BrandingSettings, SystemSettings, Language } from '../types';
import { OromiaLogo } from './OromiaLogo';
import {
  Building2,
  Target,
  Eye,
  Shield,
  ShieldCheck,
  Server,
  Lock,
  FileText,
  FilePlus,
  ClipboardCheck,
  Users,
  UserCheck,
  Award,
  Activity,
  BarChart3,
  HardDrive,
  Mail,
  History,
  CheckCircle2,
  Globe,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface AboutOdmcViewProps {
  brandingSettings?: BrandingSettings;
  systemSettings?: SystemSettings;
  language?: Language;
  onNavigateTab?: (tab: string) => void;
  onOpenContactModal?: () => void;
}

export const AboutOdmcView: React.FC<AboutOdmcViewProps> = ({
  brandingSettings,
  systemSettings,
  language = 'en',
  onNavigateTab,
  onOpenContactModal,
}) => {
  const orgName = brandingSettings?.organization_name || systemSettings?.organizationName || '';
  const orgShortName = brandingSettings?.organization_short_name || '';
  const aboutText = brandingSettings?.about_organization || '';
  const missionText = brandingSettings?.mission || '';
  const visionText = brandingSettings?.vision || '';
  const websiteUrl = brandingSettings?.website_url || systemSettings?.websiteUrl || '';
  const contactEmail = brandingSettings?.contact_email || systemSettings?.contactEmail || '';
  const contactPhone = brandingSettings?.contact_phone || systemSettings?.contactPhone || '';
  const officeAddress = brandingSettings?.office_address || systemSettings?.address || '';
  const logoUrl =
    brandingSettings?.organization_logo ||
    brandingSettings?.header_logo ||
    brandingSettings?.login_page_logo;
  const bannerUrl = brandingSettings?.organization_banner;
  const developedBy = brandingSettings?.developed_by_text || orgName;

  const coreResponsibilities = [
    {
      title: 'Digital Transformation',
      icon: Cpu,
      desc: 'Driving end-to-end digitizing of health administration, research workflows, and clinical data systems across Oromia Regional State.',
    },
    {
      title: 'Research Information Management',
      icon: FileText,
      desc: 'Managing digital repositories for scientific protocols, ethical approvals, clinical trials, and population health studies.',
    },
    {
      title: 'Health Data Governance',
      icon: ShieldCheck,
      desc: 'Establishing strict data security, privacy protocols, ethical compliance, and regional health data standardization guidelines.',
    },
    {
      title: 'Digital Innovation',
      icon: Zap,
      desc: 'Developing specialized web applications, AI-assisted decision systems, and mobile health tools tailored to regional needs.',
    },
    {
      title: 'Information Security',
      icon: Lock,
      desc: 'Enforcing 256-bit SSL encryption, role-based access control, immutable audit trails, and data protection standard compliance.',
    },
    {
      title: 'Capacity Building',
      icon: Users,
      desc: 'Training health professionals, researchers, and IRB committee members in modern health informatics and ethical review practices.',
    },
    {
      title: 'Technical Support',
      icon: Server,
      desc: 'Providing 24/7 system maintenance, database architecture management, cloud storage integration, and user assistance.',
    },
  ];

  const keyFeatures = [
    {
      id: 'sub',
      title: 'Secure Research Submission',
      icon: FilePlus,
      color: 'bg-blue-50 text-[#005BAC] border-blue-200',
      desc: 'Multi-lingual proposal portal supporting Afaan Oromo, Amharic, and English documentation with file scanning and metadata encryption.',
    },
    {
      id: 'wf',
      title: 'Ethical Review Workflow',
      icon: ClipboardCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Automated 7-stage review process spanning initial intake, scientific reviewer scoring, committee deliberations, and final signoff.',
    },
    {
      id: 'collab',
      title: 'Committee Collaboration',
      icon: Users,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Digital meeting workspace with agenda management, attendance logs, voting tools, discussion notes, and automated minutes generation.',
    },
    {
      id: 'rev',
      title: 'Reviewer Management',
      icon: UserCheck,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Blind review assignments, conflict of interest declarations, quantitative scorecard evaluations, and deadline tracking.',
    },
    {
      id: 'cert',
      title: 'Certificate Generation',
      icon: Award,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Automated generation of official ethics clearance certificates with dynamic cryptographic QR codes and official digital stamps.',
    },
    {
      id: 'track',
      title: 'Research Tracking',
      icon: Activity,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      desc: 'Post-approval monitoring module for annual progress reports, adverse event logs, protocol amendments, and site inspection audits.',
    },
    {
      id: 'dash',
      title: 'Dashboard & Analytics',
      icon: BarChart3,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'Real-time statistical summaries of protocol volume, review turnaround times, institutional distributions, and decision metrics.',
    },
    {
      id: 'doc',
      title: 'Document Repository',
      icon: HardDrive,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      desc: 'Centralized document archive synced with Google Drive Workspace and cloud backups for seamless document retrieval.',
    },
    {
      id: 'notif',
      title: 'Email Notifications',
      icon: Mail,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      desc: 'Automated SMTP email alerts for protocol status changes, reviewer assignments, committee invitations, and certificate dispatches.',
    },
    {
      id: 'audit',
      title: 'Audit Trail',
      icon: History,
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      desc: 'Cryptographic immutable log tracking user actions, IP addresses, timestamp records, state modifications, and administrative edits.',
    },
    {
      id: 'rbac',
      title: 'Role-Based Access Control',
      icon: Shield,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      desc: 'Fine-grained permissions for Super Admins, IRB Chairs, Reviewers, Secretaries, Committee Members, Researchers, and Public Guests.',
    },
    {
      id: 'approval',
      title: 'Digital Approval Process',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 border-green-200',
      desc: 'Official electronic signatory verification, Chairperson endorsement workflows, and instant public authenticity verification.',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Hero Header Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#002D59] via-[#005BAC] to-blue-900 text-white p-8 sm:p-10 border-b-4 border-amber-400">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Organization Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
          />
        )}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-300/30">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>{orgName ? `${orgName} • Central Digital Hub` : 'Institutional Review Board • Central Platform'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              About {orgName ? `${orgName} ${orgShortName ? `(${orgShortName})` : ''}` : 'Ethical Review Management System'}
            </h1>

            {aboutText ? (
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                {aboutText}
              </p>
            ) : (
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                The Institutional Review Board (IRB) Ethical Review Management System is a central digital platform developed to improve research ethics administration through secure, transparent, and paperless workflows.
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('submit-new')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center space-x-2 cursor-pointer"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>Submit Research Protocol</span>
                </button>
              )}
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab('verify-public')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all text-xs flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Verify Ethics Certificate</span>
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/30 text-center space-y-2">
            {logoUrl ? (
              <OromiaLogo variant="emblem" size="lg" logoUrl={logoUrl} alt={orgName || 'Logo'} />
            ) : (
              <OromiaLogo variant="emblem" size="lg" />
            )}
            {orgShortName && (
              <div className="text-[11px] font-extrabold text-[#005BAC] uppercase tracking-wider">
                {orgShortName}
              </div>
            )}
            <div className="text-[10px] text-slate-500 font-medium">Digital Research Ethics Portal</div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Grid - dynamically hidden if both are empty */}
      {(missionText || visionText) && (
        <div className={`grid grid-cols-1 ${missionText && visionText ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {missionText && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-blue-300 transition-all space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 bg-blue-50 text-[#005BAC] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Our Mission</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{missionText}</p>
            </div>
          )}

          {visionText && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:border-amber-300 transition-all space-y-3 relative overflow-hidden">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Our Vision</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{visionText}</p>
            </div>
          )}
        </div>
      )}

      {/* Core Responsibilities Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-[#005BAC] text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Core Organizational Mandates</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Core Responsibilities {orgShortName || orgName ? `of ${orgShortName || orgName}` : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System governance and essential digital health functions for research ethics management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreResponsibilities.map((resp, i) => {
            const IconComp = resp.icon;
            return (
              <div
                key={i}
                className="p-4 bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all space-y-2 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-[#005BAC] flex items-center justify-center group-hover:bg-[#005BAC] group-hover:text-white transition-colors">
                  <IconComp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{resp.title}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{resp.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* About the IRB System Section */}
      <div className="bg-gradient-to-br from-slate-900 via-[#002D59] to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 border border-slate-800">
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Flagship Digital Platform</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-2 text-white">
              About the IRB Ethical Review Management System
            </h2>
          </div>
          {(orgShortName || orgName) && (
            <span className="text-xs font-mono text-blue-200 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              Managed by {orgShortName || orgName}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-4xl">
          The Institutional Review Board (IRB) Ethical Review Management System is a digital platform
          {orgName ? (
            <>
              {' '}engineered and maintained by <strong>{orgName} {orgShortName ? `(${orgShortName})` : ''}</strong>. Designed to transform traditional paper-based research ethics workflows into a seamless, transparent, and cryptographically secure digital administration framework.
            </>
          ) : (
            ' designed to transform traditional paper-based research ethics workflows into a seamless, transparent, and cryptographically secure digital administration framework.'
          )}
        </p>

        {/* Enabled System Capabilities List */}
        <div className="bg-white/5 backdrop-blur-xs rounded-xl p-5 border border-white/10 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Core Capabilities Enabled by the System</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-blue-50">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Online protocol submission</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ethical review management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reviewer assignment</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Committee decision management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Certificate generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Monitoring and reporting</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Secure document management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Audit logging</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Role-based access control</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Cards Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-[#005BAC] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Comprehensive System Functionality</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">Key Features</h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered according to international bioethics guidelines (CIOMS, GCP, Declaration of Helsinki) and local health regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keyFeatures.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-2.5 bg-slate-50/50"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg border ${feat.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">{feat.title}</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Organization Contact & Footer Card - Only render if contact details exist */}
      {(orgName || websiteUrl || contactEmail || contactPhone || officeAddress) && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              {orgName && <h3 className="text-lg font-extrabold text-white">{orgName}</h3>}
              <p className="text-xs text-slate-400 mt-0.5">Central Hub for Health Information Management & Innovation</p>
            </div>
            {orgShortName && (
              <div className="text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-300/20">
                Maintained by {orgShortName}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {websiteUrl && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-400" />
                  Website
                </span>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:underline font-mono truncate block"
                >
                  {websiteUrl}
                </a>
              </div>
            )}

            {contactEmail && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                  <Mail className="w-3 h-3 text-blue-400" />
                  Contact Email
                </span>
                <a href={`mailto:${contactEmail}`} className="text-slate-200 hover:underline font-mono truncate block">
                  {contactEmail}
                </a>
              </div>
            )}

            {contactPhone && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-400" />
                  Contact Phone
                </span>
                <span className="text-slate-200 font-mono block">{contactPhone}</span>
              </div>
            )}

            {officeAddress && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-400" />
                  Office Location
                </span>
                <span className="text-slate-200 block truncate">{officeAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
