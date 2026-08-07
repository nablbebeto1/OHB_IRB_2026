import React, { useState } from 'react';
import { User, UserRole, Language } from '../types';
import { translations } from '../utils/i18n';
import { UserAvatar } from './UserAvatar';
import { EditPermissionsModal } from './EditPermissionsModal';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  Search,
  Mail,
  Building,
  Upload,
  Camera,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
} from 'lucide-react';

interface UserManagementViewProps {
  users: User[];
  language: Language;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onUpdatePermissions?: (userId: string, permissions: string[], newRole?: UserRole) => Promise<void> | void;
  onUpdateAvatar?: (userId: string, avatarUrl: string) => Promise<void> | void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  language,
  onUpdateRole,
  onUpdatePermissions,
  onUpdateAvatar,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<User | null>(null);
  const [avatarUploadUser, setAvatarUploadUser] = useState<User | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [avatarError, setAvatarError] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.institution && u.institution.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSavePermissions = async (userId: string, newPermissions: string[], newRole?: UserRole) => {
    if (newRole) {
      onUpdateRole(userId, newRole);
    }
    if (onUpdatePermissions) {
      await onUpdatePermissions(userId, newPermissions, newRole);
    }
    setToastMsg('User permissions and scope access updated successfully.');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Avatar image file size must be less than 2MB.');
      return;
    }

    // Validate format PNG, JPG, JPEG, WEBP
    const validFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setAvatarError('Unsupported image format. Allowed: PNG, JPG, JPEG, WEBP.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdateAvatar) {
        await onUpdateAvatar(userId, dataUrl);
        setToastMsg('User profile avatar uploaded and updated successfully.');
        setAvatarUploadUser(null);
        setTimeout(() => setToastMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 text-xs font-bold rounded-r-xl shadow-xs flex justify-between items-center animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>OHB Identity & Access Control</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Role-Based Access Control (RBAC) Management</h1>
          <p className="text-blue-100 text-xs mt-1">
            Manage administrators, ethics committee chairpersons, reviewers, secretariats, researchers, and custom permission scopes.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, institution, or role..."
            className="w-full text-xs pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-[#005BAC]"
          />
        </div>
        <span className="text-xs text-gray-500 font-bold">Showing {filteredUsers.length} Registered Accounts</span>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
              <th className="p-4">User Identity</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Institution / Dept</th>
              <th className="p-4">Role Assignment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative group">
                      <UserAvatar
                        name={user.name}
                        avatarUrl={user.avatarUrl || user.avatar}
                        role={user.role}
                        size="md"
                      />
                      <button
                        onClick={() => setAvatarUploadUser(user)}
                        className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-100 p-1 rounded-full border border-gray-300 shadow-xs text-gray-600 transition-colors cursor-pointer"
                        title="Upload/Change User Avatar"
                      >
                        <Camera className="w-2.5 h-2.5 text-[#005BAC]" />
                      </button>
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 text-xs">{user.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {user.id}</div>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-gray-600 font-medium">{user.email}</td>
                <td className="p-4 text-gray-700">{user.institution || 'Oromia Health Bureau'}</td>

                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => {
                      onUpdateRole(user.id, e.target.value as UserRole);
                      setToastMsg(`Role for ${user.name} updated to ${e.target.value}.`);
                      setTimeout(() => setToastMsg(''), 4000);
                    }}
                    className="text-xs font-bold bg-blue-50/80 text-[#005BAC] border border-blue-200 p-1.5 rounded-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#005BAC]"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="IRB_ADMIN">IRB_ADMIN</option>
                    <option value="IRB_CHAIR">IRB_CHAIR</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="COMMITTEE_MEMBER">COMMITTEE_MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="RESEARCHER">RESEARCHER</option>
                  </select>
                </td>

                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                      user.status === 'INACTIVE'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : user.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {user.status || 'ACTIVE'}
                  </span>
                </td>

                <td className="p-4 text-right">
                  <button
                    onClick={() => setEditingPermissionsUser(user)}
                    className="bg-blue-50 hover:bg-blue-100 text-[#005BAC] font-bold px-3 py-1.5 rounded-lg border border-blue-200 text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Key className="w-3.5 h-3.5 text-[#005BAC]" />
                    <span>Edit Permissions</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Permissions Modal */}
      {editingPermissionsUser && (
        <EditPermissionsModal
          user={editingPermissionsUser}
          onClose={() => setEditingPermissionsUser(null)}
          onSavePermissions={handleSavePermissions}
        />
      )}

      {/* Avatar Upload Modal */}
      {avatarUploadUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#005BAC]" />
                <h3 className="font-extrabold text-sm text-gray-900">Upload Avatar for {avatarUploadUser.name}</h3>
              </div>
              <button onClick={() => setAvatarUploadUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <UserAvatar
                name={avatarUploadUser.name}
                avatarUrl={avatarUploadUser.avatarUrl || avatarUploadUser.avatar}
                role={avatarUploadUser.role}
                size="xl"
                className="mx-auto"
              />
              <p className="text-xs text-gray-500">
                Select a profile image for {avatarUploadUser.name}. Supported formats: PNG, JPG, JPEG, WEBP (Max size: 2MB).
              </p>
            </div>

            {avatarError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{avatarError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 text-[#005BAC] border border-blue-200 rounded-xl text-center font-bold text-xs cursor-pointer transition-colors">
                <Upload className="w-4 h-4 inline-block mr-2" />
                Choose Image File
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => handleAvatarFileChange(e, avatarUploadUser.id)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAvatarUploadUser(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
