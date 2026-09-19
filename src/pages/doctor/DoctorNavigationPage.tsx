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
  PhoneCall,
  Mic,
  ArrowLeft,
  User,
  Sparkles,
  Edit3
} from 'lucide-react';

interface DoctorNavigationProps {
  bookingId?: string;
}

export const DoctorNavigationPage: React.FC<DoctorNavigationProps> = ({ bookingId }) => {
  const { bookings, doctors, navigate, currentRoute, patientProfile, currentUser } = useApp();

  const routeStr = currentRoute || '';
  const id = bookingId || (routeStr.includes('/visit/') ? (routeStr.split('/visit/')[1] || '') : (bookings && (bookings[1]?.id || bookings[0]?.id)));
  const booking = (bookings || []).find(b => b.id === id) || (bookings && (bookings[1] || bookings[0]));

  const patientName = booking?.patient_name || patientProfile?.name || 'Zainab Ahmed';
  const patientPhone = '+92 300 1234567';
  const destinationAddress = `${booking?.address?.street || 'House 14-B, Sector F'}, ${booking?.address?.area || 'DHA Phase 5'}, ${booking?.address?.city || 'Lahore'}`;
  const landmarkNotes = booking?.address?.landmarks || 'Opposite Sector F Jamia Mosque, Green Gate (Code #5482)';

  // 6 Stages progression - aligned with simple tracker:
  // 1: Dispatched from Clinic, 2: En Route to Patient, 3: Security Gate Clearance, 4: Arrived at Doorstep, 5: Bedside Consultation & Scribe, 6: Visit Complete
  const [currentStage, setCurrentStage] = useState<number>(2);
  const [etaMinutes, setEtaMinutes] = useState<number>(14);
  const [distanceKm, setDistanceKm] = useState<number>(2.8);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Animated countdown for ETA when in transit
  useEffect(() => {
    if (currentStage === 2) {
      const interval = setInterval(() => {
        setEtaMinutes(prev => (prev > 1 ? prev - 1 : 1));
        setDistanceKm(prev => (prev > 0.3 ? Number((prev - 0.2).toFixed(1)) : 0.2));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentStage]);

  const stages = [
    { num: 1, title: 'Dispatched from Clinic', desc: 'Kit packed with vitals & cold-chain samples' },
    { num: 2, title: 'En Route to Patient', desc: `ETA: ${etaMinutes} mins (${distanceKm} km away)` },
    { num: 3, title: 'Colony Gate Clearance', desc: 'DHA Sector F Guard Post • Code #5482' },
    { num: 4, title: 'Arrived at Doorstep', desc: 'Parked outside patient residence' },
    { num: 5, title: 'Bedside & CuraLink AI Scribe', desc: 'In-person checkup with dual-voice recording' },
    { num: 6, title: 'Visit Complete', desc: 'Prescription signed and transmitted' }
  ];

  const handleNotifyPatientArrival = () => {
    setStatusNotice('Automated arrival SMS & notification sent to patient: "Dr. Ayesha has arrived outside your home."');
    setCurrentStage(4);
    setTimeout(() => setStatusNotice(null), 6000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Top Header & Simulation Controller for effortless testing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/doctor')}
              className="text-gray-500 hover:text-gray-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Doctor Live GPS Route
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Doctor Home Visit Navigation
          </h1>
          <p className="text-xs text-gray-500">
            Destination: {destinationAddress}
          </p>
        </div>

        {/* Demo Stage Advance Buttons (Same simple 1-6 selector as patient) */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
          <span className="text-[10px] font-bold text-gray-500 px-1">Stage:</span>
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

      {/* Simulated Map View (Clean, identical layout to patient view with doctor-specific tags) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden relative h-72 sm:h-96 shadow-md">
        {/* Map Grid Background pattern */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        {/* Map street lines visual */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Major road */}
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

        {/* Doctor Moving Pin (Doctor's Vehicle) */}
        <div 
          className="absolute z-10 transition-all duration-1000 flex flex-col items-center"
          style={{
            left: currentStage >= 4 ? '68%' : currentStage === 3 ? '52%' : currentStage === 2 ? '38%' : '14%',
            top: currentStage >= 4 ? '26%' : currentStage === 3 ? '40%' : currentStage === 2 ? '50%' : '70%'
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
            Your Vehicle (In Transit)
          </span>
        </div>

        {/* Patient Home Destination Pin */}
        <div className="absolute right-[22%] top-[24%] z-10 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Home className="w-5 h-5" />
          </div>
          <span className="bg-gray-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md mt-1 border border-gray-700 whitespace-nowrap">
            Patient: {patientName}
          </span>
        </div>

        {/* In-Map ETA & Turn Indicator (Clean top-left floater) */}
        {currentStage <= 3 && (
          <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Live Estimated Arrival</p>
              <p className="text-sm font-extrabold text-gray-900">{etaMinutes} mins • {distanceKm} km</p>
              <p className="text-[10px] text-teal-700 font-semibold">Take Ghazi Road Flyover</p>
            </div>
          </div>
        )}

        {/* Gate Clearance Alert Overlay */}
        {currentStage === 3 && (
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3 shadow-xl border border-teal-500/50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <div>
                <span className="text-xs font-bold">DHA Colony Guard Clearance</span>
                <p className="text-[11px] text-slate-300">Show PMC ID or state Resident Code: <strong>#5482</strong></p>
              </div>
            </div>
            <button
              onClick={() => setCurrentStage(4)}
              className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Passed Gate
            </button>
          </div>
        )}

        {/* Doctor Arrived Overlay */}
        {currentStage === 4 && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-emerald-600 text-white rounded-xl p-3.5 shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold">You have arrived at the patient's residence!</span>
            </div>
            <button
              onClick={() => setCurrentStage(5)}
              className="text-[11px] bg-white text-emerald-900 font-bold px-3 py-1 rounded-lg cursor-pointer hover:bg-emerald-50"
            >
              Enter Bedside
            </button>
          </div>
        )}

        {/* Stage 5: In Bedside Consultation Overlay */}
        {currentStage === 5 && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-teal-800 text-white rounded-xl p-3 shadow-xl flex items-center justify-between border border-teal-400/40">
            <div className="flex items-center space-x-2.5">
              <Stethoscope className="w-5 h-5 text-teal-300" />
              <div>
                <span className="text-xs font-bold">Bedside Consultation Active</span>
                <p className="text-[10px] text-teal-100">CuraLink AI Scribe ready for dual-voice recording.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/doctor/scribe')}
              className="text-[11px] bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Launch CuraLink Scribe</span>
            </button>
          </div>
        )}
      </div>

      {/* 6-Stage Status Progression (Clean 6-grid identical to patient design) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Visit Status Timeline</h3>
          <span className="text-xs text-gray-500">Click any stage above to update</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stages.map(st => {
            const isDone = st.num < currentStage;
            const isCurrent = st.num === currentStage;

            return (
              <div
                key={st.num}
                onClick={() => setCurrentStage(st.num)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs'
                    : isDone
                    ? 'bg-gray-50 border-gray-200 text-gray-700'
                    : 'bg-white border-gray-100 opacity-40 hover:opacity-70'
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

        {/* When Stage 5: In-Person Consultation -> Action to open Scribe */}
        {currentStage === 5 && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Mic className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-950">Record Bedside Consultation Dialogue</p>
                <p className="text-[11px] text-teal-800">CuraLink AI Scribe will record both doctor and patient with dual-voice capture and formulate the prescription.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/doctor/scribe')}
              className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Open CuraLink Scribe</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}

        {/* When Stage 6: Visit Complete -> direct button to view AI-generated report */}
        {currentStage === 6 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-emerald-700" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Bedside Consultation Complete</p>
                <p className="text-[11px] text-emerald-800">Clinical notes and official PMC signed prescription have been recorded.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/consultation/${booking?.id || 'bk_102'}/report`)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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

      {/* Docked Bottom Patient Card & Quick Controls (Matching patient card layout) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Patient Profile info */}
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-bold text-teal-800 text-base shrink-0">
            {patientName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900">{patientName}</h3>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                Penicillin Allergy
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.2 rounded font-medium">
                P1 Febrile
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Complaint: {booking?.reason || 'Fever 101.4°F, sore throat & fatigue for 2 days.'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Landmark: {landmarkNotes}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Quick Call Button */}
          <a
            href={`tel:${patientPhone}`}
            className="flex-1 md:flex-initial bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Call Patient"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span className="md:hidden">Call</span>
          </a>

          {/* Quick Arrival Alert */}
          {currentStage < 4 ? (
            <button
              onClick={handleNotifyPatientArrival}
              className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Arrived</span>
            </button>
          ) : (
            <button
              onClick={() => navigate('/doctor/scribe')}
              className="flex-1 md:flex-initial bg-[#0F766E] hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>CuraLink AI Scribe</span>
            </button>
          )}

          {/* Pre-consultation Rx report link */}
          <button
            onClick={() => navigate(`/consultation/${booking?.id || 'bk_102'}/report`)}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 p-2.5 rounded-xl text-xs font-medium flex items-center justify-center transition-colors cursor-pointer"
            title="Open Medical Report"
          >
            <Edit3 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
