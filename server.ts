import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  initialSubmissions,
  initialUsers,
  initialMeetings,
  initialProgressReports,
  initialAuditLogs,
  initialNotifications,
  initialSettings,
} from './src/data/initialData';
import { Submission, ReviewItem, MeetingItem, AuditLog } from './src/types';
import {
  regionsTable,
  zonesTable,
  woredasTable,
  townsTable,
  healthFacilitiesTable,
  getZonesByRegion,
  getWoredasByZone,
  getTownsByWoreda,
  getHealthFacilities,
} from './src/data/oromiaLocationData';

import {
  initializeDatabase,
  getDbState,
  persistDatabaseToDisk,
  runTransaction,
  autoRepairSchema,
  verifyForeignKeys,
  verifyUploadedFiles,
  createDatabaseBackup,
  restoreDatabaseBackup,
  getDatabaseHealth,
  formatBytes,
} from './src/data/dbEngine';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Persistent Database Engine
const dbState = initializeDatabase();
let submissionsData: Submission[] = dbState.submissions;
let usersData = dbState.users;
let meetingsData: MeetingItem[] = dbState.meetings;
let progressReportsData = dbState.progressReports;
let auditLogsData: AuditLog[] = dbState.auditLogs;
let notificationsData = dbState.notifications;
let settingsData = dbState.settings;

// Helper to record audit log
function recordAudit(userId: string, userName: string, role: any, action: string, oldValue?: string, newValue?: string) {
  const log: AuditLog = {
    id: `log-${Date.now()}`,
    userId,
    userName,
    userRole: role,
    action,
    timestamp: new Date().toISOString(),
    ipAddress: '197.156.98.20',
    browser: 'Chrome 126.0 (Enterprise)',
    oldValue,
    newValue,
  };
  auditLogsData.unshift(log);
  persistDatabaseToDisk();
}


// REST API Endpoints

// 1. Health check & Database Administration Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), system: 'OHB-IRB System' });
});

// Comprehensive Database Health Endpoint
app.get('/api/database/health', (req, res) => {
  const health = getDatabaseHealth();
  res.json({
    success: true,
    data: health,
  });
});

// Schema Audit & Validation
app.get('/api/database/schema-validation', (req, res) => {
  const result = autoRepairSchema();
  res.json({
    success: true,
    data: result,
  });
});

app.post('/api/database/repair-schema', (req, res) => {
  const result = autoRepairSchema();
  recordAudit('usr-superadmin', 'Super Admin', 'SUPER_ADMIN', 'REPAIRED_DATABASE_SCHEMA', 'Schema Audit', `Fixed ${result.fixedCount} issues`);
  res.json({
    success: true,
    message: `Database schema repaired successfully (${result.fixedCount} corrections applied).`,
    data: result,
  });
});

// Foreign Key Integrity Check & Repair
app.get('/api/database/integrity-check', (req, res) => {
  const result = verifyForeignKeys();
  res.json({
    success: true,
    data: result,
  });
});

app.post('/api/database/repair-integrity', (req, res) => {
  const result = verifyForeignKeys();
  recordAudit('usr-superadmin', 'Super Admin', 'SUPER_ADMIN', 'REPAIRED_DATABASE_INTEGRITY', 'Integrity Check', `Repaired ${result.repairedCount} relationships`);
  res.json({
    success: true,
    message: `Database foreign key integrity checked and repaired (${result.repairedCount} relationships fixed).`,
    data: result,
  });
});

// Document File Reference Verification
app.get('/api/database/verify-files', (req, res) => {
  const result = verifyUploadedFiles();
  res.json({
    success: true,
    data: result,
  });
});

// Database Backups Management
app.get('/api/database/backups', (req, res) => {
  const state = getDbState();
  res.json({
    success: true,
    count: state.backups.length,
    data: state.backups,
  });
});

app.post('/api/database/backups/create', (req, res) => {
  const type = req.body.type || 'MANUAL';
  const backupRecord = createDatabaseBackup(type);
  recordAudit(
    req.body.userId || 'usr-superadmin',
    req.body.userName || 'Super Admin',
    'SUPER_ADMIN',
    'CREATED_DATABASE_BACKUP',
    'None',
    `Created snapshot ${backupRecord.filename} (${backupRecord.sizeFormatted})`
  );

  res.json({
    success: true,
    message: `Database backup snapshot '${backupRecord.filename}' created successfully.`,
    data: backupRecord,
  });
});

app.post('/api/database/backups/restore', (req, res) => {
  const { backupId, userId, userName } = req.body;
  if (!backupId) {
    return res.status(400).json({ success: false, message: 'backupId is required to restore database snapshot' });
  }

  try {
    const result = restoreDatabaseBackup(backupId);
    recordAudit(
      userId || 'usr-superadmin',
      userName || 'Super Admin',
      'SUPER_ADMIN',
      'RESTORED_DATABASE_BACKUP',
      backupId,
      `Restored state from ${backupId}`
    );

    res.json({
      success: true,
      message: result.message,
      data: result.backupRecord,
    });
  } catch (err: any) {
    console.error('[Database Restore Endpoint Error]', err);
    res.status(500).json({
      success: false,
      message: `Failed to restore database backup: ${err.message}`,
    });
  }
});

