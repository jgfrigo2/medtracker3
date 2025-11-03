
import React, { useState } from 'react';
import { TIME_SLOTS } from '../constants';

interface StandardPatternManagerProps {
    medications: string[];
    standardPattern: { [time: string]: string[] };
    setStandardPattern: (pattern: { [time: string]: string[] }) => void;
}

const StandardPatternManager: React.FC<StandardPatternManagerProps> = ({ medications, standardPattern, setStandardPattern }) => {
    const [pattern, setPattern] = useState(standardPattern);

    const handleMedicationChange = (time: string, selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        const values = Array.from(selectedOptions).map(option => option.value);
        setPattern(prev => ({
            ...prev,
            [time]: values,
        }));
    };

    const handleSave = () => {
        // Filter out empty entries before saving
        const cleanedPattern = Object.entries(pattern).reduce((acc, [time, meds]) => {
            if (meds && meds.length > 0) {
                acc[time] = meds;
            }
            return acc;
        }, {} as { [time: string]: string[] });
        
        setStandardPattern(cleanedPattern);
        alert('Patrón estándar guardado.');
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-brand-dark border-b-2 border-brand-primary pb-2">Definir Patrón Estándar de Medicación</h2>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 bg-gray-50 p-4 rounded-lg">
                {TIME_SLOTS.map(time => (
                    <div key={time} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-2 border-b">
                        <label className="font-semibold text-gray-700 md:text-right">{time}</label>
                        <div className="md:col-span-2">
                           <select
                                multiple
                                value={pattern[time] || []}
                                onChange={e => handleMedicationChange(time, e.target.selectedOptions)}
                                className="w-full p-1 border rounded h-24"
                            >
                                {medications.map(med => <option key={med} value={med}>{med}</option>)}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4">
                 <button
                    onClick={handleSave}
                    className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Guardar Patrón
                </button>
            </div>
        </div>
    );
};

export default StandardPatternManager;
