import React, { useState } from 'react';
import { OromiaLogo } from './OromiaLogo';
import { User, UserRole, Language } from '../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Globe,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  CheckCircle2,
  Building,
  KeyRound,
} from 'lucide-react';

interface LoginPageProps {
  users: User[];
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  language,
  onLanguageChange,
  onLoginSuccess,
}) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRolePreset, setSelectedRolePreset] = useState<UserRole>('IRB_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);

  // Quick Preset Role Selection helper
  const handleSelectPreset = (role: UserRole) => {
    setSelectedRolePreset(role);
    const matchedUser = users.find((u) => u.role === role) || users[0];
    if (matchedUser) {
      setUsernameOrEmail(matchedUser.email);
      setPassword('••••••••');
      setErrorMessage('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your email or username');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching user or fallback to preset user
      const matchedUser =
        users.find(
          (u) =>
            u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
            u.name.toLowerCase().includes(usernameOrEmail.toLowerCase())
        ) ||
        users.find((u) => u.role === selectedRolePreset) ||
        users[0];

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 600);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail) {
      setResetSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: System Branding & Research Illustration Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#003B73] via-[#005BAC] to-blue-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Background Subtle Geometric Pattern */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Top Branding Section */}
          <div className="space-y-6 relative z-10">
            <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/20 inline-block">
              <OromiaLogo variant="wide" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border border-amber-300/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>OHB IRB Ethical System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Oromia Health Bureau
              </h1>
              <p className="text-amber-300 font-bold text-sm tracking-wide">
                Institutional Review Board (IRB) Ethical Review Management System
              </p>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed max-w-md">
              Official digital gateway for health research governance, ethical protocol evaluation, scientific panel review, and QR-verified clearance credentials across Oromia Regional State.
            </p>
          </div>

          {/* Center Health Research Artwork / Key Value Props */}
          <div className="my-6 space-y-3 relative z-10">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-start space-x-3">
              <Award className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-white">WHO & GCP Compliant Governance</h4>
                <p className="text-[11px] text-blue-100">
                  Adheres strictly to Ethiopian National Ethics Guidelines, CIOMS & Declaration of Helsinki standards.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-white">Multi-Lingual Consent & Review</h4>
                <p className="text-[11px] text-blue-100">
                  Full support for Afaan Oromo, Amharic, and English protocol documentation and review tools.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-blue-200 flex justify-between items-center relative z-10">
            <span>© 2026 Oromia Health Bureau</span>
            <span>Version 3.4.0</span>
          </div>
        </div>

        {/* Right Column: Authentication Card & Form */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-white">
          {/* Top Right Header: Language Switcher */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Sign In
            </div>

            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="om">Afaan Oromoo</option>
                <option value="am">አማርኛ</option>
              </select>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="my-auto py-6 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to log in to the OHB Ethical Review Portal.
              </p>
            </div>

            {/* Quick Demo Account Selector Preset Badges */}
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#005BAC]">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Select Demo Account Role:</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(
                  [
                    { role: 'IRB_ADMIN', label: 'IRB Admin' },
                    { role: 'REVIEWER', label: 'Reviewer' },
                    { role: 'RESEARCHER', label: 'Investigator' },
                    { role: 'SUPER_ADMIN', label: 'Super Admin' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectPreset(item.role)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center cursor-pointer border ${
                      selectedRolePreset === item.role
                        ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="e.g. admin.irb@ohb.gov.et"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-bold text-[#005BAC] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter system password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#005BAC] focus:ring-[#005BAC]"
                  />
                  <span>Remember Me</span>
                </label>
                <span className="text-[11px] text-slate-400">JWT Token Auth</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#005BAC] hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Assurance Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span>OHB Secretariat Support</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-[#005BAC] font-bold text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Reset Password</span>
              </div>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetSubmitted(false);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSubmitted ? (
              <div className="space-y-3 text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">Reset Link Dispatched</h4>
                <p className="text-xs text-slate-500">
                  Password recovery instructions have been sent to <strong>{resetEmail}</strong>. Please check your inbox or contact the OHB Secretariat.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSubmitted(false);
                  }}
                  className="w-full bg-[#005BAC] text-white font-bold py-2 rounded-xl text-xs mt-2 cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered email address below. We will send you a secure link to reset your system password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="investigator@ohb.gov.et"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#005BAC] text-white text-xs font-bold rounded-xl hover:bg-blue-800 cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
