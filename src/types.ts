export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  cnic?: string; // Stored securely
  onboarding_completed: boolean;
  created_at: string;
}

export interface PatientProfile {
  uid: string;
  name?: string;
  phone?: string;
  email?: string;
  cnic?: string;
  blood_group?: string;
  dob: string;
  gender: 'male' | 'female' | 'other' | '';
  city: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    area: string;
    city: string;
    is_default?: boolean;
  }>;
  has_completed_first_symptom_check: boolean;
  onboarding_step?: number;
  known_conditions?: string[];
  allergies?: string[];
  current_medications?: string[];
  past_surgeries?: string[];
}

export type DoctorVerificationStatus = 'pending' | 'approved' | 'rejected';

export interface DoctorReview {
  id: string;
  patient_name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface DoctorProfile {
  id?: string;
  uid: string;
  name: string;
  photo_url: string;
  pmc_license_number: string;
  verification_status: DoctorVerificationStatus;
  specialty: string;
  qualifications: string;
  experience_years: number;
  hospital_affiliation: string;
  bio: string;
  city: string;
  offers_video: boolean;
  offers_clinic?: boolean;
  clinic_fee?: number; // PKR
  clinic_address?: string;
  offers_home_visit: boolean;
  home_visit_radius_km: number;
  video_fee: number; // PKR
  home_visit_fee: number; // PKR
  rating: number;
  reviews_count: number;
  is_available?: boolean;
  total_consultations?: number;
  reviews?: DoctorReview[];
  availability: {
    [day: string]: {
      enabled: boolean;
      slots: string[];
    };
  };
  onboarding_step?: number;
  diseases_treated?: string[];
  symptoms_handled?: string[];
  affiliated_hospital_ids?: string[];
}

export type ConsultationMode = 'video' | 'clinic' | 'home_visit';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  patient_uid?: string;
  patient_id?: string;
  patient_name?: string;
  patient_age?: number | string;
  patient_gender?: string;
  doctor_uid?: string;
  doctor_id?: string;
  doctor_name?: string;
  doctor_photo?: string;
  doctor_specialty?: string;
  provider_type?: 'doctor' | 'nurse' | 'paramedic';
  staff_id?: string;
  staff_name?: string;
  staff_role?: StaffRole;
  staff_title?: string;
  staff_photo?: string;
  services_requested?: string[];
  mode?: ConsultationMode;
  type?: ConsultationMode;
  scheduled_date?: string;
  scheduled_time?: string;
  date?: string;
  time_slot?: string;
  status: BookingStatus;
  fee?: number;
  platform_fee?: number;
  total_amount?: number;
  clinic_name?: string;
  clinic_address?: string;
  address?: {
    street: string;
    area: string;
    city: string;
    landmarks?: string;
    lat?: number;
    lng?: number;
  };
  notes?: string;
  reason?: string;
  payment_method?: PaymentMethod | string;
  payment_status?: PaymentStatus | string;
  symptom_check_id?: string;
  created_at: string;
  eta_minutes?: number;
  driver_status?: 'on_the_way' | 'arrived' | 'in_progress' | 'completed';
}

export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'paid';

