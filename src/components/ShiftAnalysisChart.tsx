import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface ShiftData {
  shift: string;
  ok: number;
}

const SHIFT_COLORS: Record<string, string> = {
  'A': '#8b5cf6', // Purple
  'B': '#f59e0b', // Orange
  'C': '#10b981', // Emerald
  'D': '#3b82f6', // Blue
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937] border border-white/10 px-3 py-2 rounded-lg shadow-xl flex items-center gap-2">
        <span className="text-white font-bold text-sm">{payload[0].payload.shift}</span>
        <span className="text-white/50 text-xs">|</span>
        <span className="text-white text-xs font-medium">{payload[0].value.toLocaleString('id-ID')} OK</span>
      </div>
    );
  }
  return null;
};

export const ShiftAnalysisChart = ({ data }: { data: ShiftData[] }) => {
  // Map missing formats if needed, Recharts handles array of objects cleanly
  return (
    <div className="bg-[#26292c] rounded-2xl p-5 border border-white/5 shadow-lg h-full flex flex-col">
      <h3 className="text-white font-bold text-[15px] tracking-wide mb-4">Shift Analysis</h3>
      
      <div className="flex-1 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="shift" 
              tick={{ fill: '#ffffff70', fontSize: 12, fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fill: '#ffffff50', fontSize: 10 }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => value > 0 ? `${(value/1000).toFixed(1)}k` : '0'} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            
            <Bar dataKey="ok" radius={[4, 4, 0, 0]} maxBarSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SHIFT_COLORS[entry.shift] || '#2ea2f8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
