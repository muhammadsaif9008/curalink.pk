import React from 'react';
import { Pill, Plus, Trash2 } from 'lucide-react';
import { PrescribedMedication } from '../../types';

interface PrescriptionTableProps {
  medications: PrescribedMedication[];
  isEditing?: boolean;
  onUpdateMedications?: (meds: PrescribedMedication[]) => void;
}

export const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  medications,
  isEditing = false,
  onUpdateMedications
}) => {
  const handleMedChange = (index: number, field: keyof PrescribedMedication, val: string) => {
    if (!onUpdateMedications) return;
    const next = [...medications];
    next[index] = { ...next[index], [field]: val };
    onUpdateMedications(next);
  };

  const handleAddMed = () => {
    if (!onUpdateMedications) return;
    const newMed: PrescribedMedication = {
      name: 'Tab. Paracetamol 500mg',
      dosage: '500mg',
      frequency: 'Twice daily (BD)',
      duration: '5 days',
      instructions: 'Take after meals with water'
    };
    onUpdateMedications([...medications, newMed]);
  };

  const handleRemoveMed = (index: number) => {
    if (!onUpdateMedications) return;
    const next = medications.filter((_, i) => i !== index);
    onUpdateMedications(next);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Official Prescription & Dosage Schedule</h3>
            <p className="text-[11px] text-gray-500">Pharmacological orders authorized by attending physician</p>
          </div>
        </div>

        {isEditing && (
          <button
            onClick={handleAddMed}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 font-bold">Medication Name</th>
              <th className="py-3 px-3 font-bold">Dosage</th>
              <th className="py-3 px-3 font-bold">Frequency</th>
              <th className="py-3 px-3 font-bold">Duration</th>
              <th className="py-3 px-4 font-bold">Administration & Instructions</th>
              {isEditing && <th className="py-3 px-3 font-bold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {medications && medications.length > 0 ? (
              medications.map((med, idx) => (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-teal-950">
                    {isEditing ? (
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded font-semibold text-xs"
                      />
                    ) : (
                      <span>{med.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    ) : (
                      <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-semibold">{med.dosage}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    ) : (
                      <span>{med.frequency}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium">
                    {isEditing ? (
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs"
                      />
                    ) : (
                      <span className="text-teal-800 font-semibold">{med.duration}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                        className="w-full p-1.5 border border-gray-300 rounded text-xs italic"
                      />
                    ) : (
                      <span className="italic">{med.instructions}</span>
                    )}
                  </td>
                  {isEditing && (
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRemoveMed(idx)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isEditing ? 6 : 5} className="py-6 text-center text-gray-400 italic">
                  No medications prescribed for this consultation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
