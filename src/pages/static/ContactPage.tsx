import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { navigate } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Support & Inquiries
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900">Contact CuraLink Pakistan</h1>
        <p className="text-sm text-gray-600">
          Have questions about clinical triage, home visits, or doctor credentialing? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="md:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Thank you for contacting us!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Our support coordinator in Lahore has received your message and will respond to {formData.email || 'your phone number'} within 2 hours.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' }); }}
                className="text-xs text-[#0F766E] font-semibold underline cursor-pointer"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Farooq"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number (Pakistan)</label>
                  <input
                    type="tel"
                    placeholder="0300-1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600 bg-white"
                >
                  <option value="General Inquiry">General Patient Inquiry</option>
                  <option value="Doctor Onboarding">Doctor PMC Verification / Joining</option>
                  <option value="Home Visit Coverage">Home Visit Coverage Area Question</option>
                  <option value="Billing / Payment">JazzCash / Easypaisa Payment Support</option>
                  <option value="Corporate Partnerships">Hospital or Corporate Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-600"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to Support</span>
              </button>
            </form>
          )}
        </div>

        {/* Office & Hotline Details */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Direct Contacts</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Support Helpline</p>
                  <p className="text-gray-500">(042) 3589-4400 / 0300-CURALINK</p>
                  <p className="text-[10px] text-teal-700 font-medium">9:00 AM - 11:00 PM (Daily)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Email Inquiries</p>
                  <p className="text-gray-500">support@curalink.pk</p>
                  <p className="text-gray-500">doctors@curalink.pk</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">Lahore Hub</p>
                  <p className="text-gray-500">Floor 4, Tricon Corporate Centre, Gulberg III, Lahore</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-xs text-teal-900 space-y-2">
            <h4 className="font-bold">Medical Emergency Notice</h4>
            <p className="text-teal-800 leading-relaxed">
              If someone requires urgent resuscitation or has sustained high-impact injury, please dial Rescue 1122 or visit the nearest hospital emergency room directly.
            </p>
            <button
              onClick={() => navigate('/hospitals')}
              className="text-teal-800 font-bold hover:underline cursor-pointer flex items-center gap-1 mt-1"
            >
              <span>View Partner Hospitals Directory →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
