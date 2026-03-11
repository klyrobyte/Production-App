import React, { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductionData } from "@/hooks/useProductionData";

export interface LossTimeEntry {
    id: string;
    lossTimeMnt: string;
    section: string;
    analisa: string;
    problem: string;
    actionPlan: string;
}

export interface LossTimeData {
    totalLossTime: number;
    entries: LossTimeEntry[];
}

interface LossTimePopupProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: LossTimeData) => void;
    initialTotal?: number;
    initialEntries?: LossTimeEntry[];
}

const LossTimePopup: React.FC<LossTimePopupProps> = ({
    open,
    onClose,
    onSubmit,
    initialTotal = 0,
    initialEntries = [],
}) => {
    const { deptOptions } = useProductionData();
    const [totalLossTime, setTotalLossTime] = useState<number>(initialTotal);
    const [entries, setEntries] = useState<LossTimeEntry[]>(initialEntries);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

    // Form fields
    const [lossTimeMnt, setLossTimeMnt] = useState<string>("");
    const [section, setSection] = useState<string>("");
    const [analisaOpen, setAnalisaOpen] = useState(false);
    const [analisa, setAnalisa] = useState<string>("");
    const [problem, setProblem] = useState<string>("");
    const [actionPlan, setActionPlan] = useState<string>("");

    // Sync initial state when modal opens
    useEffect(() => {
        if (open) {
            setTotalLossTime(initialTotal);
            setEntries(initialEntries);
        }
    }, [open]); // intentionally not including initial* dependencies to only run when opening

    const scrollYRef = useRef<number>(0);

    useEffect(() => {
        if (analisa && deptOptions?.length) {
            const selectedDept = deptOptions.find((opt) => opt.problem === analisa);
            if (selectedDept) setSection(selectedDept.dept);
        }
    }, [analisa, deptOptions]);

    // lock scroll when modal open (preserve position)
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

    const handleClose = () => onClose();

    const handleAddLossTime = () => {
        const timeToAdd = Number(lossTimeMnt) || 0;
        // Accept as long as there is any useful information typed in
        if (timeToAdd > 0 || analisa || problem || actionPlan) {
            setTotalLossTime((prev) => prev + timeToAdd);
            const newEntry: LossTimeEntry = {
                id: Math.random().toString(36).substring(7),
                lossTimeMnt: timeToAdd > 0 ? timeToAdd.toString() : "0",
                section,
                analisa,
                problem,
                actionPlan,
            };
            setEntries((prev) => [...prev, newEntry]);

            // clear form
            setLossTimeMnt("");
            setAnalisa("");
            setProblem("");
            setActionPlan("");
            setIsHistoryExpanded(true);
        }
    };

    const handleSubmit = () => {
        const timeToAdd = Number(lossTimeMnt) || 0;
        const currentEntries = [...entries];
        let finalTotal = totalLossTime;

        // Auto-save any pending inputs when the user clicks 'submit' without hitting '+'
        if (timeToAdd > 0 || analisa || problem || actionPlan) {
            finalTotal += timeToAdd;
            currentEntries.push({
                id: Math.random().toString(36).substring(7),
                lossTimeMnt: timeToAdd > 0 ? timeToAdd.toString() : "0",
                section,
                analisa,
                problem,
                actionPlan,
            });
        }

        onSubmit({
            totalLossTime: finalTotal,
            entries: currentEntries,
        });
        handleClose();
    };

    return (
        <>
            {/* OVERLAY — sibling, full-screen, blur + translucent background */}
            <div
                className="fixed inset-0 z-[10000]"
                onClick={handleClose}
            />

            {/* MODAL wrapper */}
            <div className="fixed inset-0 z-[10010] flex items-end justify-center pointer-events-none pt-10">
                <div className="pointer-events-auto relative flex flex-col w-full max-w-[450px] bg-[#26292c] overflow-hidden rounded-t-[50px] max-h-[90vh] shadow-[0px_10px_30px_rgba(0,0,0,0.5),0px_4px_10px_rgba(0,0,0,0.3)]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 shrink-0">
                        <h2 className="text-[17px] font-bold text-white tracking-wide">Input Data Loss</h2>
                        <button
                            onClick={handleClose}
                            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5 custom-scrollbar">
                        {/* Total Loss Time Group */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-white/70 uppercase">Total Loss Time</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-[#151719] rounded-xl px-4 py-3 flex items-center">
                                    <span className="text-white font-semibold flex-1">{totalLossTime}</span>
                                </div>
                                <button
                                    onClick={handleAddLossTime}
                                    className="w-[48px] h-[48px] shrink-0 bg-gradient-to-r from-[#3498db] to-[#2980b9] rounded-xl flex items-center justify-center text-white hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#3498db]/30"
                                >
                                    <Plus className="w-6 h-6 stroke-[3]" />
                                </button>
                            </div>
                        </div>

                        {/* Secondary Inputs Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/60 uppercase">Loss Time (MNT)</label>
                                <input
                                    type="number"
                                    value={lossTimeMnt}
                                    onChange={(e) => setLossTimeMnt(e.target.value.replace(/[^0-9]/g, ''))}
                                    placeholder="30"
                                    className="w-full bg-[#151719] text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent focus:border-white/10 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-white/60 uppercase">Section</label>
                                <input
                                    type="text"
                                    value={section}
                                    readOnly
                                    disabled
                                    placeholder="Auto-filled"
                                    className="w-full bg-[#151719] text-white/70 placeholder:text-white/30 rounded-xl px-4 py-3 text-sm font-medium outline-none border border-transparent cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Analisa */}
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-bold text-white/60 uppercase">Analisa</label>
                            <button
                                onClick={() => setAnalisaOpen(!analisaOpen)}
                                className="w-full bg-[#151719] rounded-xl px-4 py-3 flex items-center justify-between text-sm transition-colors border border-transparent focus:border-white/10 outline-none"
                            >
                                <span className={analisa ? "text-white font-medium" : "text-white/40"}>
                                    {analisa || "Pilih Kategori Analisa"}
                                </span>
                                <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", analisaOpen && "rotate-180")} />
                            </button>

                            {analisaOpen && (
                                <div className="absolute top-[100%] left-0 right-0 mt-1 bg-[#25282c] border border-white/5 rounded-xl outline-none overflow-hidden z-20 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                                    {deptOptions.map((opt) => (
                                        <button
                                            key={opt.problem}
                                            onClick={() => {
                                                setAnalisa(opt.problem);
                                                setAnalisaOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                        >
                                            {opt.problem}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Problem */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/60 uppercase">Problem</label>
                            <textarea
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                                placeholder="Jelaskan masalah nya...."
                                className="w-full min-h-[80px] bg-[#151719] text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-white/10 transition-colors resize-none"
                            />
                        </div>

                        {/* Action Plan */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-white/60 uppercase">Perbaikan (Action Plan)</label>
                            <textarea
                                value={actionPlan}
                                onChange={(e) => setActionPlan(e.target.value)}
                                placeholder="Langkah yang di ambil"
                                className="w-full min-h-[80px] bg-[#151719] text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-white/10 transition-colors resize-none"
                            />
                        </div>

                        {/* History / Log List */}
                        {entries.length > 0 && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                                    className="flex w-full items-center justify-between py-2 text-white/80 hover:text-white transition-colors"
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-wider">
                                        History Loss Time ({entries.length})
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform duration-300",
                                            isHistoryExpanded && "rotate-180"
                                        )}
                                    />
                                </button>

                                {isHistoryExpanded && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {entries.map((entry, idx) => (
                                            <div key={entry.id} className="bg-[#151719] rounded-xl p-4 space-y-2 border border-white/5 relative">
                                                <button
                                                    onClick={() => {
                                                        const newEntries = entries.filter((_, i) => i !== idx);
                                                        setEntries(newEntries);
                                                        setTotalLossTime((prev) => prev - Number(entry.lossTimeMnt));
                                                    }}
                                                    className="absolute top-3 right-3 text-white/40 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <div className="flex justify-between items-start pr-6">
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-white/50 uppercase">Loss Time</span>
                                                        <div className="text-sm font-bold text-[#22A8F7]">{entry.lossTimeMnt} Menit</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-semibold text-white/50 uppercase">Section</span>
                                                        <div className="text-sm font-medium text-white/80">{entry.section || "-"}</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-semibold text-white/50 uppercase">Analisa</span>
                                                    <div className="text-sm text-white/90">{entry.analisa || "-"}</div>
                                                </div>
                                                {entry.problem && (
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-white/50 uppercase">Problem</span>
                                                        <div className="text-sm text-white/70">{entry.problem}</div>
                                                    </div>
                                                )}
                                                {entry.actionPlan && (
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-white/50 uppercase">Action Plan</span>
                                                        <div className="text-sm text-white/70">{entry.actionPlan}</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-row gap-3 px-6 pb-6 pt-2 shrink-0">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
                        >
                            Batal Tambahkan
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3.5 rounded-xl bg-[#22A8F7] text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#22A8F7]/20"
                        >
                            Simpan Data
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LossTimePopup;