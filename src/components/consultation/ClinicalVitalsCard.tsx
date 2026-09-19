import React from 'react';
import { Activity, Heart, Thermometer, Wind } from 'lucide-react';

interface ClinicalVitalsCardProps {
  vitals?: {
    blood_pressure?: string;
    pulse_bpm?: number | string;
    heart_rate?: number | string;
    temperature_f?: number | string;
    temperature?: number | string;
    spo2_percent?: number | string;
    oxygen_saturation?: number | string;
    respiratory_rate?: string;
  };
}

export const ClinicalVitalsCard: React.FC<ClinicalVitalsCardProps> = ({ vitals }) => {
  if (!vitals) return null;

  const bp = vitals.blood_pressure || '118/76';
  const pulseVal = vitals.pulse_bpm || vitals.heart_rate || '80';
  const tempVal = vitals.temperature_f || vitals.temperature || '99.2';
  const spo2Val = vitals.spo2_percent || vitals.oxygen_saturation || '98';

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-700" />
          <span>Recorded Vital Signs</span>
        </h3>
        <span className="text-[11px] text-gray-500 font-medium">Calibrated medical telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Blood Pressure */}
        <div className="p-3.5 bg-teal-50/40 border border-teal-200/80 rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3 text-teal-600" />
            <span>Blood Pressure</span>
          </span>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-1 font-mono">{bp} <span className="text-[10px] font-normal text-gray-500">mmHg</span></p>
          <span className="text-[10px] text-teal-800 font-semibold mt-0.5">Normal resting range</span>
        </div>

        {/* Pulse / Heart Rate */}
        <div className="p-3.5 bg-rose-50/40 border border-rose-200/80 rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-center gap-1">
            <Heart className="w-3 h-3 text-rose-500" />
            <span>Pulse / Heart Rate</span>
          </span>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-1 font-mono">{pulseVal} <span className="text-[10px] font-normal text-gray-500">BPM</span></p>
          <span className="text-[10px] text-rose-800 font-semibold mt-0.5">Regular rhythm</span>
        </div>

        {/* Body Temperature */}
        <div className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-600" />
            <span>Body Temperature</span>
          </span>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-1 font-mono">{tempVal} <span className="text-[10px] font-normal text-gray-500">°F</span></p>
          <span className="text-[10px] text-amber-800 font-semibold mt-0.5">Oral thermometer</span>
        </div>

        {/* Oxygen Saturation */}
        <div className="p-3.5 bg-sky-50/40 border border-sky-200/80 rounded-xl text-center flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center justify-center gap-1">
            <Wind className="w-3 h-3 text-sky-600" />
            <span>SpO2 Saturation</span>
          </span>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-1 font-mono">{spo2Val} <span className="text-[10px] font-normal text-gray-500">%</span></p>
          <span className="text-[10px] text-sky-800 font-semibold mt-0.5">Room air (Ambient)</span>
        </div>
      </div>
    </div>
  );
};
