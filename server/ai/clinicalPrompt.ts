import { ClinicalScribeRequest, FewShotExample } from './clinicalTypes';

export const PROMPT_VERSION = '2.2.0';

export const CLINICAL_SCRIBE_SYSTEM_INSTRUCTION = `You are CuraLink AI Scribe, an uncompromising clinical documentation assistant designed for licensed healthcare providers in Pakistan, adhering to Pakistan Medical Commission (PMC) standards and WHO clinical documentation protocols.

FUNDAMENTAL PRINCIPLE:
"Document what is known. Clearly identify what is unknown. Never present an AI inference as a clinician-confirmed fact."

STRICT DOCUMENTATION RULES (ZERO TOLERANCE FOR HALLUCINATION):

1. NEVER TURN A SYMPTOM INTO A DIAGNOSIS:
   - If the patient says: "I have a headache" or "My head hurts", the Chief Complaint is "Headache".
   - You MUST set doctor_stated_diagnosis to "Not documented".
   - You MUST set doctor_stated_assessment to "Not documented".
   - You MUST set icd10_code to "Not documented".
   - CRITICAL: NEVER output "Cephalalgia", "Migraine", "Tension headache", or any ICD-10 code unless the DOCTOR EXPLICITLY STATES that diagnosis in the transcript dialogue!
   - The AI must NEVER independently diagnose the patient or infer a diagnosis from symptoms.

2. SEPARATE TRANSCRIPT FACTS FROM AI SUGGESTIONS:
   - Section 1: Documented Clinical Information — Only facts explicitly stated in the transcript or provided in verified patient data.
   - Section 2: Doctor's Assessment — Only assessment/diagnosis explicitly stated by the doctor in the dialogue. If doctor stated none, mark "Not documented".
   - Section 3: Doctor's Plan — Only instructions, treatments, medications, investigations, or follow-up explicitly stated by the doctor. If doctor stated none, mark "Not documented".
   - Section 4: AI Safety Considerations / Suggestions — Observations inferred from symptoms for clinician review. These must NEVER appear as if they were spoken by the doctor.

3. DO NOT ADD UNSPOKEN MEDICAL ADVICE TO THE FINAL CLINICAL PLAN:
   - If the transcript does not contain "Drink more water", DO NOT put hydration advice into doctor_stated_advice or the clinical plan. Mark doctor_stated_advice as "Not documented".
   - Unspoken advice may only appear in ai_suggested_actions, clearly designated for clinician review.

4. RED FLAGS MUST BE CLEARLY SEPARATED:
   - doctor_stated_red_flags: ONLY red flags actually spoken by the patient or doctor in the dialogue. If not discussed, return "Not documented".
   - Do NOT imply "No red flags detected = patient is safe".
   - Do NOT automatically insert emergency instructions (e.g. Rescue 1122) as though they were part of the doctor's consultation.
   - Any AI safety observations belong in ai_safety_considerations with phrasing indicating clinician review is required.

5. DO NOT OVERSTATE NEGATIVE FINDINGS — USE "NOT DOCUMENTED":
   - If something was not discussed, state "Not documented". NEVER say "Absent", "None", "No", or "Not present".
   - Physical examination: If no exam was conducted or mentioned in transcript, state "No physical examination findings documented in the provided transcript."
   - Allergies: If not discussed, state "Not documented". NEVER state "No allergies".
   - Vital signs: If not tested or stated, state "Not documented". NEVER invent vitals.
   - Distinguish between "not mentioned" ("Not documented") and "explicitly denied":
     * If patient says "I don't have any allergies" -> "Patient denies known allergies."
     * If patient says "I haven't vomited" -> "Patient denies vomiting."
     * If patient says "No" when asked about medications -> "Patient reports no current medication for these symptoms."

6. DO NOT ADD UNSPOKEN ADJECTIVES OR CLINICAL INTERPRETATIONS:
   - Stay as close as possible to the transcript text.
   - If patient says "I've had headaches for two weeks", document Duration as "Approximately two weeks". Do NOT write "persistent headaches" unless the patient or doctor explicitly said persistent.
   - If patient says "Sometimes I feel nauseous", document "Patient reports occasional nausea". Do NOT upgrade to continuous or severe nausea.

7. ICD-10 CODES:
   - Do NOT automatically generate ICD-10 codes from symptoms.
   - Only include an ICD-10 code if the clinician explicitly provided a formal diagnosis that can be mapped.
   - If doctor has not documented a diagnosis: icd10_code MUST be "Not documented".

8. MEDICAL HISTORY & PATIENT DEMOGRAPHICS:
   - Extract patient age (e.g. 32), gender (Female/Male), duration of problem in days (e.g. 3, 7, 14), and past medical history/allergies if spoken in the dialogue or provided in verified profile.
   - If not mentioned in transcript, mark past_medical_history as "Not documented".

9. FOLLOW-UP SPECIFICATIONS:
   - When the doctor tells the patient to follow up after a specific time (e.g., "See me in 5 days", "Follow up after 1 week", "SOS"), record the exact timeframe in follow_up_timeframe and instructions in follow_up_instructions.

10. DRAFT STATUS:
   - Every generated note is a DRAFT requiring clinician review and approval. All output must strictly follow the JSON schema.`;

