import React from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  Download, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { EmergencyButton } from '../shared/EmergencyButton';

interface ConsultationReportHeaderProps {
  documentId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPmc: string;
  doctorHospital: string;
  patientName: string;
  isSigned: boolean;
  isDoctorUser: boolean;
  onOpenAIGenerator: () => void;
  onPrint: () => void;
}

export const ConsultationReportHeader: React.FC<ConsultationReportHeaderProps> = ({
  documentId,
  doctorName,
  doctorSpecialty,
  doctorPmc,
  doctorHospital,
  patientName,
  isSigned,
  isDoctorUser,
  onOpenAIGenerator,
  onPrint
}) => {
  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Document Reference</span>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              #{documentId.toUpperCase()}
            </span>
            {isSigned ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>PMC Verified & Signed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Draft — Pending Doctor Signature</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mt-1">
            Clinical Consultation Report & Prescription
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* AI Report Generator Trigger */}
          <button
            id="btn-trigger-ai-report"
            onClick={onOpenAIGenerator}
            className="bg-gradient-to-r from-teal-700 to-teal-900 hover:from-teal-800 hover:to-teal-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Generate or refine report using AI Scribe"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
            <span>{isSigned ? '✨ Refine with AI Scribe' : '✨ Generate with AI Scribe'}</span>
          </button>

          {/* Print / Download Button */}
          <button
            id="btn-print-report"
            onClick={onPrint}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Print / Download PDF</span>
            <span className="sm:hidden">Print</span>
          </button>

          {/* Emergency Hotline Button */}
          <EmergencyButton callerRole={isDoctorUser ? 'doctor' : 'patient'} patientName={patientName} />
        </div>
      </div>

      {/* Official Clinical Letterhead Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <HeartPulse className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-300">CuraLink Health Network</span>
              <span className="text-white/40">•</span>
              <span className="text-[10px] font-semibold text-teal-200">Electronic Health Gateway</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              Official Medical Encounters & Prescription
            </h2>
            <p className="text-xs text-teal-200/80 mt-0.5">
              Issued in compliance with Pakistan Electronic Transactions Ordinance & PMC Digital Guidelines
            </p>
          </div>
        </div>

        {/* Attending Physician Credentials */}
        <div className="text-left sm:text-right bg-white/10 backdrop-blur-xs border border-white/15 rounded-xl px-4 py-3 shrink-0">
          <p className="text-xs font-bold text-white">{doctorName}</p>
          <p className="text-[11px] text-teal-200">{doctorSpecialty}</p>
          <p className="text-[10px] font-mono text-teal-300 font-bold mt-0.5 flex items-center sm:justify-end gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>PMC: {doctorPmc}</span>
          </p>
          <p className="text-[10px] text-white/60">{doctorHospital}</p>
        </div>
      </div>
    </div>
  );
};
