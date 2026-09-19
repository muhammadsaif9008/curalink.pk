import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicalNote, MedicalNoteCategory, MedicalNotePriority, MedicalNoteRequest } from '../../types';
import {
  ClipboardList,
  Pin,
  Stethoscope,
  AlertTriangle,
  Activity,
  Pill,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Search,
  X,
  HeartPulse,
  Sparkles,
  ShieldCheck,
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
  ArrowRight,
  Info
} from 'lucide-react';
import { MedicalLeaveCertificateModal } from '../medical/MedicalLeaveCertificateModal';
import { RequestMedicalNoteModal } from '../medical/RequestMedicalNoteModal';

interface PatientNotesAndRequestsSectionProps {
  initialTab?: 'requests' | 'notes';
}

export const PatientNotesAndRequestsSection: React.FC<PatientNotesAndRequestsSectionProps> = ({
  initialTab = 'requests'
}) => {
  const {
    currentUser,
    patientProfile,
    doctors,
    medicalNotes,
    medicalNoteRequests,
    navigate
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'notes'>(initialTab);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedCertificateNote, setSelectedCertificateNote] = useState<MedicalNote | null>(null);
  const [printNote, setPrintNote] = useState<MedicalNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter state for notes
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter state for requests
  const [requestFilterStatus, setRequestFilterStatus] = useState<string>('all');

  const currentPatientUid = currentUser?.uid || patientProfile?.uid || 'patient_demo';
  const patientName = patientProfile?.name || currentUser?.name || 'Zainab Ahmed';
  const verifiedCnic = patientProfile?.cnic || currentUser?.cnic || '35201-1234567-8';

  // Requests submitted by this patient
  const myRequests = useMemo(() => {
    return (medicalNoteRequests || []).filter(req => {
      if (currentPatientUid === 'patient_demo') return true;
      return req.patient_uid === currentPatientUid;
    });
  }, [medicalNoteRequests, currentPatientUid]);

  const pendingRequestsCount = useMemo(() => {
    return myRequests.filter(r => r.status === 'pending').length;
  }, [myRequests]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter(req => {
      if (requestFilterStatus !== 'all' && req.status !== requestFilterStatus) return false;
      return true;
    });
  }, [myRequests, requestFilterStatus]);

  // Doctor-issued notes for this patient
  const myDoctorNotes = useMemo(() => {
    return (medicalNotes || []).filter(note => {
      // Must be authored by doctor or official medical staff
      const isTargetPatient = currentPatientUid === 'patient_demo' || 
                             note.patient_uid === currentPatientUid ||
                             (note.patient_name && note.patient_name.toLowerCase() === patientName.toLowerCase());
      return isTargetPatient && note.author_role === 'doctor';
    });
  }, [medicalNotes, currentPatientUid, patientName]);

  const filteredNotes = useMemo(() => {
    return myDoctorNotes.filter(note => {
      if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = note.title.toLowerCase().includes(q);
        const contentMatch = note.content.toLowerCase().includes(q);
        const docMatch = note.author_name.toLowerCase().includes(q);
        const tagsMatch = note.tags?.some(t => t.toLowerCase().includes(q));
        if (!titleMatch && !contentMatch && !docMatch && !tagsMatch) return false;
      }
      return true;
    });
  }, [myDoctorNotes, selectedCategory, searchQuery]);

  const handleCopyNote = (note: MedicalNote) => {
    const textToCopy = `Official Medical Note\nDoctor: ${note.author_name} (${note.author_pmc || 'PMC Verified'})\nDate: ${new Date(note.created_at).toLocaleDateString()}\nTitle: ${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryInfo = (category: MedicalNoteCategory) => {
    switch (category) {
      case 'clinical_observation':
        return { label: 'Clinical Assessment', icon: Stethoscope, color: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'follow_up':
        return { label: 'Follow-Up Care', icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'symptom_journal':
        return { label: 'Clinical Observation', icon: Activity, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'medication':
        return { label: 'Medication Advisory', icon: Pill, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'lifestyle_diet':
        return { label: 'Diet & Lifestyle', icon: HeartPulse, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'allergy_warning':
        return { label: 'Critical Allergy Alert', icon: AlertTriangle, color: 'text-red-700 bg-red-50 border-red-200' };
      case 'medical_leave':
        return { label: 'Official Medical Leave Certificate', icon: FileCheck, color: 'text-purple-800 bg-purple-50 border-purple-200' };
      default:
        return { label: 'Doctor Note', icon: FileText, color: 'text-gray-700 bg-gray-50 border-gray-200' };
    }
  };

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

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'medical_leave':
        return 'Official Medical Leave Certificate';
      case 'fitness_certificate':
        return 'Medical Fitness Certificate';
      case 'clinical_summary':
        return 'Clinical Progress Summary';
      case 'prescription_refill':
        return 'Prescription Refill Note';
      case 'follow_up':
        return 'Post-Treatment Advisory';
      default:
        return 'Physician Statement';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5 border border-teal-100">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                  Doctor Notes & Certificates
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PMC Verified Records
                </span>
                {pendingRequestsCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    {pendingRequestsCount} Request{pendingRequestsCount > 1 ? 's' : ''} Pending Doctor Review
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                Review verified medical notes, convalescent leave slips, and health clearances issued by your attending physicians. Need an official sick leave slip, fitness certificate, or clinical summary? Contact and submit a direct request to your doctor below.
              </p>
            </div>
          </div>

          {/* Primary Action Button: Request Doctor's Note */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              id="btn-patient-request-doctor-note"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-gradient-to-r from-teal-700 to-[#0F766E] hover:from-teal-800 hover:to-teal-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Request Medical Note from Doctor</span>
            </button>
          </div>
        </div>

        {/* Informative Workflow Banner */}
        <div className="mt-5 p-3.5 bg-teal-50/60 border border-teal-100 rounded-xl flex items-start gap-2.5 text-xs text-teal-900">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-teal-950">How Doctor Notes & Certificates Work:</span>
            <p className="text-[11px] text-teal-800 leading-relaxed">
              In CuraLink, only licensed and PMC-verified doctors can author and sign official medical notes. You can request documentation anytime by selecting your attending doctor. Once reviewed and signed, your official document with QR verification will be published immediately in your dashboard.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs: Requests vs Doctor-Issued Notes */}
        <div className="flex items-center gap-6 border-b border-gray-200 mt-6 pt-1">
          <button
            id="patient-tab-view-requests"
            onClick={() => setActiveSubTab('requests')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'requests'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <FileQuestion className="w-4 h-4" />
            <span>My Note Requests</span>
            {pendingRequestsCount > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 animate-pulse">
                {pendingRequestsCount} Pending
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-600">
                {myRequests.length}
              </span>
            )}
          </button>

          <button
            id="patient-tab-view-notes"
            onClick={() => setActiveSubTab('notes')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'notes'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Official Doctor-Issued Notes</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeSubTab === 'notes' ? 'bg-teal-100 text-[#0F766E]' : 'bg-gray-100 text-gray-600'
            }`}>
              {myDoctorNotes.length}
            </span>
          </button>
        </div>

        {/* Sub-Tab 1: Requests View Header Controls */}
        {activeSubTab === 'requests' && (
          <div className="mt-4 pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-gray-500 font-bold mr-1">Filter Requests:</span>
              {[
                { id: 'all', label: `All (${myRequests.length})` },
                { id: 'pending', label: `Pending (${myRequests.filter(r => r.status === 'pending').length})` },
                { id: 'approved', label: `Approved (${myRequests.filter(r => r.status === 'approved').length})` },
                { id: 'rejected', label: `Declined (${myRequests.filter(r => r.status === 'rejected').length})` }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setRequestFilterStatus(item.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                    requestFilterStatus === item.id
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="text-[#0F766E] hover:text-[#0B5C56] font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Another Request</span>
            </button>
          </div>
        )}

        {/* Sub-Tab 2: Notes Search & Filter Controls */}
        {activeSubTab === 'notes' && (
          <div className="mt-4 pt-1 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by diagnosis, doctor name, symptoms..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 font-bold mr-1">Category:</span>
              {[
                { id: 'all', label: 'All Records' },
                { id: 'medical_leave', label: 'Medical Leave' },
                { id: 'clinical_observation', label: 'Observations' },
                { id: 'follow_up', label: 'Follow-ups' },
                { id: 'allergy_warning', label: 'Allergies' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer text-xs ${
                    selectedCategory === cat.id
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: MY NOTE REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto border border-teal-100">
                <FileQuestion className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  {requestFilterStatus !== 'all' ? 'No requests match this filter' : 'No Medical Note Requests Yet'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  {requestFilterStatus !== 'all'
                    ? 'No requests found for this status. Clear filters to view your complete request history.'
                    : 'Need an official medical certificate for work excusal, university absence, fitness clearance, or continuous prescription? Submit a formal request to your doctor.'}
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request Medical Note from Doctor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isApproved = req.status === 'approved';
                const isRejected = req.status === 'rejected';
                const assignedDoctor = doctors.find(d => d.uid === req.doctor_uid);

                return (
                  <div
                    key={req.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative ${
                      isPending
                        ? 'border-amber-200 bg-amber-50/10'
                        : isApproved
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Request Details & Doctor Info */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-teal-950 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg flex items-center gap-1.5">
                            <FileCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                            {getRequestTypeLabel(req.note_type)}
                          </span>

                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            req.urgency === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {req.urgency} Urgency
                          </span>

                          <span className="text-[11px] text-gray-400 font-mono">
                            Ref #{req.id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {/* Attending Doctor Badge */}
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-[#0F766E] flex items-center justify-center font-black text-sm shrink-0 border border-teal-200">
                              {req.doctor_name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                {req.doctor_name}
                                <span className="text-[10px] text-teal-700 font-normal">({req.doctor_specialty || 'Attending Physician'})</span>
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {assignedDoctor?.hospital_affiliation || 'CuraLink Telehealth Network'}
                              </p>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>PMC Verified</span>
                          </div>
                        </div>

                        {/* Clinical Description & Symptoms */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            Clinical Reason & Symptoms Submitted
                          </span>
                          <p className="text-xs text-gray-800 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                            {req.reason}
                          </p>
                        </div>

                        {/* Medical Leave Details (if applicable) */}
                        {req.note_type === 'medical_leave' && (
                          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 text-purple-950 font-bold">
                              <Calendar className="w-4 h-4 text-purple-700" />
                              <span>Requested Excusal: {req.leave_start_date} to {req.leave_end_date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {req.employer_institution && (
                                <span className="text-[11px] text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                                  Addressed to: {req.employer_institution}
                                </span>
                              )}
                              <span className="font-bold text-xs bg-purple-700 text-white px-2.5 py-0.5 rounded-full">
                                {req.leave_days || 1} Day Excusal
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Current Status & Actions */}
                      <div className="md:w-64 shrink-0 flex flex-col justify-between space-y-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                            Request Status
                          </span>

                          {isPending && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>Pending Doctor Review</span>
                              </div>
                              <p className="text-[11px] text-amber-700 leading-normal">
                                {req.doctor_name} has received your request and will evaluate your clinical chart to sign the note.
                              </p>
                            </div>
                          )}

                          {isApproved && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approved & Published</span>
                              </div>
                              {req.doctor_remarks && (
                                <p className="text-[11px] text-emerald-700 italic">
                                  "{req.doctor_remarks}"
                                </p>
                              )}
                              <p className="text-[10px] text-emerald-600">
                                Official document signed and stored in your medical records.
                              </p>
                            </div>
                          )}

                          {isRejected && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                                <XCircle className="w-4 h-4" />
                                <span>Declined by Doctor</span>
                              </div>
                              {req.doctor_remarks && (
                                <p className="text-[11px] text-rose-700 bg-white/70 p-2 rounded-lg border border-rose-100">
                                  "{req.doctor_remarks}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2 pt-2">
                          {isApproved && (
                            <button
                              onClick={() => {
                                setActiveSubTab('notes');
                                const issuedNote = myDoctorNotes.find(n => n.id === req.issued_note_id || n.category === req.note_type);
                                if (issuedNote && issuedNote.category === 'medical_leave') {
                                  setSelectedCertificateNote(issuedNote);
                                }
                              }}
                              className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <FileCheck className="w-4 h-4" />
                              <span>View Official Certificate</span>
                            </button>
                          )}

                          <div className="text-[10px] text-gray-400 text-center">
                            Submitted on {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: OFFICIAL DOCTOR-ISSUED NOTES & CERTIFICATES */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto border border-teal-100">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">
                  {searchQuery || selectedCategory !== 'all' ? 'No medical notes found matching your search' : 'No Official Doctor Notes On File'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search keywords or resetting category filters to view all records.'
                    : 'You do not have any doctor-issued clinical notes or certificates yet. If you need documentation for work, university, or fitness, submit a request below.'}
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request Medical Note from Doctor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const catInfo = getCategoryInfo(note.category);
                const CatIcon = catInfo.icon;

                return (
                  <div
                    key={note.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between relative ${
                      note.is_pinned ? 'border-teal-300 ring-1 ring-teal-100' : 'border-gray-200'
                    } ${note.category === 'allergy_warning' ? 'bg-red-50/20' : ''}`}
                  >
                    <div>
                      {/* Top Bar: Category, Priority, Pin Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${catInfo.color}`}>
                            <CatIcon className="w-3 h-3" />
                            {catInfo.label}
                          </span>
                          {getPriorityBadge(note.priority)}
                        </div>

                        {note.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            <Pin className="w-3 h-3 fill-teal-700" />
                            Pinned
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {note.title}
                      </h3>

                      {/* Doctor Author Badge & Timestamp */}
                      <div className="flex items-center gap-2 mt-2 mb-3 text-xs text-gray-500 flex-wrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                          {note.author_name}
                          {note.author_pmc && (
                            <span className="text-[10px] text-teal-700 font-normal">({note.author_pmc})</span>
                          )}
                        </span>
                        <span>•</span>
                        <span title={note.created_at}>
                          {new Date(note.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Content Narrative */}
                      <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                        {note.content}
                      </div>

                      {/* Attached Vitals (if present) */}
                      {note.vitals && Object.keys(note.vitals).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {note.vitals.bp && (
                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                              BP: <strong className="text-gray-900 font-mono">{note.vitals.bp}</strong> mmHg
                            </span>
                          )}
                          {note.vitals.pulse && (
                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                              Pulse: <strong className="text-gray-900 font-mono">{note.vitals.pulse}</strong> bpm
                            </span>
                          )}
                          {note.vitals.sugar_mg_dl && (
                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                              Sugar: <strong className="text-gray-900 font-mono">{note.vitals.sugar_mg_dl}</strong> mg/dL
                            </span>
                          )}
                          {note.vitals.temp_f && (
                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                              Temp: <strong className="text-gray-900 font-mono">{note.vitals.temp_f}</strong>°F
                            </span>
                          )}
                          {note.vitals.spo2 && (
                            <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700 font-medium">
                              SpO2: <strong className="text-gray-900 font-mono">{note.vitals.spo2}</strong>%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {note.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                              <Tag className="w-2.5 h-2.5 text-gray-400" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Official PMC Medical Leave Certificate Card */}
                      {note.category === 'medical_leave' && (
                        <div className="mt-4 p-3.5 bg-gradient-to-br from-purple-50 via-teal-50/40 to-blue-50/50 rounded-xl border border-purple-200 space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-purple-950">
                              <Award className="w-4 h-4 text-purple-700" />
                              <span>Official PMC Medical Leave Certificate</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold bg-white text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                              {note.leave_details?.certificate_number || `MLC-${note.id.slice(0, 8)}`}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 bg-white/90 p-2.5 rounded-lg border border-purple-100">
                            <div>
                              <span className="text-gray-400 block font-medium">Leave Period</span>
                              <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3 text-purple-600" />
                                {note.leave_details?.total_days || 1} Day{(note.leave_details?.total_days || 1) > 1 ? 's' : ''} Excusal
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

                    {/* Footer Controls: Print Slip & Copy Note */}
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
                              <span>Copy Note</span>
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

                      <span className="text-[10px] text-gray-400 font-medium">
                        Doctor-Verified Record
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REQUEST MEDICAL NOTE MODAL */}
      <RequestMedicalNoteModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {/* OFFICIAL MEDICAL LEAVE CERTIFICATE MODAL */}
      {selectedCertificateNote && (
        <MedicalLeaveCertificateModal
          note={selectedCertificateNote}
          onClose={() => setSelectedCertificateNote(null)}
        />
      )}

      {/* PRINT NOTE SLIP PREVIEW MODAL */}
      {printNote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Print Doctor's Note Slip</h3>
                  <p className="text-xs text-gray-500">Official Clinical Record Slip</p>
                </div>
              </div>
              <button
                onClick={() => setPrintNote(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div>
                  <span className="font-bold text-gray-900 text-sm block">CuraLink Telehealth Network</span>
                  <span className="text-[11px] text-gray-500">Official Doctor's Clinical Note</span>
                </div>
                <span className="text-[11px] font-mono text-gray-500">
                  {new Date(printNote.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Patient</span>
                  <span className="font-bold text-gray-900">{patientName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Attending Doctor</span>
                  <span className="font-bold text-gray-900">{printNote.author_name}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">Subject</span>
                <p className="font-bold text-gray-900 text-sm">{printNote.title}</p>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px]">Clinical Findings & Advice</span>
                <p className="mt-1 p-2.5 bg-white rounded-lg border border-gray-200 text-gray-800 whitespace-pre-line leading-relaxed">
                  {printNote.content}
                </p>
              </div>

              {printNote.vitals && Object.keys(printNote.vitals).length > 0 && (
                <div>
                  <span className="text-gray-400 block text-[10px] mb-1">Attached Vitals</span>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {printNote.vitals.bp && <span className="bg-white border px-2 py-0.5 rounded">BP: {printNote.vitals.bp}</span>}
                    {printNote.vitals.pulse && <span className="bg-white border px-2 py-0.5 rounded">Pulse: {printNote.vitals.pulse} bpm</span>}
                    {printNote.vitals.sugar_mg_dl && <span className="bg-white border px-2 py-0.5 rounded">Sugar: {printNote.vitals.sugar_mg_dl} mg/dL</span>}
                    {printNote.vitals.temp_f && <span className="bg-white border px-2 py-0.5 rounded">Temp: {printNote.vitals.temp_f}°F</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setPrintNote(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
