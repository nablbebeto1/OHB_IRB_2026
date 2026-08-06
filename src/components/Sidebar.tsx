import React from 'react';
import { UserRole, Language } from '../types';
import { translations } from '../utils/i18n';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  ClipboardCheck,
  Calendar,
  Activity,
  Award,
  CheckCircle2,
  BarChart3,
  History,
  Settings,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  LogOut,
  HardDrive,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  language: Language;
  pendingReviewsCount: number;
  upcomingMeetingsCount: number;
  onOpenLogoutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  language,
  pendingReviewsCount,
  upcomingMeetingsCount,
  onOpenLogoutModal,
}) => {
  const t = translations[language];

  const menuItems = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'REVIEWER', 'COMMITTEE_MEMBER', 'RESEARCHER', 'GUEST'],
    },
    {
      id: 'submissions',
      label: t.navSubmissions,
      icon: FileText,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'REVIEWER', 'COMMITTEE_MEMBER', 'RESEARCHER'],
    },
    {
      id: 'submit-new',
      label: t.navSubmitNew,
      icon: FilePlus,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'RESEARCHER'],
      highlight: true,
    },
    {
      id: 'reviewer-workspace',
      label: t.navReviewerPortal,
      icon: ClipboardCheck,
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'REVIEWER', 'COMMITTEE_MEMBER'],
    },
    {
      id: 'committee-meetings',
      label: t.navCommittee,
      icon: Calendar,
      badge: upcomingMeetingsCount > 0 ? upcomingMeetingsCount : undefined,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'COMMITTEE_MEMBER', 'REVIEWER'],
    },
    {
      id: 'monitoring',
      label: t.navMonitoring,
      icon: Activity,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'RESEARCHER'],
    },
    {
      id: 'certificates',
      label: t.navCertificates,
      icon: Award,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'RESEARCHER'],
    },
    {
      id: 'google-drive',
      label: 'Google Drive Sync',
      icon: HardDrive,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'REVIEWER', 'COMMITTEE_MEMBER', 'RESEARCHER'],
    },
    {
      id: 'verify-public',
      label: t.navVerifyPublic,
      icon: CheckCircle2,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'REVIEWER', 'COMMITTEE_MEMBER', 'RESEARCHER', 'GUEST'],
    },
    {
      id: 'reports',
      label: t.navReports,
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY'],
    },
    {
      id: 'audit-trail',
      label: t.navAuditLogs,
      icon: History,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR'],
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN'],
    },
    {
      id: 'public-portal',
      label: t.guestPortal,
      icon: BookOpen,
      roles: ['SUPER_ADMIN', 'IRB_ADMIN', 'IRB_CHAIR', 'SECRETARY', 'REVIEWER', 'COMMITTEE_MEMBER', 'RESEARCHER', 'GUEST'],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          {currentRole === 'GUEST' ? 'Public Portal' : 'Main Navigation'}
        </div>
        <nav className="space-y-1 mt-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#005BAC] text-white font-semibold shadow-sm'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-600' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance Footer Badge & Logout Button */}
      <div className="mt-8 pt-4 border-t border-gray-100 space-y-3">
        {onOpenLogoutModal && (
          <button
            onClick={onOpenLogoutModal}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Sign Out / Logout</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-red-400" />
          </button>
        )}

        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200/60">
          <div className="flex items-center space-x-2 text-[#005BAC] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ETHICS GUIDELINE</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
            Aligned with WHO, CIOMS, Helsinki, GCP & Ethiopian National Research Ethics Guidelines.
          </p>
          <div className="mt-2 text-[9px] text-gray-400 font-mono">OHB IRB Version 4.2.0</div>
        </div>
      </div>
    </aside>
  );
};
