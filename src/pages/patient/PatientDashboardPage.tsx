import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  Search, 
  PhoneCall, 
  Calendar, 
  Clock, 
  Video, 
  Car, 
  FileText, 
  Pill, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  User, 
  Plus, 
  HeartPulse,
  ChevronRight,
  Filter,
  CheckCircle2,
  Printer,
  Download,
  Share2,
  Sparkles,
  ClipboardList,
  Pin,
  Send
} from 'lucide-react';
import { PatientNotesAndRequestsSection } from '../../components/patient/PatientNotesAndRequestsSection';
import { EmergencyButton } from '../../components/shared/EmergencyButton';
import { RequestMedicalNoteModal } from '../../components/medical/RequestMedicalNoteModal';

export const PatientDashboardPage: React.FC = () => {
  const { 
    currentPath,
    currentUser, 
    patientProfile, 
    bookings, 
    doctors, 
    consultationReports, 
    medicalNotes,
    navigate, 
    updateBookingStatus 
  } = useApp();

  // Determine active tab based on current URL path
  const activeTab = useMemo<'overview' | 'appointments' | 'history' | 'notes'>(() => {
    if (currentPath.includes('/appointments')) return 'appointments';
    if (currentPath.includes('/history')) return 'history';
    if (currentPath.includes('/notes')) return 'notes';
    return 'overview';
  }, [currentPath]);

  // Appointments sub-filters
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState<'all' | 'video' | 'home_visit'>('all');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // History sub-filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyDiagnosisFilter, setHistoryDiagnosisFilter] = useState<string>('all');
  const [isRequestNoteModalOpen, setIsRequestNoteModalOpen] = useState(false);

  // Scope appointments and medical history specifically to current registered patient
  const userBookings = useMemo(() => {
    if (!currentUser) return bookings || [];
    if (currentUser.uid === 'patient_demo') {
      return bookings || [];
    }
    return (bookings || []).filter(b => 
      b.patient_uid === currentUser.uid || 
      (b.patient_name && currentUser.name && b.patient_name.toLowerCase() === currentUser.name.toLowerCase())
    );
  }, [bookings, currentUser]);

  const userReports = useMemo(() => {
    if (!currentUser) return consultationReports || [];
    if (currentUser.uid === 'patient_demo') {
      return consultationReports || [];
    }
    return (consultationReports || []).filter(r => 
      r.patient_uid === currentUser.uid || 
      (r.patient_name && currentUser.name && r.patient_name.toLowerCase() === currentUser.name.toLowerCase())
    );
  }, [consultationReports, currentUser]);

  const activeBookings = (userBookings || []).filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  const pastBookings = (userBookings || []).filter(b => b.status === 'completed' || b.status === 'cancelled');

  // Filtered appointments
  const filteredBookings = useMemo(() => {
    return (userBookings || []).filter(b => {
      // Status filter
      if (appointmentFilter === 'active' && !(b.status === 'confirmed' || b.status === 'in_progress')) return false;
      if (appointmentFilter === 'completed' && !(b.status === 'completed' || b.status === 'cancelled')) return false;
      // Type filter
      if (appointmentTypeFilter !== 'all' && b.type !== appointmentTypeFilter) return false;
      // Search filter
      if (appointmentSearch.trim()) {
        const query = appointmentSearch.toLowerCase();
        const doc = (doctors || []).find(d => d.id === b.doctor_id || d.uid === b.doctor_id);
        const docMatch = doc?.name?.toLowerCase().includes(query) || doc?.specialty?.toLowerCase().includes(query);
        const reasonMatch = b.reason?.toLowerCase().includes(query);
        if (!docMatch && !reasonMatch) return false;
      }
      return true;
    });
  }, [userBookings, doctors, appointmentFilter, appointmentTypeFilter, appointmentSearch]);

  // Filtered medical history
  const filteredHistory = useMemo(() => {
    return (userReports || []).filter(item => {
      if (historyDiagnosisFilter !== 'all' && !item.diagnosis?.toLowerCase().includes(historyDiagnosisFilter.toLowerCase())) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const docMatch = item.doctor_name?.toLowerCase().includes(q);
        const diagMatch = item.diagnosis?.toLowerCase().includes(q);
        const complaintMatch = item.chief_complaint?.toLowerCase().includes(q);
        const medMatch = item.medications?.some(m => m.name.toLowerCase().includes(q));
        if (!docMatch && !diagMatch && !complaintMatch && !medMatch) return false;
      }
      return true;
    });
  }, [userReports, historyDiagnosisFilter, historySearch]);

  const currentPatientName = currentUser?.name || patientProfile?.name || 'Patient';
  const currentPatientCnic = currentUser?.cnic || patientProfile?.cnic || '35202-*******-1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-[#0F766E] rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-teal-700/80 px-2.5 py-0.5 rounded-full font-medium text-teal-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
              CNIC Verified: {currentPatientCnic}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome back, {currentPatientName}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl leading-relaxed">
            Your centralized medical record is synchronized across telehealth video consults and bedside doctor visits in Pakistan.
          </p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <EmergencyButton 
            callerRole="patient" 
            patientName={currentPatientName}
          />

          <button
            onClick={() => navigate('/symptom-check')}
            className="flex-1 md:flex-initial bg-white hover:bg-teal-50 text-[#0F766E] text-xs font-bold px-4 py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#0F766E]" />
            <span>Check Symptoms</span>
          </button>

          <button
            onClick={() => navigate('/doctors')}
            className="flex-1 md:flex-initial bg-teal-900/60 hover:bg-teal-900 text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors border border-teal-600/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Find a Doctor</span>
          </button>

          <button
            onClick={() => navigate('/home-care')}
            className="flex-1 md:flex-initial bg-teal-900/60 hover:bg-teal-900 text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors border border-teal-600/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Car className="w-4 h-4" />
            <span>Home Care (Nurse/Paramedic)</span>
          </button>
        </div>
      </div>

      {/* Patient Portal Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-2xs flex flex-wrap items-center gap-1">
        <button
          id="patient-tab-overview"
          onClick={() => navigate('/dashboard/patient')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Health Overview</span>
        </button>

        <button
          id="patient-tab-appointments"
          onClick={() => navigate('/dashboard/patient/appointments')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Appointments</span>
          {activeBookings.length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'appointments' ? 'bg-teal-900 text-teal-100' : 'bg-teal-100 text-[#0F766E]'
            }`}>
              {activeBookings.length}
            </span>
          )}
        </button>

        <button
          id="patient-tab-history"
          onClick={() => navigate('/dashboard/patient/history')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Medical History & Records</span>
          {(consultationReports || []).length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'history' ? 'bg-teal-900 text-teal-100' : 'bg-gray-100 text-gray-700'
            }`}>
              {(consultationReports || []).length}
            </span>
          )}
        </button>

        <button
          id="patient-tab-notes"
          onClick={() => navigate('/dashboard/patient/notes')}
          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#0F766E] text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Doctor Notes & Requests</span>
          {(medicalNotes || []).length > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'notes' ? 'bg-teal-900 text-teal-100' : 'bg-amber-100 text-amber-800'
            }`}>
              {(medicalNotes || []).length}
            </span>
          )}
        </button>

        <button
          id="patient-tab-profile"
          onClick={() => navigate('/dashboard/patient/profile')}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center gap-2 transition-all cursor-pointer sm:ml-auto"
        >
          <User className="w-4 h-4 text-teal-600" />
          <span>Profile & CNIC</span>
        </button>
      </div>

      {/* TAB 1: DEDICATED APPOINTMENTS VIEW */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Filter Controls */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Appointments Management</span>
                </h2>
                <p className="text-xs text-gray-500">Track scheduled video appointments, doctor home visits, and past consultations.</p>
              </div>

              <button
                onClick={() => navigate('/doctors')}
                className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Book New Consultation</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Toggle */}
                <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 text-xs">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      appointmentFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All ({(userBookings || []).length})
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('active')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      appointmentFilter === 'active' ? 'bg-white text-teal-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Active ({activeBookings.length})
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('completed')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      appointmentFilter === 'completed' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Past ({pastBookings.length})
                  </button>
                </div>

                {/* Format Filter */}
                <select
                  value={appointmentTypeFilter}
                  onChange={(e) => setAppointmentTypeFilter(e.target.value as any)}
                  className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="all">All Formats (Video & Home)</option>
                  <option value="video">Video Call Only</option>
                  <option value="home_visit">Home Visit Only</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctor or symptom..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map(bk => {
                const doctor = (doctors || []).find(d => d.id === bk.doctor_id || d.uid === bk.doctor_id) || (doctors && doctors[0]);
                const isOngoingOrConfirmed = bk.status === 'confirmed' || bk.status === 'in_progress';
                return (
                  <div
                    key={bk.id}
                    className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all ${
                      isOngoingOrConfirmed ? 'border-teal-500/40 bg-teal-50/10' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={doctor.photo_url}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-gray-900">{doctor.name}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">PMC Verified</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            bk.type === 'video'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {bk.type === 'video' ? 'Telehealth Video Call' : 'Doctor Home Visit'}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            bk.status === 'confirmed' ? 'bg-amber-100 text-amber-800' :
                            bk.status === 'in_progress' ? 'bg-teal-100 text-teal-800 animate-pulse' :
                            bk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {bk.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-teal-800 font-semibold">{doctor.specialty} • {doctor.hospital_affiliation || 'Mayo Hospital Lahore'}</p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {bk.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {bk.time_slot}
                          </span>
                          <span>•</span>
                          <span className="text-gray-600 font-mono">Fee: Rs. {bk.fee}</span>
                        </div>

                        {bk.reason && (
                          <p className="text-xs text-gray-600 pt-1">
                            <span className="font-semibold text-gray-800">Reason / Complaint:</span> {bk.reason}
                          </p>
                        )}
                        {bk.address && bk.type === 'home_visit' && (
                          <p className="text-xs text-gray-500">
                            <span className="font-semibold text-gray-700">Destination:</span> {bk.address.street}, {bk.address.area}, {bk.address.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto self-end md:self-center">
                      {isOngoingOrConfirmed ? (
                        <>
                          {bk.type === 'video' ? (
                            <button
                              onClick={() => navigate(`/consultation/${bk.id}`)}
                              className="flex-1 md:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Video Room</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/visit/${bk.id}`)}
                              className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Car className="w-4 h-4" />
                              <span>Track Doctor Arrival</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Cancel this consultation? Payment will be refunded to your wallet.')) {
                                updateBookingStatus(bk.id, 'cancelled');
                              }
                            }}
                            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/consultation/${bk.id}/report`)}
                          className="flex-1 md:flex-initial bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Official Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-gray-800">No appointments found matching your criteria</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {appointmentSearch || appointmentFilter !== 'all' || appointmentTypeFilter !== 'all'
                    ? 'Try clearing your filters or search keywords to see all appointments.'
                    : 'You currently do not have any scheduled appointments. You can book verified doctors for video calls or home visits anytime.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setAppointmentFilter('all');
                  setAppointmentTypeFilter('all');
                  setAppointmentSearch('');
                  navigate('/doctors');
                }}
                className="inline-flex items-center gap-2 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <span>Browse Verified Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEDICATED MEDICAL HISTORY & CONTINUOUS HEALTH RECORD */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Search */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Continuous Health Record Timeline</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Permanent, tamper-evident longitudinal medical history registered under CNIC {patientProfile.cnic}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                  <span>Print Record</span>
                </button>
              </div>
            </div>

            {/* Search & Disease Filters */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search diagnoses, doctor names, medications, or clinical notes..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Quick Disease Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Filter Diagnosis:</span>
                {[
                  { label: 'All Diagnoses', key: 'all' },
                  { label: 'Dengue Fever', key: 'dengue' },
                  { label: 'Hypertension', key: 'hypertension' },
                  { label: 'Diabetes', key: 'diabetes' },
                  { label: 'Cough & Chest', key: 'cough' },
                  { label: 'Allergy & Skin', key: 'allergy' },
                ].map(pill => (
                  <button
                    key={pill.key}
                    onClick={() => setHistoryDiagnosisFilter(pill.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                      historyDiagnosisFilter === pill.key
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Records */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs hover:border-teal-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]"></span>
                      <span className="text-sm font-extrabold text-gray-900">{item.doctor_name}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">PMC Licensed</span>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                        {item.visit_type === 'video' ? 'Telehealth Video Consult' : 'Home Bedside Visit'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-teal-800 tracking-wider">Clinical Diagnosis</span>
                        <p className="text-sm font-bold text-gray-900 mt-0.5">{item.diagnosis}</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Chief Complaint</span>
                        <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{item.chief_complaint}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-blue-800 tracking-wider flex items-center gap-1">
                        <Pill className="w-3.5 h-3.5 text-blue-600" />
                        <span>Prescribed Medications ({item.medications.length})</span>
                      </span>
                      <div className="space-y-1.5">
                        {item.medications.map((m, mIdx) => (
                          <div key={mIdx} className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-gray-900">{m.name}</span>
                              <span className="text-gray-500 text-[11px] ml-1.5 font-semibold">({m.dosage})</span>
                              <p className="text-[11px] text-gray-500 mt-0.5">{m.instructions}</p>
                            </div>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {m.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Legally binding digital signature issued under PMC telemedicine statutes.
                    </span>
                    <button
                      onClick={() => navigate(`/consultation/${item.booking_id}/report`)}
                      className="text-xs font-bold text-[#0F766E] hover:text-[#0B5C56] bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>View Full Medical Report & Rx</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-base font-bold text-gray-800">No medical records found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No past consultations or medical reports match your query. Clear filters to see your complete history.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2.5: DEDICATED DOCTOR NOTES & REQUESTS VIEW */}
      {activeTab === 'notes' && (
        <PatientNotesAndRequestsSection />
      )}

      {/* TAB 3: COMPLETE HEALTH OVERVIEW (DEFAULT) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Active Bookings Preview & Timeline Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active / Upcoming Bookings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Active & Upcoming Appointments</span>
                </h2>
                <button
                  onClick={() => navigate('/dashboard/patient/appointments')}
                  className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({activeBookings.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeBookings.length > 0 ? (
                <div className="space-y-4">
                  {activeBookings.slice(0, 2).map(bk => {
                    const doctor = (doctors || []).find(d => d.id === bk.doctor_id || d.uid === bk.doctor_id) || (doctors && doctors[0]);
                    return (
                      <div
                        key={bk.id}
                        className="bg-white border-2 border-teal-600/30 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start space-x-3.5">
                          <img
                            src={doctor.photo_url}
                            alt={doctor.name}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">{doctor.name}</span>
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">PMC</span>
                            </div>
                            <p className="text-xs text-teal-800 font-semibold">{doctor.specialty}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                {bk.date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {bk.time_slot}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {bk.type === 'video' ? (
                            <button
                              onClick={() => navigate(`/consultation/${bk.id}`)}
                              className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Video Call</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/visit/${bk.id}`)}
                              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Car className="w-4 h-4" />
                              <span>Track Doctor Arrival</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm('Cancel this consultation? Payment will be refunded to your wallet.')) {
                                updateBookingStatus(bk.id, 'cancelled');
                              }
                            }}
                            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center space-y-3">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No appointments scheduled today</h4>
                  <p className="text-xs text-gray-500">Need medical care? Check symptoms or schedule a consultation anytime.</p>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg cursor-pointer"
                  >
                    <span>Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Health History Timeline Preview */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>Recent Continuous Health Record Timeline</span>
                  </h2>
                  <p className="text-xs text-gray-500">Every consultation, diagnosis, and prescription permanently logged.</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/patient/history')}
                  className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-6">
                {(consultationReports || []).slice(0, 3).map((item) => (
                  <div key={item.id} className="relative pl-6 pb-6 border-l-2 border-teal-200 last:border-l-0 last:pb-0">
                    <span className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-[#0F766E] border-2 border-white"></span>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{item.doctor_name}</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.2 rounded font-bold">
                            {item.visit_type === 'video' ? 'Video Consult' : 'Home Bedside Visit'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400">{new Date(item.date).toLocaleDateString('en-GB')}</span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-teal-900">Diagnosis: {item.diagnosis}</p>
                        <p className="text-[11px] text-gray-600 mt-0.5">Chief Complaint: {item.chief_complaint}</p>
                      </div>

                      {/* Prescribed pills summary */}
                      <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                        {item.medications.map((m, mIdx) => (
                          <span key={mIdx} className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                            {m.name} ({m.dosage})
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => navigate(`/consultation/${item.booking_id}/report`)}
                          className="text-xs font-bold text-[#0F766E] hover:text-[#0B5C56] flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Official Medical Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Medical Notes Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    <span>Doctor Notes & Certificates</span>
                  </h2>
                  <p className="text-xs text-gray-500">Official doctor remarks, clinical evaluations, and verified medical certificates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/dashboard/patient/notes')}
                    className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>All Records & Requests</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {(medicalNotes || []).length > 0 ? (
                <div className="space-y-3">
                  {(medicalNotes || []).slice(0, 2).map((note) => (
                    <div
                      key={note.id}
                      onClick={() => navigate('/dashboard/patient/notes')}
                      className="p-3.5 bg-gray-50 hover:bg-teal-50/40 border border-gray-200 hover:border-teal-300 rounded-xl transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {note.is_pinned && <Pin className="w-3 h-3 text-teal-600 fill-teal-600" />}
                          <span className="text-xs font-bold text-gray-900 line-clamp-1">{note.title}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          note.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : note.priority === 'important'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {note.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <span className="text-teal-900 font-semibold flex items-center gap-1">
                          By {note.author_name}
                          {note.author_pmc && <span className="text-gray-400 font-normal">({note.author_pmc})</span>}
                        </span>
                        <span>{new Date(note.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                  <p className="text-xs text-gray-500">No medical notes or certificates on file yet.</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => setIsRequestNoteModalOpen(true)}
                  className="bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request Note from Doctor</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/patient/notes')}
                  className="text-[#0F766E] font-bold text-xs hover:underline inline-flex items-center gap-1 cursor-pointer self-center sm:self-auto"
                >
                  <span>View All & Requests</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Medications & Health Profile Summary */}
          <div className="space-y-6">
            {/* Current Medications Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span>Current Medications</span>
                </h3>
                <span className="text-[11px] text-gray-400">Doctor Prescribed</span>
              </div>

              <div className="space-y-3">
                {patientProfile.current_medications.map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-900">{med.name}</p>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600">{med.frequency} • {med.instructions}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span>Duration: {med.duration}</span>
                      <span className="text-emerald-700 font-semibold">Active Course</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Profile Summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <span>Health Baseline Summary</span>
                </h3>
                <button
                  onClick={() => navigate('/dashboard/patient/profile')}
                  className="text-xs text-[#0F766E] font-bold hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* Blood group */}
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-gray-600 font-semibold">Blood Group:</span>
                <span className="text-base font-extrabold text-red-600">{patientProfile.blood_group || 'B+'}</span>
              </div>

              {/* Allergies Chips */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-600 block">Known Allergies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patientProfile.allergies.map((all, idx) => (
                    <span key={idx} className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {all}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pre-existing conditions Chips */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-600 block">Pre-Existing Conditions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patientProfile.known_conditions.map((cond, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-800 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                <span className="font-semibold text-gray-800">Primary Emergency Contact:</span>
                <p className="text-gray-600">{patientProfile.emergency_contact?.name} ({patientProfile.emergency_contact?.relationship})</p>
                <p className="font-mono text-gray-500">{patientProfile.emergency_contact?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Request Medical Note Modal */}
      <RequestMedicalNoteModal
        isOpen={isRequestNoteModalOpen}
        onClose={() => setIsRequestNoteModalOpen(false)}
      />
    </div>
  );
};
