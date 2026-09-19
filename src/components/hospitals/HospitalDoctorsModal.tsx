import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Search, 
  Stethoscope, 
  Star, 
  ShieldCheck, 
  Video, 
  Car, 
  Clock, 
  MapPin, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  CalendarCheck,
  Building2
} from 'lucide-react';
import { HospitalInfo } from '../../data/patientPortalData';
import { DoctorProfile } from '../../types';
import { useApp } from '../../context/AppContext';
import { getDoctorAvailability } from '../../utils/doctorAvailability';

interface HospitalDoctorsModalProps {
  hospital: HospitalInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

// Quick filter categories for common ailments & symptoms
const FILTER_CHIPS = [
  { id: 'all', label: 'All Doctors' },
  { id: 'fever_dengue', label: 'Fever & Dengue', searchTerms: ['fever', 'dengue', 'typhoid', 'chills'] },
  { id: 'cough_chest', label: 'Cough & Chest', searchTerms: ['cough', 'asthma', 'chest', 'wheezing', 'pulmonology'] },
  { id: 'diabetes_bp', label: 'Diabetes & BP', searchTerms: ['diabetes', 'sugar', 'bp', 'hypertension', 'metabolic'] },
  { id: 'pediatrics', label: 'Pediatrics & Child', searchTerms: ['pediatric', 'child', 'infant', 'kid'] },
  { id: 'skin', label: 'Skin & Allergy', searchTerms: ['skin', 'rash', 'eczema', 'dermatology', 'itching'] },
  { id: 'heart', label: 'Heart & Cardiology', searchTerms: ['heart', 'cardiology', 'angina', 'palpitation', 'chest pain'] },
  { id: 'stomach', label: 'Stomach & Gut', searchTerms: ['stomach', 'gastro', 'diarrhea', 'vomiting', 'nausea', 'acidity'] },
  { id: 'in_clinic', label: 'In-Clinic OPD', filterFn: (d: DoctorProfile) => d.offers_clinic }
];

export const HospitalDoctorsModal: React.FC<HospitalDoctorsModalProps> = ({
  hospital,
  isOpen,
  onClose
}) => {
  const { doctors, bookings, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState('all');

  // Reset search when modal opens for a new hospital
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedChip('all');
    }
  }, [isOpen, hospital?.id]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate all approved doctors ranked for this hospital
  const allApprovedDoctors = useMemo(() => {
    if (!doctors) return [];
    return doctors.filter(d => d.verification_status === 'approved' || !d.verification_status);
  }, [doctors]);

  // Scoring function: Hospital direct staff > City specialists > Network consultants
  const getDoctorHospitalRelevance = (doc: DoctorProfile) => {
    if (!hospital) return 0;
    // Direct hospital ID match
    if (doc.affiliated_hospital_ids?.includes(hospital.id)) return 300;
    // Hospital name substring match
    const docAff = (doc.hospital_affiliation || '').toLowerCase();
    const hospName = hospital.name.toLowerCase();
    if (docAff.includes(hospName)) return 250;
    const shortHospName = hospName.split(' ')[0];
    if (shortHospName.length > 3 && docAff.includes(shortHospName)) return 200;
    // City match
    if (doc.city.toLowerCase() === hospital.city.toLowerCase()) return 100;
    // Network teleconsultant
    return 10;
  };

