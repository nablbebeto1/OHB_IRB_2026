import React, { useState } from 'react';
import { OromiaLogo } from './OromiaLogo';
import {
  UserRole,
  Language,
  CalendarType,
  User,
  NotificationItem,
} from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  Shield,
  Bell,
  Search,
  Globe,
  Calendar as CalendarIcon,
  ChevronDown,
  UserCheck,
  Building2,
  FileCheck,
  User as UserIcon,
  Settings as SettingsIcon,
  Key,
  History,
  HelpCircle,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  calendar: CalendarType;
  onCalendarChange: (cal: CalendarType) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
  onOpenPublicPortal: () => void;
  onOpenLogoutModal: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  currentRole,
  onRoleChange,
  language,
  onLanguageChange,
  calendar,
  onCalendarChange,
  notifications,
  onOpenNotifications,
  onOpenSearch,
  onOpenPublicPortal,
  onOpenLogoutModal,
  onNavigateTab,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const t = translations[language];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { en: string; om: string; am: string; bg: string }> = {
    SUPER_ADMIN: { en: 'Super Admin', om: 'Super Admin', am: 'ሱፐር አድሚን', bg: 'bg-purple-100 text-purple-800' },
    IRB_ADMIN: { en: 'IRB Administrator', om: 'Bulchaa IRB', am: 'የIRB አስተዳዳሪ', bg: 'bg-blue-100 text-blue-800' },
    IRB_CHAIR: { en: 'IRB Chairperson', om: 'Dura Taa\'aa IRB', am: 'የIRB ሰብሳቢ', bg: 'bg-emerald-100 text-emerald-800' },
    SECRETARY: { en: 'IRB Secretary', om: 'Sekreetarii IRB', am: 'የIRB ጸሐፊ', bg: 'bg-amber-100 text-amber-800' },
    REVIEWER: { en: 'Ethics Reviewer', om: 'Madaalaa Naamuusii', am: 'የሥነ-ምግባር ገምጋሚ', bg: 'bg-indigo-100 text-indigo-800' },
    COMMITTEE_MEMBER: { en: 'Committee Member', om: 'Mala Koree', am: 'የኮሚቴ አባል', bg: 'bg-teal-100 text-teal-800' },
    RESEARCHER: { en: 'Principal Researcher', om: 'Qorataa Guddaa', am: 'ዋና ተመራማሪ', bg: 'bg-cyan-100 text-cyan-800' },
    GUEST: { en: 'Public / Guest', om: 'Keessummaa Uummataa', am: 'የህዝብ/እንግዳ', bg: 'bg-gray-100 text-gray-800' },
  };

  const currentDateFormatted = formatDateWithCalendar(new Date().toISOString(), calendar, language);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      {/* Top National/Regional Banner */}
      <div className="bg-[#005BAC] text-white px-4 py-1.5 text-xs font-medium flex justify-between items-center">
        <div className="flex items-center space-x-2 truncate">
          <span className="bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded font-bold text-[10px]">ETHIOPIA</span>
          <span className="font-semibold">{t.bureauName}</span>
          <span className="hidden sm:inline opacity-75">|</span>
          <span className="hidden md:inline text-blue-100 truncate">{t.irbFullName}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-blue-900/60 px-2 py-0.5 rounded text-[11px]">
            <CalendarIcon className="w-3 h-3 text-amber-300" />
            <span>{currentDateFormatted}</span>
          </div>
          <button
            onClick={onOpenPublicPortal}
            className="hidden lg:flex items-center space-x-1 hover:text-amber-200 transition-colors cursor-pointer text-[11px]"
          >
            <Globe className="w-3 h-3" />
            <span>{t.guestPortal}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Bureau Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigateTab?.('dashboard')}>
            <OromiaLogo variant="emblem" size="md" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-[#005BAC] text-base tracking-tight">OHB-IRB</span>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-300">
                  REGIONAL
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Oromia Health Bureau • Institutional Review Board
              </p>
            </div>
          </div>

          {/* Search Trigger */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              onClick={onOpenSearch}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <span className="truncate">{t.searchPlaceholder}</span>
              </div>
              <kbd className="bg-white border border-gray-300 text-gray-400 text-[10px] px-1.5 py-0.5 rounded">Ctrl+K</kbd>
            </button>
          </div>

          {/* Right Controls: Role Switcher, Language, Calendar, Notifications, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Calendar Selector */}
            <div className="bg-gray-100 p-0.5 rounded-lg flex text-xs">
              <button
                onClick={() => onCalendarChange('GC')}
                className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  calendar === 'GC' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Gregorian Calendar"
              >
                G.C.
              </button>
              <button
                onClick={() => onCalendarChange('EC')}
                className={`px-2 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  calendar === 'EC' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Ethiopian Calendar (2018 E.C.)"
              >
                E.C.
              </button>
            </div>

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-xs font-medium text-gray-700 hover:text-blue-700 bg-gray-50 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="uppercase font-semibold">{language}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${language === 'en' ? 'font-bold text-blue-700' : 'text-gray-700'}`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => onLanguageChange('om')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${language === 'om' ? 'font-bold text-blue-700' : 'text-gray-700'}`}
                >
                  Afaan Oromo (OM)
                </button>
                <button
                  onClick={() => onLanguageChange('am')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${language === 'am' ? 'font-bold text-blue-700' : 'text-gray-700'}`}
                >
                  አማርኛ (AM)
                </button>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="relative group">
              <button className={`flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${roleLabels[currentRole].bg} border-current/20`}>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline truncate max-w-[120px]">
                  {roleLabels[currentRole][language]}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-gray-200 py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t.switchRole}
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      currentRole === r ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    <span>{roleLabels[r][language]}</span>
                    {currentRole === r && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title={t.notifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar with Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 pl-1 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border-2 border-[#005BAC] object-cover"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{currentUser.institution}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#005BAC] border border-blue-200">
                      {currentRole}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateTab?.('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005BAC] font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateTab?.('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005BAC] font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        alert('Password reset link has been dispatched to your email.');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005BAC] font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateTab?.('audit-trail');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005BAC] font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Activity Log</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onNavigateTab?.('public-portal');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#005BAC] font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Help & Guidelines</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenLogoutModal();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-bold flex items-center space-x-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

