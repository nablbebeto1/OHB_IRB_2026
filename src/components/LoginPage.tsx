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
  onRegisterUser?: (newUser: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  users,
  language,
  onLanguageChange,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login States
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

  // Force Password Change state for default admin nablbebeto
  const [pendingForceUser, setPendingForceUser] = useState<User | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmNewPasswordVal, setConfirmNewPasswordVal] = useState('');
  const [forcePassError, setForcePassError] = useState('');

  // Registration States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regOrganization, setRegOrganization] = useState('');
  const [regPosition, setRegPosition] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [createdUserWelcome, setCreatedUserWelcome] = useState<User | null>(null);

  // Quick Preset Role Selection helper
  const handleSelectPreset = (role: UserRole) => {
    setSelectedRolePreset(role);
    const matchedUser = users.find((u) => u.role === role) || users[0];
    if (matchedUser) {
      setUsernameOrEmail(matchedUser.username || matchedUser.email);
      setPassword(matchedUser.password || '••••••••');
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
      setIsLoading(false);
      const inputTrim = usernameOrEmail.trim().toLowerCase();

      // Check specifically for nablbebeto
      if (inputTrim === 'nablbebeto') {
        const defaultAdmin = users.find((u) => u.username === 'nablbebeto') || {
          id: 'usr-admin-default',
          name: 'Nabl Bebeto',
          username: 'nablbebeto',
          email: 'nablbebeto@ohb.gov.et',
          role: 'SUPER_ADMIN' as UserRole,
          department: 'Directorate of Health Research & Technology Transfer',
          institution: 'Oromia Health Bureau',
          status: 'ACTIVE' as const,
          forcePasswordChange: true,
          password: 'nablbebeto',
        };

        if (password && password !== 'nablbebeto' && password !== '••••••••') {
          // If custom password didn't match default
          // proceed
        }

        if (defaultAdmin.forcePasswordChange) {
          setPendingForceUser(defaultAdmin);
          return;
        }

        onLoginSuccess(defaultAdmin);
        return;
      }

      // Find matching user
      const matchedUser =
        users.find(
          (u) =>
            u.email.toLowerCase() === inputTrim ||
            (u.username && u.username.toLowerCase() === inputTrim) ||
            u.name.toLowerCase().includes(inputTrim)
        ) ||
        users.find((u) => u.role === selectedRolePreset) ||
        users[0];

      if (matchedUser.forcePasswordChange) {
        setPendingForceUser(matchedUser);
        return;
      }

      onLoginSuccess(matchedUser);
    }, 600);
  };

  const handleForcePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForcePassError('');
    if (!newPasswordVal || newPasswordVal.length < 6) {
      setForcePassError('Password must be at least 6 characters long');
      return;
    }
    if (newPasswordVal !== confirmNewPasswordVal) {
      setForcePassError('Passwords do not match');
      return;
    }

    if (pendingForceUser) {
      const updatedUser: User = {
        ...pendingForceUser,
        password: newPasswordVal,
        forcePasswordChange: false,
      };
      setPendingForceUser(null);
      onLoginSuccess(updatedUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please complete all required fields.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: User = {
        id: `usr-reg-${Date.now()}`,
        name: regFullName.trim(),
        username: regEmail.split('@')[0],
        email: regEmail.trim(),
        role: 'RESEARCHER',
        institution: regOrganization.trim() || 'Research Institution',
        position: regPosition.trim() || 'Principal Investigator',
        status: 'ACTIVE',
        password: regPassword,
      };

      if (onRegisterUser) {
        onRegisterUser(newUser);
      }

      setCreatedUserWelcome(newUser);
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
          {/* Top Right Header: Language Switcher & Auth Mode Toggle */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'LOGIN'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  authMode === 'REGISTER'
                    ? 'bg-[#005BAC] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
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
            {authMode === 'LOGIN' ? (
              <>
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
                      <span>Select System Role Account:</span>
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
                        placeholder="e.g. nablbebeto or thomas.mohammed@orhb.gov.et"
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
              </>
            ) : (
              /* REGISTER ACCOUNT FORM */
              <>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Investigator Account</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Register as a researcher/investigator to submit ethics proposals to OHB IRB.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                    {regError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Dr. Abebe Bikila"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. abebe.b@ju.edu.et"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Institution</label>
                      <input
                        type="text"
                        value={regOrganization}
                        onChange={(e) => setRegOrganization(e.target.value)}
                        placeholder="e.g. Jimma University"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Position / Title</label>
                      <input
                        type="text"
                        value={regPosition}
                        onChange={(e) => setRegPosition(e.target.value)}
                        placeholder="e.g. Associate Professor"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Create Investigator Account</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
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
      {/* Welcome Email Modal */}
      {createdUserWelcome && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                <Mail className="w-5 h-5 text-emerald-600" />
                <span>Account Created & Welcome Email Dispatched</span>
              </div>
              <button
                onClick={() => {
                  const userToLogin = createdUserWelcome;
                  setCreatedUserWelcome(null);
                  onLoginSuccess(userToLogin);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3 font-mono text-slate-800">
              <div className="border-b border-slate-200 pb-2 text-[11px] text-slate-500 font-sans">
                <div><strong>To:</strong> {createdUserWelcome.email}</div>
                <div><strong>Subject:</strong> Welcome to Oromia Health Bureau IRB System</div>
                <div><strong>From:</strong> Oromia Health Bureau IRB Administration &lt;irb@ohb.gov.et&gt;</div>
              </div>

              <div className="font-sans text-xs space-y-2 leading-relaxed text-slate-700">
                <p>Dear {createdUserWelcome.name},</p>
                <p>Welcome to the Oromia Health Bureau Institutional Review Board (IRB) Management System.</p>
                <p>Your account has been successfully created.</p>
                <p>You can now access the system to submit, manage, and monitor research ethics review activities.</p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1 my-2">
                  <div><strong>Organization:</strong> {createdUserWelcome.institution || 'Oromia Health Bureau'}</div>
                  <div><strong>Role:</strong> {createdUserWelcome.role}</div>
                </div>
                <p>Thank you.</p>
                <p className="font-bold text-[#005BAC]">Oromia Health Bureau IRB Administration</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  const userToLogin = createdUserWelcome;
                  setCreatedUserWelcome(null);
                  onLoginSuccess(userToLogin);
                }}
                className="w-full bg-[#005BAC] hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>Access System Workspace Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Password Change Modal (Default Admin or Required) */}
      {pendingForceUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-amber-300">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Security Notice: Password Reset Required</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Welcome, <strong>{pendingForceUser.name}</strong> ({pendingForceUser.username || pendingForceUser.email}).
              First-time login detected for default super admin credentials. For security compliance, please set a new strong password before continuing.
            </p>

            {forcePassError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold">
                {forcePassError}
              </div>
            )}

            <form onSubmit={handleForcePasswordChangeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPasswordVal}
                  onChange={(e) => setConfirmNewPasswordVal(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-[#005BAC] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#005BAC] hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <span>Update Password & Enter System</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
