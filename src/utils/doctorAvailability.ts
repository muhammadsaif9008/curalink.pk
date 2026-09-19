import { DoctorProfile, Booking } from '../types';

export interface DoctorSlotInfo {
  date: Date;
  dateIso: string;
  dayName: string;
  slotStr: string;
  slotDate: Date;
  isToday: boolean;
  isTomorrow: boolean;
}

export interface DoctorAvailabilityResult {
  hasAvailableSlot24h: boolean;
  earliestSlot: DoctorSlotInfo | null;
  slotsWithin24h: DoctorSlotInfo[];
  allUpcomingSlots: DoctorSlotInfo[];
  nextSlotDisplay: string;
}

export function parseSlotTimeToDate(baseDate: Date, slotStr: string): Date | null {
  const clean = slotStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function getDoctorAvailability(
  doctor: DoctorProfile,
  bookings: Booking[] = [],
  now: Date = new Date()
): DoctorAvailabilityResult {
  if (!doctor.availability) {
    return {
      hasAvailableSlot24h: false,
      earliestSlot: null,
      slotsWithin24h: [],
      allUpcomingSlots: [],
      nextSlotDisplay: 'Schedule by appointment'
    };
  }

  const limit24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const doctorId = doctor.uid || doctor.id || '';

  const candidateSlots: DoctorSlotInfo[] = [];

  // Check the next 7 days for general upcoming slots, prioritizing next 24 hours
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const candidateDate = new Date(now);
    candidateDate.setDate(now.getDate() + dayOffset);
    const dateIso = candidateDate.toISOString().split('T')[0];
    const dayName = candidateDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayConfig = doctor.availability[dayName];

    if (dayConfig && dayConfig.enabled && Array.isArray(dayConfig.slots)) {
      for (const slotStr of dayConfig.slots) {
        const slotDate = parseSlotTimeToDate(candidateDate, slotStr);
        if (!slotDate) continue;

        // Slot must be strictly in the future
        if (slotDate.getTime() <= now.getTime()) {
          continue;
        }

        // Check if slot is already booked
        const isBooked = bookings.some(b => {
          const isDoc = (b.doctor_id === doctorId || b.doctor_uid === doctorId || (doctor.id && b.doctor_id === doctor.id));
          const isDate = (b.scheduled_date === dateIso || b.date === dateIso);
          const isTime = (b.scheduled_time === slotStr || b.time_slot === slotStr);
          const isActive = b.status !== 'cancelled';
          return isDoc && isDate && isTime && isActive;
        });

        if (!isBooked) {
          const isToday = dayOffset === 0;
          const isTomorrow = dayOffset === 1;
          candidateSlots.push({
            date: candidateDate,
            dateIso,
            dayName,
            slotStr,
            slotDate,
            isToday,
            isTomorrow
          });
        }
      }
    }
  }

  // Sort candidate slots chronologically
  candidateSlots.sort((a, b) => a.slotDate.getTime() - b.slotDate.getTime());

  // Filter slots strictly within the 24-hour window
  const slotsWithin24h = candidateSlots.filter(s => s.slotDate.getTime() <= limit24h.getTime());

  const earliestSlot = candidateSlots[0] || null;
  let nextSlotDisplay = 'No open slots this week';

  if (earliestSlot) {
    if (earliestSlot.isToday) {
      nextSlotDisplay = `Today at ${earliestSlot.slotStr}`;
    } else if (earliestSlot.isTomorrow) {
      nextSlotDisplay = `Tomorrow at ${earliestSlot.slotStr}`;
    } else {
      nextSlotDisplay = `${earliestSlot.dayName} at ${earliestSlot.slotStr}`;
    }
  }

  return {
    hasAvailableSlot24h: slotsWithin24h.length > 0,
    earliestSlot: slotsWithin24h[0] || earliestSlot,
    slotsWithin24h,
    allUpcomingSlots: candidateSlots,
    nextSlotDisplay
  };
}
