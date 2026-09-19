import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MedicalNoteRequestType } from '../../types';
import {
  X,
  Send,
  Stethoscope,
  Calendar,
  Building,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';

interface RequestMedicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctorUid?: string;
  defaultNoteType?: MedicalNoteRequestType;
}

export const RequestMedicalNoteModal: React.FC<RequestMedicalNoteModalProps> = ({
  isOpen,
  onClose,
  defaultDoctorUid,
  defaultNoteType = 'medical_leave'
}) => {
  const { doctors, currentUser, patientProfile, bookings, addMedicalNoteRequest } = useApp();

  // Find attending doctors the patient has consulted with
  const patientBookings = useMemo(() => {
    return bookings.filter(b => b.patient_id === currentUser?.uid || b.patient_id === 'patient_demo');
  }, [bookings, currentUser]);

  const priorDoctorUids = useMemo(() => {
    return new Set(patientBookings.map(b => b.doctor_id));
  }, [patientBookings]);

  // Initial selected doctor: either default, or first consulted doctor, or first doctor in list
  const initialDoctorUid = useMemo(() => {
    if (defaultDoctorUid && doctors.some(d => d.uid === defaultDoctorUid)) {
      return defaultDoctorUid;
    }
    const prior = doctors.find(d => priorDoctorUids.has(d.uid));
    if (prior) return prior.uid;
    return doctors[0]?.uid || '';
  }, [defaultDoctorUid, doctors, priorDoctorUids]);

  const [selectedDoctorUid, setSelectedDoctorUid] = useState<string>(initialDoctorUid);
  const [noteType, setNoteType] = useState<MedicalNoteRequestType>(defaultNoteType);
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [reason, setReason] = useState('');
  
  // Medical leave specific fields
  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultEndStr = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [employer, setEmployer] = useState('Systems Limited / Operations HR');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate days for medical leave
  const leaveDays = useMemo(() => {
    if (noteType !== 'medical_leave') return 0;
    try {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [noteType, startDate, endDate]);

  const selectedDoctor = useMemo(() => {
    return doctors.find(d => d.uid === selectedDoctorUid) || doctors[0];
  }, [doctors, selectedDoctorUid]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reason.trim()) {
      setErrorMessage('Please describe the clinical reason or symptoms for this request.');
      return;
    }

    if (noteType === 'medical_leave') {
      if (!startDate || !endDate) {
        setErrorMessage('Please select both start date and end date for the medical leave period.');
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setErrorMessage('End date cannot be earlier than start date.');
        return;
      }
      if (leaveDays > 14) {
        setErrorMessage('Medical leave requests are typically capped at 14 consecutive days without in-person hospital admission.');
        return;
      }
    }

    setIsSubmitting(true);

    const patientName = patientProfile.name || currentUser?.displayName || 'Zainab Ahmed';
    const patientCnic = patientProfile.cnic || '35201-1234567-8';
    const patientPhone = patientProfile.phone || '+92 300 1234567';

    try {
      addMedicalNoteRequest({
        patient_uid: currentUser?.uid || 'patient_demo',
        patient_name: patientName,
        patient_cnic: patientCnic,
        patient_phone: patientPhone,
        doctor_uid: selectedDoctor.uid,
        doctor_name: selectedDoctor.name,
        doctor_specialty: selectedDoctor.specialty,
        note_type: noteType,
        reason: reason.trim(),
        urgency,
        leave_start_date: noteType === 'medical_leave' ? startDate : undefined,
        leave_end_date: noteType === 'medical_leave' ? endDate : undefined,
        leave_days: noteType === 'medical_leave' ? leaveDays : undefined,
        employer_institution: noteType === 'medical_leave' ? employer.trim() : undefined
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Failed to submit medical note request. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="modal-request-medical-note"
        className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 my-8 animate-in zoom-in-95 duration-150"
      >
        {submittedSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-full flex items-center justify-center mx-auto ring-8 ring-teal-50/50 animate-in zoom-in-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Medical Note Request Submitted!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                Your request has been delivered to <strong className="text-gray-900">{selectedDoctor?.name}</strong>. You will receive an immediate notification as soon as the doctor signs and publishes your document.
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 font-semibold px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Status: Pending Doctor Review
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Request Doctor's Medical Note</h2>
                  <p className="text-xs text-gray-500">Contact attending physician for official certificates & clinical documentation</p>
                </div>
              </div>
              <button
                id="btn-close-request-modal"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Doctor Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Select Attending Doctor <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <select
                    id="select-doctor-for-note"
                    value={selectedDoctorUid}
                    onChange={(e) => setSelectedDoctorUid(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
                  >
                    {doctors.map((doc) => {
                      const isPrior = priorDoctorUids.has(doc.uid);
                      return (
                        <option key={doc.uid} value={doc.uid}>
                          {doc.name} — {doc.specialty} {isPrior ? '(Attending Doctor)' : `(${doc.hospital})`}
                        </option>
                      );
                    })}
                  </select>

                  {selectedDoctor && (
                    <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedDoctor.photo_url} 
                          alt={selectedDoctor.name} 
                          className="w-8 h-8 rounded-full object-cover border border-teal-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{selectedDoctor.name}</p>
                          <p className="text-[11px] text-gray-500">{selectedDoctor.specialty} • {selectedDoctor.hospital}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#0F766E] font-semibold bg-white px-2 py-0.5 rounded border border-teal-200">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>PMC Verified</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Type Selector */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  Type of Medical Documentation <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      type: 'medical_leave' as MedicalNoteRequestType,
                      title: 'Official Medical Leave Certificate',
                      desc: 'Workplace HR / university excusal slip with PMC verification QR'
                    },
                    {
                      type: 'clinical_summary' as MedicalNoteRequestType,
                      title: 'Clinical Progress & Treatment Summary',
                      desc: 'Formal summary of ongoing care, vital signs & clinical observations'
                    },
                    {
                      type: 'fitness_certificate' as MedicalNoteRequestType,
                      title: 'Medical Fitness Certificate',
                      desc: 'Health clearance for gym, travel, employment, or academic activities'
                    },
                    {
                      type: 'prescription_refill' as MedicalNoteRequestType,
                      title: 'Prescription Refill Authorization',
                      desc: 'Physician authorization note for ongoing maintenance medications'
                    },
                    {
                      type: 'follow_up' as MedicalNoteRequestType,
                      title: 'Post-Treatment Advisory Note',
                      desc: 'Activity restrictions, dietary instructions & recovery milestones'
                    },
                    {
                      type: 'general' as MedicalNoteRequestType,
                      title: 'General Physician Statement',
                      desc: 'Formal physician letter for institutional or insurance records'
                    }
                  ].map((item) => (
                    <label
                      key={item.type}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        noteType === item.type
                          ? 'border-[#0F766E] bg-teal-50/50 ring-1 ring-[#0F766E]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="note_type_choice"
                          checked={noteType === item.type}
                          onChange={() => setNoteType(item.type)}
                          className="mt-0.5 text-[#0F766E] focus:ring-[#0F766E]"
                        />
                        <div>
                          <p className="font-bold text-gray-900 leading-snug">{item.title}</p>
                          <p className="text-[11px] text-gray-500 leading-normal mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional Medical Leave Details */}
              {noteType === 'medical_leave' && (
                <div className="p-3.5 bg-gradient-to-br from-purple-50/60 via-teal-50/40 to-blue-50/40 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-purple-700" />
                      Medical Leave Period & Workplace Details
                    </span>
                    <span className="font-bold text-xs bg-purple-700 text-white px-2 py-0.5 rounded-full">
                      {leaveDays} Day{leaveDays > 1 ? 's' : ''} Excusal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Leave Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Leave End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center gap-1">
                      <Building className="w-3 h-3 text-gray-400" />
                      Addressed To (Employer / School / University)
                    </label>
                    <input
                      type="text"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                      placeholder="e.g. Systems Limited / HR or FAST NUCES Examination Office"
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:border-purple-600 outline-none"
                    />
                  </div>

                  <div className="p-2 bg-white/80 border border-purple-100 rounded-lg flex items-start gap-1.5 text-[11px] text-purple-900">
                    <Info className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      Under PMC tele-consultation regulations, official medical leave certificates carry tamper-evident verification. Maximum 2 issued certificates allowed per calendar month.
                    </span>
                  </div>
                </div>
              )}

              {/* Reason / Clinical Details Input */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Reason & Clinical Symptoms <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="textarea-request-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your current condition, symptoms, or why you need this note (e.g. recovering from high fever, severe fatigue, post-op restriction, or employer requirement)..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none leading-relaxed"
                />
              </div>

              {/* Urgency & Timing */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-gray-700 text-xs">Request Urgency:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('routine')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      urgency === 'routine'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Routine (24–48h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                      urgency === 'urgent'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Urgent (Today)
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-note-request"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0F766E] hover:bg-[#0B5C56] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Request to Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
