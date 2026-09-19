import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  PatientProfile,
  DoctorProfile,
  Booking,
  ConsultationReport,
  MedicalHistoryItem,
  NotificationItem,
  SymptomCheckSession,
  SymptomCheckResult,
  Payment,
  UserRole,
  MedicalNote,
  MedicalNoteRequest,
  NurseParamedicProfile
} from '../types';
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENT,
  INITIAL_BOOKINGS,
  INITIAL_REPORTS,
  INITIAL_MEDICAL_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEDICAL_NOTES,
  INITIAL_MEDICAL_NOTE_REQUESTS,
  INITIAL_NURSES_PARAMEDICS
} from '../data/seedData';
import {
  auth,
  googleProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser
} from '../lib/firebase';
import { firestoreService } from '../services/firestoreService';

interface AppContextType {
  // Navigation
  currentPath: string;
  currentRoute: string;
  navigate: (path: string) => void;
  searchParams: Record<string, string>;

  // Authentication & Users
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isFirebaseAuthLoading: boolean;
  patientProfile: PatientProfile;
  doctorProfile: DoctorProfile;
  doctors: DoctorProfile[];
  allDoctors: DoctorProfile[];
  nursesParamedics: NurseParamedicProfile[];
  toggleDoctorAvailability: (isAvailable: boolean) => void;
  
