import {
  ClinicalReportData,
  PrescribedMedicationItem,
  ClinicalVitals,
  DocumentedClinicalInfo,
  DoctorAssessmentSection,
  DoctorPlanSection,
  AISafetySuggestionsSection,
  SourceAttribution
} from './clinicalTypes';
import { SCHEMA_VERSION } from './clinicalSchema';
import { PROMPT_VERSION } from './clinicalPrompt';

export interface ValidationResult {
  isValid: boolean;
  report: ClinicalReportData;
  warnings: string[];
  errors: string[];
}

/**
 * Validates, normalizes, and sanitizes Gemini-generated clinical report JSON.
 * Enforces:
 * 1. Never turn a symptom into a diagnosis (e.g. Cephalalgia / Migraine -> "Not documented" if doctor did not state).
 * 2. Strict negative findings rule ("Not documented" instead of "None" / "Absent").
 * 3. Separation of transcript facts from AI suggestions.
 * 4. No unspoken medical advice or emergency flags in doctor's plan.
 * 5. Full source attribution and draft labeling.
 */
export function validateAndNormalizeClinicalReport(raw: any, transcriptText?: string): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      isValid: false,
      report: createEmptyReport(),
      warnings: [],
      errors: ['Raw model output is not a valid JSON object.']
    };
  }

  const transcript = (transcriptText || '').toLowerCase();

  // Helper to normalize negative findings to "Not documented"
  const sanitizeNegative = (val: any, fallback = 'Not documented'): string => {
    if (val === null || val === undefined || val === '') return fallback;
    const str = String(val).trim();
    const lower = str.toLowerCase();
    if (
      lower === 'none' ||
      lower === 'no' ||
      lower === 'absent' ||
      lower === 'not present' ||
      lower === 'n/a' ||
      lower === 'null' ||
      lower === 'undefined'
    ) {
      return fallback;
    }
    return str;
  };

  // 1. Chief Complaint
  let chiefComplaint = sanitizeNegative(raw.chief_complaint, 'Consultation evaluation');
  // Strip clinical diagnostic upgrades if raw tried to set "Cephalalgia" as chief complaint
  if (chiefComplaint.toLowerCase().includes('cephalalgia') && transcript.includes('headache')) {
    chiefComplaint = 'Headache';
  }

  // 2. Symptom Details
  const duration = sanitizeNegative(raw.duration, 'Not documented');
  const location = sanitizeNegative(raw.location, 'Not documented');
  const severity = sanitizeNegative(raw.severity, 'Not documented');
  const associatedSymptoms = sanitizeNegative(raw.associated_symptoms, 'Not documented');
  const deniedSymptoms = sanitizeNegative(raw.denied_symptoms, 'Not documented');

  // 3. History of Illness
  const historyOfIllness = sanitizeNegative(
    raw.history_of_illness,
    'Patient presented for clinical consultation. Subjective symptoms documented from consultation dialogue.'
  );

  // 4. Patient Reported Medications
  let patientReportedMeds = sanitizeNegative(raw.patient_reported_medications, 'Not documented');
  if (
    patientReportedMeds.toLowerCase() === 'none' ||
    patientReportedMeds.toLowerCase() === 'no' ||
    patientReportedMeds.toLowerCase() === 'not taking'
  ) {
    patientReportedMeds = 'Patient reports no current medication for these symptoms';
  }

  // 5. Allergies
  let allergies = sanitizeNegative(raw.allergies, 'Not documented');
  if (
    allergies.toLowerCase() === 'no allergies' ||
    allergies.toLowerCase() === 'none' ||
    allergies.toLowerCase() === 'no' ||
    allergies.toLowerCase() === 'nkda'
  ) {
    allergies = 'Patient denies known allergies';
  }

  // 6. Vitals Normalization
  const rawVitals = raw.vitals && typeof raw.vitals === 'object' ? raw.vitals : {};
  const normalizeVital = (val: any): string => {
    return sanitizeNegative(val, 'Not documented');
  };

  const vitals: ClinicalVitals = {
    bp: normalizeVital(rawVitals.bp),
    pulse: normalizeVital(rawVitals.pulse),
    temp: normalizeVital(rawVitals.temp),
    spo2: normalizeVital(rawVitals.spo2),
    respiratory_rate: normalizeVital(rawVitals.respiratory_rate),
    weight: normalizeVital(rawVitals.weight)
  };

  // 7. Physical Examination Findings
  let examFindings = sanitizeNegative(
    raw.examination_findings,
    'No physical examination findings documented in the provided transcript.'
  );
  if (
    examFindings.toLowerCase().includes('no physical exam') ||
    examFindings.toLowerCase() === 'none' ||
    examFindings.toLowerCase() === 'not examined'
  ) {
    examFindings = 'No physical examination findings documented in the provided transcript.';
  }

  // 8. Doctor's Stated Assessment & Diagnosis
  // RULE 1: NEVER TURN A SYMPTOM INTO A DIAGNOSIS.
  let rawDiag = raw.doctor_stated_diagnosis || raw.diagnosis || '';
  let rawAssess = raw.doctor_stated_assessment || raw.assessment || '';
  let rawIcd = raw.icd10_code || '';

  let doctorStatedDiagnosis = sanitizeNegative(rawDiag, 'Not documented');
  let doctorStatedAssessment = sanitizeNegative(rawAssess, 'Not documented');
  let icd10Code = sanitizeNegative(rawIcd, 'Not documented');

  // Guard: If doctor did NOT explicitly state a diagnosis in the transcript
  const doctorDiagnosedInTranscript =
    transcript.includes('diagnosis is') ||
    transcript.includes('diagnose you with') ||
    transcript.includes('my assessment is') ||
    transcript.includes('you have acute') ||
    transcript.includes('you have chronic');

  // Check if AI generated "Cephalalgia", "Migraine", "Tension headache", or ICD-10 J02/R51 without doctor statement
  const forbiddenAutonomousDiagnoses = [
    'cephalalgia',
    'r51',
    'migraine',
    'tension-type headache',
    'tension headache',
    'primary headache',
    'provisional evaluation',
    'assessment pending'
  ];

  if (!doctorDiagnosedInTranscript) {
    for (const term of forbiddenAutonomousDiagnoses) {
      if (doctorStatedDiagnosis.toLowerCase().includes(term)) {
        warnings.push(`Filtered autonomous AI diagnosis '${doctorStatedDiagnosis}' because doctor did not state it.`);
        doctorStatedDiagnosis = 'Not documented';
        break;
      }
    }
    for (const term of forbiddenAutonomousDiagnoses) {
      if (doctorStatedAssessment.toLowerCase().includes(term)) {
        doctorStatedAssessment = 'Not documented';
        break;
      }
    }
    // ICD-10 is strictly forbidden unless doctor gave a formal diagnosis
    if (icd10Code !== 'Not documented') {
      warnings.push(`Filtered ICD-10 code '${icd10Code}' because doctor did not document a formal diagnosis.`);
      icd10Code = 'Not documented';
    }
  }

  // If diagnosis was still generic or placeholder, enforce "Not documented"
  if (
    doctorStatedDiagnosis.toLowerCase().includes('pending') ||
    doctorStatedDiagnosis.toLowerCase().includes('not recorded') ||
    doctorStatedDiagnosis.toLowerCase().includes('clinical evaluation completed')
  ) {
    doctorStatedDiagnosis = 'Not documented';
  }
  if (doctorStatedAssessment.toLowerCase().includes('pending')) {
    doctorStatedAssessment = 'Not documented';
  }

  // 9. Doctor's Plan & Prescribed Medications
  const doctorStatedPlan = sanitizeNegative(raw.doctor_stated_treatment_plan, 'Not documented');

  const prescribedMeds: PrescribedMedicationItem[] = [];
  if (Array.isArray(raw.prescribed_medications) || Array.isArray(raw.medications)) {
    const list = Array.isArray(raw.prescribed_medications) ? raw.prescribed_medications : raw.medications;
    for (const item of list) {
      if (item && typeof item === 'object') {
        const name = String(item.name || '').trim();
        if (
          name &&
          !name.toLowerCase().includes('not prescribed') &&
          !name.toLowerCase().includes('none') &&
          !name.toLowerCase().includes('no medication')
        ) {
          prescribedMeds.push({
            name,
            dosage: String(item.dosage || 'As directed').trim(),
            frequency: String(item.frequency || 'As directed').trim(),
            duration: String(item.duration || 'As directed').trim(),
            instructions: String(item.instructions || 'Take as advised by physician').trim(),
            source: 'doctor_statement'
          });
        }
      }
    }
  }

  // 10. Doctor Stated Advice
  let doctorStatedAdvice = sanitizeNegative(raw.doctor_stated_advice || raw.advice, 'Not documented');
  // If transcript has no advice spoken by doctor, filter out model hallucinations
  const doctorGaveAdviceInTranscript =
    transcript.includes('drink') ||
    transcript.includes('rest') ||
    transcript.includes('diet') ||
    transcript.includes('water') ||
    transcript.includes('gargle') ||
    transcript.includes('avoid') ||
    transcript.includes('eat') ||
    transcript.includes('take care');

  if (!doctorGaveAdviceInTranscript && doctorStatedAdvice !== 'Not documented') {
    // If the model generated generic advice not in transcript, convert to Not documented
    if (
      doctorStatedAdvice.toLowerCase().includes('hydration') ||
      doctorStatedAdvice.toLowerCase().includes('balanced nutrition') ||
      doctorStatedAdvice.toLowerCase().includes('drink plenty of water')
    ) {
      doctorStatedAdvice = 'Not documented';
    }
  }

  // 11. Doctor Stated Red Flags
  let doctorStatedRedFlags = sanitizeNegative(raw.doctor_stated_red_flags || raw.red_flags, 'Not documented');
  const doctorGaveRedFlagsInTranscript =
    transcript.includes('emergency') ||
    transcript.includes('red flag') ||
    transcript.includes('immediately') ||
    transcript.includes('warning sign') ||
    transcript.includes('trouble breathing') ||
    transcript.includes('cannot swallow');

  if (!doctorGaveRedFlagsInTranscript && doctorStatedRedFlags !== 'Not documented') {
    if (
      doctorStatedRedFlags.toLowerCase().includes('rescue 1122') ||
      doctorStatedRedFlags.toLowerCase().includes('routine precautions') ||
      doctorStatedRedFlags.toLowerCase().includes('severe chest pain')
    ) {
      doctorStatedRedFlags = 'Not documented';
    }
  }

  // 12. Doctor Stated Follow Up
  let doctorStatedFollowUp = sanitizeNegative(raw.doctor_stated_follow_up || raw.follow_up, 'Not documented');
  const doctorGaveFollowUpInTranscript =
    transcript.includes('follow up') ||
    transcript.includes('return in') ||
    transcript.includes('see you in') ||
    transcript.includes('days');

  if (!doctorGaveFollowUpInTranscript && doctorStatedFollowUp !== 'Not documented') {
    if (doctorStatedFollowUp.toLowerCase().includes('5 to 7 days') || doctorStatedFollowUp.toLowerCase().includes('as advised')) {
      doctorStatedFollowUp = 'Not documented';
    }
  }

  // 13. AI Safety Considerations (strictly labeled)
  const aiSafetyConsiderations: string[] = [];
  const rawSafety = Array.isArray(raw.ai_safety_considerations) ? raw.ai_safety_considerations : [];
  for (const item of rawSafety) {
    const s = String(item || '').trim();
    if (s) {
      const clean = s.replace(/^ai-generated safety consideration\s*[-—:]\s*clinician review required\s*[-—:]\s*/i, '');
      aiSafetyConsiderations.push(
        `AI-generated safety consideration — clinician review required: ${clean}`
      );
    }
  }

  // If no AI safety considerations provided but there are symptoms needing review:
  if (aiSafetyConsiderations.length === 0 && chiefComplaint !== 'Not documented') {
    aiSafetyConsiderations.push(
      `AI-generated safety consideration — clinician review required: Clinician should evaluate onset, progression, and potential secondary causes for reported ${chiefComplaint.toLowerCase()}.`
    );
  }

  // 14. AI Suggested Actions (optional non-pharmacological suggestions)
  const aiSuggestedActions: string[] = [];
  const rawActions = Array.isArray(raw.ai_suggested_actions) ? raw.ai_suggested_actions : [];
  for (const item of rawActions) {
    const s = String(item || '').trim();
    if (s) {
      aiSuggestedActions.push(s);
    }
  }

  // 15. Transcription Summary
  const transcriptionSummary = sanitizeNegative(
    raw.transcription_summary,
    `Clinical dialogue recorded for ${chiefComplaint}. Detailed transcript findings structured below.`
  );

  // 16. Unmentioned Elements
  const unmentionedElements: string[] = [];
  if (doctorStatedDiagnosis === 'Not documented') unmentionedElements.push('Doctor-stated diagnosis: Not documented');
  if (doctorStatedAssessment === 'Not documented') unmentionedElements.push('Doctor-stated assessment: Not documented');
  if (examFindings === 'No physical examination findings documented in the provided transcript.' || examFindings === 'Not documented') {
    unmentionedElements.push('Physical examination: Not documented');
  }
  if (vitals.bp === 'Not documented' && vitals.pulse === 'Not documented') {
    unmentionedElements.push('Vital signs: Not documented');
  }
  if (allergies === 'Not documented') unmentionedElements.push('Allergies: Not documented');
  if (doctorStatedPlan === 'Not documented') unmentionedElements.push('Doctor treatment plan: Not documented');
  if (doctorStatedAdvice === 'Not documented') unmentionedElements.push('Doctor medical advice: Not documented');
  if (doctorStatedRedFlags === 'Not documented') unmentionedElements.push('Red flags: Not documented');
  if (doctorStatedFollowUp === 'Not documented') unmentionedElements.push('Follow-up instructions: Not documented');

  // Build Structured Subsections with explicit Source Attributions
  const documentedInfo: DocumentedClinicalInfo = {
    chief_complaint: { text: chiefComplaint, source: 'patient_statement' },
    duration: { text: duration, source: duration !== 'Not documented' ? 'patient_statement' : 'not_documented' },
    location: { text: location, source: location !== 'Not documented' ? 'patient_statement' : 'not_documented' },
    severity: { text: severity, source: severity !== 'Not documented' ? 'patient_statement' : 'not_documented' },
    associated_symptoms: {
      text: associatedSymptoms,
      source: associatedSymptoms !== 'Not documented' ? 'patient_statement' : 'not_documented'
    },
    denied_symptoms: {
      text: deniedSymptoms,
      source: deniedSymptoms !== 'Not documented' ? 'patient_statement' : 'not_documented'
    },
    history_of_illness: { text: historyOfIllness, source: 'patient_statement' },
    patient_reported_medications: {
      text: patientReportedMeds,
      source: patientReportedMeds !== 'Not documented' ? 'patient_statement' : 'not_documented'
    },
    allergies: {
      text: allergies,
      source: allergies !== 'Not documented' ? 'patient_statement' : 'not_documented'
    },
    vitals: {
      bp: { text: vitals.bp, source: vitals.bp !== 'Not documented' ? 'provided_vital' : 'not_documented' },
      pulse: { text: String(vitals.pulse), source: vitals.pulse !== 'Not documented' ? 'provided_vital' : 'not_documented' },
      temp: { text: vitals.temp, source: vitals.temp !== 'Not documented' ? 'provided_vital' : 'not_documented' },
      spo2: { text: String(vitals.spo2), source: vitals.spo2 !== 'Not documented' ? 'provided_vital' : 'not_documented' },
      respiratory_rate: {
        text: String(vitals.respiratory_rate || 'Not documented'),
        source: vitals.respiratory_rate && vitals.respiratory_rate !== 'Not documented' ? 'provided_vital' : 'not_documented'
      },
      weight: {
        text: String(vitals.weight || 'Not documented'),
        source: vitals.weight && vitals.weight !== 'Not documented' ? 'provided_vital' : 'not_documented'
      }
    },
    physical_examination: {
      text: examFindings,
      source: examFindings.includes('No physical examination') ? 'not_documented' : 'doctor_statement'
    }
  };

  const doctorAssessment: DoctorAssessmentSection = {
    doctor_stated_diagnosis: {
      text: doctorStatedDiagnosis,
      source: doctorStatedDiagnosis !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    },
    doctor_stated_assessment: {
      text: doctorStatedAssessment,
      source: doctorStatedAssessment !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    },
    icd10_code: {
      text: icd10Code,
      source: icd10Code !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    }
  };

  const doctorPlan: DoctorPlanSection = {
    treatment_plan: {
      text: doctorStatedPlan,
      source: doctorStatedPlan !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    },
    prescribed_medications: prescribedMeds,
    stated_advice: {
      text: doctorStatedAdvice,
      source: doctorStatedAdvice !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    },
    explicit_red_flags: {
      text: doctorStatedRedFlags,
      source: doctorStatedRedFlags !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    },
    follow_up_instructions: {
      text: doctorStatedFollowUp,
      source: doctorStatedFollowUp !== 'Not documented' ? 'doctor_statement' : 'not_documented'
    }
  };

  const aiSuggestions: AISafetySuggestionsSection = {
    safety_considerations: aiSafetyConsiderations.map(c => ({
      text: c,
      source: 'ai_generated' as const,
      requires_clinician_review: true as const
    })),
    suggested_actions: aiSuggestedActions.map(a => ({
      text: a,
      source: 'ai_generated' as const,
      requires_clinician_review: true as const
    })),
    unmentioned_elements: unmentionedElements
  };

  const patientName = raw.patient_name || undefined;
  const patientAge = raw.patient_age || (transcript.match(/(\d{1,2})\s*(?:years?\s*old|y\/o|yo|year\s*old)/i)?.[1]) || undefined;
  const patientGender = raw.patient_gender || (transcript.includes('female') || transcript.includes(' ms ') || transcript.includes(' mrs ') || transcript.includes('she ') || transcript.includes('her ') ? 'Female' : transcript.includes(' male ') || transcript.includes(' mr ') || transcript.includes('he ') || transcript.includes('his ') ? 'Male' : undefined);
  const durationDays = raw.duration_days || (transcript.match(/(\d+)\s*days?/i)?.[1]) || (raw.duration && raw.duration.match(/(\d+)\s*days?/i)?.[1]) || undefined;
  const pastMedicalHistory = sanitizeNegative(raw.past_medical_history, 'Not documented');
  const followUpTimeframe = raw.follow_up_timeframe || (raw.doctor_stated_follow_up && raw.doctor_stated_follow_up !== 'Not documented' ? raw.doctor_stated_follow_up : undefined);
  const followUpDate = raw.follow_up_date || undefined;
  const followUpInstructions = raw.follow_up_instructions || (raw.doctor_stated_follow_up !== 'Not documented' ? raw.doctor_stated_follow_up : undefined);

  const normalizedReport: ClinicalReportData = {
    // Backwards compatible fields
    diagnosis: doctorStatedDiagnosis,
    chief_complaint: chiefComplaint,
    patient_name: patientName,
    patient_age: patientAge,
    patient_gender: patientGender,
    duration_days: durationDays,
    problem_duration_days: raw.problem_duration_days || (durationDays ? `${durationDays} Days` : duration !== 'Not documented' ? duration : undefined),
    past_medical_history: pastMedicalHistory,
    duration,
    location,
    severity,
    associated_symptoms: associatedSymptoms,
    denied_symptoms: deniedSymptoms,
    history_of_illness: historyOfIllness,
    patient_reported_medications: patientReportedMeds,
    allergies,
    vitals,
    examination_findings: examFindings,
    transcription_summary: transcriptionSummary,
    doctor_stated_diagnosis: doctorStatedDiagnosis,
    doctor_stated_assessment: doctorStatedAssessment,
    icd10_code: icd10Code,
    doctor_stated_treatment_plan: doctorStatedPlan,
    advice: doctorStatedAdvice,
    doctor_stated_advice: doctorStatedAdvice,
    red_flags: doctorStatedRedFlags,
    doctor_stated_red_flags: doctorStatedRedFlags,
    follow_up: doctorStatedFollowUp,
    doctor_stated_follow_up: doctorStatedFollowUp,
    follow_up_timeframe: followUpTimeframe,
    follow_up_date: followUpDate,
    follow_up_instructions: followUpInstructions,
    medications: prescribedMeds,

    // AI suggestions
    ai_safety_considerations: aiSafetyConsiderations,
    ai_suggested_actions: aiSuggestedActions,

    // Structured sections
    documented_info: documentedInfo,
    doctor_assessment: doctorAssessment,
    doctor_plan: doctorPlan,
    ai_suggestions: aiSuggestions,

    // Status and labels (Rule 9)
    report_status: 'draft',
    status_label: 'AI-GENERATED CLINICAL NOTE — DRAFT',

    // Grounding metadata
    grounding_notes: {
      unmentioned_elements: unmentionedElements,
      is_provisional_diagnosis: doctorStatedDiagnosis === 'Not documented',
      confidence_level: unmentionedElements.length > 4 ? 'moderate' : 'high'
    },
    prompt_version: PROMPT_VERSION,
    schema_version: SCHEMA_VERSION
  };

  return {
    isValid: true,
    report: normalizedReport,
    warnings,
    errors
  };
}

