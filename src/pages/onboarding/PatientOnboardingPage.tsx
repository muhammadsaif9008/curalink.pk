import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Upload, 
  User, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';

export const PatientOnboardingPage: React.FC = () => {
  const { 
    currentUser, 
    patientProfile, 
    updatePatientProfile, 
    completePatientOnboarding, 
    navigate 
  } = useApp();

  // Resume at last incomplete step (Part 4 requirement!)
  const [step, setStep] = useState<number>(() => {
    return patientProfile.onboarding_step && patientProfile.onboarding_step < 4 
      ? patientProfile.onboarding_step 
      : 1;
  });

  const [cnic, setCnic] = useState(patientProfile.uid === 'patient_demo' ? '35201-8291048-2' : '');
  const [cnicPhotoUploaded, setCnicPhotoUploaded] = useState(false);
  const [dob, setDob] = useState(patientProfile.dob || '1996-05-14');
  const [gender, setGender] = useState(patientProfile.gender || 'female');
  const [city, setCity] = useState(patientProfile.city || 'Lahore');
  const [emergencyName, setEmergencyName] = useState(patientProfile.emergency_contact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile.emergency_contact?.phone || '');
  const [conditions, setConditions] = useState(patientProfile.known_conditions?.join(', ') || '');
  const [allergies, setAllergies] = useState(patientProfile.allergies?.join(', ') || '');
  const [medications, setMedications] = useState(patientProfile.current_medications?.join(', ') || '');
  const [surgeries, setSurgeries] = useState(patientProfile.past_surgeries?.join(', ') || '');
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Sync current step back to profile so resuming works if refreshed or logged out
  useEffect(() => {
    updatePatientProfile({ onboarding_step: step });
  }, [step]);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnic) return;
    updatePatientProfile({ onboarding_step: 2 });
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      dob,
      gender: gender as any,
      city,
      emergency_contact: {
        name: emergencyName || 'Family Contact',
        relationship: 'Emergency Contact',
        phone: emergencyPhone || '0300-1234567'
      },
      onboarding_step: 3
    });
    setStep(3);
  };

  const handleFinishSetup = () => {
    const knownArr = typeof conditions === 'string' ? conditions.split(',').map(s => s.trim()).filter(Boolean) : [];
    const allergiesArr = typeof allergies === 'string' ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
    const medsArr = typeof medications === 'string' ? medications.split(',').map(s => s.trim()).filter(Boolean) : [];
    const surgArr = typeof surgeries === 'string' ? surgeries.split(',').map(s => s.trim()).filter(Boolean) : [];

    updatePatientProfile({
      known_conditions: knownArr,
      allergies: allergiesArr,
      current_medications: medsArr,
      past_surgeries: surgArr,
      onboarding_step: 4
    });
    completePatientOnboarding();
    setShowInterstitial(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Progress Bar (4 Steps) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span className="text-[#0F766E]">Step {step} of 4</span>
          <span>{step === 1 ? 'CNIC Verification' : step === 2 ? 'Basic Profile' : step === 3 ? 'Medical History' : 'Review & Complete'}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#0F766E] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {!showInterstitial ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* STEP 1: CNIC Verification */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Step 1: Identity & Record Linking
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Enter your CNIC Number</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Used to securely link your health records — never shared with doctors without your consent.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Computerized National Identity Card (13 digits) *
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-teal-600 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 35201-8291048-2"
                      value={cnic}
                      onChange={e => setCnic(e.target.value)}
                      className="w-full text-sm font-mono pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Format: 12345-1234567-1. Outside of edit mode, your CNIC is displayed as <code>XXXXX-XXXXXXX-X</code> for privacy.
                  </p>
                </div>

                {/* Optional CNIC Photo Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center space-y-2 hover:border-teal-400 transition-colors bg-gray-50/50">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                  <p className="text-xs font-semibold text-gray-700">Upload CNIC Front Photo (Optional)</p>
                  <p className="text-[11px] text-gray-400">Speeds up identity verification at home doctor visits</p>
                  
                  {cnicPhotoUploaded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CNIC Front Uploaded & Encrypted
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCnicPhotoUploaded(true)}
                      className="text-xs font-bold text-[#0F766E] underline hover:text-[#0B5C56] cursor-pointer"
                    >
                      Attach demo CNIC scan
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Basic Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Basic Profile */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Step 2: Demographics
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">Basic Personal Profile</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Essential for pediatric vs adult dosing and emergency contact.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary City (Pakistan) *</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <p className="text-xs font-bold text-gray-800">Emergency Contact (Optional but Recommended)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Contact Name (e.g. Hamza)"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone (0300-1234567)"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Medical History</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Baseline Medical History */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    Step 3: Clinical Baseline
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">Baseline Medical History</h1>
                  <p className="text-xs text-gray-500 mt-1">
                    All fields are optional. Doctors review these before prescribing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishSetup}
                  className="text-xs font-bold text-gray-500 hover:text-teal-700 underline cursor-pointer"
                >
                  Skip for now
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Known Pre-existing Conditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Mild Asthma, Hypertension, Diabetes Type 2"
                    value={conditions}
                    onChange={e => setConditions(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Known Allergies (Crucial for Prescriptions)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Dust"
                    value={allergies}
                    onChange={e => setAllergies(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Daily Medications</label>
                  <input
                    type="text"
                    placeholder="e.g. Metformin 500mg, Inhaler as needed"
                    value={medications}
                    onChange={e => setMedications(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Past Surgeries / Major Procedures</label>
                  <input
                    type="text"
                    placeholder="e.g. Appendectomy (2018), Cesarean (2021)"
                    value={surgeries}
                    onChange={e => setSurgeries(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishSetup}
                  className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish setup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 4 INTERSTITIAL SCREEN (Part 4 specification!) */
        <div className="bg-white border border-teal-200 rounded-2xl p-8 sm:p-10 shadow-md text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Profile Setup Complete
            </span>
            <h2 className="text-2xl font-bold text-gray-900">
              Thanks, {currentUser?.name || 'Zainab'}. Let's check how you're feeling.
            </h2>
            <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
              Your CNIC-linked medical profile is securely saved. Would you like to run an instant AI symptom check or proceed to your dashboard?
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <button
              onClick={() => navigate('/symptom-check')}
              className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 px-6 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Symptom Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <button
              onClick={() => navigate('/dashboard/patient')}
              className="text-xs text-gray-500 hover:text-gray-800 underline font-medium cursor-pointer"
            >
              Skip for now, go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
