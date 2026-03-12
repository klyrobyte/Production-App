import React from 'react';
import { Calendar, Layers, Activity, Factory, Clock } from 'lucide-react';

interface SummaryData {
  total_days: number;
  total_output: number;
  avg_ok_ratio: number;
  best_factory: string;
  best_shift: string;
}

export const MonthlySummaryCard = ({ data }: { data: SummaryData }) => {
  const avgOutput = data.total_days > 0 ? Math.round(data.total_output / data.total_days) : 0;
  
  return (
    <div className="bg-[#26292c] rounded-2xl p-5 border border-white/5 shadow-lg h-full flex flex-col">
      <h3 className="text-white font-bold text-[15px] tracking-wide mb-4">Monthly Summary</h3>
      
      <div className="flex flex-col space-y-3 flex-1 justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs font-semibold">Total Day</span>
          </div>
          <span className="text-white font-bold text-sm">{data.total_days}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs font-semibold">Avg Output/Day</span>
          </div>
          <span className="text-white font-bold text-sm">{avgOutput.toLocaleString('id-ID')}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs font-semibold">Avg OK Ratio</span>
          </div>
          <span className="text-white font-bold text-sm">{data.avg_ok_ratio.toFixed(2)}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs font-semibold">Best Factory</span>
          </div>
          <span className="text-white font-bold text-sm">{data.best_factory || '-'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/60 text-xs font-semibold">Best Shift</span>
          </div>
          <span className="text-white font-bold text-sm">{data.best_shift || '-'}</span>
        </div>
      </div>
    </div>
  );
};
