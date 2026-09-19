import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Car, 
  Video, 
  FileText, 
  PhoneCall, 
  CreditCard, 
  CheckCircle2, 
  Star, 
  ArrowLeft, 
  ArrowRight,
  Stethoscope,
  HeartPulse,
  Sparkles,
  MapPin,
  Clock,
  Building2,
  Users
} from 'lucide-react';
import { WHY_CURALINK_BENEFITS, PATIENT_TESTIMONIALS } from '../../data/patientPortalData';

export const WhyCuraLinkPage: React.FC = () => {
  const { navigate } = useApp();

  const comparisonPoints = [
    {
      feature: 'Doctor Credentials',
      curalink: '100% PMC-verified physicians with license lookup',
      traditional: 'Often unknown or unverified junior dispensers'
    },
    {
      feature: 'Wait Time & Queues',
      curalink: 'Zero waiting room exposure. Scheduled home doctor visits or instant video',
      traditional: '2–4 hours in crowded waiting rooms with sick patients'
    },
    {
      feature: 'Medical Records',
      curalink: 'Permanent digital EHR linked to patient CNIC with signed e-prescriptions',
      traditional: 'Lost paper slips; zero continuity across hospital visits'
    },
    {
      feature: 'Home Visit Care',
      curalink: 'Doctor arrives with clinical vitals kit, stethoscope, & live GPS tracker',
      traditional: 'Rarely available or exorbitantly priced private calls'
    },
    {
      feature: 'Payment Options',
      curalink: 'Fixed transparent PKR pricing via JazzCash, Easypaisa, or Card',
      traditional: 'Cash only with hidden surcharges'
    },
    {
      feature: 'Hospital Continuity',
      curalink: 'Direct coordination with partner tertiary hospitals and digital record sharing',
      traditional: 'Patients left stranded without medical history or transfer notes'
    }
  ];

  return (
    <div className="bg-[#FBFBFB] min-h-screen text-gray-900 pb-20">
      {/* 1. Hero Header */}
      <section className="bg-gradient-to-b from-teal-50/60 via-white to-white border-b border-gray-200 pt-8 pb-14 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-5 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Why CuraLink</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-teal-800 text-xs font-bold border border-teal-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Built for Pakistani Families • Accredited Clinical Protocol</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Care that comes to you, and remembers you
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            In Pakistan, families lose hours in congested clinic waiting rooms, carry plastic folders of misplaced paper prescriptions, and struggle to reach qualified doctors during acute illness. CuraLink replaces this friction with verified, dignified medicine.
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/doctors')}
              className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Explore Verified Doctors</span>
            </button>
            <button
              onClick={() => navigate('/symptom-check')}
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Free AI Symptom Triage</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars of Quality */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Our Pillars of Patient Care
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
            Engineered from the ground up to solve healthcare access, safety, and record continuity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CURALINK_BENEFITS.map((b, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs hover:border-teal-500 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    {b.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{b.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{b.description}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                <span>Verified Standard</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CuraLink vs Traditional Model Comparison */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            CuraLink vs Traditional Clinic Visits
          </h2>
          <p className="text-xs text-gray-500">
            Why thousands of patients across Lahore, Karachi, and Islamabad trust our platform.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <th className="p-4 font-bold text-gray-900 w-1/4">Healthcare Aspect</th>
                  <th className="p-4 font-bold text-[#0F766E] bg-teal-50/50 w-2/5">CuraLink Experience</th>
                  <th className="p-4 font-bold text-gray-500 w-1/3">Traditional Clinics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparisonPoints.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{row.feature}</td>
                    <td className="p-4 text-teal-950 font-medium bg-teal-50/30">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.curalink}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">{row.traditional}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Real Patient Stories */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Stories From Patients</h2>
            <p className="text-xs text-gray-500">Verified reviews after video consultations and home visits.</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span>4.9 / 5.0 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PATIENT_TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={t.avatar} alt={t.patientName} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{t.patientName}</p>
                      <p className="text-[10px] text-gray-500">{t.area}, {t.city}</p>
                    </div>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{t.review}"</p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                <span className="font-semibold text-teal-800">{t.visitType}</span>
                <span>{t.doctorName}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-14">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-[#0F766E] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Ready for reliable medical care?</h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Book a verified physician now or check your symptoms in seconds. No waiting queues, zero hassle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/booking/new')}
              className="bg-white hover:bg-teal-50 text-[#0F766E] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Book Home or Video Visit
            </button>
            <button
              onClick={() => navigate('/signup/doctor')}
              className="bg-teal-800/80 hover:bg-teal-800 text-white border border-teal-500/50 font-bold text-xs px-4 py-3 rounded-xl transition-all cursor-pointer"
            >
              Are you a Doctor? Join Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
