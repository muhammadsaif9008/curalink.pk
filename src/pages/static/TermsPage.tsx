import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          User Agreement
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service & Clinical Disclaimer</h1>
        <p className="text-xs text-gray-500">Effective as of September 2026</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed shadow-xs">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-950">AI Triage Disclaimer</h3>
            <p className="text-xs text-amber-900 mt-1">
              CuraLink's AI triage tool provides informational decision-support and symptom categorization. It does NOT constitute a final medical diagnosis or emergency service. All official medical diagnoses and medication prescriptions require review and signature by a licensed PMC physician.
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Emergency Situations</h2>
          <p className="text-xs text-gray-600">
            If you or someone under your care is experiencing a life-threatening medical emergency (including chest pain, sudden paralysis, severe respiratory distress, or severe trauma), immediately call Rescue 1122 or visit the nearest hospital emergency room.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Doctor Verification</h2>
          <p className="text-xs text-gray-600">
            All doctors listed on the public CuraLink directory must maintain an active, unencumbered registration with the Pakistan Medical Commission (PMC). Unverified or pending doctor accounts are barred from appearing in search results or treating patients.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Appointments & Home Visits</h2>
          <p className="text-xs text-gray-600">
            Patients may cancel an appointment up to 1 hour prior to scheduled start time for a full refund via JazzCash or Easypaisa. For home visits, patients must provide an accurate address and safe clinical environment for visiting doctors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Medical Reports & Prescriptions</h2>
          <p className="text-xs text-gray-600">
            A consultation report remains in "Pending Doctor Review" state until signed by the physician. Once signed, it forms a legally binding medical record and is automatically appended to your permanent health history.
          </p>
        </section>
      </div>
    </div>
  );
};
