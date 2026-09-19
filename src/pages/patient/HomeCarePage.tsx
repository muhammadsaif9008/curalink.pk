import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Car, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  Phone, 
  AlertCircle,
  HeartPulse,
  Syringe,
  Activity,
  Award,
  Sparkles
} from 'lucide-react';
import { NurseParamedicProfile } from '../../types';

export const HomeCarePage: React.FC = () => {
  const { nursesParamedics, navigate } = useApp();

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<'all' | 'nurse' | 'paramedic'>('all');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const proceduresList = [
    { id: 'all', label: 'All Services' },
    { id: 'vitals', label: 'Vitals & Blood Sugar' },
    { id: 'iv_drip', label: 'IV Cannulation & Saline Drips' },
    { id: 'injections', label: 'Injections (IM / SubQ)' },
    { id: 'wound', label: 'Wound Dressing & Sutures' },
    { id: 'nebulization', label: 'Nebulization & Oxygen' },
    { id: 'catheter', label: 'Catheter & Elderly Care' }
  ];

  const filteredStaff = useMemo(() => {
    return (nursesParamedics || []).filter((staff: NurseParamedicProfile) => {
      if (selectedCity !== 'all' && staff.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      if (selectedRole !== 'all' && staff.role !== selectedRole) {
        return false;
      }
      if (selectedProcedure !== 'all') {
        const p = selectedProcedure.toLowerCase();
        const servicesStr = staff.services_offered.join(' ').toLowerCase();
        if (p === 'vitals' && !servicesStr.includes('vital') && !servicesStr.includes('bp') && !servicesStr.includes('sugar')) return false;
        if (p === 'iv_drip' && !servicesStr.includes('iv') && !servicesStr.includes('drip') && !servicesStr.includes('infusion')) return false;
        if (p === 'injections' && !servicesStr.includes('injection') && !servicesStr.includes('insulin')) return false;
        if (p === 'wound' && !servicesStr.includes('wound') && !servicesStr.includes('dressing') && !servicesStr.includes('suture')) return false;
        if (p === 'nebulization' && !servicesStr.includes('nebul') && !servicesStr.includes('oxygen') && !servicesStr.includes('respiratory')) return false;
        if (p === 'catheter' && !servicesStr.includes('catheter') && !servicesStr.includes('elderly') && !servicesStr.includes('bedridden')) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = staff.name.toLowerCase().includes(q);
        const matchTitle = staff.title.toLowerCase().includes(q);
        const matchBio = staff.bio.toLowerCase().includes(q);
        const matchServices = staff.services_offered.some(s => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchBio && !matchServices) return false;
      }
      return true;
    });
  }, [nursesParamedics, selectedCity, selectedRole, selectedProcedure, searchQuery]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-8 space-y-10">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-br from-teal-900 via-[#0F766E] to-teal-950 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-800/80 border border-teal-600/50 rounded-full text-xs font-semibold text-teal-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>PNC & Rescue 1122 Certified Clinicians</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              Home Bedside Care by Certified Nurses & Paramedics
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
              Professional clinical care delivered directly to your doorstep in Lahore, Karachi, and Islamabad. Get vital signs checked, IV drips administered, sterile wound dressings, and pain relief injections in the comfort of your home.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-teal-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Live GPS Arrival Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Physician Supervised Protocols
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Affordable Rates from Rs. 1,000
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by nurse/paramedic name, IV drip, dressings, vitals..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 hidden sm:inline">City:</span>
              <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                {['all', 'Lahore', 'Karachi', 'Islamabad'].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCity(c)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedCity === c 
                        ? 'bg-white text-[#0F766E] shadow-2xs font-bold' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {c === 'all' ? 'All Cities' : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role and Procedure Filters */}
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            {/* Staff Role Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Provider:</span>
              <div className="inline-flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedRole('all')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedRole === 'all'
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Staff
                </button>
                <button
                  onClick={() => setSelectedRole('nurse')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedRole === 'nurse'
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Registered Nurses (PNC)
                </button>
                <button
                  onClick={() => setSelectedRole('paramedic')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedRole === 'paramedic'
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Paramedics (Rescue 1122)
                </button>
              </div>
            </div>

            {/* Procedures Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {proceduresList.map(proc => (
                <button
                  key={proc.id}
                  onClick={() => setSelectedProcedure(proc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer border ${
                    selectedProcedure === proc.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {proc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staff Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">
            Available Nurses & Paramedics ({filteredStaff.length})
          </h2>
          <span className="text-xs text-gray-500">
            Average arrival time: 25-40 mins
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-sm font-bold text-gray-700">No clinicians found matching your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCity('all');
                setSelectedRole('all');
                setSelectedProcedure('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#0F766E] font-bold hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff: NurseParamedicProfile) => (
              <div 
                key={staff.id} 
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-teal-400 hover:shadow-sm transition-all"
              >
                <div className="space-y-4">
                  {/* Top Header: Photo, Name, Badge */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={staff.photo_url}
                      alt={staff.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{staff.name}</h3>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                          staff.role === 'nurse'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {staff.role === 'nurse' ? 'PNC-RN' : 'RESCUE 1122'}
                        </span>
                      </div>
                      <p className="text-xs text-teal-800 font-medium leading-snug mt-0.5">{staff.title}</p>
                      
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {staff.rating}
                        </span>
                        <span>({staff.reviews_count} visits)</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {staff.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {staff.bio}
                  </p>

                  {/* Services / Kit List */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Procedures & Clinical Kit:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {staff.services_offered.slice(0, 3).map((srv, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-gray-50 text-gray-700 px-2 py-0.5 rounded border border-gray-200/80"
                        >
                          {srv}
                        </span>
                      ))}
                      {staff.services_offered.length > 3 && (
                        <span className="text-[10px] font-medium bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded">
                          +{staff.services_offered.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Fee & Booking CTA */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Bedside Visit Fee</span>
                    <p className="text-base font-extrabold text-gray-900">Rs. {staff.home_visit_fee.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/booking/new?type=home_visit&staffId=${staff.id}`)}
                    className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Home Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How Home Bedside Care Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Standard Operating Procedure</span>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              How CuraLink Home Bedside Care Works
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Safe, aseptic, and physician-supervised healthcare at your home without long hospital waits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F766E] font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="text-xs font-bold text-gray-900">Request Bedside Care</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Choose your certified Nurse or Paramedic, specify needed procedures (IV drip, vitals, wound care), and confirm address.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F766E] font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="text-xs font-bold text-gray-900">Live GPS Tracker</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Follow your assigned clinician in real-time as they dispatch with full clinical vitals and sterile consumables kit.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F766E] font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="text-xs font-bold text-gray-900">Aseptic Treatment</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Clinician administers IV infusion, measures clinical vitals, or changes surgical dressing adhering to PMC medical guidelines.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0F766E] font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="text-xs font-bold text-gray-900">Permanent Record</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Measured vitals, administered meds, and nursing observations are instantly logged into your digital medical record.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
