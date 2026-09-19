import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Star, 
  ShieldCheck, 
  Video, 
  Building2,
  Clock, 
  MapPin, 
  ArrowRight,
  RotateCcw,
  Zap,
  CalendarCheck,
  Stethoscope,
  Car
} from 'lucide-react';
import { DoctorProfile } from '../../types';
import { getDoctorAvailability } from '../../utils/doctorAvailability';

export const DoctorsDirectoryPage: React.FC = () => {
  const { doctors, bookings, navigate } = useApp();

  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle URL query parameters (e.g. ?q=dengue or ?city=Lahore or ?hospital=...)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q') || params.get('search');
    const cityParam = params.get('city');
    const hospParam = params.get('hospital');
    if (qParam) setSearchQuery(qParam);
    if (cityParam) setCityFilter(cityParam);
    if (hospParam) setSearchQuery(hospParam);
  }, []);

  // Filter approved doctors only
  const approvedDoctors = useMemo(() => {
    return (doctors || []).filter(d => d.verification_status === 'approved');
  }, [doctors]);

  // Compute availability data for all approved doctors
  const doctorAvailabilityMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getDoctorAvailability>>();
    const now = new Date();
    approvedDoctors.forEach(doc => {
      const docId = doc.uid || doc.id || '';
      map.set(docId, getDoctorAvailability(doc, bookings, now));
    });
    return map;
  }, [approvedDoctors, bookings]);

  // Count how many doctors are available within the next 24 hours
  const doctorsAvailable24hCount = useMemo(() => {
    return approvedDoctors.filter(doc => {
      const docId = doc.uid || doc.id || '';
      return doctorAvailabilityMap.get(docId)?.hasAvailableSlot24h;
    }).length;
  }, [approvedDoctors, doctorAvailabilityMap]);

  const filteredDoctors = approvedDoctors.filter(d => {
    const docId = d.uid || d.id || '';
    const avail = doctorAvailabilityMap.get(docId);

    // 24-hour and day availability filters
    if (availabilityFilter === 'next_24h' && !avail?.hasAvailableSlot24h) {
      return false;
    }
    if (availabilityFilter === 'today' && !avail?.slotsWithin24h?.some(s => s.isToday)) {
      return false;
    }
    if (availabilityFilter === 'tomorrow' && !avail?.slotsWithin24h?.some(s => s.isTomorrow)) {
      return false;
    }

    if (specialtyFilter !== 'all' && !d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())) {
      return false;
    }
    if (visitTypeFilter === 'video' && !d.offers_video) {
      return false;
    }
    if (visitTypeFilter === 'clinic' && !d.offers_clinic) {
      return false;
    }
    if (cityFilter !== 'all' && d.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = d.name.toLowerCase().includes(q);
      const matchSpec = d.specialty.toLowerCase().includes(q);
      const matchHosp = d.hospital_affiliation.toLowerCase().includes(q);
      const matchQual = d.qualifications?.toLowerCase().includes(q);
      const matchBio = d.bio?.toLowerCase().includes(q);
      const matchDisease = d.diseases_treated?.some(dis => dis.toLowerCase().includes(q));
      const matchSymptom = d.symptoms_handled?.some(sym => sym.toLowerCase().includes(q));
      if (!matchName && !matchSpec && !matchHosp && !matchQual && !matchBio && !matchDisease && !matchSymptom) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setSpecialtyFilter('all');
    setVisitTypeFilter('all');
    setCityFilter('all');
    setAvailabilityFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
            Pakistan Medical Commission Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Find & Book Verified Doctors
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Consult specialists via Video Telehealth or In-Clinic OPD across Islamabad & Rawalpindi. (Bedside home visits are provided exclusively by certified Nurses & Paramedics).
          </p>
        </div>

        {/* Next 24h Quick Filter Pill */}
        <button
          id="quick-filter-24h-btn"
          onClick={() => {
            setAvailabilityFilter(prev => prev === 'next_24h' ? 'all' : 'next_24h');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
            availabilityFilter === 'next_24h'
              ? 'bg-[#0F766E] border-[#0F766E] text-white ring-2 ring-teal-500/30'
              : 'bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${availabilityFilter === 'next_24h' ? 'text-amber-300 fill-amber-300' : 'text-emerald-600'}`} />
          <span>Available within 24 Hours</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
            availabilityFilter === 'next_24h' ? 'bg-teal-900 text-teal-100' : 'bg-emerald-200 text-emerald-900'
          }`}>
            {doctorsAvailable24hCount}
          </span>
        </button>
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0F766E] text-white shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Specialist Doctors ({approvedDoctors.length})</span>
        </button>
        <button
          onClick={() => navigate('/home-care')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-teal-400 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Car className="w-3.5 h-3.5 text-teal-600" />
          <span>Home Care (Nurses & Paramedics)</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded ml-1">PNC & Rescue 1122</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            id="doctor-search-input"
            type="text"
            placeholder="Search doctor by name, disease (e.g. Dengue, Diabetes), symptoms (e.g. fever, cough), or hospital..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-teal-600"
          />
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Availability Filter (includes Next 24 Hours option) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Availability Timeframe
            </label>
            <select
              id="availability-filter-select"
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white font-medium"
            >
              <option value="all">Any Day</option>
              <option value="next_24h">⚡ Within Next 24 Hours ({doctorsAvailable24hCount})</option>
              <option value="today">Available Today</option>
              <option value="tomorrow">Available Tomorrow</option>
            </select>
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Specialty</label>
            <select
              id="specialty-filter-select"
              value={specialtyFilter}
              onChange={e => setSpecialtyFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
            >
              <option value="all">All Specialties</option>
              <option value="General Physician">General Physician</option>
              <option value="Pulmonologist">Pulmonologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Internal Medicine">Internal Medicine</option>
            </select>
          </div>

          {/* Visit Type */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Visit Type</label>
            <select
              id="visit-type-filter-select"
              value={visitTypeFilter}
              onChange={e => setVisitTypeFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
            >
              <option value="all">All Modes</option>
              <option value="video">Video Call Only</option>
              <option value="clinic">In-Clinic OPD Only</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">City / Region</label>
            <select
              id="city-filter-select"
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
            >
              <option value="all">Islamabad & Rawalpindi (All)</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators / Clear */}
        {(availabilityFilter !== 'all' || specialtyFilter !== 'all' || visitTypeFilter !== 'all' || cityFilter !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-700">Active filters:</span>
              {availabilityFilter === 'next_24h' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium text-[11px]">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Available in 24 Hours
                </span>
              )}
              {availabilityFilter === 'today' && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">Today</span>
              )}
              {availabilityFilter === 'tomorrow' && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">Tomorrow</span>
              )}
              {specialtyFilter !== 'all' && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">{specialtyFilter}</span>
              )}
              {visitTypeFilter !== 'all' && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">{visitTypeFilter === 'video' ? 'Video' : 'In-Clinic'}</span>
              )}
              {cityFilter !== 'all' && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-[11px]">{cityFilter}</span>
              )}
            </div>
            <button
              onClick={resetFilters}
              className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => {
            const docId = doctor.uid || doctor.id || '';
            const avail = doctorAvailabilityMap.get(docId);
            const isAvailableSoon = !!avail?.hasAvailableSlot24h;

            return (
              <div
                key={docId}
                id={`doctor-card-${docId}`}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative ${
                  isAvailableSoon 
                    ? 'border-emerald-300 ring-1 ring-emerald-500/20' 
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <div className="space-y-4">
                  {/* Availability Soon Top Badge */}
                  <div className="flex items-center justify-between gap-2">
                    {isAvailableSoon ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                        <span>Available Soon (Next 24h)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <CalendarCheck className="w-3 h-3 text-gray-400" />
                        <span>Scheduled Availability</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      PMC
                    </span>
                  </div>

                  {/* Header info */}
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={doctor.photo_url}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{doctor.name}</h3>
                      <p className="text-xs text-teal-800 font-medium truncate">{doctor.specialty}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{doctor.hospital_affiliation}</p>
                    </div>
                  </div>

                  {/* Badges: Rating, Exp, City */}
                  <div className="flex items-center gap-3 text-xs text-gray-600 pt-1 border-t border-gray-100">
                    <span className="flex items-center gap-1 font-semibold text-gray-900">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {doctor.rating} ({doctor.reviews_count || doctor.total_consultations || 40})
                    </span>
                    <span>•</span>
                    <span>{doctor.experience_years} yrs exp</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {doctor.city}
                    </span>
                  </div>

                  {/* Offer Badges & Fees */}
                  <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                    {doctor.offers_video && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-blue-800 font-semibold text-[11px]">
                          <Video className="w-3.5 h-3.5 text-blue-600" />
                          Video Consult
                        </span>
                        <span className="font-bold text-gray-900">Rs. {doctor.video_fee.toLocaleString()}</span>
                      </div>
                    )}

                    {doctor.offers_clinic && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-teal-800 font-semibold text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          In-Clinic Visit
                        </span>
                        <span className="font-bold text-gray-900">Rs. {(doctor.clinic_fee || doctor.video_fee).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Next available slot highlight */}
                  <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    isAvailableSoon
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-gray-50 border-gray-100 text-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className={`w-4 h-4 shrink-0 ${isAvailableSoon ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <span className="text-[10px] block text-gray-500 font-semibold uppercase tracking-wider">Next Open Slot</span>
                        <span className="font-bold text-xs truncate block text-gray-900">
                          {avail?.nextSlotDisplay || 'Today at 4:30 PM'}
                        </span>
                      </div>
                    </div>
                    {isAvailableSoon && (
                      <span className="shrink-0 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                        {avail?.slotsWithin24h?.length || 0} in 24h
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-2 border-t border-gray-100 flex gap-2">
                  <button
                    id={`view-profile-btn-${docId}`}
                    onClick={() => navigate(`/doctors/${docId}`)}
                    className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    id={`book-doctor-btn-${docId}`}
                    onClick={() => navigate(`/booking/new?doctorId=${docId}`)}
                    className={`flex-1 text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      isAvailableSoon
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-[#0F766E] hover:bg-[#0B5C56]'
                    }`}
                  >
                    <span>{isAvailableSoon ? 'Book Soon' : 'Book'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No doctors match your filters</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {availabilityFilter === 'next_24h'
              ? 'No doctors have open slots within the next 24 hours under your current search criteria. Try expanding your timeframe or clearing other filters.'
              : 'Try adjusting your specialty, city, or visit type filters to view more verified practitioners in Pakistan.'}
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
