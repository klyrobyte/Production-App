import { Home, BarChart2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScanButton from "./ScanButton";

interface BottomNavProps {
  activeTab: "beranda" | "scan" | "statistik";
  onTabChange: (tab: "beranda" | "scan" | "statistik") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigate = useNavigate();
  const berandaRef = useRef<HTMLButtonElement>(null);
  const statistikRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const activeRef = activeTab === "statistik" ? statistikRef : berandaRef;
    if (activeRef.current) {
      const el = activeRef.current;
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        transition: "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)",
      });
    }
  }, [activeTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative flex items-end justify-center pb-2 pt-1 mx-auto max-w-md">
        {/* Navbar background */}
        <div className="absolute inset-x-0 bottom-0 h-[72px] rounded-t-2xl bg-card border-t border-border" />

        {/* Active pill indicator */}
        <div
          className="absolute bottom-2 h-12 rounded-2xl liquid-glass-active z-0"
          style={pillStyle}
        />

        {/* Nav items */}
        <div className="relative z-10 flex w-full items-end justify-between px-4">
          {/* Beranda */}
          <button
            ref={berandaRef}
            onClick={() => onTabChange("beranda")}
            className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-2xl"
          >
            <Home
              className={`w-5 h-5 transition-colors ${activeTab === "beranda" ? "text-primary" : "text-muted-foreground"
                }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${activeTab === "beranda" ? "text-foreground" : "text-muted-foreground"
                }`}
            >
              Beranda
            </span>
          </button>

          {/* Scan - floating above */}
          <div className="flex flex-col items-center">
            <div className="scan-button-wrap relative -top-4">
              <ScanButton onClick={() => navigate("/scan")} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              Scan
            </span>
          </div>

          {/* Statistik */}
          <button
            ref={statistikRef}
            onClick={() => onTabChange("statistik")}
            className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-2xl"
          >
            <BarChart2
              className={`w-5 h-5 transition-colors ${activeTab === "statistik" ? "text-primary" : "text-muted-foreground"
                }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${activeTab === "statistik" ? "text-foreground" : "text-muted-foreground"
                }`}
            >
              Statistik
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
