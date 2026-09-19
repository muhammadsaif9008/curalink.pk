import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Video, 
  Car, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Save, 
  ArrowRight, 
  Stethoscope,
  Info,
  Clock,
  PhoneCall
} from 'lucide-react';

export const SymptomResultPage: React.FC = () => {
  const { lastSymptomResult, currentUser, saveSymptomResultToProfile, navigate } = useApp();
  const [saved, setSaved] = useState(false);

  // Fallback if accessed directly
  const result = lastSymptomResult || {
    id: 'sym_demo',
    patient_id: currentUser?.id || 'guest',
    date: new Date().toISOString(),
    primary_symptom: 'Headache & Mild Fever',
    duration: '1–3 days',
    severity: 5,
    associated_symptoms: ['Mild Nausea', 'Fatigue'],
    urgency_level: 'see_doctor_soon',
    summary: 'Your symptoms of persistent headache accompanied by low-grade fever indicate probable viral rhinosinusitis or tension syndrome. A consultation with a general physician is recommended to evaluate medication.',
    recommended_action: 'video',
    warning_signs: ['Temperature spikes above 102°F', 'Stiff neck or confusion', 'Persistent vomiting']
  };

  const handleSaveRecord = () => {
    if (!currentUser || currentUser.role !== 'patient') {
      navigate('/signup/patient');
      return;
    }
    saveSymptomResultToProfile(result);
    setSaved(true);
  };

  // Urgency badge color mapping per Part 1 & Part 4
  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return {
          bg: 'bg-red-50 text-[#DC2626] border-red-200',
          label: 'Emergency Care Required',
          dot: 'bg-[#DC2626]'
        };
      case 'see_doctor_soon':
        return {
          bg: 'bg-amber-50 text-[#D97706] border-amber-200',
          label: 'See a Doctor Soon (Within 24 Hours)',
          dot: 'bg-[#D97706]'
        };
      case 'routine':
        return {
          bg: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
          label: 'Routine / Non-Urgent Care',
          dot: 'bg-[#16A34A]'
        };
      case 'self_care':
      default:
        return {
          bg: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
          label: 'Self-Care Appropriate',
          dot: 'bg-[#16A34A]'
        };
    }
  };

  const config = getUrgencyConfig(result.urgency_level);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">Triage Assessment Summary</p>
              <h1 className="text-xl font-bold text-gray-900">{result.primary_symptom}</h1>
            </div>
          </div>

          {/* Urgency Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${config.bg}`}>
            <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
            <span>{config.label}</span>
          </div>
        </div>

        {/* AI Assessment Narrative */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Clinical Overview</h3>
          <p className="text-sm text-gray-800 leading-relaxed font-normal bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            {result.summary}
          </p>
        </div>

        {/* Associated Symptoms pills */}
        {result.associated_symptoms && result.associated_symptoms.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-2">Reported Factors:</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">Duration: {result.duration}</span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">Severity Score: {result.severity}/10</span>
              {result.associated_symptoms.map((s, idx) => (
                <span key={idx} className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-md font-medium">
                  + {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Next Step Box (Prominently Displayed per Part 4) */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-[#0F766E] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-white px-2.5 py-0.5 rounded border border-teal-200">
              Recommended Next Step
            </span>
          </div>

          {result.recommended_action === 'video' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Video className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Video Consultation with a PMC Physician</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    A telehealth consult allows a doctor to review your symptoms, formulate a treatment plan, and prescribe medication electronically.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking/new?type=video&symptomId=${result.id}`)}
                className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Book a Video Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : result.recommended_action === 'home_visit' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Car className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Request an At-Home Doctor Visit</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    A visiting physician or paramedic can measure vital signs (BP, Pulse, Blood Oxygen) and perform physical auscultation at your bedside with live GPS arrival tracking.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking/new?type=home_visit&symptomId=${result.id}`)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>Request a Home Visit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Self-Care Appropriate</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Drink plenty of fluids (water, ORS), rest adequately, and monitor your temperature twice daily.
                  </p>
                </div>
              </div>

              {/* Warning signs when to see a doctor anyway */}
              <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs space-y-1.5">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  When to see a doctor anyway:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  {result.warning_signs?.map((w, wIdx) => (
                    <li key={wIdx}>{w}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate('/doctors')}
                className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-[#0F766E]" />
                <span>Book a consultation anyway</span>
              </button>
            </div>
          )}
        </div>

        {/* Save to my health record button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Save className="w-4 h-4 text-[#0F766E]" />
            <span>Store this assessment in your permanent CNIC record</span>
          </div>

          <button
            onClick={handleSaveRecord}
            className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              saved 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                : 'bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved to Health History</span>
              </>
            ) : (
              <>
                <span>Save to my health record</span>
              </>
            )}
          </button>
        </div>

        {/* Medical Disclaimer per Part 4 */}
        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5 text-xs text-gray-500">
          <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Medical Disclaimer:</strong> This is an AI-assisted assessment, not a medical diagnosis. A licensed PMC doctor will review your case during your consultation.
          </p>
        </div>
      </div>
    </div>
  );
};
