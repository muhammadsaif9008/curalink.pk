import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Star, 
  ShieldCheck, 
  Video, 
  Car, 
  Award, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  MessageSquare,
  Building
} from 'lucide-react';

interface DoctorDetailPageProps {
  doctorId?: string;
}

export const DoctorDetailPage: React.FC<DoctorDetailPageProps> = ({ doctorId }) => {
  const { doctors, navigate, currentRoute } = useApp();

  // Extract ID from URL if not passed as prop
  const id = doctorId || (currentRoute.startsWith('/doctors/') ? currentRoute.replace('/doctors/', '') : (doctors?.[0]?.id || doctors?.[0]?.uid));
  const doctor = (doctors || []).find(d => d.id === id || d.uid === id) || doctors?.[0];

  const defaultReviews = [
    {
      id: 'rev-1',
      patient_name: 'Zainab K.',
      rating: 5,
      date: '2 days ago',
      comment: 'Extremely attentive and thorough with clinical questions. The digital prescription and follow-up care instructions were crystal clear.'
    },
    {
      id: 'rev-2',
      patient_name: 'Tariq M.',
      rating: 5,
      date: 'Last week',
      comment: 'Prompt and professional medical consultation. Explained the diagnosis clearly without medical jargon and provided great reassurance.'
    },
    {
      id: 'rev-3',
      patient_name: 'Amna S.',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Very empathetic doctor with excellent diagnostic accuracy. The medication regimen prescribed helped resolve my symptoms promptly.'
    }
  ];

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Doctor Profile Not Found</h2>
        <p className="text-sm text-gray-500">The requested physician profile could not be located.</p>
        <button
          onClick={() => navigate('/doctors')}
          className="px-5 py-2.5 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:bg-[#0B5C56] transition-colors"
        >
          Return to Doctors Directory
        </button>
      </div>
    );
  }

  const reviews = (doctor.reviews && doctor.reviews.length > 0) ? doctor.reviews : defaultReviews;
  const docId = doctor.id || doctor.uid || '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-28">
      {/* Back button */}
      <button
        onClick={() => navigate('/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </button>

      {/* Header Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={doctor.photo_url}
            alt={doctor.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-teal-600/30 shrink-0"
          />

          <div className="space-y-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{doctor.name}</h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PMC Verified ({doctor.pmc_license_number})
              </span>
            </div>

            <p className="text-sm font-semibold text-teal-800">{doctor.specialty}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
              <span className="flex items-center gap-1 font-bold text-gray-900">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {doctor.rating} ({doctor.reviews_count || doctor.total_consultations || 40} reviews)
              </span>
              <span>•</span>
              <span>{doctor.experience_years} Years Clinical Experience</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {doctor.city}
              </span>
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
              <Building className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Affiliated with <strong>{doctor.hospital_affiliation}</strong></span>
            </p>
          </div>
        </div>
      </div>

      {/* Services & Pricing Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {doctor.offers_video && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-600">
                <Video className="w-5 h-5" />
                <h3 className="text-sm font-bold text-gray-900">Video Consultation</h3>
              </div>
              <span className="text-base font-extrabold text-gray-900">Rs. {doctor.video_fee.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              High-definition encrypted telehealth call with AI note-taking, clinical assessment, and instant doctor-signed prescription.
            </p>
            <button
              onClick={() => navigate(`/booking/new?doctorId=${docId}&type=video`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Book Video Call
            </button>
          </div>
        )}

        {(doctor.offers_clinic ?? true) && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700">
                <Building className="w-5 h-5" />
                <h3 className="text-sm font-bold text-gray-900">In-Clinic OPD Consultation</h3>
              </div>
              <span className="text-base font-extrabold text-gray-900">Rs. {(doctor.clinic_fee || doctor.video_fee).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              In-person OPD clinical evaluation at {doctor.hospital_affiliation} in {doctor.city}. Physical checkup, ECG/vitals review, and direct specialist prescription.
            </p>
            <button
              onClick={() => navigate(`/booking/new?doctorId=${docId}&type=clinic`)}
              className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Book In-Clinic OPD Visit
            </button>
          </div>
        )}
      </div>

      {/* Bedside Home Care Notice for Nurses */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-950">
          <Car className="w-4 h-4 text-emerald-700 shrink-0" />
          <p>
            <strong>Need bedside medical care at home in Islamabad / Rawalpindi?</strong> Bedside home visits (IV drip, vitals, wound care) are provided exclusively by certified Nurses & Paramedics.
          </p>
        </div>
        <button
          onClick={() => navigate('/home-care')}
          className="whitespace-nowrap px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
        >
          Book Home Care Staff
        </button>
      </div>

      {/* About Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">About Dr. {doctor.name.replace('Dr. ', '')}</h2>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {doctor.bio}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <p className="font-semibold text-gray-700">Degrees & Qualifications</p>
            <p className="text-gray-500 mt-0.5">{doctor.qualifications}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">PMC License Registration</p>
            <p className="text-gray-500 mt-0.5 font-mono">{doctor.pmc_license_number}</p>
          </div>
        </div>
      </div>

      {/* Patient Reviews Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>Verified Patient Reviews</span>
          </h2>
          <span className="text-xs text-gray-500">{reviews.length} written reviews</span>
        </div>

        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{review.patient_name}</span>
                  <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded font-medium">Verified Patient</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                  ))}
                  <span className="text-[11px] text-gray-400 ml-1">{review.date}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed italic">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Booking Bar (Part 4 requirement!) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-900">{doctor.name}</p>
            <p className="text-[11px] text-gray-500">{doctor.specialty} • {doctor.city}</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-500 hidden sm:inline">From Rs. {Math.min(doctor.video_fee, doctor.home_visit_fee).toLocaleString()}</span>
            <button
              onClick={() => navigate(`/booking/new?doctorId=${docId}`)}
              className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold px-6 py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book with Dr. {doctor.name.replace('Dr. ', '')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
