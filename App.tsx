import React, { useState, useCallback, useMemo } from 'react';
import type { AppState, DailyRecord } from './types';
import { APP_PASSWORD } from './constants';
import LoginScreen from './components/LoginScreen';
import Calendar from './components/Calendar';
import DataInputForm from './components/DataInputForm';
import DailyChart from './components/DailyChart';
import MedicationManager from './components/MedicationManager';
import StandardPatternManager from './components/StandardPatternManager';
import DataManager from './components/DataManager';
import DateRangeChart from './components/DateRangeChart';
import { ChartIcon, CogIcon, ListIcon, LockIcon, DataIcon, CalendarIcon } from './components/Icons';

type Tab = 'registro' | 'medicamentos' | 'patron' | 'datos';
type ViewMode = 'day' | 'range';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [activeTab, setActiveTab] = useState<Tab>('registro');
    const [appState, setAppState] = useState<AppState>({
        medications: ['Paracetamol', 'Ibuprofeno'],
        standardPattern: {},
        records: {},
    });

    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('day');
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    const [dateRange, setDateRange] = useState({ start: oneWeekAgo, end: today });

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

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setIsCalendarVisible(false);
    };

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const dateString = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
    const dailyData = useMemo(() => appState.records[dateString], [appState.records, dateString]);

    const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg transition-all duration-200 w-full text-left ${activeTab === tab ? 'bg-brand-primary text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
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
                        <TabButton tab="datos" label="Gestión de Datos" icon={<DataIcon />} />
                    </nav>
                </aside>

                <main className="flex-grow bg-white p-4 rounded-lg shadow-inner overflow-y-auto">
                    {activeTab === 'registro' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap items-center justify-between gap-4 p-2 border-b">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setIsCalendarVisible(true)} className="flex items-center gap-2 bg-brand-secondary text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
                                        <CalendarIcon />
                                        <span className="hidden sm:inline">Seleccionar Fecha</span>
                                    </button>
                                    <h2 className="text-xl font-semibold text-brand-dark">
                                        {viewMode === 'day' ? `Día: ${dateString}` : 'Vista de Rango'}
                                    </h2>
                                </div>
                                <div className="bg-gray-200 p-1 rounded-lg flex">
                                    <button onClick={() => setViewMode('day')} className={`px-3 py-1 rounded-md text-sm font-semibold ${viewMode === 'day' ? 'bg-white shadow' : 'text-gray-600'}`}>Día</button>
                                    <button onClick={() => setViewMode('range')} className={`px-3 py-1 rounded-md text-sm font-semibold ${viewMode === 'range' ? 'bg-white shadow' : 'text-gray-600'}`}>Rango</button>
                                </div>
                            </div>

                            {viewMode === 'day' ? (
                                <>
                                    {dailyData ? (
                                        <DailyChart data={dailyData} />
                                    ) : (
                                        <div className="text-center p-8 bg-gray-50 rounded-lg">
                                            <h3 className="text-lg font-semibold">No hay datos para {dateString}.</h3>
                                            <p className="text-gray-600">Rellena el formulario para empezar a registrar.</p>
                                        </div>
                                    )}
                                    <DataInputForm
                                        key={dateString}
                                        selectedDate={dateString}
                                        dailyData={dailyData}
                                        medications={appState.medications}
                                        standardPattern={appState.standardPattern}
                                        onSave={handleSaveDay}
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col gap-4">
                                     <div className="flex flex-wrap items-center justify-center gap-4 p-2 bg-gray-100 rounded-lg">
                                        <label className="font-semibold">Desde:</label>
                                        <input type="date" value={dateRange.start.toISOString().split('T')[0]} onChange={e => setDateRange(r => ({...r, start: new Date(e.target.value)}))} className="p-2 border rounded"/>
                                        <label className="font-semibold">Hasta:</label>
                                        <input type="date" value={dateRange.end.toISOString().split('T')[0]} onChange={e => setDateRange(r => ({...r, end: new Date(e.target.value)}))} className="p-2 border rounded"/>
                                     </div>
                                     <DateRangeChart records={appState.records} startDate={dateRange.start} endDate={dateRange.end} />
                                </div>
                            )}
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
            
            {isCalendarVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsCalendarVisible(false)}>
                    <div onClick={e => e.stopPropagation()}>
                        <Calendar
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                            records={appState.records}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