  // State methods
  loginAs: (role: 'patient' | 'doctor', status?: 'approved' | 'pending' | 'rejected' | 'new') => void;
  loginWithGoogle: (role?: 'patient' | 'doctor') => Promise<{ success: boolean; error?: string }>;
  registerPatient: (data: { name: string; phone: string; email?: string; password?: string }) => void;
  registerDoctor: (data: { name: string; phone: string; email: string; password?: string; pmcLicense: string; specialty?: string }) => void;
  loginWithCredentials: (identifier: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  updatePatientProfile: (updates: Partial<PatientProfile>) => void;
  updateDoctorProfile: (updates: Partial<DoctorProfile>) => void;
  completePatientOnboarding: () => void;
  completeDoctorOnboarding: () => void;

  // Bookings & Consultations
  bookings: Booking[];
  currentBookingId: string | null;
  setCurrentBookingId: (id: string | null) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Booking;
  updateBookingStatus: (bookingId: string, status: Booking['status'], driverStatus?: Booking['driver_status']) => void;
  cancelBooking: (bookingId: string) => void;

  // Payments
  payments: Payment[];
  processPayment: (bookingId: string, method: 'jazzcash' | 'easypaisa' | 'card') => Promise<boolean>;

  // Reports & History
  reports: ConsultationReport[];
  consultationReports: ConsultationReport[];
  signReport: (reportId: string, doctorName?: string) => void;
  signConsultationReport: (reportId: string, doctorName?: string) => void;
  updateConsultationReport: (report: ConsultationReport) => void;
  saveConsultationReport: (report: ConsultationReport) => void;
  addMedicalHistory: (item: Omit<MedicalHistoryItem, 'id'>) => void;
  medicalHistory: MedicalHistoryItem[];

  // Medical Notes
  medicalNotes: MedicalNote[];
  addMedicalNote: (note: Omit<MedicalNote, 'id' | 'created_at'>) => MedicalNote;
  updateMedicalNote: (id: string, updates: Partial<MedicalNote>) => void;
  deleteMedicalNote: (id: string) => void;
  togglePinMedicalNote: (id: string) => void;

  // Medical Note Requests (Patient -> Doctor Workflow)
  medicalNoteRequests: MedicalNoteRequest[];
  addMedicalNoteRequest: (req: Omit<MedicalNoteRequest, 'id' | 'created_at' | 'status'>) => MedicalNoteRequest;
  respondToMedicalNoteRequest: (requestId: string, status: 'approved' | 'rejected', remarks?: string, issuedNoteId?: string) => void;

  // Triage & Symptoms
  activeSymptomSession: SymptomCheckSession | null;
  setActiveSymptomSession: (session: SymptomCheckSession | null) => void;
  lastSymptomResult: SymptomCheckResult | null;
  setLastSymptomResult: (result: SymptomCheckResult | null) => void;
  saveSymptomResultToProfile: (result: SymptomCheckResult) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Language toggle (Urdu/English)
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;

  // Masking helpers
  maskCnic: (cnic?: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let globalIdCounter = 0;
export const generateUniqueId = (prefix: string = 'id'): string => {
  globalIdCounter = (globalIdCounter + 1) % 1000000;
  return `${prefix}_${Date.now()}_${globalIdCounter}_${Math.random().toString(36).substring(2, 7)}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '/' ? path : '/';
    }
    return '/';
  });

  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      const params = new URLSearchParams(window.location.search);
      const obj: Record<string, string> = {};
      params.forEach((v, k) => { obj[k] = v; });
      setSearchParams(obj);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (!path || typeof path !== 'string') return;
    // Parse query params if any
    let cleanPath = path;
    let params: Record<string, string> = {};
    if (path.includes('?')) {
      const [p, q] = path.split('?');
      cleanPath = p || '/';
      const search = new URLSearchParams(q || '');
      search.forEach((v, k) => { params[k] = v; });
    }

    setSearchParams(params);
    setCurrentPath(cleanPath);

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Profiles
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('curalink_patient_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PATIENT;
  });

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthLoading, setIsFirebaseAuthLoading] = useState<boolean>(true);

  // Auth User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('curalink_user');
    const savedProfile = localStorage.getItem('curalink_patient_profile');
    let profileName = '';
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        if (p?.name) profileName = p.name;
      } catch (e) { console.error(e); }
    }

    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.role === 'patient' && profileName && parsed.name !== profileName) {
          parsed.name = profileName;
        }
        return parsed;
      } catch (e) { console.error(e); }
    }
    // Default demo authenticated as Patient
    return {
      uid: 'patient_demo',
      name: profileName || 'Zainab Ahmed',
      phone: '0300-4829103',
      email: 'zainab.ahmed@example.com',
      role: 'patient',
      cnic: '35201-8291048-2',
      onboarding_completed: true,
      created_at: '2026-06-15'
    };
  });

  const [allDoctors, setAllDoctors] = useState<DoctorProfile[]>(() => {
    const saved = localStorage.getItem('curalink_doctors');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed.map((d: DoctorProfile) => {
          const seedMatch = INITIAL_DOCTORS.find(s => s.uid === (d.id || d.uid));
          return {
            ...d,
            id: d.id || d.uid,
            offers_home_visit: d.offers_home_visit ?? seedMatch?.offers_home_visit ?? false,
            home_visit_fee: d.home_visit_fee || seedMatch?.home_visit_fee || 1800,
            home_visit_radius_km: d.home_visit_radius_km || seedMatch?.home_visit_radius_km || 15
          };
        });
      } catch (e) { console.error(e); }
    }
    return INITIAL_DOCTORS.map(d => ({ ...d, id: d.id || d.uid }));
  });

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(() => {
    return allDoctors[0]; // Dr. Ayesha Tariq
  });

  // Registered Users Persistent Database
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('curalink_registered_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        uid: 'patient_demo',
        name: 'Zainab Ahmed',
        phone: '0300-4829103',
        email: 'zainab.ahmed@example.com',
        role: 'patient',
        cnic: '35201-8291048-2',
        onboarding_completed: true,
        created_at: '2026-06-15'
      },
      {
        uid: 'doc_1',
        name: 'Dr. Ayesha Tariq',
        phone: '0301-4433221',
        email: 'ayesha.tariq@curalink.pk',
        role: 'doctor',
        onboarding_completed: true,
        created_at: '2026-04-10'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('curalink_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Last Symptom Check Result
  const [lastSymptomResult, setLastSymptomResult] = useState<SymptomCheckResult | null>(() => {
    const saved = localStorage.getItem('curalink_last_symptom_result');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return null;
  });

  // Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('curalink_bookings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_BOOKINGS;
  });

  const [currentBookingId, setCurrentBookingId] = useState<string | null>('bk_101');

  // Reports
  const [reports, setReports] = useState<ConsultationReport[]>(() => {
    const saved = localStorage.getItem('curalink_reports');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_REPORTS;
  });

  // Medical History
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>(() => {
    const saved = localStorage.getItem('curalink_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MEDICAL_HISTORY;
  });

  // Medical Notes
  const [medicalNotes, setMedicalNotes] = useState<MedicalNote[]>(() => {
    const saved = localStorage.getItem('curalink_medical_notes');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasLeave = parsed.some((n: MedicalNote) => n.category === 'medical_leave');
          if (!hasLeave) {
            return [...INITIAL_MEDICAL_NOTES.filter(n => n.category === 'medical_leave'), ...parsed];
          }
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_MEDICAL_NOTES;
  });

  // Patient -> Doctor Medical Note Requests
  const [medicalNoteRequests, setMedicalNoteRequests] = useState<MedicalNoteRequest[]>(() => {
    const saved = localStorage.getItem('curalink_medical_note_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MEDICAL_NOTE_REQUESTS;
  });

  // Notifications with guaranteed unique ID deduplication
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('curalink_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          return parsed.map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            let id = item.id;
            if (!id || seenIds.has(id)) {
              id = `notif_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;
            }
            seenIds.add(id);
            return { ...item, id };
          }).filter(Boolean) as NotificationItem[];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Active Triage
  const [activeSymptomSession, setActiveSymptomSession] = useState<SymptomCheckSession | null>(null);

  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);

  // Language
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  // Persistence effects
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('curalink_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('curalink_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('curalink_patient_profile', JSON.stringify(patientProfile));
    if (currentUser?.role === 'patient' && patientProfile?.name && currentUser.name !== patientProfile.name) {
      setCurrentUser(prev => prev ? { ...prev, name: patientProfile.name } : null);
    }
  }, [patientProfile, currentUser?.role, currentUser?.name]);

  useEffect(() => {
    localStorage.setItem('curalink_doctors', JSON.stringify(allDoctors));
  }, [allDoctors]);

  useEffect(() => {
    localStorage.setItem('curalink_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('curalink_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('curalink_history', JSON.stringify(medicalHistory));
  }, [medicalHistory]);

  useEffect(() => {
    localStorage.setItem('curalink_medical_notes', JSON.stringify(medicalNotes));
  }, [medicalNotes]);

  useEffect(() => {
    localStorage.setItem('curalink_medical_note_requests', JSON.stringify(medicalNoteRequests));
  }, [medicalNoteRequests]);

  useEffect(() => {
    localStorage.setItem('curalink_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (lastSymptomResult) {
      localStorage.setItem('curalink_last_symptom_result', JSON.stringify(lastSymptomResult));
    } else {
      localStorage.removeItem('curalink_last_symptom_result');
    }
  }, [lastSymptomResult]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsFirebaseAuthLoading(false);
      if (fbUser) {
        try {
          const profile = await firestoreService.getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(prev => ({
              uid: fbUser.uid,
              name: profile.displayName || fbUser.displayName || 'User',
              email: fbUser.email || '',
              phone: profile.phoneNumber || fbUser.phoneNumber || '0300-1234567',
              role: (profile.role as UserRole) || 'patient',
              onboarding_completed: true,
              created_at: profile.updatedAt || new Date().toISOString()
            }));
          }
        } catch (e) {
          console.warn('Could not read user profile from Firestore on auth change:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore synchronization for consultations and bookings
  useEffect(() => {
    // Only subscribe to Firestore if the user is authenticated with Firebase Auth
    if (!firebaseUser || !auth.currentUser) return;

    const currentUid = auth.currentUser.uid;
    const role = currentUser?.role === 'doctor' ? 'doctor' : 'patient';

    const unsubConsultations = firestoreService.subscribeConsultations(
      currentUid,
      role,
      (remoteReports) => {
        if (remoteReports && remoteReports.length > 0) {
          setReports(prev => {
            const combined = [...remoteReports];
            for (const r of prev) {
              if (!combined.some(c => c.id === r.id)) {
                combined.push(r);
              }
            }
            return combined;
          });
        }
      }
    );

    const unsubBookings = firestoreService.subscribeBookings(
      currentUid,
      role,
      (remoteBookings) => {
        if (remoteBookings && remoteBookings.length > 0) {
          setBookings(prev => {
            const combined = [...remoteBookings];
            for (const b of prev) {
              if (!combined.some(c => c.id === b.id)) {
                combined.push(b);
              }
            }
            return combined;
          });
        }
      }
    );

    const unsubMedicalNotes = firestoreService.subscribeMedicalNotes(
      currentUid,
      role,
      (remoteNotes) => {
        if (remoteNotes && remoteNotes.length > 0) {
          setMedicalNotes(prev => {
            const combined = [...remoteNotes];
            for (const n of prev) {
              if (!combined.some(c => c.id === n.id)) {
                combined.push(n);
              }
            }
            return combined;
          });
        }
      }
    );

    return () => {
      if (unsubConsultations) unsubConsultations();
      if (unsubBookings) unsubBookings();
      if (unsubMedicalNotes) unsubMedicalNotes();
    };
  }, [firebaseUser, currentUser?.role]);

  // Login as demo personas
  const loginAs = (role: 'patient' | 'doctor', status: 'approved' | 'pending' | 'rejected' | 'new' = 'approved') => {
    if (role === 'patient') {
      if (status === 'new') {
        const newUser: User = {
          uid: 'patient_new_' + Date.now(),
          name: 'Ahmed Raza',
          phone: '0321-9876543',
          email: 'ahmed.raza@example.com',
          role: 'patient',
          cnic: '35202-1234567-1',
          onboarding_completed: false,
          created_at: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(newUser);
        setPatientProfile(prev => ({
          ...prev,
          uid: newUser.uid,
          onboarding_step: 1,
          has_completed_first_symptom_check: false
        }));
        navigate('/onboarding/patient');
        return;
      }

      // Existing fully completed patient
      const patientUser: User = {
        uid: 'patient_demo',
        name: patientProfile?.name || 'Zainab Ahmed',
        phone: patientProfile?.phone || '0300-4829103',
        email: 'zainab.ahmed@example.com',
        role: 'patient',
        cnic: patientProfile?.cnic || '35201-8291048-2',
        onboarding_completed: true,
        created_at: '2026-06-15'
      };
      setCurrentUser(patientUser);
      navigate('/dashboard/patient');
    } else {
      // Doctor role
      if (status === 'pending') {
        const pendingDoc = allDoctors.find(d => d.uid === 'doc_pending_demo') || allDoctors[0];
        const pendingUser: User = {
          uid: pendingDoc.uid,
          name: pendingDoc.name,
          phone: '0333-5551234',
          email: 'kamran.ortho@example.com',
          role: 'doctor',
          onboarding_completed: true,
          created_at: '2026-09-01'
        };
        setCurrentUser(pendingUser);
        setDoctorProfile(pendingDoc);
        navigate('/dashboard/doctor');
        return;
      }

      if (status === 'rejected') {
        const rejectedDoc: DoctorProfile = {
          ...allDoctors[0],
          uid: 'doc_rejected',
          name: 'Dr. Tariq Mahmood',
          verification_status: 'rejected',
          pmc_license_number: 'PMC-00129-REJ'
        };
        const rejectedUser: User = {
          uid: rejectedDoc.uid,
          name: rejectedDoc.name,
          phone: '0345-9876543',
          email: 'tariq.m@example.com',
          role: 'doctor',
          onboarding_completed: true,
          created_at: '2026-08-01'
        };
        setCurrentUser(rejectedUser);
        setDoctorProfile(rejectedDoc);
        navigate('/dashboard/doctor');
        return;
      }

      if (status === 'new') {
        const newDocUser: User = {
          uid: 'doc_new_' + Date.now(),
          name: 'Dr. Shahbaz Ali',
          phone: '0312-3344556',
          email: 'shahbaz.ali@example.com',
          role: 'doctor',
          onboarding_completed: false,
          created_at: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(newDocUser);
        navigate('/onboarding/doctor');
        return;
      }

      // Approved Doctor (Dr. Ayesha Tariq)
      const approvedDoc = allDoctors[0];
      const docUser: User = {
        uid: approvedDoc.uid,
        name: approvedDoc.name,
        phone: '0301-4433221',
        email: 'ayesha.tariq@curalink.pk',
        role: 'doctor',
        onboarding_completed: true,
        created_at: '2026-04-10'
      };
      setCurrentUser(docUser);
      setDoctorProfile(approvedDoc);
      navigate('/dashboard/doctor');
    }
  };

  const registerPatient = (data: { name: string; phone: string; email?: string; password?: string }) => {
    const newUid = 'patient_' + Date.now();
    const cleanName = data.name.trim();
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email?.trim() || `${cleanPhone.replace(/[^0-9]/g, '')}@curalink.pk`;
    const cleanPassword = data.password || 'password123';
    const cleanCnic = '35202-' + Math.floor(1000000 + Math.random() * 9000000) + '-1';

    const newUser: User = {
      uid: newUid,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      password: cleanPassword,
      role: 'patient',
      cnic: cleanCnic,
      onboarding_completed: true,
      created_at: new Date().toISOString().split('T')[0]
    };

    const updatedProfile: PatientProfile = {
      uid: newUid,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      cnic: cleanCnic,
      dob: '1996-05-12',
      gender: '',
      city: 'Lahore',
      blood_group: '',
      emergency_contact: {
        name: '',
        relationship: '',
        phone: ''
      },
      addresses: [
        {
          id: 'addr_' + Date.now(),
          label: 'Home',
          street: 'Main Boulevard, Gulberg',
          area: 'Gulberg III',
          city: 'Lahore',
          is_default: true
        }
      ],
      onboarding_step: 3,
      has_completed_first_symptom_check: false,
      known_conditions: [],
      allergies: [],
      current_medications: [],
      past_surgeries: []
    };

    const updatedUsers = [
      ...registeredUsers.filter(u => u.email?.toLowerCase() !== cleanEmail.toLowerCase() && u.phone !== cleanPhone),
      newUser
    ];

    setRegisteredUsers(updatedUsers);
    setPatientProfile(updatedProfile);
    setCurrentUser(newUser);

    try {
      localStorage.setItem('curalink_registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem(`curalink_patient_profile_${newUid}`, JSON.stringify(updatedProfile));
      localStorage.setItem('curalink_patient_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('curalink_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }

    // Directly land into Patient Portal with the new registered patient's name
    navigate('/dashboard/patient');
  };

  const registerDoctor = (data: { name: string; phone: string; email: string; password?: string; pmcLicense: string; specialty?: string }) => {
    const newUid = 'doc_' + Date.now();
    const formattedName = data.name.trim().startsWith('Dr.') ? data.name.trim() : `Dr. ${data.name.trim()}`;
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim();
    const cleanPmc = data.pmcLicense.trim().toUpperCase();
    const cleanPassword = data.password || 'password123';

    const newUser: User = {
      uid: newUid,
      name: formattedName,
      phone: cleanPhone,
      email: cleanEmail,
      password: cleanPassword,
      role: 'doctor',
      onboarding_completed: true,
      created_at: new Date().toISOString().split('T')[0]
    };

    const newDocProfile: DoctorProfile = {
      id: newUid,
      uid: newUid,
      name: formattedName,
      photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      pmc_license_number: cleanPmc,
      verification_status: 'approved',
      specialty: data.specialty || 'General Physician & Family Medicine',
      qualifications: 'MBBS, PMC Certified',
      experience_years: 6,
      hospital_affiliation: 'CuraLink Health Network, Lahore',
      bio: `${formattedName} is a PMC-verified practitioner providing comprehensive telehealth and home visits.`,
      city: 'Lahore',
      offers_video: true,
      offers_home_visit: true,
      home_visit_radius_km: 15,
      video_fee: 1500,
      home_visit_fee: 3000,
      rating: 5.0,
      reviews_count: 1,
      is_available: true,
      availability: {
        monday: { enabled: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        tuesday: { enabled: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        wednesday: { enabled: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        thursday: { enabled: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        friday: { enabled: true, slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'] },
        saturday: { enabled: true, slots: ['10:00 AM', '01:00 PM'] },
        sunday: { enabled: false, slots: [] }
      }
    };

    const updatedUsers = [
      ...registeredUsers.filter(u => u.email?.toLowerCase() !== cleanEmail.toLowerCase() && u.phone !== cleanPhone),
      newUser
    ];
    const updatedDocs = [newDocProfile, ...allDoctors.filter(d => d.uid !== newUid)];

    setRegisteredUsers(updatedUsers);
    setAllDoctors(updatedDocs);
    setDoctorProfile(newDocProfile);
    setCurrentUser(newUser);

    try {
      localStorage.setItem('curalink_registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem('curalink_doctors', JSON.stringify(updatedDocs));
      localStorage.setItem('curalink_user', JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }

    // Directly land into Doctor Portal with the new doctor's name & credentials
    navigate('/dashboard/doctor');
  };

  const loginWithCredentials = (identifier: string, password?: string): { success: boolean; error?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanId = identifier.replace(/[^0-9]/g, '');

    if (!trimmed) {
      return { success: false, error: 'Please enter your phone number or email.' };
    }

    // 1. Check in registeredUsers database
    const matched = registeredUsers.find(u => 
      (u.email && u.email.toLowerCase() === trimmed) ||
      (cleanId && u.phone && u.phone.replace(/[^0-9]/g, '') === cleanId) ||
      (u.name && u.name.toLowerCase() === trimmed)
    );

    if (matched) {
      // Validate password if user has a set password and password was entered
      if (password && matched.password && matched.password !== password) {
        return { success: false, error: 'Incorrect password. Please double check your credentials and try again.' };
      }

      setCurrentUser(matched);
      try {
        localStorage.setItem('curalink_user', JSON.stringify(matched));
      } catch (e) {}

      if (matched.role === 'doctor') {
        const doc = allDoctors.find(d => d.uid === matched.uid || d.id === matched.uid) || allDoctors[0];
        setDoctorProfile(doc);
        navigate('/dashboard/doctor');
      } else {
        // Load this registered patient's profile
        const savedProfile = localStorage.getItem(`curalink_patient_profile_${matched.uid}`);
        if (savedProfile) {
          try {
            setPatientProfile(JSON.parse(savedProfile));
          } catch (e) {
            setPatientProfile(prev => ({ ...prev, uid: matched.uid, name: matched.name, phone: matched.phone, email: matched.email }));
          }
        } else {
          setPatientProfile(prev => ({
            ...prev,
            uid: matched.uid,
            name: matched.name,
            phone: matched.phone,
            email: matched.email,
            allergies: [],
            known_conditions: [],
            current_medications: []
          }));
        }
        navigate('/dashboard/patient');
      }
      return { success: true };
    }

    // 2. Check in allDoctors
    const docMatch = allDoctors.find(d => 
      (d.email && d.email.toLowerCase() === trimmed) ||
      (cleanId && d.phone && d.phone.replace(/[^0-9]/g, '') === cleanId) ||
      (d.pmc_license_number && d.pmc_license_number.toLowerCase() === trimmed) ||
      (d.name && d.name.toLowerCase().includes(trimmed))
    );

    if (docMatch) {
      const docUser: User = {
        uid: docMatch.uid,
        name: docMatch.name,
        phone: docMatch.phone || '0301-4433221',
        email: docMatch.email || `${trimmed}@curalink.pk`,
        role: 'doctor',
        onboarding_completed: true,
        created_at: '2026-04-10'
      };
      setCurrentUser(docUser);
      setDoctorProfile(docMatch);
      try {
        localStorage.setItem('curalink_user', JSON.stringify(docUser));
      } catch (e) {}
      navigate('/dashboard/doctor');
      return { success: true };
    }

    // No user found in database
    return { 
      success: false, 
      error: 'No account registered with this email or phone number. Please check your credentials or create a new account.' 
    };
  };

  // Google Sign-In with Firebase Auth & Firestore
  const loginWithGoogle = async (targetRole?: 'patient' | 'doctor'): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;

      let existingDoc = null;
      try {
        existingDoc = await firestoreService.getUserProfile(fbUser.uid);
      } catch (e) {
        console.warn('Could not read existing profile from Firestore:', e);
      }

      const role: UserRole = existingDoc?.role || targetRole || (fbUser.email === 'bismanadeem566@gmail.com' ? 'doctor' : 'patient');
      const name = existingDoc?.displayName || fbUser.displayName || (role === 'doctor' ? 'Dr. Physician' : 'Patient');

      const userObj: User = {
        uid: fbUser.uid,
        name,
        email: fbUser.email || '',
        phone: existingDoc?.phoneNumber || fbUser.phoneNumber || '0300-1234567',
        role,
        onboarding_completed: true,
        created_at: existingDoc?.updatedAt || new Date().toISOString()
      };

      setCurrentUser(userObj);
      await firestoreService.saveUserProfile(userObj).catch(err => console.warn('User profile write error:', err));

      if (role === 'doctor') {
        const docRecord: DoctorProfile = {
          ...doctorProfile,
          uid: fbUser.uid,
          id: fbUser.uid,
          name: userObj.name,
          photo_url: fbUser.photoURL || doctorProfile.photo_url
        };
        setDoctorProfile(docRecord);
        setAllDoctors(prev => [docRecord, ...prev.filter(d => d.uid !== fbUser.uid)]);
        navigate('/dashboard/doctor');
      } else {
        setPatientProfile(prev => ({
          ...prev,
          uid: fbUser.uid,
          name: userObj.name,
          email: fbUser.email || prev.email,
          phone: userObj.phone || prev.phone
        }));
        navigate('/dashboard/patient');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      return { success: false, error: error?.message || 'Google sign-in could not be completed.' };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setCurrentUser(null);
    navigate('/login');
  };

  const updatePatientProfile = (updates: Partial<PatientProfile>) => {
    const newName = updates.name !== undefined ? updates.name.trim() : undefined;

    setPatientProfile(prev => {
      const updated = { 
        ...prev, 
        ...updates,
        ...(newName !== undefined ? { name: newName || prev.name } : {})
      };
      try {
        localStorage.setItem('curalink_patient_profile', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Immediately synchronize currentUser so Header, mobile menu, and user chips update everywhere
    if (newName || updates.phone) {
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = {
          ...prevUser,
          ...(newName ? { name: newName } : {}),
          ...(updates.phone ? { phone: updates.phone } : {})
        };
        try {
          localStorage.setItem('curalink_user', JSON.stringify(updatedUser));
        } catch (e) {
          console.error(e);
        }
        return updatedUser;
      });
    }

    // Synchronize bookings so patient_name matches the new name across all booking and consultation views
    if (newName) {
      setBookings(prevBookings => {
        const updated = prevBookings.map(b => {
          // If booking belongs to current patient or demo patient
          if (!b.patient_uid || b.patient_uid === 'patient_demo' || b.patient_uid === currentUser?.uid || b.patient_name === 'Zainab Ahmed' || !b.patient_name) {
            return { ...b, patient_name: newName };
          }
          return b;
        });
        try {
          localStorage.setItem('curalink_bookings', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      // Synchronize consultation reports
      setReports(prevReports => {
        const updated = prevReports.map(r => {
          if (!r.patient_uid || r.patient_uid === 'patient_demo' || r.patient_uid === currentUser?.uid || r.patient_name === 'Zainab Ahmed' || !r.patient_name) {
            return { ...r, patient_name: newName };
          }
          return r;
        });
        try {
          localStorage.setItem('curalink_reports', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
  };

  const updateDoctorProfile = (updates: Partial<DoctorProfile>) => {
    setDoctorProfile(prev => {
      const updated = { ...prev, ...updates };
      setAllDoctors(all => all.map(d => d.uid === updated.uid ? updated : d));
      return updated;
    });
  };

  const completePatientOnboarding = () => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, onboarding_completed: true } : null);
    }
    setPatientProfile(prev => ({ ...prev, onboarding_step: 4 }));
  };

  const completeDoctorOnboarding = () => {
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, onboarding_completed: true } : null);
    }
    setDoctorProfile(prev => ({ ...prev, verification_status: 'pending' }));
  };

  const createBooking = (data: Omit<Booking, 'id' | 'created_at'>): Booking => {
    const newBooking: Booking = {
      ...data,
      id: `bk_${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    setBookings(prev => [newBooking, ...prev]);
    setCurrentBookingId(newBooking.id);

    // Persist to Firestore
    firestoreService.saveBooking(newBooking).catch(err => console.warn('Firestore booking save error:', err));

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status'], driverStatus?: Booking['driver_status']) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          driver_status: driverStatus !== undefined ? driverStatus : b.driver_status
        };
      }
      return b;
    }));
  };

  const pushNotification = (notifData: Omit<NotificationItem, 'id'> & { id?: string }) => {
    const id = notifData.id || generateUniqueId('notif');
    const newNotif: NotificationItem = {
      ...notifData,
      id
    };
    setNotifications(prev => {
      // Remove any existing notification that has the exact same id
      const filtered = prev.filter(n => n.id !== id);
      return [newNotif, ...filtered];
    });
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
    // Notification
    pushNotification({
      user_uid: currentUser?.uid || 'patient_demo',
      type: 'appointment',
      title: 'Appointment Cancelled',
      message: `Booking #${bookingId.toUpperCase()} has been cancelled.`,
      read: false,
      created_at: 'Just now'
    });
  };

  const processPayment = async (bookingId: string, method: 'jazzcash' | 'easypaisa' | 'card'): Promise<boolean> => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return false;

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPayment: Payment = {
      id: generateUniqueId('pay'),
      booking_id: bookingId,
      patient_uid: booking.patient_uid,
      method,
      amount: booking.total_amount,
      status: 'completed',
      transaction_id: `PK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      created_at: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);

    // Update booking to confirmed
    updateBookingStatus(bookingId, 'confirmed', booking.mode === 'home_visit' ? 'on_the_way' : undefined);

    // Add notification
    pushNotification({
      user_uid: booking.patient_uid,
      type: 'payment',
      title: `Payment Received (${method.toUpperCase()})`,
      message: `Rs. ${booking.total_amount.toLocaleString()} received for booking with ${booking.doctor_name}.`,
      read: false,
      created_at: 'Just now',
      related_url: `/consultation/${bookingId}/${booking.mode === 'home_visit' ? 'tracker' : 'video'}`
    });

    return true;
  };

  const signReport = (reportOrId: string | ConsultationReport, doctorName?: string) => {
    let signedObj: ConsultationReport | null = null;

    if (typeof reportOrId === 'object' && reportOrId !== null) {
      signedObj = {
        ...reportOrId,
        status: 'signed',
        is_signed: true,
        doctor_signed: true,
        doctor_name: doctorName || reportOrId.doctor_name || currentUser?.name || 'Dr. Physician',
        signed_at: new Date().toISOString()
      };
      setReports(prev => [signedObj!, ...prev.filter(r => r.id !== signedObj!.id)]);
    } else {
      const reportId = reportOrId;
      const existing = reports.find(r => r.id === reportId);
      if (existing) {
        signedObj = {
          ...existing,
          status: 'signed',
          is_signed: true,
          doctor_signed: true,
          doctor_name: doctorName || existing.doctor_name || currentUser?.name || 'Dr. Physician',
          signed_at: new Date().toISOString()
        };
        setReports(prev => prev.map(r => r.id === reportId ? signedObj! : r));
      }
    }

    if (!signedObj) return;

    // Save to Firestore outside of state reducer
    firestoreService.saveConsultation(signedObj).catch(err => console.warn('Firestore consultation save error:', err));

    // Append to medical history
    const histItem: MedicalHistoryItem = {
      id: generateUniqueId('hist'),
      patient_uid: signedObj.patient_uid || 'patient_demo',
      type: 'visit_report',
      date: (signedObj.date && typeof signedObj.date === 'string') ? signedObj.date.split('T')[0] : new Date().toISOString().split('T')[0],
      source: signedObj.doctor_uid,
      source_name: `${signedObj.doctor_name} (${signedObj.mode === 'video' ? 'Video' : 'Home Visit'})`,
      title: signedObj.chief_complaint || 'Clinical Consultation',
      diagnosis: signedObj.diagnosis || signedObj.assessment_diagnosis || 'Medical Evaluation',
      symptoms: signedObj.symptoms_discussed,
      medications: signedObj.medications || signedObj.prescribed_medications,
      notes: signedObj.advice || signedObj.doctor_notes
    };
    setMedicalHistory(h => [histItem, ...h.filter(item => item.title !== signedObj!.chief_complaint)]);

    // Push notification to patient cleanly
    pushNotification({
      user_uid: signedObj.patient_uid || 'patient_demo',
      type: 'report',
      title: `Consultation Report Signed by ${signedObj.doctor_name}`,
      message: 'Your official medical report has been signed and added to your permanent health history.',
      read: false,
      created_at: 'Just now',
      related_url: `/consultation/${signedObj.booking_id}/report`
    });
  };

  const signConsultationReport = signReport;

  const updateConsultationReport = (report: ConsultationReport) => {
    setReports(prev => {
      const exists = prev.some(r => r.id === report.id || (r.booking_id && r.booking_id === report.booking_id));
      if (exists) {
        return prev.map(r => (r.id === report.id || (r.booking_id && r.booking_id === report.booking_id)) ? { ...r, ...report } : r);
      }
      return [report, ...prev];
    });
    // Persist to firestore asynchronously
    firestoreService.saveConsultation(report).catch(err => console.warn('Firestore consultation save error:', err));
  };

  const saveConsultationReport = updateConsultationReport;

  const saveSymptomResultToProfile = (result: SymptomCheckResult) => {
    setLastSymptomResult(result);
    const newItem: MedicalHistoryItem = {
      id: generateUniqueId('hist_sym'),
      patient_uid: currentUser?.uid || patientProfile.uid,
      type: 'triage',
      date: (result?.date && typeof result.date === 'string') ? result.date.split('T')[0] : new Date().toISOString().split('T')[0],
      source: 'triage_protocol',
      source_name: 'AI Clinical Triage Protocol',
      title: `AI Triage: ${result.primary_symptom}`,
      diagnosis: result.summary,
      symptoms: [result.primary_symptom, ...(result.associated_symptoms || [])],
      notes: `Urgency: ${result.urgency_level}. Recommended action: ${result.recommended_action}.`
    };
    setMedicalHistory(prev => [newItem, ...prev]);
  };

  const toggleDoctorAvailability = (isAvailable: boolean) => {
    setDoctorProfile(prev => ({
      ...prev,
      is_available: isAvailable
    }));
    setAllDoctors(prev => prev.map(d => {
      if (d.uid === doctorProfile.uid || d.id === doctorProfile.id) {
        return { ...d, is_available: isAvailable };
      }
      return d;
    }));
  };

  const addMedicalHistory = (item: Omit<MedicalHistoryItem, 'id'>) => {
    const newItem: MedicalHistoryItem = {
      ...item,
      id: generateUniqueId('hist')
    };
    setMedicalHistory(prev => [newItem, ...prev]);
  };

  const addMedicalNote = (noteData: Omit<MedicalNote, 'id' | 'created_at'>): MedicalNote => {
    const newNote: MedicalNote = {
      ...noteData,
      id: generateUniqueId('note'),
      created_at: new Date().toISOString()
    };
    setMedicalNotes(prev => [newNote, ...prev]);
    firestoreService.saveMedicalNote(newNote).catch(err => console.warn('Firestore medical note save error:', err));
    return newNote;
  };

  const updateMedicalNote = (id: string, updates: Partial<MedicalNote>) => {
    setMedicalNotes(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...updates, updated_at: new Date().toISOString() };
        firestoreService.saveMedicalNote(updated).catch(err => console.warn('Firestore note update error:', err));
        return updated;
      }
      return n;
    }));
  };

  const deleteMedicalNote = (id: string) => {
    setMedicalNotes(prev => prev.filter(n => n.id !== id));
    firestoreService.deleteMedicalNote(id).catch(err => console.warn('Firestore note delete error:', err));
  };

  const togglePinMedicalNote = (id: string) => {
    setMedicalNotes(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, is_pinned: !n.is_pinned, updated_at: new Date().toISOString() };
        firestoreService.saveMedicalNote(updated).catch(err => console.warn('Firestore note pin update error:', err));
        return updated;
      }
      return n;
    }));
  };

  const addMedicalNoteRequest = (reqData: Omit<MedicalNoteRequest, 'id' | 'created_at' | 'status'>): MedicalNoteRequest => {
    const newReq: MedicalNoteRequest = {
      ...reqData,
      id: generateUniqueId('req_mn'),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setMedicalNoteRequests(prev => [newReq, ...prev]);

    const typeLabel = reqData.note_type === 'medical_leave'
      ? 'Official Medical Leave Certificate'
      : reqData.note_type === 'fitness_certificate'
      ? 'Medical Fitness Certificate'
      : reqData.note_type === 'clinical_summary'
      ? 'Clinical Summary'
      : reqData.note_type === 'prescription_refill'
      ? 'Prescription Refill Note'
      : 'Medical Note';

    // Doctor Notification
    const doctorNotif: NotificationItem = {
      id: generateUniqueId('notif'),
      user_uid: reqData.doctor_uid,
      type: 'report',
      title: 'New Medical Note Request',
      message: `${reqData.patient_name} requested a ${typeLabel} (${reqData.urgency.toUpperCase()}).`,
      read: false,
      created_at: new Date().toISOString()
    };

    // Patient Confirmation
    const patientNotif: NotificationItem = {
      id: generateUniqueId('notif'),
      user_uid: reqData.patient_uid,
      type: 'report',
      title: 'Note Request Submitted',
      message: `Your request for a ${typeLabel} was sent to ${reqData.doctor_name}.`,
      read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [doctorNotif, patientNotif, ...prev]);
    return newReq;
  };

  const respondToMedicalNoteRequest = (
    requestId: string,
    status: 'approved' | 'rejected',
    remarks?: string,
    issuedNoteId?: string
  ) => {
    let affectedReq: MedicalNoteRequest | undefined;
    setMedicalNoteRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        affectedReq = {
          ...r,
          status,
          doctor_remarks: remarks || r.doctor_remarks,
          issued_note_id: issuedNoteId || r.issued_note_id,
          updated_at: new Date().toISOString()
        };
        return affectedReq;
      }
      return r;
    }));

    if (affectedReq) {
      const patientNotif: NotificationItem = {
        id: generateUniqueId('notif'),
        user_uid: affectedReq.patient_uid,
        type: 'report',
        title: status === 'approved' ? 'Medical Note Issued!' : 'Medical Note Request Declined',
        message: status === 'approved'
          ? `${affectedReq.doctor_name} has approved and issued your medical note/certificate. You can view or print it now.`
          : `${affectedReq.doctor_name} reviewed your request: ${remarks || 'Please book a direct consultation.'}`,
        read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [patientNotif, ...prev]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // CNIC Masking Rule (Part 8 requirement: mask CNIC as XXXXX-XXXXXXX-X outside of edit mode)
  const maskCnic = (cnic?: string) => {
    if (!cnic) return 'XXXXX-XXXXXXX-X';
    const clean = cnic.replace(/[^0-9]/g, '');
    if (clean.length < 13) return 'XXXXX-XXXXXXX-X';
    return `${clean.slice(0, 5)}-${clean.slice(5, 12)}-${clean.slice(12, 13)}`;
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        currentRoute: currentPath,
        navigate,
        searchParams,
        currentUser,
        firebaseUser,
        isFirebaseAuthLoading,
        patientProfile,
        doctorProfile,
        doctors: allDoctors,
        allDoctors,
        nursesParamedics: INITIAL_NURSES_PARAMEDICS,
        toggleDoctorAvailability,
        loginAs,
        loginWithGoogle,
        registerPatient,
        registerDoctor,
        loginWithCredentials,
        logout,
        updatePatientProfile,
        updateDoctorProfile,
        completePatientOnboarding,
        completeDoctorOnboarding,
        bookings,
        currentBookingId,
        setCurrentBookingId,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        payments,
        processPayment,
        reports,
        consultationReports: reports,
        signReport,
        signConsultationReport,
        updateConsultationReport,
        saveConsultationReport,
        addMedicalHistory,
        medicalHistory,
        medicalNotes,
        addMedicalNote,
        updateMedicalNote,
        deleteMedicalNote,
        togglePinMedicalNote,
        medicalNoteRequests,
        addMedicalNoteRequest,
        respondToMedicalNoteRequest,
        activeSymptomSession,
        setActiveSymptomSession,
        lastSymptomResult,
        setLastSymptomResult,
        saveSymptomResultToProfile,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        language,
        setLanguage,
        maskCnic
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
