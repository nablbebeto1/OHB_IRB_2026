import React, { useState } from 'react';
import {
  Submission,
  StudyType,
  RiskLevel,
  EthicsChecklist,
  UploadedDocument,
  Language,
} from '../types';
import { translations } from '../utils/i18n';
import {
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  FileCheck,
  FileCode,
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface SubmissionWizardProps {
  language: Language;
  onSubmitSuccess: (newSubmission: Submission) => void;
  onCancel: () => void;
}

const OROMIA_ZONES = [
  'Jimma Zone',
  'East Shewa Zone',
  'Arsi Zone',
  'West Guji Zone',
  'Bale Zone',
  'Ilu Aba Bora Zone',
  'West Shewa Zone',
  'East Hararghe Zone',
  'West Hararghe Zone',
  'Buno Bedele Zone',
  'Guji Zone',
  'East Wellega Zone',
  'West Wellega Zone',
  'Horo Guduru Wellega Zone',
  'Kellem Wellega Zone',
  'Special Zone Surrounding Finfinnee',
  'Adama Special Zone',
  'Nekemte Special Zone',
];

export const SubmissionWizard: React.FC<SubmissionWizardProps> = ({
  language,
  onSubmitSuccess,
  onCancel,
}) => {
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Step 1 State: Research Information
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('Malaria, Public Health, Vector Control');
  const [studyType, setStudyType] = useState<StudyType>('EPIDEMIOLOGICAL');
  const [fundingSource, setFundingSource] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [piName, setPiName] = useState('Dr. Researcher');
  const [piEmail, setPiEmail] = useState('pi@research.org');
  const [piPhone, setPiPhone] = useState('+251 911 234567');
  const [piInstitution, setPiInstitution] = useState('Jimma University');
  const [piDept, setPiDept] = useState('School of Public Health');
  const [zone, setZone] = useState('Jimma Zone');
  const [woreda, setWoreda] = useState('Goma');
  const [durationMonths, setDurationMonths] = useState(12);
  const [budgetETB, setBudgetETB] = useState(750000);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MINIMAL_RISK');

  // Co-Investigators
  const [coInvestigators, setCoInvestigators] = useState<
    { name: string; email: string; role: string; institution: string }[]
  >([]);

  // Step 2 State: Ethics Checklist
  const [ethicsChecklist, setEthicsChecklist] = useState<EthicsChecklist>({
    humanSubjects: true,
    animalStudy: false,
    clinicalTrial: false,
    secondaryData: false,
    geneticResearch: false,
    biologicalSamples: true,
    vulnerablePopulation: {
      children: false,
      pregnantWomen: true,
      prisoners: false,
      disabled: false,
      refugees: false,
    },
  });

  // Step 3 State: Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: 'doc-init-1',
      name: 'Research_Proposal_Full_Text.pdf',
      type: 'PROPOSAL',
      size: '2.8 MB',
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      virusScanned: true,
      url: '#',
    },
    {
      id: 'doc-init-2',
      name: 'Informed_Consent_Form_AfaanOromo.pdf',
      type: 'CONSENT_FORM',
      size: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      virusScanned: true,
      url: '#',
    },
  ]);

  // Step 4 State: Declaration & AI Audit
  const [declarationSigned, setDeclarationSigned] = useState(false);
  const [digitalSignatureName, setDigitalSignatureName] = useState('Dr. Researcher');
  const [aiAuditResult, setAiAuditResult] = useState<{
    completenessScore: number;
    flaggedIssues: string[];
    recommendations: string[];
    consentFormPresent: boolean;
    riskAssessmentNote: string;
    evaluatedAt: string;
  } | null>(null);

  // Co-investigator handler
  const addCoInvestigator = () => {
    setCoInvestigators([
      ...coInvestigators,
      { name: '', email: '', role: 'Co-Investigator', institution: 'Oromia Health Facility' },
    ]);
  };

  const removeCoInvestigator = (idx: number) => {
    setCoInvestigators(coInvestigators.filter((_, i) => i !== idx));
  };

  // Mock File Upload Simulator
  const handleSimulatedUpload = (type: UploadedDocument['type']) => {
    const docName = `${type.replace(/_/g, ' ')}_v1.pdf`;
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}`,
      name: docName,
      type,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      virusScanned: true,
      url: '#',
    };
    setDocuments([...documents, newDoc]);
  };

  // Trigger Gemini AI Completeness Audit
  const runAiCompletenessAudit = async () => {
    setIsAiLoading(true);
    try {
      const docNames = documents.map((d) => d.name);
      const res = await fetch('/api/gemini/completeness-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          studyType,
          ethicsChecklist,
          documentNames: docNames,
          zone,
          riskLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.aiAuditResult) {
        setAiAuditResult(data.aiAuditResult);
      }
    } catch (err) {
      console.error('AI Completeness Audit Error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Form Submission Handler
  const handleSubmit = async () => {
    if (!declarationSigned) {
      alert('Please accept the ethical compliance terms and sign digitally before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title || 'Epidemiological Investigation Protocol',
        abstract,
        keywords: keywords.split(',').map((k) => k.trim()),
        studyType,
        fundingSource: fundingSource || 'Oromia Health Research Fund',
        sponsor: sponsor || 'Oromia Health Bureau',
        principalInvestigator: {
          name: piName,
          email: piEmail,
          phone: piPhone,
          institution: piInstitution,
          department: piDept,
        },
        coInvestigators,
        region: 'Oromia',
        zone,
        woreda,
        studyDurationMonths: durationMonths,
        budgetETB,
        riskLevel,
        ethicsChecklist,
        documents,
        declarationSigned,
        digitalSignatureName,
        aiAuditResult,
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSubmitSuccess(data.data);
      } else {
        alert('Failed to submit protocol: ' + data.message);
      }
    } catch (err: any) {
      alert('Submission error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
      {/* Wizard Header */}
      <div className="bg-[#005BAC] text-white px-6 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Ethical Review Submission Wizard</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1">Submit Research Protocol for Ethical Clearance</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Wizard Stepper Tabs */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between overflow-x-auto">
        {[
          { step: 1, label: '1. Research Info', icon: FileText },
          { step: 2, label: '2. Ethics Checklist', icon: ShieldCheck },
          { step: 3, label: '3. Upload Documents', icon: Upload },
          { step: 4, label: '4. Declaration & AI Audit', icon: CheckCircle },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center space-x-2 text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#005BAC] text-white shadow-xs'
                  : isDone
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
              {isDone && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      {/* Step Contents */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Research Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Step 1: General Research & Investigator Information
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Protocol Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Assessment of Antimicrobial Stewardship and Resistance Patterns in Oromia Referral Hospitals"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Executive Abstract (Objectives, Design, Target Population) *
                </label>
                <textarea
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Summarize background, rationale, methodology, sampling strategy, and expected public health benefits..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Study Type *</label>
                <select
                  value={studyType}
                  onChange={(e) => setStudyType(e.target.value as StudyType)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                >
                  <option value="CLINICAL_TRIAL">Clinical Trial</option>
                  <option value="EPIDEMIOLOGICAL">Epidemiological Study</option>
                  <option value="COMMUNITY_BASED">Community-Based Study</option>
                  <option value="HEALTH_SYSTEMS">Health Systems Research</option>
                  <option value="BEHAVIORAL">Behavioral / Social Study</option>
                  <option value="SECONDARY_DATA">Secondary Data Analysis</option>
                  <option value="GENETIC">Genomic / Genetic Study</option>
                  <option value="QUALITATIVE">Qualitative Study</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Self-Assessed Risk Level</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white font-semibold"
                >
                  <option value="MINIMAL_RISK">Minimal Risk (Questionnaire / Observational)</option>
                  <option value="LOW_RISK">Low Risk (Non-invasive samples)</option>
                  <option value="MODERATE_RISK">Moderate Risk (Interventional / Bio-samples)</option>
                  <option value="HIGH_RISK">High Risk (Investigational drugs / Sensitive populations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none"
                />
              </div>
            </div>

            {/* Geographical Location in Oromia */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#005BAC] mb-1">Oromia Zone *</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                >
                  {OROMIA_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#005BAC] mb-1">Woreda / Location *</label>
                <input
                  type="text"
                  value={woreda}
                  onChange={(e) => setWoreda(e.target.value)}
                  placeholder="e.g. Goma & Seka Chekorsa"
                  className="w-full text-xs p-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#005BAC] mb-1">Duration (Months) & Budget (ETB)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-1/2 text-xs p-2 rounded-lg border border-blue-200 bg-white"
                    placeholder="Months"
                  />
                  <input
                    type="number"
                    value={budgetETB}
                    onChange={(e) => setBudgetETB(Number(e.target.value))}
                    className="w-1/2 text-xs p-2 rounded-lg border border-blue-200 bg-white"
                    placeholder="ETB Budget"
                  />
                </div>
              </div>
            </div>

            {/* Principal Investigator Details */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Principal Investigator (PI) Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">PI Name</label>
                  <input
                    type="text"
                    value={piName}
                    onChange={(e) => setPiName(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">PI Email</label>
                  <input
                    type="email"
                    value={piEmail}
                    onChange={(e) => setPiEmail(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Institution</label>
                  <input
                    type="text"
                    value={piInstitution}
                    onChange={(e) => setPiInstitution(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#005BAC] text-white font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-blue-800 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Continue to Ethics Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Ethics Checklist */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Step 2: Ethical Considerations & Participant Vulnerability Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 border rounded-xl space-y-3 bg-gray-50/50">
                <h4 className="font-bold text-gray-900">Study Scope & Methodologies</h4>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.humanSubjects}
                    onChange={(e) => setEthicsChecklist({ ...ethicsChecklist, humanSubjects: e.target.checked })}
                    className="w-4 h-4 text-[#005BAC]"
                  />
                  <span>Involves Human Subjects / Data Collection</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.clinicalTrial}
                    onChange={(e) => setEthicsChecklist({ ...ethicsChecklist, clinicalTrial: e.target.checked })}
                    className="w-4 h-4 text-[#005BAC]"
                  />
                  <span>Clinical Trial / Drug or Medical Device Interventions</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.biologicalSamples}
                    onChange={(e) => setEthicsChecklist({ ...ethicsChecklist, biologicalSamples: e.target.checked })}
                    className="w-4 h-4 text-[#005BAC]"
                  />
                  <span>Collection / Export of Biological Samples (Blood, Sputum, Tissue)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.geneticResearch}
                    onChange={(e) => setEthicsChecklist({ ...ethicsChecklist, geneticResearch: e.target.checked })}
                    className="w-4 h-4 text-[#005BAC]"
                  />
                  <span>Genomic / DNA Sequencing Analysis</span>
                </label>
              </div>

              <div className="p-4 border border-amber-200 rounded-xl space-y-3 bg-amber-50/40">
                <h4 className="font-bold text-amber-900 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Vulnerable Populations Involved</span>
                </h4>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.vulnerablePopulation.children}
                    onChange={(e) =>
                      setEthicsChecklist({
                        ...ethicsChecklist,
                        vulnerablePopulation: { ...ethicsChecklist.vulnerablePopulation, children: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600"
                  />
                  <span>Children / Minors (Under 18 years - Assent required)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.vulnerablePopulation.pregnantWomen}
                    onChange={(e) =>
                      setEthicsChecklist({
                        ...ethicsChecklist,
                        vulnerablePopulation: { ...ethicsChecklist.vulnerablePopulation, pregnantWomen: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600"
                  />
                  <span>Pregnant or Lactating Women</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.vulnerablePopulation.prisoners}
                    onChange={(e) =>
                      setEthicsChecklist({
                        ...ethicsChecklist,
                        vulnerablePopulation: { ...ethicsChecklist.vulnerablePopulation, prisoners: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600"
                  />
                  <span>Prisoners or Institutionalized Persons</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ethicsChecklist.vulnerablePopulation.refugees}
                    onChange={(e) =>
                      setEthicsChecklist({
                        ...ethicsChecklist,
                        vulnerablePopulation: { ...ethicsChecklist.vulnerablePopulation, refugees: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-amber-600"
                  />
                  <span>Refugees / Internally Displaced Persons (IDPs)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#005BAC] text-white font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-blue-800 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Continue to Upload Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Upload Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Step 3: Upload Dossier Documents & Protocol Attachments (PDF only)
            </h3>

            {/* Upload Buttons Palette */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                onClick={() => handleSimulatedUpload('PROPOSAL')}
                className="p-3 border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 rounded-xl font-bold text-[#005BAC] flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>+ Upload Proposal</span>
              </button>

              <button
                onClick={() => handleSimulatedUpload('CONSENT_FORM')}
                className="p-3 border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 rounded-xl font-bold text-emerald-800 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>+ Consent Form</span>
              </button>

              <button
                onClick={() => handleSimulatedUpload('QUESTIONNAIRE')}
                className="p-3 border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100 rounded-xl font-bold text-purple-800 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>+ Questionnaire</span>
              </button>

              <button
                onClick={() => handleSimulatedUpload('CV')}
                className="p-3 border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-xl font-bold text-gray-700 flex flex-col items-center justify-center space-y-1 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>+ Investigator CV</span>
              </button>
            </div>

            {/* Documents List */}
            <div className="border rounded-xl divide-y overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase flex justify-between">
                <span>Document Title</span>
                <span>Security & Virus Scan</span>
              </div>
              {documents.map((doc) => (
                <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[10px]">
                      PDF
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{doc.name}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                        <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{doc.type}</span>
                        <span>Size: {doc.size}</span>
                        <span>v{doc.version}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Virus Scanned</span>
                    </span>
                    <button
                      onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                      className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-[#005BAC] text-white font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-blue-800 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Continue to AI Audit & Declaration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Declaration & AI Audit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Step 4: AI Completeness Audit & Digital Ethical Declaration
            </h3>

            {/* AI Completeness Trigger Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h4 className="font-extrabold text-sm">Gemini AI Protocol Completeness Audit</h4>
                </div>
                <button
                  onClick={runAiCompletenessAudit}
                  disabled={isAiLoading}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{aiAuditResult ? 'Re-run AI Completeness Check' : 'Run AI Completeness Audit'}</span>
                    </>
                  )}
                </button>
              </div>

              {aiAuditResult && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs space-y-3 mt-3">
                  <div className="flex items-center justify-between border-b border-white/20 pb-2">
                    <span className="font-bold text-amber-200">AI Completeness Score</span>
                    <span className="text-lg font-extrabold text-emerald-300">{aiAuditResult.completenessScore} / 100</span>
                  </div>

                  {aiAuditResult.flaggedIssues.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-300 block mb-1">Flagged Completeness Issues:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-red-200">
                        {aiAuditResult.flaggedIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiAuditResult.recommendations.length > 0 && (
                    <div>
                      <span className="font-bold text-blue-200 block mb-1">IRB Ethical Recommendations:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-blue-100">
                        {aiAuditResult.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-300 italic">
                    Disclaimer: AI completeness check provides automated decision support for researchers and IRB secretariats. It does not replace human ethical review by the OHB IRB panel.
                  </p>
                </div>
              )}
            </div>

            {/* Ethical Declaration & Signature */}
            <div className="border border-gray-200 p-5 rounded-2xl space-y-4 bg-gray-50/60">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-[#005BAC]" />
                <span>Investigator Ethical Binding Declaration</span>
              </h4>

              <div className="text-xs text-gray-700 leading-relaxed space-y-2 bg-white p-4 rounded-xl border border-gray-200">
                <p>
                  I hereby declare that the research proposal submitted herewith represents original work. I agree to conduct the research in strict compliance with the Declaration of Helsinki, CIOMS guidelines, WHO standards, and the Ethiopian National Health Research Ethics Guideline.
                </p>
                <p>
                  I undertake to obtain informed consent from all participants, safeguard participant confidentiality, report any unexpected adverse events within 24 hours to the OHB IRB secretariat, and seek prior written approval for any protocol modification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Digital Signature (Full Legal Name) *
                  </label>
                  <input
                    type="text"
                    value={digitalSignatureName}
                    onChange={(e) => setDigitalSignatureName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 font-serif italic text-blue-900 font-bold bg-white"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center space-x-2 text-xs font-bold text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationSigned}
                      onChange={(e) => setDeclarationSigned(e.target.checked)}
                      className="w-4 h-4 text-[#005BAC]"
                    />
                    <span>I confirm and digitally sign this ethical submission</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !declarationSigned}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Protocol...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Protocol to OHB IRB Secretariat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
