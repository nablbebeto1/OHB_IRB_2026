import React, { useState } from 'react';

interface OromiaLogoProps {
  className?: string;
  variant?: 'emblem' | 'full' | 'header' | 'wide';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  logoUrl?: string;
  alt?: string;
}

export const OromiaLogo: React.FC<OromiaLogoProps> = ({
  className = '',
  size = 'md',
  logoUrl,
  alt = 'System Logo',
}) => {
  const [imgError, setImgError] = useState(false);

  // If no logo has been uploaded, or image failed to load, display no logo
  // and do not show a placeholder image or broken image icon.
  if (!logoUrl || !logoUrl.trim() || imgError) {
    return null;
  }

  const sizeClasses = {
    sm: 'max-h-6 w-auto',
    md: 'max-h-10 w-auto',
    lg: 'max-h-16 w-auto',
    xl: 'max-h-24 w-auto',
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={logoUrl}
        alt={alt}
        className={`${sizeClasses[size] || 'max-h-12 w-auto'} object-contain max-w-full`}
        onError={() => setImgError(true)}
      />
    </div>
  );
};
