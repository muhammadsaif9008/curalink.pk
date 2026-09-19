import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
          Security & Privacy Standards
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy & CNIC Protection</h1>
        <p className="text-xs text-gray-500">Last updated: September 2026</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed shadow-xs">
        <div className="flex items-start gap-4 p-4 rounded-xl bg-teal-50 border border-teal-200">
          <Lock className="w-6 h-6 text-[#0F766E] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-teal-950">CNIC Masking & Encryption Mandate</h3>
            <p className="text-xs text-teal-800 mt-1">
              Your National Identity Card (CNIC) is stored in encrypted format and masked as <code>XXXXX-XXXXXXX-X</code> across all views. Doctors cannot view your CNIC or full health history without your explicit booking consent.
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
          <p className="text-xs text-gray-600">
            CuraLink collects contact details (phone number, email), National Identity Card details for health record linking, basic profile demographics (date of birth, gender, city), self-reported medical history (allergies, conditions, medications), and consultation records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Medical History & Doctor Access</h2>
          <p className="text-xs text-gray-600">
            Per our strict security architecture, a doctor may ONLY inspect a patient's medical history if there is an active, confirmed booking between them. Medical records are never sold, rented, or shared with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. AI Triage & Note-Taking Confidentiality</h2>
          <p className="text-xs text-gray-600">
            Clinical AI triage interactions and transcription summaries are processed through private, HIPAA-compliant endpoints. AI suggestions are strictly advisory and require human physician sign-off before being committed to your permanent medical record.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Your Data Rights</h2>
          <p className="text-xs text-gray-600">
            Under CuraLink's patient charter, you retain full ownership of your health records. You may export your entire medical record PDF or request permanent deletion of your account at any time via Account Settings.
          </p>
        </section>
      </div>
    </div>
  );
};
