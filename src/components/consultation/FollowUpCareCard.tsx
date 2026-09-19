import React from 'react';
import { Calendar, Clock, AlertCircle, ShieldAlert, ArrowRight } from 'lucide-react';

interface FollowUpCareCardProps {
  doctorName: string;
  followUpTimeframe?: string;
  followUpDate?: string;
  instructions?: string;
  redFlags?: string;
  onBookFollowUp?: () => void;
}

export const FollowUpCareCard: React.FC<FollowUpCareCardProps> = ({
  doctorName,
  followUpTimeframe = '5 Days',
  followUpDate,
  instructions = 'Maintain oral fluid hydration (minimum 2.5L daily). Rest in an elevated posture. If fever persists beyond 48 hours, follow up immediately.',
  redFlags = 'Do not wait for scheduled follow-up if you experience severe shortness of breath, blood in sputum, chest pressure, persistent temperature >103°F, or sudden confusion. Tap Emergency Button or call Rescue 1122 immediately.',
  onBookFollowUp
}) => {
  const displayDate = followUpDate 
    ? new Date(followUpDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Within 5 Days';

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border-2 border-emerald-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/70 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-gray-900">Doctor's Follow-Up Directives & Review</h4>
            <p className="text-[11px] text-gray-600">Recovery monitoring ordered by Dr. {doctorName.replace('Dr. ', '')}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Follow up after: {followUpTimeframe}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-emerald-200 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Review Date</span>
            <p className="font-black text-sm text-gray-900">{displayDate}</p>
            <p className="text-[11px] text-teal-800 font-medium mt-1">Recommended teleconsultation or clinic review</p>
          </div>
          {onBookFollowUp && (
            <button
              onClick={onBookFollowUp}
              className="mt-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Schedule Review</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-emerald-200 space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Clinical Recovery Directives</span>
          <p className="text-gray-800 leading-relaxed font-medium text-xs">
            {instructions}
          </p>
        </div>
      </div>

      {/* Red Flag Warning Alert */}
      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-950">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-rose-900">Red Flag Emergency SOS Protocol:</span>
          <p className="text-[11px] text-rose-800 leading-relaxed mt-0.5">
            {redFlags}
          </p>
        </div>
      </div>
    </div>
  );
};