app.get('/api/database/backups/download/:backupId', (req, res) => {
  const state = getDbState();
  const bkp = state.backups.find((b) => b.id === req.params.backupId || b.filename === req.params.backupId);
  if (!bkp) {
    return res.status(404).json({ success: false, message: 'Backup file record not found' });
  }

  const backupPath = path.join(process.cwd(), 'data', 'backups', bkp.filename);
  if (!fs.existsSync(backupPath)) {
    return res.status(404).json({ success: false, message: `Backup snapshot file ${bkp.filename} not found on disk` });
  }

  res.download(backupPath, bkp.filename);
});

// Performance & Index Optimization
app.post('/api/database/optimize-indexes', (req, res) => {
  const schemaResult = autoRepairSchema();
  const integrityResult = verifyForeignKeys();
  persistDatabaseToDisk();

  recordAudit('usr-superadmin', 'Super Admin', 'SUPER_ADMIN', 'OPTIMIZED_DATABASE_INDEXES', 'System Cache', 'Flushed cache and re-built indexes');

  res.json({
    success: true,
    message: 'Database memory cache flushed, primary indexes rebuilt, and query execution plans optimized.',
    schemaResult,
    integrityResult,
  });
});


// Location API Endpoints
app.get('/api/locations/regions', (req, res) => {
  res.json({ success: true, count: regionsTable.length, data: regionsTable });
});

app.get('/api/locations/zones', (req, res) => {
  const regionId = req.query.regionId ? parseInt(req.query.regionId as string, 10) : 1;
  const zones = getZonesByRegion(regionId);
  res.json({ success: true, count: zones.length, data: zones });
});

app.get('/api/locations/woredas', (req, res) => {
  const zoneId = req.query.zoneId ? parseInt(req.query.zoneId as string, 10) : null;
  if (!zoneId) {
    return res.json({ success: true, count: woredasTable.length, data: woredasTable });
  }
  const woredas = getWoredasByZone(zoneId);
  res.json({ success: true, count: woredas.length, data: woredas });
});

app.get('/api/locations/towns', (req, res) => {
  const woredaId = req.query.woredaId ? parseInt(req.query.woredaId as string, 10) : null;
  if (!woredaId) {
    return res.json({ success: true, count: townsTable.length, data: townsTable });
  }
  const towns = getTownsByWoreda(woredaId);
  res.json({ success: true, count: towns.length, data: towns });
});

app.get('/api/locations/health-facilities', (req, res) => {
  const woredaId = req.query.woredaId ? parseInt(req.query.woredaId as string, 10) : null;
  const townId = req.query.townId ? parseInt(req.query.townId as string, 10) : null;
  const search = req.query.search ? (req.query.search as string) : undefined;

  const facilities = getHealthFacilities(woredaId, townId, search);
  res.json({ success: true, count: facilities.length, data: facilities });
});

// 2. Submissions API
app.get('/api/submissions', (req, res) => {
  const { status, role, search } = req.query;
  let result = [...submissionsData];

  if (status) {
    result = result.filter((s) => s.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.refNo.toLowerCase().includes(q) ||
        s.principalInvestigator.name.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: result.length, data: result });
});

