import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartPulse, 
  Menu, 
  X, 
  Bell, 
  User as UserIcon, 
  Stethoscope, 
  ShieldAlert,
  ChevronDown,
  LogOut,
  Calendar,
  FileText,
  Activity,
  PhoneCall,
  Wallet,
  Settings,
  ShieldCheck,
  ArrowRight,
  Mic,
  Sparkles,
  ClipboardList,
  Car,
  Building2,
  BookOpen
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Header: React.FC = () => {
  const { currentPath, navigate, currentUser, logout, notifications, loginAs, bookings, consultationReports, patientProfile, medicalNotes } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [findCareDropdownOpen, setFindCareDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [personaPickerOpen, setPersonaPickerOpen] = useState(false);

  const effectiveUserName = currentUser 
    ? (currentUser.role === 'patient' && patientProfile?.name ? patientProfile.name : currentUser.name)
    : '';

  const unreadNotifs = (notifications || []).filter(n => !n?.read).length;
  const activePatientBookings = (bookings || []).filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const doctorBookingsCount = (bookings || []).length;
  const recordsCount = (consultationReports || []).length;
  const notesCount = (medicalNotes || []).length;

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setFindCareDropdownOpen(false);
    setNotificationsOpen(false);
    if (path.startsWith('#') || path.startsWith('/#')) {
      const hash = path.startsWith('/#') ? path.substring(1) : path;
      if (currentPath !== '/') {
        navigate('/' + hash);
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    navigate(path);
  };

  const isCareActive = currentPath.startsWith('/doctors') || 
                       currentPath.startsWith('/home-care') || 
                       currentPath.startsWith('/home-visit') || 
                       currentPath === '/nurses' || 
                       currentPath.startsWith('/hospitals');

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => handleNav(currentUser?.role === 'doctor' ? '/dashboard/doctor' : '/')}
            className="flex items-center gap-2.5 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-[#0F766E] flex items-center justify-center text-white">
              <div className="w-3.5 h-3.5 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#0F766E] tracking-tight uppercase">CuraLink</span>
              {currentUser?.role === 'doctor' && (
                <span className="hidden sm:inline-block text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Doctor Portal
                </span>
              )}
            </div>
          </button>

          {/* Center Nav Links (Desktop) - Clean, Uncluttered, Direct & Intuitive */}
          {currentUser?.role === 'doctor' ? (
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-xs font-medium">
              {/* Doctor Console Direct Link */}
              <button 
                id="nav-doctor-console"
                onClick={() => handleNav('/dashboard/doctor')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath === '/dashboard/doctor' || currentPath === '/dashboard/doctor/overview'
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Console</span>
              </button>

              {/* Appointments Schedule */}
              <button 
                id="nav-doctor-appointments"
                onClick={() => handleNav('/dashboard/doctor/appointments')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath.startsWith('/dashboard/doctor/appointments') 
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Appointments</span>
                {(bookings || []).length > 0 && (
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded-full">
                    {(bookings || []).length}
                  </span>
                )}
              </button>

              {/* CuraLink AI Scribe */}
              <button 
                id="nav-doctor-scribe"
                onClick={() => handleNav('/doctor/scribe')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold ${
                  currentPath === '/doctor/scribe' || currentPath.startsWith('/doctor/scribe')
                    ? 'bg-teal-700 text-white shadow-xs' 
                    : 'bg-teal-50 text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>AI Scribe</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-white text-teal-800 font-extrabold">
                  Dual-Voice
                </span>
              </button>

              {/* Consultation Reports */}
              <button 
                id="nav-doctor-reports"
                onClick={() => handleNav('/dashboard/doctor/reports')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath.startsWith('/dashboard/doctor/reports') 
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clinical Reports</span>
                {(consultationReports || []).length > 0 && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
                    {(consultationReports || []).length}
                  </span>
                )}
              </button>

              {/* Clinical Notes */}
              <button 
                id="nav-doctor-notes"
                onClick={() => handleNav('/dashboard/doctor/notes')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath.startsWith('/dashboard/doctor/notes') 
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
                <span>Clinical Notes</span>
              </button>

              {/* Earnings & Payouts */}
              <button 
                id="nav-doctor-earnings"
                onClick={() => handleNav('/dashboard/doctor/earnings')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath.startsWith('/dashboard/doctor/earnings') 
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                <span>Earnings</span>
              </button>

              {/* Doctor Profile (PMC) */}
              <button 
                id="nav-doctor-profile"
                onClick={() => handleNav('/dashboard/doctor/profile')} 
                className={`transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold ${
                  currentPath.startsWith('/dashboard/doctor/profile') 
                    ? 'bg-teal-50 text-[#0F766E] font-bold border border-teal-200' 
                    : 'text-gray-700 hover:text-[#0F766E] hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Doctor Profile</span>
              </button>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium">
              {/* Find Doctors Direct Link */}
              <button 
                id="nav-doctors"
                onClick={() => handleNav('/doctors')} 
                className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 ${
                  currentPath === '/doctors' || currentPath.startsWith('/doctors/') 
                    ? 'text-[#0F766E] font-bold' 
                    : 'text-gray-700 hover:text-[#0F766E]'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Find Doctors</span>
              </button>

              {/* Home Visit Care */}
              <button 
                id="nav-homecare"
                onClick={() => handleNav('/home-care')} 
                className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 px-2 rounded-lg ${
                  currentPath.startsWith('/home-care') || currentPath.startsWith('/home-visit') || currentPath === '/nurses'
                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                    : 'text-gray-700 hover:text-[#0F766E]'
                }`}
              >
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Home Visit Care</span>
              </button>

              {/* AI Symptom Check */}
              <button 
                id="nav-symptom-check"
                onClick={() => handleNav('/symptom-check')} 
                className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 ${
                  currentPath === '/symptom-check' ? 'text-[#0F766E] font-bold' : 'text-gray-700 hover:text-[#0F766E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>AI Symptom Check</span>
              </button>

              {/* Hospitals & ER */}
              <button 
                id="nav-hospitals"
                onClick={() => handleNav('/hospitals')} 
                className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1.5 ${
                  currentPath.startsWith('/hospitals') ? 'text-[#0F766E] font-bold' : 'text-gray-700 hover:text-[#0F766E]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Hospitals & ER</span>
              </button>

              {/* Health & Disease Guide */}
              <button 
                id="nav-diseases"
                onClick={() => handleNav('/diseases')} 
                className={`transition-colors cursor-pointer py-1.5 ${
                  currentPath.startsWith('/diseases') ? 'text-[#0F766E] font-bold' : 'text-gray-700 hover:text-[#0F766E]'
                }`}
              >
                Health Guide
              </button>

              {currentUser && (
                <button
                  id="nav-dashboard"
                  onClick={() => handleNav(currentUser.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient')}
                  className={`font-semibold transition-colors cursor-pointer py-1.5 ${
                    currentPath.startsWith('/dashboard') ? 'text-[#0F766E] font-bold underline underline-offset-4' : 'text-[#0F766E] hover:text-[#0B5C56]'
                  }`}
                >
                  Dashboard
                </button>
              )}
            </nav>
          )}

          {/* Right Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                {/* Notifications Bell with Popover Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-[#0F766E] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Notifications"
                    id="desktop-notifications-button"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-600 bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-[#0F766E] font-bold text-xs flex items-center justify-center">
                      {effectiveUserName.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-medium text-gray-800 max-w-[100px] truncate">{effectiveUserName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      {/* Invisible backdrop to dismiss on outside click */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserDropdownOpen(false)} 
                      />
                      <div 
                        id="user-navigation-menu"
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      >
                        {/* Account Header with Status Badge */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60 rounded-t-2xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                              {currentUser.role === 'patient' ? 'Patient Portal' : 'Physician Console'}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              currentUser.role === 'patient'
                                ? 'bg-teal-50 text-[#0F766E] border-teal-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}>
                              <ShieldCheck className="w-3 h-3" />
                              <span>{currentUser.role === 'patient' ? 'CNIC Verified' : 'PMC Active'}</span>
                            </span>
                          </div>
                          <p className="text-sm font-extrabold text-gray-900 truncate mt-1">{effectiveUserName}</p>
                        </div>

                        {/* Navigation Section */}
                        <div className="py-2 px-1.5 space-y-0.5">
                          {currentUser.role === 'patient' ? (
                            <>
                              <button
                                id="nav-item-patient-dashboard"
                                onClick={() => handleNav('/dashboard/patient')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/patient' || currentPath === '/dashboard/patient/overview'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center group-hover:bg-teal-100 transition-colors shrink-0">
                                    <HeartPulse className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">My Health Dashboard</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Vitals & care overview</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </button>

                              <button
                                id="nav-item-patient-appointments"
                                onClick={() => handleNav('/dashboard/patient/appointments')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/patient/appointments'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                    <Calendar className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">My Appointments</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Upcoming & past consults</p>
                                  </div>
                                </div>
                                {activePatientBookings > 0 ? (
                                  <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded-full">
                                    {activePatientBookings} active
                                  </span>
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </button>

                              <button
                                id="nav-item-patient-history"
                                onClick={() => handleNav('/dashboard/patient/history')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/patient/history'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Medical History</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Diagnoses, reports & Rx</p>
                                  </div>
                                </div>
                                {recordsCount > 0 ? (
                                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                    {recordsCount}
                                  </span>
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </button>

                              <button
                                id="nav-item-patient-notes"
                                onClick={() => handleNav('/dashboard/patient/notes')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/patient/notes'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center group-hover:bg-teal-100 transition-colors shrink-0">
                                    <ClipboardList className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Medical Notes</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Clinical remarks & vitals</p>
                                  </div>
                                </div>
                                {notesCount > 0 ? (
                                  <span className="text-[10px] font-semibold text-[#0F766E] bg-teal-100 px-1.5 py-0.5 rounded-full">
                                    {notesCount}
                                  </span>
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </button>

                              <button
                                id="nav-item-patient-profile"
                                onClick={() => handleNav('/dashboard/patient/profile')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/patient/profile' || currentPath === '/profile/patient'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors shrink-0">
                                    <UserIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">My Profile (CNIC)</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Allergies & emergency contact</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                id="nav-item-doctor-console"
                                onClick={() => handleNav('/dashboard/doctor')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/doctor' || currentPath === '/dashboard/doctor/overview'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center group-hover:bg-teal-100 transition-colors shrink-0">
                                    <Stethoscope className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Doctor Console</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Duty toggle & active triage</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </button>

                              <button
                                id="nav-item-doctor-appointments"
                                onClick={() => handleNav('/dashboard/doctor/appointments')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/doctor/appointments'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                    <Calendar className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Appointments Schedule</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Video calls & bedside visits</p>
                                  </div>
                                </div>
                                {doctorBookingsCount > 0 ? (
                                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded-full">
                                    {doctorBookingsCount}
                                  </span>
                                ) : (
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                                )}
                              </button>

                              <button
                                id="nav-item-doctor-earnings"
                                onClick={() => handleNav('/dashboard/doctor/earnings')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/doctor/earnings'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                                    <Wallet className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Earnings & Payouts</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Bank IBAN & ledger</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  Rs. 184.5k
                                </span>
                              </button>

                              <button
                                id="nav-item-doctor-profile"
                                onClick={() => handleNav('/dashboard/doctor/profile')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/dashboard/doctor/profile' || currentPath === '/profile/doctor'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition-colors shrink-0">
                                    <UserIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">Doctor Profile (PMC)</p>
                                    <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Qualifications & consult fees</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </button>

                              <button
                                id="nav-item-doctor-scribe"
                                onClick={() => handleNav('/doctor/scribe')}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between group transition-colors cursor-pointer ${
                                  currentPath === '/doctor/scribe'
                                    ? 'bg-teal-50 text-[#0F766E] font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors shrink-0">
                                    <Mic className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-gray-900 leading-tight">CuraLink AI Scribe</p>
                                    <p className="text-[11px] text-emerald-600 leading-tight mt-0.5">Dual-voice recording & AI prescription</p>
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Footer Settings & Sign Out */}
                        <div className="pt-1 px-1.5 border-t border-gray-100 space-y-0.5">
                          <button
                            id="nav-item-settings"
                            onClick={() => handleNav('/settings')}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 cursor-pointer transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                              <Settings className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium">Account Settings</span>
                          </button>
                          <button
                            id="nav-item-logout"
                            onClick={() => { setUserDropdownOpen(false); logout(); }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-semibold cursor-pointer transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <LogOut className="w-3.5 h-3.5" />
                            </div>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notifications Bell for Guest as well */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-600 hover:text-[#0F766E] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Notifications"
                    id="guest-desktop-notifications-button"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>
                  {notificationsOpen && (
                    <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />
                  )}
                </div>

                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-semibold text-[#0F766E] border border-[#0F766E] rounded-lg hover:bg-teal-50 transition-all cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0F766E] rounded-lg hover:bg-[#0B5C56] transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Action Controls */}
          <div className="flex md:hidden items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleNav('/notifications')}
              className="relative p-2 text-gray-600 hover:text-[#0F766E] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              title="Notifications"
              id="mobile-notifications-button"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-teal-700 focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-out Panel - Structured and Logical */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto">
            {currentUser ? (
              <div className="bg-teal-50 p-3.5 rounded-xl flex items-center justify-between border border-teal-100">
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Signed in as</p>
                  <p className="text-sm font-extrabold text-gray-900">{effectiveUserName}</p>
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">{currentUser.role}</span>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="text-xs text-red-600 font-bold px-3 py-1.5 bg-white rounded-lg border border-red-200 shadow-2xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleNav('/login')}
                  className="flex-1 py-2.5 rounded-xl border border-[#0F766E] text-[#0F766E] text-xs font-bold text-center"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F766E] text-white text-xs font-bold text-center shadow-xs"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Navigation for Doctor vs Patient */}
            {currentUser?.role === 'doctor' ? (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider px-1">Physician Clinical Tools</p>
                <button
                  id="mobile-nav-doctor-console"
                  onClick={() => handleNav('/dashboard/doctor')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath === '/dashboard/doctor' || currentPath === '/dashboard/doctor/overview' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Doctor Console & Duty</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  id="mobile-nav-doctor-appointments"
                  onClick={() => handleNav('/dashboard/doctor/appointments')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath.startsWith('/dashboard/doctor/appointments') ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Appointments Schedule</span>
                  </div>
                  {(bookings || []).length > 0 ? (
                    <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full">
                      {(bookings || []).length}
                    </span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                <button
                  id="mobile-nav-doctor-scribe"
                  onClick={() => handleNav('/doctor/scribe')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                    currentPath === '/doctor/scribe' ? 'bg-teal-700 text-white' : 'bg-teal-50/70 text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-teal-600 animate-pulse" />
                    <span>CuraLink AI Scribe (Dual-Voice)</span>
                  </div>
                  <span className="text-[10px] bg-white text-teal-800 font-extrabold px-1.5 py-0.5 rounded shadow-2xs">
                    Live
                  </span>
                </button>

                <button
                  id="mobile-nav-doctor-reports"
                  onClick={() => handleNav('/dashboard/doctor/reports')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath.startsWith('/dashboard/doctor/reports') ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Clinical Reports & Digital Rx</span>
                  </div>
                  {(consultationReports || []).length > 0 ? (
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {(consultationReports || []).length}
                    </span>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>

                <button
                  id="mobile-nav-doctor-notes"
                  onClick={() => handleNav('/dashboard/doctor/notes')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath.startsWith('/dashboard/doctor/notes') ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4 text-teal-600" />
                    <span>Clinical Notes & Remarks</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  id="mobile-nav-doctor-earnings"
                  onClick={() => handleNav('/dashboard/doctor/earnings')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath.startsWith('/dashboard/doctor/earnings') ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <span>Earnings & Payouts</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F766E]">Rs. 184.5k</span>
                </button>

                <button
                  id="mobile-nav-doctor-profile"
                  onClick={() => handleNav('/dashboard/doctor/profile')}
                  className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    currentPath.startsWith('/dashboard/doctor/profile') ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    <span>Doctor Profile & PMC License</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                {/* Find Care Section */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Find Care</p>
                  <button
                    onClick={() => handleNav('/doctors')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      currentPath === '/doctors' ? 'bg-teal-50 text-[#0F766E]' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Specialist Doctors (PMC)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNav('/home-care')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-bold flex items-center justify-between ${
                      currentPath.startsWith('/home-care') ? 'bg-teal-50 text-[#0F766E]' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Car className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Home Visit (Nurse / Paramedic)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                            Doorstep
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-normal">IV drips, vitals, dressings & injections</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNav('/hospitals')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      currentPath.startsWith('/hospitals') ? 'bg-teal-50 text-[#0F766E]' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <span>Hospitals & ER Hotlines</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Health Tools */}
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">Health Tools</p>
                  
                  <button
                    onClick={() => handleNav('/symptom-check')}
                    className="w-full text-left p-2.5 rounded-xl text-sm font-bold text-[#0F766E] bg-teal-50/50 hover:bg-teal-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>AI Symptom Triage (Free)</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
                  </button>

                  <button
                    onClick={() => handleNav('/diseases')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      currentPath.startsWith('/diseases') ? 'bg-teal-50 text-[#0F766E]' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span>Diseases & Health Guide</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => handleNav('/why-curalink')}
                    className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                      currentPath === '/why-curalink' ? 'bg-teal-50 text-[#0F766E]' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Why CuraLink</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </>
            )}

            {/* User Dashboard Section (Mobile) */}
            {currentUser && (
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  {currentUser.role === 'doctor' ? 'Clinical Console' : 'Patient Portal'}
                </p>

                {currentUser.role === 'patient' ? (
                  <>
                    <button
                      onClick={() => handleNav('/dashboard/patient')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/patient' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      My Health Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/patient/appointments')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/patient/appointments' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      My Appointments {activePatientBookings > 0 ? `(${activePatientBookings})` : ''}
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/patient/history')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/patient/history' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Medical History & Prescriptions
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/patient/notes')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/patient/notes' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Medical Notes ({notesCount})
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/patient/profile')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/patient/profile' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      My Profile (CNIC)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav('/dashboard/doctor')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/doctor' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Doctor Console & Active Duty
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/doctor/appointments')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/doctor/appointments' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Appointments Schedule ({doctorBookingsCount})
                    </button>
                    <button
                      onClick={() => handleNav('/doctor/scribe')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium text-emerald-700 ${
                        currentPath === '/doctor/scribe' ? 'bg-emerald-50 font-bold' : ''
                      }`}
                    >
                      CuraLink AI Scribe
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/doctor/earnings')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/doctor/earnings' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Earnings & Payouts (Rs. 184.5k)
                    </button>
                    <button
                      onClick={() => handleNav('/dashboard/doctor/profile')}
                      className={`block w-full text-left py-2 px-2.5 rounded-lg text-sm font-medium ${
                        currentPath === '/dashboard/doctor/profile' ? 'bg-teal-50 text-[#0F766E] font-bold' : 'text-gray-700'
                      }`}
                    >
                      Doctor Profile (PMC)
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleNav('/settings')}
                  className="block w-full text-left py-2 px-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Account Settings
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Floating Demo Role Switcher (Discrete & Non-Intrusive) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          id="floating-role-switcher-btn"
          onClick={() => setPersonaPickerOpen(!personaPickerOpen)}
          className="bg-gray-900/90 hover:bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-gray-700/80 flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95"
          title="Switch Demo Testing Role"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {currentUser 
              ? (currentUser.role === 'patient' ? `Role: Patient (${effectiveUserName.split(' ')[0] || 'Zainab'})` : `Role: Dr. (${effectiveUserName.split(' ')[0] || 'Ayesha'})`)
              : 'Role: Guest'}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${personaPickerOpen ? 'rotate-180' : ''}`} />
        </button>

        {personaPickerOpen && (
          <div className="absolute bottom-10 right-0 w-80 bg-gray-900 text-white p-3.5 rounded-2xl shadow-2xl border border-gray-700 text-xs mb-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
              <span className="font-bold text-gray-300">Switch Demo Role</span>
              <button onClick={() => setPersonaPickerOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => { loginAs('patient', 'approved'); setPersonaPickerOpen(false); }}
                className="w-full text-left bg-teal-800/80 hover:bg-teal-700 p-2 rounded-xl text-white font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Patient (Zainab Khan)</span>
                <span className="text-[10px] text-teal-200 bg-teal-900 px-1.5 py-0.5 rounded font-bold">Approved</span>
              </button>
              <button
                onClick={() => { loginAs('patient', 'new'); setPersonaPickerOpen(false); }}
                className="w-full text-left bg-amber-800/80 hover:bg-amber-700 p-2 rounded-xl text-white font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Patient (Incomplete Onboarding)</span>
                <span className="text-[10px] text-amber-200 bg-amber-900 px-1.5 py-0.5 rounded font-bold">New</span>
              </button>
              <button
                onClick={() => { loginAs('doctor', 'approved'); setPersonaPickerOpen(false); }}
                className="w-full text-left bg-blue-800/80 hover:bg-blue-700 p-2 rounded-xl text-white font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Doctor (Dr. Ayesha Malik)</span>
                <span className="text-[10px] text-blue-200 bg-blue-900 px-1.5 py-0.5 rounded font-bold">PMC Verified</span>
              </button>
              <button
                onClick={() => { loginAs('doctor', 'pending'); setPersonaPickerOpen(false); }}
                className="w-full text-left bg-amber-900/80 hover:bg-amber-800 p-2 rounded-xl text-white font-medium flex items-center justify-between cursor-pointer"
              >
                <span>Doctor (Pending Review)</span>
                <span className="text-[10px] text-amber-200 bg-amber-950 px-1.5 py-0.5 rounded font-bold">Pending</span>
              </button>
              <button
                onClick={() => { logout(); setPersonaPickerOpen(false); }}
                className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded-xl text-gray-300 font-medium cursor-pointer"
              >
                Log Out (Guest View)
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
