import React, { useState, ChangeEvent, useEffect } from 'react';
import type { AppState } from '../types';
import { getJsonBin, updateJsonBin } from '../services/jsonbinService';
import { DataIcon } from './Icons';

interface DataManagerProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

// Fix: Create a new type for the DataManager component that includes the Icon property.
// This resolves the TypeScript error when attaching a static property to a functional component.
interface DataManagerFC extends React.FC<DataManagerProps> {
    Icon: React.FC;
}

const DataManager: DataManagerFC = ({ appState, setAppState }) => {
    const [apiKey, setApiKey] = useState('');
    const [binId, setBinId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        setApiKey(localStorage.getItem('jsonbin_api_key') || '');
        setBinId(localStorage.getItem('jsonbin_bin_id') || '');
    }, []);

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
                        setAppState(data);
                        alert('Datos cargados correctamente.');
                    }
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    alert("Error al leer el archivo JSON. Asegúrate de que el formato es correcto.");
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleSync = async (action: 'load' | 'save') => {
        if (!apiKey || !binId) {
            setMessage({type: 'error', text: 'Por favor, introduce la API Key y el Bin ID.'});
            return;
        }
        localStorage.setItem('jsonbin_api_key', apiKey);
        localStorage.setItem('jsonbin_bin_id', binId);
        setLoading(true);
        setMessage(null);
        try {
            if (action === 'load') {
                const data = await getJsonBin(apiKey, binId);
                setAppState(data);
                setMessage({type: 'success', text: 'Datos cargados desde JSONBin.io con éxito.'});
            } else {
                await updateJsonBin(apiKey, binId, appState);
                setMessage({type: 'success', text: 'Datos guardados en JSONBin.io con éxito.'});
            }
        } catch (error) {
            console.error(error);
            setMessage({type: 'error', text: (error as Error).message});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-dark border-b-2 border-brand-primary pb-2">Gestión de Datos</h2>

            {/* Local File Management */}
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

            {/* JSONBin.io Management */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Gestión Online (JSONBin.io)</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">JSONBin.io API Key</label>
                        <input type="password" id="apiKey" value={apiKey} onChange={e => setApiKey(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="binId" className="block text-sm font-medium text-gray-700">JSONBin.io Bin ID</label>
                        <input type="text" id="binId" value={binId} onChange={e => setBinId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => handleSync('load')} disabled={loading} className="flex-1 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400">
                            {loading ? 'Cargando...' : 'Cargar desde JSONBin'}
                        </button>
                        <button onClick={() => handleSync('save')} disabled={loading} className="flex-1 bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400">
                            {loading ? 'Guardando...' : 'Guardar en JSONBin'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

DataManager.Icon = DataIcon;

export default DataManager;
