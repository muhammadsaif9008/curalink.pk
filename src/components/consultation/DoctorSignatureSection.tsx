import React from 'react';
import { ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

interface DoctorSignatureSectionProps {
  doctorName: string;
  doctorSpecialty?: string;
  doctorPmc?: string;
  doctorQualifications?: string;
  signedAt?: string;
  isSigned?: boolean;
}

export const DoctorSignatureSection: React.FC<DoctorSignatureSectionProps> = ({
  doctorName,
  doctorSpecialty = 'General Physician & Family Medicine',
  doctorPmc = 'PMC-48291-P',
  doctorQualifications = 'MBBS, FCPS (Internal Medicine)',
  signedAt,
  isSigned = false
}) => {
  return (
    <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
      <div className="text-[11px] text-gray-500 space-y-1">
        <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Digitally Authorized via CuraLink Health Gateway</span>
        </p>
        <p>
          Electronic prescription recognized under the Pakistan Electronic Transactions Ordinance & PMC regulations.
        </p>
      </div>

      <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-teal-600 pl-3 sm:pr-3 py-1">
        <p className="font-mono font-black text-gray-900 text-sm">
          Dr. {doctorName.replace('Dr. ', '')}
        </p>
        <p className="text-[11px] text-teal-800 font-bold">{doctorQualifications}</p>
        <p className="text-[10px] text-gray-500 font-mono">
          PMC License: {doctorPmc}
        </p>
        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
          {isSigned 
            ? `Signed: ${signedAt ? new Date(signedAt).toLocaleString('en-PK') : new Date().toLocaleString('en-PK')}`
            : 'Status: Pending Attending Physician Signature'}
        </p>
      </div>
    </div>
  );
};
