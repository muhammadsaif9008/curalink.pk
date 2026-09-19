import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Car, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ArrowRight, 
  Home, 
  Stethoscope,
  FileText,
  PhoneCall
} from 'lucide-react';

interface HomeVisitTrackerProps {
  bookingId?: string;
}

export const HomeVisitTrackerPage: React.FC<HomeVisitTrackerProps> = ({ bookingId }) => {
  const { bookings, doctors, nursesParamedics, navigate, currentRoute } = useApp();

  const routeStr = currentRoute || '';
  const id = bookingId || (routeStr.includes('/visit/') ? (routeStr.split('/visit/')[1] || '') : (bookings && (bookings[1]?.id || bookings[0]?.id)));
  const booking = (bookings || []).find(b => b.id === id) || (bookings && (bookings[1] || bookings[0]));
  const doctor = (doctors || []).find(d => d.id === booking?.doctor_id || d.uid === booking?.doctor_id) || (doctors && doctors[0]);
  const staff = (nursesParamedics || []).find(s => s.id === booking?.staff_id);

  const isNurseParamedic = booking?.provider_type === 'nurse' || booking?.provider_type === 'paramedic' || !!booking?.staff_id;
  const clinicianName = isNurseParamedic ? (booking?.staff_name || staff?.name || 'Nurse Bushra Bibi') : (doctor?.name || 'Dr. Ayesha Tariq');
  const clinicianRole = isNurseParamedic ? (booking?.staff_role === 'paramedic' ? 'Certified Paramedic (Rescue 1122)' : 'Registered Nurse (PNC)') : (doctor?.specialty || 'General Physician');
  const clinicianPhoto = isNurseParamedic ? (booking?.staff_photo || staff?.photo_url || 'https://images.unsplash.com/photo-1594824813576-905ff9b61d36?auto=format&fit=crop&q=80&w=400') : (doctor?.photo_url || 'https://images.unsplash.com/photo-1594824813689-53606f1577fe?w=150&auto=format&fit=crop&q=80');
  const clinicianShort = isNurseParamedic ? (booking?.staff_role === 'paramedic' ? 'Paramedic' : 'Nurse') : 'Doctor';

  // 6 Stages progression per Part 4 specification
  // 1: Booking Confirmed, 2: Clinician Dispatched, 3: Clinician on the Way, 4: Clinician Arrived, 5: Bedside Care in Progress, 6: Visit Complete
  const [currentStage, setCurrentStage] = useState<number>(3);
  const [etaMinutes, setEtaMinutes] = useState<number>(18);
  const [distanceKm, setDistanceKm] = useState<number>(3.2);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Animated countdown for ETA
  useEffect(() => {
    if (currentStage === 3) {
      const interval = setInterval(() => {
        setEtaMinutes(prev => (prev > 1 ? prev - 1 : 1));
        setDistanceKm(prev => (prev > 0.3 ? Number((prev - 0.2).toFixed(1)) : 0.2));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentStage]);

  const stages = [
    { num: 1, title: 'Booking Confirmed', desc: isNurseParamedic ? 'Matched with certified PNC/EMS provider' : 'Matched with verified PMC physician' },
    { num: 2, title: `${clinicianShort} Dispatched`, desc: 'Equipped with clinical vitals & procedure kit' },
    { num: 3, title: `${clinicianShort} on the Way`, desc: `ETA: ${etaMinutes} mins (${distanceKm} km away)` },
    { num: 4, title: `${clinicianShort} Arrived`, desc: `${clinicianShort} at your doorstep` },
    { num: 5, title: 'Bedside Care in Progress', desc: 'Vitals assessment, procedures & clinical record' },
    { num: 6, title: 'Visit Complete', desc: 'Signed procedure summary & vitals logged' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Header & Simulation Controller for effortless testing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Live GPS Route & Clinical Dispatch
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            Home Medical Visit Tracker
          </h1>
          <p className="text-xs text-gray-500">
            Destination: {booking?.address?.street || 'House 14-B, Sector F'}, {booking?.address?.area || 'DHA Phase 5'}, {booking?.address?.city || 'Lahore'}
          </p>
        </div>

        {/* Demo Stage Advance Buttons */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
          <span className="text-[10px] font-bold text-gray-500 px-1">Demo Stage:</span>
          {[1, 2, 3, 4, 5, 6].map(s => (
            <button
              key={s}
              onClick={() => setCurrentStage(s)}
              className={`w-6 h-6 rounded-md font-bold text-xs cursor-pointer transition-colors ${
                currentStage === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Map View (Full-Width with Doctor pin, patient pin, animated route line) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative h-72 sm:h-96 shadow-md">
        {/* Map Grid Background pattern */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        {/* Map street lines visual */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Simulated major road */}
          <path d="M 50,300 Q 200,240 380,200 T 700,80" fill="none" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
          <path d="M 50,300 Q 200,240 380,200 T 700,80" fill="none" stroke="#475569" strokeWidth="18" strokeLinecap="round" />
          
          {/* Active Navigation Route Line (Animated Emerald) */}
          <path
            d="M 120,240 Q 240,190 380,180 T 640,110"
            fill="none"
            stroke="#10b981"
            strokeWidth="6"
            strokeDasharray="8 8"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>

        {/* Doctor Moving Pin */}
        <div 
          className="absolute z-10 transition-all duration-1000 flex flex-col items-center"
          style={{
            left: currentStage >= 4 ? '68%' : currentStage === 3 ? '42%' : currentStage === 2 ? '22%' : '12%',
            top: currentStage >= 4 ? '26%' : currentStage === 3 ? '48%' : currentStage === 2 ? '62%' : '72%'
          }}
        >
          {/* Pulsing ring */}
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-60"></span>
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <span className="bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mt-1 border border-gray-700 whitespace-nowrap">
            {clinicianName} ({currentStage >= 4 ? 'Arrived' : 'In Transit'})
          </span>
        </div>

        {/* Patient Home Pin */}
        <div className="absolute right-[22%] top-[24%] z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Home className="w-5 h-5" />
          </div>
          <span className="bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mt-1 border border-gray-700 whitespace-nowrap">
            Your Home ({booking?.address?.area || 'DHA Phase 5'})
          </span>
        </div>

        {/* In-Map ETA Floater */}
        {currentStage === 3 && (
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Live Estimated Arrival</p>
              <p className="text-sm font-extrabold text-gray-900">{etaMinutes} mins • {distanceKm} km</p>
            </div>
          </div>
        )}

        {/* Clinician Arrived Alert Overlay */}
        {currentStage === 4 && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-emerald-600 text-white rounded-xl p-3.5 shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold">{clinicianName} has arrived outside your residence!</span>
            </div>
            <span className="text-[11px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded">Please open gate</span>
          </div>
        )}
      </div>

      {/* 6-Stage Status Progression (Part 4 specification) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Visit Status Timeline</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stages.map(st => {
            const isDone = st.num < currentStage;
            const isCurrent = st.num === currentStage;

            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                    : isDone
                    ? 'bg-gray-50 border-gray-200 text-gray-700'
                    : 'bg-white border-gray-100 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400">Stage {st.num}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  ) : null}
                </div>
                <h4 className={`text-xs font-bold ${isCurrent ? 'text-emerald-950' : 'text-gray-800'}`}>{st.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{st.desc}</p>
              </div>
            );
          })}
        </div>

        {/* When Stage 6: Visit Complete -> direct button to view AI-generated report */}
        {currentStage === 6 && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#0F766E]" />
              <div>
                <p className="text-xs font-bold text-teal-950">Bedside Consultation Complete</p>
                <p className="text-[11px] text-teal-800">Your consultation notes and doctor-signed prescription are ready.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/consultation/${booking.id}/report`)}
              className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Consultation Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {statusNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs flex items-center justify-between">
          <span>{statusNotice}</span>
          <button onClick={() => setStatusNotice(null)} className="text-teal-700 font-bold hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Docked Bottom Clinician Card & Quick Controls (Part 4 requirement) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Clinician Info & Vehicle details */}
        <div className="flex items-center space-x-3.5">
          <img
            src={clinicianPhoto}
            alt={clinicianName}
            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-gray-900">{clinicianName}</h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                {isNurseParamedic ? (booking?.staff_role === 'paramedic' ? 'RESCUE 1122' : 'PNC-RN') : 'PMC'}
              </span>
            </div>
            <p className="text-xs text-teal-800 font-medium">{clinicianRole}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Transit Unit: <strong>{isNurseParamedic ? 'CuraLink Rapid Response Bedside Unit' : 'Silver Toyota Corolla (LEA-2024)'}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons: Tap-to-Call, Tap-to-Message */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <a
            href="tel:03001234567"
            className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call {clinicianShort}</span>
          </a>

          <button
            onClick={() => {
              setStatusNotice(`Direct communication open with ${clinicianName}. Dispatch coordinator is on standby.`);
              setTimeout(() => setStatusNotice(null), 4000);
            }}
            className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