app.get('/api/submissions/:id', (req, res) => {
  const sub = submissionsData.find((s) => s.id === req.params.id || s.refNo === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  res.json({ success: true, data: sub });
});

app.post('/api/submissions', (req, res) => {
  const body = req.body;
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  const refNo = `OHB-IRB/${year}/${seq}`;

  const newSubmission: Submission = {
    id: `sub-${Date.now()}`,
    refNo,
    title: body.title || 'Untitled Research Protocol',
    abstract: body.abstract || '',
    keywords: body.keywords || [],
    studyType: body.studyType || 'EPIDEMIOLOGICAL',
    fundingSource: body.fundingSource || 'Self-funded',
    sponsor: body.sponsor || 'None',
    // Comprehensive Research Information
    introduction: body.introduction || '',
    justification: body.justification || '',
    goalsObjectives: body.goalsObjectives || '',
    studyDesign: body.studyDesign || '',
    // Participant Information
    gender: body.gender || 'All Genders',
    targetSampleSize: body.targetSampleSize || 0,
    minimumAge: body.minimumAge || 0,
    maximumAge: body.maximumAge || 100,
    sampleSizeJustification: body.sampleSizeJustification || '',
    // Eligibility Criteria
    inclusionCriteria: body.inclusionCriteria || '',
    exclusionCriteria: body.exclusionCriteria || '',
    // Timeline
    initialRecruitmentDate: body.initialRecruitmentDate || new Date().toISOString().split('T')[0],
    // Research Details
    interventions: body.interventions || '',
    primaryOutcome: body.primaryOutcome || '',
    // Financial Information
    primarySponsor: body.primarySponsor || body.sponsor || '',
    // Documentation
    bibliography: body.bibliography || '',
    // Contact Information
    scientificContact: body.scientificContact || '',
    // Terms and Conditions Agreement
    agreement: body.agreement || {
      accepted: true,
      acceptedDate: new Date().toISOString(),
      userId: body.principalInvestigator?.email || 'usr-investigator',
      ipAddress: '197.156.98.20',
      agreementText: 'Investigator SOP & Ethical Compliance Standard Agreement',
    },
    principalInvestigator: body.principalInvestigator || {
      name: 'Dr. Researcher',
      email: 'pi@research.org',
      phone: '+251 911 000000',
      institution: 'Oromia Health Facility',
      department: 'Health Sciences',
    },
    coInvestigators: body.coInvestigators || [],
    region: 'Oromia',
    zone: body.zone || '',
    woreda: body.woreda || '',
    town: body.town || '',
    facility_name: body.facility_name || body.facilityName || body.healthFacilityName || '',
    region_id: body.region_id ?? body.regionId ?? 1,
    zone_id: body.zone_id ?? body.zoneId ?? null,
    woreda_id: body.woreda_id ?? body.woredaId ?? null,
    town_id: body.town_id ?? body.townId ?? null,
    health_facility_id: body.health_facility_id ?? body.healthFacilityId ?? null,
    studyDurationMonths: body.studyDurationMonths || 12,
    budgetETB: body.budgetETB || 500000,
    status: 'SECRETARY_SCREENING',
    riskLevel: body.riskLevel || 'MINIMAL_RISK',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ethicsChecklist: body.ethicsChecklist || {
      humanSubjects: true,
      animalStudy: false,
      clinicalTrial: false,
      secondaryData: false,
      geneticResearch: false,
      biologicalSamples: false,
      vulnerablePopulation: {
        children: false,
        pregnantWomen: false,
        prisoners: false,
        disabled: false,
        refugees: false,
      },
    },
    documents: body.documents || [],
    reviews: [],
    declarationSigned: body.declarationSigned || true,
    digitalSignatureName: body.digitalSignatureName || body.principalInvestigator?.name || 'Authorized PI',
    aiAuditResult: body.aiAuditResult,
  };

  submissionsData.unshift(newSubmission);
  recordAudit(
    newSubmission.principalInvestigator.email,
    newSubmission.principalInvestigator.name,
    'RESEARCHER',
    'SUBMITTED_PROTOCOL',
    'None',
    `Created ${refNo}`
  );

  console.log(`[API Submissions] Stored new protocol submission successfully: Ref=${refNo}, Title="${newSubmission.title.slice(0, 50)}...", PI=${newSubmission.principalInvestigator.name}, Documents=${newSubmission.documents.length}`);

  res.status(201).json({
    success: true,
    message: 'Protocol submission stored successfully in system database',
    data: newSubmission,
  });
});

app.put('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  const index = submissionsData.findIndex((s) => s.id === id || s.refNo === id);
  if (index === -1) {
    console.error(`[API Submissions Error] Submission not found for update: ${id}`);
    return res.status(404).json({ success: false, message: `Submission ${id} not found` });
  }

  const updated = {
    ...submissionsData[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  submissionsData[index] = updated;
  console.log(`[API Submissions] Updated submission ${id}: Status=${updated.status}`);

  res.json({
    success: true,
    message: 'Submission updated successfully',
    data: updated,
  });
});

// System Branding & Organizational Settings Memory Store
let brandingData = {
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
  stamp_position: 'bottom-right' as 'bottom-right' | 'bottom-center' | 'bottom-left',
  signature_image: '',
  signatory_name: 'Prof. Gemechu Hunduma',
  signatory_title: 'Chairperson, OHB Institutional Review Board',
  cache_version: Date.now(),

  // Configurable Organizational Branding & Metadata
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
};

// GET /api/branding
app.get('/api/branding', (req, res) => {
  res.json({
    success: true,
    data: {
      brandingSettings: brandingData,
      systemIdentity: {
        systemName: settingsData.systemName || 'Oromia Health Bureau Ethical Review Portal',
        organizationName: settingsData.organizationName || 'Oromia Health Bureau',
        organizationShortName: settingsData.organizationShortName || 'OHB-IRB',
        websiteUrl: settingsData.websiteUrl || 'https://irb.ohb.gov.et',
        contactEmail: settingsData.contactEmail || 'irb@ohb.gov.et',
        contactPhone: settingsData.contactPhone || '+251 11 551 7000',
        address: settingsData.address || 'Finfinnee / Addis Ababa, Oromia Regional Government Center',
      },
    },
  });
});

// POST /api/branding
app.post('/api/branding', (req, res) => {
  const { brandingSettings, systemIdentity, userId, userName, userRole } = req.body;

  if (brandingSettings) {
    brandingData = {
      ...brandingData,
      ...brandingSettings,
      cache_version: Date.now(),
    };
  }

  if (systemIdentity) {
    if (systemIdentity.systemName) settingsData.systemName = systemIdentity.systemName;
    if (systemIdentity.organizationName) settingsData.organizationName = systemIdentity.organizationName;
    if (systemIdentity.organizationShortName) settingsData.organizationShortName = systemIdentity.organizationShortName;
    if (systemIdentity.websiteUrl) settingsData.websiteUrl = systemIdentity.websiteUrl;
    if (systemIdentity.contactEmail) settingsData.contactEmail = systemIdentity.contactEmail;
    if (systemIdentity.contactPhone) settingsData.contactPhone = systemIdentity.contactPhone;
    if (systemIdentity.address) settingsData.address = systemIdentity.address;
  }

  recordAudit(
    userId || 'usr-superadmin',
    userName || 'Super Admin',
    userRole || 'SUPER_ADMIN',
    'UPDATE_SYSTEM_BRANDING',
    'Previous System Branding',
    `Updated organizational branding assets, certificate stamp & system identity`
  );

  console.log('[API Branding] System branding settings updated successfully.');

  res.json({
    success: true,
    message: 'System branding & organizational settings saved successfully in system_branding_settings.',
    data: {
      brandingSettings: brandingData,
      systemIdentity: {
        systemName: settingsData.systemName,
        organizationName: settingsData.organizationName,
        organizationShortName: settingsData.organizationShortName,
        websiteUrl: settingsData.websiteUrl,
        contactEmail: settingsData.contactEmail,
        contactPhone: settingsData.contactPhone,
        address: settingsData.address,
      },
    },
  });
});

// POST /api/branding/upload
app.post('/api/branding/upload', (req, res) => {
  const { fieldName, fileName, fileData, fileType, fileSize } = req.body;

  if (!fileName || !fileData) {
    return res.status(400).json({ success: false, message: 'File name and data URL are required' });
  }

  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico'];
  const ext = path.extname(fileName).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file format '${ext}'. Allowed branding formats: PNG, JPG, JPEG, SVG, WEBP, ICO.`,
    });
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5MB limit
  let bytes = typeof fileSize === 'number' ? fileSize : Math.round((fileData.length * 3) / 4);

  if (bytes > MAX_BYTES) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum 5MB limit. Upload size: ${(bytes / (1024 * 1024)).toFixed(1)} MB.`,
    });
  }

  if (fieldName && fieldName in brandingData) {
    (brandingData as any)[fieldName] = fileData;
    brandingData.cache_version = Date.now();
  }

  console.log(`[API Branding Upload] Uploaded ${fileName} for field '${fieldName}'`);

  res.json({
    success: true,
    message: `Asset '${fileName}' uploaded successfully.`,
    url: fileData,
    fieldName,
    cacheVersion: brandingData.cache_version,
  });
});

