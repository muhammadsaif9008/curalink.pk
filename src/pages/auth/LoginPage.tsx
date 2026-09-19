import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, Smartphone, ArrowRight, ShieldCheck, HeartPulse, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate, loginAs, loginWithCredentials, loginWithGoogle, currentUser, patientProfile, doctorProfile } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async (role: 'patient' | 'doctor' = 'patient') => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle(role);
      if (!res.success) {
        setError(res.error || 'Google Sign-In failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In could not be initialized.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Exact Login Routing Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your phone number or email and password.');
      return;
    }

    const res = loginWithCredentials(identifier, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleDemoSelect = (role: 'patient' | 'doctor', status: 'approved' | 'pending' | 'rejected' | 'new') => {
    loginAs(role, status);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CuraLink</h1>
          <p className="text-xs text-gray-500">
            Log in with your registered phone number or email.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number or Email</label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="0300-1234567 or user@example.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#0F766E] hover:underline font-semibold cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Log in to CuraLink
          </button>
        </form>

        {/* Firebase Google Sign-In */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={() => handleGoogleSignIn('patient')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Google (Patient)'}</span>
            </button>

            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={() => handleGoogleSignIn('doctor')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-teal-200 bg-teal-50/50 rounded-lg text-xs font-semibold text-[#0F766E] hover:bg-teal-100/60 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Connecting...' : 'Google (Doctor)'}</span>
            </button>
          </div>
        </div>

        {/* Part 5 Routing Logic Quick-Testers */}
        <div className="pt-4 border-t border-gray-100 space-y-2.5">
          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider text-center">
            Test Part 5 Routing Accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoSelect('patient', 'approved')}
              className="p-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-lg text-left cursor-pointer"
            >
              <p className="font-bold">Patient (Zainab)</p>
              <p className="text-[10px] text-teal-700">Onboarded → /dashboard/patient</p>
            </button>

            <button
              onClick={() => handleDemoSelect('patient', 'new')}
              className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-left cursor-pointer"
            >
              <p className="font-bold">Patient (Incomplete)</p>
              <p className="text-[10px] text-amber-700">Resume → /onboarding/patient</p>
            </button>

            <button
              onClick={() => handleDemoSelect('doctor', 'approved')}
              className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-lg text-left cursor-pointer"
            >
              <p className="font-bold">Doctor (Approved)</p>
              <p className="text-[10px] text-blue-700">Full Access → /dashboard/doctor</p>
            </button>

            <button
              onClick={() => handleDemoSelect('doctor', 'pending')}
              className="p-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 rounded-lg text-left cursor-pointer"
            >
              <p className="font-bold">Doctor (Pending)</p>
              <p className="text-[10px] text-orange-700">Banner → /dashboard/doctor</p>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          New to CuraLink?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#0F766E] font-bold hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Reset Password</h3>
            {resetSent ? (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs text-gray-600">
                  Password reset link has been dispatched to your email address or SMS helpline.
                </p>
                <button
                  onClick={() => { setShowForgotModal(false); setResetSent(false); }}
                  className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Enter your registered email or phone to receive a secure password reset link.
                </p>
                <input
                  type="text"
                  placeholder="0300-1234567 or email@example.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="flex-1 bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 text-xs text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
