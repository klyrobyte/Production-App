import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ProductionForm from "@/components/ProductionForm";
import ProfileView from "@/components/ProfileView";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"beranda" | "scan" | "profil">("beranda");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-28">
        <AppHeader />

        <div className="mt-2">
          {activeTab === "beranda" && <ProductionForm />}
          {activeTab === "profil" && <ProfileView />}
          {activeTab === "scan" && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Scanner akan ditampilkan di sini.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
