import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  Sparkles, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Send,
  MessageSquare,
  ClipboardList,
  CheckCheck,
  User,
  Stethoscope,
  X,
  Maximize2,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Camera,
  Activity,
  AlertCircle,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { EmergencyButton } from '../../components/shared/EmergencyButton';

interface VideoConsultationProps {
  bookingId?: string;
}

interface ChatMessage {
  id: string;
  senderRole: 'patient' | 'doctor';
  senderName: string;
  text: string;
  timestamp: string;
}

export const VideoConsultationPage: React.FC<VideoConsultationProps> = ({ bookingId }) => {
  const { bookings, doctors, currentUser, patientProfile, navigate, currentRoute } = useApp();

  const routeStr = currentRoute || '';
  const rawId = bookingId || (routeStr.includes('/consultation/') ? routeStr.split('/consultation/')[1]?.replace('/report', '') : (bookings && bookings[0]?.id));
  const cleanId = rawId ? rawId.replace('/video', '').replace('/report', '') : (bookings && bookings[0]?.id);

  const booking = (bookings || []).find(b => b.id === cleanId) || (bookings && bookings[0]);
  const doctor = (doctors || []).find(d => (d.id === booking?.doctor_id || d.uid === booking?.doctor_id)) || (doctors && doctors[0]);

  const patientDisplayName = patientProfile?.name || currentUser?.name || 'Zainab Ahmed';
  const patientFirstName = (patientDisplayName || 'Zainab').split(' ')[0] || 'Zainab';

  const doctorDisplayName = doctor?.name || 'Dr. Ayesha Tariq';
  const doctorLastName = (doctorDisplayName.split(' ')[1] || doctorDisplayName.replace('Dr. ', '')) || 'Doctor';

  // Role perspective: Default to currentUser's role or 'patient'
  const isUserDoctor = currentUser?.role === 'doctor';
  const [activePerspective, setActivePerspective] = useState<'patient' | 'doctor'>(isUserDoctor ? 'doctor' : 'patient');

  // Video & Audio Hardware MediaStream State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaPermissionState, setMediaPermissionState] = useState<'requesting' | 'granted' | 'denied' | 'fallback'>('requesting');
  const [mediaErrorMsg, setMediaErrorMsg] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Video Layout & UI Controls
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'records'>('chat');
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [mainView, setMainView] = useState<'doctor' | 'patient'>('doctor');
  const [patientWaitingForVerification, setPatientWaitingForVerification] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      senderRole: 'doctor',
      senderName: doctorDisplayName,
      text: `Assalam-o-Alaikum ${patientFirstName}, I have your symptom triage report open on my screen. Can you hear and see me clearly?`,
      timestamp: '08:02'
    },
    {
      id: 'msg_2',
      senderRole: 'patient',
      senderName: patientDisplayName,
      text: 'Walaikum Assalam Doctor. Yes, audio and video are crystal clear!',
      timestamp: '08:04'
    },
    {
      id: 'msg_3',
      senderRole: 'doctor',
      senderName: doctorDisplayName,
      text: 'Great. You can also send test reports, temperature readings, or questions here in the chat anytime during our call.',
      timestamp: '08:06'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'patient' | 'doctor'>(activePerspective);
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer counting up
  const [seconds, setSeconds] = useState(495); // ~8:15 in
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Setup Real Hardware Camera & Microphone
  const requestMediaAccess = async () => {
    setMediaPermissionState('requesting');
    setMediaErrorMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone APIs are not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setMediaStream(stream);
      setMediaPermissionState('granted');

      // Bind to video ref
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Audio Analyzer for live microphone feedback
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const trackVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
              setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
            }
            animFrameRef.current = requestAnimationFrame(trackVolume);
          };
          trackVolume();
        }
      } catch (audioErr) {
        console.warn('AudioContext visualization initialization note:', audioErr);
      }
    } catch (err: any) {
      console.warn('Camera/Mic access note:', err);
      setMediaErrorMsg(err.message || 'Camera or microphone access was dismissed or unavailable.');
      setMediaPermissionState('fallback');
    }
  };

  useEffect(() => {
    requestMediaAccess();

    return () => {
      // Clean up media stream and audio context on exit
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Update video element when stream is granted and ref attaches
  useEffect(() => {
    if (localVideoRef.current && mediaStream && mediaPermissionState === 'granted') {
      localVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, mediaPermissionState, cameraOn, mainView]);

  // Mic Toggle Handler
  const handleToggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = next;
      });
    }
  };

  // Camera Toggle Handler
  const handleToggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = next;
      });
    }
  };

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat' && sidePanelOpen) {
      scrollToBottom();
      setUnreadChatCount(0);
    }
  }, [messages, activeTab, sidePanelOpen]);

  // Live AI transcription stream
  const [transcripts] = useState([
    { speaker: doctorLastName, text: "Assalam-o-Alaikum, I'm reviewing your triage report. You've had a headache and low fever since yesterday, correct?", time: '07:12' },
    { speaker: 'Patient', text: "Walaikum Assalam Doctor. Yes, around 100.2 degrees, with some nasal congestion and fatigue.", time: '07:34' },
    { speaker: doctorLastName, text: "Any neck stiffness, breathing difficulty, or visual blurring?", time: '07:50' },
    { speaker: 'Patient', text: "No, thankfully nothing like that.", time: '08:02' },
    { speaker: doctorLastName, text: "Good. I see you have a mild allergy to penicillin. I will formulate your prescription accordingly.", time: '08:15' }
  ]);
  const [doctorNotes, setDoctorNotes] = useState('Patient alert, oriented. Pharynx mildly hyperemic. Chest clear bilaterally. Prescribed Paracetamol 500mg TDS x 3 days.');

  // Handle Sending a Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const currentTimeStr = formatTimer(seconds);
    const currentSenderName = senderRole === 'patient' ? patientDisplayName : doctorDisplayName;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderRole,
      senderName: currentSenderName,
      text: textToSend,
      timestamp: currentTimeStr
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (!sidePanelOpen || activeTab !== 'chat') {
      setUnreadChatCount(prev => prev + 1);
    }

    if (senderRole === 'patient') {
      setIsDoctorTyping(true);
      setTimeout(() => {
        setIsDoctorTyping(false);
        const lower = textToSend.toLowerCase();
        let replyText = `Understood, ${patientFirstName}. I have documented that in your chart.`;

        if (lower.includes('temp') || lower.includes('fever') || lower.includes('degree') || lower.includes('100') || lower.includes('101')) {
          replyText = `Thank you for sharing your temperature reading. That is consistent with a low-grade viral response. Keep hydrated with ORS.`;
        } else if (lower.includes('medicine') || lower.includes('panadol') || lower.includes('dose') || lower.includes('paracetamol')) {
          replyText = `Yes, you can take Paracetamol 500mg after meals every 8 hours if fever persists above 100°F. I will include this in the signed prescription.`;
        } else if (lower.includes('rash') || lower.includes('skin') || lower.includes('photo')) {
          replyText = `Received. The lesion appears localized; avoid applying steroid ointments until our prescription is finalized.`;
        } else if (lower.includes('thank') || lower.includes('ok') || lower.includes('shukriya')) {
          replyText = `You are very welcome. Let us continue with the physical examination.`;
        }

        const autoReply: ChatMessage = {
          id: `msg_doc_${Date.now()}`,
          senderRole: 'doctor',
          senderName: doctorDisplayName,
          text: replyText,
          timestamp: formatTimer(seconds + 2)
        };

        setMessages(m => [...m, autoReply]);
        if (!sidePanelOpen || activeTab !== 'chat') {
          setUnreadChatCount(c => c + 1);
        }
      }, 1200);
    }
  };

  const toggleChatPanel = () => {
    if (!sidePanelOpen) {
      setSidePanelOpen(true);
      setActiveTab('chat');
    } else if (activeTab === 'chat') {
      setSidePanelOpen(false);
    } else {
      setActiveTab('chat');
    }
  };

  const handleConfirmEndCall = () => {
    setShowEndCallModal(false);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    // If doctor ends call, direct to doctor's AI scribe or prescription report
    if (activePerspective === 'doctor') {
      navigate('/doctor/scribe');
    } else {
      // Patient ends consultation: they must wait for the doctor to verify the report
      setPatientWaitingForVerification(true);
    }
  };

  if (patientWaitingForVerification) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Consultation Ended • Awaiting Doctor Verification</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Waiting for Doctor to Verify & Sign Report
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              Your consultation session with <strong>{doctor.name}</strong> ({doctor.specialty}) has ended. The doctor is currently reviewing the encounter notes and synthesizing the verified prescription.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>PMC Clinical Verification Protocol</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              In compliance with healthcare regulations, reports are not released directly to patients until formally verified and signed by the licensed attending physician. You will be notified in your patient portal once {doctor.name} authorizes your report.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
              <span>Session Duration: {formatTimer(seconds)}</span>
              <span>Doctor PMC License: {doctor.pmc_license_number || 'PMC-48291-P'}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              id="btn-return-patient-portal"
              onClick={() => navigate('/dashboard/patient')}
              className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Return to Patient Portal
            </button>
            <button
              id="btn-view-records-history"
              onClick={() => navigate('/dashboard/patient/history')}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              View Verified Records
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 w-full flex-1 flex flex-col justify-center">
      <div className="bg-slate-950 rounded-2xl shadow-xl overflow-hidden border border-slate-800 flex flex-col h-[560px] sm:h-[620px] max-h-[82vh] relative text-white select-none">
        {/* Top Bar: Doctor info, Live timer, panel toggles */}
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
              {doctor.name.slice(4, 6)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                <span>{doctor.name}</span>
                <span className="text-[10px] bg-teal-900/80 text-teal-300 px-1.5 py-0.2 rounded font-mono shrink-0">PMC Verified</span>
              </p>
              <p className="text-[10px] text-slate-400 truncate">{doctor.specialty} • Telehealth Consultation</p>
            </div>
          </div>

          {/* Live Call Duration Timer & Real Camera Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-mono font-bold text-slate-200">{formatTimer(seconds)}</span>
            </div>

            {/* Perspective Switcher only visible for doctors */}
            {currentUser?.role === 'doctor' && (
              <div className="hidden sm:inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => {
                    setActivePerspective('patient');
                    setSenderRole('patient');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    activePerspective === 'patient' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patient View
                </button>
                <button
                  onClick={() => {
                    setActivePerspective('doctor');
                    setSenderRole('doctor');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    activePerspective === 'doctor' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Doctor View
                </button>
              </div>
            )}
          </div>

          {/* Action Toggles: Chat & Clinical Records */}
          <div className="flex items-center space-x-2">
            {/* Real Audio / Camera Hardware Status Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-medium text-slate-300">
              <span className={`w-2 h-2 rounded-full ${mediaPermissionState === 'granted' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
              <span className="text-[10px] font-mono">
                {mediaPermissionState === 'granted' ? 'Hardware HD Feed' : 'Simulated Feed'}
              </span>
            </div>

            {/* AI Clinical Notes Status - Only visible to doctors */}
            {currentUser?.role === 'doctor' && (
              <button
                onClick={() => navigate('/doctor/scribe')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 px-2.5 py-1 rounded-full text-xs font-medium text-teal-300 shadow-xs cursor-pointer"
                title="Open CuraLink AI Scribe"
              >
                <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
                <span className="hidden lg:inline">CuraLink AI Scribe</span>
              </button>
            )}

            {/* Chat Toggle Button in Header */}
            <button
              id="header-chat-toggle-btn"
              onClick={toggleChatPanel}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                sidePanelOpen && activeTab === 'chat'
                  ? 'bg-teal-700 text-white border-teal-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
              {unreadChatCount > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Records Toggle Button */}
            <button
              id="header-records-toggle-btn"
              onClick={() => {
                if (!sidePanelOpen) {
                  setSidePanelOpen(true);
                  setActiveTab('records');
                } else if (activeTab === 'records') {
                  setSidePanelOpen(false);
                } else {
                  setActiveTab('records');
                }
              }}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer border ${
                sidePanelOpen && activeTab === 'records'
                  ? 'bg-teal-700 text-white border-teal-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{currentUser?.role === 'doctor' ? 'Clinical' : 'Doctor Details'}</span>
            </button>

            {/* In-Call Emergency Button: Immediate 1122 / Hospital dispatch override */}
            <EmergencyButton 
              callerRole={currentUser?.role === 'doctor' ? 'doctor' : 'patient'} 
              patientName={patientDisplayName} 
            />
          </div>
        </div>

        {/* Main Video Area & Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Video Window */}
        <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            
            {/* When main view is Doctor: Render Doctor Stream */}
            {mainView === 'doctor' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200"
                  alt="Doctor Stream"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Ambient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none"></div>

                {/* Doctor Verification & Location HUD */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-slate-100">{doctor.name}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                    PMC Lic #49102
                  </span>
                </div>

                {/* Audio Waves from Doctor */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[11px] text-slate-300 font-medium">Doctor Audio: Active</span>
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-1 h-2 bg-teal-400 rounded animate-pulse"></span>
                    <span className="w-1 h-3 bg-teal-400 rounded animate-pulse [animation-delay:0.2s]"></span>
                    <span className="w-1 h-1.5 bg-teal-400 rounded animate-pulse [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            ) : (
              /* When main view is Patient: Local Camera Feed takes large stage */
              <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                {cameraOn ? (
                  mediaPermissionState === 'granted' ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200"
                      alt="Patient Video"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-2">
                    <VideoOff className="w-10 h-10 text-slate-500" />
                    <p className="font-bold">Patient Camera Off</p>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span className="font-bold text-slate-100">{patientDisplayName} (Patient Feed)</span>
                </div>
              </div>
            )}

            {/* Picture-in-Picture Self View (Corner Feed) */}
            <div className="absolute bottom-20 right-4 sm:bottom-6 sm:right-6 w-32 h-44 sm:w-48 sm:h-64 rounded-2xl overflow-hidden border-2 border-teal-500/70 shadow-2xl bg-slate-850 z-10 transition-all group">
              {mainView === 'doctor' ? (
                /* Corner shows Patient Camera */
                cameraOn ? (
                  mediaPermissionState === 'granted' ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
                      alt="Patient Self View"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-900">
                    <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                    <span>Camera Off</span>
                  </div>
                )
              ) : (
                /* Corner shows Doctor Feed */
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400"
                  alt="Doctor Corner View"
                  className="w-full h-full object-cover"
                />
              )}

              {/* View Swap Control */}
              <button
                onClick={() => setMainView(mainView === 'doctor' ? 'patient' : 'doctor')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Swap Video Streams"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Tag in Corner Window */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] bg-black/80 backdrop-blur-xs px-2 py-1 rounded-lg text-white font-medium border border-white/10">
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${micOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                  <span className="truncate">{mainView === 'doctor' ? 'You (Patient)' : 'Doctor'}</span>
                </div>
                {micOn && (
                  <span className="text-[9px] text-teal-300 font-mono">
                    {micLevel > 15 ? 'Speaking' : 'Mic ON'}
                  </span>
                )}
              </div>
            </div>

            {/* Hardware Media Fallback / Permission Notice Banner if needed */}
            {mediaPermissionState === 'fallback' && (
              <div className="absolute top-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 max-w-xs text-xs space-y-2 shadow-xl animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Live Simulated Video Active</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {mediaErrorMsg || 'Browser hardware camera/mic permission not detected.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={requestMediaAccess}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Request Hardware Cam & Mic</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible In-Call Side Panel (Chat & Clinical Records) */}
        {sidePanelOpen && (
          <div className="w-80 sm:w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-2xl h-full">
            {/* Panel Header with Navigation Tabs */}
            <div className="p-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg">
                <button
                  id="tab-chat-btn"
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'chat'
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>In-Call Chat</span>
                  {unreadChatCount > 0 && activeTab !== 'chat' && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadChatCount}
                    </span>
                  )}
                </button>

                <button
                  id="tab-records-btn"
                  onClick={() => setActiveTab('records')}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'records'
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Clinical Records</span>
                </button>
              </div>

              <button
                id="close-side-panel-btn"
                onClick={() => setSidePanelOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                title="Hide panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* TAB 1: REAL-TIME IN-CALL CHAT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col h-[calc(100%-55px)] overflow-hidden">
                {/* Active Chat Participant Header Info */}
                <div className="bg-slate-850 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-slate-300 font-medium">Real-Time Doctor & Patient Chat</span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono">Encrypted Telehealth</span>
                </div>

                {/* Chat Conversation History Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                  {messages.map((msg) => {
                    const isPatient = msg.senderRole === 'patient';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender name label */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                          {isPatient ? (
                            <>
                              <span className="font-semibold text-teal-300">{msg.senderName}</span>
                              <span className="text-slate-500">({msg.timestamp})</span>
                            </>
                          ) : (
                            <>
                              <Stethoscope className="w-3 h-3 text-emerald-400" />
                              <span className="font-semibold text-emerald-300">{msg.senderName}</span>
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 rounded">Doctor</span>
                              <span className="text-slate-500">({msg.timestamp})</span>
                            </>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                            isPatient
                              ? 'bg-teal-700 text-white rounded-tr-xs'
                              : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                          <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                            isPatient ? 'text-teal-200' : 'text-slate-400'
                          }`}>
                            <CheckCheck className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Doctor typing indicator */}
                  {isDoctorTyping && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-full w-fit border border-slate-700">
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">{doctor.name} is typing</span>
                      <span className="flex space-x-0.5">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={senderRole === 'patient' ? "Type a message to Dr. Ayesha..." : "Type clinical advice to patient..."}
                    className="flex-1 bg-slate-850 border border-slate-700 text-xs rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: CLINICAL RECORDS & AI TRANSCRIPT */}
            {activeTab === 'records' && (
              <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Triage Overview Card */}
                <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400">Pre-Consultation Triage</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded border border-rose-800">
                      Penicillin Allergy
                    </span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Complaint:</strong> {booking?.reason || 'Fever 101.4°F, sore throat and fatigue for 2 days.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                    <div className="bg-slate-900 p-2 rounded">
                      <span>Reported Temp:</span>
                      <p className="font-bold text-rose-400 mt-0.5">101.4°F</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <span>Duration:</span>
                      <p className="font-bold text-slate-200 mt-0.5">48 Hours</p>
                    </div>
                  </div>
                </div>

                {/* Clinical Notes vs Patient Information according to Role */}
                {currentUser?.role === 'doctor' ? (
                  <>
                    {/* Live AI Speech Transcription Feed */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          Live AI Transcription
                        </span>
                        <span className="text-[10px] text-emerald-400 animate-pulse">● Ambient Recording</span>
                      </div>

                      <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        {transcripts.map((t, idx) => (
                          <div key={idx} className="space-y-0.5">
                            <span className="text-teal-400 font-bold">{t.speaker}</span> <span className="text-slate-500 text-[10px]">({t.time})</span>:
                            <p className="text-slate-300">{t.text}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => navigate('/doctor/scribe')}
                        className="w-full bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open AI Consultation Report Builder</span>
                      </button>
                    </div>

                    {/* Doctor scratchpad */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Physician Scratchpad</label>
                      <textarea
                        rows={3}
                        value={doctorNotes}
                        onChange={e => setDoctorNotes(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg bg-slate-850 border border-slate-700 text-slate-200 focus:outline-none focus:border-teal-500"
                        placeholder="Clinical thoughts, drug dosages, notes..."
                      ></textarea>
                      <p className="text-[10px] text-slate-500">Recorded for doctor review and verification.</p>
                    </div>
                  </>
                ) : (
                  /* Patient View: Clear summary, doctor license, prescription notice (no AI generator) */
                  <div className="space-y-4 pt-1">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-slate-200">Doctor Verification & License</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Consulting with <strong>{doctor.name}</strong> ({doctor.specialty}). Licensed by Pakistan Medical Commission (PMC #49102).
                      </p>
                    </div>

                    <div className="bg-teal-950/40 p-3 rounded-xl border border-teal-900/60 space-y-2">
                      <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        Prescription & Care Plan
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Your official digital prescription, diagnosis, and post-consultation advice will be issued by {doctor.name} following this call and will be accessible immediately in your Health Records.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Bar: Mic, Camera, Chat Toggle Button, End Consultation */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-center space-x-4 z-30">
        {/* Real Mic Toggle */}
        <div className="relative">
          <button
            id="mic-toggle-btn"
            onClick={handleToggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              micOn ? 'bg-slate-800 hover:bg-slate-700 text-white ring-2 ring-emerald-500/30' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
          </button>
          {micOn && (
            <span
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 bg-emerald-400 rounded-full transition-all duration-75"
              style={{ width: `${Math.max(6, (micLevel / 100) * 28)}px` }}
            />
          )}
        </div>

        {/* Real Camera Toggle */}
        <button
          id="camera-toggle-btn"
          onClick={handleToggleCamera}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
            cameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {cameraOn ? <VideoIcon className="w-5 h-5 text-teal-400" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* In-Call Real-Time Chat Toggle Button */}
        <button
          id="bottom-chat-toggle-btn"
          onClick={toggleChatPanel}
          className={`h-11 px-4 rounded-full flex items-center space-x-2 transition-all cursor-pointer font-semibold text-xs border ${
            sidePanelOpen && activeTab === 'chat'
              ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Toggle In-Call Chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </div>
          <span>In-Call Chat</span>
          {unreadChatCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Red End Call button */}
        <button
          id="end-call-btn"
          onClick={() => setShowEndCallModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-full flex items-center space-x-2 transition-all shadow-md cursor-pointer active:scale-95"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Consultation</span>
        </button>
      </div>

      {/* End Call Confirmation Dialog */}
      {showEndCallModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 text-center text-white">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-500 flex items-center justify-center mx-auto">
              <PhoneOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">End Consultation Call?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {activePerspective === 'patient'
                  ? `Ending this call will conclude your session with ${doctor.name}. Your clinical report will be submitted to the doctor to verify and sign before you can view it.`
                  : 'Ending this call will automatically compile the consultation transcript and open CuraLink AI Scribe to verify and sign the report.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                id="confirm-end-call-btn"
                onClick={handleConfirmEndCall}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {activePerspective === 'patient' ? 'Yes, End Consultation' : 'Yes, End Call & Open CuraLink Scribe'}
              </button>
              <button
                id="cancel-end-call-btn"
                onClick={() => setShowEndCallModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg transition-colors cursor-pointer"
              >
                Return to Call
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
