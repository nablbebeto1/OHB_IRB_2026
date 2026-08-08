import React from 'react';
import { BrandingSettings } from '../types';

export const DEFAULT_STATIC_ASSETS = {
  login_page_logo: '/assets/logo/OHB-WIDE-Logo.png',
  header_logo: '/assets/logo/OHB-WIDE-Logo.png',
  sidebar_logo: '/assets/logo/OHB-WIDE-Logo.png',
  dashboard_logo: '/assets/logo/OHB-WIDE-Logo.png',
  public_page_logo: '/assets/logo/OHB-WIDE-Logo.png',
  certificate_logo: '/assets/logo/OHB-WIDE-Logo.png',
  pdf_report_logo: '/assets/logo/OHB-WIDE-Logo.png',
  email_template_logo: '/assets/logo/OHB-WIDE-Logo.png',
  favicon: '/favicon.png',
  loading_logo: '/assets/logo/OHB-WIDE-Logo.png',
  certificate_stamp: '/assets/logo/ohb-certificate-stamp.svg',
  organization_logo: '/assets/logo/OHB-WIDE-Logo.png',
  organization_banner: '/assets/images/oromia_health_bureau_logo_1786021622212.jpg',
  signature_image: '',
};

export type BrandingAssetKey = keyof typeof DEFAULT_STATIC_ASSETS;

/**
 * Resolves a persistent asset URL from branding settings with fallbacks and cache-busting
 */
export function resolveAssetUrl(
  key: BrandingAssetKey | string,
  brandingSettings?: Partial<BrandingSettings> | null,
  fallbackUrl?: string
): string {
  let url = '';

  if (brandingSettings && (brandingSettings as any)[key]) {
    url = (brandingSettings as any)[key];
  }

  if (!url || !url.trim()) {
    if (fallbackUrl) {
      url = fallbackUrl;
    } else if (key in DEFAULT_STATIC_ASSETS) {
      url = DEFAULT_STATIC_ASSETS[key as BrandingAssetKey];
    } else {
      url = '/assets/logo/OHB-WIDE-Logo.png';
    }
  }

  // Cache busting query parameter for versioned updates
  if (url && (url.startsWith('/uploads/') || url.startsWith('/assets/'))) {
    const version = brandingSettings?.cache_version || Date.now();
    if (!url.includes('?v=')) {
      url = `${url}?v=${version}`;
    }
  }

  return url;
}

/**
 * Image error handler that replaces broken image source with default static fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = '/assets/logo/OHB-WIDE-Logo.png'
) {
  const target = event.currentTarget;
  if (target.src !== fallbackUrl && !target.src.endsWith(fallbackUrl)) {
    target.src = fallbackUrl;
  }
}
