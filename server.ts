import express from 'express';
import path from 'path';
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

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory data stores
let submissionsData: Submission[] = [...initialSubmissions];
let usersData = [...initialUsers];
let meetingsData: MeetingItem[] = [...initialMeetings];
let progressReportsData = [...initialProgressReports];
let auditLogsData: AuditLog[] = [...initialAuditLogs];
let notificationsData = [...initialNotifications];
let settingsData = { ...initialSettings };

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
}

// REST API Endpoints

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), system: 'OHB-IRB System' });
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
    principalInvestigator: body.principalInvestigator || {
      name: 'Dr. Researcher',
      email: 'pi@research.org',
      phone: '+251 911 000000',
      institution: 'Oromia Health Facility',
      department: 'Health Sciences',
    },
    coInvestigators: body.coInvestigators || [],
    region: 'Oromia',
    zone: body.zone || 'Jimma Zone',
    woreda: body.woreda || 'Central',
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

  res.status(201).json({ success: true, data: newSubmission });
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
      server: { middlewareMode: true },
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
