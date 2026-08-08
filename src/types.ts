/**
 * OHB-IRB Ethical Review Management System - Types & Interfaces
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'IRB_ADMIN'
  | 'IRB_CHAIR'
  | 'SECRETARY'
  | 'REVIEWER'
  | 'COMMITTEE_MEMBER'
  | 'RESEARCHER'
  | 'ADMIN'
  | 'GUEST';

export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SECRETARY_SCREENING'
  | 'ADMIN_REVIEW'
  | 'CHAIR_ASSIGNMENT'
  | 'REVIEWER_ASSIGNMENT'
  | 'SCIENTIFIC_REVIEW'
  | 'ETHICS_REVIEW'
  | 'COMMITTEE_MEETING'
  | 'APPROVED'
  | 'REVISIONS_REQUIRED'
  | 'REJECTED'
  | 'MONITORED'
  | 'CLOSED';

export type StudyType =
  | 'CLINICAL_TRIAL'
  | 'EPIDEMIOLOGICAL'
  | 'COMMUNITY_BASED'
  | 'HEALTH_SYSTEMS'
  | 'BEHAVIORAL'
  | 'SECONDARY_DATA'
  | 'GENETIC'
  | 'QUALITATIVE';

export type RiskLevel = 'MINIMAL_RISK' | 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK';

export type Language = 'en' | 'om' | 'am';

export type CalendarType = 'GC' | 'EC';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  department?: string;
  institution?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  customPermissions?: string[];
  signatureUrl?: string;
  twoFactorEnabled?: boolean;
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  forcePasswordChange?: boolean;
  password?: string;
}

export interface EthicsChecklist {
  humanSubjects: boolean;
  animalStudy: boolean;
  clinicalTrial: boolean;
  secondaryData: boolean;
  geneticResearch: boolean;
  biologicalSamples: boolean;
  vulnerablePopulation: {
    children: boolean;
    pregnantWomen: boolean;
    prisoners: boolean;
    disabled: boolean;
    refugees: boolean;
  };
}

export interface UploadedDocument {
  id: string;
  proposalId?: string;
  name: string;
  fileName?: string;
  type:
    | 'PROPOSAL'
    | 'PROTOCOL'
    | 'CONSENT_FORM'
    | 'QUESTIONNAIRE'
    | 'CV'
    | 'BUDGET'
    | 'GANTT_CHART'
    | 'APPROVAL_LETTER'
    | 'DATA_COLLECTION_TOOL'
    | 'INVESTIGATOR_BROCHURE'
    | 'SUPPORTING_DOC';
  filePath?: string;
  fileType?: string;
  size: string;
  fileSizeBytes?: number;
  uploadedBy?: string;
  uploadedAt: string;
  version: string;
  virusScanned: boolean;
  url?: string;
}

export interface ReviewScoreCard {
  scientificMerit: number; // 1-10
  ethicalPrinciples: number; // 1-10
  riskBenefitRatio: number; // 1-10
  confidentialityProtection: number; // 1-10
  informedConsentQuality: number; // 1-10
  communityEngagement: number; // 1-10
}

export interface ReviewItem {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  conflictOfInterestDeclared: boolean;
  hasConflict: boolean;
  assignedAt: string;
  completedAt?: string;
  recommendation?: 'APPROVE' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
  scoreCard?: ReviewScoreCard;
  comments?: string;
  confidentialNotes?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface ProposalAgreement {
  id?: string;
  proposalId?: string;
  userId: string;
  accepted: boolean;
  acceptedDate: string;
  ipAddress: string;
  agreementText?: string;
}

export interface Submission {
  id: string;
  refNo: string;
  title: string;
  abstract: string;
  keywords: string[];
  studyType: StudyType;
  fundingSource: string;
  sponsor: string;
  // Research Information
  introduction?: string;
  justification?: string;
  goalsObjectives?: string;
  studyDesign?: string;
  // Participant Information
  gender?: string;
  targetSampleSize?: number;
  minimumAge?: number;
  maximumAge?: number;
  sampleSizeJustification?: string;
  // Eligibility Criteria
  inclusionCriteria?: string;
  exclusionCriteria?: string;
  // Timeline
  initialRecruitmentDate?: string;
  // Research Details
  interventions?: string;
  primaryOutcome?: string;
  // Financial Information
  primarySponsor?: string;
  // Documentation
  bibliography?: string;
  // Contact Information
  scientificContact?: string;
  // Terms and Conditions Agreement
  agreement?: ProposalAgreement;

  principalInvestigator: {
    name: string;
    email: string;
    phone: string;
    institution: string;
    department: string;
  };
  coInvestigators: {
    name: string;
    email: string;
    role: string;
    institution: string;
  }[];
  region: string;
  zone: string;
  woreda: string;
  town?: string;
  facility_name?: string;
  region_id?: number | null;
  zone_id?: number | null;
  woreda_id?: number | null;
  town_id?: number | null;
  health_facility_id?: number | null;
  studyDurationMonths: number;
  budgetETB: number;
  status: SubmissionStatus;
  riskLevel: RiskLevel;
  submittedAt: string;
  updatedAt: string;
  ethicsChecklist: EthicsChecklist;
  documents: UploadedDocument[];
  reviews: ReviewItem[];
  declarationSigned: boolean;
  digitalSignatureName: string;
  aiAuditResult?: {
    completenessScore: number;
    flaggedIssues: string[];
    recommendations: string[];
    consentFormPresent: boolean;
    riskAssessmentNote: string;
    evaluatedAt: string;
  };
  approvalCertificate?: {
    refNo: string;
    approvalDate: string;
    expiryDate: string;
    signatureName: string;
    qrCodeUrl: string;
    verificationUrl: string;
  };
}

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  protocolIds: string[];
  attendees: {
    userId: string;
    name: string;
    role: string;
    attended?: boolean;
  }[];
  discussionNotes?: string;
  minutes?: string;
  votes?: {
    submissionId: string;
    userId: string;
    vote: 'APPROVE' | 'REVISE' | 'REJECT' | 'ABSTAIN';
  }[];
}

export interface ProgressReport {
  id: string;
  submissionId: string;
  refNo: string;
  title: string;
  piName: string;
  type: 'ANNUAL_RENEWAL' | 'SITE_MONITORING' | 'ADVERSE_EVENT' | 'PROTOCOL_DEVIATION' | 'FINAL_REPORT';
  submittedDate: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED';
  summary: string;
  participantsEnrolled: number;
  adverseEventsCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'SUBMISSION' | 'REVIEW' | 'MEETING' | 'APPROVAL' | 'ALERT';
  linkId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  ipAddress: string;
  browser: string;
  oldValue?: string;
  newValue?: string;
}

export interface SmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  smtpSecurity: 'SSL' | 'TLS' | 'NONE';
  smtpFromName: string;
  smtpFromEmail: string;
  smtpReplyToEmail?: string;
}

export interface BrandingSettings {
  login_page_logo?: string;
  header_logo?: string;
  sidebar_logo?: string;
  dashboard_logo?: string;
  public_page_logo?: string;
  certificate_logo?: string;
  pdf_report_logo?: string;
  email_template_logo?: string;
  favicon?: string;
  loading_logo?: string;
  certificate_stamp?: string;
  stamp_enabled?: boolean;
  stamp_size?: number;
  stamp_opacity?: number;
  stamp_position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  signature_image?: string;
  signatory_name?: string;
  signatory_title?: string;
  cache_version?: number;

  // ODMC Branding & Information
  organization_name?: string;
  organization_short_name?: string;
  about_organization?: string;
  mission?: string;
  vision?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  office_address?: string;
  organization_logo?: string;
  organization_banner?: string;
  developed_by_text?: string;
}

export interface SystemSettings {
  systemName?: string;
  organizationName?: string;
  organizationShortName?: string;
  aboutOrganization?: string;
  mission?: string;
  vision?: string;
  websiteUrl?: string;
  institutionName: string;
  institutionAfaanOromo: string;
  institutionAmharic: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  irbCode: string;
  meetingFrequency: string;
  standardReviewDays: number;
  aiAssistEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  smtpConfig?: SmtpConfig;
  brandingSettings?: BrandingSettings;
}

export interface StoredCertificate {
  id: string;
  certNo: string;
  protocolId: string;
  refNo: string;
  researchTitle: string;
  principalInvestigator: string;
  institution: string;
  approvalDate: string;
  expiryDate: string;
  irbDecision: string;
  qrCodeUrl: string;
  signatureName: string;
  signatoryTitle?: string;
  officialStampUrl?: string;
  generatedDate: string;
  generatedBy: string;
  status: 'ACTIVE' | 'REGENERATED' | 'REVOKED';
  version: number;
}

export interface RegionRecord {
  id: number;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface ZoneRecord {
  id: number;
  region_id: number;
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface WoredaRecord {
  id: number;
  zone_id: number;
  name: string;
  type: 'Woreda' | 'Town Administration';
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface TownRecord {
  id: number;
  woreda_id: number;
  name: string;
  sub_city: string | null;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface HealthFacilityRecord {
  id: number;
  region_id: number;
  zone_id: number;
  woreda_id: number;
  town_id: number | null;
  facility_name: string;
  facility_type: string;
  ownership: string;
  kebele: string | null;
  status: 'Active' | 'Inactive';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export interface LocationImportStats {
  regionsImported: number;
  zonesImported: number;
  woredasImported: number;
  townsImported: number;
  facilitiesImported: number;
  errorsCount: number;
  status: 'Completed' | 'In Progress' | 'Failed';
  lastImportDate: string;
}

export interface TableStat {
  tableName: string;
  recordCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  status: 'OPTIMAL' | 'WARNING' | 'REPAIRED';
  hasPrimaryKeys: boolean;
  indexedFields: string[];
}

export interface DatabaseHealthStatus {
  status: 'ONLINE_OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
  connected: boolean;
  engine: string;
  storagePath: string;
  pingLatencyMs: number;
  uptimeSeconds: number;
  totalTables: number;
  totalRecords: number;
  databaseSizeBytes: number;
  databaseSizeFormatted: string;
  memoryUsageMb: number;
  slowQueryCount: number;
  failedTransactionsCount: number;
  lastBackupDate: string;
  lastSchemaCheckDate: string;
  autoReconnected: boolean;
  tables: TableStat[];
}

export interface DatabaseSchemaValidationResult {
  valid: boolean;
  timestamp: string;
  tablesAuditedCount: number;
  missingTables: string[];
  missingColumns: Array<{ table: string; column: string }>;
  fixedCount: number;
  details: string[];
}

export interface DatabaseIntegrityCheckResult {
  valid: boolean;
  timestamp: string;
  checkedRelationshipsCount: number;
  brokenRelationshipsCount: number;
  repairedCount: number;
  issues: Array<{ relation: string; issue: string; severity: 'HIGH' | 'MEDIUM' | 'LOW' }>;
}

export interface DatabaseFileValidationResult {
  valid: boolean;
  timestamp: string;
  totalFilesCount: number;
  verifiedCount: number;
  missingFilesCount: number;
  missingFilesList: Array<{ docId: string; fileName: string; proposalRef: string }>;
}

export interface DatabaseBackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  sizeFormatted: string;
  type: 'AUTOMATED' | 'MANUAL' | 'PRE_RESTORE_SAFETY';
  recordsCount: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  downloadUrl?: string;
  restoredAt?: string;
}

