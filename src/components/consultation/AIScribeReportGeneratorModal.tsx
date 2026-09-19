import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Stethoscope, 
  Pill, 
  Clock, 
  Loader2, 
  RefreshCw,
  Sliders,
  CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { 
  requestAIScribeReport, 
  ScribeReportOutput, 
  SAMPLE_CLINICAL_CONVERSATIONS, 
  ClinicalSampleCase 
} from '../../services/clinicalScribeService';
import { ConsultationReport, PrescribedMedication } from '../../types';

interface AIScribeReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport: ConsultationReport;
  onApplyReport: (updatedReport: ConsultationReport) => void;
  doctorName?: string;
  patientName?: string;
  visitType?: string;
}

export const AIScribeReportGeneratorModal: React.FC<AIScribeReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentReport,
  onApplyReport,
  doctorName = 'Doctor',
  patientName = '',
  visitType = 'video'
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [patientNameInput, setPatientNameInput] = useState<string>(patientName || currentReport.patient_name || '');
  const [transcript, setTranscript] = useState<string>(currentReport.transcript || currentReport.doctor_notes || '');
  const [chiefComplaint, setChiefComplaint] = useState<string>(currentReport.chief_complaint || '');
  const [patientAge, setPatientAge] = useState<string>(currentReport.patient_age ? String(currentReport.patient_age) : '');
  const [patientGender, setPatientGender] = useState<string>(currentReport.patient_gender || 'Not specified');
  const [durationDays, setDurationDays] = useState<string>(currentReport.problem_duration_days ? String(currentReport.problem_duration_days).replace(/\s*days?/gi, '') : '3');
  const [allergies, setAllergies] = useState<string>(currentReport.allergies || 'None reported');
  const [pastHistory, setPastHistory] = useState<string>(currentReport.medical_history || 'No prior chronic illness reported');
  
  // Vitals
  const [bp, setBp] = useState<string>(currentReport.vitals?.blood_pressure || '118/76');
  const [pulse, setPulse] = useState<string>(String(currentReport.vitals?.pulse_bpm || currentReport.vitals?.heart_rate || '82'));
  const [temp, setTemp] = useState<string>(String(currentReport.vitals?.temperature_f || currentReport.vitals?.temperature || '101.4'));
  const [spo2, setSpo2] = useState<string>(String(currentReport.vitals?.spo2_percent || currentReport.vitals?.oxygen_saturation || '98'));

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedOutput, setGeneratedOutput] = useState<ScribeReportOutput | null>(null);
  const [sourceModel, setSourceModel] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectCase = (caseItem: ClinicalSampleCase) => {
    setSelectedCaseId(caseItem.id);
    setTranscript(caseItem.transcript);
    setChiefComplaint(caseItem.chiefComplaint);
    setPatientNameInput(caseItem.patientName);
    setPatientAge(String(caseItem.patientAge));
    setPatientGender(caseItem.patientGender);
    setDurationDays(caseItem.durationDays);
    setAllergies(caseItem.allergies);
    setPastHistory(caseItem.pastMedicalHistory);
    if (caseItem.vitals) {
      setBp(caseItem.vitals.bp);
      setPulse(String(caseItem.vitals.pulse));
      setTemp(String(caseItem.vitals.temp));
      setSpo2(String(caseItem.vitals.spo2));
    }
  };

  const handleGenerate = async () => {
    const cleanTranscript = transcript.trim();
    const cleanComplaint = chiefComplaint.trim();
    if (!cleanTranscript && !cleanComplaint) {
      setError('Please provide consultation dialogue, clinical notes, or a patient chief complaint.');
      return;
    }

    const payloadTranscript = cleanTranscript || `Clinical Consultation Notes:\nPatient: ${patientNameInput || 'Patient'}\nChief Complaint: ${cleanComplaint}\nDuration: ${durationDays} days\nMedical History: ${pastHistory}\nAllergies: ${allergies}`;

    setError(null);
    setIsGenerating(true);
    setGenerationStep('Analyzing consultation conversation...');

    try {
      // Step feedback animation
      setTimeout(() => setGenerationStep('Extracting clinical assessment & differential diagnosis...'), 800);
      setTimeout(() => setGenerationStep('Synthesizing prescription, dosage & follow-up directives...'), 1600);

      const response = await requestAIScribeReport({
        transcript: payloadTranscript,
        chiefComplaint: cleanComplaint,
        patientName: patientNameInput,
        patientAge: patientAge ? Number(patientAge) || patientAge : undefined,
        patientGender,
        durationDays,
        allergies,
        pastMedicalHistory: pastHistory,
        doctorName,
        visitType,
        existingVitals: {
          blood_pressure: bp,
          pulse_bpm: Number(pulse) || 80,
          temperature_f: Number(temp) || 99.4,
          spo2_percent: Number(spo2) || 98
        }
      });

      setGeneratedOutput(response.report);
      setSourceModel(response.source);

      // Dynamically sync any extracted fields from Gemini
      if (response.report.patient_name && response.report.patient_name !== 'Not documented') {
        setPatientNameInput(response.report.patient_name);
      }
      if (response.report.patient_age && response.report.patient_age !== 'Not documented') {
        setPatientAge(String(response.report.patient_age));
      }
      if (response.report.patient_gender && response.report.patient_gender !== 'Not documented') {
        setPatientGender(response.report.patient_gender);
      }
      if (response.report.duration_days && response.report.duration_days !== 'Not documented') {
        setDurationDays(String(response.report.duration_days));
      }
      if (response.report.allergies && response.report.allergies !== 'Not documented') {
        setAllergies(response.report.allergies);
      }
      if (response.report.past_medical_history && response.report.past_medical_history !== 'Not documented') {
        setPastHistory(response.report.past_medical_history);
      }
    } catch (err: any) {
      console.error('AI Report generation error:', err);
      setError(err.message || 'Unable to generate consultation report. Please check input dialogue.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApply = () => {
    if (!generatedOutput) return;

    // Convert PrescribedMedItem to PrescribedMedication
    const convertedMeds: PrescribedMedication[] = (generatedOutput.medications || []).map(m => ({
      name: m.name,
      dosage: m.dosage || '500mg',
      frequency: m.frequency || 'Twice daily',
      duration: m.duration || '5 days',
      instructions: m.instructions || 'Take after meals'
    }));

    const updated: ConsultationReport = {
      ...currentReport,
      patient_name: patientNameInput || generatedOutput.patient_name || currentReport.patient_name,
      diagnosis: generatedOutput.doctor_stated_diagnosis || generatedOutput.diagnosis || 'Clinical Consultation Evaluation',
      assessment_diagnosis: generatedOutput.diagnosis,
      chief_complaint: chiefComplaint || generatedOutput.chief_complaint,
      transcription_summary: generatedOutput.transcription_summary,
      transcript,
      patient_age: patientAge ? Number(patientAge) : currentReport.patient_age,
      patient_gender: patientGender,
      problem_duration_days: durationDays,
      allergies,
      medical_history: pastHistory,
      vitals: {
        blood_pressure: bp || generatedOutput.vitals?.bp || '120/80',
        pulse_bpm: Number(pulse) || (typeof generatedOutput.vitals?.pulse === 'number' ? generatedOutput.vitals?.pulse : 80),
        temperature_f: Number(temp) || 99.4,
        spo2_percent: Number(spo2) || (typeof generatedOutput.vitals?.spo2 === 'number' ? generatedOutput.vitals?.spo2 : 98),
        respiratory_rate: '16/min'
      },
      medications: convertedMeds.length > 0 ? convertedMeds : currentReport.medications,
      prescribed_medications: convertedMeds.length > 0 ? convertedMeds : currentReport.medications,
      advice: generatedOutput.doctor_stated_advice || generatedOutput.advice || currentReport.advice,
      follow_up_timeframe: generatedOutput.follow_up_timeframe || '5 Days',
      follow_up_instructions: generatedOutput.follow_up_instructions || generatedOutput.follow_up || 'Follow up if symptoms persist.',
      follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      red_flags: generatedOutput.red_flags || 'Seek immediate emergency care (Rescue 1122) if experiencing acute respiratory distress, severe chest pain, or altered mental status.'
    };

    onApplyReport(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="ai-scribe-generator-modal"
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <span>CuraLink AI Consultation Scribe</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  Gemini Clinical Engine
                </span>
              </h2>
              <p className="text-xs text-teal-200/80">
                Generate or refine your consultation report and prescription accordingly from patient dialogue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Quick Scenario Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>Encounter Dialogue / Sample Templates (Optional)</span>
              </label>
              <span className="text-[11px] text-gray-400">Optional test templates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  setSelectedCaseId('');
                  setTranscript(currentReport.transcript || currentReport.doctor_notes || '');
                  setChiefComplaint(currentReport.chief_complaint || '');
                  setPatientNameInput(patientName || currentReport.patient_name || '');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedCaseId === ''
                    ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600 shadow-2xs'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-[11px] truncate text-teal-900">Current Notes</p>
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-100/70 text-teal-800 rounded font-semibold">Active</span>
                </div>
                <p className="text-[10px] text-gray-600 truncate">Consultation encounter</p>
              </button>

              {SAMPLE_CLINICAL_CONVERSATIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedCaseId === c.id
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 ring-1 ring-teal-600 shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-[11px] truncate text-teal-900">{c.patientName}</p>
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-100/70 text-teal-800 rounded font-semibold">
                      {c.patientAge}y, {c.patientGender}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 truncate">{c.chiefComplaint}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Clinical Dialogue Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-gray-800 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                <span>Consultation Dialogue / Transcript</span>
                <span className="text-[10px] text-gray-400 font-normal">(Spoken between doctor & patient)</span>
              </label>
              <button
                onClick={() => setTranscript('')}
                className="text-[11px] text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                Clear text
              </button>
            </div>
            <textarea
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste or type clinical dialogue (e.g. Doctor: What brings you in? Patient: I have had high fever and sore throat for 3 days...)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white text-xs font-mono leading-relaxed"
            />
          </div>

          {/* Patient Context & Vitals Row */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-700" />
                <span>Patient Demographics & Vitals Context</span>
              </span>
              <span className="text-[10px] text-gray-500">Will be integrated into generated report</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Patient Name</label>
                <input
                  type="text"
                  value={patientNameInput}
                  onChange={(e) => setPatientNameInput(e.target.value)}
                  placeholder="e.g. Ahmad Khan"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Patient Age</label>
                <input
                  type="text"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Duration (Days)</label>
                <input
                  type="text"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-rose-600 block mb-0.5">Drug Allergies</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. None or Penicillin"
                  className="w-full p-2 bg-rose-50/50 border border-rose-200 text-rose-900 rounded-lg text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  placeholder="120/80"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Pulse (BPM)</label>
                <input
                  type="text"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  placeholder="78"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Temperature (°F)</label>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  placeholder="99.4"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Oxygen SpO2 (%)</label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  placeholder="98"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Trigger Generate Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              id="btn-generate-ai-report-modal"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-[#0F766E] hover:bg-[#0B5C56] text-white font-bold px-6 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{generationStep || 'Generating Clinical Report Accordingly...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Clinical Report Accordingly</span>
                </>
              )}
            </button>

            {generatedOutput && (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Generated via {sourceModel || 'Gemini AI'}</span>
              </span>
            )}
          </div>

          {/* Generated Report Preview Section */}
          {generatedOutput && (
            <div className="bg-teal-50/40 border-2 border-teal-200 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-teal-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-xs sm:text-sm">
                      AI Generated Clinical Report Preview
                    </h3>
                    <p className="text-[10px] text-teal-800">
                      Carefully synthesized according to the dialogue and clinical parameters.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleApply}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to Official Report</span>
                </button>
              </div>

              {/* Diagnosis & Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Clinical Diagnosis</span>
                  <p className="font-extrabold text-teal-950 text-xs leading-tight">
                    {generatedOutput.doctor_stated_diagnosis || generatedOutput.diagnosis}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Follow-up Timeframe</span>
                  <p className="font-bold text-emerald-800 text-xs">
                    {generatedOutput.follow_up_timeframe || 'Review in 5 Days'}
                  </p>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div className="bg-white p-3 rounded-xl border border-teal-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block flex items-center gap-1">
                  <Pill className="w-3 h-3 text-teal-600" />
                  <span>Prescribed Medications ({generatedOutput.medications?.length || 0})</span>
                </span>
                <div className="divide-y divide-gray-100">
                  {generatedOutput.medications?.map((m, idx) => (
                    <div key={idx} className="py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                      <span className="font-bold text-gray-900">{m.name}</span>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">{m.dosage}</span>
                        <span>{m.frequency}</span>
                        <span className="font-medium text-teal-800">({m.duration})</span>
                        <span className="italic text-gray-500">"{m.instructions}"</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="bg-white p-3 rounded-xl border border-teal-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Doctor's Care Plan & Advice</span>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {generatedOutput.doctor_stated_advice || generatedOutput.advice}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-gray-500 text-center sm:text-left">
            <span>Powered by CuraLink Clinical Intelligence • Verified by Attending Physician</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 font-semibold text-gray-700 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {generatedOutput && (
              <button
                onClick={handleApply}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 font-bold text-white text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Official Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
