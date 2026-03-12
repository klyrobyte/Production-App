import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, isValid } from 'date-fns';

export interface TrendData {
  date: string;
  total: number;
  ok: number;
  ng: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const fullDate = payload[0].payload.date;
    let formattedDate = fullDate;
    try {
      const parsed = parseISO(fullDate);
      if (isValid(parsed)) {
        formattedDate = format(parsed, "d MMM yyyy");
      }
    } catch (e) { }

    return (
      <div className="bg-[#1f2937] border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-white/70 text-xs font-semibold mb-2">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white font-medium">{entry.name}:</span>
            <span className="text-white font-bold ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ProductionTrendChart = ({ data }: { data: TrendData[] }) => {
  // Safe date parsing to prevent crashes and explicit Number bindings
  const formattedData = (data || []).map(item => {
    let displayDate = item.date;
    try {
      if (item.date) {
        const parsed = parseISO(item.date);
        if (isValid(parsed)) {
          displayDate = format(parsed, 'MMM d');
        }
      }
    } catch (e) { }

    return {
      ...item,
      displayDate,
      total: Number(item.total) || 0,
      ok: Number(item.ok) || 0,
      ng: Number(item.ng) || 0,
    };
  });

  return (
    <div className="bg-[#26292c] rounded-2xl p-5 border border-white/5 shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-[15px] tracking-wide">Production Trend</h3>
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1 text-[#2ea2f8]"><div className="w-2 h-2 bg-[#2ea2f8] rounded-sm"></div>TOTAL</div>
          <div className="flex items-center gap-1 text-[#22c55e]"><div className="w-2 h-2 bg-[#22c55e] rounded-sm"></div>OK</div>
          <div className="flex items-center gap-1 text-[#ef4444]"><div className="w-2 h-2 bg-[#ef4444] rounded-full"></div>NG</div>
        </div>
      </div>

      <div className="w-full h-[250px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: '#ffffff50', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fill: '#ffffff50', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value > 0 ? value : '0'}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />

            <Bar dataKey="total" name="Total Output" fill="#2ea2f8" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="ok" name="Total OK" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line type="monotone" dataKey="ng" name="Total NG" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