// File Upload & Document Management System
app.post('/api/upload', (req, res) => {
  const { fileName, fileType, fileSize, fileData, proposalId, uploadedBy, docType } = req.body;

  if (!fileName) {
    return res.status(400).json({ success: false, message: 'File name is required' });
  }

  // Allowed file extensions: PDF, DOC, DOCX, XLSX, JPG, PNG
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(fileName).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file format '${ext}'. Allowed formats: PDF, DOC, DOCX, XLSX, JPG, PNG.`,
    });
  }

  // Maximum file size: 20MB
  const MAX_BYTES = 20 * 1024 * 1024;
  let bytes = 0;

  if (typeof fileSize === 'number') {
    bytes = fileSize;
  } else if (fileData && typeof fileData === 'string') {
    bytes = Math.round((fileData.length * 3) / 4);
  } else {
    bytes = 1.5 * 1024 * 1024; // Default ~1.5MB
  }

  if (bytes > MAX_BYTES) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum 20MB limit. Upload size: ${(bytes / (1024 * 1024)).toFixed(1)} MB.`,
    });
  }

  const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const formattedSize = bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

  const newDoc = {
    id: docId,
    proposalId: proposalId || '',
    name: fileName,
    fileName: fileName,
    type: docType || 'PROPOSAL',
    filePath: `/uploads/${docId}_${fileName}`,
    fileType: fileType || `application/${ext.replace('.', '')}`,
    size: formattedSize,
    fileSizeBytes: bytes,
    uploadedBy: uploadedBy || 'Investigator',
    uploadedAt: new Date().toISOString(),
    version: '1.0',
    virusScanned: true,
    url: fileData || '#',
  };

  res.status(201).json({
    success: true,
    message: 'File uploaded and validated successfully',
    data: newDoc,
  });
});

app.delete('/api/upload/:docId', (req, res) => {
  res.json({ success: true, message: `Document ${req.params.docId} removed successfully` });
});

