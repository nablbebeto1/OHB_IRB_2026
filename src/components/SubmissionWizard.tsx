import React, { useState, useRef, useMemo } from 'react';
import {
  Submission,
  StudyType,
  RiskLevel,
  EthicsChecklist,
  UploadedDocument,
  ProposalAgreement,
  Language,
} from '../types';
import { translations } from '../utils/i18n';
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
} from '../data/oromiaLocationData';
import {
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle,
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
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  Paperclip,
  AlertCircle,
  Calendar,
  UserCheck,
  DollarSign,
  BookOpen,
  MapPin,
  Building2,
  Search,
  ChevronDown,
  X,
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

  // 1. Mandatory Research Information
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('Malaria, Public Health, Vector Control');
  const [introduction, setIntroduction] = useState('');
  const [justification, setJustification] = useState('');
  const [goalsObjectives, setGoalsObjectives] = useState('');
  const [studyDesign, setStudyDesign] = useState('');

  // 2. Participant Information
  const [gender, setGender] = useState('All Genders');
  const [targetSampleSize, setTargetSampleSize] = useState<number>(450);
  const [minimumAge, setMinimumAge] = useState<number>(18);
  const [maximumAge, setMaximumAge] = useState<number>(75);
  const [sampleSizeJustification, setSampleSizeJustification] = useState('');

  // 3. Eligibility Criteria
  const [inclusionCriteria, setInclusionCriteria] = useState('');
  const [exclusionCriteria, setExclusionCriteria] = useState('');

  // 4. Timeline & Research Details & Cascading Location
  const [initialRecruitmentDate, setInitialRecruitmentDate] = useState('2026-09-15');
  const [interventions, setInterventions] = useState('');
  const [primaryOutcome, setPrimaryOutcome] = useState('');
  const [studyType, setStudyType] = useState<StudyType>('EPIDEMIOLOGICAL');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MINIMAL_RISK');
  const [durationMonths, setDurationMonths] = useState(12);
  const [budgetETB, setBudgetETB] = useState(750000);

  // Cascading Location Selection State
  const [selectedRegionId, setSelectedRegionId] = useState<number>(1); // Default 1 = Oromia Region
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(13); // Default 13 = Jimma Zone
  const [selectedWoredaId, setSelectedWoredaId] = useState<number | null>(191); // Default 191 = Jimma Town
  const [selectedTownId, setSelectedTownId] = useState<number | null>(23); // Default 23 = Jimma Town Center
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(1); // Default 1 = Jimma University Medical Center
  const [facilitySearchQuery, setFacilitySearchQuery] = useState<string>('');
  const [isFacilityComboboxOpen, setIsFacilityComboboxOpen] = useState<boolean>(false);

  // Cascading Dynamic Location Options
  const availableRegions = regionsTable;
  const availableZones = useMemo(() => getZonesByRegion(selectedRegionId), [selectedRegionId]);
  const availableWoredas = useMemo(() => (selectedZoneId ? getWoredasByZone(selectedZoneId) : []), [selectedZoneId]);
  const availableTowns = useMemo(() => (selectedWoredaId ? getTownsByWoreda(selectedWoredaId) : []), [selectedWoredaId]);

  const availableFacilities = useMemo(() => {
    if (!selectedWoredaId) return [];
    return getHealthFacilities(selectedWoredaId, selectedTownId, facilitySearchQuery);
  }, [selectedWoredaId, selectedTownId, facilitySearchQuery]);

  const selectedZoneObj = useMemo(() => zonesTable.find((z) => z.id === selectedZoneId), [selectedZoneId]);
  const selectedWoredaObj = useMemo(() => woredasTable.find((w) => w.id === selectedWoredaId), [selectedWoredaId]);
  const selectedTownObj = useMemo(() => townsTable.find((t) => t.id === selectedTownId), [selectedTownId]);
  const selectedFacilityObj = useMemo(() => healthFacilitiesTable.find((f) => f.id === selectedFacilityId), [selectedFacilityId]);

  // Cascading Reset Handlers
  const handleRegionSelect = (regionId: number) => {
    setSelectedRegionId(regionId);
    const zones = getZonesByRegion(regionId);
    const nextZoneId = zones.length > 0 ? zones[0].id : null;
    setSelectedZoneId(nextZoneId);

    if (nextZoneId) {
      const woredas = getWoredasByZone(nextZoneId);
      const nextWoredaId = woredas.length > 0 ? woredas[0].id : null;
      setSelectedWoredaId(nextWoredaId);

      if (nextWoredaId) {
        const towns = getTownsByWoreda(nextWoredaId);
        const nextTownId = towns.length > 0 ? towns[0].id : null;
        setSelectedTownId(nextTownId);

        const facilities = getHealthFacilities(nextWoredaId, nextTownId);
        setSelectedFacilityId(facilities.length > 0 ? facilities[0].id : null);
      } else {
        setSelectedTownId(null);
        setSelectedFacilityId(null);
      }
    } else {
      setSelectedWoredaId(null);
      setSelectedTownId(null);
      setSelectedFacilityId(null);
    }
    setFacilitySearchQuery('');
  };

  const handleZoneSelect = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    const woredas = getWoredasByZone(zoneId);
    const nextWoredaId = woredas.length > 0 ? woredas[0].id : null;
    setSelectedWoredaId(nextWoredaId);

    if (nextWoredaId) {
      const towns = getTownsByWoreda(nextWoredaId);
      const nextTownId = towns.length > 0 ? towns[0].id : null;
      setSelectedTownId(nextTownId);

      const facilities = getHealthFacilities(nextWoredaId, nextTownId);
      setSelectedFacilityId(facilities.length > 0 ? facilities[0].id : null);
    } else {
      setSelectedTownId(null);
      setSelectedFacilityId(null);
    }
    setFacilitySearchQuery('');
  };

  const handleWoredaSelect = (woredaId: number) => {
    setSelectedWoredaId(woredaId);
    const towns = getTownsByWoreda(woredaId);
    const nextTownId = towns.length > 0 ? towns[0].id : null;
    setSelectedTownId(nextTownId);

    const facilities = getHealthFacilities(woredaId, nextTownId);
    setSelectedFacilityId(facilities.length > 0 ? facilities[0].id : null);
    setFacilitySearchQuery('');
  };

  const handleTownSelect = (townId: number | null) => {
    setSelectedTownId(townId);
    const facilities = getHealthFacilities(selectedWoredaId, townId);
    setSelectedFacilityId(facilities.length > 0 ? facilities[0].id : null);
    setFacilitySearchQuery('');
  };

  // 5. Financial Information & Documentation
  const [fundingSource, setFundingSource] = useState('Oromia Health Research Fund');
  const [sponsor, setSponsor] = useState('Oromia Health Bureau');
  const [primarySponsor, setPrimarySponsor] = useState('Oromia Health Bureau & WHO Ethiopia');
  const [bibliography, setBibliography] = useState('');
  const [scientificContact, setScientificContact] = useState('');

  // 6. Principal Investigator & Co-Investigators
  const [piName, setPiName] = useState('Dr. Researcher');
  const [piEmail, setPiEmail] = useState('pi@research.org');
  const [piPhone, setPiPhone] = useState('+251 911 234567');
  const [piInstitution, setPiInstitution] = useState('Jimma University');
  const [piDept, setPiDept] = useState('School of Public Health');
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

  // Step 3 State: File Upload System
  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: 'doc-init-1',
      proposalId: '',
      name: 'Research_Proposal_Full_Text.pdf',
      fileName: 'Research_Proposal_Full_Text.pdf',
      type: 'PROPOSAL',
      filePath: '/uploads/doc-init-1_Research_Proposal_Full_Text.pdf',
      fileType: 'application/pdf',
      size: '2.8 MB',
      fileSizeBytes: 2800000,
      uploadedBy: 'Dr. Researcher',
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      virusScanned: true,
      url: '#',
    },
    {
      id: 'doc-init-2',
      proposalId: '',
      name: 'Informed_Consent_Form_AfaanOromo.pdf',
      fileName: 'Informed_Consent_Form_AfaanOromo.pdf',
      type: 'CONSENT_FORM',
      filePath: '/uploads/doc-init-2_Informed_Consent_Form_AfaanOromo.pdf',
      fileType: 'application/pdf',
      size: '1.2 MB',
      fileSizeBytes: 1200000,
      uploadedBy: 'Dr. Researcher',
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      virusScanned: true,
      url: '#',
    },
  ]);

  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<UploadedDocument['type']>('PROPOSAL');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceDocIdRef = useRef<string | null>(null);

  // Step 4 State: Declaration & Agreement
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [declarationSigned, setDeclarationSigned] = useState<boolean>(false);
  const [digitalSignatureName, setDigitalSignatureName] = useState('Dr. Researcher');

  // Co-investigator handlers
  const addCoInvestigator = () => {
    setCoInvestigators([
      ...coInvestigators,
      { name: '', email: '', role: 'Co-Investigator', institution: 'Oromia Health Facility' },
    ]);
  };

  const removeCoInvestigator = (idx: number) => {
    setCoInvestigators(coInvestigators.filter((_, i) => i !== idx));
  };

  // File Upload Processor
  const triggerFileInput = (docType: UploadedDocument['type'], replaceId?: string) => {
    setSelectedDocType(docType);
    replaceDocIdRef.current = replaceId || null;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset input
    await processFileUpload(file, replaceDocIdRef.current);
    replaceDocIdRef.current = null;
  };

  const processFileUpload = async (file: File, replaceId?: string | null) => {
    setUploadError(null);
    const fileName = file.name;
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
    const allowedExts = ['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.jpeg', '.png'];

    if (!allowedExts.includes(ext)) {
      setUploadError(`Invalid file format "${ext}". Allowed formats: PDF, DOC, DOCX, XLSX, JPG, PNG.`);
      return;
    }

    const MAX_BYTES = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_BYTES) {
      setUploadError(`File size exceeds 20MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Select a smaller file.`);
      return;
    }

    setUploading(true);
    setUploadProgress(15);

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? 85 : prev + 25));
    }, 120);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: file.type || `application/${ext.replace('.', '')}`,
          fileSize: file.size,
          docType: selectedDocType,
          uploadedBy: piName || 'Investigator',
        }),
      });

      const data = await res.json();
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (data.success && data.data) {
        setTimeout(() => {
          if (replaceId) {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === replaceId ? { ...data.data, id: replaceId, version: '2.0 (Replaced)' } : doc
              )
            );
          } else {
            setDocuments((prev) => [...prev, data.data]);
          }
          setUploading(false);
          setUploadProgress(0);
        }, 300);
      } else {
        setUploadError(data.message || 'File upload failed validation.');
        setUploading(false);
        setUploadProgress(0);
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      setUploadError('Network error uploading file: ' + err.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`/api/upload/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setDocuments(documents.filter((d) => d.id !== id));
  };

  // Helper icon by file extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    if (ext === '.pdf') return <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-extrabold text-[10px]">PDF</span>;
    if (['.doc', '.docx'].includes(ext)) return <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">DOC</span>;
    if (ext === '.xlsx') return <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">XLSX</span>;
    if (['.jpg', '.jpeg', '.png'].includes(ext)) return <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold text-[10px]">IMG</span>;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  // Final Form Submission Handler
  const handleSubmit = async () => {
    if (!termsAccepted) {
      alert('You must accept the Terms and Conditions investigator agreement before submitting.');
      return;
    }
    if (!declarationSigned) {
      alert('Please confirm and digitally sign the ethical submission declaration.');
      return;
    }
    if (!selectedZoneId) {
      alert('Please select a Zone for the research location.');
      return;
    }
    if (!selectedWoredaId) {
      alert('Please select a Woreda for the research location.');
      return;
    }

    setIsSubmitting(true);
    try {
      const agreement: ProposalAgreement = {
        id: `agr-${Date.now()}`,
        userId: piEmail || 'usr-investigator',
        accepted: termsAccepted,
        acceptedDate: new Date().toISOString(),
        ipAddress: '197.156.98.20',
        agreementText:
          "I acknowledge that I must comply with the requirements and responsibilities as the investigator or professional responsible for this proposal, as set forth in the Committee's Standard Operating Procedures (SOPs). I further acknowledge that I will ensure the research is conducted ethically, in accordance with internationally accepted ethical standards and all applicable national laws and regulations.",
      };

      const zoneName = selectedZoneObj ? selectedZoneObj.name : '';
      const woredaName = selectedWoredaObj ? selectedWoredaObj.name : '';
      const townName = selectedTownObj ? selectedTownObj.name : '';
      const facilityName = selectedFacilityObj ? selectedFacilityObj.facility_name : '';

      const payload = {
        title: title || 'Epidemiological Investigation Protocol',
        abstract,
        keywords: typeof keywords === 'string' ? keywords.split(',').map((k) => k.trim()) : keywords,
        studyType,
        fundingSource: fundingSource || 'Oromia Health Research Fund',
        sponsor: sponsor || 'Oromia Health Bureau',
        // Mandatory Proposal Fields
        introduction,
        justification,
        goalsObjectives,
        studyDesign,
        gender,
        targetSampleSize,
        minimumAge,
        maximumAge,
        sampleSizeJustification,
        inclusionCriteria,
        exclusionCriteria,
        initialRecruitmentDate,
        interventions,
        primaryOutcome,
        primarySponsor: primarySponsor || sponsor,
        bibliography,
        scientificContact,
        agreement,
        principalInvestigator: {
          name: piName,
          email: piEmail,
          phone: piPhone,
          institution: piInstitution,
          department: piDept,
        },
        coInvestigators,
        region: 'Oromia',
        zone: zoneName,
        woreda: woredaName,
        town: townName,
        facility_name: facilityName,
        region_id: selectedRegionId,
        zone_id: selectedZoneId,
        woreda_id: selectedWoredaId,
        town_id: selectedTownId,
        health_facility_id: selectedFacilityId,
        studyDurationMonths: durationMonths,
        budgetETB,
        riskLevel,
        ethicsChecklist,
        documents,
        declarationSigned,
        digitalSignatureName,
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
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf,.doc,.docx,.xlsx,.jpg,.jpeg,.png"
        className="hidden"
      />

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
          { step: 1, label: '1. Proposal Fields', icon: FileText },
          { step: 2, label: '2. Ethics Checklist', icon: ShieldCheck },
          { step: 3, label: '3. File Dossier Upload', icon: Upload },
          { step: 4, label: '4. Terms & Final Submission', icon: CheckCircle },
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
        {/* STEP 1: Research Proposal Information Fields */}
        {currentStep === 1 && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Step 1: Complete Research Proposal Submission Fields
              </h3>
              <span className="text-[10px] bg-blue-50 text-[#005BAC] font-bold px-2 py-1 rounded border border-blue-200">
                OHB IRB Standard Submission Form
              </span>
            </div>

            {/* 1. Research Information */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-[#005BAC]">
                <BookOpen className="w-4 h-4" />
                <span>1. Research Information</span>
              </h4>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Protocol Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Assessment of Antimicrobial Stewardship and Resistance Patterns in Oromia Referral Hospitals"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Executive Abstract *</label>
                  <textarea
                    rows={3}
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder="Summarize background, rationale, methodology, sampling strategy, and expected outcomes..."
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Keywords (Comma Separated)</label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g. AMR, Hospital Infection, Oromia, Clinical Epidemiology"
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Study Design *</label>
                    <input
                      type="text"
                      value={studyDesign}
                      onChange={(e) => setStudyDesign(e.target.value)}
                      placeholder="e.g. Prospective cluster-randomized observational cohort study"
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Introduction</label>
                    <textarea
                      rows={2}
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      placeholder="Background information & disease burden context..."
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Justification / Rationale</label>
                    <textarea
                      rows={2}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Why is this study necessary for Oromia health priority?"
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Goals & Specific Objectives</label>
                    <textarea
                      rows={2}
                      value={goalsObjectives}
                      onChange={(e) => setGoalsObjectives(e.target.value)}
                      placeholder="1. Primary goal. 2. Secondary objective..."
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Participant Information & Eligibility Criteria */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-[#005BAC]">
                <UserCheck className="w-4 h-4" />
                <span>2. Participant Information & Eligibility Criteria</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white"
                  >
                    <option value="All Genders">All Genders (Male & Female)</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Male Only">Male Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Sample Size *</label>
                  <input
                    type="number"
                    value={targetSampleSize}
                    onChange={(e) => setTargetSampleSize(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#005BAC] outline-none bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Minimum Age (Years)</label>
                  <input
                    type="number"
                    value={minimumAge}
                    onChange={(e) => setMinimumAge(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Maximum Age (Years)</label>
                  <input
                    type="number"
                    value={maximumAge}
                    onChange={(e) => setMaximumAge(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sample Size Justification</label>
                <input
                  type="text"
                  value={sampleSizeJustification}
                  onChange={(e) => setSampleSizeJustification(e.target.value)}
                  placeholder="e.g. Statistical power calculation details (95% CI, p=0.5, d=0.05)"
                  className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Inclusion Criteria *</label>
                  <textarea
                    rows={2}
                    value={inclusionCriteria}
                    onChange={(e) => setInclusionCriteria(e.target.value)}
                    placeholder="List explicit participant inclusion requirements..."
                    className="w-full text-xs p-2 rounded-lg border border-emerald-200 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-red-800 mb-1">Exclusion Criteria *</label>
                  <textarea
                    rows={2}
                    value={exclusionCriteria}
                    onChange={(e) => setExclusionCriteria(e.target.value)}
                    placeholder="List explicit exclusion criteria..."
                    className="w-full text-xs p-2 rounded-lg border border-red-200 bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Research Details, Timeline & Financial Information */}
            <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5 text-[#005BAC]">
                <Calendar className="w-4 h-4" />
                <span>3. Timeline, Research Details & Financial Information</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Initial Recruitment Date *</label>
                  <input
                    type="date"
                    value={initialRecruitmentDate}
                    onChange={(e) => setInitialRecruitmentDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Study Duration (Months)</label>
                  <input
                    type="number"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Budget (ETB) *</label>
                  <input
                    type="number"
                    value={budgetETB}
                    onChange={(e) => setBudgetETB(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Interventions / Procedures</label>
                  <input
                    type="text"
                    value={interventions}
                    onChange={(e) => setInterventions(e.target.value)}
                    placeholder="e.g. Diagnostic testing, questionnaire survey, blood smear collection"
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Outcome Measure</label>
                  <input
                    type="text"
                    value={primaryOutcome}
                    onChange={(e) => setPrimaryOutcome(e.target.value)}
                    placeholder="e.g. Reduction in hospital-acquired infection rate at 12 months"
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Funding Source</label>
                  <input
                    type="text"
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Primary Sponsor</label>
                  <input
                    type="text"
                    value={primarySponsor}
                    onChange={(e) => setPrimarySponsor(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Study Type & Risk Level</label>
                  <div className="flex space-x-2">
                    <select
                      value={studyType}
                      onChange={(e) => setStudyType(e.target.value as StudyType)}
                      className="w-1/2 text-xs p-2 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value="CLINICAL_TRIAL">Clinical Trial</option>
                      <option value="EPIDEMIOLOGICAL">Epidemiological</option>
                      <option value="COMMUNITY_BASED">Community Based</option>
                      <option value="HEALTH_SYSTEMS">Health Systems</option>
                      <option value="BEHAVIORAL">Behavioral</option>
                      <option value="SECONDARY_DATA">Secondary Data</option>
                      <option value="GENETIC">Genomic</option>
                    </select>

                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                      className="w-1/2 text-xs p-2 rounded-lg border border-gray-300 bg-white font-semibold"
                    >
                      <option value="MINIMAL_RISK">Minimal Risk</option>
                      <option value="LOW_RISK">Low Risk</option>
                      <option value="MODERATE_RISK">Moderate Risk</option>
                      <option value="HIGH_RISK">High Risk</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cascading Oromia Research Location Selection */}
              <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                  <div className="flex items-center space-x-2 text-[#005BAC]">
                    <MapPin className="w-4 h-4" />
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      Oromia Research Location & Health Facility Selection
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    Cascading System • {availableZones.length} Zones, {availableWoredas.length} Woredas
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Region */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Region *</label>
                    <select
                      value={selectedRegionId}
                      onChange={(e) => handleRegionSelect(parseInt(e.target.value, 10))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-bold text-gray-900"
                    >
                      {availableRegions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Zone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Zone *</label>
                    <select
                      value={selectedZoneId || ''}
                      onChange={(e) => handleZoneSelect(parseInt(e.target.value, 10))}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-bold text-blue-950"
                    >
                      {availableZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Woreda */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Woreda * <span className="text-gray-400 font-normal">({availableWoredas.length})</span>
                    </label>
                    <select
                      value={selectedWoredaId || ''}
                      onChange={(e) => handleWoredaSelect(parseInt(e.target.value, 10))}
                      disabled={availableWoredas.length === 0}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-semibold text-gray-900 disabled:bg-gray-100"
                    >
                      {availableWoredas.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} {w.type ? `(${w.type})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. Town / Sub-city */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Town / Sub-city <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={selectedTownId || ''}
                      onChange={(e) => handleTownSelect(e.target.value ? parseInt(e.target.value, 10) : null)}
                      disabled={availableTowns.length === 0}
                      className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-medium text-gray-800 disabled:bg-gray-100"
                    >
                      <option value="">-- All / Not Applicable --</option>
                      {availableTowns.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.sub_city ? `- ${t.sub_city}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 5. Searchable Health Facility Combobox */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-[#005BAC]" />
                      <span>Health Facility / Primary Site *</span>
                    </label>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {availableFacilities.length} facilities found in selected area
                    </span>
                  </div>

                  <div
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 hover:border-blue-400 transition-colors"
                    onClick={() => setIsFacilityComboboxOpen(!isFacilityComboboxOpen)}
                  >
                    <div className="flex items-center space-x-2 overflow-hidden text-xs">
                      {selectedFacilityObj ? (
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="font-extrabold text-gray-900">{selectedFacilityObj.facility_name}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded border border-blue-200">
                            {selectedFacilityObj.facility_type}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            {selectedFacilityObj.ownership}
                          </span>
                          {selectedFacilityObj.kebele && (
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                              {selectedFacilityObj.kebele}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium">Click to select or search health facility...</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      {selectedFacilityId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacilityId(null);
                            setFacilitySearchQuery('');
                          }}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded hover:bg-gray-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>

                  {/* Dropdown Search Panel */}
                  {isFacilityComboboxOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl p-2.5 space-y-2 max-h-72 flex flex-col">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          value={facilitySearchQuery}
                          onChange={(e) => setFacilitySearchQuery(e.target.value)}
                          placeholder="Type to search facility name, type (Hospital, Health Center, Health Post), or ownership..."
                          className="w-full text-xs pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="overflow-y-auto flex-1 space-y-1 divide-y divide-gray-100 pr-1">
                        {availableFacilities.length > 0 ? (
                          availableFacilities.map((fac) => (
                            <div
                              key={fac.id}
                              onClick={() => {
                                setSelectedFacilityId(fac.id);
                                setIsFacilityComboboxOpen(false);
                              }}
                              className={`p-2 rounded-lg cursor-pointer transition-colors text-xs flex items-center justify-between ${
                                selectedFacilityId === fac.id
                                  ? 'bg-blue-50 border border-blue-300 font-semibold'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div>
                                <p className="font-bold text-gray-900">{fac.facility_name}</p>
                                <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-gray-600">
                                  <span className="font-bold text-blue-800">{fac.facility_type}</span>
                                  <span>•</span>
                                  <span>{fac.ownership}</span>
                                  {fac.kebele && (
                                    <>
                                      <span>•</span>
                                      <span className="text-gray-500">{fac.kebele}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {selectedFacilityId === fac.id && <Check className="w-4 h-4 text-[#005BAC]" />}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-500">
                            No health facilities matched your search query in this Woreda/Town.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Scientific Contact Details</label>
                  <input
                    type="text"
                    value={scientificContact}
                    onChange={(e) => setScientificContact(e.target.value)}
                    placeholder="e.g. Dr. Tolosa Megersa, Senior Scientist (+251 911 234567)"
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bibliography / References</label>
                  <input
                    type="text"
                    value={bibliography}
                    onChange={(e) => setBibliography(e.target.value)}
                    placeholder="Key literature references supporting this study..."
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Principal Investigator Credentials */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/40">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Principal Investigator Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">PI Full Name *</label>
                  <input
                    type="text"
                    value={piName}
                    onChange={(e) => setPiName(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">PI Email Address *</label>
                  <input
                    type="email"
                    value={piEmail}
                    onChange={(e) => setPiEmail(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white text-blue-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Affiliated Institution *</label>
                  <input
                    type="text"
                    value={piInstitution}
                    onChange={(e) => setPiInstitution(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#005BAC] text-white font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-blue-800 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
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

        {/* STEP 3: File Upload System */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Step 3: Upload Dossier Documents & Attachments
              </h3>
              <span className="text-[10px] text-gray-500 font-bold">
                Supported: PDF, DOC, DOCX, XLSX, JPG, PNG (Max 20MB)
              </span>
            </div>

            {/* Error Message Alert */}
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button
                  onClick={() => setUploadError(null)}
                  className="text-red-500 font-bold hover:text-red-800 text-xs cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Upload Drag & Drop Dropzone */}
            <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-[#005BAC]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900">Upload Research File or Document</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Secure MIME-type validation & virus scan enabled. Maximum file size: <strong className="text-gray-800">20MB</strong>.
                </p>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="max-w-md mx-auto space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-blue-900">
                    <span>Uploading file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#005BAC] h-full transition-all duration-200 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Document Category Upload Palette */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <button
                  onClick={() => triggerFileInput('PROPOSAL')}
                  className="px-3 py-2 bg-white border border-blue-200 hover:border-blue-400 rounded-lg text-xs font-bold text-[#005BAC] flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Upload Proposal (PDF/DOC)</span>
                </button>

                <button
                  onClick={() => triggerFileInput('CONSENT_FORM')}
                  className="px-3 py-2 bg-white border border-emerald-200 hover:border-emerald-400 rounded-lg text-xs font-bold text-emerald-800 flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Consent Form (PDF/DOC)</span>
                </button>

                <button
                  onClick={() => triggerFileInput('QUESTIONNAIRE')}
                  className="px-3 py-2 bg-white border border-purple-200 hover:border-purple-400 rounded-lg text-xs font-bold text-purple-800 flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Data Collection Tool</span>
                </button>

                <button
                  onClick={() => triggerFileInput('CV')}
                  className="px-3 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-bold text-gray-800 flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Investigator CV</span>
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="border border-gray-200 rounded-xl divide-y overflow-hidden bg-white shadow-xs">
              <div className="px-4 py-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 uppercase flex justify-between">
                <span>Uploaded Research Dossier Files ({documents.length})</span>
                <span>Actions & Security Validation</span>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs italic">
                  No research documents attached yet. Click an upload category above to select files.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getFileIcon(doc.name)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{doc.name}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="bg-blue-50 text-[#005BAC] font-bold px-1.5 py-0.5 rounded border border-blue-100">
                            {doc.type}
                          </span>
                          <span>Size: {doc.size}</span>
                          <span>v{doc.version}</span>
                          <span className="text-gray-400">• {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="hidden sm:flex items-center space-x-1 text-emerald-700 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Virus Scanned</span>
                      </span>

                      <button
                        onClick={() => triggerFileInput(doc.type, doc.id)}
                        className="text-gray-600 hover:text-[#005BAC] bg-gray-100 hover:bg-blue-50 px-2 py-1 rounded border border-gray-200 flex items-center space-x-1 cursor-pointer text-[11px]"
                        title="Replace File"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Replace</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                <span>Continue to Terms & Final Submission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Mandatory Terms & Conditions Agreement & Final Submission */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
              Step 4: Terms & Conditions Agreement, Final Submission
            </h3>

            {/* MANDATORY TERMS AND CONDITIONS AGREEMENT BOX */}
            <div className="border-2 border-amber-300 bg-amber-50/50 p-5 rounded-2xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>Mandatory Investigator Ethical Compliance Terms & Conditions</span>
                </h4>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  REQUIRED TO SUBMIT
                </span>
              </div>

              <div className="text-xs text-amber-950 font-medium leading-relaxed bg-white p-4 rounded-xl border border-amber-200 shadow-xs italic">
                "I acknowledge that I must comply with the requirements and responsibilities as the investigator or professional responsible for this proposal, as set forth in the Committee's Standard Operating Procedures (SOPs). I further acknowledge that I will ensure the research is conducted ethically, in accordance with internationally accepted ethical standards and all applicable national laws and regulations."
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-start space-x-3 text-xs font-bold text-gray-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 text-[#005BAC] mt-0.5 rounded cursor-pointer"
                  />
                  <span>
                    I confirm acceptance of the investigator agreement & responsibilities under OHB-IRB SOPs. *
                  </span>
                </label>

                {termsAccepted && (
                  <div className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                    <span>• Status: <strong>ACCEPTED</strong></span>
                    <span>• Accepted Date: <strong>{new Date().toLocaleString()}</strong></span>
                    <span>• User ID: <strong>{piEmail || 'usr-investigator'}</strong></span>
                    <span>• Recorded IP: <strong>197.156.98.20</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Investigator Signature */}
            <div className="border border-gray-200 p-5 rounded-2xl space-y-4 bg-gray-50/60">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Investigator Digital Signature
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Digital Signature Name (Full Legal Name) *
                  </label>
                  <input
                    type="text"
                    value={digitalSignatureName}
                    onChange={(e) => setDigitalSignatureName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 font-serif italic text-blue-900 font-bold bg-white"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center space-x-2 font-bold text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationSigned}
                      onChange={(e) => setDeclarationSigned(e.target.checked)}
                      className="w-4 h-4 text-[#005BAC]"
                    />
                    <span>I confirm and digitally sign this ethical protocol submission *</span>
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
                disabled={isSubmitting || !termsAccepted || !declarationSigned}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Research Protocol...</span>
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
