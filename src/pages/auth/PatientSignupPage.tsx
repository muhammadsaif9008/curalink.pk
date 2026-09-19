import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, ArrowLeft, Lock, Smartphone, Mail, User, CheckCircle2 } from 'lucide-react';

export const PatientSignupPage: React.FC = () => {
  const { navigate, registerPatient, loginAs } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setShowOtpModal(true);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // auto advance
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const verifyOtpAndProceed = () => {
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      setShowOtpModal(false);
      // Register patient persistently with their actual name, phone, email & password, landing them directly in their portal
      registerPatient({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <button
        onClick={() => navigate('/signup')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Change role selection</span>
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Patient Registration
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Create Patient Account</h1>
          <p className="text-xs text-gray-500 mt-1">
            Access AI triage, online consultations, and home doctor visits.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Zainab Ahmed"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone Number (Pakistan) *</label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">We will send an SMS OTP verification code.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address (Optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="zainab@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors cursor-pointer mt-2"
          >
            Continue with Mobile Verification
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">or</span>
          </div>
        </div>

        {/* Sign up with Google */}
        <button
          type="button"
          onClick={() => loginAs('patient', 'new')}
          className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="text-center text-xs text-gray-500 pt-2">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#0F766E] font-bold hover:underline cursor-pointer"
          >
            Log in
          </button>
        </p>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Verify Phone Number</h3>
              <p className="text-xs text-gray-500">
                Enter the 6-digit code sent to <br />
                <strong className="text-gray-800">{formData.phone || '0300-1234567'}</strong>
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  type="text"
                  maxLength={1}
                  value={otp[i]}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-teal-600 bg-gray-50"
                  placeholder="•"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-[11px] text-gray-400">
                Didn't receive code?{' '}
                <button
                  type="button"
                  onClick={() => setOtp(['4', '8', '2', '9', '1', '0'])}
                  className="text-teal-700 font-semibold underline cursor-pointer"
                >
                  Auto-fill demo OTP (482910)
                </button>
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={verifyOtpAndProceed}
                disabled={otpLoading}
                className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                {otpLoading ? 'Verifying OTP...' : 'Verify & Continue to Onboarding'}
              </button>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full text-xs text-gray-500 hover:text-gray-800 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
