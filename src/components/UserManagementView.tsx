import React, { useState } from 'react';
import { User, UserRole, Language } from '../types';
import { translations } from '../utils/i18n';
import { Users, UserPlus, Shield, CheckCircle, Search, Mail, Building, Trash2 } from 'lucide-react';

interface UserManagementViewProps {
  users: User[];
  language: Language;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  language,
  onUpdateRole,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#005BAC] text-white p-6 rounded-2xl shadow-md flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>OHB Identity & Access Control</span>
          </div>
          <h1 className="text-2xl font-extrabold mt-1">Role-Based Access Control (RBAC) Management</h1>
          <p className="text-blue-100 text-xs mt-1">
            Manage system administrators, ethics committee chairpersons, scientific reviewers, secretariats, and researchers.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, email, or role..."
            className="w-full text-xs pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#005BAC]"
          />
        </div>
        <span className="text-xs text-gray-500 font-bold">Showing {filteredUsers.length} Registered Accounts</span>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] border-b">
              <th className="p-4">User Name</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Institution</th>
              <th className="p-4">Role Assignment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{user.name}</td>
                <td className="p-4 text-gray-600">{user.email}</td>
                <td className="p-4 text-gray-700">{user.institution}</td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                    className="text-xs font-bold bg-blue-50 text-[#005BAC] border border-blue-200 p-1.5 rounded-lg cursor-pointer"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="IRB_ADMIN">IRB_ADMIN</option>
                    <option value="IRB_CHAIR">IRB_CHAIR</option>
                    <option value="SECRETARY">SECRETARY</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="INVESTIGATOR">INVESTIGATOR</option>
                    <option value="PUBLIC_VIEWER">PUBLIC_VIEWER</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </td>
                <td className="p-4 text-right font-bold text-[#005BAC]">
                  <button className="hover:underline cursor-pointer">Edit Permissions</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
