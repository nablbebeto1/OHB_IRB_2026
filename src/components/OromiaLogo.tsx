import React, { useState } from 'react';
import { resolveAssetUrl, handleImageError } from '../utils/assetResolver';

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
  alt = 'Oromia Health Bureau Logo',
}) => {
  const [imgError, setImgError] = useState(false);

  const displayUrl = logoUrl && logoUrl.trim() && !imgError
    ? logoUrl
    : '/assets/logo/OHB-WIDE-Logo.png';

  const sizeClasses = {
    sm: 'max-h-6 w-auto',
    md: 'max-h-10 w-auto',
    lg: 'max-h-16 w-auto',
    xl: 'max-h-24 w-auto',
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={displayUrl}
        alt={alt}
        className={`${sizeClasses[size] || 'max-h-12 w-auto'} object-contain max-w-full`}
        onError={(e) => {
          if (!imgError) {
            setImgError(true);
            handleImageError(e, '/assets/logo/OHB-WIDE-Logo.png');
          }
        }}
      />
    </div>
  );
};

