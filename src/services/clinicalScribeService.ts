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

export interface PrescribedMedItem {
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
  prescribed_medications: PrescribedMedItem[];
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

export interface ScribeReportOutput {
  // Direct fields
  diagnosis: string;
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
  vitals: {
    bp: string;
    pulse: number | string;
    temp: string;
    spo2: number | string;
    respiratory_rate?: string | null;
    weight?: string | null;
  };
  examination_findings: string;
  physical_exam?: string;
  transcription_summary: string;
  consultation_transcript?: string;
  doctor_stated_diagnosis?: string;
  doctor_stated_assessment?: string;
  icd10_code?: string;
  doctor_stated_treatment_plan?: string;
  advice: string;
  doctor_stated_advice?: string;
  red_flags: string;
  doctor_stated_red_flags?: string;
  follow_up: string;
  doctor_stated_follow_up?: string;
  follow_up_timeframe?: string;
  follow_up_date?: string;
  follow_up_instructions?: string;
  medications: PrescribedMedItem[];
  prescribed_medications?: PrescribedMedItem[];
  stated_advice?: string;
  explicit_red_flags?: string;

  // AI-generated suggestions
  ai_safety_considerations?: string[];
  ai_suggested_actions?: string[];

  // Structured sections
  documented_info?: DocumentedClinicalInfo;
  doctor_assessment?: DoctorAssessmentSection;
  doctor_plan?: DoctorPlanSection;
  ai_suggestions?: AISafetySuggestionsSection;

  // Status & draft header
  report_status?: 'draft' | 'reviewed' | 'signed';
  status_label?: string;