export interface Payment {
  id: string;
  booking_id: string;
  patient_uid: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_id: string;
  created_at: string;
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ConsultationReport {
  id: string;
  booking_id: string;
  patient_uid?: string;
  patient_id?: string;
  patient_name?: string;
  doctor_uid?: string;
  doctor_id?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  doctor_pmc?: string;
  date: string;
  mode?: ConsultationMode;
  visit_type?: ConsultationMode;
  chief_complaint?: string;
  patient_age?: number | string;
  patient_gender?: string;
  problem_duration_days?: string;
  medical_history?: string;
  allergies?: string;
  symptoms_discussed?: string[];
  assessment_diagnosis?: string;
  diagnosis?: string;
  transcription_summary?: string;
  transcript?: string;
  history_of_illness?: string;
  examination_findings?: string;
  red_flags?: string;
  follow_up?: string;
  follow_up_timeframe?: string;
  follow_up_date?: string;
  follow_up_instructions?: string;
  pmc_verification_stamp?: string;
  medications: PrescribedMedication[];
  prescribed_medications?: PrescribedMedication[];
  doctor_notes?: string;
  advice?: string;
  follow_up_recommendation?: string;
  doctor_signed?: boolean;
  is_signed?: boolean;
  doctor_signature?: string;
  status?: 'draft' | 'signed';
  vitals?: any;
  signed_at?: string;
  created_at?: string;
}

export type StaffRole = 'nurse' | 'paramedic';

export interface NurseParamedicProfile {
  id: string;
  uid: string;
  name: string;
  role: StaffRole;
  title: string; // e.g. "Licensed Registered Nurse (PNC-RN)", "Emergency Medical Technician (EMT-P)"
  license_number: string;
  photo_url: string;
  experience_years: number;
  rating: number;
  reviews_count: number;
  city: string;
  home_visit_fee: number; // In PKR, economical for patients and fair for staff
  services_offered: string[];
  bio: string;
  is_available: boolean;
}

export interface MedicalHistoryItem {
  id: string;
  patient_uid: string;
  type: 'visit_report' | 'uploaded_doc' | 'triage';
  date: string;
  source: string; // doctor uid or "self-uploaded"
  source_name: string;
  title: string;
  symptoms?: string[];
  diagnosis?: string;
  medications?: PrescribedMedication[];
  notes?: string;
  attached_file_url?: string;
  lab_values?: { [testName: string]: string };
}

export type MedicalNoteCategory = 
  | 'clinical_observation' 
  | 'follow_up' 
  | 'symptom_journal' 
  | 'medication' 
  | 'lifestyle_diet' 
  | 'allergy_warning' 
  | 'medical_leave'
  | 'general';

export type MedicalNotePriority = 'routine' | 'important' | 'urgent';

export interface MedicalNoteVitals {
  bp?: string; // e.g. "120/80"
  pulse?: number; // e.g. 76
  temp_f?: number; // e.g. 98.6
  sugar_mg_dl?: number; // e.g. 105
  spo2?: number; // e.g. 98
}

export interface MedicalLeaveDetails {
  start_date: string; // e.g. "2026-09-08"
  end_date: string; // e.g. "2026-09-10"
  total_days: number; // e.g. 3
  reason: string; // Clinical diagnosis / condition warranting leave
  patient_cnic: string; // Verified CNIC of patient
  employer_institution?: string; // e.g. "Systems Ltd / HR"
  duty_resumption_date?: string; // e.g. "2026-09-11"
  certificate_number?: string; // e.g. "MLC-2026-09-1048"
  monthly_quota_index?: number; // 1 or 2
}

export interface MedicalNote {
  id: string;
  patient_uid: string;
  patient_name?: string;
  patient_cnic?: string;
  author_uid: string;
  author_name: string;
  author_role: 'doctor' | 'patient';
  author_pmc?: string; // PMC registration if authored by doctor
  title: string;
  category: MedicalNoteCategory;
  content: string; // Clinical observations or patient notes
  priority: MedicalNotePriority;
  vitals?: MedicalNoteVitals;
  leave_details?: MedicalLeaveDetails;
  tags?: string[];
  is_pinned?: boolean;
  booking_id?: string;
  created_at: string;
  updated_at?: string;
}

export type MedicalNoteRequestType = 
  | 'medical_leave' 
  | 'clinical_summary' 
  | 'fitness_certificate' 
  | 'prescription_refill' 
  | 'follow_up' 
  | 'general';

export interface MedicalNoteRequest {
  id: string;
  patient_uid: string;
  patient_name: string;
  patient_cnic?: string;
  patient_phone?: string;
  doctor_uid: string;
  doctor_name: string;
  doctor_specialty?: string;
  note_type: MedicalNoteRequestType;
  reason: string;
  urgency: 'routine' | 'urgent';
  leave_start_date?: string;
  leave_end_date?: string;
  leave_days?: number;
  employer_institution?: string;
  status: 'pending' | 'approved' | 'rejected';
  doctor_remarks?: string;
  issued_note_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface SymptomCheckResult {
  id: string;
  patient_id?: string;
  patient_uid?: string;
  date: string;
  primary_symptom: string;
  duration: string;
  severity: number;
  associated_symptoms: string[];
  urgency_level: 'emergency' | 'see_doctor_soon' | 'routine' | 'self_care';
  summary: string;
  recommended_action: 'video' | 'home_visit' | 'self_care' | 'emergency';
  warning_signs?: string[];
}

export interface SymptomCheckSession {
  id: string;
  patient_uid: string;
  created_at: string;
  chief_symptom: string;
  answers: {
    question: string;
    answer: string | number;
  }[];
  severity: number;
  duration: string;
  associated_symptoms: string[];
  ai_recommendation: 'self_care' | 'video' | 'home_visit' | 'emergency';
  recommendation_reason: string;
  red_flag_triggered: boolean;
  red_flag_reason?: string;
}

export interface NotificationItem {
  id: string;
  user_uid: string;
  type: 'appointment' | 'tracker' | 'report' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  related_url?: string;
}
