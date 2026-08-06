import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App lazily or reuse existing
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleDriveSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive access token from authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleDriveSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface DriveUserInfo {
  displayName?: string;
  emailAddress?: string;
  photoLink?: string;
  storageQuota?: {
    limit?: string;
    usage?: string;
    usageInDrive?: string;
  };
}

/**
 * Fetch files from Google Drive
 */
export const fetchDriveFiles = async (
  accessToken: string,
  query?: string,
  folderId?: string
): Promise<DriveFile[]> => {
  let q = "trashed = false";
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }
  if (query && query.trim()) {
    q += ` and name contains '${query.trim().replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)&pageSize=40&orderBy=folder,modifiedTime desc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Google Drive API error (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Get User Drive Info & Storage Quota
 */
export const fetchDriveUserInfo = async (accessToken: string): Promise<DriveUserInfo> => {
  const url = 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Drive account info (${response.status})`);
  }

  const data = await response.json();
  return {
    displayName: data.user?.displayName,
    emailAddress: data.user?.emailAddress,
    photoLink: data.user?.photoLink,
    storageQuota: data.storageQuota,
  };
};

/**
 * Create a Folder in Google Drive
 */
export const createDriveFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<DriveFile> => {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error(`Failed to create folder in Google Drive (${response.status})`);
  }

  return await response.json();
};

/**
 * Get or Create the default "Oromia Health Bureau IRB" root folder in Google Drive
 */
export const getOrCreateIRBFolder = async (accessToken: string): Promise<string> => {
  const folderName = 'Oromia Health Bureau IRB Documents';
  const existingFiles = await fetchDriveFiles(accessToken, folderName);
  const existingFolder = existingFiles.find(
    (f) => f.mimeType === 'application/vnd.google-apps.folder' && f.name === folderName
  );

  if (existingFolder) {
    return existingFolder.id;
  }

  const newFolder = await createDriveFolder(accessToken, folderName);
  return newFolder.id;
};

/**
 * Upload a text, HTML, or JSON file to Google Drive
 */
export const uploadFileToDrive = async (
  accessToken: string,
  fileName: string,
  mimeType: string,
  content: string,
  parentFolderId?: string
): Promise<DriveFile> => {
  const metadata: any = {
    name: fileName,
    mimeType,
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to upload file to Google Drive (${response.status})`);
  }

  return await response.json();
};

/**
 * Delete a file from Google Drive
 */
export const deleteDriveFile = async (
  accessToken: string,
  fileId: string
): Promise<void> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete file from Google Drive (${response.status})`);
  }
};

/**
 * Export Ethical Clearance Certificate directly to Google Drive
 */
export const exportCertificateToDrive = async (
  accessToken: string,
  submission: {
    refNo: string;
    title: string;
    principalInvestigator: { name: string; institution: string };
    updatedAt?: string;
    zone?: string;
    woreda?: string;
  }
): Promise<DriveFile> => {
  const irbFolderId = await getOrCreateIRBFolder(accessToken);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ethical Clearance Certificate - ${submission.refNo}</title>
  <style>
    body { font-family: 'Georgia', serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
    .cert-card { background: white; border: 8px double #005BAC; padding: 40px; max-w: 800px; margin: 0 auto; border-radius: 12px; shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { text-align: center; }
    .header h2 { color: #005BAC; margin-bottom: 4px; font-size: 24px; text-transform: uppercase; }
    .header h3 { color: #475569; font-size: 14px; text-transform: uppercase; margin-top: 0; }
    .ref-no { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; font-family: monospace; font-weight: bold; color: #005BAC; display: flex; justify-space-between; }
    .title-box { background: #f0f7ff; border-left: 4px solid #005BAC; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; pt: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="header">
      <h3>Oromia National Regional State</h3>
      <h2>Oromia Health Bureau - IRB</h2>
      <h4>Institutional Review Board Ethical Clearance Certificate</h4>
    </div>
    <div class="ref-no">
      <span>Ref No: ${submission.refNo}</span>
      <span>Date: ${new Date().toLocaleDateString('en-GB')}</span>
    </div>
    <p>This is to certify that the following research protocol has undergone ethical review and achieved official approval:</p>
    <div class="title-box">
      <strong>Protocol Title:</strong><br/>
      <span style="font-size: 18px; color: #0f172a;">${submission.title}</span>
    </div>
    <p><strong>Principal Investigator:</strong> ${submission.principalInvestigator.name} (${submission.principalInvestigator.institution})</p>
    <p><strong>Location:</strong> Oromia, ${submission.zone || 'Region'}, ${submission.woreda || ''}</p>
    <p><strong>Validity:</strong> 1 Year from issue date.</p>
    <div style="margin-top: 40px; text-align: right;">
      <p style="font-style: italic; font-weight: bold; color: #005BAC;">Prof. Gemechu Hunduma</p>
      <p style="font-size: 12px; color: #64748b;">Chairperson, OHB Institutional Review Board</p>
    </div>
    <div class="footer">
      Official Document stored in Google Drive • Oromia Health Bureau IRB Portal
    </div>
  </div>
</body>
</html>
  `;

  const fileName = `OHB_IRB_Ethical_Clearance_${submission.refNo.replace(/\//g, '_')}.html`;
  return await uploadFileToDrive(accessToken, fileName, 'text/html', htmlContent, irbFolderId);
};
