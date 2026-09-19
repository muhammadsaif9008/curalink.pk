export interface HospitalInfo {
  id: string;
  name: string;
  city: 'Islamabad' | 'Rawalpindi';
  address: string;
  phone: string;
  emergencyHotline: string;
  type: 'Tertiary Hospital' | 'Specialized Institute' | 'University Hospital' | 'Private Medical Center';
  rating: number;
  reviewsCount: number;
  image: string;
  departments: string[];
  hasEmergency247: boolean;
  hasAmbulance: boolean;
}

export interface DiseaseInfo {
  id: string;
  name: string;
  urduName: string;
  category: 'Infectious' | 'Chronic' | 'Pediatric' | 'Respiratory' | 'Dermatology' | 'General';
  description: string;
  urgency: 'Low' | 'Moderate' | 'High' | 'Emergency';
  keySymptoms: string[];
  recommendedSpecialty: string;
  careAdvice: string;
}

export interface PatientTestimonial {
  id: string;
  patientName: string;
  city: string;
  area: string;
  visitType: 'Home Visit' | 'Video Consultation';
  doctorName: string;
  rating: number;
  date: string;
  review: string;
  avatar: string;
}

export const POPULAR_SYMPTOMS = [
  { id: 'sym_fever', label: 'High Fever & Chills', icon: '🌡️', category: 'General', searchKey: 'fever' },
  { id: 'sym_cough', label: 'Cough & Chest Congestion', icon: '🫁', category: 'Respiratory', searchKey: 'cough' },
  { id: 'sym_child', label: 'Child / Pediatric Fever', icon: '👶', category: 'Pediatrics', searchKey: 'pediatric' },
  { id: 'sym_rash', label: 'Skin Rash & Itching', icon: '🩺', category: 'Dermatology', searchKey: 'skin' },
  { id: 'sym_headache', label: 'Migraine & Throbbing Headache', icon: '🧠', category: 'Neurology', searchKey: 'headache' },
  { id: 'sym_bp', label: 'Blood Pressure / Dizziness', icon: '❤️', category: 'Cardiology', searchKey: 'bp' },
  { id: 'sym_stomach', label: 'Stomach Pain & Vomiting', icon: '🤢', category: 'Gastroenterology', searchKey: 'stomach' },
  { id: 'sym_sugar', label: 'Diabetes & High Sugar', icon: '🩸', category: 'Endocrinology', searchKey: 'diabetes' },
];

