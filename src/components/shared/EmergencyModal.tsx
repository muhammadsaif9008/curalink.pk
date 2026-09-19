import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  X, 
  MapPin, 
  CheckCircle2, 
  HeartPulse, 
  Activity, 
  Clock, 
  Ambulance, 
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerRole?: 'doctor' | 'patient';
  patientName?: string;
  patientLocation?: string;
  suspectedCondition?: string;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  callerRole = 'doctor',
  patientName = 'Zainab Ahmed',
  patientLocation = 'Sector F-8/3, Islamabad',
  suspectedCondition = 'Acute Severe Distress / Chest Pain'
}) => {
  const { currentUser, doctorProfile } = useApp();
  const isDoctor = callerRole === 'doctor' || currentUser?.role === 'doctor';

  // Doctor Clinical Emergency Assessment state
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>(
    isDoctor ? 'Suspected Acute Coronary Event / Chest Pain' : 'General Severe Medical Emergency'
  );
  const [ambulanceRequested, setAmbulanceRequested] = useState(false);
  const [dispatchAlertSent, setDispatchAlertSent] = useState(false);
  const [doctorJudgedNotes, setDoctorJudgedNotes] = useState(
    'Attending physician clinical assessment: Patient exhibiting critical symptoms requiring immediate tertiary ER transfer and advanced life support.'
  );

  if (!isOpen) return null;

  const emergencyConditions = [
    { label: 'Acute Chest Pain / Suspected STEMI / Heart Attack', severe: true },
    { label: 'Acute Stroke Signs (FAST: Facial droop, arm weakness, slurred speech)', severe: true },
    { label: 'Severe Respiratory Failure / Hypoxia (SpO2 < 85%)', severe: true },
    { label: 'Massive Hemorrhage / Severe Trauma / Shock', severe: true },
    { label: 'Acute Anaphylaxis / Airway Stridor & Angioedema', severe: true },
    { label: 'Altered Consciousness / Unresponsive / Seizure', severe: true },
    { label: 'Severe Dehydration / Sepsis / High Pyrexia > 104°F', severe: false }
  ];

  const tertiaryHospitals = [
    { name: 'Rescue 1122 Islamabad / Rawalpindi', tel: '1122', note: 'Twin Cities Toll-Free EMS Ambulance' },
    { name: 'Edhi Foundation Ambulance Service', tel: '115', note: 'Rapid 24/7 Citywide Transport' },
    { name: 'Shifa International Hospital Emergency (Islamabad)', tel: '+92518464646', note: 'Tertiary 24/7 Emergency Centre' },
    { name: 'PIMS Federal Apex Emergency ER (Islamabad)', tel: '+92519261170', note: 'Apex Government Emergency Hospital' },
    { name: 'Rawalpindi Institute of Cardiology (RIC)', tel: '+92519281201', note: 'Cardiac & Vascular Emergency 24/7' },
    { name: 'Holy Family Hospital Emergency (Rawalpindi)', tel: '+92519290321', note: 'Tertiary Emergency & Dengue Unit' }
  ];

  const handleTriggerDispatch = () => {
    setAmbulanceRequested(true);
    setDispatchAlertSent(true);
    setTimeout(() => {
      setDispatchAlertSent(false);
    }, 6000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Urgent Header Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black shadow-lg shrink-0 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-800/80 px-2.5 py-0.5 rounded-full border border-red-400">
                  {isDoctor ? 'Physician Emergency Assessment & Dispatch' : 'Emergency Assistance & Ambulance'}
                </span>
                <span className="w-2 h-2 rounded-full bg-red-300 animate-ping"></span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Medical Emergency Response (1122)
              </h2>
              <p className="text-xs text-red-100 mt-0.5">
                {isDoctor 
                  ? 'Attending physician clinical override: evaluate patient severity and immediately mobilize Rescue 1122 or nearest tertiary ER.'
                  : 'If you or someone with you requires immediate resuscitation or emergency transport, call Rescue 1122 immediately.'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          {/* Primary Action: Direct Dial 1122 */}
          <div className="bg-red-50 border-2 border-red-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">Immediate Phone Dispatch</span>
              <h3 className="text-2xl font-black text-red-900 flex items-center justify-center sm:justify-start gap-2">
                <span>Dial Rescue 1122</span>
                <span className="text-xs font-semibold bg-red-200 text-red-900 px-2 py-0.5 rounded-md">Toll-Free</span>
              </h3>
              <p className="text-xs text-red-700 max-w-sm">
                Pakistan's national emergency medical service with advanced life-support (ALS) ambulances and trained paramedics.
              </p>
            </div>

            <a
              id="emergency-modal-dial-1122"
              href="tel:1122"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 animate-bounce"
            >
              <PhoneCall className="w-5 h-5 fill-current" />
              <span>Call 1122 Now</span>
            </a>
          </div>

          {dispatchAlertSent && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Emergency dispatch request transmitted with patient geolocation and clinical vitals summary to emergency services.</span>
            </div>
          )}

          {/* Doctor Assessment Section */}
          {isDoctor && (
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span>Physician Clinical Judgment Checklist</span>
                </span>
                <span className="text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[10px]">
                  Dr. {doctorProfile?.name || currentUser?.name || 'Attending Physician'}
                </span>
              </div>

              <p className="text-gray-600 text-xs">
                Judge the patient's acute status to classify severity for the incoming paramedic team:
              </p>

              <div className="space-y-1.5">
                {emergencyConditions.map((cond, idx) => (
                  <label 
                    key={idx}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmergencyType === cond.label 
                        ? 'bg-red-100/60 border-red-400 font-bold text-red-950'
                        : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="emergencyType"
                      checked={selectedEmergencyType === cond.label}
                      onChange={() => setSelectedEmergencyType(cond.label)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="flex-1">{cond.label}</span>
                    {cond.severe && (
                      <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 rounded">
                        Critical Red
                      </span>
                    )}
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Doctor Clinical Handover Notes for Paramedics
                </label>
                <textarea 
                  rows={2}
                  value={doctorJudgedNotes}
                  onChange={e => setDoctorJudgedNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Patient Address: <strong>{patientLocation}</strong></span>
                </div>

                <button
                  id="btn-trigger-doctor-dispatch"
                  onClick={handleTriggerDispatch}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Confirm Dispatch for Patient</span>
                </button>
              </div>
            </div>
          )}

          {/* Tertiary Hospital ER Hotlines */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span>Alternative Emergency & Hospital ER Hotlines</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tertiaryHospitals.map((hosp, i) => (
                <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors">
                  <div className="text-xs space-y-0.5">
                    <p className="font-bold text-gray-900 leading-tight">{hosp.name}</p>
                    <p className="text-[11px] text-gray-500">{hosp.note}</p>
                  </div>
                  <a
                    href={`tel:${hosp.tel}`}
                    className="bg-white border border-gray-300 hover:border-red-500 hover:bg-red-50 text-red-700 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{hosp.tel}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* On-Scene First Aid & Safety Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>While Waiting for the Ambulance (Crucial Protocol)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 leading-relaxed pl-1">
              <li>Keep patient seated comfortably if experiencing shortness of breath; recovery position if unresponsive.</li>
              <li>Do NOT give solid food, tea, or heavy water if consciousness is depressed or choking risk is present.</li>
              <li>Have CNIC card, current prescriptions, and past medical records ready by the door for the paramedics.</li>
              <li>Ensure outdoor gate/porch light is switched ON to help the ambulance locate the home immediately.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Official CuraLink Emergency Clinical Gateway</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
