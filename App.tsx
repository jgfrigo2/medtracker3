
import React, { useState, useCallback } from 'react';
import type { AppState, DailyRecord } from './types';
import { APP_PASSWORD } from './constants';
import LoginScreen from './components/LoginScreen';
import Calendar from './components/Calendar';
import DataInputForm from './components/DataInputForm';
import DailyChart from './components/DailyChart';
import MedicationManager from './components/MedicationManager';
import StandardPatternManager from './components/StandardPatternManager';
import DataManager from './components/DataManager';
import { ChartIcon, CogIcon, ListIcon, LockIcon } from './components/Icons';

type Tab = 'registro' | 'medicamentos' | 'patron' | 'datos';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<Tab>('registro');
    const [appState, setAppState] = useState<AppState>({
        medications: ['Paracetamol', 'Ibuprofeno'],
        standardPattern: {},
        records: {},
    });

    const handleLogin = (password: string) => {
        if (password === APP_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleSaveDay = useCallback((date: string, data: DailyRecord) => {
        setAppState(prev => ({
            ...prev,
            records: {
                ...prev.records,
                [date]: data,
            }
        }));
        alert('Datos del día guardados correctamente.');
    }, []);

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const dailyData = appState.records[dateString];

    const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab ? 'bg-brand-primary text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-brand-dark text-white p-4 shadow-md flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold">Health Tracker Diario</h1>
                <button onClick={() => setIsAuthenticated(false)} className="p-2 rounded-full hover:bg-red-500 transition-colors">
                    <LockIcon />
                </button>
            </header>

            <div className="flex-grow flex flex-col md:flex-row p-2 sm:p-4 gap-4">
                <aside className="w-full md:w-48 lg:w-56 bg-gray-200 p-2 rounded-lg shadow">
                    <nav className="flex flex-row md:flex-col gap-2">
                        <TabButton tab="registro" label="Registro y Gráficos" icon={<ChartIcon />} />
                        <TabButton tab="medicamentos" label="Medicamentos" icon={<ListIcon />} />
                        <TabButton tab="patron" label="Patrón Estándar" icon={<CogIcon />} />
                        <TabButton tab="datos" label="Gestión de Datos" icon={<DataManager.Icon />} />
                    </nav>
                </aside>

                <main className="flex-grow bg-white p-4 rounded-lg shadow-inner overflow-y-auto">
                    {activeTab === 'registro' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-4">
                               <h2 className="text-xl font-semibold text-brand-dark border-b-2 border-brand-primary pb-2">Seleccionar Día</h2>
                                <Calendar
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    records={appState.records}
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {dailyData ? (
                                    <>
                                        <h2 className="text-xl font-semibold text-brand-dark border-b-2 border-brand-primary pb-2">Gráfico del Día: {dateString}</h2>
                                        <DailyChart data={dailyData} />
                                    </>
                                ) : (
                                    <h2 className="text-xl font-semibold text-brand-dark border-b-2 border-brand-primary pb-2">Formulario de Entrada: {dateString}</h2>
                                )}
                                <DataInputForm
                                    key={dateString}
                                    selectedDate={dateString}
                                    dailyData={dailyData}
                                    medications={appState.medications}
                                    standardPattern={appState.standardPattern}
                                    onSave={handleSaveDay}
                                />
                            </div>
                        </div>
                    )}
                    {activeTab === 'medicamentos' && (
                        <MedicationManager
                            medications={appState.medications}
                            setMedications={(meds) => setAppState(p => ({ ...p, medications: meds }))}
                        />
                    )}
                    {activeTab === 'patron' && (
                        <StandardPatternManager
                            medications={appState.medications}
                            standardPattern={appState.standardPattern}
                            setStandardPattern={(pattern) => setAppState(p => ({ ...p, standardPattern: pattern }))}
                        />
                    )}
                    {activeTab === 'datos' && (
                        <DataManager
                            appState={appState}
                            setAppState={setAppState}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
