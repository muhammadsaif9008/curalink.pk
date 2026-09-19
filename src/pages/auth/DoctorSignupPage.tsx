import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Stethoscope, ArrowLeft, Lock, Mail, Smartphone, User, Award, ShieldCheck } from 'lucide-react';

export const DoctorSignupPage: React.FC = () => {
  const { navigate, registerDoctor } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    pmcLicense: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.pmcLicense) {
      setError('Please fill in all required fields including PMC license.');
      return;
    }
    // Register doctor persistently with their actual name, PMC, phone, and email, landing them directly in their Doctor Portal
    registerDoctor({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      pmcLicense: formData.pmcLicense
    });
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Medical Practitioner Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Join as a PMC Doctor</h1>
          <p className="text-xs text-gray-500 mt-1">
            Deliver video consultations & in-clinic OPD care to patients in Islamabad & Rawalpindi.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name (as on PMC Certificate) *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ayesha Tariq"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">PMC / PMDC Registration Number *</label>
            <div className="relative">
              <Award className="w-4 h-4 text-blue-600 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. PMC-48291-P"
                value={formData.pmcLicense}
                onChange={e => setFormData({ ...formData, pmcLicense: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 font-mono uppercase"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">We verify all registrations with the Pakistan Medical Commission registry.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone Number *</label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                placeholder="0300-1234567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="doctor@hospital.pk"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
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
                className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Continue to Doctor Onboarding
            </button>
            <p className="text-[11px] text-gray-500 text-center mt-2.5 leading-relaxed">
              Your account will be reviewed within 24–48 hours before you can accept patients.
            </p>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Already registered?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};