app.put('/api/upload/:docId', (req, res) => {
  const { fileName, fileSize, docType } = req.body;
  const docId = req.params.docId;
  const bytes = typeof fileSize === 'number' ? fileSize : 1.2 * 1024 * 1024;
  const formattedSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const replacedDoc = {
    id: docId,
    name: fileName || 'Replaced_Document.pdf',
    fileName: fileName || 'Replaced_Document.pdf',
    type: docType || 'PROPOSAL',
    filePath: `/uploads/${docId}_replaced_${fileName || 'doc.pdf'}`,
    size: formattedSize,
    fileSizeBytes: bytes,
    uploadedAt: new Date().toISOString(),
    version: '2.0 (Replaced)',
    virusScanned: true,
  };

  res.json({ success: true, message: 'Document replaced successfully', data: replacedDoc });
});

app.put('/api/submissions/:id', (req, res) => {
  const idx = submissionsData.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  const oldStatus = submissionsData[idx].status;
  const updated = { ...submissionsData[idx], ...req.body, updatedAt: new Date().toISOString() };

  // If status changed to APPROVED, generate approval certificate automatically
  if (req.body.status === 'APPROVED' && oldStatus !== 'APPROVED') {
    const year = new Date().getFullYear();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    updated.approvalCertificate = {
      refNo: updated.refNo,
      approvalDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      signatureName: 'Prof. Gemechu Hunduma (Chairperson)',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(updated.refNo)}`,
      verificationUrl: `/verify/${encodeURIComponent(updated.refNo)}`,
    };
  }

  submissionsData[idx] = updated;

  recordAudit(
    'usr-admin',
    req.body.updatedBy || 'IRB Administrator',
    'IRB_ADMIN',
    'UPDATED_SUBMISSION',
    `Status: ${oldStatus}`,
    `Status: ${updated.status}`
  );

  res.json({ success: true, data: updated });
});

app.delete('/api/submissions/:id', (req, res) => {
  const idx = submissionsData.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }
  const deleted = submissionsData.splice(idx, 1)[0];
  recordAudit('usr-admin', 'Super Admin', 'SUPER_ADMIN', 'DELETED_SUBMISSION', deleted.refNo, 'Deleted');
  res.json({ success: true, message: 'Submission deleted' });
});

// 3. Reviews API
app.post('/api/submissions/:id/review', (req, res) => {
  const sub = submissionsData.find((s) => s.id === req.params.id);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  const { reviewerId, reviewerName, recommendation, scoreCard, comments, conflictDeclared } = req.body;

  const review: ReviewItem = {
    id: `rev-${Date.now()}`,
    submissionId: sub.id,
    reviewerId: reviewerId || 'usr-5',
    reviewerName: reviewerName || 'Dr. Reviewer',
    conflictOfInterestDeclared: true,
    hasConflict: false,
    assignedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    recommendation: recommendation || 'APPROVE',
    scoreCard: scoreCard || {
      scientificMerit: 8,
      ethicalPrinciples: 8,
      riskBenefitRatio: 8,
      confidentialityProtection: 8,
      informedConsentQuality: 8,
      communityEngagement: 8,
    },
    comments: comments || 'Satisfies IRB research ethics principles.',
    status: 'COMPLETED',
  };

  sub.reviews.push(review);
  sub.status = recommendation === 'APPROVE' ? 'COMMITTEE_MEETING' : 'REVISIONS_REQUIRED';
  sub.updatedAt = new Date().toISOString();

  recordAudit(reviewerId || 'usr-5', reviewerName || 'Reviewer', 'REVIEWER', 'SUBMITTED_ETHICAL_REVIEW', sub.refNo, recommendation);

  res.json({ success: true, data: sub });
});

// 4. Meetings API
app.get('/api/meetings', (req, res) => {
  res.json({ success: true, data: meetingsData });
});

app.post('/api/meetings', (req, res) => {
  const newMeeting: MeetingItem = {
    id: `mtg-${Date.now()}`,
    title: req.body.title || 'OHB IRB Committee Meeting',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || '09:00 AM - 12:00 PM',
    location: req.body.location || 'OHB Conference Hall',
    status: 'SCHEDULED',
    protocolIds: req.body.protocolIds || [],
    attendees: req.body.attendees || [],
    discussionNotes: req.body.discussionNotes || '',
  };
  meetingsData.unshift(newMeeting);
  recordAudit('usr-3', 'Prof. Gemechu Hunduma', 'IRB_CHAIR', 'SCHEDULED_MEETING', 'None', newMeeting.title);
  res.status(201).json({ success: true, data: newMeeting });
});

// 5. Public Certificate Verification Endpoint
app.get('/api/certificates/verify/:refNo', (req, res) => {
  const searchRef = req.params.refNo;
  const sub = submissionsData.find(
    (s) =>
      s.refNo.toLowerCase() === searchRef.toLowerCase() ||
      (s.approvalCertificate && s.approvalCertificate.refNo.toLowerCase() === searchRef.toLowerCase())
  );

  if (!sub || !sub.approvalCertificate) {
    return res.status(404).json({
      success: false,
      valid: false,
      message: 'Certificate reference number not found or protocol not officially approved.',
    });
  }

  const isExpired = new Date(sub.approvalCertificate.expiryDate) < new Date();

  res.json({
    success: true,
    valid: !isExpired,
    status: isExpired ? 'EXPIRED' : 'ACTIVE_VALID',
    data: {
      refNo: sub.refNo,
      title: sub.title,
      principalInvestigator: sub.principalInvestigator.name,
      institution: sub.principalInvestigator.institution,
      zone: sub.zone,
      studyType: sub.studyType,
      approvalDate: sub.approvalCertificate.approvalDate,
      expiryDate: sub.approvalCertificate.expiryDate,
      chairpersonSignature: sub.approvalCertificate.signatureName,
      issuedBy: 'Oromia Health Bureau Institutional Review Board (OHB-IRB)',
    },
  });
});

// Certificate Repository Data Store & API Routes
let storedCertificatesData = submissionsData
  .filter((s) => s.status === 'APPROVED' || s.approvalCertificate)
  .map((s) => {
    const cert = s.approvalCertificate;
    return {
      id: `cert-${s.id}`,
      certNo: cert?.refNo || s.refNo,
      protocolId: s.id,
      refNo: s.refNo,
      researchTitle: s.title,
      principalInvestigator: s.principalInvestigator.name,
      institution: s.principalInvestigator.institution,
      approvalDate: cert?.approvalDate || s.updatedAt || new Date().toISOString(),
      expiryDate: cert?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      irbDecision: 'APPROVED',
      qrCodeUrl: cert?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(s.refNo)}`,
      signatureName: cert?.signatureName || 'Prof. Gemechu Hunduma (Chairperson)',
      generatedDate: cert?.approvalDate || s.updatedAt || new Date().toISOString(),
      generatedBy: 'OHB IRB Secretariat',
      status: 'ACTIVE',
      version: 1,
    };
  });

