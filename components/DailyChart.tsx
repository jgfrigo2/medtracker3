import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Dot, Area, Brush } from 'recharts';
import type { DailyRecord } from '../types';
import { TIME_SLOTS } from '../constants';

interface DailyChartProps {
    data: DailyRecord;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-white p-3 border rounded shadow-lg text-sm opacity-90">
                <p className="font-bold text-gray-800">{`Hora: ${label}`}</p>
                <p className="text-indigo-600 font-semibold">{`Valor: ${dataPoint.value}`}</p>
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
    const { cx, cy, payload, stroke, fill } = props;
    const hasExtraInfo = payload.medication.length > 0 || payload.comments;

    if (hasExtraInfo) {
        return (
            <svg x={cx - 6} y={cy - 6} width={12} height={12} fill={stroke} viewBox="0 0 1024 1024">
                 <path d="M512 904c-217.2 0-392-174.8-392-392s174.8-392 392-392 392 174.8 392 392-174.8 392-392 392zm0-724c-183.3 0-332 148.7-332 332s148.7 332 332 332 332-148.7 332-332-148.7-332-332-332z" />
                 <path d="M512 512m-272 0a272 272 0 1 0 544 0 272 272 0 1 0-544 0Z" />
            </svg>
        );
    }

    return <Dot cx={cx} cy={cy} r={4} stroke={stroke} fill={fill} />;
};


const DailyChart: React.FC<DailyChartProps> = ({ data }) => {
    const chartData = TIME_SLOTS.map(time => ({
        time,
        value: data[time]?.value,
        medication: data[time]?.medication || [],
        comments: data[time]?.comments || '',
    })).filter(d => d.value !== null && d.value !== undefined);

    if (chartData.length < 2) {
        return <div className="text-center p-4 bg-gray-100 rounded-lg">No hay suficientes datos numéricos para mostrar un gráfico lineal. Se necesitan al menos 2 puntos.</div>;
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
                    <Legend verticalAlign="top" height={36}/>

                    <ReferenceArea y1={0} y2={3} fill="#fde047" strokeOpacity={0.2} label={{ value: "Bajo", position: "insideTopLeft", fill: "#a16207", fontSize: 12, dy: 10, dx: 10 }} />
                    <ReferenceArea y1={3} y2={8} fill="#86efac" strokeOpacity={0.2} label={{ value: "Medio", position: "insideTopLeft", fill: "#15803d", fontSize: 12, dy: 10, dx: 10 }} />
                    <ReferenceArea y1={8} y2={10.5} fill="#fca5a5" strokeOpacity={0.2} label={{ value: "Alto", position: "insideTopLeft", fill: "#b91c1c", fontSize: 12, dy: 10, dx: 10 }} />
                    
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <Area type="monotone" dataKey="value" stroke="false" fill="url(#colorUv)" />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} name="Valor" connectNulls dot={<CustomizedDot />} activeDot={{ r: 8 }} />
                    <Brush dataKey="time" height={30} stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyChart;
