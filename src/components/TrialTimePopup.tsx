import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface TrialDataValues {
  totalDango: string;
  pakaiMaterial: string;
  problem: string;
}

interface TrialTimePopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TrialDataValues) => void;
  initialData?: TrialDataValues | null;
}

const TrialTimePopup: React.FC<TrialTimePopupProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [totalDango, setTotalDango] = useState("");
  const [pakaiMaterial] = useState("AUTO");
  const [problem, setProblem] = useState("");

  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTotalDango(initialData.totalDango);
        setProblem(initialData.problem);
      } else {
        setTotalDango("");
        setProblem("");
      }
    }
  }, [open, initialData]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    scrollYRef.current = window.scrollY || window.pageYOffset || 0;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollYRef.current || 0);
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    onSubmit({
      totalDango,
      pakaiMaterial,
      problem,
    });
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[10000]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[10010] flex items-end justify-center pointer-events-none pt-10">
        <div className="pointer-events-auto relative w-full max-w-[380px] bg-[#26292c] rounded-[24px] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[15px] font-bold text-white tracking-wide">INPUT DATA TRIAL</h2>
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Total Dango */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/90">Total Dango</label>
              <div className="relative">
                <input
                  type="number"
                  value={totalDango}
                  onChange={(e) => setTotalDango(e.target.value)}
                  className="w-full bg-[#151719] text-white rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-white/10 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-white/60">
                  pcs
                </span>
              </div>
            </div>

            {/* Pakai Material */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/90">Pakai Material</label>
              <div className="relative">
                <input
                  type="text"
                  value=""
                  readOnly
                  className="w-full bg-[#151719] text-white rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent cursor-not-allowed"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-white/60">
                  AUTO
                </span>
              </div>
            </div>

            {/* Problem */}
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/90">Problem (Optional)</label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full min-h-[120px] bg-[#151719] text-white rounded-xl px-4 py-3.5 text-sm outline-none border border-transparent focus:border-white/10 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex flex-row gap-3 px-6 pb-6 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full border border-white/20 text-white text-[13px] font-semibold hover:bg-white/5 transition-colors"
            >
              Batal Tambahkan
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-full bg-[#2ea2f8] text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Tambahkan Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrialTimePopup;
