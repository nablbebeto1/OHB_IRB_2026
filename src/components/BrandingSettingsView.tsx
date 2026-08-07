import React, { useState, useEffect, useRef } from 'react';
import { User, BrandingSettings, SystemSettings } from '../types';
import {
  Palette,
  Upload,
  Shield,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Stamp,
  FileCheck,
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  X,
  Award,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface BrandingSettingsViewProps {
  currentUser: User;
  systemSettings?: SystemSettings;
  onSaveBranding?: (updatedBranding: BrandingSettings, updatedIdentity: Partial<SystemSettings>) => void;
}

export const BrandingSettingsView: React.FC<BrandingSettingsViewProps> = ({
  currentUser,
  systemSettings,
  onSaveBranding,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // System Identity Form
  const [identity, setIdentity] = useState({
    systemName: systemSettings?.systemName || 'Oromia Health Bureau Ethical Review Portal',
    organizationName: systemSettings?.organizationName || 'Oromia Health Bureau',
    organizationShortName: systemSettings?.organizationShortName || 'OHB-IRB',
    websiteUrl: systemSettings?.websiteUrl || 'https://irb.ohb.gov.et',
    contactEmail: systemSettings?.contactEmail || 'irb@ohb.gov.et',
    contactPhone: systemSettings?.contactPhone || '+251 11 551 7000',
    address: systemSettings?.address || 'Finfinnee / Addis Ababa, Oromia Regional Government Center',
  });

  // Branding Settings Form
  const [branding, setBranding] = useState<BrandingSettings>({
    login_page_logo: '',
    header_logo: '',
    sidebar_logo: '',
    dashboard_logo: '',
    public_page_logo: '',
    certificate_logo: '',
    pdf_report_logo: '',
    email_template_logo: '',
    favicon: '',
    loading_logo: '',
    certificate_stamp: '',
    stamp_enabled: true,
    stamp_size: 130,
    stamp_opacity: 0.85,
    stamp_position: 'bottom-right',
    signature_image: '',
    signatory_name: 'Prof. Gemechu Hunduma',
    signatory_title: 'Chairperson, OHB Institutional Review Board',
    cache_version: Date.now(),

    // Organization Info Settings
    organization_name: '',
    organization_short_name: '',
    about_organization: '',
    mission: '',
    vision: '',
    website_url: '',
    contact_email: '',
    contact_phone: '',
    office_address: '',
    organization_logo: '',
    organization_banner: '',
    developed_by_text: '',
  });

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Modal Live Preview State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Hidden File Input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadFieldRef = useRef<keyof BrandingSettings | null>(null);

  // Fetch current branding from server
  useEffect(() => {
    let isMounted = true;
    const loadBrandingData = async () => {
      try {
        const res = await fetch('/api/branding');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            if (json.data.brandingSettings) {
              setBranding((prev) => ({
                ...prev,
                ...json.data.brandingSettings,
              }));
            }
            if (json.data.systemIdentity) {
              setIdentity((prev) => ({
                ...prev,
                ...json.data.systemIdentity,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load branding settings from backend:', err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    loadBrandingData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          The Branding & Logo Management Module is restricted strictly to <span className="font-bold text-red-700">SUPER_ADMIN</span> accounts. Please contact your system administrator.
        </p>
      </div>
    );
  }

  // Trigger file selection for specific asset field
  const triggerUpload = (fieldName: keyof BrandingSettings) => {
    activeUploadFieldRef.current = fieldName;
    fileInputRef.current?.click();
  };

  // Process selected image file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldName = activeUploadFieldRef.current;
    if (!file || !fieldName) return;
    e.target.value = ''; // Reset input

    // Validation
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];

    if (!allowedExts.includes(ext)) {
      setSaveErrorMsg(`Invalid file type "${ext}". Allowed formats: PNG, JPG, JPEG, SVG, WEBP, ICO.`);
      return;
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_BYTES) {
      setSaveErrorMsg(`File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller image.`);
      return;
    }

    setUploadingField(fieldName as string);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    // Read as Data URL
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      try {
        const res = await fetch('/api/branding/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fieldName,
            fileName: file.name,
            fileData: dataUrl,
            fileType: file.type,
            fileSize: file.size,
            uploadedBy: currentUser.name,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setBranding((prev) => ({
            ...prev,
            [fieldName]: dataUrl,
            cache_version: data.cacheVersion || Date.now(),
          }));
          setSaveSuccessMsg(`Updated ${fieldName.replace(/_/g, ' ')} successfully.`);

          // Dynamically update favicon if favicon uploaded
          if (fieldName === 'favicon') {
            const link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (link) {
              link.href = dataUrl;
            }
          }
        } else {
          setSaveErrorMsg(data.message || 'File upload failed');
        }
      } catch (err: any) {
        setSaveErrorMsg(`Upload error: ${err?.message || 'Server connection failed'}`);
      } finally {
        setUploadingField(null);
        activeUploadFieldRef.current = null;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAsset = (fieldName: keyof BrandingSettings) => {
    setBranding((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
    setSaveSuccessMsg(`Removed asset for ${fieldName.replace(/_/g, ' ')}.`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all branding settings to system default logos and configuration?')) {
      setBranding({
        login_page_logo: '',
        header_logo: '',
        sidebar_logo: '',
        dashboard_logo: '',
        public_page_logo: '',
        certificate_logo: '',
        pdf_report_logo: '',
        email_template_logo: '',
        favicon: '',
        loading_logo: '',
        certificate_stamp: '',
        stamp_enabled: true,
        stamp_size: 130,
        stamp_opacity: 0.85,
        stamp_position: 'bottom-right',
        signature_image: '',
        signatory_name: 'Prof. Gemechu Hunduma',
        signatory_title: 'Chairperson, OHB Institutional Review Board',
        cache_version: Date.now(),
      });
      setSaveSuccessMsg('Branding reset to default configuration.');
    }
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const payload = {
        brandingSettings: branding,
        systemIdentity: identity,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
      };

      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMsg('System branding & organizational identity saved to database (system_branding_settings).');
        if (onSaveBranding) {
          onSaveBranding(branding, identity);
        }
      } else {
        setSaveErrorMsg(data.message || 'Failed to save branding settings.');
      }
    } catch (err: any) {
      setSaveErrorMsg(`Save error: ${err?.message || 'Server connection failed'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper Card for Uploadable Logo
  const LogoUploadCard = ({
    title,
    fieldKey,
    description,
    badge,
  }: {
    title: string;
    fieldKey: keyof BrandingSettings;
    description: string;
    badge?: string;
  }) => {
    const currentAsset = branding[fieldKey] as string;
    const isUploading = uploadingField === fieldKey;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-all shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-bold text-slate-900">{title}</h4>
            {badge && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#005BAC] border border-blue-200">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mb-3">{description}</p>

          {/* Preview Box */}
          <div className="h-28 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-3 relative overflow-hidden group">
            {currentAsset ? (
              <img
                src={`${currentAsset}${currentAsset.includes('data:') ? '' : `?v=${branding.cache_version || Date.now()}`}`}
                alt={title}
                className="max-h-full max-w-full object-contain drop-shadow-xs"
              />
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="w-7 h-7 mx-auto mb-1 opacity-60" />
                <span className="text-[10px] font-semibold block">Default System Logo</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center text-white text-xs font-bold gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => triggerUpload(fieldKey)}
            className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>{currentAsset ? 'Replace' : 'Upload Logo'}</span>
          </button>

          {currentAsset && (
            <button
              type="button"
              onClick={() => handleRemoveAsset(fieldKey)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Remove Custom Logo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Hidden File Input for Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg,.svg,.webp,.ico"
        className="hidden"
      />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span>Administration</span>
              <span>/</span>
              <span className="text-[#005BAC] font-bold">Branding & Logo Settings</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Palette className="w-7 h-7 text-[#005BAC]" />
              <span>Branding & Organizational Asset Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure system logos, certificate stamps, official signatures, and organizational identity attributes stored in `system_branding_settings`.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4 text-amber-700" />
              <span>Live Certificate Preview</span>
            </button>
            <span className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              SUPER_ADMIN CLEARANCE
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveErrorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
          <button onClick={() => setSaveErrorMsg('')} className="text-red-600 hover:text-red-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSaveAllSettings} className="space-y-8">
        {/* 1. System Identity Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-[#005BAC]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                1. Organizational Identity & Labels
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Dynamic Text Variables</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">System Title Name</label>
              <input
                type="text"
                value={identity.systemName}
                onChange={(e) => setIdentity({ ...identity, systemName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={identity.organizationName}
                onChange={(e) => setIdentity({ ...identity, organizationName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Short Name</label>
              <input
                type="text"
                value={identity.organizationShortName}
                onChange={(e) => setIdentity({ ...identity, organizationShortName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={identity.websiteUrl}
                onChange={(e) => setIdentity({ ...identity, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={identity.contactEmail}
                onChange={(e) => setIdentity({ ...identity, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={identity.contactPhone}
                onChange={(e) => setIdentity({ ...identity, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Address</label>
              <input
                type="text"
                value={identity.address}
                onChange={(e) => setIdentity({ ...identity, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>
          </div>
        </div>

        {/* 1.5 Organization Information & Branding Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                1.5. Organization Information & Profile
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Public About Page & Footer Config</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                value={branding.organization_name || ''}
                onChange={(e) => setBranding({ ...branding, organization_name: e.target.value })}
                placeholder="e.g. Health Bureau / Research Institute"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Organization Short Name / Acronym</label>
              <input
                type="text"
                value={branding.organization_short_name || ''}
                onChange={(e) => setBranding({ ...branding, organization_short_name: e.target.value })}
                placeholder="e.g. OHB / DMC"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">About Organization Content</label>
              <textarea
                rows={3}
                value={branding.about_organization || ''}
                onChange={(e) => setBranding({ ...branding, about_organization: e.target.value })}
                placeholder="Overview description displayed on About page and homepage portal"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission</label>
              <textarea
                rows={3}
                value={branding.mission || ''}
                onChange={(e) => setBranding({ ...branding, mission: e.target.value })}
                placeholder="Organization mission statement"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vision</label>
              <textarea
                rows={3}
                value={branding.vision || ''}
                onChange={(e) => setBranding({ ...branding, vision: e.target.value })}
                placeholder="Organization vision statement"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={branding.website_url || ''}
                onChange={(e) => setBranding({ ...branding, website_url: e.target.value })}
                placeholder="https://example.gov.et"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={branding.contact_email || ''}
                onChange={(e) => setBranding({ ...branding, contact_email: e.target.value })}
                placeholder="info@example.gov.et"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={branding.contact_phone || ''}
                onChange={(e) => setBranding({ ...branding, contact_phone: e.target.value })}
                placeholder="+251 11 000 0000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
              <input
                type="text"
                value={branding.office_address || ''}
                onChange={(e) => setBranding({ ...branding, office_address: e.target.value })}
                placeholder="City, Regional Government Center, Country"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Footer "Developed and Maintained by" Text
              </label>
              <input
                type="text"
                value={branding.developed_by_text || ''}
                onChange={(e) => setBranding({ ...branding, developed_by_text: e.target.value })}
                placeholder="e.g. Health Bureau Information Center"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC] outline-hidden font-sans font-bold text-[#005BAC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <LogoUploadCard
              title="Organization Logo"
              fieldKey="organization_logo"
              description="Official emblem / logo of organization"
              badge="organization_logo"
            />
            <LogoUploadCard
              title="Organization Banner Image"
              fieldKey="organization_banner"
              description="Header banner image for About page"
              badge="organization_banner"
            />
          </div>
        </div>

        {/* 2. Application Logos Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-[#005BAC]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                2. Application Interface Logos
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Max size: 5MB (PNG/SVG/JPG/WEBP)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LogoUploadCard
              title="Login Page Logo"
              fieldKey="login_page_logo"
              description="Displayed on user authentication & sign-in page"
              badge="login_page_logo"
            />
            <LogoUploadCard
              title="Header Logo"
              fieldKey="header_logo"
              description="Displayed in top bar navigation area"
              badge="header_logo"
            />
            <LogoUploadCard
              title="Sidebar Logo"
              fieldKey="sidebar_logo"
              description="Displayed at the top of left menu drawer"
              badge="sidebar_logo"
            />
            <LogoUploadCard
              title="Dashboard Logo"
              fieldKey="dashboard_logo"
              description="Displayed on main welcome overview page"
              badge="dashboard_logo"
            />
          </div>
        </div>

        {/* 3. Document & Certificate Branding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#005BAC]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                3. Document & Ethics Certificate Branding
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Certificates & PDF Reports</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <LogoUploadCard
              title="Certificate Header Logo"
              fieldKey="certificate_logo"
              description="Top logo printed on official ethical clearance certificates"
              badge="certificate_logo"
            />

            <LogoUploadCard
              title="PDF Report Logo"
              fieldKey="pdf_report_logo"
              description="Header logo used when generating PDF audit & committee reports"
              badge="pdf_report_logo"
            />

            {/* Official Circular Stamp Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Stamp className="w-4 h-4 text-amber-600" />
                  <span>Official Circular Stamp</span>
                </h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branding.stamp_enabled !== false}
                    onChange={(e) => setBranding({ ...branding, stamp_enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#005BAC]"></div>
                </label>
              </div>

              <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                {branding.certificate_stamp ? (
                  <img
                    src={branding.certificate_stamp}
                    alt="Official Circular Stamp"
                    style={{
                      maxHeight: `${branding.stamp_size || 110}px`,
                      opacity: branding.stamp_opacity ?? 0.85,
                    }}
                    className="object-contain drop-shadow-xs transition-all"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <Stamp className="w-8 h-8 mx-auto mb-1 text-blue-500 opacity-60" />
                    <span className="text-[10px] font-bold block">Default Vector IRB Stamp</span>
                  </div>
                )}
              </div>

              {/* Stamp Controls */}
              <div className="space-y-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Stamp Size:</span>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={branding.stamp_size || 130}
                    onChange={(e) => setBranding({ ...branding, stamp_size: parseInt(e.target.value) })}
                    className="w-24 accent-[#005BAC]"
                  />
                  <span className="font-mono text-slate-800">{branding.stamp_size || 130}px</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Stamp Opacity:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={branding.stamp_opacity ?? 0.85}
                    onChange={(e) => setBranding({ ...branding, stamp_opacity: parseFloat(e.target.value) })}
                    className="w-24 accent-[#005BAC]"
                  />
                  <span className="font-mono text-slate-800">{Math.round((branding.stamp_opacity ?? 0.85) * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => triggerUpload('certificate_stamp')}
                  className="flex-1 py-1.5 px-2 bg-[#005BAC] text-white text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Stamp</span>
                </button>
                {branding.certificate_stamp && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset('certificate_stamp')}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Official Signature Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 md:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#005BAC]" />
                  <span>IRB Chairperson Official Signature</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-500">Transparent PNG Preferred</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-28 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-3 relative overflow-hidden">
                  {branding.signature_image ? (
                    <img
                      src={branding.signature_image}
                      alt="Chairperson Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <span className="font-serif italic text-lg font-bold text-blue-900 block">Prof. Gemechu Hunduma</span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1">(Simulated Digital Signature)</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Signatory Full Name</label>
                    <input
                      type="text"
                      value={branding.signatory_name || ''}
                      onChange={(e) => setBranding({ ...branding, signatory_name: e.target.value })}
                      placeholder="Prof. Gemechu Hunduma"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Signatory Title / Designation</label>
                    <input
                      type="text"
                      value={branding.signatory_title || ''}
                      onChange={(e) => setBranding({ ...branding, signatory_title: e.target.value })}
                      placeholder="Chairperson, OHB Institutional Review Board"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#005BAC]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => triggerUpload('signature_image')}
                      className="py-1.5 px-3 bg-slate-800 text-white text-[11px] font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Signature Image</span>
                    </button>
                    {branding.signature_image && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset('signature_image')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Communication & Web Branding */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#005BAC]" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                4. Communication & Web Browsing Branding
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Email & Browser Assets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <LogoUploadCard
              title="Email Template Logo"
              fieldKey="email_template_logo"
              description="Header banner printed on outbound notification emails"
              badge="email_template_logo"
            />
            <LogoUploadCard
              title="Browser Favicon"
              fieldKey="favicon"
              description="Tab icon displayed in browser address bar (.ico or .png)"
              badge="favicon"
            />
            <LogoUploadCard
              title="Loading Screen Logo"
              fieldKey="loading_logo"
              description="Displayed during initial application boots & page transitions"
              badge="loading_logo"
            />
            <LogoUploadCard
              title="Public Verification Logo"
              fieldKey="public_page_logo"
              description="Displayed on public certificate verification & guest portal"
              badge="public_page_logo"
            />
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Cache Refresh Enabled</span>
            </p>
            <p className="text-[11px] text-slate-300">
              Saving updates `system_branding_settings` table and forces asset reload with version parameter `logo.png?v={Date.now()}`.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Reset Default
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#005BAC] hover:bg-blue-600 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save System Branding</span>
            </button>
          </div>
        </div>
      </form>

      {/* Live Certificate Interactive Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#005BAC]" />
                <h3 className="font-extrabold text-base text-slate-900">Live Ethical Approval Certificate Branding Preview</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Render Container */}
            <div className="border-8 border-slate-900 p-8 rounded-xl bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 relative text-center space-y-6 shadow-inner font-serif">
              {/* Certificate Header Logo */}
              <div className="flex justify-center items-center h-16">
                {branding.certificate_logo ? (
                  <img
                    src={branding.certificate_logo}
                    alt="Certificate Logo"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <div className="text-[#005BAC] font-black text-sm uppercase tracking-widest font-sans">
                    OROMIA HEALTH BUREAU • INSTITUTIONAL REVIEW BOARD
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase">
                  {identity.organizationName || 'OROMIA HEALTH BUREAU'}
                </h2>
                <p className="text-xs font-bold text-[#005BAC] tracking-widest uppercase mt-0.5">
                  Institutional Review Board (OHB-IRB)
                </p>
                <div className="w-32 h-0.5 bg-amber-500 mx-auto my-3"></div>
                <h1 className="text-lg font-bold text-amber-800 uppercase tracking-widest">
                  Certificate of Ethical Approval
                </h1>
              </div>

              <div className="text-xs text-slate-800 space-y-2 max-w-xl mx-auto font-sans leading-relaxed">
                <p>
                  This is to certify that the research protocol titled:
                </p>
                <p className="font-bold text-slate-900 text-sm font-serif italic border-y border-amber-200 py-2">
                  "Epidemiological Investigation & Health Impact Assessment Protocol"
                </p>
                <p>
                  submitted by <strong className="text-slate-900">Dr. Researcher (Jimma University)</strong> has been granted formal ethical approval under Reference Number <span className="font-mono font-bold text-[#005BAC]">OHB-IRB/2026/8941</span>.
                </p>
              </div>

              {/* Signature & Stamp Footer Area */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 items-center gap-4 text-xs font-sans relative">
                {/* QR Verification */}
                <div className="text-left space-y-1">
                  <div className="w-16 h-16 bg-white border border-slate-300 p-1 rounded-md shadow-xs flex items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=OHB-IRB-VERIFY-SAMPLE"
                      alt="QR Verification"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">QR Verification Code</span>
                </div>

                {/* Signature Box */}
                <div className="text-right space-y-1 relative">
                  <div className="h-12 flex justify-end items-center">
                    {branding.signature_image ? (
                      <img
                        src={branding.signature_image}
                        alt="Signatory Signature"
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <span className="font-serif italic font-bold text-blue-900 text-base">
                        {branding.signatory_name || 'Prof. Gemechu Hunduma'}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-slate-800 text-[11px]">
                    {branding.signatory_name || 'Prof. Gemechu Hunduma'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {branding.signatory_title || 'Chairperson, OHB Institutional Review Board'}
                  </div>
                </div>

                {/* Overlay Official Stamp */}
                {branding.stamp_enabled !== false && (
                  <div
                    className={`absolute bottom-0 ${
                      branding.stamp_position === 'bottom-center'
                        ? 'left-1/2 -translate-x-1/2'
                        : branding.stamp_position === 'bottom-left'
                        ? 'left-20'
                        : 'right-12'
                    } pointer-events-none`}
                  >
                    {branding.certificate_stamp ? (
                      <img
                        src={branding.certificate_stamp}
                        alt="Official Stamp"
                        style={{
                          width: `${branding.stamp_size || 130}px`,
                          opacity: branding.stamp_opacity ?? 0.85,
                        }}
                        className="object-contain"
                      />
                    ) : (
                      <div
                        style={{
                          width: `${branding.stamp_size || 130}px`,
                          height: `${branding.stamp_size || 130}px`,
                          opacity: branding.stamp_opacity ?? 0.85,
                        }}
                        className="rounded-full border-4 border-dashed border-[#005BAC] flex items-center justify-center p-2 text-center text-[9px] font-bold text-[#005BAC] bg-blue-50/20"
                      >
                        OFFICIAL OHB-IRB APPROVAL STAMP
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
