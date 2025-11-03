import React, { useState, useEffect, useRef } from 'react';
import type { DailyRecord, TimePointData } from '../types';
import { TIME_SLOTS } from '../constants';

interface DataInputFormProps {
    selectedDate: string;
    dailyData?: DailyRecord;
    medications: string[];
    standardPattern: { [time: string]: string[] };
    onSave: (date: string, data: DailyRecord) => void;
}

const createEmptyDay = (): DailyRecord => {
    return TIME_SLOTS.reduce((acc, time) => {
        acc[time] = { value: null, medication: [], comments: '' };
        return acc;
    }, {} as DailyRecord);
};

const DataInputForm: React.FC<DataInputFormProps> = ({ selectedDate, dailyData, medications, standardPattern, onSave }) => {
    const [formData, setFormData] = useState<DailyRecord>(dailyData || createEmptyDay());
    const [isEditing, setIsEditing] = useState(!dailyData);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setFormData(dailyData || createEmptyDay());
        setIsEditing(!dailyData);
        inputRefs.current = inputRefs.current.slice(0, TIME_SLOTS.length);
    }, [selectedDate, dailyData]);

    const handleChange = <K extends keyof TimePointData, >(time: string, field: K, value: TimePointData[K]) => {
        setFormData(prev => ({
            ...prev,
            [time]: {
                ...prev[time],
                [field]: value,
            },
        }));
    };
    
    const handleMedicationChange = (time: string, selectedOptions: HTMLCollectionOf<HTMLOptionElement>) => {
        const values = Array.from(selectedOptions).map(option => option.value);
        handleChange(time, 'medication', values);
    };

    const applyStandardPattern = () => {
        setFormData(prev => {
            const newState = { ...prev };
            for (const time in standardPattern) {
                if (newState[time]) {
                    newState[time].medication = [...standardPattern[time]];
                }
            }
            return newState;
        });
        alert('Patrón estándar aplicado.');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        let currentVal = Number(e.currentTarget.value) || 0;

        if (e.key === 'ArrowUp' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowDown' && index < TIME_SLOTS.length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentVal < 10) {
                 handleChange(TIME_SLOTS[index], 'value', currentVal + 1);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentVal > 0) {
                handleChange(TIME_SLOTS[index], 'value', currentVal - 1);
            }
        }
    };
    
    if (!isEditing && dailyData) {
        return (
             <div className="flex justify-center items-center p-4">
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full max-w-md bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                >
                    Editar Datos del Día {selectedDate}
                </button>
            </div>
        )
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
             <h2 className="text-xl font-semibold text-brand-dark border-b-2 border-brand-primary pb-2">Formulario de Entrada: {selectedDate}</h2>
             <p className="text-sm text-gray-600 bg-blue-100 p-2 rounded-md">
                <strong>Consejo:</strong> Usa las teclas de flecha <kbd>↑</kbd> <kbd>↓</kbd> para moverte entre horas, y <kbd>←</kbd> <kbd>→</kbd> para ajustar el valor numérico.
            </p>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {TIME_SLOTS.map((time, index) => (
                    <div key={time} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start p-2 border-b">
                        <label className="font-semibold text-gray-700 md:text-right pr-4 self-center">{time}</label>
                        <input
                            // Fix: The ref callback was incorrectly returning the element, causing a type error. Wrapping the assignment in curly braces ensures the callback returns void.
                            ref={el => { inputRefs.current[index] = el; }}
                            type="number"
                            min="0"
                            max="10"
                            value={formData[time]?.value === null ? '' : formData[time]?.value}
                            onChange={e => handleChange(time, 'value', e.target.value === '' ? null : parseInt(e.target.value))}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-full p-1 border rounded"
                        />
                        <select
                            multiple
                            value={formData[time]?.medication}
                            onChange={e => handleMedicationChange(time, e.target.selectedOptions)}
                            className="w-full p-1 border rounded h-20"
                        >
                            {medications.map(med => <option key={med} value={med}>{med}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Comentarios..."
                            value={formData[time]?.comments}
                            onChange={e => handleChange(time, 'comments', e.target.value)}
                            className="w-full p-1 border rounded"
                        />
                    </div>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <button
                    onClick={applyStandardPattern}
                    className="flex-1 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Aplicar Patrón
                </button>
                <button
                    onClick={() => onSave(selectedDate, formData)}
                    className="flex-1 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                    {dailyData ? 'Actualizar Día' : 'Guardar Día'}
                </button>
            </div>
        </div>
    );
};

export default DataInputForm;