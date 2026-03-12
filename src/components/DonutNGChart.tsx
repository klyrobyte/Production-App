import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutData {
  sum_ng_awal: number;
  sum_ng_proses: number;
  sum_dan_go: number;
  sum_trial: number;
  sum_ng_total: number;
}

const COLORS = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f2937] border border-white/10 px-3 py-2 rounded-lg shadow-xl">
        <p className="text-white text-xs font-medium">{`${payload[0].name} : ${payload[0].value} pcs`}</p>
      </div>
    );
  }
  return null;
};

export const DonutNGChart = ({ data }: { data: DonutData }) => {
  const chartData = [
    { name: 'NG Awal', value: Number(data?.sum_ng_awal) || 0 },
    { name: 'NG Proses', value: Number(data?.sum_ng_proses) || 0 },
    { name: 'Dan Go', value: Number(data?.sum_dan_go) || 0 },
    { name: 'Trial', value: Number(data?.sum_trial) || 0 },
  ];

  const total = Number(data?.sum_ng_total) || 0;

  return (
    <div className="bg-[#26292c] rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col h-full">
      <h3 className="text-white font-bold text-[15px] tracking-wide mb-4">Distribusi NG</h3>
      
      <div className="flex-1 relative min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white font-bold text-2xl">{total}</span>
          <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Total NG</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-white/80 font-medium">{item.name}</span>
              </div>
              <span className="text-white font-bold">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
