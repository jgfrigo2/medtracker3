
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Dot } from 'recharts';
import type { DailyRecord } from '../types';
import { TIME_SLOTS } from '../constants';

interface DailyChartProps {
    data: DailyRecord;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded shadow-lg text-sm">
                <p className="font-bold">{`Hora: ${label}`}</p>
                <p className="text-blue-600">{`Valor: ${dataPoint.value}`}</p>
                {dataPoint.medication.length > 0 && (
                    <p className="text-purple-600">{`Medicación: ${dataPoint.medication.join(', ')}`}</p>
                )}
                {dataPoint.comments && (
                    <p className="text-gray-600">{`Comentario: ${dataPoint.comments}`}</p>
                )}
            </div>
        );
    }
    return null;
};

const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.medication.length > 0 || payload.comments) {
        return <Dot cx={cx} cy={cy} r={5} fill="#8884d8" stroke="#fff" strokeWidth={2} />;
    }
    return <Dot cx={cx} cy={cy} r={3} fill="#8884d8" />;
};


const DailyChart: React.FC<DailyChartProps> = ({ data }) => {
    const chartData = TIME_SLOTS.map(time => ({
        time,
        value: data[time]?.value,
        medication: data[time]?.medication || [],
        comments: data[time]?.comments || '',
    })).filter(d => d.value !== null);

    if (chartData.length === 0) {
        return <div className="text-center p-4 bg-gray-100 rounded-lg">No hay datos numéricos para mostrar en el gráfico.</div>;
    }

    return (
        <div className="w-full h-96 bg-white p-4 rounded-lg shadow">
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    <ReferenceArea y1={0} y2={3} fill="rgba(255, 235, 59, 0.2)" strokeOpacity={0.3} label={{ value: "Bajo", position: "insideTopLeft", fill: "#757575", fontSize: 12 }} />
                    <ReferenceArea y1={3} y2={8} fill="rgba(76, 175, 80, 0.2)" strokeOpacity={0.3} label={{ value: "Medio", position: "insideTopLeft", fill: "#757575", fontSize: 12 }} />
                    <ReferenceArea y1={8} y2={10} fill="rgba(244, 67, 54, 0.2)" strokeOpacity={0.3} label={{ value: "Alto", position: "insideTopLeft", fill: "#757575", fontSize: 12 }} />
                    
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Valor" connectNulls dot={<CustomizedDot />} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyChart;
