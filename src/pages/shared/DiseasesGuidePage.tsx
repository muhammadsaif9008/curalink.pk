import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartPulse, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  Activity, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { COMMON_DISEASES, DiseaseInfo } from '../../data/patientPortalData';

export const DiseasesGuidePage: React.FC = () => {
  const { navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedDiseaseId, setExpandedDiseaseId] = useState<string | null>('dis_dengue');

  const categories = ['All', 'Infectious', 'Chronic', 'Respiratory', 'Pediatric', 'Dermatology'];

  const filteredDiseases = useMemo(() => {
    return COMMON_DISEASES.filter(d => {
      const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        d.name.toLowerCase().includes(q) ||
        d.urduName.includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.keySymptoms.some(s => s.toLowerCase().includes(q)) ||
        d.recommendedSpecialty.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-gray-900 pb-20">
      {/* 1. Hero Header */}
      <section className="bg-gradient-to-b from-teal-50/50 via-white to-white border-b border-gray-200 pt-8 pb-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Diseases & Clinical Health Guide</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Evidence-Based Pakistani Clinical Care Guidelines</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Diseases & Patient Health Guide
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                Comprehensive disease references, early warning signs, home management protocols, and direct matching with PMC-verified specialists across Pakistan.
              </p>
            </div>

            <button
              onClick={() => navigate('/symptom-check')}
              className="bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Check My Symptoms Free</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Category Filter & Search Console */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-500 shrink-0 mr-1">Category:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search e.g. Dengue, Typhoid, Smog, Rash..."
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

      {/* 3. Diseases Directory List */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Showing {filteredDiseases.length} Condition{filteredDiseases.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredDiseases.length > 0 ? (
          <div className="space-y-3">
            {filteredDiseases.map((disease) => {
              const isExpanded = expandedDiseaseId === disease.id;
              return (
                <div
                  key={disease.id}
                  className={`bg-white border rounded-2xl transition-all shadow-2xs overflow-hidden ${
                    isExpanded ? 'border-teal-600 ring-2 ring-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedDiseaseId(isExpanded ? null : disease.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-teal-800 font-bold">
                        <HeartPulse className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-gray-900">{disease.name}</h2>
                          <span className="text-sm font-bold text-teal-800 font-serif">({disease.urduName})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {disease.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            disease.urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                            disease.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                            'bg-teal-50 text-teal-800'
                          }`}>
                            Urgency: {disease.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {disease.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-xs font-semibold text-teal-700">
                        {isExpanded ? 'Collapse Protocol' : 'View Protocol'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-teal-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Medical Details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/40 space-y-4 text-xs animate-in fade-in duration-150">
                      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
                        <p className="font-bold text-gray-900 text-xs">Clinical Overview:</p>
                        <p className="text-gray-700 leading-relaxed">{disease.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Key Symptoms */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-900 text-xs flex items-center gap-1.5 mb-2">
                            <Activity className="w-3.5 h-3.5 text-teal-600" />
                            <span>Diagnostic Symptoms</span>
                          </p>
                          <ul className="space-y-1.5 text-gray-700">
                            {disease.keySymptoms.map((sym, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0"></span>
                                <span>{sym}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Care & Home Advice */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <p className="font-bold text-gray-900 text-xs flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Care & Management Protocol</span>
                          </p>
                          <p className="text-gray-700 leading-relaxed">{disease.careAdvice}</p>
                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">Recommended Specialty:</span>
                            <span className="font-bold text-teal-800">{disease.recommendedSpecialty}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          <span>Always consult a PMC-licensed doctor if red flags occur.</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/doctors`)}
                            className="bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Consult a {disease.recommendedSpecialty.split(' ')[0]} Specialist</span>
                          </button>
                          <button
                            onClick={() => navigate(`/symptom-check`)}
                            className="bg-white hover:bg-gray-100 text-teal-800 border border-teal-300 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            AI Triage
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
            <HeartPulse className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">No diseases found matching your search</h3>
            <p className="text-xs text-gray-500">Try checking your spelling or clearing the category filter.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. Bottom Diagnostic Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-10">
        <div className="bg-gradient-to-r from-teal-900 to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold">Experiencing sudden fever or unexplained symptoms?</h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Don't guess or self-medicate. Our interactive AI Triage checks clinical red flags and guides you to the right care in 60 seconds.
            </p>
          </div>
          <button
            onClick={() => navigate('/symptom-check')}
            className="bg-white hover:bg-teal-50 text-[#0F766E] font-bold text-xs px-6 py-3 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Check Symptoms Now
          </button>
        </div>
      </section>
    </div>
  );
};
