import React, { useState, useEffect } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { secureFetch } from "@/lib/api";

interface StatsData {
  total_output: number;
  total_ok: number;
  total_ng: number;
  avg_ok_ratio: number;
  avg_efisiensi: number;
  avg_budomari: number;
}

const Statistik = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch whenever the month changes
  useEffect(() => {
    fetchStats(currentDate);
  }, [currentDate]);

  const fetchStats = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const yearMonth = format(date, "yyyy-MM");
      const res = await secureFetch('/api/prodata/stats', {
          method: 'POST',
          body: JSON.stringify({ month: yearMonth })
      });
      
      // Parse numbers from response explicitly (strings from DB sometimes)
      const data: StatsData = {
        total_output: Number(res.total_output || 0),
        total_ok: Number(res.total_ok || 0),
        total_ng: Number(res.total_ng || 0),
        avg_ok_ratio: Number(res.avg_ok_ratio || 0),
        avg_efisiensi: Number(res.avg_efisiensi || 0),
        avg_budomari: Number(res.avg_budomari || 0)
      };

      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
      // Fail silently and keep stats null if 404/Empty
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  // Format the values cleanly
  const formatNumber = (num: number) => num.toLocaleString('id-ID');
  const formatPercent = (num: number) => Number.isInteger(num) ? num.toString() : num.toFixed(2);

  // UI Component for the Cards to keep code DRY
  const StatCard = ({ title, value, unit, suffix = "" }: { title: string, value: string | number, unit: string, suffix?: string }) => (
    <div className="bg-[#26292c] rounded-[16px] p-4 flex flex-col items-center justify-center space-y-2 border border-white/5 shadow-lg">
      <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest text-center">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white tracking-tight">{value}{suffix}</span>
      </div>
      {/* Visual placeholder matching mockup's layout without real previous month calculation yet */}
      <span className="text-[10px] font-medium text-white/50">{unit}</span>
    </div>
  );

  return (
    <div className="flex flex-col py-6 space-y-8 animate-in fade-in duration-500">
      
      <div className="px-2 space-y-4">
          <h2 className="text-sm font-bold text-white tracking-wider">PROD. DATE</h2>

          {/* Month Navigator replacing exact input to guarantee perfect formatting */}
          <div className="flex items-center justify-between bg-[#26292c] rounded-[14px] p-2 border border-white/5 shadow-md">
            <button 
                onClick={handlePrevMonth}
                className="p-3 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-white/50" />
                <span className="text-[13px] font-bold text-white">
                    {format(currentDate, "MMMM yyyy", { locale: localeId })}
                </span>
            </div>
            <button 
                onClick={handleNextMonth}
                className="p-3 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
          </div>
      </div>

      <div className="px-2 space-y-4">
        <h3 className="text-sm font-medium text-white/90">
            Ringkasan Produksi Bulanan ({format(currentDate, "MMMM yyyy", { locale: localeId })})
        </h3>
        
        <h4 className="text-sm font-bold text-white tracking-wider pt-2">KPI</h4>

        {loading ? (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ea2f8]"></div>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-3">
                <StatCard 
                    title="Total Output" 
                    value={stats ? formatNumber(stats.total_output) : 0} 
                    unit="Units" 
                />
                <StatCard 
                    title="Total OK" 
                    value={stats ? formatNumber(stats.total_ok) : 0} 
                    unit="Units" 
                />
                <StatCard 
                    title="Total NG" 
                    value={stats ? formatNumber(stats.total_ng) : 0} 
                    unit="Units" 
                />
                <StatCard 
                    title="AVG OK Ratio" 
                    value={stats ? formatPercent(stats.avg_ok_ratio) : "0"} 
                    suffix="%"
                    unit="Units" 
                />
                <StatCard 
                    title="AVG Efisiensi" 
                    value={stats ? formatPercent(stats.avg_efisiensi) : "0"} 
                    suffix="%"
                    unit="Units" 
                />
                <StatCard 
                    title="AVG Budomari" 
                    value={stats ? formatPercent(stats.avg_budomari) : "0"} 
                    suffix="%"
                    unit="Units" 
                />
            </div>
        )}
      </div>

    </div>
  );
};

export default Statistik;
