import { Home, User } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import ScanButton from "./ScanButton";

interface BottomNavProps {
  activeTab: "beranda" | "scan" | "profil";
  onTabChange: (tab: "beranda" | "scan" | "profil") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const berandaRef = useRef<HTMLButtonElement>(null);
  const profilRef = useRef<HTMLButtonElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const activeRef = activeTab === "profil" ? profilRef : berandaRef;
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
              className={`w-5 h-5 transition-colors ${
                activeTab === "beranda" ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                activeTab === "beranda" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Beranda
            </span>
          </button>

          {/* Scan - floating above */}
          <div className="relative -top-5">
            <ScanButton onClick={() => onTabChange("scan")} />
            <span className="block text-center text-[10px] font-medium text-muted-foreground mt-1">
              Scan
            </span>
          </div>

          {/* Profil */}
          <button
            ref={profilRef}
            onClick={() => onTabChange("profil")}
            className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-2xl"
          >
            <User
              className={`w-5 h-5 transition-colors ${
                activeTab === "profil" ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span
              className={`text-[10px] font-medium transition-colors ${
                activeTab === "profil" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Profil
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
