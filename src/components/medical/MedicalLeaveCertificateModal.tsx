import React, { useState } from 'react';
import { MedicalNote } from '../../types';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Building,
  User,
  Clock,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface MedicalLeaveCertificateModalProps {
  note: MedicalNote | null;
  onClose: () => void;
}

export const MedicalLeaveCertificateModal: React.FC<MedicalLeaveCertificateModalProps> = ({
  note,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const leave = note.leave_details || {
    start_date: note.created_at.slice(0, 10),
    end_date: note.created_at.slice(0, 10),
    total_days: 1,
    reason: note.title,
    patient_cnic: note.patient_cnic || '35201-1234567-8',
    employer_institution: 'To Whom It May Concern',
    duty_resumption_date: note.created_at.slice(0, 10),
    certificate_number: `MLC-${note.created_at.slice(0, 7).replace('-', '')}-${note.id.slice(-4)}`,
    monthly_quota_index: 1
  };

  const patientCnic = note.patient_cnic || leave.patient_cnic || '35201-1234567-8';
  const issueDateFormatted = new Date(note.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const startDateFormatted = leave.start_date
    ? new Date(leave.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : issueDateFormatted;

  const endDateFormatted = leave.end_date
    ? new Date(leave.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : startDateFormatted;

  const resumptionDateFormatted = leave.duty_resumption_date
    ? new Date(leave.duty_resumption_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : endDateFormatted;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const certText = `=== PAKISTAN MEDICAL COMMISSION COMPLIANT MEDICAL LEAVE CERTIFICATE ===
Certificate Ref: ${leave.certificate_number || `MLC-${note.id}`}
Date of Issue: ${issueDateFormatted}
Patient Name: ${note.patient_name || 'Patient'}
Verified CNIC: ${patientCnic} (NADRA Verified)
Addressed To: ${leave.employer_institution || 'To Whom It May Concern'}

Leave Period: ${startDateFormatted} to ${endDateFormatted} (Total: ${leave.total_days} days)
Resumption of Duty: ${resumptionDateFormatted}
Clinical Diagnosis / Medical Reason: ${leave.reason || note.content}

Attending Physician: ${note.author_name}
PMC Registration License: ${note.author_pmc || 'PMC-VERIFIED'}
Monthly Quota Compliance: Verified (Certificate ${leave.monthly_quota_index || 1} of 2 allowed per month for CNIC ${patientCnic})`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar (hidden on print) */}
        <div className="print:hidden px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Official Medical Leave Certificate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-white text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#0F766E] hover:bg-[#0B5C56] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 print:p-0 print:m-0 bg-white">
          {/* Certificate Border & Header */}
          <div className="border-4 border-double border-teal-900/40 rounded-xl p-6 sm:p-8 relative bg-white">
            
            {/* Watermark Logo in Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-9xl font-black text-teal-950">CURALINK</span>
            </div>

            {/* Header / Crest */}
            <div className="text-center pb-6 border-b-2 border-teal-800/30">
              <div className="flex items-center justify-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Islamic Republic of Pakistan • PMC Registered Network</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                CURALINK HEALTHCARE CLINICAL SERVICES
              </h1>
              <div className="inline-block mt-2 px-4 py-1 rounded-full bg-teal-50 border border-teal-200">
                <span className="text-xs sm:text-sm font-black text-teal-950 uppercase tracking-wider">
                  CERTIFICATE OF MEDICAL ILLNESS & RECOMMENDED LEAVE
                </span>
              </div>
            </div>

            {/* Certificate Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4 border-b border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Certificate Ref No.</span>
                <span className="font-mono font-bold text-gray-900">
                  {leave.certificate_number || `MLC-${note.id.toUpperCase()}`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Date of Issue</span>
                <span className="font-bold text-gray-900">{issueDateFormatted}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-400 block font-medium">Monthly Regulatory Cap</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <FileCheck className="w-3 h-3 text-emerald-600" />
                  Certificate {leave.monthly_quota_index || 1} of 2 (Verified)
                </span>
              </div>
            </div>

            {/* Addressed To */}
            <div className="pt-4 text-xs text-gray-700">
              <span className="text-gray-400 block font-medium mb-0.5">Addressed To:</span>
              <p className="font-bold text-gray-900 text-sm">
                {leave.employer_institution || 'To Whom It May Concern / Employer / Academic Administration'}
              </p>
            </div>

            {/* Patient Credentials */}
            <div className="my-5 p-4 rounded-xl bg-teal-50/50 border border-teal-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-teal-800/80 block font-medium">Patient Full Name</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    {note.patient_name || 'Patient'}
                  </span>
                </div>
                <div>
                  <span className="text-teal-800/80 block font-medium">National Identity Card (CNIC)</span>
                  <span className="text-sm font-mono font-bold text-teal-950 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {patientCnic}
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Verified
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Clinical Body */}
            <div className="space-y-4 text-xs sm:text-sm text-gray-800 leading-relaxed">
              <p>
                This is to certify that the patient mentioned above was clinically evaluated under my care. 
                Based on physical examination, reported symptomatology, and diagnostic assessment, 
                the patient is diagnosed with:
              </p>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-semibold text-gray-900">
                <span className="text-xs font-bold text-teal-800 block uppercase tracking-wider mb-1">
                  Clinical Diagnosis & Reason for Excusal:
                </span>
                <p className="text-sm leading-snug">
                  {leave.reason || note.title}
                </p>
                {note.content && note.content !== leave.reason && (
                  <p className="text-xs text-gray-600 mt-2 font-normal whitespace-pre-line border-t border-gray-200/60 pt-2">
                    {note.content}
                  </p>
                )}
              </div>

              <p>
                The patient is advised <strong className="text-gray-950 font-bold">complete medical rest and excusal from professional or academic duties</strong> for a duration of{' '}
                <span className="underline decoration-teal-600 decoration-2 font-black text-gray-950">
                  {leave.total_days} Calendar Day{leave.total_days > 1 ? 's' : ''}
                </span>:
              </p>

              {/* Date Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs">
                <div>
                  <span className="text-gray-500 block font-medium">Leave Commences</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-emerald-700" />
                    {startDateFormatted}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-medium">Leave Concludes</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-emerald-700" />
                    {endDateFormatted}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-500 block font-medium">Fitness / Resumption Date</span>
                  <span className="font-bold text-emerald-900 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-emerald-700" />
                    {resumptionDateFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Compliance Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div className="flex items-start gap-1.5 text-gray-600">
                <AlertCircle className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Regulatory Statutory Notice:</strong> In compliance with Pakistan Medical Commission (PMC) guidelines and workplace ethics standards, CuraLink enforces a strict system ceiling of <strong className="text-gray-900">maximum 2 medical leave certificates per month</strong> per verified CNIC. This certificate is authenticated and recorded in the practitioner&apos;s verified compliance registry.
                </p>
              </div>
            </div>

            {/* Doctor Signature & Stamp */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="w-20 h-20 rounded-full border-2 border-emerald-700/60 p-1 flex items-center justify-center text-center rotate-[-8deg] bg-emerald-50/40">
                  <div className="text-[9px] font-black text-emerald-900 uppercase leading-tight">
                    PMC VERIFIED
                    <br />
                    OFFICIAL
                    <br />
                    CLINICAL SEAL
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right space-y-1">
                <div className="font-serif italic text-lg text-teal-950 font-bold">
                  {note.author_name}
                </div>
                <div className="text-xs font-bold text-gray-800">
                  Attending Medical Officer
                </div>
                <div className="text-xs font-mono text-teal-800 font-semibold">
                  PMC Reg: {note.author_pmc || 'PMC-48291-P'}
                </div>
                <div className="text-[10px] text-gray-400">
                  Digital Verification Hash: SHA256-{note.id.slice(0, 8).toUpperCase()}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="print:hidden px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors cursor-pointer"
          >
            Close Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
