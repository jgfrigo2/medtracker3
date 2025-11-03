
import React, { useState } from 'react';

interface CalendarProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    records: { [date: string]: any };
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, records }) => {
    const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const changeMonth = (offset: number) => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const numDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        const blanks = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
        const days = Array.from({ length: numDays }, (_, i) => i + 1);

        const dayCells = [...blanks, ...days].map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="w-10 h-10"></div>;

            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const isSelected = selectedDate.toDateString() === date.toDateString();
            const hasRecord = !!records[dateString];

            return (
                <button
                    key={day}
                    onClick={() => onDateChange(date)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                        ${isSelected ? 'bg-brand-primary text-white font-bold shadow-lg' : ''}
                        ${!isSelected && hasRecord ? 'bg-blue-200' : ''}
                        ${!isSelected ? 'hover:bg-gray-200' : ''}
                    `}
                >
                    {day}
                </button>
            );
        });

        return <div className="grid grid-cols-7 gap-1 place-items-center">{dayCells}</div>;
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow space-y-4">
            <div className="flex justify-between items-center">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">&lt;</button>
                <h3 className="font-semibold text-lg">
                    {viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
            </div>
            {renderCalendar()}
        </div>
    );
};

export default Calendar;
