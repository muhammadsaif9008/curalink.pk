import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Video, 
  Car, 
  MapPin, 
  ArrowRight, 
  Share2, 
  ShieldCheck, 
  FileText,
  Home
} from 'lucide-react';

interface BookingConfirmationProps {
  bookingId?: string;
}

export const BookingConfirmationPage: React.FC<BookingConfirmationProps> = ({ bookingId }) => {
  const { bookings, doctors, nursesParamedics, navigate, currentRoute } = useApp();

  const routeStr = currentRoute || '';
  const id = bookingId || (routeStr.includes('/booking/') ? (routeStr.split('/booking/')[1] || '').replace('/confirmation', '') : (bookings && bookings[0]?.id));
  const booking = (bookings || []).find(b => b.id === id) || (bookings && bookings[0]);
  const doctor = (doctors || []).find(d => d.id === booking?.doctor_id || d.uid === booking?.doctor_id) || (doctors && doctors[0]);
  const staff = (nursesParamedics || []).find(s => s.id === booking?.staff_id);

  const isNurseParamedic = booking?.provider_type === 'nurse' || booking?.provider_type === 'paramedic' || !!booking?.staff_id;
  const clinicianName = isNurseParamedic ? (booking?.staff_name || staff?.name || 'Nurse Bushra Bibi') : (doctor?.name || 'Dr. Ayesha Tariq');
  const clinicianTitle = isNurseParamedic ? (booking?.staff_title || staff?.title || 'Certified PNC Registered Nurse') : (doctor?.specialty || 'General Physician');
  const clinicianSub = isNurseParamedic ? (staff?.city || 'Lahore') : (doctor?.hospital_affiliation || 'Services Hospital, Lahore');
  const clinicianPhoto = isNurseParamedic ? (booking?.staff_photo || staff?.photo_url || 'https://images.unsplash.com/photo-1594824813576-905ff9b61d36?auto=format&fit=crop&q=80&w=400') : (doctor?.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80');

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`CuraLink Consultation with ${clinicianName}`);
    const details = encodeURIComponent(`Consultation via CuraLink (${booking?.type === 'video' ? 'Video Telehealth' : 'Home Bedside Visit'}). Booking Ref: ${booking?.id || 'Ref'}`);
    const location = encodeURIComponent(booking?.type === 'home_visit' ? `${booking?.address?.street || 'Patient Address'}, ${booking?.address?.city || 'Lahore'}` : 'CuraLink Video Telehealth Portal');
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Big Green Check Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-xs animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Payment Confirmed • {isNurseParamedic ? 'Verified PNC / EMS Dispatch' : 'Verified PMC Booking'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Booking Confirmed!
          </h1>
          <p className="text-xs text-gray-500 font-mono pt-1">
            Reference ID: <strong>{booking?.id ? `CL-2026-${booking.id.slice(-4).toUpperCase()}` : 'CL-2026-8921'}</strong>
          </p>
        </div>

        {/* Details Card */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-left space-y-3 text-xs">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
            <img
              src={clinicianPhoto}
              alt={clinicianName}
              className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-gray-900 text-sm">{clinicianName}</p>
                {isNurseParamedic ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                    {booking?.staff_role === 'paramedic' ? 'RESCUE 1122' : 'PNC-RN'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                    PMC
                  </span>
                )}
              </div>
              <p className="text-teal-800 font-medium">{clinicianTitle}</p>
              <p className="text-gray-500 text-[11px]">{clinicianSub}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="text-gray-500 block text-[11px]">Appointment Date:</span>
              <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                {booking?.date || 'Tomorrow'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Scheduled Slot:</span>
              <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                {booking?.time_slot || '04:30 PM'}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-gray-500">Care Format:</span>
            <span className="font-bold text-gray-900 capitalize flex items-center gap-1">
              {booking?.type === 'video' ? (
                <>
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  Video Telehealth Call
                </>
              ) : (
                <>
                  <Car className="w-3.5 h-3.5 text-emerald-600" />
                  Home Bedside Visit {isNurseParamedic ? '(Nurse / Paramedic)' : '(Doctor)'}
                </>
              )}
            </span>
          </div>

          {booking?.services_requested && booking.services_requested.length > 0 && (
            <div className="border-t border-gray-200 pt-2 text-[11px] text-gray-600">
              <span className="font-semibold text-gray-800">Bedside Procedures: </span>
              <span>{booking.services_requested.join(', ')}</span>
            </div>
          )}

          {booking?.type === 'home_visit' && (
            <div className="border-t border-gray-200 pt-2 text-[11px] text-gray-600">
              <span className="font-semibold text-gray-800">Visit Destination: </span>
              <span>{booking?.address?.street || 'House 14-B, Sector F'}, {booking?.address?.area || 'DHA Phase 5'}, {booking?.address?.city || 'Lahore'}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-xs">
            <span className="text-gray-500">Payment Status:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Paid Rs. {booking?.fee?.toLocaleString() || '1,650'} via {booking?.payment_method?.toUpperCase() || 'JAZZCASH'}
            </span>
          </div>
        </div>

        {/* Preparation Guide Box */}
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-left text-xs text-teal-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-teal-950">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            What happens next:
          </p>
          {booking?.type === 'video' ? (
            <p className="text-teal-800 leading-relaxed">
              Dr. {doctor.name.replace('Dr. ', '')} has received your consultation notification. Please ensure your camera and microphone are connected 5 minutes prior to start time. Your video room is ready now!
            </p>
          ) : isNurseParamedic ? (
            <p className="text-teal-800 leading-relaxed">
              {clinicianName} has received your doorstep address and dispatched route. They will arrive with a sterilized medical kit, vitals equipment, and requested procedure supplies. You can track their transit live on our GPS map.
            </p>
          ) : (
            <p className="text-teal-800 leading-relaxed">
              The doctor has received your address and GPS pin. Please ensure someone is available at home to welcome the physician. You can track their transit live on our GPS map.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {booking?.type === 'video' ? (
            <button
              onClick={() => navigate(`/consultation/${booking.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Enter Video Consultation Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/visit/${booking.id}`)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Car className="w-4 h-4" />
              <span>Open Live Doorstep Arrival Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleAddToCalendar}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>Add to Google Calendar</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/patient')}
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Go to Patient Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
