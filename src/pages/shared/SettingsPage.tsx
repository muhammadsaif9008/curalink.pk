import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Globe, 
  Shield, 
  Smartphone, 
  Mail, 
  MessageCircle, 
  Key, 
  LogOut, 
  Trash2, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, language, setLanguage, logout, navigate } = useApp();

  // Notification Preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSaved, setPassSaved] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;
    setPassSaved(true);
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account & Security Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure notifications, language preferences, two-factor authentication, and privacy settings.
        </p>
      </div>

      {/* Language Preference (Part 4 specification: English / Urdu) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-gray-900">Platform Language</h2>
        </div>
        <p className="text-xs text-gray-500">Choose your preferred reading language for CuraLink.</p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
              language === 'en'
                ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            English (Default)
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ur')}
            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer font-urdu ${
              language === 'ur'
                ? 'bg-teal-50 border-[#0F766E] text-[#0F766E] shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            اردو (Urdu)
          </button>
        </div>
      </div>

      {/* Notification Preferences (SMS, Email, WhatsApp) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-gray-900">Notification Channels</h2>
        </div>
        <p className="text-xs text-gray-500">Never miss a doctor appointment, home visit dispatch alert, or prescription update.</p>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-gray-800">WhatsApp Dispatch & Prescription Alerts</p>
                <p className="text-[11px] text-gray-400">Receive live GPS arrival links and PDF prescriptions on WhatsApp.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={e => setWhatsappAlerts(e.target.checked)}
              className="rounded text-[#0F766E] focus:ring-teal-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-gray-800">SMS Appointment Reminders</p>
                <p className="text-[11px] text-gray-400">Short text messages 15 minutes prior to your video or bedside visit.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={e => setSmsAlerts(e.target.checked)}
              className="rounded text-[#0F766E] focus:ring-teal-500 h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-xs font-bold text-gray-800">Email Invoices & Consultation Summaries</p>
                <p className="text-[11px] text-gray-400">Official tax receipts and clinical assessment summaries.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="rounded text-[#0F766E] focus:ring-teal-500 h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* Security & Authentication */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-[#0F766E]" />
          <h2 className="text-sm font-bold text-gray-900">Security & Privacy</h2>
        </div>

        {/* 2FA switch */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-800">Two-Factor Authentication (NADRA SMS OTP)</p>
            <p className="text-[11px] text-gray-500">Require an SMS code when signing in or modifying health records.</p>
          </div>
          <input
            type="checkbox"
            checked={twoFactor}
            onChange={e => setTwoFactor(e.target.checked)}
            className="rounded text-[#0F766E] focus:ring-teal-500 h-4 w-4"
          />
        </div>

        {/* Password Update form */}
        <form onSubmit={handlePasswordUpdate} className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Change Password</h3>
          
          {passSaved && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Password updated successfully.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Account Actions: Logout & Delete */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900">Session & Account Controls</h2>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
            <span>Sign Out of CuraLink</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to request deletion of your account and archived records?')) {
                alert('Account deletion request submitted under Pakistan Personal Data Protection guidelines.');
                handleLogout();
              }
            }}
            className="border border-red-200 bg-red-50 hover:bg-red-100 text-[#DC2626] text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-[#DC2626]" />
            <span>Delete Account & Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
