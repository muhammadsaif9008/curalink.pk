import React from 'react';
import { useApp } from '../../context/AppContext';
import { HeartPulse, Home, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mx-auto">
          <HeartPulse className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
            Page Not Found (404)
          </span>
          <h1 className="text-2xl font-bold text-gray-900">We couldn't find that page</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            The link you followed may have moved or the address might be mistyped. Don't worry, your health data and appointments are completely safe.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-[#0F766E] hover:bg-[#0B5C56] text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Doctors</span>
          </button>
        </div>
      </div>
    </div>
  );
};
