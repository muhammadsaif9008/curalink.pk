import React from 'react';
import { useApp } from '../../context/AppContext';
import { PhoneCall, ShieldCheck, Stethoscope, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="bg-white border-t border-[#E5E7EB] mt-auto">
      {/* Top Banner: Clinical Scope Notice */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Non-Emergency Clinical Service</p>
              <p className="text-xs text-[#6B7280]">
                CuraLink facilitates scheduled outpatient video and home physician consultations. For life-threatening emergencies, please dial Rescue 1122 or visit the nearest emergency room immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/hospitals')}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Partner Hospitals</span>
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#6B7280]">
          <button onClick={() => navigate('/hospitals')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Partner Hospitals
          </button>
          <button onClick={() => navigate('/diseases')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Diseases Guide
          </button>
          <button onClick={() => navigate('/why-curalink')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Why CuraLink
          </button>
          <button onClick={() => navigate('/about')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            About
          </button>
          <button onClick={() => navigate('/privacy')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Privacy
          </button>
          <button onClick={() => navigate('/terms')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Terms
          </button>
          <button onClick={() => navigate('/contact')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Contact
          </button>
          <button onClick={() => navigate('/doctors')} className="hover:text-[#0F766E] transition-colors cursor-pointer">
            Doctors
          </button>
          <button onClick={() => navigate('/signup/doctor')} className="text-[#0F766E] hover:underline cursor-pointer">
            Join as Doctor
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF]">© 2026 CuraLink Pakistan • PMC Registered Network</p>
      </div>
    </footer>
  );
};

