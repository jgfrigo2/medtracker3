import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import type { DailyRecord } from '../types';
import { TIME_SLOTS } from '../constants';

interface DateRangeChartProps {
    records: { [date: string]: DailyRecord };
    startDate: Date;
    endDate: Date;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded shadow-lg text-sm opacity-90">
                <p className="font-bold text-gray-800">{`Hora: ${label}`}</p>
                <p className="text-blue-600">{`Promedio: ${dataPoint.avg.toFixed(2)}`}</p>
                <p className="text-green-600">{`Máximo: ${dataPoint.max}`}</p>
                <p className="text-red-600">{`Mínimo: ${dataPoint.min}`}</p>
                <p className="text-gray-500">{`Días registrados: ${dataPoint.count}`}</p>
            </div>
        );
    }
    return null;
};

const DateRangeChart: React.FC<DateRangeChartProps> = ({ records, startDate, endDate }) => {
    const aggregatedData = React.useMemo(() => {
        const dateMap: { [time: string]: number[] } = {};

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const record = records[dateString];
            if (record) {
                for (const time of TIME_SLOTS) {
                    if (record[time] && record[time].value !== null) {
                        if (!dateMap[time]) {
                            dateMap[time] = [];
                        }
                        dateMap[time].push(record[time].value!);
                    }
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return TIME_SLOTS.map(time => {
            const values = dateMap[time];
            if (!values || values.length === 0) {
                return { time, avg: null, range: [null, null], min: null, max: null, count: 0 };
            }
            const sum = values.reduce((a, b) => a + b, 0);
            const min = Math.min(...values);
            const max = Math.max(...values);
            return {
                time,
                avg: sum / values.length,
                range: [min, max],
                min,
                max,
                count: values.length,
            };
        }).filter(d => d.avg !== null);
    }, [records, startDate, endDate]);

    if (aggregatedData.length < 2) {
        return (
            <div className="text-center p-8 bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <p>No hay suficientes datos en el rango seleccionado para mostrar un gráfico.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-96 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer>
                <LineChart
                    data={aggregatedData}
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    {/* Fix: The stroke prop expects a string color value, not a boolean. Use "none" to disable the stroke. */}
                    <Area type="monotone" dataKey="range" stroke="none" fill="#8884d8" opacity={0.2} name="Rango (Min-Max)" />
                    <Line type="monotone" dataKey="avg" stroke="#8884d8" strokeWidth={2} name="Promedio" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DateRangeChart;