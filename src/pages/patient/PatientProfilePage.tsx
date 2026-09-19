import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  ShieldCheck, 
  Save, 
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Phone,
  HeartPulse
} from 'lucide-react';
import { EmergencyButton } from '../../components/shared/EmergencyButton';

export const PatientProfilePage: React.FC = () => {
  const { patientProfile, updatePatientProfile, navigate } = useApp();

  const [name, setName] = useState(patientProfile.name);
  const [phone, setPhone] = useState(patientProfile.phone);
  const [bloodGroup, setBloodGroup] = useState(patientProfile.blood_group);
  const [allergies, setAllergies] = useState<string[]>(patientProfile.allergies);
  const [newAllergy, setNewAllergy] = useState('');
  const [conditions, setConditions] = useState<string[]>(patientProfile.known_conditions);
  const [newCondition, setNewCondition] = useState('');
  const [emergName, setEmergName] = useState(patientProfile.emergency_contact?.name || '');
  const [emergPhone, setEmergPhone] = useState(patientProfile.emergency_contact?.phone || '');
  const [emergRel, setEmergRel] = useState(patientProfile.emergency_contact?.relationship || '');
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Keep local form in sync with patient profile
  useEffect(() => {
    if (patientProfile.name && patientProfile.name !== name) {
      setName(patientProfile.name);
    }
  }, [patientProfile.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== patientProfile.name) {
      updatePatientProfile({ name: trimmed });
    }
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (item: string) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  const handleAddCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const handleRemoveCondition = (item: string) => {
    setConditions(conditions.filter(c => c !== item));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || patientProfile.name;
    const cleanPhone = phone.trim() || patientProfile.phone;
    updatePatientProfile({
      name: cleanName,
      phone: cleanPhone,
      blood_group: bloodGroup,
      allergies,
      known_conditions: conditions,
      emergency_contact: {
        name: emergName,
        phone: emergPhone,
        relationship: emergRel
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-20">
      <button
        onClick={() => navigate('/dashboard/patient')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Health Record Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your baseline medical facts, CNIC records, and emergency dispatch preferences.
          </p>
        </div>
        <EmergencyButton 
          callerRole="patient" 
          patientName={name}
        />
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile name and medical record updated. Changed everywhere across your portal and active consultations.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Demographics & Identity</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label 
                id="patient-full-name-label"
                htmlFor="patient-full-name-input"
                className="block text-xs font-semibold text-gray-800 mb-1.5 flex items-center justify-between"
              >
                <span>Full Legal Name</span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                  Synced Globally
                </span>
              </label>
              <input
                id="patient-full-name-input"
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                placeholder="Enter your full legal name"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 bg-white font-medium text-gray-900 shadow-2xs transition-all duration-150"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Updates your identity across header, appointments, consultations, and doctor portals.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">NADRA CNIC (Verified & Locked)</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={patientProfile.cnic}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 font-mono"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600 absolute right-3 top-3" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Locked to prevent unauthorized record tampering.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={e => setBloodGroup(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Known Allergies */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Allergies (Flags for Prescribing Doctors)</h3>
          
          <div className="flex flex-wrap gap-2">
            {allergies.map(a => (
              <span key={a} className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-medium">
                <span>{a}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(a)}
                  className="hover:text-red-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Penicillin, Sulfa, Peanuts..."
              value={newAllergy}
              onChange={e => setNewAllergy(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 flex-1"
            />
            <button
              type="button"
              onClick={handleAddAllergy}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Add Allergy
            </button>
          </div>
        </div>

        {/* Pre-Existing Conditions */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pre-Existing Chronic Conditions</h3>
          
          <div className="flex flex-wrap gap-2">
            {conditions.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-medium">
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(c)}
                  className="hover:text-teal-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma..."
              value={newCondition}
              onChange={e => setNewCondition(e.target.value)}
              className="text-xs px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 flex-1"
            />
            <button
              type="button"
              onClick={handleAddCondition}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Add Condition
            </button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Emergency Contact (Rescue 1122 & Doctor Link)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={emergName}
                onChange={e => setEmergName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship</label>
              <input
                type="text"
                value={emergRel}
                onChange={e => setEmergRel(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={emergPhone}
                onChange={e => setEmergPhone(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-6 py-3 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Health Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
