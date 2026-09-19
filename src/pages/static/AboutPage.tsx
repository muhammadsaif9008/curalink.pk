import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartPulse, Stethoscope, ShieldCheck, Activity, Users, Award, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Our Mission & Vision
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Reimagining Healthcare for 240 Million Pakistanis
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          CuraLink bridges the gap between symptom uncertainty, clinical consultations, and continuous personal health records across Pakistan.
        </p>
      </div>

      {/* Narrative */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs text-sm text-gray-700 leading-relaxed">
        <h2 className="text-xl font-bold text-gray-900">Why CuraLink was Founded</h2>
        <p>
          In Pakistan, families frequently face overcrowded hospital outpatient clinics, grueling city traffic, and disorganized paper prescriptions that get lost over time. When feeling ill, many either self-medicate dangerously or delay seeking care until conditions worsen.
        </p>
        <p>
          CuraLink creates a seamless continuum of medical care. Starting with an AI-guided clinical intake that rules out emergencies, patients can consult verified PMC doctors through high-definition video or book a doctor to visit their home doorstep with live GPS tracking.
        </p>
        <p>
          Crucially, every consultation produces an AI-drafted, doctor-verified electronic medical certificate and prescription that automatically saves into the patient's personal health record — secured under their CNIC.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">100% PMC-Verified</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Every physician on CuraLink holds active credentials from the Pakistan Medical Commission, ensuring clinical standards.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Care at Your Door</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            From Karachi to Islamabad, our home-visit physician and paramedic network delivers bedside clinical care directly to you.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Lifelong Records</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Say goodbye to lost paper slips. Your diagnosis, dosage instructions, and lab reports are preserved in your secure digital health passport.
          </p>
        </div>
      </div>

      {/* Action Strip */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-teal-950">Ready to take control of your health?</h3>
          <p className="text-xs text-teal-800">Check your symptoms now or browse our directory of verified physicians.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/symptom-check')}
            className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs cursor-pointer"
          >
            Check Symptoms
          </button>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-white border border-teal-300 text-[#0F766E] text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-teal-100 cursor-pointer"
          >
            Find Doctors
          </button>
        </div>
      </div>
    </div>
  );
};
