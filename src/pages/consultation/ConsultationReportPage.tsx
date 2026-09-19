import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Edit3, 
  Award, 
  Download, 
  Calendar,
  Save,
  LogIn
} from 'lucide-react';
import { ConsultationReport, PrescribedMedication } from '../../types';
import { ConsultationReportHeader } from '../../components/consultation/ConsultationReportHeader';
import { PatientClinicalProfileCard } from '../../components/consultation/PatientClinicalProfileCard';
import { ClinicalVitalsCard } from '../../components/consultation/ClinicalVitalsCard';
import { PrescriptionTable } from '../../components/consultation/PrescriptionTable';
import { FollowUpCareCard } from '../../components/consultation/FollowUpCareCard';
import { DoctorSignatureSection } from '../../components/consultation/DoctorSignatureSection';
import { AIScribeReportGeneratorModal } from '../../components/consultation/AIScribeReportGeneratorModal';

interface ConsultationReportPageProps {
  bookingId?: string;
}

export const ConsultationReportPage: React.FC<ConsultationReportPageProps> = ({ bookingId }) => {
  const { 
    bookings, 
    doctors, 
    consultationReports, 
    currentUser, 
    patientProfile,
    signConsultationReport, 
    updateConsultationReport,
    loginAs,
    navigate, 
    currentRoute 
  } = useApp();

  const routeStr = currentRoute || '';
  const id = bookingId || (routeStr.includes('/consultation/') ? (routeStr.split('/consultation/')[1] || '').replace('/report', '') : (bookings && bookings[0]?.id));
  
  // Look up matching report first by report ID or booking ID
  const matchedReport = (consultationReports || []).find(
    r => r.id === id || r.booking_id === id
  );

  // Look up corresponding booking if available
  const booking = (bookings || []).find(b => b.id === id || b.id === matchedReport?.booking_id) || (bookings && bookings[0]);
  const doctor = (doctors || []).find(d => d.id === booking?.doctor_id || d.uid === booking?.doctor_id || d.id === matchedReport?.doctor_uid) || (doctors && doctors[0]);

  // Construct patient-specific fallback report if no stored report matches yet
  const fallbackReport: ConsultationReport = {
    id: `rep_${booking?.id || id || 'new'}`,
    booking_id: booking?.id || id || 'bk_101',
    patient_uid: booking?.patient_uid || 'patient_demo',
    patient_name: booking?.patient_name || patientProfile?.name || currentUser?.name || 'Ahmad Khan',
    doctor_uid: doctor?.id || doctor?.uid || 'doc_1',
    doctor_name: doctor?.name || 'Dr. Ayesha Tariq',
    date: new Date().toISOString().split('T')[0],
    visit_type: booking?.type || 'video',
    diagnosis: booking?.reason ? `Clinical Review: ${booking.reason}` : 'Acute Clinical Assessment',
    advice: 'Maintain oral hydration and rest. Comply strictly with medication instructions.',
    status: 'signed',
    transcription_summary: booking?.reason ? `Patient presented with ${booking.reason}. Vital signs reviewed.` : 'Clinical dialogue documented with patient.',
    chief_complaint: booking?.reason || 'Frontal headaches for two weeks, rated 7/10',
    patient_age: booking?.patient_age ?? (matchedReport?.patient_age ?? 32),
    patient_gender: booking?.patient_gender || matchedReport?.patient_gender || 'Male',
    problem_duration_days: '5 Days',
    allergies: 'None reported',
    medical_history: 'No prior chronic medical illnesses.',
    follow_up_timeframe: '5 Days',
    follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    follow_up_instructions: 'Maintain oral fluid hydration. If symptoms worsen, schedule follow-up or visit ER.',
    red_flags: 'Seek immediate emergency attention at Rescue 1122 or nearest ER if developing chest pressure, severe shortness of breath, blood in sputum, or sudden confusion.',
    vitals: {
      temperature_f: 98.6,
      blood_pressure: '120/80',
      pulse_bpm: 76,
      spo2_percent: 98
    },
    medications: [
      { 
        name: 'Tab. Paracetamol (Panadol) 500mg', 
        dosage: '500mg', 
        frequency: 'Thrice daily (TDS)', 
        duration: '5 days', 
        instructions: 'Take after meals for fever and pain relief' 
      }
    ]
  };

  const existingReport = matchedReport || fallbackReport;
  
  // State for report data
  const [report, setReport] = useState<ConsultationReport>(existingReport);
  const [isEditing, setIsEditing] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState(existingReport.diagnosis || '');
  const [editAdvice, setEditAdvice] = useState(existingReport.advice || '');
  const [showSignSuccess, setShowSignSuccess] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (existingReport) {
      setReport(existingReport);
      setEditDiagnosis(existingReport.diagnosis || '');
      setEditAdvice(existingReport.advice || '');
    }
  }, [existingReport?.id, existingReport?.status]);

  const doctorName = doctor?.name || report?.doctor_name || 'Dr. Ayesha Tariq';
  const doctorSpecialty = doctor?.specialty || 'General Physician & Family Medicine';
  const doctorPmc = doctor?.pmc_license_number || 'PMC-48291-P';
  const doctorHospital = doctor?.hospital_affiliation || 'National Hospital, Lahore';
  const doctorId = doctor?.id || doctor?.uid || report?.doctor_uid || 'doc_1';

  const isDoctorUser = currentUser?.role === 'doctor';
  const isSigned = report?.status === 'signed';

  // Handle AI Report Application
  const handleApplyAIReport = (updatedReport: ConsultationReport) => {
    setReport(updatedReport);
    setEditDiagnosis(updatedReport.diagnosis || '');
    setEditAdvice(updatedReport.advice || '');
    updateConsultationReport(updatedReport);
    setNotification('AI Consultation Report generated accordingly! All diagnostic sections, vitals, medications & follow-up care updated.');
    setTimeout(() => setNotification(null), 6000);
  };

  const handleDoctorSign = () => {
    const signedObj: ConsultationReport = {
      ...report,
      diagnosis: editDiagnosis,
      advice: editAdvice,
      status: 'signed',
      is_signed: true,
      doctor_signed: true,
      doctor_name: doctorName,
      doctor_pmc: doctorPmc,
      doctor_specialty: doctorSpecialty,
      signed_at: new Date().toISOString()
    };

    setReport(signedObj);
    signConsultationReport(signedObj.id, doctorName);
    updateConsultationReport(signedObj);
    setIsEditing(false);
    setShowSignSuccess(true);
    setTimeout(() => setShowSignSuccess(false), 5000);
  };

  const handleUpdateMedications = (meds: PrescribedMedication[]) => {
    const updated = {
      ...report,
      medications: meds,
      prescribed_medications: meds
    };
    setReport(updated);
    updateConsultationReport(updated);
  };

  const handlePrintDownload = () => {
    window.print();
  };

  // Patient Verification Gate: if user is patient and report is not signed yet
  if (!isDoctorUser && !isSigned) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Report Pending Attending Physician Signature</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Report Awaiting Doctor Authorization
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              This consultation report is currently in draft status. As per PMC clinical regulations, patient review is unlocked once <strong>{doctorName}</strong> finalizes and signs the report.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Physician Verification Queue</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Dr. {doctorName.replace('Dr. ', '')} ({doctorSpecialty}) is reviewing the diagnostic transcription and formulating medical instructions.
            </p>
          </div>

          {/* Quick Doctor Login Switcher for Testing/Demonstration */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-switch-doctor-sign"
              onClick={() => {
                loginAs('doctor', 'approved');
              }}
              className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login as Attending Doctor to Sign / Generate AI Report</span>
            </button>

            <button
              id="btn-gate-return-dashboard"
              onClick={() => navigate('/dashboard/patient')}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Return to Patient Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-28">
      {/* Return Navigation */}
      <button
        onClick={() => navigate(isDoctorUser ? '/dashboard/doctor' : '/dashboard/patient')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-teal-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to {isDoctorUser ? 'Doctor Console' : 'Patient Portal'}</span>
      </button>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-teal-50 border border-teal-300 text-teal-950 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-teal-800 hover:text-teal-950 font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {showSignSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Report officially authorized with PMC digital verification seal. Synchronized to patient health records.</span>
        </div>
      )}

      {/* 1. Header with Hospital Brand, Doctor Identity & Quick Action Toolbar */}
      <ConsultationReportHeader
        documentId={report.id}
        doctorName={doctorName}
        doctorSpecialty={doctorSpecialty}
        doctorPmc={doctorPmc}
        doctorHospital={doctorHospital}
        patientName={report.patient_name || 'Patient'}
        isSigned={isSigned}
        isDoctorUser={isDoctorUser}
        onOpenAIGenerator={() => setIsAIModalOpen(true)}
        onPrint={handlePrintDownload}
      />

      {/* 2. Main Printable Clinical Report Document */}
      <div id="medical-report-printable" className="space-y-6">
        {/* Patient Demographics & Profile */}
        <PatientClinicalProfileCard
          patientName={report.patient_name || 'Zainab Ahmed'}
          patientAge={report.patient_age}
          patientGender={report.patient_gender}
          durationDays={report.problem_duration_days}
          pastHistory={report.medical_history}
          allergies={report.allergies}
          consultationDate={report.date}
          visitType={report.visit_type}
        />

        {/* Recorded Vitals Dashboard */}
        {report.vitals && (
          <ClinicalVitalsCard vitals={report.vitals} />
        )}

        {/* Chief Complaint & Assessment / Diagnosis */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Chief Complaint</span>
            <p className="text-xs text-gray-800 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/60 font-medium">
              {report.chief_complaint || 'General medical assessment & symptom evaluation'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-500">Clinical Assessment & Diagnosis</span>
              {isDoctorUser && !isSigned && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Done Editing' : 'Edit Diagnosis'}</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={2}
                value={editDiagnosis}
                onChange={e => setEditDiagnosis(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 font-bold text-gray-900"
              />
            ) : (
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 text-xs font-black text-teal-950 leading-relaxed">
                {isSigned ? report.diagnosis : editDiagnosis}
              </div>
            )}
          </div>

          {report.transcription_summary && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Dialogue & Clinical Notes Summary</span>
              <p className="text-xs text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-200/50 leading-relaxed">
                {report.transcription_summary}
              </p>
            </div>
          )}
        </div>

        {/* Official Prescription Table */}
        <PrescriptionTable
          medications={report.medications || []}
          isEditing={isDoctorUser && isEditing}
          onUpdateMedications={handleUpdateMedications}
        />

        {/* Doctor's Follow-up Instructions & Red Flags */}
        <FollowUpCareCard
          doctorName={doctorName}
          followUpTimeframe={report.follow_up_timeframe}
          followUpDate={report.follow_up_date}
          instructions={isEditing ? editAdvice : (report.follow_up_instructions || report.advice)}
          redFlags={report.red_flags}
          onBookFollowUp={!isDoctorUser ? () => navigate(`/booking/new?doctorId=${doctorId}`) : undefined}
        />

        {/* Doctor's Advice & Care Plan */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Doctor's Advice & Care Plan</span>
            {isDoctorUser && !isSigned && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Save Advice' : 'Edit Advice'}</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={editAdvice}
              onChange={e => setEditAdvice(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 leading-relaxed font-medium text-gray-800"
            />
          ) : (
            <p className="text-xs text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-200/60 leading-relaxed font-medium">
              {isSigned ? report.advice : editAdvice}
            </p>
          )}
        </div>

        {/* Doctor PMC Signature & Timestamp Section */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <DoctorSignatureSection
            doctorName={doctorName}
            doctorSpecialty={doctorSpecialty}
            doctorPmc={doctorPmc}
            signedAt={report.signed_at}
            isSigned={isSigned}
          />
        </div>
      </div>

      {/* 3. Bottom Action Dock */}
      {isDoctorUser && !isSigned ? (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-400/30 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span>Doctor Sign-Off & Verification Required</span>
              </div>
              <h3 className="text-base font-extrabold text-white">Authorize & Sign Consultation Record</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Review the clinical assessment, prescription, and follow-up advice. You may edit fields or re-generate with AI before signing.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700/60 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-teal-500/30"
            >
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Refine with AI Scribe</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-white/15"
            >
              {isEditing ? 'Save Manual Changes' : 'Edit Report Fields'}
            </button>

            <button
              id="btn-sign-official-report"
              onClick={handleDoctorSign}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign & Authorize Official Medical Record (PMC Seal)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-900">Official Clinical Document Ready</p>
            <p className="text-[11px] text-gray-500">Saved to permanent CNIC health records. Recognized across Pakistani pharmacies.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handlePrintDownload}
              className="flex-1 sm:flex-initial bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Prescription</span>
            </button>

            {!isDoctorUser && (
              <button
                onClick={() => navigate(`/booking/new?doctorId=${doctorId}`)}
                className="flex-1 sm:flex-initial bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>Book Follow-up Consultation</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI Scribe Report Generator Modal */}
      <AIScribeReportGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentReport={report}
        onApplyReport={handleApplyAIReport}
        doctorName={doctorName}
        patientName={report.patient_name || 'Patient'}
        visitType={report.visit_type}
      />
    </div>
  );
};
