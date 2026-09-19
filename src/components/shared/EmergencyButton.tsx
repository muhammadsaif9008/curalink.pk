import React, { useState } from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';
import { EmergencyModal } from './EmergencyModal';

interface EmergencyButtonProps {
  callerRole?: 'doctor' | 'patient';
  patientName?: string;
  patientLocation?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'pill';
  className?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  callerRole = 'doctor',
  patientName,
  patientLocation,
  size = 'md',
  variant = 'solid',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5'
  }[size];

  const variantClasses = {
    solid: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs hover:shadow-red-500/20',
    outline: 'border-2 border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100',
    pill: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-full shadow-md'
  }[variant];

  return (
    <>
      <button
        type="button"
        id={`emergency-btn-${callerRole}`}
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center font-extrabold rounded-xl transition-all cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
        title="Trigger Medical Emergency (Rescue 1122)"
      >
        <ShieldAlert className="w-4 h-4 text-white shrink-0 animate-pulse" />
        <span className="tracking-tight whitespace-nowrap">
          {callerRole === 'doctor' ? 'Emergency 1122' : 'Emergency 1122'}
        </span>
      </button>

      <EmergencyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        callerRole={callerRole}
        patientName={patientName}
        patientLocation={patientLocation}
      />
    </>
  );
};
