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
}

export interface SystemSettings {
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
}
