import React, { useState, ChangeEvent, useEffect } from 'react';
import type { AppState, JsonBinCredential } from '../types';
import { getJsonBin, updateJsonBin } from '../services/jsonbinService';
import { KeyIcon, PlusIcon, TrashIcon } from './Icons';

interface DataManagerProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const CredentialsModal = ({
    isOpen,
    onClose,
    credentials,
    setCredentials
}: {
    isOpen: boolean,
    onClose: () => void,
    credentials: JsonBinCredential[],
    setCredentials: (creds: JsonBinCredential[]) => void
}) => {
    const [newCred, setNewCred] = useState({ name: '', apiKey: '', binId: '' });
    if (!isOpen) return null;

    const handleAdd = () => {
        if (newCred.name && newCred.apiKey && newCred.binId) {
            setCredentials([...credentials, { ...newCred, id: crypto.randomUUID() }]);
            setNewCred({ name: '', apiKey: '', binId: '' });
        } else {
            alert('Por favor, rellena todos los campos.');
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta credencial?')) {
            setCredentials(credentials.filter(c => c.id !== id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold">Gestionar Credenciales de JSONBin.io</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {credentials.map(cred => (
                        <div key={cred.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <span>{cred.name}</span>
                            <button onClick={() => handleDelete(cred.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                        </div>
                    ))}
                     {credentials.length === 0 && <p className="text-gray-500 text-center">No hay credenciales guardadas.</p>}
                </div>
                <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold">Añadir Nueva Credencial</h4>
                    <input type="text" placeholder="Nombre (ej. 'Datos Principales')" value={newCred.name} onChange={e => setNewCred(c => ({...c, name: e.target.value}))} className="w-full p-2 border rounded" />
                    <input type="password" placeholder="API Key" value={newCred.apiKey} onChange={e => setNewCred(c => ({...c, apiKey: e.target.value}))} className="w-full p-2 border rounded" />
                    <input type="text" placeholder="Bin ID" value={newCred.binId} onChange={e => setNewCred(c => ({...c, binId: e.target.value}))} className="w-full p-2 border rounded" />
                    <button onClick={handleAdd} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"><PlusIcon />Añadir</button>
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-gray-200 py-2 rounded">Cerrar</button>
            </div>
        </div>
    );
};


const DataManager: React.FC<DataManagerProps> = ({ appState, setAppState }) => {
    const [credentials, setCredentials] = useState<JsonBinCredential[]>([]);
    const [selectedCredId, setSelectedCredId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const storedCreds = localStorage.getItem('jsonbin_credentials');
        if (storedCreds) {
            const parsedCreds = JSON.parse(storedCreds);
            setCredentials(parsedCreds);
            if (parsedCreds.length > 0) {
                setSelectedCredId(parsedCreds[0].id);
            }
        }
    }, []);
    
    const saveCredentials = (creds: JsonBinCredential[]) => {
        setCredentials(creds);
        localStorage.setItem('jsonbin_credentials', JSON.stringify(creds));
    }

    const handleDownload = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(appState, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `health_tracker_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const data = JSON.parse(text) as AppState;
                        // Basic validation
                        if ('medications' in data && 'records' in data) {
                           setAppState(data);
                           setMessage({ type: 'success', text: 'Datos cargados correctamente desde el archivo.' });
                        } else {
                           throw new Error("El archivo no tiene la estructura esperada.");
                        }
                    }
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    setMessage({ type: 'error', text: "Error al leer el archivo. Formato incorrecto." });
                }
            };
            reader.readAsText(file);
        }
    };

    const handleSync = async (action: 'load' | 'save') => {
        const cred = credentials.find(c => c.id === selectedCredId);
        if (!cred) {
            setMessage({ type: 'error', text: 'Por favor, selecciona o crea una credencial.' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            if (action === 'load') {
                const data = await getJsonBin(cred.apiKey, cred.binId);
                setAppState(data);
                setMessage({ type: 'success', text: 'Datos cargados desde JSONBin.io con éxito.' });
            } else {
                await updateJsonBin(cred.apiKey, cred.binId, appState);
                setMessage({ type: 'success', text: 'Datos guardados en JSONBin.io con éxito.' });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-dark border-b-2 border-brand-primary pb-2">Gestión de Datos</h2>
             {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Gestión Local (Archivo JSON)</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleDownload} className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Descargar Datos
                    </button>
                    <label className="flex-1 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer text-center">
                        Cargar Datos
                        <input type="file" accept=".json" onChange={handleUpload} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Gestión Online (JSONBin.io)</h3>
                <div className="space-y-4">
                    <div className="flex gap-2">
                         <select value={selectedCredId} onChange={e => setSelectedCredId(e.target.value)} className="flex-grow p-2 border rounded-md shadow-sm">
                            {credentials.length === 0 && <option>No hay credenciales</option>}
                            {credentials.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                         <button onClick={() => setIsModalOpen(true)} className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"><KeyIcon /> Gestionar</button>
                    </div>
                   
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => handleSync('load')} disabled={loading || credentials.length === 0} className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400">
                            {loading ? 'Cargando...' : 'Cargar desde JSONBin'}
                        </button>
                        <button onClick={() => handleSync('save')} disabled={loading || credentials.length === 0} className="flex-1 bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400">
                            {loading ? 'Guardando...' : 'Guardar en JSONBin'}
                        </button>
                    </div>
                </div>
            </div>
            <CredentialsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} credentials={credentials} setCredentials={saveCredentials} />
        </div>
    );
};

export default DataManager;
