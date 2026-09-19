import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Stethoscope, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
          <HeartPulse className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Join CuraLink Pakistan
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
          Select how you want to use CuraLink to access or deliver clinically verified healthcare.
        </p>
      </div>

      {/* Two large tappable cards (Part 4 specification) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Patient Card */}
        <button
          onClick={() => navigate('/signup/patient')}
          className="bg-white border-2 border-gray-200 hover:border-[#0F766E] rounded-2xl p-8 text-left shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#0F766E] transition-colors">
                I'm a Patient
              </h2>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Check symptoms with clinical AI, book home visits or video consultations, and build your permanent CNIC-secured medical history.
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs font-bold text-[#0F766E]">
            <span>Create Patient Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Doctor Card */}
        <button
          onClick={() => navigate('/signup/doctor')}
          className="bg-white border-2 border-gray-200 hover:border-blue-600 rounded-2xl p-8 text-left shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  I'm a Doctor
                </h2>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  PMC
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Offer video calls and neighborhood home visits. AI transcribes and drafts prescriptions for your review, with weekly bank payouts.
              </p>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between text-xs font-bold text-blue-600">
            <span>Register as a Physician</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Bottom Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#0F766E] font-bold hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
