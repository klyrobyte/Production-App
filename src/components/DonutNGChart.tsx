import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutData {
  sum_ng_awal: number;
  sum_ng_proses: number;
  sum_dan_go: number;
  sum_trial: number;
  sum_ng_total: number;
}

const COLORS = ['#ef4444', '#eab308', '#3b82f6', '#8b5cf6'];

export const DonutNGChart = ({ data }: { data: DonutData }) => {
  const chartLabels = ['NG Awal', 'NG Proses', 'Dan Go', 'Trial'];
  const chartValues = [
    Number(data?.sum_ng_awal) || 0,
    Number(data?.sum_ng_proses) || 0,
    Number(data?.sum_dan_go) || 0,
    Number(data?.sum_trial) || 0,
  ];

  const total = Number(data?.sum_ng_total) || 0;

  const chartDataJs = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: COLORS,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `${context.label} : ${context.parsed} pcs`;
          }
        }
      }
    }
  };

  // For the custom legend mapping
  const legendData = chartLabels.map((name, index) => ({
    name,
    value: chartValues[index],
  }));

  return (
    <div className="bg-[#26292c] rounded-2xl p-5 border border-white/5 shadow-lg flex flex-col h-full">
      <h3 className="text-white font-bold text-[15px] tracking-wide mb-4">Distribusi NG</h3>
      
      <div className="flex-1 relative min-h-[180px]">
        <div style={{ width: '100%', height: '100%', minHeight: '180px', position: 'relative' }}>
          <Doughnut data={chartDataJs} options={options} />
        </div>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-white font-bold text-2xl">{total}</span>
          <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Total NG</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {legendData.map((item, index) => {
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