/**
 * High-quality few-shot training examples demonstrating strict adherence to all rules.
 */
export const FEW_SHOT_CLINICAL_EXAMPLES: FewShotExample[] = [
  {
    id: 'headache_undetermined_case',
    title: 'Symptom-Only Encounter: No Doctor Diagnosis Stated',
    transcript: `Doctor: What brings you in today?
Patient: I've been having headaches for about two weeks.
Doctor: Where is the pain?
Patient: Mostly around my forehead.
Doctor: How severe is it from 1 to 10?
Patient: About 7.
Doctor: Any nausea or vomiting?
Patient: Sometimes I feel nauseous, but I haven't vomited.
Doctor: Are you taking any medications for it?
Patient: No.`,
    report: {
      chief_complaint: 'Headache',
      duration: 'Approximately two weeks',
      location: 'Forehead',
      severity: '7/10',
      associated_symptoms: 'Occasional nausea',
      denied_symptoms: 'Patient denies vomiting',
      history_of_illness: 'Patient reports frontal headaches for approximately two weeks, rated 7/10 in severity. Associated with occasional nausea. Denies vomiting. Patient reports no current medication taken for these symptoms.',
      patient_reported_medications: 'Patient reports no current medication for these symptoms',
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
      doctor_stated_diagnosis: 'Not documented',
      doctor_stated_assessment: 'Not documented',
      icd10_code: 'Not documented',
      doctor_stated_treatment_plan: 'Not documented',
      prescribed_medications: [],
      doctor_stated_advice: 'Not documented',
      doctor_stated_red_flags: 'Not documented',
      doctor_stated_follow_up: 'Not documented',
      ai_safety_considerations: [
        'AI-generated safety consideration — clinician review required: Consider ruling out secondary headache etiologies (e.g. neurological red flags, vision changes, temporal tenderness) before confirming primary headache.',
        'AI-generated safety consideration — clinician review required: Note reports 2-week duration with 7/10 pain intensity requiring formal clinical examination.'
      ],
      ai_suggested_actions: [
        'Clinician may consider recommending a headache frequency/trigger log.',
        'Clinician may assess hydration status and caffeine intake patterns.'
      ],
      transcription_summary: 'Consultation focused on patient-reported frontal headaches lasting two weeks with 7/10 severity and occasional nausea. No physical exam, doctor diagnosis, or treatment plan was articulated in this transcript.',
      unmentioned_elements: [
        'Doctor-stated diagnosis: Not documented',
        'Physical examination: Not documented',
        'Vital signs: Not documented',
        'Allergies: Not documented',
        'Doctor treatment plan: Not documented'
      ]
    }
  },
  {
    id: 'pharyngitis_confirmed_case',
    title: 'Consultation with Doctor-Stated Diagnosis & Exam',
    transcript: `Doctor: "What brings you in today?"
Patient: "I have had severe throat pain and fever for 3 days."
Doctor: "Any cough or breathing difficulty?"
Patient: "No cough or trouble breathing."
Doctor: "Let's check vitals and examine: BP is 120/80 mmHg, pulse 82 bpm, temp 101.4 F, SpO2 98%. Pharynx shows acute erythema with bilateral follicular tonsillar exudates. Chest clear."
Doctor: "My assessment and diagnosis is acute exudative tonsillopharyngitis. I prescribe Co-Amoxiclav 625mg one tablet TDS for 7 days and Paracetamol 500mg SOS for fever. Drink warm fluids and gargle with warm saline. If you have difficulty breathing or cannot swallow saliva, visit emergency immediately."`,
    report: {
      chief_complaint: 'Throat pain and fever',
      duration: '3 days',
      location: 'Throat',
      severity: 'Severe',
      associated_symptoms: 'Fever',
      denied_symptoms: 'Patient denies cough and breathing difficulty',
      history_of_illness: 'Patient presented with 3-day history of severe throat pain and fever. Denies cough or dyspnea.',
      patient_reported_medications: 'Not documented',
      allergies: 'Not documented',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '82 bpm',
        temp: '101.4 F',
        spo2: '98%',
        respiratory_rate: 'Not documented',
        weight: 'Not documented'
      },
      examination_findings: 'Pharyngeal erythema with bilateral tonsillar exudates. Clear pulmonary auscultation bilaterally.',
      doctor_stated_diagnosis: 'Acute exudative tonsillopharyngitis',
      doctor_stated_assessment: 'Acute exudative tonsillopharyngitis',
      icd10_code: 'J02.0',
      doctor_stated_treatment_plan: 'Oral antibiotic course for 7 days and antipyretic analgesia SOS with supportive hydration.',
      prescribed_medications: [
        {
          name: 'Co-Amoxiclav',
          dosage: '625mg',
          frequency: 'One tablet TDS (three times daily)',
          duration: '7 days',
          instructions: 'Take after meals. Complete full 7-day course.'
        },
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'SOS for fever',
          duration: 'As needed',
          instructions: 'Take with water for fever.'
        }
      ],
      doctor_stated_advice: 'Drink warm fluids and gargle with warm saline.',
      doctor_stated_red_flags: 'Difficulty breathing or inability to swallow saliva requires immediate emergency care.',
      doctor_stated_follow_up: 'Not documented',
      ai_safety_considerations: [
        'AI-generated safety consideration — clinician review required: Verify patient penicillin allergy history prior to dispensing Co-Amoxiclav.'
      ],
      transcription_summary: 'Doctor examined patient, diagnosed acute exudative tonsillopharyngitis based on tonsillar exudates, and prescribed oral antibiotics and antipyretics with hydration guidance.',
      unmentioned_elements: [
        'Allergies: Not documented in dialogue prior to antibiotic prescription',
        'Follow-up interval: Not documented'
      ]
    }
  }
];

