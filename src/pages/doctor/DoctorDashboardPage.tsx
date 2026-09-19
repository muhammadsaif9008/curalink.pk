import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar, 
  Clock, 
  Video, 
  Car, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  Star, 
  Navigation, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  Activity,
  Edit3,
  Search,
  Filter,
  Wallet,
  Building2,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Mic,
  Radio,
  Sparkles,
  Volume2,
  Stethoscope,
  Plus,
  Settings,
  X,
  SlidersHorizontal,
  ChevronLeft,
  AlertTriangle,
  PhoneCall,
  User,
  HeartPulse,
  Eye,
  ClipboardList
} from 'lucide-react';
import { MedicalNotesSection } from '../../components/medical/MedicalNotesSection';
import { EmergencyButton } from '../../components/shared/EmergencyButton';

export const DoctorDashboardPage: React.FC = () => {
  const { 
    currentPath,
    currentUser, 
    doctorProfile, 
    patientProfile,
    bookings, 
    consultationReports, 
    medicalNotes,
    toggleDoctorAvailability, 
    navigate,
    updateBookingStatus
  } = useApp();

  const [isAvailable, setIsAvailable] = useState<boolean>(doctorProfile?.is_available ?? true);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'video' | 'home_visit'>('all');
  const [scheduleDateFilter, setScheduleDateFilter] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');
  const [scheduleViewMode, setScheduleViewMode] = useState<'timeline' | 'agenda'>('timeline');
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotCreatedSuccess, setSlotCreatedSuccess] = useState(false);

  // Selected appointment for quick triage peek
  const [selectedTriageBooking, setSelectedTriageBooking] = useState<any | null>(null);

  // Active tab synchronized with current URL path
  const activeTab = useMemo<'overview' | 'appointments' | 'notes' | 'earnings'>(() => {
    if (currentPath.includes('/appointments')) return 'appointments';
    if (currentPath.includes('/notes')) return 'notes';
    if (currentPath.includes('/earnings')) return 'earnings';
    return 'overview';
  }, [currentPath]);

  const handleToggle = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    toggleDoctorAvailability(nextVal);
  };

  const pendingReports = (consultationReports || []).filter(r => r.status === 'draft');

  // Filtered appointment schedule
  const filteredSchedule = useMemo(() => {
    return (bookings || []).filter(bk => {
      if (scheduleFilter !== 'all' && bk.type !== scheduleFilter) return false;
      if (scheduleSearch.trim()) {
        const q = scheduleSearch.toLowerCase();
        const patientMatch = (bk.patient_name || '').toLowerCase().includes(q);
        const reasonMatch = bk.reason?.toLowerCase().includes(q);
        const timeMatch = bk.time_slot?.toLowerCase().includes(q);
        const streetMatch = bk.address?.street?.toLowerCase().includes(q) || bk.address?.area?.toLowerCase().includes(q);
        if (!patientMatch && !reasonMatch && !timeMatch && !streetMatch) return false;
      }
      return true;
    });
  }, [bookings, scheduleFilter, scheduleSearch]);

  const handleCreateEmergencySlot = () => {
    setSlotCreatedSuccess(true);
    setTimeout(() => {
      setSlotCreatedSuccess(false);
      setShowSlotModal(false);
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      {/* Top Header Card with Availability Toggle and Prominent Ambient AI Voice Scribe Button */}
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
            {doctorProfile.specialty} • {doctorProfile.hospital_affiliation} • Telehealth & Rapid Bedside Visits
          </p>
        </div>

        {/* Action Controls: Live Ambient Voice Scribe Button & Duty Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <EmergencyButton callerRole="doctor" />

          {/* Prominent Start Consultation Scribe Touchpoint Button */}
          <button
            id="header-ambient-scribe-btn"
            onClick={() => navigate('/doctor/scribe')}
            className="group relative bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-500 text-white px-4 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-3 cursor-pointer border border-teal-500/40 active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center relative shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-xl bg-white opacity-40 animate-ping"></span>
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide">CuraLink AI Scribe</span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-white/20 text-white rounded-md border border-white/30">
                  Dual-Voice Recording
                </span>
              </div>
              <p className="text-[10px] text-teal-100">
                Tap mic to record consult & generate AI clinical report
              </p>
            </div>
          </button>

          {/* Real-Time Duty Availability Switch */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 justify-between sm:justify-start shrink-0">
            <div>
              <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                <Radio className={`w-3 h-3 ${isAvailable ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
                <span>Duty Status</span>
              </p>
              <p className="text-[10px] text-gray-500">
                {isAvailable ? 'Accepting Patients' : 'Off-Duty'}
              </p>
            </div>

            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAvailable ? 'bg-[#16A34A]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: DEDICATED PROFESSIONAL APPOINTMENT SCHEDULE */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Clinical Schedule Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Bookings Today</span>
              <p className="text-xl font-extrabold text-gray-900 mt-1">4 Consultations</p>
              <p className="text-[11px] text-teal-700 font-medium mt-0.5">2 Video • 2 Home Visits</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estimated Revenue</span>
              <p className="text-xl font-extrabold text-[#0F766E] mt-1">Rs. 12,000</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Escrow Secured via JazzCash/Card</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">High-Priority Cases</span>
              <p className="text-xl font-extrabold text-rose-600 mt-1">1 Urgent Febrile</p>
              <p className="text-[11px] text-rose-700 font-medium mt-0.5">P1 Triage (Zainab Ahmed)</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Clinical Duty Hours</span>
              <p className="text-xl font-extrabold text-gray-900 mt-1">09:00 - 18:00 PKT</p>
              <p className="text-[11px] text-blue-600 font-medium mt-0.5">3 Available Slots Remaining</p>
            </div>
          </div>

          {/* Schedule Controls Header: Date Filter, Search, View Mode, Manage Slots */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Clinical Appointment Schedules</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Manage patient consultation slots, view triage priority, launch video calls or GPS navigation, and record ambient consultations.
                </p>
              </div>

              {/* Slot Management & Add Emergency Slot */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowSlotModal(true)}
                  className="bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Manage Clinic Slots</span>
                </button>

                <button
                  onClick={() => setShowSlotModal(true)}
                  className="bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rapid Slot</span>
                </button>
              </div>
            </div>

            {/* Filter Bar: Date Range, Consultation Type, View Mode Switcher, and Search */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Navigator */}
                <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-xs">
                  <button
                    onClick={() => setScheduleDateFilter('today')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleDateFilter === 'today' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Today (06 Sep)
                  </button>
                  <button
                    onClick={() => setScheduleDateFilter('tomorrow')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleDateFilter === 'tomorrow' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Tomorrow (07 Sep)
                  </button>
                  <button
                    onClick={() => setScheduleDateFilter('week')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleDateFilter === 'week' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setScheduleDateFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleDateFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All Bookings
                  </button>
                </div>

                {/* Consultation Type Selector */}
                <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-xs">
                  <button
                    onClick={() => setScheduleFilter('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleFilter === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setScheduleFilter('video')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      scheduleFilter === 'video' ? 'bg-white text-blue-700 shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    <Video className="w-3 h-3 text-blue-600" />
                    <span>Telehealth Video</span>
                  </button>
                  <button
                    onClick={() => setScheduleFilter('home_visit')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      scheduleFilter === 'home_visit' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600'
                    }`}
                  >
                    <Car className="w-3 h-3 text-emerald-600" />
                    <span>Home Bedside</span>
                  </button>
                </div>
              </div>

              {/* Search Box & View Mode Toggle (Timeline vs Agenda) */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient, complaint, address..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50 text-xs shrink-0">
                  <button
                    onClick={() => setScheduleViewMode('timeline')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleViewMode === 'timeline' ? 'bg-[#0F766E] text-white shadow-xs' : 'text-gray-600'
                    }`}
                    title="Hourly Timeline View"
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setScheduleViewMode('agenda')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      scheduleViewMode === 'agenda' ? 'bg-[#0F766E] text-white shadow-xs' : 'text-gray-600'
                    }`}
                    title="Agenda Table View"
                  >
                    Agenda Table
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VIEW MODE A: PROFESSIONAL DETAILED TIMELINE VIEW */}
          {scheduleViewMode === 'timeline' && (
            <div className="space-y-4">
              {filteredSchedule.map((bk, idx) => {
                const isUrgent = idx === 0 || bk.reason?.toLowerCase().includes('fever') || bk.reason?.toLowerCase().includes('emergency');
                const patientName = bk.patient_name || (idx === 0 ? (patientProfile?.name || 'Zainab Ahmed') : idx === 1 ? 'Hamza Tariq' : 'Fatima Noor');
                const patientAge = idx === 0 ? 29 : idx === 1 ? 42 : 34;

                return (
                  <div
                    key={bk.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md ${
                      isUrgent ? 'border-teal-400/60 ring-1 ring-teal-400/30' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                      {/* Left: Time Indicator & Patient Clinical Identity */}
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Time Block Badge */}
                        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 text-white min-w-[80px] shrink-0 text-center shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-teal-400 mb-1" />
                          <span className="text-xs font-black font-mono tracking-tight">{bk.time_slot || '10:00 AM'}</span>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5">{bk.date || 'Today'}</span>
                        </div>

                        {/* Patient & Encounter Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-extrabold text-gray-900 truncate">
                              {patientName}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              ({patientAge} Yrs • Female)
                            </span>

                            {/* Urgency Badge */}
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              isUrgent 
                                ? 'bg-rose-50 text-rose-800 border-rose-200 flex items-center gap-1' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {isUrgent && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
                              <span>{isUrgent ? 'P1 Urgent Care' : 'P2 Standard Consult'}</span>
                            </span>

                            {/* Consultation Type Badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              bk.type === 'video'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-teal-50 text-teal-800 border-teal-200'
                            }`}>
                              {bk.type === 'video' ? 'Telehealth Video Call' : 'Doctor Home Visit'}
                            </span>

                            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                              Fee: Rs. {bk.fee} (Paid in Escrow)
                            </span>
                          </div>

                          {/* Chief Complaint & Clinical Preview */}
                          <div className="flex items-center gap-2 text-xs text-gray-700">
                            <span className="font-semibold text-gray-900">Chief Complaint:</span>
                            <span className="text-gray-600 truncate">{bk.reason || 'Acute fever 102°F, pharyngitis, malaise for 2 days.'}</span>
                          </div>

                          {/* Quick Clinical Vitals Indicator */}
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                              <span>Vitals: BP 118/76 • Temp 101.4°F • SpO2 98%</span>
                            </span>
                            {isUrgent && (
                              <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                Penicillin Allergy Noted
                              </span>
                            )}
                          </div>

                          {/* Home Visit Address Preview */}
                          {bk.type === 'home_visit' && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-950 flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">
                                <strong>Destination:</strong> {bk.address?.street || 'House 14-B'}, {bk.address?.area || 'DHA Phase 5'}, {bk.address?.city || 'Lahore'}
                              </span>
                              <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 font-mono px-1.5 rounded">
                                Gate Code #5482
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Controls: Video, GPS Cockpit, Ambient Scribe, and Prescription */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto self-end lg:self-center">
                        {/* Primary Encounter Trigger Button */}
                        {bk.type === 'video' ? (
                          <button
                            onClick={() => navigate(`/consultation/${bk.id}`)}
                            className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Video className="w-4 h-4" />
                            <span>Start Video Call</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/visit/${bk.id}`)}
                            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Navigation className="w-4 h-4" />
                            <span>Doctor Navigation HUD</span>
                          </button>
                        )}

                        {/* Dedicated CuraLink AI Scribe Button for this Patient */}
                        <button
                          onClick={() => navigate('/doctor/scribe')}
                          className="flex-1 sm:flex-initial bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Open CuraLink AI Scribe: Record conversation and generate AI report"
                        >
                          <Mic className="w-3.5 h-3.5 text-teal-600" />
                          <span>CuraLink Scribe</span>
                        </button>

                        {/* Issue Rx / Pre-Sign */}
                        <button
                          onClick={() => navigate(`/consultation/${bk.id}/report`)}
                          className="flex-1 sm:flex-initial bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                          <span>View Rx</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE B: COMPREHENSIVE CLINICAL AGENDA TABLE */}
          {scheduleViewMode === 'agenda' && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Patient Profile</th>
                      <th className="py-3 px-4">Encounter Type</th>
                      <th className="py-3 px-4">Triage Complaint</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Escrow Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSchedule.map((bk, idx) => {
                      const isUrgent = idx === 0;
                      const patientName = bk.patient_name || (idx === 0 ? 'Zainab Ahmed' : idx === 1 ? 'Hamza Tariq' : 'Fatima Noor');

                      return (
                        <tr key={bk.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              <span>{bk.time_slot}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">{patientName}</div>
                            <div className="text-[11px] text-gray-500">{idx === 0 ? '29F • B+ • Lahore' : '42M • O+ • Lahore'}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              bk.type === 'video' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              {bk.type === 'video' ? 'Telehealth Video' : 'Home Bedside Visit'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate text-gray-700">
                            {bk.reason}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isUrgent ? 'P1 Urgent' : 'P2 Standard'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-emerald-700">
                            Rs. {bk.fee} (Secured)
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {bk.type === 'video' ? (
                                <button
                                  onClick={() => navigate(`/consultation/${bk.id}`)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Video</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => navigate(`/visit/${bk.id}`)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Navigation className="w-3 h-3" />
                                  <span>Nav</span>
                                </button>
                              )}

                              <button
                                onClick={() => navigate('/doctor/scribe')}
                                className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Mic className="w-3 h-3 text-teal-600" />
                                <span>CuraLink Scribe</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 1.5: CLINICAL NOTES & PATIENT OBSERVATIONS */}
      {activeTab === 'notes' && (
        <MedicalNotesSection />
      )}

      {/* VIEW 2: EARNINGS & PAYOUTS FINANCIAL HUB */}
      {activeTab === 'earnings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Earnings</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">Rs. 8,000</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">4 completed consultations</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">This Month's Net</p>
              <p className="text-2xl font-extrabold text-[#0F766E] mt-1">Rs. 184,500</p>
              <p className="text-[11px] text-gray-500 mt-1">95% net after platform fee</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Settlement</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">Rs. 24,000</p>
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Scheduled for next Monday</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Consultations</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">428</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">100% verified payouts</p>
            </div>
          </div>

          {/* Verified Bank Account & Instant Payout Card */}
          <div className="bg-gradient-to-r from-teal-900 to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-teal-800/80 px-2.5 py-0.5 rounded-full font-medium text-teal-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-300" />
                  Primary Settlement Bank Account
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  Active & Verified
                </span>
              </div>

              <h3 className="text-xl font-extrabold">Habib Bank Limited (HBL Pakistan)</h3>
              <p className="text-xs sm:text-sm text-teal-100 font-mono">
                IBAN: PK36HABB0001234567890102 • Title: Dr. Ayesha Khan
              </p>
              <p className="text-[11px] text-teal-200">
                Weekly automatic direct deposit scheduled every Monday at 09:00 AM PKT.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setPayoutRequested(true);
                  setTimeout(() => setPayoutRequested(false), 4000);
                }}
                className="bg-white hover:bg-teal-50 text-[#0F766E] text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-[#0F766E]" />
                <span>{payoutRequested ? 'Payout Request Submitted!' : 'Request Early Settlement (Rs. 24,000)'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="bg-teal-950/50 hover:bg-teal-950 text-white text-xs font-bold px-4 py-3 rounded-xl border border-teal-500/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tax Statement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DOCTOR CONSOLE OVERVIEW (DEFAULT) */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Ambient Clinical Voice Scribe Feature Hero Banner with Live Mic */}
          <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-500/30 relative overflow-hidden">
            {/* Ambient pattern accent */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-teal-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                    <span>Live Ambient Speech-to-Clinical Report Engine</span>
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    Gemini Clinical AI
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Mic className="w-6 h-6 text-teal-400" />
                  <span>CuraLink AI Scribe</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Press the microphone during your consultation for seamless dual-voice recording of doctor and patient. CuraLink AI Scribe generates an accurate consultation dialogue transcript and structured clinical report with ICD-10 diagnosis, prescribed medications, and digital PMC signature verification.
                </p>

                {/* 4 Steps Workflow Tags */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-teal-400 font-bold">1. Tap Mic</span>
                    <p className="text-slate-400 text-[10px]">Records Doctor & Patient</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-teal-400 font-bold">2. View Transcript</span>
                    <p className="text-slate-400 text-[10px]">Full spoken text</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-teal-400 font-bold">3. Auto AI Report</span>
                    <p className="text-slate-400 text-[10px]">Diagnosis, vitals & Rx</p>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                    <span className="text-teal-400 font-bold">4. Edit & Sign</span>
                    <p className="text-slate-400 text-[10px]">PMC certified digital Rx</p>
                  </div>
                </div>
              </div>

              {/* Big Interactive Mic Button */}
              <div className="flex flex-col items-center justify-center shrink-0 w-full lg:w-auto">
                <button
                  id="overview-big-mic-button"
                  onClick={() => navigate('/doctor/scribe')}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ring-4 ring-teal-400/40 group"
                >
                  <Mic className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform text-slate-950 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Open Scribe</span>
                </button>
                <p className="text-[11px] text-teal-200 mt-2 font-semibold text-center">
                  Launch CuraLink AI Scribe console
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Consultations</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">4 Scheduled</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">2 video • 2 home visits</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Today's Earnings</p>
              <p className="text-xl sm:text-2xl font-extrabold text-[#0F766E] mt-1">Rs. 8,000</p>
              <p className="text-[11px] text-gray-500 mt-1">Direct to HBL account</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Consultations</p>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">428</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">Telehealth & Home</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Patient Rating</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-xl sm:text-2xl font-extrabold text-gray-900">4.9</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Across 180+ verified reviews</p>
            </div>
          </div>

          {/* Today's Up Next Consultation Queue */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Up Next Clinical Consultations</h3>
                <p className="text-xs text-gray-500">Scheduled patients waiting in telemedicine queue and bedside visits.</p>
              </div>

              <button
                onClick={() => navigate('/dashboard/doctor/appointments')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {(bookings || []).slice(0, 3).map((bk, idx) => (
                <div
                  key={bk.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {bk.patient_name || (idx === 0 ? 'Zainab Ahmed' : 'Hamza Tariq')}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        bk.type === 'video' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {bk.type === 'video' ? 'Telehealth Video' : 'Home Visit'}
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border">
                        {bk.time_slot}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Chief Complaint: {bk.reason}</p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {bk.type === 'video' ? (
                      <button
                        onClick={() => navigate(`/consultation/${bk.id}`)}
                        className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Call</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/visit/${bk.id}`)}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Doctor Nav HUD</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/doctor/scribe')}
                      className="flex-1 sm:flex-initial bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-teal-600" />
                      <span>CuraLink Scribe</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Doctor Slot Management Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Manage Practice Schedule & Slots</h3>
                  <p className="text-[11px] text-gray-500">Configure clinic hours, buffer time and open urgent/same-day slots.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotCreatedSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold">Urgent same-day consultation slot opened and published to patient booking!</span>
              </div>
            ) : null}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Morning Telehealth & Clinic Window</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" defaultValue="09:00" className="p-2 border rounded-xl bg-gray-50 text-xs" />
                  <input type="time" defaultValue="13:00" className="p-2 border rounded-xl bg-gray-50 text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Evening Bedside & Hospital Window</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" defaultValue="17:00" className="p-2 border rounded-xl bg-gray-50 text-xs" />
                  <input type="time" defaultValue="21:00" className="p-2 border rounded-xl bg-gray-50 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-bold text-gray-700">Consultation Duration</label>
                  <select defaultValue="20" className="w-full p-2 border rounded-xl bg-gray-50 text-xs mt-1">
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes (Standard)</option>
                    <option value="30">30 Minutes (Comprehensive)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700">Transit Buffer (Home Visits)</label>
                  <select defaultValue="30" className="w-full p-2 border rounded-xl bg-gray-50 text-xs mt-1">
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes (Standard)</option>
                    <option value="45">45 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={handleCreateEmergencySlot}
                className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                + Open Urgent Slot Now
              </button>

              <button
                onClick={() => setShowSlotModal(false)}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
