import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { User, ConsultationReport, Booking, MedicalNote } from '../types';

export const firestoreService = {
  // Save or update user profile
  async saveUserProfile(user: User): Promise<void> {
    if (!auth.currentUser) return;
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.name || 'User',
        role: user.role || 'patient',
        phoneNumber: user.phone || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Fetch user profile
  async getUserProfile(uid: string): Promise<any | null> {
    if (!auth.currentUser) return null;
    const path = `users/${uid}`;
    try {
      const userRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Save consultation report
  async saveConsultation(report: ConsultationReport): Promise<void> {
    if (!auth.currentUser) return;
    const path = `consultations/${report.id}`;
    try {
      const consultationRef = doc(db, 'consultations', report.id);
      await setDoc(consultationRef, {
        id: report.id,
        bookingId: report.booking_id || '',
        patientId: report.patient_uid || report.patient_id || auth.currentUser?.uid || 'anonymous',
        patientName: report.patient_name || 'Patient',
        doctorId: report.doctor_uid || report.doctor_id || auth.currentUser?.uid || 'doctor',
        doctorName: report.doctor_name || 'Dr. Ayesha Tariq',
        doctorPmc: report.doctor_pmc || 'PMC-48291-P',
        date: report.date || new Date().toISOString().split('T')[0],
        type: report.mode || 'scribe',
        status: report.is_signed ? 'completed' : 'in-progress',
        transcript: report.transcript || '',
        diagnosis: report.diagnosis || report.assessment_diagnosis || 'Clinical Assessment Pending',
        chiefComplaint: report.chief_complaint || '',
        historyOfIllness: report.history_of_illness || '',
        advice: report.advice || '',
        redFlags: report.red_flags || '',
        followUp: report.follow_up || '',
        vitals: report.vitals || null,
        examinationFindings: report.examination_findings || '',
        medications: report.prescribed_medications || [],
        doctorSignature: report.doctor_signature || null,
        isSigned: Boolean(report.is_signed),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to real-time consultations
  subscribeConsultations(
    userId: string,
    role: 'patient' | 'doctor',
    callback: (reports: ConsultationReport[]) => void
  ): () => void {
    const path = 'consultations';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const field = role === 'doctor' ? 'doctorId' : 'patientId';
      const effectiveUid = auth.currentUser.uid;
      const q = query(collection(db, 'consultations'), where(field, '==', effectiveUid));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: ConsultationReport[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              booking_id: data.bookingId || '',
              patient_uid: data.patientId,
              patient_name: data.patientName,
              doctor_uid: data.doctorId,
              doctor_name: data.doctorName,
              doctor_pmc: data.doctorPmc,
              date: data.date,
              mode: data.type,
              status: data.status,
              diagnosis: data.diagnosis,
              assessment_diagnosis: data.diagnosis,
              chief_complaint: data.chiefComplaint,
              history_of_illness: data.historyOfIllness,
              advice: data.advice,
              red_flags: data.redFlags,
              follow_up: data.followUp,
              transcript: data.transcript,
              vitals: data.vitals,
              examination_findings: data.examinationFindings,
              medications: data.medications || [],
              prescribed_medications: data.medications || [],
              doctor_signature: data.doctorSignature,
              is_signed: data.isSigned
            });
          });
          callback(list);
        },
        (error) => {
          console.warn(`Firestore real-time sync [${path}] paused:`, error?.message || error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.warn(`Firestore subscription failed [${path}]:`, error);
      return () => {};
    }
  },

  // Save booking / appointment
  async saveBooking(booking: Booking): Promise<void> {
    if (!auth.currentUser) return;
    const path = `appointments/${booking.id}`;
    try {
      const apptRef = doc(db, 'appointments', booking.id);
      await setDoc(apptRef, {
        id: booking.id,
        patientId: booking.patient_uid || booking.patient_id || auth.currentUser?.uid || 'patient',
        patientName: booking.patient_name || 'Patient',
        doctorId: booking.doctor_uid || booking.doctor_id || 'doctor',
        doctorName: booking.doctor_name || 'Dr. Ayesha Tariq',
        doctorSpecialty: booking.doctor_specialty || 'General Physician',
        date: booking.date || booking.scheduled_date || new Date().toISOString().split('T')[0],
        time: booking.time_slot || booking.scheduled_time || '10:00 AM',
        type: booking.mode || booking.type || 'video',
        status: booking.status || 'confirmed',
        fee: booking.fee || booking.total_amount || 1500,
        notes: booking.notes || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to appointments
  subscribeBookings(
    userId: string,
    role: 'patient' | 'doctor',
    callback: (bookings: Booking[]) => void
  ): () => void {
    const path = 'appointments';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const field = role === 'doctor' ? 'doctorId' : 'patientId';
      const effectiveUid = auth.currentUser.uid;
      const q = query(collection(db, 'appointments'), where(field, '==', effectiveUid));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Booking[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              patient_uid: data.patientId,
              patient_name: data.patientName,
              doctor_uid: data.doctorId,
              doctor_name: data.doctorName,
              doctor_specialty: data.doctorSpecialty,
              date: data.date,
              scheduled_date: data.date,
              time_slot: data.time,
              scheduled_time: data.time,
              mode: data.type,
              type: data.type,
              status: data.status,
              fee: data.fee,
              notes: data.notes,
              created_at: data.updatedAt || new Date().toISOString()
            });
          });
          callback(list);
        },
        (error) => {
          console.warn(`Firestore real-time sync [${path}] paused:`, error?.message || error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.warn(`Firestore subscription failed [${path}]:`, error);
      return () => {};
    }
  },

  // Save or update medical note
  async saveMedicalNote(note: MedicalNote): Promise<void> {
    if (!auth.currentUser) return;
    const path = `medical_notes/${note.id}`;
    try {
      const noteRef = doc(db, 'medical_notes', note.id);
      await setDoc(noteRef, {
        id: note.id,
        patientId: note.patient_uid,
        patientName: note.patient_name || 'Patient',
        authorId: note.author_uid || auth.currentUser.uid,
        authorName: note.author_name || 'Healthcare Practitioner',
        authorRole: note.author_role || 'doctor',
        authorPmc: note.author_pmc || '',
        title: note.title,
        category: note.category,
        content: note.content,
        priority: note.priority,
        vitals: note.vitals || null,
        leaveDetails: note.leave_details || null,
        patientCnic: note.patient_cnic || note.leave_details?.patient_cnic || '',
        tags: note.tags || [],
        isPinned: Boolean(note.is_pinned),
        bookingId: note.booking_id || '',
        createdAt: note.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete medical note
  async deleteMedicalNote(noteId: string): Promise<void> {
    if (!auth.currentUser) return;
    const path = `medical_notes/${noteId}`;
    try {
      const noteRef = doc(db, 'medical_notes', noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Subscribe to medical notes for user (patient or doctor)
  subscribeMedicalNotes(
    userId: string,
    role: 'patient' | 'doctor',
    callback: (notes: MedicalNote[]) => void
  ): () => void {
    const path = 'medical_notes';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const field = role === 'doctor' ? 'authorId' : 'patientId';
      const effectiveUid = auth.currentUser.uid;
      const q = query(collection(db, 'medical_notes'), where(field, '==', effectiveUid));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: MedicalNote[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              patient_uid: data.patientId,
              patient_name: data.patientName,
              patient_cnic: data.patientCnic,
              author_uid: data.authorId,
              author_name: data.authorName,
              author_role: data.authorRole || 'doctor',
              author_pmc: data.authorPmc,
              title: data.title,
              category: data.category,
              content: data.content,
              priority: data.priority,
              vitals: data.vitals,
              leave_details: data.leaveDetails,
              tags: data.tags || [],
              is_pinned: Boolean(data.isPinned),
              booking_id: data.bookingId,
              created_at: data.createdAt || new Date().toISOString(),
              updated_at: data.updatedAt
            });
          });
          callback(list);
        },
        (error) => {
          console.warn(`Firestore real-time sync [${path}] paused:`, error?.message || error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.warn(`Firestore subscription failed [${path}]:`, error);
      return () => {};
    }
  }
};
