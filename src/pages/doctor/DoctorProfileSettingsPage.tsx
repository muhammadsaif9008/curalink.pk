import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Video, 
  Building2,
  Car, 
  CreditCard,
  MapPin
} from 'lucide-react';
import { EmergencyButton } from '../../components/shared/EmergencyButton';

export const DoctorProfileSettingsPage: React.FC = () => {
  const { doctorProfile, updateDoctorProfile } = useApp();

  const [bio, setBio] = useState(doctorProfile.bio);
  const [qualifications, setQualifications] = useState(doctorProfile.qualifications);
  const [hospitalAffiliation, setHospitalAffiliation] = useState(doctorProfile.hospital_affiliation);
  const [city, setCity] = useState(doctorProfile.city || 'Islamabad');
  const [videoFee, setVideoFee] = useState(doctorProfile.video_fee);
  const [offersVideo, setOffersVideo] = useState(doctorProfile.offers_video ?? true);
  const [offersClinic, setOffersClinic] = useState(doctorProfile.offers_clinic ?? true);
  const [clinicFee, setClinicFee] = useState(doctorProfile.clinic_fee || 2000);
  const [clinicAddress, setClinicAddress] = useState(doctorProfile.clinic_address || 'Executive OPD Clinics, Blue Area, Islamabad');

  const [bankTitle, setBankTitle] = useState('Dr. ' + doctorProfile.name.replace('Dr. ', ''));
  const [bankName, setBankName] = useState('Habib Bank Limited (HBL)');
  const [iban, setIban] = useState('PK36HABB0001234567890102');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateDoctorProfile({
      bio,
      qualifications,
      hospital_affiliation: hospitalAffiliation,
      city,
      video_fee: Number(videoFee),
      offers_video: offersVideo,
      offers_clinic: offersClinic,
      clinic_fee: Number(clinicFee),
      clinic_address: clinicAddress,
      offers_home_visit: false, // Doctors do clinic & video only
      home_visit_fee: 0,
      home_visit_radius_km: 0
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Top Header Card with Doctor Overview */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              PMC Verified ({doctorProfile.pmc_license_number})
            </span>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {doctorProfile.city} Clinical Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Dr. {doctorProfile.name.replace('Dr. ', '')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {doctorProfile.specialty} • {doctorProfile.hospital_affiliation} • Doctor Practice Profile & Settings
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <EmergencyButton callerRole="doctor" />
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Doctor profile and consultation fee rates updated live on patient search directory.</span>
        </div>
      )}

      {/* Doctor Profile Content Only - Practice Settings, Credentials, Fees & Remittance */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Verification Strip */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
            <div>
              <p className="font-bold text-teal-950">PMC Verified Practitioner</p>
              <p className="text-teal-800 font-mono text-[11px]">License: {doctorProfile.pmc_license_number}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
            Active Status
          </span>
        </div>

        {/* Clinical Bio & Qualifications */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Clinical Profile</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Qualifications & Degrees</label>
            <input
              type="text"
              required
              value={qualifications}
              onChange={e => setQualifications(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Hospital / Clinic Affiliation</label>
              <input
                type="text"
                required
                value={hospitalAffiliation}
                onChange={e => setHospitalAffiliation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Practicing City (Hub)</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
              >
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Doctor Biography & Practice Overview</label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Services & Fees (Video & Clinic OPD) */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Consultation Modes & Practice Settings (Islamabad / Rawalpindi)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Video Service */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                  <Video className="w-4 h-4 text-blue-600" />
                  Telehealth Video
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offersVideo}
                    onChange={e => setOffersVideo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">Video Fee (PKR)</label>
                <input
                  type="number"
                  step="100"
                  value={videoFee}
                  onChange={e => setVideoFee(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
                <p className="text-[10px] text-gray-500 mt-1">Includes HD video consultation, AI clinical scribe report, digital prescription, and follow-up plan.</p>
              </div>
            </div>

            {/* In-Clinic OPD Service */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-teal-900">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  In-Clinic OPD
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={offersClinic}
                    onChange={e => setOffersClinic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">In-Clinic OPD Fee (PKR)</label>
                <input
                  type="number"
                  step="100"
                  value={clinicFee}
                  onChange={e => setClinicFee(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white"
                />
                <input
                  type="text"
                  value={clinicAddress}
                  onChange={e => setClinicAddress(e.target.value)}
                  placeholder="Clinic room/address in Isl/Rwp"
                  className="w-full text-[11px] px-2.5 py-1.5 mt-2 rounded border border-gray-300 bg-white"
                />
              </div>
            </div>

            {/* Home Bedside Care Notification */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
                  <Car className="w-4 h-4 text-emerald-700" />
                  Home Bedside Visits
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Nurses Only</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Home bedside visits in Islamabad & Rawalpindi are staffed exclusively by certified <strong>Nurses & Paramedics</strong> (PNC & Rescue 1122 accredited) for bedside procedures, vitals, and wound care.
              </p>
              <p className="text-[10px] text-emerald-800 font-medium">
                Doctors provide clinical care through Video Telehealth or In-Clinic OPD only.
              </p>
            </div>
          </div>
        </div>

        {/* Bank Account Info for Earnings Deposit */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-[#0F766E]" />
            <span>Earnings Remittance Bank Account (Pakistan IBAN)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Account Title</label>
              <input
                type="text"
                value={bankTitle}
                onChange={e => setBankTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
              >
                <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                <option value="Meezan Bank">Meezan Bank</option>
                <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                <option value="MCB Bank">MCB Bank</option>
                <option value="Allied Bank Limited (ABL)">Allied Bank Limited (ABL)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">24-Character IBAN Number</label>
            <input
              type="text"
              value={iban}
              onChange={e => setIban(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 font-mono focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-6 py-3 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Update Practice Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
