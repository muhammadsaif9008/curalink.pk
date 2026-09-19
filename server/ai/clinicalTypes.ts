/**
 * CuraLink AI Clinical Scribe - Type Definitions
 * Schema & Prompt Version 2.2.0
 * Aligned with Pakistan Medical Commission (PMC) & WHO Clinical Documentation Standards
 *
 * Directives:
 * - Document what is known. Clearly identify what is unknown.
 * - Never turn a symptom into a diagnosis.
 * - Separate transcript facts from AI suggestions.
 * - Do not add unspoken medical advice to doctor's plan.
 * - Source attribution on clinical items.
 */

export type SourceAttribution =
  | 'patient_statement'
  | 'doctor_statement'
  | 'provided_patient_data'
  | 'provided_vital'
  | 'not_documented'
  | 'ai_generated';

export interface AttributedField<T = string> {
  text: T;
  source: SourceAttribution;
  requires_clinician_review?: boolean;
}

export interface ClinicalVitals {
  bp: string;
  pulse: number | string | null;
  temp: string;
  spo2: number | string | null;
  respiratory_rate?: string | null;
  weight?: string | null;
}

export interface PrescribedMedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  source?: SourceAttribution;
}

export interface DocumentedClinicalInfo {
  chief_complaint: AttributedField;
  duration?: AttributedField;
  location?: AttributedField;
  severity?: AttributedField;
  associated_symptoms?: AttributedField;
  denied_symptoms?: AttributedField;
  history_of_illness: AttributedField;
  patient_reported_medications: AttributedField;
  allergies: AttributedField;
  vitals: {
    bp: AttributedField;
    pulse: AttributedField;
    temp: AttributedField;
    spo2: AttributedField;
    respiratory_rate: AttributedField;
    weight: AttributedField;
  };
  physical_examination: AttributedField;
}

export interface DoctorAssessmentSection {
  doctor_stated_diagnosis: AttributedField;
  doctor_stated_assessment: AttributedField;
  icd10_code: AttributedField;
}

export interface DoctorPlanSection {
  treatment_plan: AttributedField;
  prescribed_medications: PrescribedMedicationItem[];
  stated_advice: AttributedField;
  explicit_red_flags: AttributedField;
  follow_up_instructions: AttributedField;
}

export interface AISafetyItem {
  text: string;
  source: 'ai_generated';
  requires_clinician_review: true;
}

export interface AISafetySuggestionsSection {
  safety_considerations: AISafetyItem[];
  suggested_actions?: AISafetyItem[];
  unmentioned_elements: string[];
}

export interface ClinicalReportData {
  // Legacy / Direct access fields (kept for full backwards compatibility)
  diagnosis: string; // "Not documented" if doctor did not state
  chief_complaint: string;
  patient_name?: string;
  patient_age?: number | string;
  patient_gender?: string;
  duration_days?: number | string;
  problem_duration_days?: string;
  past_medical_history?: string;
  duration?: string;
  location?: string;
  severity?: string;
  associated_symptoms?: string;
  denied_symptoms?: string;
  history_of_illness: string;
  patient_reported_medications?: string;
  allergies?: string;
  vitals: ClinicalVitals;
  examination_findings: string;
  transcription_summary: string;
  consultation_transcript?: string;
  doctor_stated_diagnosis?: string;
  doctor_stated_assessment?: string;
  icd10_code?: string;
  doctor_stated_treatment_plan?: string;
  advice: string; // Doctor-stated advice only, or "Not documented"
  doctor_stated_advice?: string;
  red_flags: string; // Explicitly mentioned red flags only, or "Not documented"
  doctor_stated_red_flags?: string;
  follow_up: string; // Doctor-stated follow-up only, or "Not documented"
  doctor_stated_follow_up?: string;
  follow_up_timeframe?: string;
  follow_up_date?: string;
  follow_up_instructions?: string;
  medications: PrescribedMedicationItem[];
  prescribed_medications?: PrescribedMedicationItem[];

  // AI-generated safety considerations and non-pharmacological suggestions
  ai_safety_considerations?: string[];
  ai_suggested_actions?: string[];
  unmentioned_elements?: string[];

  // Structured sections with source attributions
  documented_info?: DocumentedClinicalInfo;
  doctor_assessment?: DoctorAssessmentSection;
  doctor_plan?: DoctorPlanSection;
  ai_suggestions?: AISafetySuggestionsSection;

  // Report status and clinical draft labels
  report_status: 'draft' | 'reviewed' | 'signed';
  status_label: string; // "AI-GENERATED CLINICAL NOTE — DRAFT" or "Clinician Reviewed & Approved"

  // Grounding metadata
  grounding_notes?: {
    unmentioned_elements: string[];
    is_provisional_diagnosis: boolean;
    confidence_level?: 'high' | 'moderate' | 'low';
  };
  prompt_version?: string;
  schema_version?: string;
}

export interface ClinicalScribeRequest {
  transcript: string;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
  chiefComplaint?: string;
  durationDays?: string | number;
  allergies?: string;
  pastMedicalHistory?: string;
  doctorName?: string;
  visitType?: string;
  existingVitals?: Partial<ClinicalVitals>;
  doctorSpecialty?: string;
}

export interface FewShotExample {
  id: string;
  title: string;
  transcript: string;
  report: Partial<ClinicalReportData>;
}
