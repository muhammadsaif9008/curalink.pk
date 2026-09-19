import { Type } from '@google/genai';

export const SCHEMA_VERSION = '2.2.0';

/**
 * Gemini response schema enforcing structured JSON output for AI Clinical Scribe.
 * Strictly separates transcript facts from AI suggestions.
 * Enforces PMC and WHO documentation standards:
 * - Never turns a symptom into a diagnosis.
 * - Negative findings marked "Not documented" instead of "None" / "Absent".
 * - Stated doctor advice separated from AI suggestions.
 */
export const CLINICAL_REPORT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    patient_name: {
      type: Type.STRING,
      description: 'Full name of the patient from context or dialogue (e.g. "Ahmad Khan", "Zainab Ahmed", "Hamza Tariq", "Fatima Noor").'
    },
    patient_age: {
      type: Type.STRING,
      description: 'Age of the patient as stated in dialogue or provided context (e.g. "32", "29", "42", "34", "58"). If unknown, state "Not documented".'
    },
    patient_gender: {
      type: Type.STRING,
      description: 'Gender of the patient (e.g. "Male", "Female"). If unknown, state "Not documented".'
    },
    duration_days: {
      type: Type.STRING,
      description: 'Duration of the acute or presenting problem (e.g. "3 Days", "14 Days", "1 Day", "7 Days").'
    },
    problem_duration_days: {
      type: Type.STRING,
      description: 'Duration string formatted for clinical display (e.g. "3 Days", "14 Days", "24 Hours").'
    },
    past_medical_history: {
      type: Type.STRING,
      description: 'Past chronic medical history (e.g. "Essential Hypertension", "Mild seasonal asthma", "No chronic illness reported"). If not discussed, return "Not documented".'
    },
    chief_complaint: {
      type: Type.STRING,
      description: 'Primary symptom or reason for visit reported by the patient (e.g. "Headache"). NEVER upgrade a symptom to a diagnosis name like Cephalalgia.'
    },
    duration: {
      type: Type.STRING,
      description: 'Exact duration stated by patient (e.g. "Approximately two weeks"). If not stated, return "Not documented". Do NOT add adjectives like "persistent" unless explicitly stated.'
    },
    location: {
      type: Type.STRING,
      description: 'Anatomical location stated by patient (e.g. "Forehead"). If not stated, return "Not documented".'
    },
    severity: {
      type: Type.STRING,
      description: 'Pain scale or severity stated by patient (e.g. "7/10"). If not stated, return "Not documented".'
    },
    associated_symptoms: {
      type: Type.STRING,
      description: 'Associated symptoms explicitly reported by patient (e.g. "Occasional nausea"). If none discussed, return "Not documented".'
    },
    denied_symptoms: {
      type: Type.STRING,
      description: 'Symptoms explicitly asked about and denied by patient (e.g. "Patient denies vomiting"). If none discussed or denied, return "Not documented".'
    },
    history_of_illness: {
      type: Type.STRING,
      description: 'Faithful factual narrative of present illness strictly adhering to statements in transcript without added clinical inferences.'
    },
    patient_reported_medications: {
      type: Type.STRING,
      description: 'Current medications reported by patient. If patient said "No" or denies taking meds, return "Patient reports no current medication for these symptoms". If not asked, return "Not documented".'
    },
    allergies: {
      type: Type.STRING,
      description: 'Allergies discussed. If patient explicitly denied allergies, return "Patient denies known allergies". If not discussed at all, return "Not documented". NEVER return "No allergies" or "None".'
    },
    vitals: {
      type: Type.OBJECT,
      properties: {
        bp: {
          type: Type.STRING,
          description: 'Blood pressure reading if measured or stated in dialogue. If not mentioned or tested, return "Not documented".'
        },
        pulse: {
          type: Type.STRING,
          description: 'Pulse / heart rate if measured or stated. If not mentioned, return "Not documented".'
        },
        temp: {
          type: Type.STRING,
          description: 'Body temperature if measured or stated. If not mentioned, return "Not documented".'
        },
        spo2: {
          type: Type.STRING,
          description: 'Oxygen saturation if measured or stated. If not mentioned, return "Not documented".'
        },
        respiratory_rate: {
          type: Type.STRING,
          description: 'Respiratory rate if stated. If not mentioned, return "Not documented".'
        },
        weight: {
          type: Type.STRING,
          description: 'Patient weight if stated. If not mentioned, return "Not documented".'
        }
      },
      required: ['bp', 'pulse', 'temp', 'spo2']
    },
    examination_findings: {
      type: Type.STRING,
      description: 'Objective physical examination findings explicitly stated by doctor during encounter. If no physical examination was documented, return "No physical examination findings documented in the provided transcript."'
    },
    doctor_stated_diagnosis: {
      type: Type.STRING,
      description: 'Diagnosis explicitly articulated by the doctor in the dialogue. If the doctor did NOT state a diagnosis, return "Not documented". NEVER diagnose the patient or output Cephalalgia, Migraine, or Tension headache unless the doctor said so.'
    },
    doctor_stated_assessment: {
      type: Type.STRING,
      description: 'Clinical assessment explicitly articulated by the doctor. If doctor did not state an assessment, return "Not documented".'
    },
    icd10_code: {
      type: Type.STRING,
      description: 'ICD-10 code ONLY if the doctor explicitly stated a diagnosis that maps to a code. If doctor did not document a diagnosis, return "Not documented". NEVER generate an ICD-10 code from a symptom!'
    },
    doctor_stated_treatment_plan: {
      type: Type.STRING,
      description: 'Treatment plan explicitly instructed by the doctor. If doctor did not state a plan, return "Not documented".'
    },
    prescribed_medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: 'Medication brand and generic name prescribed by the doctor.'
          },
          dosage: {
            type: Type.STRING,
            description: 'Prescribed dose strength.'
          },
          frequency: {
            type: Type.STRING,
            description: 'Frequency of administration.'
          },
          duration: {
            type: Type.STRING,
            description: 'Duration of course.'
          },
          instructions: {
            type: Type.STRING,
            description: 'Doctor instructions.'
          }
        },
        required: ['name', 'dosage', 'frequency', 'duration', 'instructions']
      },
      description: 'Prescription medications explicitly recommended or prescribed by the doctor. If none prescribed, return empty array [].'
    },
    doctor_stated_advice: {
      type: Type.STRING,
      description: 'Medical advice, hydration, or dietary guidance explicitly spoken by doctor. If doctor did NOT state advice in dialogue, return "Not documented". NEVER invent advice.'
    },
    doctor_stated_red_flags: {
      type: Type.STRING,
      description: 'Emergency red flags explicitly spoken by doctor or patient in transcript. If not mentioned, return "Not documented".'
    },
    doctor_stated_follow_up: {
      type: Type.STRING,
      description: 'Recommended follow-up timeframe explicitly stated by doctor. If not mentioned, return "Not documented".'
    },
    ai_safety_considerations: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: 'Potential safety considerations inferred from reported symptoms for clinician review. These are AI observations, NOT doctor statements.'
    },
    ai_suggested_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: 'Non-pharmacological or workup suggestions for clinician review (e.g. headache diary, hydration check). Must NOT be presented as doctor instructions.'
    },
    transcription_summary: {
      type: Type.STRING,
      description: 'Objective 2-3 sentence overview of the clinical consultation and topics discussed.'
    },
    unmentioned_elements: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: 'List of clinical elements that were NOT discussed or tested in this encounter (e.g. "Doctor-stated diagnosis: Not documented", "Physical examination: Not documented", "Vital signs: Not documented", "Allergies: Not documented").'
    }
  },
  required: [
    'patient_name',
    'patient_age',
    'patient_gender',
    'chief_complaint',
    'duration',
    'location',
    'severity',
    'associated_symptoms',
    'denied_symptoms',
    'history_of_illness',
    'patient_reported_medications',
    'allergies',
    'vitals',
    'examination_findings',
    'doctor_stated_diagnosis',
    'doctor_stated_assessment',
    'icd10_code',
    'doctor_stated_treatment_plan',
    'prescribed_medications',
    'doctor_stated_advice',
    'doctor_stated_red_flags',
    'doctor_stated_follow_up',
    'ai_safety_considerations',
    'transcription_summary',
    'unmentioned_elements'
  ]
};
