import React, { useState, useEffect } from 'react';
import { Submission, Language, CalendarType } from '../types';
import { translations } from '../utils/i18n';
import { formatDateWithCalendar } from '../utils/calendar';
import {
  googleDriveSignIn,
  googleDriveSignOut,
  initDriveAuth,
  fetchDriveFiles,
  fetchDriveUserInfo,
  createDriveFolder,
  deleteDriveFile,
  exportCertificateToDrive,
  uploadFileToDrive,
  DriveFile,
  DriveUserInfo,
} from '../lib/googleDriveService';
import {
  HardDrive,
  FolderPlus,
  RefreshCw,
  Search,
  FileText,
  Folder,
  ExternalLink,
  Trash2,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldCheck,
  UserCheck,
  LogOut,
  Info,
  Loader2,
} from 'lucide-react';

interface GoogleDriveViewProps {
  submissions: Submission[];
  language: Language;
  calendar: CalendarType;
  onVerifyPublic: (refNo: string) => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  submissions,
  language,
  calendar,
  onVerifyPublic,
}) => {
  const t = translations[language];

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveUser, setDriveUser] = useState<DriveUserInfo | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [exportingSubId, setExportingSubId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Filter approved submissions eligible for certificate sync
  const approvedSubmissions = submissions.filter((s) => s.status === 'APPROVED');

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setAccessToken(token);
        loadUserInfoAndFiles(token);
        setIsAuthLoading(false);
      },
      () => {
        setAccessToken(null);
        setDriveUser(null);
        setFiles([]);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadUserInfoAndFiles = async (token: string, search?: string) => {
    setIsLoadingFiles(true);
    try {
      const [userInfo, driveFiles] = await Promise.all([
        fetchDriveUserInfo(token).catch(() => null),
        fetchDriveFiles(token, search),
      ]);
      if (userInfo) setDriveUser(userInfo);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error loading Drive data:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to connect to Google Drive API.',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const result = await googleDriveSignIn();
      if (result) {
        setAccessToken(result.accessToken);
        await loadUserInfoAndFiles(result.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Successfully authenticated with Google Drive (${result.user.email}).`,
        });
      }
    } catch (err: any) {
      console.error('Sign-in failure:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Google Drive authentication failed or popup closed.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleDriveSignOut();
      setAccessToken(null);
      setDriveUser(null);
      setFiles([]);
      setStatusMessage({ type: 'info', text: 'Signed out from Google Drive session.' });
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleCreateIRBFolder = async () => {
    if (!accessToken) return;
    setStatusMessage(null);
    try {
      const newFolder = await createDriveFolder(accessToken, 'Oromia Health Bureau IRB Documents');
      setStatusMessage({
        type: 'success',
        text: `Created folder "${newFolder.name}" in your Google Drive!`,
      });
      loadUserInfoAndFiles(accessToken, searchQuery);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to create folder in Google Drive.',
      });
    }
  };

  const handleExportCertificate = async (sub: Submission) => {
    if (!accessToken) return;
    setExportingSubId(sub.id);
    setStatusMessage(null);
    try {
      const uploadedFile = await exportCertificateToDrive(accessToken, sub);
      setStatusMessage({
        type: 'success',
        text: `Successfully exported Certificate for ${sub.refNo} to Google Drive!`,
      });
      loadUserInfoAndFiles(accessToken, searchQuery);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || `Failed to export certificate to Google Drive.`,
      });
    } finally {
      setExportingSubId(null);
    }
  };

  const confirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Permanently deleted file "${fileToDelete.name}" from Google Drive.`,
      });
      setFileToDelete(null);
      loadUserInfoAndFiles(accessToken, searchQuery);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete file from Google Drive.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '—';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '—';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMimeIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />;
    if (mimeType.includes('document') || mimeType.includes('html')) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  if (isAuthLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#005BAC] animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking Google Drive Session State...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-[#005BAC] rounded-xl text-white shadow-md">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">Google Drive Integration</h1>
              <span className="bg-blue-100 text-[#005BAC] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Official Cloud Storage
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Connect your Google Workspace Drive to store research protocols, sync approved IRB Ethical Clearance Certificates, and organize compliance reports securely.
            </p>
          </div>
        </div>

        {/* Authentication Button Header */}
        <div>
          {accessToken ? (
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              {driveUser?.photoLink ? (
                <img src={driveUser.photoLink} alt="Avatar" className="w-9 h-9 rounded-full border border-blue-300" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {driveUser?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">{driveUser?.displayName || 'Authenticated User'}</p>
                <p className="text-[10px] text-slate-500">{driveUser?.emailAddress || 'Connected to Drive'}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                title="Disconnect Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="gsi-material-button hover:shadow-md transition-all cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isSigningIn ? 'Connecting to Drive...' : 'Sign in with Google Drive'}
                </span>
                <span style={{ display: 'none' }}>Sign in with Google Drive</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {statusMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Grid: If NOT logged in, show feature highlights; if logged in, show Drive Explorer */}
      {!accessToken ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 bg-blue-50 text-[#005BAC] rounded-xl flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Direct Certificate Sync</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically backup approved IRB ethical clearance certificates directly into a dedicated "Oromia Health Bureau IRB" folder on your Google Drive.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Protocol Cloud Workspace</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Store research protocols, clinical trial guidelines, and participant consent forms with standard Google Drive encryption and access controls.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-3 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Permission-Based Access</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full transparency and user consent. Actions such as deleting files require explicit UI confirmation before executing on your Drive.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Quick Sync Approved IRB Certificates */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  Approved Ethical Clearance Certificates Ready for Drive Export ({approvedSubmissions.length})
                </h2>
              </div>
              <button
                onClick={handleCreateIRBFolder}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-amber-600" />
                <span>Create IRB Root Folder</span>
              </button>
            </div>

            {approvedSubmissions.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No approved IRB submissions currently require certificate sync.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {approvedSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#005BAC]">{sub.refNo}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Approved</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate">{sub.title}</p>
                      <p className="text-[10px] text-slate-500">{sub.principalInvestigator.name} • {sub.principalInvestigator.institution}</p>
                    </div>

                    <button
                      onClick={() => handleExportCertificate(sub)}
                      disabled={exportingSubId === sub.id}
                      className="bg-[#005BAC] hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center space-x-1.5 shrink-0 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {exportingSubId === sub.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5" />
                      )}
                      <span>Export to Drive</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Google Drive Explorer */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-[#005BAC]" />
                <h2 className="text-sm font-bold text-slate-900">Your Google Drive Files</h2>
              </div>

              {/* Search & Refresh */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Drive files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') loadUserInfoAndFiles(accessToken, searchQuery);
                    }}
                    className="pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-48 sm:w-64"
                  />
                </div>

                <button
                  onClick={() => loadUserInfoAndFiles(accessToken, searchQuery)}
                  disabled={isLoadingFiles}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                  title="Refresh Files List"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Files List Table */}
            {isLoadingFiles ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 text-[#005BAC] animate-spin" />
                <p className="text-xs text-slate-500 font-semibold">Fetching files from Google Drive API...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center space-y-3 border-2 border-dashed border-gray-200 rounded-xl">
                <Folder className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No Google Drive files found matching your criteria.</p>
                <p className="text-[11px] text-slate-400">Export an ethical clearance certificate above or upload a document to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                    <tr>
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Last Modified</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-slate-800">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2.5">
                            {getMimeIcon(file.mimeType)}
                            <span className="font-bold text-slate-900 truncate max-w-xs">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {file.mimeType.includes('folder')
                            ? 'Google Drive Folder'
                            : file.mimeType.includes('pdf')
                            ? 'PDF Document'
                            : file.mimeType.includes('html')
                            ? 'HTML Certificate'
                            : file.mimeType.split('/').pop()}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Modal for Destructive Delete Action */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Confirm Google Drive Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the file <span className="font-bold text-slate-900">"{fileToDelete.name}"</span> from your Google Drive? This action cannot be undone.
            </p>

            <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-[11px] text-red-800 space-y-1">
              <span className="font-bold">Target File Details:</span>
              <p className="truncate font-mono">ID: {fileToDelete.id}</p>
              <p>Type: {fileToDelete.mimeType}</p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Permanently Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
