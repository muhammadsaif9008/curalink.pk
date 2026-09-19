import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  MapPin, 
  PhoneCall, 
  Star, 
  Calendar, 
  Video, 
  Car, 
  Sparkles, 
  Building2, 
  HeartPulse, 
  ChevronDown, 
  Activity,
  Award,
  BookOpen,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { 
  COMMON_DISEASES, 
  PARTNER_HOSPITALS, 
  POPULAR_SYMPTOMS 
} from '../data/patientPortalData';
import { PatientChatbot } from '../components/patient/PatientChatbot';

export const LandingPage: React.FC = () => {
  const { navigate, doctors, nursesParamedics } = useApp();

  // Search Bar State
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchCategory, setSearchCategory] = useState<'all' | 'doctors' | 'homecare' | 'symptoms' | 'diseases' | 'hospitals'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Showcase Tab: 'homecare' or 'doctors'
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'homecare' | 'doctors'>('homecare');
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>('All');

  const verifiedDoctors = useMemo(() => {
    return (doctors || []).filter(d => d.verification_status === 'approved' || !d.verification_status);
  }, [doctors]);

  // Filtered Doctors for Featured Showcase
  const filteredDoctors = useMemo(() => {
    return verifiedDoctors.filter(doc => {
      const matchSpecialty = doctorSpecialty === 'All' || doc.specialty.toLowerCase().includes(doctorSpecialty.toLowerCase());
      const matchCity = selectedCity === 'All' || doc.city.toLowerCase() === selectedCity.toLowerCase();
      return matchSpecialty && matchCity;
    });
  }, [verifiedDoctors, doctorSpecialty, selectedCity]);

  // Filtered Home Care Staff
  const filteredHomeCare = useMemo(() => {
    return (nursesParamedics || []).filter(staff => {
      return selectedCity === 'All' || staff.city.toLowerCase() === selectedCity.toLowerCase();
    });
  }, [nursesParamedics, selectedCity]);

  // Search Results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && selectedCity === 'All' && searchCategory === 'all') return null;

    const matchedDocs = verifiedDoctors.filter(d => {
      const cityMatch = selectedCity === 'All' || d.city.toLowerCase() === selectedCity.toLowerCase();
      const textMatch = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.hospital_affiliation.toLowerCase().includes(q);
      return cityMatch && textMatch;
    });

    const matchedHomeCare = (nursesParamedics || []).filter(s => {
      const cityMatch = selectedCity === 'All' || s.city.toLowerCase() === selectedCity.toLowerCase();
      const textMatch = !q || s.name.toLowerCase().includes(q) || s.title.toLowerCase().includes(q) || s.services_offered.some(srv => srv.toLowerCase().includes(q));
      return cityMatch && textMatch;
    });

    const matchedDiseases = COMMON_DISEASES.filter(dis => {
      return !q || dis.name.toLowerCase().includes(q) || dis.urduName.includes(q) || dis.keySymptoms.some(s => s.toLowerCase().includes(q));
    });

    const matchedHospitals = PARTNER_HOSPITALS.filter(h => {
      const cityMatch = selectedCity === 'All' || h.city.toLowerCase() === selectedCity.toLowerCase();
      const textMatch = !q || h.name.toLowerCase().includes(q) || h.departments.some(dep => dep.toLowerCase().includes(q));
      return cityMatch && textMatch;
    });

    return {
      doctors: matchedDocs,
      homecare: matchedHomeCare,
      diseases: matchedDiseases,
      hospitals: matchedHospitals
    };
  }, [searchQuery, selectedCity, searchCategory, verifiedDoctors, nursesParamedics]);

  const hasSearchInput = Boolean(searchQuery.trim() || (selectedCity !== 'All' && searchCategory !== 'all'));

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-gray-900 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-teal-50/50 via-white to-white border-b border-gray-200/80 pt-10 pb-14 sm:pt-14 sm:pb-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-teal-800 text-xs font-semibold border border-teal-200 shadow-2xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
            </span>
            <span>Pakistan's Licensed Healthcare Network • PMC & PNC Certified</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.12]">
            Healthcare made simple: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6]">
              Home Visits & Online Doctors
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Need a certified Nurse at home for IV drips and vitals, or a verified specialist doctor on video? CuraLink connects Pakistani families to verified clinical care in minutes.
          </p>

          {/* UNIFIED SEARCH BAR CONSOLE */}
          <div className="pt-2 max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 hover:border-teal-400 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-50 rounded-2xl p-2 shadow-lg shadow-teal-950/5 transition-all flex flex-col md:flex-row items-stretch md:items-center gap-2">
              {/* City Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50/80 hover:bg-gray-100/70 rounded-xl shrink-0 border border-gray-200/60 transition-colors">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <select
                  id="hero-city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  <option value="All">All Pakistan</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none shrink-0" />
              </div>

              {/* Service Type Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50/80 hover:bg-gray-100/70 rounded-xl shrink-0 border border-gray-200/60 transition-colors">
                <Activity className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <select
                  id="hero-category-select"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value as any)}
                  className="text-xs font-semibold text-gray-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Services</option>
                  <option value="homecare">Home Visit (Nurses)</option>
                  <option value="doctors">Doctors (Specialists)</option>
                  <option value="symptoms">Symptoms</option>
                  <option value="diseases">Diseases</option>
                  <option value="hospitals">Hospitals</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none shrink-0" />
              </div>

              {/* Text Input Field */}
              <div className="flex-1 flex items-center px-3 py-1.5 min-w-0">
                <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="Search doctor, nurse service (e.g. IV drip), or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none font-normal"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-gray-400 hover:text-gray-600 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    const el = document.getElementById('search-results-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    const el = document.getElementById('care-showcase-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#0D9488] hover:to-[#0F766E] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Symptom Chips */}
            <div className="mt-3 flex items-center justify-center gap-1.5 flex-wrap text-xs text-gray-500">
              <span className="text-[11px] font-medium text-gray-400">Popular:</span>
              {POPULAR_SYMPTOMS.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSearchQuery(s.searchKey);
                    setSearchCategory('symptoms');
                  }}
                  className="bg-white hover:bg-teal-50 hover:text-teal-800 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setSearchQuery('IV drip');
                  setSearchCategory('homecare');
                }}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer"
              >
                💉 Home IV Drip
              </button>
            </div>
          </div>

          {/* 3 CORE PILLARS OF CARE - HIGH CLARITY CARDS */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
            {/* Card 1: Home Visit (Nurse / Paramedic) */}
            <div 
              id="hero-card-home-visit"
              onClick={() => navigate('/home-care')}
              className="bg-white hover:bg-emerald-50/40 border-2 border-emerald-200/90 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Car className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                    Live GPS Arrival
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                  <span>Home Visit: Nurse & Paramedic</span>
                </h2>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Certified PNC Nurses & Rescue 1122 paramedics arrive at your doorstep for IV drips, blood sugar, vitals, injections, and sterile wound dressing.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700">From Rs. 1,000</span>
                <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Book Home Visit →
                </span>
              </div>
            </div>

            {/* Card 2: Specialist Doctors */}
            <div 
              id="hero-card-doctors"
              onClick={() => navigate('/doctors')}
              className="bg-white hover:bg-teal-50/40 border border-gray-200 hover:border-teal-500 rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0F766E] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                    PMC Verified
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-[#0F766E]">
                  Specialist Doctors (Video/Clinic)
                </h2>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Consult verified specialists in General Medicine, Pediatrics, Chest/Lungs, Skin, and Cardiology via instant HD video or in-clinic.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800">From Rs. 1,200</span>
                <span className="text-xs font-bold text-teal-800 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Find Doctors →
                </span>
              </div>
            </div>

            {/* Card 3: Free AI Symptom Triage */}
            <div 
              id="hero-card-symptom-check"
              onClick={() => navigate('/symptom-check')}
              className="bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    Free • 60 Seconds
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-900">
                  AI Symptom Triage
                </h2>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Not sure what specialist you need? Answer 3 quick questions in Urdu or English to check clinical severity and get recommended next steps.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">100% Free</span>
                <span className="text-xs font-bold text-blue-700 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Check Symptoms →
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SEARCH RESULTS (Visible only when searching) */}
      {hasSearchInput && searchResults && (
        <section id="search-results-section" className="max-w-5xl mx-auto px-4 sm:px-8 pt-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">
                Search Results ({searchResults.doctors.length + searchResults.homecare.length + searchResults.diseases.length + searchResults.hospitals.length})
              </h2>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCity('All'); setSearchCategory('all'); }}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
              >
                Reset Search
              </button>
            </div>

            {/* Home Care Results */}
            {(searchCategory === 'all' || searchCategory === 'homecare') && searchResults.homecare.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Home Care Staff (Nurses & Paramedics)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.homecare.map((staff) => (
                    <div key={staff.id} className="p-3 border border-emerald-200 bg-emerald-50/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={staff.photo_url} alt={staff.name} className="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{staff.name}</p>
                          <p className="text-[11px] text-emerald-800 font-medium truncate">{staff.title}</p>
                          <p className="text-[10px] text-gray-500">{staff.city} • Rs {staff.home_visit_fee}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/booking/new?type=home_visit&staffId=${staff.id}`)}
                        className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-800 shrink-0 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctors Results */}
            {(searchCategory === 'all' || searchCategory === 'doctors') && searchResults.doctors.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Specialist Doctors</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.doctors.map((doc) => (
                    <div key={doc.id || doc.uid} className="p-3 border border-gray-200 rounded-xl flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={doc.photo_url} alt={doc.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                          <p className="text-[11px] text-teal-800 font-medium truncate">{doc.specialty}</p>
                          <p className="text-[10px] text-gray-500">PMC: {doc.pmc_license_number}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/booking/new?doctorId=${doc.id || doc.uid}`)}
                        className="text-xs bg-[#0F766E] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#0B5C56] shrink-0 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diseases Results */}
            {(searchCategory === 'all' || searchCategory === 'diseases' || searchCategory === 'symptoms') && searchResults.diseases.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Health Conditions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.diseases.map((dis) => (
                    <div 
                      key={dis.id} 
                      onClick={() => navigate('/diseases')}
                      className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-900">{dis.name}</p>
                        <span className="text-[11px] text-teal-800 font-bold">{dis.urduName}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{dis.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hospitals Results */}
            {(searchCategory === 'all' || searchCategory === 'hospitals') && searchResults.hospitals.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Hospitals & Centers</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.hospitals.map((hosp) => (
                    <div key={hosp.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{hosp.name}</p>
                        <p className="text-[10px] text-gray-500">{hosp.city} • Hotline: {hosp.emergencyHotline}</p>
                      </div>
                      <button
                        onClick={() => navigate('/hospitals')}
                        className="text-xs bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1.5 rounded-lg font-bold"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. DUAL CARE SHOWCASE: NURSES/PARAMEDICS vs. DOCTORS (Clean Switcher Tab) */}
      <section id="care-showcase-section" className="max-w-5xl mx-auto px-4 sm:px-8 pt-12">
        <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
          
          {/* Header & Tab Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Verified Clinical Network</span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                {activeShowcaseTab === 'homecare' ? 'Home Bedside Care: Certified Nurses & Paramedics' : 'Specialist Doctors Directory'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeShowcaseTab === 'homecare' 
                  ? 'PNC-registered nurses & Rescue 1122 paramedics arriving directly at your doorstep'
                  : 'PMC-licensed physicians available for HD video consultation or clinic visits'}
              </p>
            </div>

            {/* 2-Tab Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl shrink-0 self-start sm:self-auto">
              <button
                id="tab-homecare"
                onClick={() => setActiveShowcaseTab('homecare')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeShowcaseTab === 'homecare'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>Home Visit Staff</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">Bedside</span>
              </button>

              <button
                id="tab-doctors"
                onClick={() => setActiveShowcaseTab('doctors')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeShowcaseTab === 'doctors'
                    ? 'bg-white text-[#0F766E] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Specialist Doctors</span>
                <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-extrabold">PMC</span>
              </button>
            </div>
          </div>

          {/* TAB 1: HOME BEDCARE STAFF */}
          {activeShowcaseTab === 'homecare' && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHomeCare.slice(0, 3).map((staff) => (
                  <div
                    key={staff.id}
                    className="border border-emerald-100 bg-emerald-50/20 hover:border-emerald-400 rounded-2xl p-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.photo_url}
                          alt={staff.name}
                          className="w-13 h-13 rounded-xl object-cover border border-emerald-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-gray-900 truncate">{staff.name}</h3>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${
                              staff.role === 'nurse'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {staff.role === 'nurse' ? 'PNC-RN' : '1122 PARAMEDIC'}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-medium truncate">{staff.title}</p>
                          <p className="text-[10px] text-gray-500">{staff.city} • {staff.experience_years} yrs clinical exp</p>
                        </div>
                      </div>

                      <div className="mt-3 py-1.5 px-2.5 bg-white rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                        <span className="text-[11px] font-mono">Lic: <strong>{staff.license_number}</strong></span>
                        <span className="text-[11px] text-amber-700 font-bold">{staff.rating} ★ ({staff.reviews_count})</span>
                      </div>

                      {/* Services badges */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {staff.services_offered.slice(0, 2).map((srv, idx) => (
                          <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded font-medium">
                            {srv}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs px-1">
                        <span className="text-gray-600">Bedside Visit: <strong className="text-gray-900">Rs {staff.home_visit_fee.toLocaleString()}</strong></span>
                        <span className="text-[10px] text-emerald-700 font-bold">Live GPS Arrival</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/booking/new?type=home_visit&staffId=${staff.id}`)}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer text-center shadow-2xs"
                      >
                        Book Home Visit
                      </button>
                      <button
                        onClick={() => navigate('/home-care')}
                        className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Banner to dedicated Home Care Page */}
              <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <p className="text-xs font-bold text-emerald-300">Need IV Drip, Cannula, Wound Dressing or Injections?</p>
                  <p className="text-sm font-bold">Explore all certified Home Care Nurses & Paramedics in your area</p>
                </div>
                <button
                  onClick={() => navigate('/home-care')}
                  className="bg-white text-emerald-900 hover:bg-emerald-50 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Home Care Directory</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SPECIALIST DOCTORS */}
          {activeShowcaseTab === 'doctors' && (
            <div className="mt-6 space-y-6">
              {/* Specialty filter */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Filter Specialty:</span>
                  <select
                    value={doctorSpecialty}
                    onChange={(e) => setDoctorSpecialty(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Specialties</option>
                    <option value="General">General Physician</option>
                    <option value="Pediatric">Pediatrics (Children)</option>
                    <option value="Pulmonol">Chest & Pulmonology</option>
                    <option value="Dermatol">Skin & Dermatology</option>
                    <option value="Cardiol">Cardiology</option>
                  </select>
                </div>

                <button
                  onClick={() => navigate('/doctors')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-bold inline-flex items-center gap-1"
                >
                  <span>Browse all {verifiedDoctors.length} Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id || doc.uid}
                    className="border border-gray-200 rounded-2xl p-4 shadow-2xs hover:border-teal-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.photo_url}
                          alt={doc.name}
                          className="w-13 h-13 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{doc.name}</h3>
                          <p className="text-xs text-teal-800 font-medium truncate">{doc.specialty}</p>
                          <p className="text-[10px] text-gray-500 truncate">{doc.hospital_affiliation}</p>
                        </div>
                      </div>

                      <div className="mt-3 py-1.5 px-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs text-gray-600">
                        <span className="text-[11px] font-mono">PMC: <strong>{doc.pmc_license_number}</strong></span>
                        <span className="text-[11px] text-amber-700 font-bold">{doc.rating} ★ ({doc.reviews_count})</span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                        <span className="text-gray-600">Video Consult: <strong className="text-gray-900">Rs {doc.video_fee.toLocaleString()}</strong></span>
                        <span className="text-gray-600">Home Visit: <strong className="text-gray-900">Rs {doc.home_visit_fee.toLocaleString()}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/booking/new?doctorId=${doc.id || doc.uid}`)}
                        className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Book Video Consult
                      </button>
                      <button
                        onClick={() => navigate(`/doctors/${doc.id || doc.uid}`)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 3. HOW CURALINK WORKS - 3 SIMPLE STEPS FOR NORMAL PEOPLE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">Simple 3-Step Care</span>
          <h2 className="text-2xl font-black text-gray-900 mt-1">How CuraLink Works</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Getting qualified healthcare in Pakistan shouldn't be complicated or stressful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="text-sm font-bold text-gray-900">Choose Doctor or Home Nurse</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Select an online doctor for video consultations or book a certified nurse/paramedic for bedside clinical care at your house.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="text-sm font-bold text-gray-900">Pick Time & Instant GPS Tracker</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Connect to your video call in 1-click, or watch your certified nurse arrive at your gate with live turn-by-turn GPS tracking.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 relative shadow-xs">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="text-sm font-bold text-gray-900">Digital Rx & CNIC Records</h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              Your prescription, lab orders, and vital signs are permanently saved to your CNIC medical vault. Pay easily via JazzCash, Easypaisa, or Cash.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CLINICAL HUBS: HEALTH GUIDE & 24/7 HOSPITALS (CLEAN 2-COLUMN GATEWAY) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Hub Card A: Health & Disease Guide */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-900 px-2 py-0.5 rounded-full">
                  50+ Conditions
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Diseases & Clinical Health Guide</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                Evidence-based medical guides for common conditions in Pakistan including Dengue Fever, Typhoid, Diabetes, Seasonal Allergies, and Childhood Fevers.
              </p>
              
              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {['Dengue (ڈینگی)', 'Typhoid (ٹائیفائیڈ)', 'Diabetes (ذیابیطس)', 'Asthma (دمہ)'].map((dis, idx) => (
                  <span key={idx} className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg font-medium">
                    {dis}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate('/diseases')}
                className="w-full bg-teal-50 hover:bg-teal-100/80 text-[#0F766E] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Browse Full Disease & Health Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hub Card B: Hospitals & 24/7 ER Directory */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                  24/7 Emergency Helplines
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Partner Hospitals & Medical Centers</h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                Direct phone hotlines, doctor rosters, and emergency contact details for accredited tertiary institutions in Lahore, Karachi, and Islamabad.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {['Shaukat Khanum', 'Aga Khan Hospital', 'Doctors Hospital', 'PIMS Islamabad'].map((hosp, idx) => (
                  <span key={idx} className="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg font-medium">
                    {hosp}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate('/hospitals')}
                className="w-full bg-blue-50 hover:bg-blue-100/80 text-blue-800 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Partner Hospitals Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TRUST & SAFETY BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12">
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>The CuraLink Standard</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold">Trusted by Thousands of Pakistani Families</h3>
              <p className="text-xs text-gray-300 max-w-xl">
                Every doctor is PMC-licensed. Every home nurse is PNC-registered with background verification. All medical records remain securely tied to your CNIC.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/why-curalink')}
                className="bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Why CuraLink
              </button>
              <button
                onClick={() => navigate('/home-care')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Book Home Care
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CuraBot Patient Assistant */}
      <PatientChatbot />
    </div>
  );
};
