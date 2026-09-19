import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  PhoneCall, 
  MapPin, 
  Search, 
  ShieldAlert, 
  Clock, 
  Car, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Star, 
  Stethoscope,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { PARTNER_HOSPITALS, HospitalInfo } from '../../data/patientPortalData';
import { EMERGENCY_FACILITIES } from '../../data/seedData';
import { HospitalDoctorsModal } from '../../components/hospitals/HospitalDoctorsModal';

export const HospitalsAndERPage: React.FC = () => {
  const { navigate, searchParams } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'tertiary' | 'trauma'>('all');
  const [selectedHospitalForDoctors, setSelectedHospitalForDoctors] = useState<HospitalInfo | null>(null);

  // Auto-open modal if hospital is specified in URL query
  useEffect(() => {
    const hospId = searchParams?.hospital || 
      searchParams?.bookHospital || 
      new URLSearchParams(window.location.search).get('hospital') || 
      new URLSearchParams(window.location.search).get('bookHospital');

    if (hospId) {
      const targetHosp = PARTNER_HOSPITALS.find(h => h.id === hospId);
      if (targetHosp) {
        setSelectedHospitalForDoctors(targetHosp);
      }
    }
  }, [searchParams]);

  const filteredHospitals = useMemo(() => {
    return PARTNER_HOSPITALS.filter(h => {
      const matchCity = selectedCity === 'All' || h.city.toLowerCase() === selectedCity.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.departments.some(dep => dep.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchQuery;
    });
  }, [selectedCity, searchQuery]);

  const filteredTraumaFacilities = useMemo(() => {
    return EMERGENCY_FACILITIES.filter(f => {
      const matchCity = selectedCity === 'All' || f.city.toLowerCase().includes(selectedCity.toLowerCase());
      const matchQuery = !searchQuery.trim() || 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCity && matchQuery;
    });
  }, [selectedCity, searchQuery]);

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-gray-900 pb-20">
      {/* 1. Emergency Top Banner & Quick Hotlines */}
      <section className="bg-gradient-to-b from-red-50/70 via-white to-white border-b border-gray-200 pt-8 pb-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Hospitals & Emergency (ER)</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>24/7 Tertiary Trauma Care & Accredited Facilities</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Partner Hospitals & Emergency Rooms
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Direct integration with Pakistan's leading accredited tertiary hospitals, equipped with intensive care units (ICU), dedicated burn centers, and 24/7 trauma triage.
              </p>
            </div>

            {/* Quick Urgent Dial */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
              <a
                href="tel:1122"
                id="er-page-call-1122"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <PhoneCall className="w-4 h-4 fill-current" />
                <span>Rescue 1122 (Toll-Free)</span>
              </a>
              <button
                onClick={() => navigate('/doctors')}
                className="bg-white hover:bg-gray-50 text-teal-800 border border-teal-300 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Consult Hospital Specialists</span>
              </button>
            </div>
          </div>

          {/* 4 Nationwide Emergency Hotlines */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Rescue & Ambulance</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black text-red-600">1122</span>
                <a href="tel:1122" className="text-[11px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-100">Dial</a>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Nationwide Government Service</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Edhi Foundation Ambulance</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black text-red-600">115</span>
                <a href="tel:115" className="text-[11px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-100">Dial</a>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Largest Free Fleet</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">Chhipa Ambulance Hotline</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black text-red-600">1020</span>
                <a href="tel:1020" className="text-[11px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded hover:bg-red-100">Dial</a>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Sindh / Karachi Urban</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] text-gray-500 font-medium">CuraLink Care Coordination</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base font-black text-teal-700">0300-4829103</span>
                <button onClick={() => navigate('/booking/new?type=home_visit')} className="text-[11px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded hover:bg-teal-100 cursor-pointer">Book Visit</button>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Bedside Nurse / Paramedic Care (Isl / Rwp)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & City Filters Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* City Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-500 shrink-0 mr-1">City:</span>
            {['All', 'Islamabad', 'Rawalpindi'].map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCity === city
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search hospital name, department, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Partner Accredited Hospitals Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              <span>Accredited Tertiary Hospitals ({filteredHospitals.length})</span>
            </h2>
            <p className="text-xs text-gray-500">
              Verified clinical standards, certified trauma emergency rooms, and ambulance handoff agreements.
            </p>
          </div>
        </div>

        {filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="bg-white border border-gray-200 hover:border-teal-500 rounded-2xl overflow-hidden shadow-2xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Hospital Image & Status Badges */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-white/95 backdrop-blur-xs text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {hospital.city}
                      </span>
                      {hospital.hasEmergency247 && (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          <span>24/7 ER</span>
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded-md text-xs font-bold text-amber-600 shadow-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{hospital.rating}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({hospital.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Hospital Details */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {hospital.type}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-1 leading-snug">
                        {hospital.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{hospital.address}</span>
                      </p>
                    </div>

                    {/* Departments Tag Cloud */}
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Key Departments:</p>
                      <div className="flex flex-wrap gap-1">
                        {hospital.departments.slice(0, 4).map((dep, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded">
                            {dep}
                          </span>
                        ))}
                        {hospital.departments.length > 4 && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            +{hospital.departments.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Call and Doctor Dispatch */}
                <div className="p-4 pt-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Direct ER Hotline:</span>
                    <strong className="text-red-600 font-mono font-bold">{hospital.emergencyHotline}</strong>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${hospital.phone.replace(/[^0-9]/g, '')}`}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Hospital</span>
                    </a>
                    <button
                      id={`book-doctor-${hospital.id}`}
                      onClick={() => setSelectedHospitalForDoctors(hospital)}
                      className="flex-1 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#0D9488] hover:to-[#0F766E] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-sm active:scale-[0.98] border border-teal-600/30"
                      title={`View and book available doctors at ${hospital.name}`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-teal-100" />
                      <span>Book Doctor</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">No partner hospitals match your search</h3>
            <p className="text-xs text-gray-500">Try adjusting your city filter or searching for another term.</p>
            <button
              onClick={() => { setSelectedCity('All'); setSearchQuery(''); }}
              className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. Verified Trauma Centers and Ambulance Points */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Specialized Emergency Trauma Centers</span>
              </h2>
              <p className="text-xs text-gray-500">
                Major government and military tertiary centers for acute burn trauma, cardiac emergencies, and neuro-critical care.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTraumaFacilities.map((fac, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50/40 hover:bg-white transition-colors flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">{fac.city}</span>
                    <span className="text-red-700 font-semibold text-[10px] uppercase">24/7 Trauma</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mt-1">{fac.name}</h4>
                  <p className="text-[11px] text-gray-600">{fac.type}</p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>{fac.address}</span>
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-red-600">{fac.phone}</span>
                  <a
                    href={`tel:${fac.phone.replace(/[^0-9]/g, '')}`}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded-lg transition-colors"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Triage Helper CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10">
        <div className="bg-gradient-to-r from-teal-900 to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Unsure whether you need the ER or a Doctor?</h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Use our AI Clinical Triage to assess your symptoms in 60 seconds. We'll identify emergency red flags and advise whether an ER visit, bedside nurse care, or doctor video/clinic consultation is right.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/symptom-check')}
              className="bg-white hover:bg-teal-50 text-[#0F766E] font-bold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Start Free AI Triage
            </button>
            <button
              onClick={() => navigate('/doctors')}
              className="bg-teal-800/80 hover:bg-teal-800 text-white border border-teal-500/50 font-bold text-xs px-4 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Browse Verified Doctors
            </button>
          </div>
        </div>
      </section>

      {/* Hospital Doctors Search & Direct Booking Modal */}
      <HospitalDoctorsModal
        hospital={selectedHospitalForDoctors}
        isOpen={!!selectedHospitalForDoctors}
        onClose={() => setSelectedHospitalForDoctors(null)}
      />
    </div>
  );
};