export const COMMON_DISEASES: DiseaseInfo[] = [
  {
    id: 'dis_dengue',
    name: 'Dengue Fever',
    urduName: 'ڈینگی بخار',
    category: 'Infectious',
    description: 'Mosquito-borne viral infection characterized by sudden high fever, retro-orbital eye pain, severe muscle aching, and low platelet counts.',
    urgency: 'High',
    keySymptoms: ['Sudden high fever (103°F+)', 'Severe headache & behind eyes', 'Joint & bone pain (breakbone)', 'Skin petechial rash'],
    recommendedSpecialty: 'General Physician & Internal Medicine',
    careAdvice: 'Immediate CBC blood test, constant hydration with ORS and papaya leaf extract, avoid aspirin/brufen, rest.'
  },
  {
    id: 'dis_typhoid',
    name: 'Typhoid Fever',
    urduName: 'ٹائیفائیڈ بخار',
    category: 'Infectious',
    description: 'Bacterial infection caused by Salmonella typhi through contaminated food or water, leading to step-ladder persistent fever.',
    urgency: 'Moderate',
    keySymptoms: ['Prolonged step-ladder fever', 'Stomach ache & constipation/diarrhea', 'Extreme fatigue', 'Coated white tongue'],
    recommendedSpecialty: 'Internal Medicine & Infectious Disease',
    careAdvice: 'Blood culture & Typhidot test, prescribed antibiotics course completion, boiled drinking water, soft light diet.'
  },
  {
    id: 'dis_flu',
    name: 'Seasonal Influenza & Viral URI',
    urduName: 'موسمی نزلہ اور زکام',
    category: 'Respiratory',
    description: 'Acute viral infection of the upper respiratory tract commonly circulating during seasonal transitions across Pakistan.',
    urgency: 'Low',
    keySymptoms: ['Runny or congested nose', 'Sore throat & dry cough', 'Mild to moderate fever (100°F)', 'General body aches'],
    recommendedSpecialty: 'General Physician & Family Medicine',
    careAdvice: 'Paracetamol for fever, steam inhalation twice daily, warm honey water, adequate sleep, vitamin C.'
  },
  {
    id: 'dis_diabetes',
    name: 'Type 2 Diabetes Mellitus',
    urduName: 'ذیابیطس / شوگر',
    category: 'Chronic',
    description: 'Chronic metabolic disorder leading to elevated blood glucose levels requiring consistent monitoring and medication management.',
    urgency: 'Moderate',
    keySymptoms: ['Frequent urination at night', 'Excessive thirst & dry mouth', 'Slow-healing sores', 'Unexplained fatigue'],
    recommendedSpecialty: 'Internal Medicine & Diabetologist',
    careAdvice: 'Regular fasting and HbA1c testing, low glycemic diet, daily 30-min walk, strictly adherence to oral hypoglycemics or insulin.'
  },
  {
    id: 'dis_hypertension',
    name: 'Hypertension (High BP)',
    urduName: 'ہائی بلڈ پریشر',
    category: 'Chronic',
    description: 'Elevated arterial blood pressure placing chronic strain on heart, kidneys, and cerebral vessels.',
    urgency: 'Moderate',
    keySymptoms: ['Occipital morning headaches', 'Shortness of breath with mild exertion', 'Dizziness or lightheadedness', 'Nosebleeds in severe cases'],
    recommendedSpecialty: 'Consultant Cardiologist & General Physician',
    careAdvice: 'Daily BP logging, low sodium salt restriction, DASH diet, stress control, never skip prescribed anti-hypertensive drugs.'
  },
  {
    id: 'dis_asthma',
    name: 'Pediatric & Adult Asthma',
    urduName: 'دمہ اور سانس کی الرجی',
    category: 'Pediatric',
    description: 'Chronic inflammation of the airways causing reversible airflow obstruction, heightened by urban smog in Lahore and Karachi.',
    urgency: 'High',
    keySymptoms: ['Audible wheezing sounds', 'Nighttime persistent coughing', 'Chest tightness', 'Breathlessness with activity'],
    recommendedSpecialty: 'Consultant Pulmonologist & Pediatrician',
    careAdvice: 'Keep reliever inhaler accessible at all times, air purifier usage during smog alerts, avoid dust and cold allergens.'
  },
  {
    id: 'dis_gastro',
    name: 'Acute Gastroenteritis',
    urduName: 'پیٹ کی خرابی اور اسہال',
    category: 'General',
    description: 'Stomach and intestinal inflammation causing watery stools, cramps, and dehydration commonly following outside food.',
    urgency: 'Moderate',
    keySymptoms: ['Watery diarrhea', 'Abdominal cramping & spasms', 'Nausea and vomiting', 'Low-grade fever & weakness'],
    recommendedSpecialty: 'General Physician & Gastroenterologist',
    careAdvice: 'Frequent small sips of WHO-formula ORS, zinc supplements for children, banana/rice/toast diet, avoid spicy food.'
  },
  {
    id: 'dis_eczema',
    name: 'Eczema & Atopic Dermatitis',
    urduName: 'جلدی خارش اور الرجی',
    category: 'Dermatology',
    description: 'Inflammatory dry skin condition causing intense itching, redness, flaking, and sensitivity to weather changes.',
    urgency: 'Low',
    keySymptoms: ['Dry, scaly patches', 'Intense itching especially at night', 'Red inflamed flares on joints', 'Cracked skin'],
    recommendedSpecialty: 'Consultant Dermatologist',
    careAdvice: 'Fragrance-free ceramide moisturizers right after lukewarm bathing, avoid harsh soaps, cotton clothing only.'
  }
];

export const PARTNER_HOSPITALS: HospitalInfo[] = [
  {
    id: 'hosp_shifa',
    name: 'Shifa International Hospital',
    city: 'Islamabad',
    address: 'Pitras Bukhari Road, Sector H-8/4, Islamabad',
    phone: '+92 51 8464646',
    emergencyHotline: '051-8463666',
    type: 'Tertiary Hospital',
    rating: 4.92,
    reviewsCount: 3950,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=500',
    departments: ['Emergency Care', 'Pediatric Surgery', 'Critical Care', 'Internal Medicine', 'Cardiology', 'Oncology'],
    hasEmergency247: true,
    hasAmbulance: true
  },
  {
    id: 'hosp_pims',
    name: 'Pakistan Institute of Medical Sciences (PIMS)',
    city: 'Islamabad',
    address: 'Sector G-8/3, Islamabad',
    phone: '+92 51 9261170',
    emergencyHotline: '051-9261170',
    type: 'University Hospital',
    rating: 4.85,
    reviewsCount: 4210,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=500',
    departments: ['Emergency & Trauma', 'Internal Medicine', 'Pediatrics', 'Pulmonology', 'General Surgery'],
    hasEmergency247: true,
    hasAmbulance: true
  },
  {
    id: 'hosp_qih',
    name: 'Quaid-e-Azam International Hospital',
    city: 'Islamabad',
    address: 'Near Golra Mor, Peshawar Road, Islamabad',
    phone: '+92 51 8449100',
    emergencyHotline: '051-8449100 Ext 1',
    type: 'Tertiary Hospital',
    rating: 4.89,
    reviewsCount: 2680,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=500',
    departments: ['Pulmonology & Critical Care', 'Cardiology', 'Orthopedics', 'Emergency', 'Diagnostic Labs'],
    hasEmergency247: true,
    hasAmbulance: true
  },
  {
    id: 'hosp_ric',
    name: 'Rawalpindi Institute of Cardiology (RIC)',
    city: 'Rawalpindi',
    address: 'Rawal Road, Rawalpindi',
    phone: '+92 51 9281201',
    emergencyHotline: '051-9281205',
    type: 'Specialized Institute',
    rating: 4.94,
    reviewsCount: 3120,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=500',
    departments: ['Cardiac Emergency 24/7', 'Interventional Cardiology', 'Cardiac Surgery', 'Echocardiography'],
    hasEmergency247: true,
    hasAmbulance: true
  },
  {
    id: 'hosp_bbh',
    name: 'Benazir Bhutto Hospital (BBH)',
    city: 'Rawalpindi',
    address: 'Murree Road, Rawalpindi',
    phone: '+92 51 9290301',
    emergencyHotline: '051-9290310',
    type: 'University Hospital',
    rating: 4.82,
    reviewsCount: 2840,
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=500',
    departments: ['Pediatrics Emergency', 'Internal Medicine', 'General Surgery', 'Orthopedics', 'ICU'],
    hasEmergency247: true,
    hasAmbulance: true
  },
  {
    id: 'hosp_holyfamily',
    name: 'Holy Family Hospital',
    city: 'Rawalpindi',
    address: 'Satellite Town, Rawalpindi',
    phone: '+92 51 9290321',
    emergencyHotline: '051-9290325',
    type: 'Tertiary Hospital',
    rating: 4.84,
    reviewsCount: 2410,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=500',
    departments: ['Dengue & Infectious Disease Unit', 'Pediatrics', 'Obstetrics & Gynecology', 'Emergency'],
    hasEmergency247: true,
    hasAmbulance: true
  }
];

