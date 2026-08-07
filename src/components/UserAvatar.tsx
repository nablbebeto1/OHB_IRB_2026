import React, { useState } from 'react';
import { UserRole } from '../types';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  avatar?: string;
  role?: UserRole;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-extrabold',
  xl: 'w-20 h-20 text-xl font-extrabold',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-600 text-white',
  IRB_ADMIN: 'bg-indigo-600 text-white',
  IRB_CHAIR: 'bg-[#005BAC] text-white',
  SECRETARY: 'bg-emerald-600 text-white',
  REVIEWER: 'bg-amber-600 text-white',
  COMMITTEE_MEMBER: 'bg-teal-600 text-white',
  RESEARCHER: 'bg-blue-600 text-white',
  ADMIN: 'bg-slate-700 text-white',
  GUEST: 'bg-gray-500 text-white',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  avatarUrl,
  avatar,
  role = 'RESEARCHER',
  size = 'md',
  className = '',
  onClick,
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const src = avatarUrl || avatar;

  // Compute Initials (e.g. "Gemechu Hunduma" -> "GH")
  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const roleBg = ROLE_COLORS[role] || 'bg-[#005BAC] text-white';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageFailed(true)}
        onClick={onClick}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-xs shrink-0 ${
          onClick ? 'cursor-pointer hover:opacity-90' : ''
        } ${className}`}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${sizeClass} ${roleBg} rounded-full font-bold flex items-center justify-center border-2 border-white shadow-xs shrink-0 select-none ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
      title={`${name} (${role})`}
    >
      {initials}
    </div>
  );
};