/**
 * Builds the user prompt given the request context
 */
export function buildClinicalScribePrompt(
  req: ClinicalScribeRequest,
  options?: { includeFewShot?: boolean }
): string {
  const patient = req.patientName || 'Patient';
  const doctor = req.doctorName || 'Attending Physician';
  const visitType = req.visitType || 'Clinical Consultation';
  const specialty = req.doctorSpecialty || 'General Practice / Family Medicine';

  let prompt = `CLINICAL ENCOUNTER CONTEXT:
- Patient Name: ${patient}
- Patient Age: ${req.patientAge ? req.patientAge : 'Extract from dialogue if mentioned; otherwise "Not documented"'}
- Patient Gender: ${req.patientGender ? req.patientGender : 'Extract from dialogue if mentioned; otherwise "Not documented"'}
- Presenting Problem Duration: ${req.durationDays ? req.durationDays : 'Extract from dialogue'}
- Known Allergies: ${req.allergies ? req.allergies : 'Extract from dialogue if discussed'}
- Past Medical History: ${req.pastMedicalHistory ? req.pastMedicalHistory : 'Extract from dialogue if discussed'}
- Attending Doctor: ${doctor} (${specialty})
- Visit Mode: ${visitType}
- Scribe Protocol Version: ${PROMPT_VERSION}
`;

  if (req.existingVitals && Object.keys(req.existingVitals).length > 0) {
    prompt += `- Pre-recorded Verified Vitals: ${JSON.stringify(req.existingVitals)}\n`;
  } else {
    prompt += `- Pre-recorded Verified Vitals: None provided (only transcribe vitals if spoken in dialogue; otherwise return "Not documented")\n`;
  }

  if (options?.includeFewShot && FEW_SHOT_CLINICAL_EXAMPLES.length > 0) {
    const example = FEW_SHOT_CLINICAL_EXAMPLES[0];
    prompt += `\nFEW-SHOT REFERENCE EXAMPLE:
Example Dialogue:
"""
${example.transcript}
"""
Expected Truthful Grounded Output:
${JSON.stringify(example.report, null, 2)}
\n---\n`;
  }

  prompt += `\nACTIVE CONSULTATION TRANSCRIPT TO TRANSCRIBE & SYNTHESIZE:
"""
${req.transcript.trim()}
"""

MANDATORY GENERATION INSTRUCTIONS:
1. Ground Truth Priority: The ACTIVE CONSULTATION TRANSCRIPT is the sole authority for the patient's symptoms. Extract the patient's chief complaint, history of present illness, location, severity, duration, and associated symptoms strictly and faithfully from what the patient actually described in the conversation. If the conversation is about stomach problems, abdominal pain, diarrhea, nausea, or vomiting, chief_complaint and history_of_illness MUST describe the gastrointestinal issue. NEVER substitute, carry over, or bias output with unrelated symptoms (such as sore throat or fever) from past bookings or placeholders.
2. Extract patient_name, patient_age, patient_gender, duration_days, and past_medical_history from the dialogue or context. Do not output placeholder values or default to 29 / Female unless that is the actual patient in this encounter.
3. DO NOT turn symptoms into diagnoses! If the doctor does NOT explicitly state a diagnosis in the dialogue, doctor_stated_diagnosis and doctor_stated_assessment MUST be "Not documented", and icd10_code MUST be "Not documented".
4. NEVER output Cephalalgia or any other ICD-10 diagnosis unless the doctor explicitly stated that diagnosis in the transcript dialogue.
5. If something was not discussed or tested (e.g. physical exam, vitals, allergies, doctor advice, red flags, treatment plan), record it as "Not documented" (or "No physical examination findings documented in the provided transcript.").
6. DO NOT invent doctor advice or emergency warnings. If unspoken by the doctor, mark as "Not documented".
7. In ai_safety_considerations, provide relevant safety observations strictly labeled "AI-generated safety consideration — clinician review required" relevant to the specific condition discussed in the transcript.
8. Return strictly valid JSON adhering to the response schema.`;

  return prompt;
}
