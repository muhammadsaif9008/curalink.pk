import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Static & Marketing Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/static/AboutPage';
import { PrivacyPage } from './pages/static/PrivacyPage';
import { TermsPage } from './pages/static/TermsPage';
import { ContactPage } from './pages/static/ContactPage';
import { NotFoundPage } from './pages/static/NotFoundPage';
import { EmergencyPage } from './pages/shared/EmergencyPage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { HospitalsAndERPage } from './pages/shared/HospitalsAndERPage';
import { DiseasesGuidePage } from './pages/shared/DiseasesGuidePage';
import { WhyCuraLinkPage } from './pages/shared/WhyCuraLinkPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';

// Auth & Onboarding
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PatientSignupPage } from './pages/auth/PatientSignupPage';
import { DoctorSignupPage } from './pages/auth/DoctorSignupPage';
import { PatientOnboardingPage } from './pages/onboarding/PatientOnboardingPage';
import { DoctorOnboardingPage } from './pages/onboarding/DoctorOnboardingPage';

// Patient & Clinical Workflows
import { SymptomCheckPage } from './pages/patient/SymptomCheckPage';
import { SymptomResultPage } from './pages/patient/SymptomResultPage';
import { DoctorsDirectoryPage } from './pages/patient/DoctorsDirectoryPage';
import { HomeCarePage } from './pages/patient/HomeCarePage';
import { DoctorDetailPage } from './pages/patient/DoctorDetailPage';
import { NewBookingPage } from './pages/booking/NewBookingPage';
import { BookingConfirmationPage } from './pages/booking/BookingConfirmationPage';
import { VideoConsultationPage } from './pages/consultation/VideoConsultationPage';
import { ConsultationReportPage } from './pages/consultation/ConsultationReportPage';
import { HomeVisitTrackerPage } from './pages/consultation/HomeVisitTrackerPage';

// Dashboards & Profiles
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';
import { DoctorProfileSettingsPage } from './pages/doctor/DoctorProfileSettingsPage';
import { DoctorScribePage } from './pages/doctor/DoctorScribePage';
import { DoctorNavigationPage } from './pages/doctor/DoctorNavigationPage';

const AppRouter: React.FC = () => {
  const { currentRoute, currentPath, currentUser } = useApp();

  // Strip query params for routing match safely
  const activeRoute = currentRoute || currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const pathOnly = (activeRoute || '/').split('?')[0] || '/';

  const renderRoute = () => {
    // 1. Exact Static & Marketing Routes
    if (pathOnly === '/' || pathOnly === '') return <LandingPage />;
    if (pathOnly === '/about') return <AboutPage />;
    if (pathOnly === '/privacy') return <PrivacyPage />;
    if (pathOnly === '/terms') return <TermsPage />;
    if (pathOnly === '/contact') return <ContactPage />;
    if (pathOnly === '/emergency') return <EmergencyPage />;
    if (pathOnly === '/settings') return <SettingsPage />;
    if (pathOnly === '/hospitals' || pathOnly === '/hospitals-and-er' || pathOnly === '/partner-hospitals') return <HospitalsAndERPage />;
    if (pathOnly === '/diseases' || pathOnly === '/diseases-guide') return <DiseasesGuidePage />;
    if (pathOnly === '/why-curalink' || pathOnly === '/why') return <WhyCuraLinkPage />;
    if (pathOnly === '/notifications') return <NotificationsPage />;

    // 2. Auth & Onboarding Routes
    if (pathOnly === '/login') return <LoginPage />;
    if (pathOnly === '/signup') return <SignupPage />;
    if (pathOnly === '/signup/patient') return <PatientSignupPage />;
    if (pathOnly === '/signup/doctor') return <DoctorSignupPage />;
    if (pathOnly === '/onboarding/patient') return <PatientOnboardingPage />;
    if (pathOnly === '/onboarding/doctor') return <DoctorOnboardingPage />;

    // 3. Symptom Check Flow
    if (pathOnly === '/symptom-check') return <SymptomCheckPage />;
    if (pathOnly === '/symptom-check/result') return <SymptomResultPage />;

    // 4. Doctor Listing & Profile & Home Care
    if (pathOnly === '/home-care' || pathOnly === '/home-visit' || pathOnly === '/home-visits' || pathOnly === '/nurses' || pathOnly === '/paramedics') return <HomeCarePage />;
    if (pathOnly === '/doctors') return <DoctorsDirectoryPage />;
    if (pathOnly.startsWith('/doctors/')) {
      const doctorId = pathOnly.replace('/doctors/', '');
      return <DoctorDetailPage doctorId={doctorId} />;
    }

    // 5. Booking Flow
    if (pathOnly === '/booking/new') return <NewBookingPage />;
    if (pathOnly.includes('/booking/') && pathOnly.endsWith('/confirmation')) {
      const bookingId = (pathOnly.split('/booking/')[1] || '').replace('/confirmation', '');
      return <BookingConfirmationPage bookingId={bookingId} />;
    }

    // 6. Consultations (Video, GPS Tracker, AI Scribe, AI Report)
    if (pathOnly === '/doctor/scribe' || pathOnly === '/dashboard/doctor/scribe') {
      return <DoctorScribePage />;
    }
    if (pathOnly.startsWith('/doctor/visit/') || pathOnly.startsWith('/doctor/navigation/')) {
      const bookingId = pathOnly.replace('/doctor/visit/', '').replace('/doctor/navigation/', '');
      return <DoctorNavigationPage bookingId={bookingId} />;
    }
    if (pathOnly.includes('/consultation/') && pathOnly.endsWith('/report')) {
      const bookingId = (pathOnly.split('/consultation/')[1] || '').replace('/report', '');
      return <ConsultationReportPage bookingId={bookingId} />;
    }
    if (pathOnly.includes('/consultation/') && pathOnly.endsWith('/tracker')) {
      const bookingId = (pathOnly.split('/consultation/')[1] || '').replace('/tracker', '');
      return currentUser?.role === 'doctor' ? <DoctorNavigationPage bookingId={bookingId} /> : <HomeVisitTrackerPage bookingId={bookingId} />;
    }
    if (pathOnly.startsWith('/visit/')) {
      const bookingId = pathOnly.replace('/visit/', '');
      return currentUser?.role === 'doctor' ? <DoctorNavigationPage bookingId={bookingId} /> : <HomeVisitTrackerPage bookingId={bookingId} />;
    }
    if (pathOnly.startsWith('/consultation/')) {
      const bookingId = pathOnly.replace('/consultation/', '').replace('/video', '');
      return <VideoConsultationPage bookingId={bookingId} />;
    }

    // 7. Dashboards & Profiles
    if (pathOnly.startsWith('/dashboard/patient/profile') || pathOnly === '/profile/patient') return <PatientProfilePage />;
    if (pathOnly.startsWith('/dashboard/doctor/profile') || pathOnly === '/profile/doctor') return <DoctorProfileSettingsPage />;
    if (pathOnly === '/medical-notes' || pathOnly === '/notes') return <PatientDashboardPage />;
    if (pathOnly.startsWith('/dashboard/patient')) return <PatientDashboardPage />;
    if (pathOnly.startsWith('/dashboard/doctor')) return <DoctorDashboardPage />;

    // Fallback 404
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111827]">
      <Header />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
