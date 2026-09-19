import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  PhoneCall, 
  Stethoscope, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Building2,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { PARTNER_HOSPITALS, COMMON_DISEASES } from '../../data/patientPortalData';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  actionType?: 'triage' | 'doctor' | 'emergency' | 'hospitals' | 'booking';
  actionData?: any;
}

export const PatientChatbot: React.FC = () => {
  const { navigate, doctors } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: ChatMessage[] = [
    {
      id: 'm_welcome',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! I am CuraBot, your 24/7 patient health assistant. How are you feeling today? You can describe any symptoms, ask about doctors, find hospitals, or learn how home visits work.',
      time: 'Just now'
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const quickPrompts = [
    '🌡️ Check fever & flu symptoms',
    '🩺 Recommend a verified doctor',
    '🚗 How do home visits work?',
    '🏥 Partner hospitals directory',
    '🦟 Dengue warning signs',
    '💳 Consultation fees & JazzCash'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent patient clinical responder
    setTimeout(() => {
      const lower = query.toLowerCase();
      let botResponse: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 1. Critical Red-Flags Emergency
      if (
        lower.includes('chest pain') || 
        lower.includes('heart attack') || 
        lower.includes('cannot breathe') || 
        lower.includes('cant breathe') || 
        lower.includes('unconscious') || 
        lower.includes('heavy bleeding') ||
        lower.includes('stroke')
      ) {
        botResponse.text = '⚠️ Medical Safety Notice: Severe trauma or acute distress requires immediate attention. Please call 1122 or visit the nearest hospital emergency room directly.';
        botResponse.actionType = 'emergency';
      }
      // 2. Fever / Flu / Viral / Dengue / Typhoid
      else if (
        lower.includes('fever') || 
        lower.includes('dengue') || 
        lower.includes('typhoid') || 
        lower.includes('chills') || 
        lower.includes('flu') || 
        lower.includes('cough') ||
        lower.includes('cold')
      ) {
        const verifiedDoctor = (doctors || []).find(d => d.specialty.toLowerCase().includes('general') || d.specialty.toLowerCase().includes('internal')) || doctors[0];
        botResponse.text = `For fever or flu symptoms: Stay hydrated and monitor temperature. Would you like a 60-second AI triage or a consult with ${verifiedDoctor?.name || 'a doctor'}?`;
        botResponse.actionType = 'triage';
        botResponse.actionData = { doctorId: verifiedDoctor?.id || verifiedDoctor?.uid || 'doc_1', doctorName: verifiedDoctor?.name };
      }
      // 3. Child / Pediatric
      else if (lower.includes('child') || lower.includes('baby') || lower.includes('pediatric') || lower.includes('kid') || lower.includes('infant')) {
        const pedsDoc = (doctors || []).find(d => d.specialty.toLowerCase().includes('pediatric')) || doctors[2];
        botResponse.text = `Pediatric care: ${pedsDoc?.name || 'Dr. Maryam Khan'} (Child Specialist) is available for video or home visit.`;
        botResponse.actionType = 'doctor';
        botResponse.actionData = { doctorId: pedsDoc?.id || pedsDoc?.uid || 'doc_3', doctorName: pedsDoc?.name || 'Dr. Maryam Khan' };
      }
      // 4. Skin / Rash / Allergy
      else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itch') || lower.includes('eczema') || lower.includes('allergy')) {
        const dermDoc = (doctors || []).find(d => d.specialty.toLowerCase().includes('dermatol')) || doctors[4];
        botResponse.text = `Skin consultation: ${dermDoc?.name || 'Dr. Farah Nazeer'} (Dermatologist) is available for photo/video consult.`;
        botResponse.actionType = 'doctor';
        botResponse.actionData = { doctorId: dermDoc?.id || dermDoc?.uid || 'doc_5', doctorName: dermDoc?.name || 'Dr. Farah Nazeer' };
      }
      // 5. How home visits work
      else if (lower.includes('home visit') || lower.includes('doorstep') || lower.includes('how do home') || lower.includes('visit work')) {
        botResponse.text = `Home visits: Qualified doctor arrives at your scheduled appointment time with live GPS tracking, performs physical examination, and issues a digital prescription.`;
        botResponse.actionType = 'booking';
      }
      // 6. Hospitals / Partner medical centers
      else if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('emergency') || lower.includes('center')) {
        botResponse.text = `We partner with Shifa International, PIMS (Islamabad), and Rawalpindi Institute of Cardiology (RIC) for tertiary care and diagnostics.`;
        botResponse.actionType = 'hospitals';
      }
      // 7. Fees, JazzCash, Easypaisa
      else if (lower.includes('fee') || lower.includes('cost') || lower.includes('price') || lower.includes('payment') || lower.includes('jazzcash') || lower.includes('easypaisa')) {
        botResponse.text = `Fees: Video consults Rs 1,500–2,000; Home visits Rs 3,000–4,000. Pay with JazzCash, Easypaisa, or Card.`;
        botResponse.actionType = 'booking';
      }
      // 8. General / Fallback
      else {
        botResponse.text = `I can help you find a doctor, run a 60-second symptom triage, or view partner hospitals. How can I help?`;
        botResponse.actionType = 'triage';
      }

      setIsTyping(false);
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const handleReset = () => {
    setMessages(initialMessages);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-teal-100 hover:border-teal-300 transition-all cursor-pointer group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Have a health question? <strong>Ask CuraBot</strong></span>
          </button>

          <button
            id="open-curabot-btn"
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-[#0F766E] text-white shadow-xl hover:bg-[#0B5C56] transition-all flex items-center justify-center cursor-pointer group"
            title="Open CuraBot Health Assistant"
          >
            <Bot className="w-7 h-7 group-hover:scale-110 transition-transform" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div 
          id="curabot-window"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-[#0F766E] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white border border-white/20">
                <Bot className="w-5 h-5 text-teal-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight">CuraBot</h3>
                  <span className="text-[10px] bg-emerald-500 text-white font-semibold px-1.5 py-0.2 rounded-full">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-teal-100">Patient Health & Care Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Restart Chat"
                className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Clinical Disclaimer Strip */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5 text-[11px] text-amber-900 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              AI clinical companion • Outpatient queries
            </span>
            <a
              href="tel:1122"
              className="text-red-700 font-bold hover:underline ml-1 shrink-0"
            >
              1122 ER
            </a>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0F766E] text-white rounded-br-none shadow-xs'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Interactive Action Card inside Bot bubble */}
                  {m.actionType === 'emergency' && (
                    <div className="mt-2.5 pt-2 border-t border-red-200 bg-red-50 p-2.5 rounded-xl text-red-900">
                      <p className="font-bold text-[11px] mb-1.5 flex items-center gap-1 text-red-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Urgent Medical Notice
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <a
                          href="tel:1122"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Call Rescue 1122
                        </a>
                        <button
                          onClick={() => { setIsOpen(false); navigate('/hospitals'); }}
                          className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-[11px] font-bold py-1.5 rounded-lg text-center cursor-pointer"
                        >
                          View Partner Hospitals
                        </button>
                      </div>
                    </div>
                  )}

                  {m.actionType === 'triage' && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => { setIsOpen(false); navigate('/symptom-check'); }}
                        className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Start Guided AI Triage (Free)
                      </button>
                      {m.actionData?.doctorId && (
                        <button
                          onClick={() => { setIsOpen(false); navigate(`/booking/new?doctorId=${m.actionData.doctorId}`); }}
                          className="w-full bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-[11px] font-bold py-1.5 px-3 rounded-lg border border-teal-200 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          Book {m.actionData.doctorName || 'Doctor'}
                        </button>
                      )}
                    </div>
                  )}

                  {m.actionType === 'doctor' && m.actionData?.doctorId && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => { setIsOpen(false); navigate(`/booking/new?doctorId=${m.actionData.doctorId}`); }}
                        className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book Appointment ({m.actionData.doctorName})
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); navigate('/doctors'); }}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-semibold py-1.5 px-3 rounded-lg border border-gray-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Browse All Verified Doctors
                      </button>
                    </div>
                  )}

                  {m.actionType === 'hospitals' && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          const el = document.getElementById('partner-hospitals');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                          else navigate('/');
                        }}
                        className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        View Hospitals & Emergency Numbers
                      </button>
                    </div>
                  )}

                  {m.actionType === 'booking' && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <button
                        onClick={() => { setIsOpen(false); navigate('/doctors'); }}
                        className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        Find Doctors for Home Visit or Video
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3.5 py-2.5 w-20 shadow-xs">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-[10px] bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about symptoms, doctors, or care..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 bg-[#0F766E] hover:bg-[#0B5C56] disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