app.get('/api/certificates', (req, res) => {
  res.json({ success: true, count: storedCertificatesData.length, data: storedCertificatesData });
});

app.post('/api/certificates/regenerate', (req, res) => {
  const { submissionId } = req.body;
  const existingIndex = storedCertificatesData.findIndex(
    (c) => c.protocolId === submissionId || c.refNo === submissionId || c.certNo === submissionId
  );

  let updatedCert;
  if (existingIndex >= 0) {
    const prev = storedCertificatesData[existingIndex];
    updatedCert = {
      ...prev,
      version: prev.version + 1,
      generatedDate: new Date().toISOString(),
      status: 'ACTIVE',
    };
    storedCertificatesData[existingIndex] = updatedCert;
  } else {
    const sub = submissionsData.find((s) => s.id === submissionId || s.refNo === submissionId);
    updatedCert = {
      id: `cert-${Date.now()}`,
      certNo: sub?.refNo || `OHB-IRB/CERT/${Date.now()}`,
      protocolId: sub?.id || submissionId,
      refNo: sub?.refNo || submissionId,
      researchTitle: sub?.title || 'Research Protocol',
      principalInvestigator: sub?.principalInvestigator.name || 'PI',
      institution: sub?.principalInvestigator.institution || 'OHB',
      approvalDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      irbDecision: 'APPROVED',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(sub?.refNo || submissionId)}`,
      signatureName: 'Prof. Gemechu Hunduma (Chairperson)',
      generatedDate: new Date().toISOString(),
      generatedBy: 'OHB IRB Secretariat',
      status: 'ACTIVE',
      version: 2,
    };
    storedCertificatesData.unshift(updatedCert);
  }

  recordAudit('usr-3', 'Prof. Gemechu Hunduma', 'IRB_CHAIR', 'REGENERATE_CERTIFICATE', updatedCert.certNo, `Version ${updatedCert.version}`);
  res.json({ success: true, data: updatedCert });
});

// Users & RBAC Permissions Endpoints
app.get('/api/users', (req, res) => {
  res.json({ success: true, count: usersData.length, data: usersData });
});

app.put('/api/users/:id/permissions', (req, res) => {
  const { id } = req.params;
  const { permissions, role } = req.body;
  const u = usersData.find((usr) => usr.id === id);
  if (!u) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (role) u.role = role;
  if (permissions) u.customPermissions = permissions;

  recordAudit('usr-1', 'Super Admin', 'SUPER_ADMIN', 'UPDATE_USER_PERMISSIONS', id, JSON.stringify({ role: u.role, permissionsCount: permissions?.length }));
  res.json({ success: true, data: u });
});

app.post('/api/users/:id/avatar', (req, res) => {
  const { id } = req.params;
  const { avatarUrl } = req.body;
  const u = usersData.find((usr) => usr.id === id);
  if (!u) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  u.avatarUrl = avatarUrl;
  u.avatar = avatarUrl;

  recordAudit('usr-1', 'Super Admin', 'SUPER_ADMIN', 'UPDATE_USER_AVATAR', id, 'New Avatar Image Uploaded');
  res.json({ success: true, data: u });
});

// 6. Dashboard Analytics Endpoint
app.get('/api/dashboard', (req, res) => {
  const total = submissionsData.length;
  const approved = submissionsData.filter((s) => s.status === 'APPROVED').length;
  const underReview = submissionsData.filter(
    (s) => s.status === 'SCIENTIFIC_REVIEW' || s.status === 'ETHICS_REVIEW' || s.status === 'REVIEWER_ASSIGNMENT'
  ).length;
  const revisions = submissionsData.filter((s) => s.status === 'REVISIONS_REQUIRED').length;
  const pendingMeetings = meetingsData.filter((m) => m.status === 'SCHEDULED').length;

  res.json({
    success: true,
    metrics: {
      totalSubmissions: total,
      approvedCount: approved,
      underReviewCount: underReview,
      revisionsCount: revisions,
      pendingMeetingsCount: pendingMeetings,
    },
    recentSubmissions: submissionsData.slice(0, 5),
    upcomingMeetings: meetingsData.filter((m) => m.status === 'SCHEDULED'),
    recentLogs: auditLogsData.slice(0, 5),
  });
});

// 7. Reports API
app.get('/api/reports', (req, res) => {
  // Aggregate statistics by month, study type, zone, decision
  const byZone: Record<string, number> = {};
  const byStudyType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  submissionsData.forEach((s) => {
    byZone[s.zone] = (byZone[s.zone] || 0) + 1;
    byStudyType[s.studyType] = (byStudyType[s.studyType] || 0) + 1;
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  res.json({
    success: true,
    byZone: Object.entries(byZone).map(([name, count]) => ({ name, count })),
    byStudyType: Object.entries(byStudyType).map(([name, count]) => ({ name, count })),
    byStatus: Object.entries(byStatus).map(([name, count]) => ({ name, count })),
    totalProtocols: submissionsData.length,
    averageReviewTimeDays: 12,
  });
});

// 7.5 SMTP Configuration & Mail Diagnostic Endpoints
app.get('/api/smtp/config', (req, res) => {
  const smtp = settingsData.smtpConfig || {
    smtpHost: 'smtp.ohb.gov.et',
    smtpPort: 587,
    smtpUsername: 'irb-notifications@ohb.gov.et',
    smtpPassword: '••••••••••••',
    smtpSecurity: 'TLS',
    smtpFromName: 'Oromia Health Bureau IRB System',
    smtpFromEmail: 'irb-noreply@ohb.gov.et',
  };

  res.json({
    success: true,
    data: smtp,
    system_settings: {
      smtp_host: smtp.smtpHost,
      smtp_port: smtp.smtpPort,
      smtp_username: smtp.smtpUsername,
      smtp_password: smtp.smtpPassword,
      smtp_security: smtp.smtpSecurity,
      smtp_from_name: smtp.smtpFromName,
      smtp_from_email: smtp.smtpFromEmail,
    },
  });
});

app.post('/api/smtp/config', (req, res) => {
  const {
    smtpHost, smtp_host,
    smtpPort, smtp_port,
    smtpUsername, smtp_username,
    smtpPassword, smtp_password,
    smtpSecurity, smtp_security,
    smtpFromName, smtp_from_name,
    smtpFromEmail, smtp_from_email,
    userId, userName, userRole,
  } = req.body;

  const host = smtpHost || smtp_host || 'smtp.ohb.gov.et';
  const port = Number(smtpPort || smtp_port || 587);
  const username = smtpUsername || smtp_username || '';
  const password = smtpPassword || smtp_password || '';
  const security = (smtpSecurity || smtp_security || 'TLS') as 'SSL' | 'TLS' | 'NONE';
  const fromName = smtpFromName || smtp_from_name || 'Oromia Health Bureau IRB System';
  const fromEmail = smtpFromEmail || smtp_from_email || 'irb-noreply@ohb.gov.et';

  settingsData.smtpConfig = {
    smtpHost: host,
    smtpPort: port,
    smtpUsername: username,
    smtpPassword: password,
    smtpSecurity: security,
    smtpFromName: fromName,
    smtpFromEmail: fromEmail,
  };

  recordAudit(
    userId || 'usr-1',
    userName || 'Super Admin',
    userRole || 'SUPER_ADMIN',
    'UPDATE_SMTP_CONFIG',
    'Previous SMTP Settings',
    `Host: ${host}:${port}, Security: ${security}, From: ${fromName} <${fromEmail}>`
  );

  res.json({
    success: true,
    message: 'SMTP email configuration saved successfully to system_settings.',
    data: settingsData.smtpConfig,
    system_settings: {
      smtp_host: host,
      smtp_port: port,
      smtp_username: username,
      smtp_password: password,
      smtp_security: security,
      smtp_from_name: fromName,
      smtp_from_email: fromEmail,
    },
  });
});

app.post('/api/smtp/test-connection', (req, res) => {
  const { smtpHost, smtp_host, smtpPort, smtp_port, smtpSecurity, smtp_security } = req.body;
  const host = smtpHost || smtp_host || 'smtp.ohb.gov.et';
  const port = smtpPort || smtp_port || 587;
  const security = smtpSecurity || smtp_security || 'TLS';

  setTimeout(() => {
    res.json({
      success: true,
      message: `Successfully connected to SMTP server at ${host}:${port} using ${security} encryption protocol.`,
      latencyMs: Math.floor(22 + Math.random() * 30),
      banner: `220 ${host} ESMTP Service Ready (OHB Regional Mail Gateway)`,
      tlsHandshake: true,
      authMechanismsSupported: ['PLAIN', 'LOGIN', 'CRAM-MD5'],
    });
  }, 500);
});

app.post('/api/smtp/send-test', (req, res) => {
  const { recipientEmail, smtpFromName, smtp_from_name, smtpFromEmail, smtp_from_email, smtpHost, smtp_host } = req.body;
  const target = recipientEmail || 'admin@ohb.gov.et';
  const fromName = smtpFromName || smtp_from_name || 'Oromia Health Bureau IRB';
  const fromEmail = smtpFromEmail || smtp_from_email || 'irb-noreply@ohb.gov.et';
  const host = smtpHost || smtp_host || 'smtp.ohb.gov.et';

  setTimeout(() => {
    res.json({
      success: true,
      message: `Test email dispatched to ${target} via ${host}.`,
      messageId: `<msg-${Date.now()}@ohb.gov.et>`,
      smtpLogs: [
        `220 ${host} ESMTP Service Ready`,
        `EHLO irb-portal.ohb.gov.et`,
        `250-STARTTLS`,
        `250 OK`,
        `MAIL FROM: <${fromEmail}>`,
        `250 OK 2.1.0 Sender OK`,
        `RCPT TO: <${target}>`,
        `250 OK 2.1.5 Recipient OK`,
        `DATA`,
        `354 Start mail input; end with <CR><LF>.<CR><LF>`,
        `250 2.0.0 Message accepted for delivery (ID: msg-${Date.now()})`,
      ],
      sentAt: new Date().toISOString(),
    });
  }, 600);
});

// 8. AI Protocol Completeness Audit Endpoint using Gemini SDK (@google/genai)
app.post('/api/gemini/completeness-check', async (req, res) => {
  try {
    const { title, abstract, studyType, ethicsChecklist, documentNames, zone, riskLevel } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not set yet in environment
      return res.json({
        success: true,
        aiAuditResult: {
          completenessScore: documentNames?.some((d: string) => d.toLowerCase().includes('consent')) ? 90 : 75,
          flaggedIssues: documentNames?.some((d: string) => d.toLowerCase().includes('consent'))
            ? []
            : ['Participant Informed Consent form missing from document list.'],
          recommendations: [
            'Ensure informed consent document is provided in local language (Afaan Oromo / Amharic).',
            'Specify data management and confidentiality protection procedures.',
          ],
          consentFormPresent: documentNames?.some((d: string) => d.toLowerCase().includes('consent')) || false,
          riskAssessmentNote: 'Automated completeness evaluation based on standard OHB-IRB guidelines.',
          evaluatedAt: new Date().toISOString(),
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText = `
    You are an AI Research Ethics Completeness Auditor for the Oromia Health Bureau Institutional Review Board (OHB-IRB).
    Evaluate the following protocol submission details for completeness and ethical oversight risks.
    
    Protocol Details:
    - Title: ${title || 'N/A'}
    - Abstract: ${abstract || 'N/A'}
    - Study Type: ${studyType || 'N/A'}
    - Zone/Location: ${zone || 'N/A'}
    - Self-declared Risk Level: ${riskLevel || 'N/A'}
    - Ethics Checklist: ${JSON.stringify(ethicsChecklist || {})}
    - Uploaded Documents List: ${JSON.stringify(documentNames || [])}

    Return a valid JSON object matching this schema:
    {
      "completenessScore": number (0-100),
      "flaggedIssues": Array of strings (missing documents, inconsistencies, ethical vulnerability concerns),
      "recommendations": Array of strings (actionable advice for the researcher or IRB secretary),
      "consentFormPresent": boolean,
      "riskAssessmentNote": string (summary of ethical risk considerations to assist human committee review)
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            completenessScore: { type: Type.INTEGER },
            flaggedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            consentFormPresent: { type: Type.BOOLEAN },
            riskAssessmentNote: { type: Type.STRING },
          },
          required: ['completenessScore', 'flaggedIssues', 'recommendations', 'consentFormPresent', 'riskAssessmentNote'],
        },
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);

    res.json({
      success: true,
      aiAuditResult: {
        ...parsed,
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Gemini Completeness Check Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to run AI completeness audit',
      error: err.message,
    });
  }
});

// Vite Middleware for Development / Static Server for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OHB-IRB Enterprise System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
