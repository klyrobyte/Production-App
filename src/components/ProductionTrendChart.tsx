import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO, isValid } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export interface TrendData {
  date: string;
  total: number;
  ok: number;
  ng: number;
}

export const ProductionTrendChart = ({ data }: { data: TrendData[] }) => {
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

  const chartDataJs = {
    labels: formattedData.map(d => d.displayDate),
    datasets: [
      {
        type: 'line' as const,
        label: 'Total NG',
        data: formattedData.map(d => d.ng),
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      },
      {
        type: 'bar' as const,
        label: 'Total Output',
        data: formattedData.map(d => d.total),
        backgroundColor: '#2ea2f8',
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
      {
        type: 'bar' as const,
        label: 'Total OK',
        data: formattedData.map(d => d.ok),
        backgroundColor: '#22c55e',
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: 'rgba(255,255,255,0.7)',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        callbacks: {
          title: function(context: any) {
             const item = formattedData[context[0].dataIndex];
             if (item && item.date) {
                try {
                  const parsed = parseISO(item.date);
                  if (isValid(parsed)) return format(parsed, 'd MMM yyyy');
                } catch (e) {}
             }
             return context[0].label;
          },
          label: function(context: any) {
             return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          }
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10
          },
          callback: function(value: any) {
             return value > 0 ? value : '0';
          }
        },
        beginAtZero: true,
        border: {
          display: false
        }
      }
    }
  };

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

      <div className="w-full h-[250px] mt-2 relative">
        <Bar data={chartDataJs as any} options={options as any} />
      </div>
    </div>
  );
};
