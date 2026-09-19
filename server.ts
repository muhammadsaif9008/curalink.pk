import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generateClinicalConsultationReport, transcribeConsultationAudio } from './server/ai/geminiScribeService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Medical Consultation Scribe Endpoint
  app.post('/api/gemini/generate-consultation-report', async (req, res) => {
    try {
      const {
        transcript,
        patientName,
        patientAge,
        patientGender,
        durationDays,
        allergies,
        pastMedicalHistory,
        doctorName,
        visitType,
        existingVitals,
        doctorSpecialty
      } = req.body;

      let effectiveTranscript = typeof transcript === 'string' ? transcript.trim() : '';
      if (!effectiveTranscript && req.body.chiefComplaint) {
        effectiveTranscript = `Clinical Consultation Encounter Notes:\nPatient: ${patientName || 'Patient'}\nChief Complaint: ${req.body.chiefComplaint}\nDuration: ${durationDays || 'Not documented'}\nPast Medical History: ${pastMedicalHistory || 'Not documented'}\nAllergies: ${allergies || 'Not documented'}`;
      } else if (!effectiveTranscript) {
        return res.status(400).json({
          success: false,
          error: 'Please record or provide consultation dialogue to synthesize an AI report.'
        });
      }

      const result = await generateClinicalConsultationReport({
        transcript: effectiveTranscript,
        patientName,
        patientAge,
        patientGender,
        durationDays,
        allergies,
        pastMedicalHistory,
        doctorName,
        visitType,
        existingVitals,
        doctorSpecialty
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || 'Unable to generate the clinical report. Please try again.',
          details: result.rawDetails
        });
      }

      return res.json({
        success: true,
        source: result.modelUsed || 'gemini-3.8-flash',
        promptVersion: result.promptVersion,
        schemaVersion: result.schemaVersion,
        report: result.report
      });
    } catch (err: any) {
      console.error('API consultation report error:', err);
      return res.status(500).json({
        success: false,
        error: 'Unable to generate the clinical report. Please try again.',
        details: err.message || 'Internal server error'
      });
    }
  });

  // Multimodal Gemini Audio Transcription Endpoint for Doctor-Patient Scribing
  app.post('/api/gemini/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType, doctorName, patientName, existingTranscript } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ success: false, error: 'audioBase64 is required.' });
      }

      const result = await transcribeConsultationAudio({
        audioBase64,
        mimeType,
        doctorName,
        patientName,
        existingTranscript
      });

      return res.json(result);
    } catch (err: any) {
      console.error('Audio transcription error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to transcribe audio clip.',
        details: err.message || 'Internal server error'
      });
    }
  });

  // Real-time Voice / Chat Assistance using gemini-3.8-flash (Text & Voice Q&A Fallback)
  app.post('/api/gemini/voice-conversation', async (req, res) => {
    try {
      const { message, history, role, language } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
      }

      const systemInstruction = role === 'doctor'
        ? "You are CuraLink Doctor AI Assistant, providing rapid clinical differentials, PMC guideline references, and medication safety checks. Keep replies concise, professional, and directly actionable."
        : "You are CuraLink Voice AI, an empathetic, clinically verified medical assistant for patients in Pakistan. You provide clear triage guidance, explain medical symptoms, advise when to visit an ER (1122), and speak warmly in English or Urdu/Roman Urdu as requested. Keep spoken responses short (2-3 sentences), warm, and easy to understand.";

      let reply = '';
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: { 'User-Agent': 'aistudio-build' },
            },
          });

          const chatContents: any[] = [];
          if (Array.isArray(history)) {
            history.forEach((h: any) => {
              if (h.role && h.text) {
                chatContents.push({
                  role: h.role === 'user' ? 'user' : 'model',
                  parts: [{ text: h.text }]
                });
              }
            });
          }
          chatContents.push({
            role: 'user',
            parts: [{ text: message }]
          });

          const chatModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
          let usedModel = 'gemini-3.1-flash-lite';

          for (const model of chatModels) {
            try {
              const response = await ai.models.generateContent({
                model,
                contents: chatContents,
                config: {
                  systemInstruction,
                  temperature: 0.7,
                }
              });

              if (response.text) {
                reply = response.text;
                usedModel = model;
                break;
              }
            } catch (modelErr: any) {
              console.warn(`Voice conversation with ${model} failed:`, modelErr?.message);
            }
          }
        } catch (apiErr: any) {
          console.warn('Gemini conversation call failed:', apiErr?.message);
        }
      }

      if (!reply) {
        reply = `Hello, I hear your concern about "${message.slice(0, 40)}". I am your CuraLink health assistant. If your symptoms are severe (e.g. chest pain, breathing difficulty, or confusion), please contact Rescue 1122 or visit an emergency hospital immediately. Otherwise, please schedule a video consult or home visit with our PMC-verified doctors.`;
      }

      return res.json({
        success: true,
        reply,
        model: 'gemini-3.8-flash'
      });
    } catch (err: any) {
      console.error('API voice conversation error:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // 404 fallback for unmatched /api routes - guarantees JSON, never HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.path}`
    });
  });

  // Global error handler for /api routes - guarantees JSON responses on payload size or parsing errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('[API error handler]:', err?.message || err);
      const status = err.status || err.statusCode || (err.type === 'entity.too.large' ? 413 : 500);
      return res.status(status).json({
        success: false,
        error: err.type === 'entity.too.large'
          ? 'Audio file is too large for a single upload. Please speak in shorter intervals.'
          : (err.message || 'API request error')
      });
    }
    next(err);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
