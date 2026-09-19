import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicalNote, MedicalNoteCategory, MedicalNotePriority, MedicalNoteRequest } from '../../types';
import {
  ClipboardList,
  Pin,
  PinOff,
  Stethoscope,
  AlertTriangle,
  Activity,
  CalendarClock,
  Pill,
  CheckCircle2,
  Trash2,
  Edit3,
  Printer,
  Copy,
  Check,
  Search,
  Plus,
  X,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  Tag,
  FileText,
  FileCheck,
  Calendar,
  Building,
  Clock,
  Award,
  Send,
  FileQuestion,
  XCircle,
  MessageSquareQuote,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { MedicalLeaveCertificateModal } from './MedicalLeaveCertificateModal';
import { RequestMedicalNoteModal } from './RequestMedicalNoteModal';

interface MedicalNotesSectionProps {
  patientUid?: string;
  patientName?: string;
  readOnly?: boolean;
  initialTab?: 'notes' | 'requests';
}

export const MedicalNotesSection: React.FC<MedicalNotesSectionProps> = ({
  patientUid,
  patientName,
  readOnly = false,
  initialTab = 'notes'
}) => {
  const {
    currentUser,
    patientProfile,
    doctorProfile,
    medicalNotes,
    medicalNoteRequests,
    respondToMedicalNoteRequest,
    addMedicalNote,
    updateMedicalNote,
    deleteMedicalNote,
    togglePinMedicalNote
  } = useApp();

  const isPatient = currentUser?.role === 'patient';
  const isDoctor = currentUser?.role === 'doctor';

  const [sectionTab, setSectionTab] = useState<'notes' | 'requests'>(initialTab);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [fulfillingRequest, setFulfillingRequest] = useState<MedicalNoteRequest | null>(null);
  const [rejectModalRequest, setRejectModalRequest] = useState<MedicalNoteRequest | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('all');

  // Active target patient
  const targetPatientUid = patientUid || currentUser?.uid || patientProfile?.uid || 'patient_demo';
  const targetPatientName = patientName || patientProfile?.name || currentUser?.name || 'Patient';
  const verifiedCnic = useMemo(() => {
    return patientProfile?.cnic || currentUser?.cnic || '35201-1234567-8';
  }, [patientProfile?.cnic, currentUser?.cnic]);

  // Current month key e.g. "2026-09"
  const currentMonthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentMonthName = useMemo(() => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MedicalNote | null>(null);
  const [printNote, setPrintNote] = useState<MedicalNote | null>(null);
  const [selectedCertificateNote, setSelectedCertificateNote] = useState<MedicalNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for New / Edit Note
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MedicalNoteCategory>('clinical_observation');
  const [formPriority, setFormPriority] = useState<MedicalNotePriority>('routine');
  const [formContent, setFormContent] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTags, setFormTags] = useState('');
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [formBp, setFormBp] = useState('');
  const [formPulse, setFormPulse] = useState('');
  const [formTemp, setFormTemp] = useState('');
  const [formSugar, setFormSugar] = useState('');
  const [formSpo2, setFormSpo2] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Medical Leave specific form states
  const [formPatientCnic, setFormPatientCnic] = useState('');
  const [formLeaveStartDate, setFormLeaveStartDate] = useState('');
  const [formLeaveEndDate, setFormLeaveEndDate] = useState('');
  const [formLeaveReason, setFormLeaveReason] = useState('');
  const [formLeaveEmployer, setFormLeaveEmployer] = useState('');
  const [formLeaveResumptionDate, setFormLeaveResumptionDate] = useState('');

  // Scope notes to the active target patient
  const patientNotes = useMemo(() => {
    return (medicalNotes || []).filter(note => {
      if (currentUser?.uid === 'patient_demo' || targetPatientUid === 'patient_demo') {
        return true;
      }
      return note.patient_uid === targetPatientUid || 
             (note.patient_name && targetPatientName && note.patient_name.toLowerCase() === targetPatientName.toLowerCase());
    });
  }, [medicalNotes, targetPatientUid, targetPatientName, currentUser?.uid]);

  // Monthly Medical Leave Notes & Cap Calculation (Max 2 per month for verified CNIC)
  const patientMonthlyLeaveNotes = useMemo(() => {
    const cleanTargetCnic = verifiedCnic.replace(/[^0-9]/g, '');
    return (medicalNotes || []).filter(note => {
      if (note.category !== 'medical_leave') return false;
      const noteDate = (note.leave_details?.start_date || note.created_at || '').slice(0, 7);
      if (noteDate !== currentMonthKey) return false;

      const noteCnicDigits = (note.patient_cnic || note.leave_details?.patient_cnic || '').replace(/[^0-9]/g, '');
      if (noteCnicDigits && cleanTargetCnic && noteCnicDigits === cleanTargetCnic) {
        return true;
      }
      return note.patient_uid === targetPatientUid;
    });
  }, [medicalNotes, verifiedCnic, targetPatientUid, currentMonthKey]);

  const monthlyLeaveCount = patientMonthlyLeaveNotes.length;
  const isLeaveCapReached = monthlyLeaveCount >= 2;
  const remainingLeaveQuota = Math.max(0, 2 - monthlyLeaveCount);

  // Auto-calculated days for leave
  const calculatedLeaveDays = useMemo(() => {
    if (!formLeaveStartDate || !formLeaveEndDate) return 1;
    const start = new Date(formLeaveStartDate);
    const end = new Date(formLeaveEndDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [formLeaveStartDate, formLeaveEndDate]);

  // Filter notes by search, category, priority, and sort (pinned first, then newest)
  const filteredNotes = useMemo(() => {
    return patientNotes
      .filter(note => {
        if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;
        if (selectedPriority !== 'all' && note.priority !== selectedPriority) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchAuthor = note.author_name.toLowerCase().includes(q);
          const matchTags = note.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchAuthor && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [patientNotes, selectedCategory, selectedPriority, searchQuery]);

  // Scoped requests for patient
  const myRequests = useMemo(() => {
    return (medicalNoteRequests || []).filter(
      r => r.patient_uid === currentUser?.uid || r.patient_uid === 'patient_demo' || r.patient_uid === targetPatientUid
    );
  }, [medicalNoteRequests, currentUser?.uid, targetPatientUid]);

  const patientPendingRequestsCount = useMemo(() => {
    return myRequests.filter(r => r.status === 'pending').length;
  }, [myRequests]);

  // Scoped requests for doctor
  const doctorIncomingRequests = useMemo(() => {
    return (medicalNoteRequests || []).filter(
      r => r.doctor_uid === doctorProfile?.uid || isDoctor
    );
  }, [medicalNoteRequests, doctorProfile?.uid, isDoctor]);

  const doctorPendingRequestsCount = useMemo(() => {
    return doctorIncomingRequests.filter(r => r.status === 'pending').length;
  }, [doctorIncomingRequests]);

  // Doctor: review & fulfill note request
  const handleFulfillRequest = (req: MedicalNoteRequest) => {
    setEditingNote(null);
    setFulfillingRequest(req);

    if (req.note_type === 'medical_leave') {
      setFormTitle(`Official Medical Leave Certificate - ${req.reason.slice(0, 35)}`);
      setFormCategory('medical_leave');
      setFormPriority(req.urgency === 'urgent' ? 'urgent' : 'important');
      setFormLeaveReason(req.reason);
      setFormLeaveEmployer(req.employer_institution || 'To Whom It May Concern / Employer HR');
      setFormLeaveStartDate(req.leave_start_date || new Date().toISOString().slice(0, 10));
      setFormLeaveEndDate(req.leave_end_date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      const resumD = new Date(req.leave_end_date || Date.now() + 3 * 24 * 60 * 60 * 1000);
      resumD.setDate(resumD.getDate() + 1);
      setFormLeaveResumptionDate(resumD.toISOString().slice(0, 10));
      setFormPatientCnic(req.patient_cnic || verifiedCnic);
      setFormContent(
        `Clinical Evaluation & Assessment:\nPatient examined and clinical history reviewed. Presenting condition / reason: ${req.reason}.\n\nMedical Recommendation:\nPatient clinically advised strict convalescence and complete bed rest from ${req.leave_start_date || 'indicated start'} to ${req.leave_end_date || 'indicated end'}. Excusal from work or university duties recommended to facilitate recovery.`
      );
      setFormTags('Medical Leave, Work Excusal, PMC Verified');
    } else {
      const typeTitles: Record<string, string> = {
        fitness_certificate: `Medical Fitness Certificate - ${req.patient_name}`,
        clinical_summary: `Clinical Treatment Summary - ${req.patient_name}`,
        prescription_refill: `Prescription Refill Authorization - ${req.patient_name}`,
        follow_up: `Post-Treatment Advisory Note - ${req.patient_name}`
      };
      setFormTitle(typeTitles[req.note_type] || `Doctor Clinical Statement - ${req.patient_name}`);
      setFormCategory(
        req.note_type === 'prescription_refill'
          ? 'medication'
          : req.note_type === 'follow_up'
          ? 'follow_up'
          : 'clinical_observation'
      );
      setFormPriority(req.urgency === 'urgent' ? 'urgent' : 'routine');
      setFormContent(
        `Clinical Summary for ${req.patient_name} (CNIC: ${req.patient_cnic || verifiedCnic}):\nRequest Context: ${req.reason}\n\nClinical Assessment:\nPatient vital signs and medical history reviewed. Assessment indicates stable clinical parameters conforming to medical requirements.\n\nPhysician Instructions:\nPatient advised to continue prescribed management plan and report back if red flag symptoms emerge.`
      );
      setFormTags(
        req.note_type === 'fitness_certificate'
          ? 'Fitness, Health Clearance, PMC Verified'
          : req.note_type === 'prescription_refill'
          ? 'Prescription, Refill, Doctor Authorized'
          : 'Clinical Summary, Doctor Statement'
      );
    }

    setFormIsPinned(false);
    setShowVitalsForm(true);
    setFormBp('120/80');
    setFormPulse('76');
    setFormTemp('98.6');
    setFormSugar('');
    setFormSpo2('98');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Doctor: decline request
  const handleConfirmReject = () => {
    if (!rejectModalRequest) return;
    respondToMedicalNoteRequest(
      rejectModalRequest.id,
      'rejected',
      rejectRemarks.trim() || 'Please book an in-person or live tele-consultation before official medical notes can be issued.'
    );
    setRejectModalRequest(null);
    setRejectRemarks('');
  };

  // Open modal in create mode
  const handleOpenCreate = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormCategory(currentUser?.role === 'doctor' ? 'clinical_observation' : 'symptom_journal');
    setFormPriority('routine');
    setFormContent('');
    setFormIsPinned(false);
    setFormTags('');
    setShowVitalsForm(false);
    setFormBp('');
    setFormPulse('');
    setFormTemp('');
    setFormSugar('');
    setFormSpo2('');
    setFormPatientCnic(verifiedCnic);
    setFormLeaveStartDate(new Date().toISOString().slice(0, 10));
    const end = new Date();
    end.setDate(end.getDate() + 2);
    setFormLeaveEndDate(end.toISOString().slice(0, 10));
    const resum = new Date();
    resum.setDate(resum.getDate() + 3);
    setFormLeaveResumptionDate(resum.toISOString().slice(0, 10));
    setFormLeaveReason('');
    setFormLeaveEmployer('To Whom It May Concern / Operations HR');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEdit = (note: MedicalNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormCategory(note.category);
    setFormPriority(note.priority);
    setFormContent(note.content);
    setFormIsPinned(Boolean(note.is_pinned));
    setFormTags((note.tags || []).join(', '));
    setShowVitalsForm(Boolean(note.vitals && Object.keys(note.vitals).length > 0));
    setFormBp(note.vitals?.bp || '');
    setFormPulse(note.vitals?.pulse ? String(note.vitals.pulse) : '');
    setFormTemp(note.vitals?.temp_f ? String(note.vitals.temp_f) : '');
    setFormSugar(note.vitals?.sugar_mg_dl ? String(note.vitals.sugar_mg_dl) : '');
    setFormSpo2(note.vitals?.spo2 ? String(note.vitals.spo2) : '');
    if (note.leave_details) {
      setFormPatientCnic(note.patient_cnic || note.leave_details.patient_cnic || verifiedCnic);
      setFormLeaveStartDate(note.leave_details.start_date || '');
      setFormLeaveEndDate(note.leave_details.end_date || '');
      setFormLeaveReason(note.leave_details.reason || '');
      setFormLeaveEmployer(note.leave_details.employer_institution || '');
      setFormLeaveResumptionDate(note.leave_details.duty_resumption_date || '');
    } else {
      setFormPatientCnic(note.patient_cnic || verifiedCnic);
    }
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Clinical Templates
  const applyTemplate = (templateType: 'soap' | 'vitals' | 'followup' | 'allergy' | 'leave') => {
    if (templateType === 'soap') {
      setFormTitle('Clinical Progress Note (SOAP)');
      setFormCategory('clinical_observation');
      setFormPriority('routine');
      setFormContent(
        `[Subjective]\nPatient reports: \nSymptoms duration: \n\n[Objective]\nPhysical Exam: \nVitals noted below.\n\n[Assessment]\nPrimary Diagnosis: \nDifferential: \n\n[Plan]\nPrescriptions / Interventions: \nFollow-up timeline: `
      );
      setShowVitalsForm(true);
    } else if (templateType === 'vitals') {
      setFormTitle('Daily Vitals & Symptom Log');
      setFormCategory('symptom_journal');
      setFormPriority('routine');
      setFormContent('Fasting morning vitals recorded at home. Overall feeling well with normal energy levels.');
      setShowVitalsForm(true);
    } else if (templateType === 'followup') {
      setFormTitle('Post-Consultation Care & Action Plan');
      setFormCategory('follow_up');
      setFormPriority('important');
      setFormContent(
        `1. Medication Adherence: Continue prescribed dosages on schedule.\n2. Diet & Lifestyle: Low salt, adequate hydration (2.5L/day).\n3. Red Flags: Return immediately if fever spikes, persistent nausea, or breathing difficulty occurs.\n4. Scheduled Review: In 10 days.`
      );
    } else if (templateType === 'allergy') {
      setFormTitle('Allergy & Adverse Drug Reaction Warning');
      setFormCategory('allergy_warning');
      setFormPriority('urgent');
      setFormContent(
        `CRITICAL ALLERGY ALERT:\nSubstance/Drug: \nReaction Observed: \nOnset & Year: \nContraindicated Drug Classes: `
      );
    } else if (templateType === 'leave') {
      setFormTitle('Official Medical Leave Certificate - Convalescent Rest');
      setFormCategory('medical_leave');
      setFormPriority('important');
      setFormLeaveReason('Post-Viral Fatigue & Convalescent Rest (Platelet Recovery)');
      setFormLeaveEmployer('To Whom It May Concern / Operations HR');
      setFormLeaveStartDate(new Date().toISOString().slice(0, 10));
      const endD = new Date();
      endD.setDate(endD.getDate() + 2);
      setFormLeaveEndDate(endD.toISOString().slice(0, 10));
      const resumD = new Date();
      resumD.setDate(resumD.getDate() + 3);
      setFormLeaveResumptionDate(resumD.toISOString().slice(0, 10));
      setFormContent(
        'Clinical Evaluation: Patient examined presenting with acute viral fatigue and post-febrile convalescence. Clinically advised complete bed rest, adequate hydration, and excusal from professional or academic responsibilities to facilitate recovery.'
      );
      setFormTags('Medical Leave, Work Excusal, PMC Verified');
    }
  };

  // Save Note (Create or Update)
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a note subject/title');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Please enter note observations or content');
      return;
    }

    // Enforce Monthly Cap for Medical Leave Notes (Max 2 per month per verified CNIC)
    if (formCategory === 'medical_leave') {
      if (!editingNote && isLeaveCapReached) {
        setFormError(
          `Monthly Limit Reached: Under PMC and National Health Regulations, a patient with verified CNIC (${verifiedCnic}) cannot receive more than 2 Medical Leave Certificates per calendar month (${currentMonthName}). Cap of 2/2 is already reached.`
        );
        return;
      }
    }

    const vitalsObj: MedicalNote['vitals'] = {};
    if (formBp.trim()) vitalsObj.bp = formBp.trim();
    if (formPulse.trim() && !isNaN(Number(formPulse))) vitalsObj.pulse = Number(formPulse);
    if (formTemp.trim() && !isNaN(Number(formTemp))) vitalsObj.temp_f = Number(formTemp);
    if (formSugar.trim() && !isNaN(Number(formSugar))) vitalsObj.sugar_mg_dl = Number(formSugar);
    if (formSpo2.trim() && !isNaN(Number(formSpo2))) vitalsObj.spo2 = Number(formSpo2);

    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const leaveObj = formCategory === 'medical_leave' ? {
      start_date: formLeaveStartDate || new Date().toISOString().slice(0, 10),
      end_date: formLeaveEndDate || new Date().toISOString().slice(0, 10),
      total_days: calculatedLeaveDays,
      reason: formLeaveReason.trim() || formTitle.trim(),
      patient_cnic: formPatientCnic.trim() || verifiedCnic,
      employer_institution: formLeaveEmployer.trim() || 'To Whom It May Concern / Employer HR',
      duty_resumption_date: formLeaveResumptionDate || formLeaveEndDate || new Date().toISOString().slice(0, 10),
      certificate_number: editingNote?.leave_details?.certificate_number || `MLC-${currentMonthKey.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      monthly_quota_index: editingNote?.leave_details?.monthly_quota_index || (monthlyLeaveCount + 1)
    } : undefined;

    if (editingNote) {
      updateMedicalNote(editingNote.id, {
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        content: formContent.trim(),
        is_pinned: formIsPinned,
        tags: parsedTags,
        vitals: Object.keys(vitalsObj).length > 0 ? vitalsObj : undefined,
        leave_details: leaveObj,
        patient_cnic: leaveObj ? leaveObj.patient_cnic : undefined
      });
    } else {
      const isDoctor = currentUser?.role === 'doctor';
      const createdNote = addMedicalNote({
        patient_uid: fulfillingRequest ? fulfillingRequest.patient_uid : targetPatientUid,
        patient_name: fulfillingRequest ? fulfillingRequest.patient_name : targetPatientName,
        author_uid: currentUser?.uid || (isDoctor ? doctorProfile?.uid || 'doc_1' : 'patient_demo'),
        author_name: isDoctor ? doctorProfile?.name || currentUser?.name || 'Dr. Attending' : currentUser?.name || 'Patient Self-Log',
        author_role: isDoctor ? 'doctor' : 'patient',
        author_pmc: isDoctor ? doctorProfile?.pmc_license_number || 'PMC-VERIFIED' : undefined,
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        content: formContent.trim(),
        is_pinned: formIsPinned,
        tags: parsedTags,
        vitals: Object.keys(vitalsObj).length > 0 ? vitalsObj : undefined,
        leave_details: leaveObj,
        patient_cnic: leaveObj ? leaveObj.patient_cnic : (fulfillingRequest?.patient_cnic || verifiedCnic)
      });

      if (fulfillingRequest) {
        respondToMedicalNoteRequest(
          fulfillingRequest.id,
          'approved',
          'Official medical documentation issued and signed by attending doctor.',
          createdNote.id
        );
        setFulfillingRequest(null);
      }
    }

    setIsCreateModalOpen(false);
    setEditingNote(null);
  };

  // Copy note text
  const handleCopyNote = (note: MedicalNote) => {
    const text = `--- CURALINK MEDICAL NOTE ---\nTitle: ${note.title}\nCategory: ${getCategoryLabel(note.category)}\nPriority: ${note.priority.toUpperCase()}\nAuthor: ${note.author_name} (${note.author_role.toUpperCase()}${note.author_pmc ? ` | PMC: ${note.author_pmc}` : ''})\nDate: ${new Date(note.created_at).toLocaleDateString()}\n\n${note.content}\n${note.vitals ? `\nVitals: ${JSON.stringify(note.vitals)}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category Icon & Label
  const getCategoryInfo = (category: MedicalNoteCategory) => {
    switch (category) {
      case 'clinical_observation':
        return { label: 'Clinical Observation', icon: Stethoscope, color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'follow_up':
        return { label: 'Follow-Up Plan', icon: CalendarClock, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'symptom_journal':
        return { label: 'Symptom Journal', icon: Activity, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'medication':
        return { label: 'Medication', icon: Pill, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'lifestyle_diet':
        return { label: 'Lifestyle & Diet', icon: HeartPulse, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'allergy_warning':
        return { label: 'Allergy / Warning', icon: AlertTriangle, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'medical_leave':
        return { label: 'Medical Leave Certificate', icon: FileCheck, color: 'text-purple-800 bg-purple-50 border-purple-200' };
      default:
        return { label: 'General Note', icon: FileText, color: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  };

  const getCategoryLabel = (category: MedicalNoteCategory) => getCategoryInfo(category).label;

  const getPriorityBadge = (priority: MedicalNotePriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Urgent Priority
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Routine
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner & Primary Action */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isPatient ? "Doctor-Issued Notes & Medical Certificates" : "Clinical Notes & Certification Desk"}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  {patientNotes.length} {patientNotes.length === 1 ? 'Record' : 'Records'}
                </span>
                {isPatient && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Doctor-Authored & PMC Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
                {isPatient
                  ? `Official medical notes, clinical follow-ups, and verified certificates issued by attending doctors for ${targetPatientName}. Need formal documentation? Submit a direct note request below.`
                  : `Author, sign, and issue clinical progress notes, SOAP assessments, and PMC-accredited medical leave certificates for ${targetPatientName}.`}
              </p>
            </div>
          </div>

          {!readOnly && (
            isPatient ? (
              <button
                id="btn-patient-request-note"
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>Request Doctor's Note</span>
              </button>
            ) : (
              <button
                id="btn-add-medical-note"
                onClick={handleOpenCreate}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Medical Note</span>
              </button>
            )
          )}
        </div>

        {/* Section Navigation Sub-Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-100 mt-5 pt-1">
          <button
            id="tab-view-notes"
            onClick={() => setSectionTab('notes')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              sectionTab === 'notes'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{isPatient ? 'Doctor-Issued Notes' : 'Issued Clinical Records'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              sectionTab === 'notes' ? 'bg-teal-100 text-[#0F766E]' : 'bg-gray-100 text-gray-600'
            }`}>
              {filteredNotes.length}
            </span>
          </button>

          <button
            id="tab-view-requests"
            onClick={() => setSectionTab('requests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              sectionTab === 'requests'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>{isPatient ? 'My Note Requests' : 'Patient Note Requests'}</span>
            {(isPatient ? patientPendingRequestsCount : doctorPendingRequestsCount) > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 animate-pulse">
                {isPatient ? patientPendingRequestsCount : doctorPendingRequestsCount} Pending
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                {isPatient ? myRequests.length : doctorIncomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* CONTROLS (Only visible in 'notes' tab) */}
        {sectionTab === 'notes' && (
          <>
            {/* Search & Filter Controls */}
            <div className="mt-4 pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="medical-notes-search"
                  type="text"
                  placeholder="Search by topic, symptom, doctor name, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors bg-gray-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  id="medical-notes-priority-filter"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="all">All Priorities</option>
                  <option value="routine">Routine</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none">
              {[
                { key: 'all', label: 'All Notes' },
                { key: 'medical_leave', label: 'Medical Leave Certificates' },
                { key: 'clinical_observation', label: 'Clinical Observations' },
                { key: 'follow_up', label: 'Follow-Up Plans' },
                { key: 'symptom_journal', label: 'Symptom Journal' },
                { key: 'medication', label: 'Medications' },
                { key: 'allergy_warning', label: 'Allergies & Alerts' }
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat.key
                      ? cat.key === 'medical_leave'
                        ? 'bg-purple-800 text-white shadow-2xs'
                        : 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cat.key === 'medical_leave' && <FileCheck className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                  {cat.key === 'medical_leave' && patientMonthlyLeaveNotes.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat.key ? 'bg-purple-950 text-purple-200' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {patientMonthlyLeaveNotes.length}/2
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Verified CNIC & Monthly Medical Leave Statutory Cap Tracker */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50/80 via-teal-50/40 to-blue-50/60 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-900">
                      Medical Leave Certificates Quota ({currentMonthName})
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified CNIC: {verifiedCnic}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Pakistan Medical Commission (PMC) Regulatory Cap: <strong>Maximum 2 medical leave certificates allowed per month</strong> per verified CNIC to prevent unauthorized leaves.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-xs font-black ${isLeaveCapReached ? 'text-red-700' : 'text-purple-900'}`}>
                      {monthlyLeaveCount} / 2 Used
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLeaveCapReached
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {isLeaveCapReached ? 'Monthly Cap Reached' : `${remainingLeaveQuota} Left`}
                    </span>
                  </div>
                  <div className="w-28 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden ml-auto">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isLeaveCapReached ? 'bg-red-600 w-full' : monthlyLeaveCount === 1 ? 'bg-purple-600 w-1/2' : 'bg-emerald-500 w-0'
                      }`} 
                    />
                  </div>
                </div>

                {!readOnly && (
                  isPatient ? (
                    <button
                      onClick={() => setIsRequestModalOpen(true)}
                      disabled={isLeaveCapReached}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                        isLeaveCapReached
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs cursor-pointer'
                      }`}
                      title={isLeaveCapReached ? 'Monthly limit of 2 leave certificates reached for this verified CNIC' : 'Request official medical leave certificate from doctor'}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isLeaveCapReached ? 'Monthly Cap Reached' : 'Request Medical Leave'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleOpenCreate();
                        setFormCategory('medical_leave');
                        applyTemplate('leave');
                      }}
                      disabled={isLeaveCapReached}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                        isLeaveCapReached
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-purple-700 hover:bg-purple-800 text-white shadow-xs cursor-pointer'
                      }`}
                      title={isLeaveCapReached ? 'Monthly limit of 2 leave notes reached for this verified CNIC' : 'Issue official medical leave note'}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isLeaveCapReached ? 'Monthly Cap Reached' : 'Issue Medical Leave'}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* SECTION VIEW: REQUESTS TAB */}
      {sectionTab === 'requests' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Patient Requests View */}
          {isPatient ? (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">How Note Requests Work</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                      Patients cannot create or self-sign official medical notes. When you submit a request, your consulting doctor reviews your symptoms and issues a PMC-verified certificate or clinical summary directly to your records.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>+ New Note Request</span>
                </button>
              </div>

              {myRequests.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
                    <FileQuestion className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Note Requests Yet</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Need an official medical leave certificate for work/college, a fitness clearance, or a prescription refill authorization? Contact your attending physician with a request.
                  </p>
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="mt-2 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Note from Doctor</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myRequests.map((req) => {
                    const typeLabel = req.note_type === 'medical_leave'
                      ? 'Official Medical Leave Certificate'
                      : req.note_type === 'fitness_certificate'
                      ? 'Medical Fitness Certificate'
                      : req.note_type === 'clinical_summary'
                      ? 'Clinical Treatment Summary'
                      : req.note_type === 'prescription_refill'
                      ? 'Prescription Refill Note'
                      : req.note_type === 'follow_up'
                      ? 'Post-Treatment Advisory'
                      : 'General Doctor Statement';

                    return (
                      <div
                        key={req.id}
                        className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                          req.status === 'pending' ? 'border-amber-200 bg-amber-50/10' : req.status === 'approved' ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
                              {typeLabel}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {req.urgency === 'urgent' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                  Urgent
                                </span>
                              )}
                              {req.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  Pending Doctor
                                </span>
                              ) : req.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approved & Issued
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                  <XCircle className="w-3 h-3" />
                                  Declined
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2 text-xs">
                            <span className="font-bold text-gray-900">{req.doctor_name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{req.doctor_specialty}</span>
                          </div>

                          <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                            <strong className="text-gray-900 font-semibold block mb-0.5">Clinical Reason / Context:</strong>
                            {req.reason}
                          </p>

                          {req.note_type === 'medical_leave' && req.leave_days && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between text-xs text-purple-950">
                              <span className="flex items-center gap-1 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                                {req.leave_start_date} → {req.leave_end_date}
                              </span>
                              <span className="font-bold bg-purple-200/80 px-2 py-0.5 rounded-full text-[11px]">
                                {req.leave_days} Day{req.leave_days > 1 ? 's' : ''} Excusal
                              </span>
                            </div>
                          )}

                          {req.doctor_remarks && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950">
                              <span className="font-bold block mb-0.5 text-blue-900">Doctor's Remark:</span>
                              <p className="text-[11px] leading-relaxed">{req.doctor_remarks}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-gray-400">
                            Requested {new Date(req.created_at).toLocaleDateString()}
                          </span>

                          {req.status === 'approved' && (
                            <button
                              onClick={() => {
                                setSectionTab('notes');
                                if (req.issued_note_id) {
                                  const targetNote = medicalNotes.find(n => n.id === req.issued_note_id);
                                  if (targetNote && targetNote.category === 'medical_leave') {
                                    setSelectedCertificateNote(targetNote);
                                  }
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#0B5C56] bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              <span>View Issued Document</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Doctor Incoming Requests View */
            <div className="space-y-4">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Patient Clinical Documentation Inquiries</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5">
                    Review and authorize formal requests submitted by patients for medical leave excusal, clinical summaries, and health clearance certificates.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setRequestFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                        requestFilterStatus === st
                          ? 'bg-teal-700 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {doctorIncomingRequests.filter(r => requestFilterStatus === 'all' || r.status === requestFilterStatus).length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Patient Requests</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    All patient requests for medical leave, clinical statements, and certificates have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctorIncomingRequests
                    .filter(r => requestFilterStatus === 'all' || r.status === requestFilterStatus)
                    .map((req) => {
                      const isPending = req.status === 'pending';
                      return (
                        <div
                          key={req.id}
                          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                            isPending ? 'border-teal-300 ring-1 ring-teal-100' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-900">{req.patient_name}</span>
                              <span className="text-[11px] font-semibold text-gray-500">CNIC: {req.patient_cnic}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[11px] text-gray-500">Phone: {req.patient_phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {req.urgency === 'urgent' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                  Urgent Request
                                </span>
                              )}
                              {req.status === 'pending' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  Pending Doctor Action
                                </span>
                              ) : req.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approved & Note Created
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                                  <XCircle className="w-3 h-3" />
                                  Declined
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Requested Documentation</span>
                              <p className="font-bold text-gray-900 capitalize">
                                {req.note_type.replace(/_/g, ' ')}
                              </p>
                              {req.employer_institution && (
                                <p className="text-[11px] text-gray-600 flex items-center gap-1">
                                  <Building className="w-3 h-3 text-gray-400" />
                                  {req.employer_institution}
                                </p>
                              )}
                            </div>

                            <div className="space-y-1 md:col-span-2">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Clinical Description & Symptoms</span>
                              <p className="text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                                {req.reason}
                              </p>
                            </div>
                          </div>

                          {req.note_type === 'medical_leave' && (
                            <div className="mt-3 p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-700" />
                                Requested Period: {req.leave_start_date} to {req.leave_end_date}
                              </span>
                              <span className="font-bold text-xs bg-purple-700 text-white px-2.5 py-0.5 rounded-full">
                                {req.leave_days || 1} Days Excusal
                              </span>
                            </div>
                          )}

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="text-[11px] text-gray-400">
                              Submitted {new Date(req.created_at).toLocaleString()}
                            </span>

                            {isPending ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setRejectModalRequest(req)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                  Decline Request
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFulfillRequest(req)}
                                  className="bg-[#0F766E] hover:bg-[#0B5C56] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <FileCheck className="w-3.5 h-3.5" />
                                  <span>Review & Issue Note</span>
                                </button>
                              </div>
                            ) : req.status === 'approved' && req.issued_note_id ? (
                              <button
                                onClick={() => {
                                  setSectionTab('notes');
                                  const n = medicalNotes.find(item => item.id === req.issued_note_id);
                                  if (n && n.category === 'medical_leave') {
                                    setSelectedCertificateNote(n);
                                  }
                                }}
                                className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <span>View Published Document</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION VIEW: NOTES TAB */}
      {sectionTab === 'notes' && (
        <>
          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No medical notes found</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all'
                  ? 'No notes match your current filter criteria. Try resetting search or filters.'
                  : isPatient
                  ? 'No doctor-issued notes or certificates yet. If you need an official certificate or clinical summary, contact your doctor below.'
                  : 'Keep track of clinical findings, doctor remarks, daily vitals, and home observations in one secure place.'}
              </p>
              {!readOnly && (
                isPatient ? (
                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="mt-2 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Medical Note from Doctor</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenCreate}
                    className="mt-2 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Medical Note</span>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const catInfo = getCategoryInfo(note.category);
                const CatIcon = catInfo.icon;
                const isDoctorAuthor = note.author_role === 'doctor';
                const canModify = !readOnly && isDoctor && (currentUser?.uid === note.author_uid || note.author_role === 'doctor');

            return (
              <div
                key={note.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative ${
                  note.is_pinned ? 'border-teal-300 ring-1 ring-teal-100' : 'border-gray-200'
                } ${note.category === 'allergy_warning' ? 'bg-red-50/20' : ''}`}
              >
                <div>
                  {/* Top Bar: Category, Priority, Pin */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${catInfo.color}`}>
                        <CatIcon className="w-3 h-3" />
                        {catInfo.label}
                      </span>
                      {getPriorityBadge(note.priority)}
                    </div>

                    <div className="flex items-center gap-1">
                      {!readOnly && (
                        <button
                          title={note.is_pinned ? 'Unpin note' : 'Pin to top'}
                          onClick={() => togglePinMedicalNote(note.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            note.is_pinned
                              ? 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {note.is_pinned ? <Pin className="w-3.5 h-3.5 fill-teal-700" /> : <PinOff className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {note.title}
                  </h3>

                  {/* Author & Timestamp */}
                  <div className="flex items-center gap-2 mt-1.5 mb-3 text-xs text-gray-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      {isDoctorAuthor ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded text-[11px]">
                          <ShieldCheck className="w-3 h-3 text-[#0F766E]" />
                          {note.author_name}
                          {note.author_pmc && <span className="text-[10px] text-teal-600 font-normal">({note.author_pmc})</span>}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                          <UserIcon className="w-3 h-3 text-gray-500" />
                          {note.author_name} (Self-Log)
                        </span>
                      )}
                    </div>
                    <span>•</span>
                    <span title={note.created_at}>
                      {new Date(note.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {note.updated_at && (
                      <span className="text-[10px] text-gray-400">(edited)</span>
                    )}
                  </div>

                  {/* Content Narrative */}
                  <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100">
                    {note.content}
                  </div>

                  {/* Attached Vitals (if present) */}
                  {note.vitals && Object.keys(note.vitals).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {note.vitals.bp && (
                        <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium">
                          BP: <strong className="text-gray-900">{note.vitals.bp}</strong> mmHg
                        </span>
                      )}
                      {note.vitals.pulse && (
                        <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium">
                          Pulse: <strong className="text-gray-900">{note.vitals.pulse}</strong> bpm
                        </span>
                      )}
                      {note.vitals.sugar_mg_dl && (
                        <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium">
                          Sugar: <strong className="text-gray-900">{note.vitals.sugar_mg_dl}</strong> mg/dL
                        </span>
                      )}
                      {note.vitals.temp_f && (
                        <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium">
                          Temp: <strong className="text-gray-900">{note.vitals.temp_f}</strong>°F
                        </span>
                      )}
                      {note.vitals.spo2 && (
                        <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium">
                          SpO2: <strong className="text-gray-900">{note.vitals.spo2}</strong>%
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          <Tag className="w-2.5 h-2.5 text-gray-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Medical Leave Details Card (if category is medical_leave) */}
                  {note.category === 'medical_leave' && (
                    <div className="mt-3.5 p-3.5 bg-gradient-to-br from-purple-50 via-teal-50/40 to-blue-50/50 rounded-xl border border-purple-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-purple-950">
                          <Award className="w-4 h-4 text-purple-700" />
                          <span>Official PMC Medical Leave Certificate</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold bg-white text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                          {note.leave_details?.certificate_number || `MLC-${note.id.slice(0, 8)}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 bg-white/80 p-2.5 rounded-lg border border-purple-100">
                        <div>
                          <span className="text-gray-400 block font-medium">Leave Period</span>
                          <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-purple-600" />
                            {note.leave_details?.total_days || 1} Day{(note.leave_details?.total_days || 1) > 1 ? 's' : ''} ({note.leave_details?.start_date || note.created_at.slice(0, 10)} to {note.leave_details?.end_date || note.created_at.slice(0, 10)})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-medium">Verified CNIC</span>
                          <span className="font-mono font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {note.patient_cnic || note.leave_details?.patient_cnic || verifiedCnic}
                          </span>
                        </div>
                        {note.leave_details?.employer_institution && (
                          <div className="col-span-2">
                            <span className="text-gray-400 block font-medium">Addressed To</span>
                            <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-gray-500" />
                              {note.leave_details.employer_institution}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCertificateNote(note)}
                        className="w-full py-2 px-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>View Official Certificate (Printable Slip)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Print, Copy, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyNote(note)}
                      className="hover:text-gray-900 flex items-center gap-1 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Copy note text"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setPrintNote(note)}
                      className="hover:text-gray-900 flex items-center gap-1 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Print / Export slip"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>

                  {canModify && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(note)}
                        className="p-1.5 text-gray-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this medical note?')) {
                            deleteMedicalNote(note.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* CREATE / EDIT NOTE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingNote ? 'Edit Medical Note' : 'Add New Medical Note'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Saving to medical record for <span className="font-semibold text-gray-800">{targetPatientName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Buttons */}
            {!editingNote && (
              <div className="mt-4 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
                <span className="text-[11px] font-bold text-teal-900 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  Quick Clinical Templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('soap')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    SOAP Clinical Note
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('vitals')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Daily Home Vitals Log
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('followup')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white text-teal-900 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Follow-up Action Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('allergy')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Allergy Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('leave')}
                    className="px-2 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3 text-purple-700" />
                    Medical Leave Certificate
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveNote} className="space-y-4 mt-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Monthly Cap Warning in Modal if Medical Leave is Selected */}
              {formCategory === 'medical_leave' && !editingNote && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isLeaveCapReached
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-purple-50 border-purple-200 text-purple-950'
                }`}>
                  <FileCheck className={`w-4 h-4 shrink-0 mt-0.5 ${isLeaveCapReached ? 'text-red-600' : 'text-purple-700'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-bold">
                        {isLeaveCapReached ? 'Monthly Cap Reached (2/2 Used)' : `Monthly Quota: ${monthlyLeaveCount} / 2 Used`}
                      </strong>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white font-mono font-bold">
                        CNIC: {verifiedCnic}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed">
                      {isLeaveCapReached
                        ? `A patient with verified CNIC cannot receive more than 2 medical leave notes in a calendar month (${currentMonthName}) under PMC compliance regulations.`
                        : `This patient can receive ${remainingLeaveQuota} more medical leave certificate(s) this month (${currentMonthName}).`}
                    </p>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Note Subject / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={formCategory === 'medical_leave' ? 'e.g. Official Medical Leave Certificate - Convalescent Rest' : 'e.g. Dengue Recovery Monitoring, Post-Surgery Diet...'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  required
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as MedicalNoteCategory;
                      setFormCategory(newCat);
                      if (newCat === 'medical_leave' && !formTitle) {
                        applyTemplate('leave');
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="clinical_observation">Clinical Observation</option>
                    <option value="medical_leave">Official Medical Leave Certificate</option>
                    <option value="follow_up">Follow-Up Plan</option>
                    <option value="symptom_journal">Symptom Journal</option>
                    <option value="medication">Medication Log</option>
                    <option value="lifestyle_diet">Lifestyle & Diet</option>
                    <option value="allergy_warning">Allergy / Warning</option>
                    <option value="general">General Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as MedicalNotePriority)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  >
                    <option value="routine">Routine</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>
              </div>

              {/* Specialized Medical Leave Certificate Fields */}
              {formCategory === 'medical_leave' && (
                <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-purple-700" />
                      Statutory Medical Certificate Details
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                      PMC Regulatory Slip
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Patient Verified CNIC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="35201-1234567-8"
                        value={formPatientCnic}
                        onChange={(e) => setFormPatientCnic(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs font-mono border border-gray-200 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Addressed To / Employer
                      </label>
                      <input
                        type="text"
                        placeholder="To Whom It May Concern / Operations HR"
                        value={formLeaveEmployer}
                        onChange={(e) => setFormLeaveEmployer(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Leave Start Date</label>
                      <input
                        type="date"
                        value={formLeaveStartDate}
                        onChange={(e) => setFormLeaveStartDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Leave End Date</label>
                      <input
                        type="date"
                        value={formLeaveEndDate}
                        onChange={(e) => setFormLeaveEndDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Total Days</label>
                      <div className="w-full px-3 py-1.5 rounded-lg text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 flex items-center justify-between">
                        <span>{calculatedLeaveDays} Day{calculatedLeaveDays > 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-purple-600 font-normal">Auto-calc</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Diagnosis / Medical Reason
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Post-Viral Fatigue, Convalescent Rest"
                        value={formLeaveReason}
                        onChange={(e) => setFormLeaveReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Fit to Resume Duty Date
                      </label>
                      <input
                        type="date"
                        value={formLeaveResumptionDate}
                        onChange={(e) => setFormLeaveResumptionDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Note Content */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {formCategory === 'medical_leave' ? 'Doctor Clinical Certificate Text / Statement' : 'Clinical Observations & Narrative'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder={formCategory === 'medical_leave' ? 'Enter clinical recommendation, examination findings, and work/academic excusal details...' : 'Record symptoms, advice, dosage adjustments, clinical rationale, or home health progress...'}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-sans"
                  required
                />
              </div>

              {/* Vitals Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowVitalsForm(!showVitalsForm)}
                  className="text-xs font-bold text-[#0F766E] hover:text-[#0B5C56] flex items-center gap-1 cursor-pointer"
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>{showVitalsForm ? 'Hide Vitals Fields' : '+ Attach Vital Signs (BP, Pulse, Sugar)'}</span>
                </button>

                {showVitalsForm && (
                  <div className="mt-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">BP (mmHg)</label>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={formBp}
                        onChange={(e) => setFormBp(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Pulse (bpm)</label>
                      <input
                        type="number"
                        placeholder="75"
                        value={formPulse}
                        onChange={(e) => setFormPulse(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Temp (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="98.6"
                        value={formTemp}
                        onChange={(e) => setFormTemp(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Sugar (mg/dL)</label>
                      <input
                        type="number"
                        placeholder="110"
                        value={formSugar}
                        onChange={(e) => setFormSugar(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">SpO2 (%)</label>
                      <input
                        type="number"
                        placeholder="98"
                        value={formSpo2}
                        onChange={(e) => setFormSpo2(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg text-xs border border-gray-200 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tags and Pin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dengue, Platelets, Hydration"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Pin to Top</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formCategory === 'medical_leave' && !editingNote && isLeaveCapReached}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    formCategory === 'medical_leave' && !editingNote && isLeaveCapReached
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : formCategory === 'medical_leave'
                        ? 'bg-purple-700 hover:bg-purple-800 text-white'
                        : 'bg-[#0F766E] hover:bg-[#0B5C56] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {formCategory === 'medical_leave' && !editingNote && isLeaveCapReached
                      ? 'Monthly Limit Reached (2/2 Used)'
                      : editingNote
                        ? 'Save Changes'
                        : formCategory === 'medical_leave'
                          ? 'Issue Leave Certificate'
                          : 'Save Medical Note'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT / EXPORT SLIP MODAL */}
      {printNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0F766E] flex items-center justify-center text-white text-xs font-bold">
                  CL
                </div>
                <span className="font-bold text-gray-900 text-sm">CuraLink Medical Health Record</span>
              </div>
              <button
                onClick={() => setPrintNote(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 font-sans text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Patient:</span>
                  <span className="font-bold text-gray-900">{printNote.patient_name || targetPatientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Author:</span>
                  <span className="font-bold text-gray-900">
                    {printNote.author_name} ({printNote.author_role.toUpperCase()})
                  </span>
                </div>
                {printNote.author_pmc && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">PMC License:</span>
                    <span className="font-mono text-teal-800 font-bold">{printNote.author_pmc}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Recorded:</span>
                  <span className="text-gray-900">{new Date(printNote.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subject</span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">{printNote.title}</h4>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Clinical Observations</span>
                <p className="mt-1 p-3 rounded-lg bg-gray-50 border border-gray-100 whitespace-pre-line text-gray-800 leading-relaxed">
                  {printNote.content}
                </p>
              </div>

              {printNote.vitals && Object.keys(printNote.vitals).length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Recorded Vitals</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {printNote.vitals.bp && <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">BP: {printNote.vitals.bp}</span>}
                    {printNote.vitals.pulse && <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Pulse: {printNote.vitals.pulse} bpm</span>}
                    {printNote.vitals.temp_f && <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Temp: {printNote.vitals.temp_f}°F</span>}
                    {printNote.vitals.sugar_mg_dl && <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">Sugar: {printNote.vitals.sugar_mg_dl} mg/dL</span>}
                    {printNote.vitals.spo2 && <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">SpO2: {printNote.vitals.spo2}%</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL MEDICAL LEAVE CERTIFICATE MODAL */}
      {selectedCertificateNote && (
        <MedicalLeaveCertificateModal
          isOpen={Boolean(selectedCertificateNote)}
          onClose={() => setSelectedCertificateNote(null)}
          note={selectedCertificateNote}
          patientName={selectedCertificateNote.patient_name || targetPatientName}
          patientCnic={selectedCertificateNote.patient_cnic || selectedCertificateNote.leave_details?.patient_cnic || verifiedCnic}
          doctorName={selectedCertificateNote.author_name}
          doctorPmc={selectedCertificateNote.author_pmc || doctorProfile?.pmc_license_number || 'PMC-68291-A'}
        />
      )}

      {/* PATIENT REQUEST MEDICAL NOTE MODAL */}
      <RequestMedicalNoteModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultDoctorUid={doctorProfile?.uid}
      />

      {/* DOCTOR DECLINE REQUEST MODAL */}
      {rejectModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Decline Request</h3>
              </div>
              <button
                onClick={() => setRejectModalRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-gray-600">
                You are declining the note request from <strong className="text-gray-900">{rejectModalRequest.patient_name}</strong> for{' '}
                <span className="font-semibold capitalize">{rejectModalRequest.note_type.replace(/_/g, ' ')}</span>.
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for Declining (Sent to Patient)
                </label>
                <textarea
                  rows={3}
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="e.g., Clinical guidelines require an in-person examination or tele-consultation before issuing this certificate..."
                  className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRejectModalRequest(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
