
import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from './Icons';

interface MedicationManagerProps {
    medications: string[];
    setMedications: (medications: string[]) => void;
}

const MedicationManager: React.FC<MedicationManagerProps> = ({ medications, setMedications }) => {
    const [newMed, setNewMed] = useState('');

    const handleAdd = () => {
        if (newMed && !medications.includes(newMed)) {
            setMedications([...medications, newMed].sort());
            setNewMed('');
        }
    };

    const handleDelete = (medToDelete: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${medToDelete}"?`)) {
            setMedications(medications.filter(med => med !== medToDelete));
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-dark border-b-2 border-brand-primary pb-2">Gestionar Lista de Medicamentos</h2>
            
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    placeholder="Nuevo medicamento"
                    className="flex-grow p-2 border rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                />
                <button
                    onClick={handleAdd}
                    className="bg-brand-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                >
                   <PlusIcon /> Añadir
                </button>
            </div>
            
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Medicamentos Actuales:</h3>
                <ul className="bg-gray-50 p-3 rounded-lg max-h-96 overflow-y-auto">
                    {medications.length > 0 ? medications.map(med => (
                        <li key={med} className="flex justify-between items-center p-2 border-b last:border-b-0 hover:bg-gray-100">
                            <span>{med}</span>
                            <button
                                onClick={() => handleDelete(med)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                title={`Eliminar ${med}`}
                            >
                                <TrashIcon/>
                            </button>
                        </li>
                    )) : <p className="text-gray-500">No hay medicamentos en la lista.</p>}
                </ul>
            </div>
        </div>
    );
};

export default MedicationManager;
