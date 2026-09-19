import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneCall, 
  AlertTriangle, 
  MapPin, 
  Navigation, 
  ArrowLeft, 
  HeartCrack, 
  Search,
  ShieldCheck
} from 'lucide-react';
import { EMERGENCY_FACILITIES } from '../../data/seedData';

export const EmergencyPage: React.FC = () => {
  const { navigate } = useApp();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFacilities = EMERGENCY_FACILITIES.filter(item => {
    const matchesCity = selectedCity === 'all' || item.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Hero Red Banner */}
      <div className="bg-[#DC2626] text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <HeartCrack className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-2.5 py-0.5 rounded text-white">
              Medical Emergency Alert
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              If this is a medical emergency, call 1122 now
            </h1>
          </div>
        </div>

        <p className="text-sm text-red-100 max-w-2xl leading-relaxed">
          Do not wait for an online consultation or home visit if you or someone near you has severe chest pain, sudden numbness or speech loss, uncontrollable bleeding, severe breathing difficulty, or unconsciousness.
        </p>

        {/* Big Tap-to-Call Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <a
            href="tel:1122"
            id="emergency-call-1122"
            className="bg-white hover:bg-gray-100 text-red-600 font-extrabold text-lg px-8 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-3 text-center"
          >
            <PhoneCall className="w-6 h-6 fill-current" />
            <span>Call Rescue 1122 (Toll Free)</span>
          </a>

          <a
            href="tel:115"
            className="bg-red-800/80 hover:bg-red-800 text-white font-bold text-base px-6 py-4 rounded-xl border border-red-400/40 transition-all flex items-center justify-center gap-2 text-center"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Call Edhi 115</span>
          </a>
        </div>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-gray-500">Rescue Service</p>
          <p className="text-base font-bold text-red-600">1122</p>
          <p className="text-[10px] text-gray-400">Nationwide</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-gray-500">Edhi Ambulance</p>
          <p className="text-base font-bold text-red-600">115</p>
          <p className="text-[10px] text-gray-400">Nationwide</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-gray-500">Chhipa Ambulance</p>
          <p className="text-base font-bold text-red-600">1020</p>
          <p className="text-[10px] text-gray-400">Sindh / Karachi</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-gray-500">Police Emergency</p>
          <p className="text-base font-bold text-gray-900">15</p>
          <p className="text-[10px] text-gray-400">Emergency Dispatch</p>
        </div>
      </div>

      {/* Nearest Hospital / ER Finder Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <span>Verified 24/7 Trauma & Emergency Hospitals</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Locate immediate tertiary care hospitals with equipped emergency rooms and trauma units.
            </p>
          </div>

          {/* City filter tabs */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            {['all', 'Nationwide', 'Islamabad', 'Rawalpindi'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedCity === c ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {c === 'all' ? 'All Cities' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by hospital name or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Hospital cards list */}
        <div className="space-y-3">
          {filteredFacilities.map((h, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 hover:border-red-300 transition-colors bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{h.name}</span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded">
                    {h.city}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{h.type}</p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{h.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <a
                  href={`tel:${h.phone.replace(/[^0-9]/g, '')}`}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {h.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Official Pakistan Emergency Directories
          </span>
          <button
            onClick={() => navigate('/')}
            className="text-[#0F766E] font-semibold hover:underline cursor-pointer"
          >
            Return to CuraLink Home
          </button>
        </div>
      </div>
    </div>
  );
};
