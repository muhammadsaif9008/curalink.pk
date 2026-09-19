import React from 'react';
import { User, Calendar, AlertTriangle, Shield, Clock } from 'lucide-react';

interface PatientClinicalProfileCardProps {
  patientName: string;
  patientAge?: number | string;
  patientGender?: string;
  durationDays?: string;
  pastHistory?: string;
  allergies?: string;
  consultationDate: string;
  visitType?: string;
  maskedCnic?: string;
}

export const PatientClinicalProfileCard: React.FC<PatientClinicalProfileCardProps> = ({
  patientName,
  patientAge = 29,
  patientGender = 'Female',
  durationDays = '3',
  pastHistory = 'No chronic illness reported',
  allergies = 'None reported',
  consultationDate,
  visitType = 'video',
  maskedCnic = 'XXXXX-XXXXXXX-2'
}) => {
  const isAllergyReported = allergies && allergies.toLowerCase() !== 'none' && allergies.toLowerCase() !== 'none reported' && allergies.toLowerCase() !== 'no known drug allergies';

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Patient & Encounter Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Patient Name</span>
          <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">{patientName}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">National ID (Masked)</span>
          <span className="font-mono font-bold text-gray-800 text-xs mt-0.5 block">{maskedCnic}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Date of Encounter</span>
          <span className="font-bold text-gray-900 text-xs mt-0.5 block">
            {new Date(consultationDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Consultation Format</span>
          <span className="inline-flex items-center gap-1 font-bold text-teal-800 text-xs mt-0.5 capitalize">
            {visitType === 'video' ? 'Telehealth Video' : 'Home Bedside Visit'}
          </span>
        </div>
      </div>

      {/* Clinical Profile Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200/70">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Patient Age</span>
          <p className="font-black text-sm text-gray-900 mt-0.5">{patientAge} Years</p>
        </div>

        <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200/70">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Gender</span>
          <p className="font-black text-sm text-gray-900 mt-0.5">{patientGender}</p>
        </div>

        <div className="p-3 bg-gray-50/60 rounded-xl border border-gray-200/70">
          <span className="text-[10px] text-gray-500 uppercase font-bold block">Problem Duration</span>
          <p className="font-black text-sm text-gray-900 mt-0.5">
            {durationDays ? (durationDays.includes('Day') ? durationDays : `${durationDays} Days`) : '3 Days'}
          </p>
        </div>

        <div className={`p-3 rounded-xl border ${
          isAllergyReported
            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
            : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
        }`}>
          <span className="text-[10px] uppercase font-bold block flex items-center gap-1">
            {isAllergyReported ? (
              <>
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span className="text-rose-700">Drug Allergies</span>
              </>
            ) : (
              <>
                <Shield className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Allergies</span>
              </>
            )}
          </span>
          <p className="font-black text-xs mt-0.5 truncate">{allergies}</p>
        </div>
      </div>

      {/* Past Medical History & Chronic Conditions */}
      <div className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/70 text-xs">
        <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
          Past Medical History & Chronic Conditions
        </span>
        <p className="text-gray-800 font-medium leading-relaxed">
          {pastHistory || 'No prior chronic medical illnesses or surgeries reported by the patient.'}
        </p>
      </div>
    </div>
  );
};