  grounding_notes?: {
    unmentioned_elements: string[];
    is_provisional_diagnosis: boolean;
    confidence_level?: 'high' | 'moderate' | 'low';
  };
  prompt_version?: string;
  schema_version?: string;
}

export interface ClinicalSampleCase {
  id: string;
  title: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  durationDays: string;
  allergies: string;
  pastMedicalHistory: string;
  chiefComplaint: string;
  transcript: string;
  vitals: {
    bp: string;
    pulse: number;
    temp: number;
    spo2: number;
  };
}

export const SAMPLE_CLINICAL_CONVERSATIONS: ClinicalSampleCase[] = [
  {
    id: 'case_headache_requirement11',
    title: 'Ahmad Khan, 32M — Tension Cephalalgia Clinical Review',
    patientName: 'Ahmad Khan',
    patientAge: 32,
    patientGender: 'Male',
    durationDays: '14 Days',
    allergies: 'No known drug allergies',
    pastMedicalHistory: 'No prior chronic medical conditions reported',
    chiefComplaint: 'Frontal headaches for two weeks, rated 7/10',
    vitals: {
      bp: '122/80',
      pulse: 74,
      temp: 98.6,
      spo2: 99
    },
    transcript: `Doctor: What brings you in today Ahmad?

Patient: I've been having headaches for about two weeks, doctor.

Doctor: Where is the pain located?

Patient: Mostly around my forehead and temples.

Doctor: How severe is it from 1 to 10?

Patient: About 7 out of 10.

Doctor: Any nausea, vomiting, or visual changes?

Patient: Sometimes I feel mildly nauseous after staring at computer screens, but I haven't vomited.

Doctor: Any past chronic conditions or allergies?

Patient: No known medical conditions and no drug allergies.

Doctor: Are you taking any medications for it?

Patient: No, just trying to rest.`
  },
  {
    id: 'case_throat_fever',
    title: 'Zainab Ahmed, 29F — Acute Exudative Tonsillopharyngitis & Fever',
    patientName: 'Zainab Ahmed',
    patientAge: 29,
    patientGender: 'Female',
    durationDays: '3 Days',
    allergies: 'No known drug allergies',
    pastMedicalHistory: 'Mild seasonal allergies',
    chiefComplaint: 'Severe sore throat, painful swallowing, and 102°F fever for 3 days',
    vitals: {
      bp: '118/76',
      pulse: 84,
      temp: 101.8,
      spo2: 98
    },
    transcript: `Doctor: "As-salamu alaykum Zainab. Please have a seat. How can I help you today?"
Patient: "Wa alaykum as-salam Doctor Sahab. For the past three days, I have had terrible pain in my throat. Swallowing even a sip of warm water feels like needles, and I have high fever of 102 degrees Fahrenheit."
Doctor: "I see. Have you noticed any chills, headache, or neck stiffness?"
Patient: "Yes, bad headache and body aches. No neck stiffness though."
Doctor: "Any cough, shortness of breath, or chest pain?"
Patient: "A mild dry cough occasionally, but no chest pain or breathing difficulty."
Doctor: "Are you allergic to any medicines, particularly Penicillin or Sulfa drugs?"
Patient: "No known drug allergies, doctor."
Doctor: "Let's check your vitals first. Blood pressure is 118 over 76 mmHg. Heart rate is 84 bpm. Oxygen saturation is 98% on room air. Body temperature is 101.8 Fahrenheit right now. Let me inspect your throat. Please open wide and say 'Aah'."
Patient: "Aaaah..."
Doctor: "Your posterior pharynx and uvula are visibly inflamed and red, with yellowish follicular exudates on both tonsils. Your anterior cervical lymph nodes are also swollen and tender to the touch. Your chest sounds completely clear bilaterally."
Patient: "Is it a serious throat infection, doctor?"
Doctor: "You have acute exudative pharyngotonsillitis. It requires a targeted 7-day oral antibiotic course to eradicate the infection and prevent complications, along with antipyretics and anti-inflammatory throat gargles. You must not skip doses, even after fever settles in 48 hours."
Patient: "Understood doctor. Any dietary instructions?"
Doctor: "Stay on warm soft foods, khichdi, clear chicken broth, and drink at least 2.5 liters of warm water or green tea with honey daily. Avoid cold beverages and spicy oily dishes. If you develop difficulty breathing or cannot swallow liquids, return immediately."
Patient: "Thank you so much Doctor Sahab."`
  },
  {
    id: 'case_gastroenteritis',
    title: 'Hamza Tariq, 42M — Acute Food-borne Gastroenteritis & Cramps',
    patientName: 'Hamza Tariq',
    patientAge: 42,
    patientGender: 'Male',
    durationDays: '1 Day (24 Hours)',
    allergies: 'None reported',
    pastMedicalHistory: 'No chronic diseases',
    chiefComplaint: 'Abdominal cramps, vomiting, and watery diarrhea for 24 hours',
    vitals: {
      bp: '106/70',
      pulse: 92,
      temp: 99.1,
      spo2: 99
    },
    transcript: `Doctor: "Good afternoon Hamza. Tell me what happened."
Patient: "Doctor, since last night after eating restaurant food, I have had severe stomach cramping and diarrhea. I've been to the washroom 6 times, and vomited twice this morning."
Doctor: "Have you noticed any blood in stools or high fever?"
Patient: "No blood, but I feel very weak, thirsty, and dizzy when standing up."
Doctor: "Let's examine. Pulse is slightly elevated at 92 bpm, BP is 106/70 mmHg, Temp 99.1°F, SpO2 99%. Your oral tongue is somewhat dry, showing mild dehydration. Abdomen is soft, with generalized lower abdominal tenderness and hyperactive bowel sounds. No rebound tenderness."
Doctor: "This is acute food-borne gastroenteritis. The most critical priority is immediate rehydration with ORS (Nimkol). We will start anti-spasmodics for the cramps and a restorative probiotic."
Patient: "Do I need an antibiotic?"
Doctor: "Not immediately, as there is no dysentery or high fever. If symptoms persist beyond 48 hours or fever exceeds 101°F, we will re-evaluate."`
  },
  {
    id: 'case_hypertension',
    title: 'Fatima Noor, 34F — Essential Hypertension & Occipital Headache',
    patientName: 'Fatima Noor',
    patientAge: 34,
    patientGender: 'Female',
    durationDays: '7 Days',
    allergies: 'Sulfa medications (skin rash)',
    pastMedicalHistory: 'Essential arterial hypertension diagnosed 2 years ago',
    chiefComplaint: 'Occipital morning headaches and routine blood pressure check',
    vitals: {
      bp: '152/96',
      pulse: 76,
      temp: 98.6,
      spo2: 99
    },
    transcript: `Doctor: "Welcome Fatima. How have you been managing your medications lately?"
Patient: "Doctor, I've had dull headaches at the back of my head for the past week, especially upon waking up. I confess I skipped my BP medicine three days last week because of work stress."
Doctor: "Let's check your blood pressure now. Resting BP is 152 over 96 mmHg in right arm, 150 over 94 in left arm. Pulse is 76 bpm regular. Chest is clear and no ankle swelling."
Doctor: "Skipping anti-hypertensives causes rebound arterial hypertension, which explains the morning occipital throbbing. We will adjust your Amlodipine dose, and I need you to strictly log your morning and evening BP for the next 10 days."
Patient: "I will be strictly compliant, doctor. Thank you for checking so thoroughly."`
  },
  {
    id: 'case_respiratory_elderly',
    title: 'Tariq Mehmood, 58M — Acute Bronchitis & Productive Cough',
    patientName: 'Tariq Mehmood',
    patientAge: 58,
    patientGender: 'Male',
    durationDays: '5 Days',
    allergies: 'Aspirin / NSAIDs',
    pastMedicalHistory: 'Type 2 Diabetes Mellitus on Metformin, ex-smoker',
    chiefComplaint: 'Productive cough with thick yellowish sputum and mild chest tightness for 5 days',
    vitals: {
      bp: '134/86',
      pulse: 88,
      temp: 100.4,
      spo2: 96
    },
    transcript: `Doctor: "As-salamu alaykum Uncle Tariq. How can I help you today?"
Patient: "Wa alaykum as-salam Dr Sahab. For the past 5 days I have had a heavy chest cough with thick yellowish phlegm. It worsens at night and causes mild breathlessness."
Doctor: "Any fever or chills?"
Patient: "Yes, low grade fever around 100 degrees and feeling fatigued."
Doctor: "Any known drug allergies?"
Patient: "Aspirin gives me stomach burning and skin rash."
Doctor: "Let's check vitals. Blood pressure 134/86, pulse 88 bpm, SpO2 96% on room air, temperature 100.4°F. Auscultation reveals coarse expiratory rhonchi throughout both lung bases, but no stridor or consolidation. This is acute tracheobronchitis. We will start oral Azithromycin, a mucolytic expectorant, and steam inhalation."
Patient: "Thank you doctor, I will follow the instructions."`
  }
];

export async function requestAIScribeReport(params: {
  transcript: string;
  patientName?: string;
  patientAge?: number | string;
  patientGender?: string;
  durationDays?: string | number;
  allergies?: string;
  pastMedicalHistory?: string;
  doctorName?: string;
  visitType?: string;
  existingVitals?: any;
  doctorSpecialty?: string;
  chiefComplaint?: string;
}): Promise<{ success: boolean; report: ScribeReportOutput; source: string; promptVersion?: string }> {
  let cleanTranscript = (params.transcript || '').trim();
  if (!cleanTranscript) {
    const complaint = params.chiefComplaint?.trim() || 'Clinical consultation evaluation';
    const cleanDuration = (params.durationDays || '3').toString().replace(/\s*days?/gi, '').trim() || '3';
    cleanTranscript = `Clinical Consultation Notes:\nPatient: ${params.patientName || 'Patient'}\nChief Complaint: ${complaint}\nDuration: ${cleanDuration} days\nMedical History: ${params.pastMedicalHistory || 'None reported'}\nAllergies: ${params.allergies || 'No known drug allergies'}`;
  }

  const payload = {
    ...params,
    transcript: cleanTranscript
  };

  try {
    const response = await fetch('/api/gemini/generate-consultation-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // Continue to client fallback
    }

    if (response.ok && data?.success && data?.report) {
      const normalizedReport: ScribeReportOutput = {
        ...data.report,
        consultation_transcript: data.report.consultation_transcript || cleanTranscript,
        patient_name: data.report.patient_name || params.patientName,
        patient_age: data.report.patient_age || params.patientAge,
        patient_gender: data.report.patient_gender || params.patientGender,
        duration_days: data.report.duration_days || params.durationDays,
        problem_duration_days: data.report.problem_duration_days || (params.durationDays ? String(params.durationDays) : undefined),
        past_medical_history: data.report.past_medical_history || params.pastMedicalHistory,
        allergies: data.report.allergies || params.allergies,
        physical_exam:
          data.report.examination_findings ||
          data.report.physical_exam ||
          'No physical examination findings documented in the provided transcript.'
      };

      return {
        success: true,
        report: normalizedReport,
        source: data.source || 'gemini-3.8-flash',
        promptVersion: data.promptVersion
      };
    }
  } catch (netErr) {
    console.warn('[CuraLink AI Scribe] Network error contacting server, utilizing client-side clinical synthesis:', netErr);
  }

  // Client-side resilient fallback extraction directly grounded in the clean transcript
  const lower = cleanTranscript.toLowerCase();
  const lines = cleanTranscript.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract raw patient statements
  let patientRawStatement = '';
  for (const line of lines) {
    if (/^patient:\s*/i.test(line)) {
      const pText = line.replace(/^patient:\s*/i, '').replace(/^["']|["']$/g, '').trim();
      if (pText.length > 5) {
        patientRawStatement = pText;
        break;
      }
    }
  }

  // 1. Duration extraction (supports "for last 10 days", "past 3 days", "10 days", "2 weeks", etc.)
  let duration = 'Not documented';
  const durMatch = cleanTranscript.match(/(?:for\s+(?:the\s+)?(?:last|past)\s+|for\s+|past\s+|last\s+|since\s+)?(\d{1,3})\s*(days?|weeks?|months?|hours?)/i);
  if (durMatch) {
    const unit = durMatch[2].toLowerCase().startsWith('day')
      ? 'Days'
      : durMatch[2].toLowerCase().startsWith('week')
      ? 'Weeks'
      : durMatch[2].toLowerCase().startsWith('month')
      ? 'Months'
      : 'Hours';
    duration = `${durMatch[1]} ${unit}`;
  } else if (lower.includes('two weeks') || lower.includes('2 weeks')) {
    duration = '14 Days';
  } else if (lower.includes('3 days') || lower.includes('three days')) {
    duration = '3 Days';
  } else if (lower.includes('24 hours') || lower.includes('since last night')) {
    duration = '24 Hours';
  }

  const effectiveDuration = duration !== 'Not documented' ? duration : (params.durationDays ? `${params.durationDays} Days` : 'Not documented');

  // 2. Extract Chief Complaint dynamically directly from patient dialogue
  let extractedChiefComplaint = '';
  if (lower.includes('stomach') || lower.includes('belly') || lower.includes('abdomen') || lower.includes('abdominal') || lower.includes('gastric')) {
    extractedChiefComplaint = duration !== 'Not documented' ? `Stomach symptoms / discomfort (${duration})` : 'Stomach symptoms / discomfort';
  } else if (lower.includes('headache') || lower.includes('migraine')) {
    extractedChiefComplaint = duration !== 'Not documented' ? `Headache (${duration})` : 'Headache';
  } else if (lower.includes('throat') || lower.includes('pharyngitis') || lower.includes('tonsil')) {
    extractedChiefComplaint = duration !== 'Not documented' ? `Sore throat (${duration})` : 'Sore throat';
  } else if (lower.includes('cough') || lower.includes('chest') || lower.includes('shortness of breath')) {
    extractedChiefComplaint = duration !== 'Not documented' ? `Cough and chest symptoms (${duration})` : 'Cough and chest symptoms';
  } else if (lower.includes('fever') || lower.includes('chills')) {
    extractedChiefComplaint = duration !== 'Not documented' ? `Fever and chills (${duration})` : 'Fever and chills';
  } else if (patientRawStatement) {
    extractedChiefComplaint = patientRawStatement.slice(0, 60);
  } else {
    extractedChiefComplaint = params.chiefComplaint || 'Clinical consultation evaluation';
  }

  // 3. Location
  let location = 'Not documented';
  if (lower.includes('stomach') || lower.includes('abdomen') || lower.includes('belly') || lower.includes('epigastric')) {
    location = 'Stomach / Abdomen';
  } else if (lower.includes('forehead')) {
    location = 'Forehead';
  } else if (lower.includes('back of my head') || lower.includes('occipital')) {
    location = 'Occipital (back of head)';
  } else if (lower.includes('throat')) {
    location = 'Throat';
  }

  // 4. Severity
  let severity = 'Not documented';
  const sevMatch = cleanTranscript.match(/(?:severity|scale|from 1 to 10|is it)[\s\S]*?(?:about\s*)?(\d{1,2}(?:\s*\/\s*10)?)/i);
  if (sevMatch) {
    severity = sevMatch[1].includes('/10') ? sevMatch[1] : `${sevMatch[1]}/10`;
  } else if (lower.includes('severe')) {
    severity = 'Severe';
  }

  // 5. Associated symptoms
  let associatedSymptoms = 'Not documented';
  if (lower.includes('feel nauseous') || lower.includes('nausea')) {
    associatedSymptoms = 'Occasional nausea';
  } else if (lower.includes('fever')) {
    associatedSymptoms = 'Fever';
  }

  // 6. Denied symptoms
  let deniedSymptoms = 'Not documented';
  if (lower.includes("haven't vomited") || lower.includes('no vomiting')) {
    deniedSymptoms = 'Patient denies vomiting';
  } else if (lower.includes('no chest pain') || lower.includes('no breathing difficulty')) {
    deniedSymptoms = 'Patient denies chest pain and breathing difficulty';
  }

  // 7. History of Illness - Grounded directly in patient statement
  let historyOfIllness = '';
  if (patientRawStatement) {
    historyOfIllness = `Patient presented reporting symptoms${duration !== 'Not documented' ? ` lasting for ${duration}` : ''}: "${patientRawStatement}". Discussed onset and symptoms with attending clinician during consultation encounter.`;
  } else {
    historyOfIllness = `Patient presented with ${extractedChiefComplaint.toLowerCase()}${duration !== 'Not documented' ? ` lasting for ${duration}` : ''}. Location: ${location}. Severity: ${severity}. Associated symptoms: ${associatedSymptoms}. ${deniedSymptoms !== 'Not documented' ? deniedSymptoms + '.' : ''}`;
  }

  // 8. Physical examination - Never hallucinate
  const examFindings = 'No physical examination findings documented in the provided transcript.';

  // 9. Vitals - Grounded only in explicit booking or text
  const vitals = {
    bp: params.existingVitals?.bp || 'Not documented',
    pulse: params.existingVitals?.pulse ? String(params.existingVitals.pulse) : 'Not documented',
    temp: params.existingVitals?.temp || 'Not documented',
    spo2: params.existingVitals?.spo2 ? String(params.existingVitals.spo2) : 'Not documented'
  };

  const clientFallbackReport: ScribeReportOutput = {
    diagnosis: 'Pending Clinician Evaluation',
    chief_complaint: extractedChiefComplaint,
    consultation_transcript: cleanTranscript,
    patient_name: params.patientName || 'Patient',
    patient_age: params.patientAge || 'Not documented',
    patient_gender: params.patientGender || 'Not documented',
    duration_days: effectiveDuration,
    problem_duration_days: effectiveDuration,
    past_medical_history: params.pastMedicalHistory || 'No prior chronic conditions reported',
    duration: duration,
    location: location,
    severity: severity,
    associated_symptoms: associatedSymptoms,
    denied_symptoms: deniedSymptoms,
    history_of_illness: historyOfIllness,
    patient_reported_medications: 'Not documented',
    allergies: params.allergies || 'Patient denies known allergies',
    vitals: vitals,
    examination_findings: examFindings,
    physical_exam: examFindings,
    transcription_summary: `Recorded consultation documented patient symptoms of ${extractedChiefComplaint.toLowerCase()}${duration !== 'Not documented' ? ` lasting ${duration}` : ''}. Diagnostic evaluation pending clinician review.`,
    doctor_stated_diagnosis: 'Not documented in dialogue',
    doctor_stated_assessment: 'Not documented in dialogue',
    icd10_code: 'Not documented',
    doctor_stated_treatment_plan: 'Not documented in dialogue',
    medications: [],
    prescribed_medications: [],
    advice: 'Not documented',
    stated_advice: 'Not documented',
    doctor_stated_advice: 'Not documented',
    red_flags: 'Not documented',
    explicit_red_flags: 'Not documented',
    doctor_stated_red_flags: 'Not documented',
    follow_up: 'Not documented',
    follow_up_instructions: 'Not documented',
    doctor_stated_follow_up: 'Not documented',
    follow_up_timeframe: 'Not documented',
    ai_safety_considerations: [
      `AI-generated safety consideration — clinician review required: Clinician should evaluate onset, progression, and potential causes for reported ${extractedChiefComplaint.toLowerCase()}.`
    ],
    ai_suggested_actions: [
      lower.includes('stomach') || lower.includes('diarrhea') || lower.includes('abdominal') || lower.includes('vomit')
        ? 'Clinician may perform abdominal examination, assess hydration status, and rule out surgical abdomen red flags.'
        : lower.includes('throat')
        ? 'Clinician may assess pharyngeal erythema, airway patency, and hydration.'
        : lower.includes('headache')
        ? 'Clinician may review headache triggers, hydration, and neurological red flags.'
        : 'Clinician may assess clinical trajectory, vitals, and response to symptomatic therapy.'
    ]
  };

  return {
    success: true,
    report: clientFallbackReport,
    source: 'CuraLink Clinical Scribe Engine (Transcript-Grounded Fallback)',
    promptVersion: '2.2.0'
  };
}

export interface ClientAudioTranscriptionParams {
  audioBase64: string;
  mimeType?: string;
  doctorName?: string;
  patientName?: string;
  existingTranscript?: string;
}

export async function requestAudioTranscription(
  params: ClientAudioTranscriptionParams
): Promise<{ success: boolean; transcript?: string; newTurns?: string; error?: string }> {
  try {
    const response = await fetch('/api/gemini/transcribe-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await response.text().catch(() => '');
      console.warn('Non-JSON audio transcription response:', response.status, rawText.slice(0, 120));
      return {
        success: false,
        error: response.status === 413
          ? 'Audio recording was too long for a single upload. Please speak in shorter segments.'
          : `Server returned status ${response.status}. Please try again.`
      };
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseErr: any) {
      console.warn('Failed to parse transcription response JSON:', parseErr?.message);
      return {
        success: false,
        error: 'Invalid JSON response from server. Please try again.'
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || `Server responded with status ${response.status}`
      };
    }

    return data;
  } catch (err: any) {
    console.error('Audio transcription request failed:', err);
    return {
      success: false,
      error: err.message || 'Network error while transcribing audio'
    };
  }
}