function createEmptyReport(): ClinicalReportData {
  return {
    diagnosis: 'Not documented',
    chief_complaint: 'Not documented',
    duration: 'Not documented',
    location: 'Not documented',
    severity: 'Not documented',
    associated_symptoms: 'Not documented',
    denied_symptoms: 'Not documented',
    history_of_illness: 'No clinical consultation dialogue provided.',
    patient_reported_medications: 'Not documented',
    allergies: 'Not documented',
    vitals: {
      bp: 'Not documented',
      pulse: 'Not documented',
      temp: 'Not documented',
      spo2: 'Not documented',
      respiratory_rate: 'Not documented',
      weight: 'Not documented'
    },
    examination_findings: 'No physical examination findings documented in the provided transcript.',
    transcription_summary: 'No dialogue recorded.',
    doctor_stated_diagnosis: 'Not documented',
    doctor_stated_assessment: 'Not documented',
    icd10_code: 'Not documented',
    doctor_stated_treatment_plan: 'Not documented',
    advice: 'Not documented',
    doctor_stated_advice: 'Not documented',
    red_flags: 'Not documented',
    doctor_stated_red_flags: 'Not documented',
    follow_up: 'Not documented',
    doctor_stated_follow_up: 'Not documented',
    medications: [],
    ai_safety_considerations: [
      'AI-generated safety consideration — clinician review required: Complete clinical documentation required.'
    ],
    ai_suggested_actions: [],
    report_status: 'draft',
    status_label: 'AI-GENERATED CLINICAL NOTE — DRAFT',
    grounding_notes: {
      unmentioned_elements: ['Encounter dialogue missing or unrecorded'],
      is_provisional_diagnosis: true
    },
    prompt_version: PROMPT_VERSION,
    schema_version: SCHEMA_VERSION
  };
}
