import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ProductionForm from "@/components/ProductionForm";
import Statistik from "@/components/Statistik";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"beranda" | "scan" | "statistik">("beranda");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <AppHeader />

        <div className="mt-2">
          {activeTab === "beranda" && <ProductionForm />}
          {activeTab === "statistik" && <Statistik />}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
