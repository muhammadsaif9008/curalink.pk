import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  AlertTriangle, 
  PhoneCall, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  MapPin,
  HeartCrack
} from 'lucide-react';
import { SymptomCheckResult } from '../../types';

export const SymptomCheckPage: React.FC = () => {
  const { navigate, setLastSymptomResult, currentUser } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [primarySymptom, setPrimarySymptom] = useState<string>('');
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<number>(5);
  const [selectedAssociated, setSelectedAssociated] = useState<string[]>([]);
  const [hasRedFlag, setHasRedFlag] = useState<boolean>(false);
  const [redFlagReason, setRedFlagReason] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  // Red-flag triggers (Part 4 requirement: Continuous Red-Flag Emergency Detection)
  const RED_FLAG_KEYWORDS = [
    { term: 'chest pain', message: 'Severe chest pain radiating to arm or jaw could indicate acute coronary syndrome.' },
    { term: 'breathing', message: 'Severe shortness of breath or respiratory distress requires immediate emergency intervention.' },
    { term: 'speech', message: 'Sudden loss of speech, facial drooping, or limb weakness could indicate a stroke.' },
    { term: 'blood', message: 'Coughing up blood or acute severe hemorrhaging requires emergency medical care.' },
    { term: 'unconscious', message: 'Loss of consciousness or fainting spells requires immediate ER evaluation.' },
    { term: 'heart attack', message: 'Suspected cardiac events require immediate 1122 ambulance response.' }
  ];

  const checkRedFlags = (text: string) => {
    const lower = text.toLowerCase();
    for (const item of RED_FLAG_KEYWORDS) {
      if (lower.includes(item.term)) {
        setHasRedFlag(true);
        setRedFlagReason(item.message);
        return true;
      }
    }
    return false;
  };

  const handleCustomSymptomChange = (val: string) => {
    setCustomSymptom(val);
    checkRedFlags(val);
  };

  const handleSelectPrimary = (s: string) => {
    setPrimarySymptom(s);
    checkRedFlags(s);
  };

  const toggleAssociated = (s: string) => {
    checkRedFlags(s);
    if (selectedAssociated.includes(s)) {
      setSelectedAssociated(prev => prev.filter(item => item !== s));
    } else {
      setSelectedAssociated(prev => [...prev, s]);
    }
  };

  // Associated symptom questions mapped to primary
  const getAssociatedOptions = () => {
    const sym = (primarySymptom || customSymptom).toLowerCase();
    if (sym.includes('fever')) {
      return ['Chills / Rigors', 'Body Aches', 'Severe Headache', 'Loss of Taste/Smell', 'Rash', 'Difficulty breathing'];
    }
    if (sym.includes('stomach') || sym.includes('abdomen')) {
      return ['Nausea / Vomiting', 'Diarrhea', 'Bloating', 'High Fever', 'Blood in stool'];
    }
    if (sym.includes('headache')) {
      return ['Nausea', 'Sensitivity to light', 'Neck stiffness', 'Sudden loss of speech / vision blur', 'Dizziness'];
    }
    if (sym.includes('cough')) {
      return ['Fever', 'Sore Throat', 'Shortness of breath', 'Chest tightness', 'Coughing blood'];
    }
    return ['Mild Fever', 'Fatigue / Weakness', 'Nausea', 'Loss of appetite', 'Sleep difficulty', 'Chest pain'];
  };

  const runAnalysis = () => {
    setAnalyzing(true);

    setTimeout(() => {
      setAnalyzing(false);

      const symptomName = primarySymptom === 'Other' ? customSymptom : (primarySymptom || customSymptom || 'General malaise');
      
      // Determine urgency and recommendation based on inputs
      let urgency: 'emergency' | 'see_doctor_soon' | 'routine' | 'self_care' = 'routine';
      let rec: 'video' | 'home_visit' | 'self_care' | 'emergency' = 'video';
      let summary = '';
      let warnings: string[] = [];

      if (severity >= 8 || duration === 'More than a week') {
        urgency = 'see_doctor_soon';
        rec = 'home_visit';
        summary = `Your report of severe ${symptomName} lasting ${duration} requires clinical physical examination. An at-home physician consultation with vital sign monitoring is advised to rule out complications.`;
        warnings = ['High continuous fever over 102°F', 'Inability to keep oral fluids down', 'Rapid pulse or dizziness upon standing'];
      } else if (severity >= 5 || duration === '4–7 days') {
        urgency = 'see_doctor_soon';
        rec = 'video';
        summary = `Your symptoms are consistent with moderate ${symptomName}. A telehealth video consultation with a PMC general physician can evaluate prescription therapies and clinical management.`;
        warnings = ['Symptom worsening after 48 hours', 'Development of high fever or productive cough'];
      } else {
        urgency = 'self_care';
        rec = 'self_care';
        summary = `Your symptoms indicate mild, acute ${symptomName}. Safe symptomatic home protocols and hydration are appropriate.`;
        warnings = ['Fever persisting past 3 days', 'Severe pain spikes', 'Development of shortness of breath'];
      }

      const mockResult: SymptomCheckResult = {
        id: 'sym_' + Date.now(),
        patient_id: currentUser?.id || 'guest',
        date: new Date().toISOString(),
        primary_symptom: symptomName,
        duration: duration || '1–3 days',
        severity,
        associated_symptoms: selectedAssociated,
        urgency_level: urgency,
        summary,
        recommended_action: rec,
        warning_signs: warnings
      };

      setLastSymptomResult(mockResult);
      navigate('/symptom-check/result');
    }, 1200);
  };

  /* RED-FLAG INTERRUPT SCREEN (Hard non-skippable interrupt per Part 4) */
  if (hasRedFlag) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#DC2626] text-white rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 animate-in zoom-in-95">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <HeartCrack className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded text-white">
                Hard Clinical Red Flag Detected
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
                Emergency Alert: Please Seek Immediate Emergency Care
              </h1>
            </div>
          </div>

          <div className="p-4 bg-red-800/60 rounded-xl border border-red-400/40 text-xs sm:text-sm leading-relaxed">
            <p className="font-bold mb-1">Clinical Warning:</p>
            <p>{redFlagReason || 'Your described symptoms may represent a critical cardiovascular, neurological, or respiratory emergency that cannot be safely managed online.'}</p>
          </div>

          <p className="text-xs text-red-100 leading-relaxed">
            Triage has been suspended. Please do not wait for a video consultation or standard appointment. Dispatch emergency responders or proceed directly to an emergency department.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="tel:1122"
              className="bg-white hover:bg-gray-100 text-red-600 text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 text-center"
            >
              <PhoneCall className="w-5 h-5 fill-current" />
              <span>Call Rescue 1122 (Toll Free)</span>
            </a>

            <button
              onClick={() => navigate('/hospitals')}
              className="bg-red-900/80 hover:bg-red-900 text-white text-xs font-bold px-5 py-3.5 rounded-xl border border-red-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>View Tertiary Hospitals Directory</span>
            </button>
          </div>

          <div className="pt-4 border-t border-red-500/50 flex justify-between items-center text-[11px] text-red-200">
            <span>Rescue 1122 • Edhi 115 • Chhipa 1020</span>
            <button
              onClick={() => { setHasRedFlag(false); setCustomSymptom(''); }}
              className="text-white underline hover:text-red-100 cursor-pointer text-xs"
            >
              Reset Symptom Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Step Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span className="text-[#0F766E]">Question {currentStep} of 4</span>
          <span>
            {currentStep === 1 ? "What's bothering you?" :
             currentStep === 2 ? "Duration" :
             currentStep === 3 ? "Severity Score" : "Associated Symptoms"}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#0F766E] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {analyzing ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-5 shadow-xs animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Analyzing with clinical AI...</h2>
            <p className="text-xs text-gray-500">
              Evaluating symptom timeline, severity index, and evidence-based care routing protocols.
            </p>
          </div>
          <div className="w-48 bg-gray-100 h-1.5 rounded-full mx-auto overflow-hidden">
            <div className="bg-[#0F766E] h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* QUESTION 1: What's bothering you today? */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Question 1
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">What's bothering you today?</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the closest primary symptom or type in your own description.
                </p>
              </div>

              {/* Quick-select chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  'Fever & Chills', 
                  'Headache / Migraine', 
                  'Cough & Chest Cold', 
                  'Stomach / Abdominal Pain', 
                  'Skin Rash / Allergy', 
                  'Throat Infection',
                  'Body Aches / Fatigue',
                  'Nausea & Vomiting',
                  'Other'
                ].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectPrimary(item)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      primarySymptom === item 
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-2xs' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Or describe in your own words:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mild headache and feeling feverish since yesterday"
                  value={customSymptom}
                  onChange={e => handleCustomSymptomChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="button"
                disabled={!primarySymptom && !customSymptom}
                onClick={() => setCurrentStep(2)}
                className="w-full bg-[#0F766E] hover:bg-[#0B5C56] disabled:bg-gray-300 text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Duration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* QUESTION 2: How long have you had this? */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Question 2
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">How long have you had this?</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Symptom duration helps determine acute vs chronic presentation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: '<24 hours', desc: 'Started very recently today' },
                  { label: '1–3 days', desc: 'Past few days' },
                  { label: '4–7 days', desc: 'Ongoing for about a week' },
                  { label: 'More than a week', desc: 'Persistent for over 7 days' }
                ].map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDuration(opt.label)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      duration === opt.label 
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-2xs' 
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!duration}
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] disabled:bg-gray-300 text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Severity</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 3: How severe is it right now? */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Question 3
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">How severe is it right now?</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Rate your discomfort from 1 (mild annoyance) to 10 (unbearable pain).
                </p>
              </div>

              <div className="space-y-6 py-4">
                <div className="text-center">
                  <span className={`text-4xl font-extrabold ${
                    severity <= 3 ? 'text-emerald-600' : severity <= 6 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {severity} <span className="text-base font-medium text-gray-400">/ 10</span>
                  </span>
                  <p className="text-xs font-bold mt-1 text-gray-700">
                    {severity <= 3 ? 'Mild (Noticeable but daily routine is normal)' :
                     severity <= 6 ? 'Moderate (Interferes with sleep or work)' :
                     'Severe (Disabling, requires immediate clinical attention)'}
                  </p>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={e => setSeverity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                />

                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>1 - Very Mild</span>
                  <span>5 - Moderate</span>
                  <span>10 - Unbearable</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Associated Symptoms</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 4: Associated symptoms */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Question 4 (Final)
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Do you have any associated symptoms?</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Select all that apply to help the AI narrow down possible clinical causes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {getAssociatedOptions().map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAssociated(item)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedAssociated.includes(item)
                        ? 'bg-teal-50 border-[#0F766E] text-[#0F766E]'
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{item}</span>
                    {selectedAssociated.includes(item) && (
                      <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={runAnalysis}
                  className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze my symptoms</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