  // Filter doctors based on search query (by name, disease, symptoms, keyword) and category chip
  const filteredDoctors = useMemo(() => {
    if (!hospital || !allApprovedDoctors.length) return [];

    let list = allApprovedDoctors;

    // Apply quick category / symptom chip filter
    if (selectedChip !== 'all') {
      const chipObj = FILTER_CHIPS.find(c => c.id === selectedChip);
      if (chipObj) {
        if (chipObj.filterFn) {
          list = list.filter(chipObj.filterFn);
        } else if (chipObj.searchTerms) {
          list = list.filter(doc => {
            const docText = [
              doc.name,
              doc.specialty,
              doc.qualifications,
              doc.bio,
              ...(doc.diseases_treated || []),
              ...(doc.symptoms_handled || [])
            ].join(' ').toLowerCase();

            return chipObj.searchTerms!.some(term => docText.includes(term.toLowerCase()));
          });
        }
      }
    }

    // Apply user search query: searches doctor name, diseases treated, symptoms handled, specialty, bio or any keyword
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(doc => {
        // 1. Doctor Name
        if (doc.name.toLowerCase().includes(q)) return true;

        // 2. Specialty & Qualifications
        if (doc.specialty.toLowerCase().includes(q)) return true;
        if (doc.qualifications?.toLowerCase().includes(q)) return true;

        // 3. Hospital Affiliation
        if (doc.hospital_affiliation?.toLowerCase().includes(q)) return true;

        // 4. City
        if (doc.city?.toLowerCase().includes(q)) return true;

        // 5. Bio
        if (doc.bio?.toLowerCase().includes(q)) return true;

        // 6. Diseases Treated
        if (doc.diseases_treated?.some(d => d.toLowerCase().includes(q))) return true;

        // 7. Symptoms Handled
        if (doc.symptoms_handled?.some(s => s.toLowerCase().includes(q))) return true;

        return false;
      });
    }

    // Sort: Hospital doctors first, City doctors second, Telemedicine doctors third, then by rating
    return [...list].sort((a, b) => {
      const relA = getDoctorHospitalRelevance(a);
      const relB = getDoctorHospitalRelevance(b);
      if (relA !== relB) {
        return relB - relA;
      }
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [hospital, allApprovedDoctors, selectedChip, searchQuery]);

  if (!isOpen || !hospital) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      {/* Background click dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden z-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-900 via-[#0F766E] to-[#115E59] text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            id="close-hospital-doctors-modal"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10 sm:pr-12">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  {hospital.city}
                </span>
                <span className="bg-teal-300/20 text-teal-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {hospital.type}
                </span>
                {hospital.hasEmergency247 && (
                  <span className="bg-red-500/90 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    24/7 ER
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-teal-200 shrink-0" />
                <span>Doctors at {hospital.name}</span>
              </h2>

              <p className="text-xs sm:text-sm text-teal-100/90 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-200" />
                <span>{hospital.address}</span>
              </p>
            </div>

            {/* Quick Emergency Hotline Action */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 shrink-0 flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-teal-200 uppercase font-semibold block">ER Hotline</span>
                <span className="text-xs sm:text-sm font-mono font-black text-white">{hospital.emergencyHotline}</span>
              </div>
              <a
                href={`tel:${hospital.emergencyHotline.replace(/[^0-9]/g, '')}`}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-colors shadow-xs"
                title="Dial Hotline"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 sm:p-6 bg-gray-50/80 border-b border-gray-200 space-y-3 shrink-0">
          {/* Real-Time Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-teal-700 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="hospital-doctor-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name, disease (e.g. Dengue, Asthma), symptoms (e.g. fever, cough), or keyword..."
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category / Symptom Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-gray-400 text-[11px] font-bold shrink-0 mr-1">Filter:</span>
            {FILTER_CHIPS.map((chip) => {
              const isSelected = selectedChip === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs shrink-0 ${
                    isSelected
                      ? 'bg-teal-800 text-white shadow-2xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
            <span>
              Showing <strong className="text-gray-900 font-bold">{filteredDoctors.length}</strong> {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available
              {searchQuery && (
                <span> for "<span className="text-teal-700 font-semibold">{searchQuery}</span>"</span>
              )}
            </span>

            {(searchQuery || selectedChip !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedChip('all');
                }}
                className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Reset search</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Doctor Cards Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => {
              const docId = doc.uid || doc.id || '';
              const availability = getDoctorAvailability(doc, bookings, new Date());
              const nextSlotStr = availability.nextSlotDisplay;

              return (
                <div
                  key={docId}
                  className="bg-white border border-gray-200 hover:border-teal-500 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  {/* Doctor Info (Left) */}
                  <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={doc.photo_url}
                        alt={doc.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-200 shadow-2xs group-hover:scale-102 transition-transform"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs" title="PMC Verified">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 hover:text-teal-700 transition-colors">
                          {doc.name}
                        </h3>
                        <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          <span>{doc.pmc_license_number}</span>
                        </span>
                        {doc.affiliated_hospital_ids?.includes(hospital.id) || doc.hospital_affiliation.toLowerCase().includes(hospital.name.toLowerCase()) ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            Staff at {hospital.name.split(' ')[0]}
                          </span>
                        ) : doc.city.toLowerCase() === hospital.city.toLowerCase() ? (
                          <span className="text-[10px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                            {doc.city} Specialist
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200">
                            Video Tele-Consultant
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-teal-800 leading-tight">
                        {doc.specialty}
                      </p>

                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {doc.qualifications} • {doc.experience_years} yrs exp.
                      </p>

                      {/* Ratings & Next Slot */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-xs">
                        <div className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{doc.rating}</span>
                          <span className="text-gray-400 font-normal text-[11px]">({doc.reviews_count})</span>
                        </div>

                        <span className="text-gray-300">•</span>

                        {/* Availability Pill */}
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                          <Clock className="w-3 h-3" />
                          <span>{nextSlotStr}</span>
                        </div>
                      </div>

                      {/* Diseases & Symptoms Handled Tags */}
                      {((doc.diseases_treated && doc.diseases_treated.length > 0) || 
                        (doc.symptoms_handled && doc.symptoms_handled.length > 0)) && (
                        <div className="pt-1.5 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Treats:</span>
                          {(doc.diseases_treated || []).slice(0, 3).map((dis, idx) => (
                            <span key={`dis-${idx}`} className="text-[10px] bg-teal-50/70 text-teal-900 px-2 py-0.5 rounded-md font-medium border border-teal-100/60">
                              {dis}
                            </span>
                          ))}
                          {(doc.symptoms_handled || []).slice(0, 2).map((sym, idx) => (
                            <span key={`sym-${idx}`} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                              {sym}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consultation Pricing & Action Buttons (Right) */}
                  <div className="w-full md:w-auto md:min-w-[210px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 flex flex-col justify-between gap-3">
                    {/* Fees Breakdown */}
                    <div className="space-y-1 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 text-xs">
                      {doc.offers_video && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-gray-600 text-[11px]">
                            <Video className="w-3 h-3 text-teal-600" />
                            <span>Video Call:</span>
                          </span>
                          <strong className="text-gray-900 font-bold">PKR {doc.video_fee.toLocaleString()}</strong>
                        </div>
                      )}

                      {doc.offers_clinic && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-gray-600 text-[11px]">
                            <Building2 className="w-3 h-3 text-teal-600" />
                            <span>Clinic OPD:</span>
                          </span>
                          <strong className="text-gray-900 font-bold">PKR {(doc.clinic_fee || 2000).toLocaleString()}</strong>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/doctors/${docId}`);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/booking/new?doctorId=${docId}`);
                        }}
                        id={`book-doctor-btn-${docId}`}
                        className="flex-1 bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#0D9488] hover:to-[#0F766E] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-2xs hover:shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Book Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="bg-gray-50/60 border border-gray-200 border-dashed rounded-2xl p-8 sm:p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">
                No doctors found at {hospital.name} matching your search
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                We couldn't find any doctors matching "{searchQuery}". Try searching by disease (e.g. Dengue, Asthma), symptoms (e.g. fever, cough), or reset filters.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedChip('all');
                  }}
                  className="bg-white hover:bg-gray-100 text-teal-800 border border-gray-200 text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search Filters
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/doctors?city=${encodeURIComponent(hospital.city)}`);
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Explore All {hospital.city} Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All practitioners are PMC license verified and background vetted.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                navigate('/doctors');
              }}
              className="text-teal-700 hover:text-teal-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All Doctors Nationwide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