export const PATIENT_TESTIMONIALS: PatientTestimonial[] = [
  {
    id: 'test_1',
    patientName: 'Mrs. Saima Tariq',
    city: 'Islamabad',
    area: 'Sector F-7/2',
    visitType: 'Video Consultation',
    doctorName: 'Dr. Ayesha Tariq',
    rating: 5,
    date: '2 days ago',
    review: 'My 4-year-old daughter spiked a 103°F fever late on a Sunday evening. Dr. Ayesha gave an immediate video assessment with pediatric dosage guidance and an instant prescription. The care was thorough, calm, and truly reassuring.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test_2',
    patientName: 'Hamza Farooq',
    city: 'Rawalpindi',
    area: 'Saddar Cantt',
    visitType: 'Video Consultation',
    doctorName: 'Dr. Bilal Haroon',
    rating: 5,
    date: 'Last week',
    review: 'Had severe chest congestion and wheezing. The HD video consultation was seamless, and Dr. Bilal explained my treatment plan with immense patience. Received my signed digital prescription directly to my phone.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: 'test_3',
    patientName: 'Khurram Shehzad',
    city: 'Islamabad',
    area: 'Sector G-11/3',
    visitType: 'Video Consultation',
    doctorName: 'Dr. Maryam Khan',
    rating: 5,
    date: '3 days ago',
    review: 'Booked an online pediatric follow-up with Dr. Maryam Khan. Saved us from a stressful hospital commute across Islamabad in peak traffic. Her CNIC medical history is now updated forever.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
  }
];

export const WHY_CURALINK_BENEFITS = [
  {
    icon: 'ShieldCheck',
    title: '100% PMC-Verified Doctors',
    description: 'Every medical practitioner is strictly verified with the Pakistan Medical Commission with verified hospital affiliations across Islamabad & Rawalpindi.',
    badge: 'Audited Licenses'
  },
  {
    icon: 'Car',
    title: 'Doorstep Nurse & Paramedic Care',
    description: 'Certified PNC nurses and Rescue 1122 paramedics visit your residence for IV drips, wound dressings, vitals, and injections across Islamabad & Rawalpindi.',
    badge: 'PNC & Rescue 1122'
  },
  {
    icon: 'Video',
    title: 'Instant Video & Clinic Appointments',
    description: 'Consult top doctors via encrypted video telemedicine or schedule in-person clinic visits at leading Islamabad and Rawalpindi medical facilities.',
    badge: 'Video & Clinic'
  },
  {
    icon: 'FileText',
    title: 'Lifetime CNIC Digital Health Record',
    description: 'Every prescription, vital reading, and clinical note is securely attached to your CNIC. Accessible anytime, downloadable as official signed PDFs.',
    badge: 'Zero Paper Lost'
  },
  {
    icon: 'CreditCard',
    title: 'Transparent Pricing & Local Payments',
    description: 'Clear, upfront consultation fees with zero hidden charges. Pay safely using JazzCash, Easypaisa, Raast instant transfers, or debit cards.',
    badge: 'Rs 1,000 – Rs 2,800'
  },
  {
    icon: 'PhoneCall',
    title: '24/7 Dedicated Care Coordination',
    description: 'Our clinical coordination team is always on standby to assist with appointment bookings, nurse dispatches, and hospital referrals in Islamabad & Rawalpindi.',
    badge: 'Twin Cities Care'
  }
];
