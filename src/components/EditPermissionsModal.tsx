import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, Lock, CheckCircle2, X, RefreshCw, Award, Key, UserCheck, AlertCircle } from 'lucide-react';

interface EditPermissionsModalProps {
  user: User;
  onClose: () => void;
  onSavePermissions: (userId: string, newPermissions: string[], newRole?: UserRole) => Promise<void> | void;
}

const ALL_AVAILABLE_PERMISSIONS = [
  { id: 'submit_protocol', label: 'Submit Research Protocol', category: 'Protocol Management' },
  { id: 'edit_protocol', label: 'Edit Draft Protocol', category: 'Protocol Management' },
  { id: 'withdraw_protocol', label: 'Withdraw Protocol', category: 'Protocol Management' },
  { id: 'view_all_protocols', label: 'View All System Protocols', category: 'Protocol Management' },
  { id: 'assign_reviewers', label: 'Assign Reviewers & Chairs', category: 'Review & Evaluation' },
  { id: 'submit_scientific_review', label: 'Submit Scientific Review', category: 'Review & Evaluation' },
  { id: 'submit_ethics_review', label: 'Submit Ethics Review', category: 'Review & Evaluation' },
  { id: 'chair_decision', label: 'Issue Chair / Committee Decision', category: 'Review & Evaluation' },
  { id: 'approve_protocol', label: 'Issue Official Clearance Approval', category: 'Review & Evaluation' },
  { id: 'export_certificates', label: 'Generate & Export Certificates', category: 'Governance & Certificates' },
  { id: 'regenerate_certificates', label: 'Regenerate Clearance Certificates', category: 'Governance & Certificates' },
  { id: 'manage_users', label: 'Manage Users & User Accounts', category: 'Administration & RBAC' },
  { id: 'edit_permissions', label: 'Grant & Edit Custom Permissions', category: 'Administration & RBAC' },
  { id: 'manage_branding', label: 'Configure System & System Branding', category: 'Administration & RBAC' },
  { id: 'configure_smtp', label: 'Configure SMTP Email Gateway', category: 'Administration & RBAC' },
  { id: 'view_audit_logs', label: 'Access System Security Audit Logs', category: 'Administration & RBAC' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ALL_AVAILABLE_PERMISSIONS.map((p) => p.id),
  IRB_ADMIN: ALL_AVAILABLE_PERMISSIONS.map((p) => p.id),
  IRB_CHAIR: [
    'submit_protocol', 'view_all_protocols', 'assign_reviewers', 'submit_scientific_review',
    'submit_ethics_review', 'chair_decision', 'approve_protocol', 'export_certificates',
    'regenerate_certificates', 'view_audit_logs',
  ],
  SECRETARY: [
    'submit_protocol', 'view_all_protocols', 'assign_reviewers', 'export_certificates',
    'regenerate_certificates',
  ],
  REVIEWER: ['submit_scientific_review', 'submit_ethics_review'],
  COMMITTEE_MEMBER: ['view_all_protocols', 'submit_ethics_review'],
  RESEARCHER: ['submit_protocol', 'edit_protocol', 'withdraw_protocol'],
  ADMIN: ['manage_users', 'manage_branding', 'configure_smtp', 'view_audit_logs'],
  GUEST: [],
};

export const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  user,
  onClose,
  onSavePermissions,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [activePermissions, setActivePermissions] = useState<string[]>(
    user.customPermissions && user.customPermissions.length > 0
      ? user.customPermissions
      : DEFAULT_ROLE_PERMISSIONS[user.role] || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const togglePermission = (permId: string) => {
    setActivePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleApplyRolePreset = (role: UserRole) => {
    setSelectedRole(role);
    setActivePermissions(DEFAULT_ROLE_PERMISSIONS[role] || []);
  };

  const handleSelectAll = () => {
    setActivePermissions(ALL_AVAILABLE_PERMISSIONS.map((p) => p.id));
  };

  const handleClearAll = () => {
    setActivePermissions([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await onSavePermissions(user.id, activePermissions, selectedRole);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update permissions.');
      setIsSaving(false);
    }
  };

  const categories = Array.from(new Set(ALL_AVAILABLE_PERMISSIONS.map((p) => p.category)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-200 my-8">
        {/* Header */}
        <div className="bg-[#005BAC] text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Edit User Permissions & Custom Scopes</h2>
              <p className="text-blue-100 text-xs">
                {user.name} ({user.email}) • Current Role: <strong className="text-amber-300">{user.role}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Role Preset Switcher */}
          <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <label className="text-xs font-extrabold text-gray-800 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-[#005BAC]" />
              <span>Primary System Role Assignment</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {(
                [
                  'SUPER_ADMIN',
                  'IRB_ADMIN',
                  'IRB_CHAIR',
                  'SECRETARY',
                  'REVIEWER',
                  'COMMITTEE_MEMBER',
                  'RESEARCHER',
                  'ADMIN',
                ] as UserRole[]
              ).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleApplyRolePreset(role)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                    selectedRole === role
                      ? 'bg-[#005BAC] text-white border-[#005BAC] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 pt-1">
              Selecting a role auto-loads standard baseline permissions. You can customize fine-grained scopes below.
            </p>
          </div>

          {/* Preset Utility Toolbar */}
          <div className="flex justify-between items-center text-xs border-b pb-3">
            <span className="font-bold text-gray-700">
              Active Scope Count: <strong className="text-[#005BAC]">{activePermissions.length}</strong> / {ALL_AVAILABLE_PERMISSIONS.length}
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-[#005BAC] hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Categorized Permissions Switches */}
          <div className="space-y-5">
            {categories.map((cat) => {
              const catPerms = ALL_AVAILABLE_PERMISSIONS.filter((p) => p.category === cat);
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-xs font-bold text-[#005BAC] uppercase tracking-wider border-b border-gray-200 pb-1">
                    {cat}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {catPerms.map((perm) => {
                      const isChecked = activePermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          onClick={() => togglePermission(perm.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                              : 'bg-gray-50/50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-xs font-medium ${isChecked ? 'text-blue-900 font-bold' : 'text-gray-700'}`}>
                            {perm.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#005BAC] rounded border-gray-300 focus:ring-[#005BAC]"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-[11px] text-gray-500">
            Permission updates take effect immediately and are saved to security logs.
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#005BAC] hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isSaving ? 'Saving Changes...' : 'Save Permissions'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
