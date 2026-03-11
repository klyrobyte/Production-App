import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface NgProcessValues {
    shortShort: string;
    silver: string;
    flekGas: string;
    buble: string;
    blackDot: string;
    waving: string;
    dekok: string;
    weldline: string;
    overcut: string;
    whitemark: string;
    benang: string;
    kelang: string;
    galer: string;
    scratch: string;
    gompal: string;
    pinHole: string;
    other: string;
    keterangan: string; // Text field for describing "other"
}

export interface NgProcessPopupProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: NgProcessValues) => void;
    initialData?: NgProcessValues;
    title?: string;
}

const DEFAULT_NG_PROCESS_DATA: NgProcessValues = {
    shortShort: "",
    silver: "",
    flekGas: "",
    buble: "",
    blackDot: "",
    waving: "",
    dekok: "",
    weldline: "",
    overcut: "",
    whitemark: "",
    benang: "",
    kelang: "",
    galer: "",
    scratch: "",
    gompal: "",
    pinHole: "",
    other: "",
    keterangan: "",
};

const NG_PROCESS_FIELDS = [
    { id: "shortShort" as keyof NgProcessValues, label: "Short-short" },
    { id: "silver" as keyof NgProcessValues, label: "Silver" },
    { id: "flekGas" as keyof NgProcessValues, label: "Flek Gas" },
    { id: "buble" as keyof NgProcessValues, label: "Buble" },
    { id: "blackDot" as keyof NgProcessValues, label: "Black Dot" },
    { id: "waving" as keyof NgProcessValues, label: "Waving" },
    { id: "dekok" as keyof NgProcessValues, label: "Dekok" },
    { id: "weldline" as keyof NgProcessValues, label: "Weldline" },
    { id: "overcut" as keyof NgProcessValues, label: "Overcut" },
    { id: "whitemark" as keyof NgProcessValues, label: "Whitemark" },
    { id: "benang" as keyof NgProcessValues, label: "Benang" },
    { id: "kelang" as keyof NgProcessValues, label: "Kelang" },
    { id: "galer" as keyof NgProcessValues, label: "Galer" },
    { id: "scratch" as keyof NgProcessValues, label: "Scratch" },
    { id: "gompal" as keyof NgProcessValues, label: "Gompal" },
    { id: "pinHole" as keyof NgProcessValues, label: "Pin Hole" },
    { id: "other" as keyof NgProcessValues, label: "Other" },
];

const NgProcessPopup: React.FC<NgProcessPopupProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    title = "INPUT DATA NG TENGAH PROSES",
}) => {
    const [formData, setFormData] = useState<NgProcessValues>(initialData || DEFAULT_NG_PROCESS_DATA);

    const scrollYRef = useRef<number>(0);

    // Sync initial state when modal opens
    useEffect(() => {
        if (open) {
            setFormData(initialData || DEFAULT_NG_PROCESS_DATA);
        }
    }, [open, initialData]);

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

    const handleInputChange = (field: keyof NgProcessValues, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Auto-sum calculation (excluding the text 'keterangan' field)
    const totalNg = Object.entries(formData).reduce((acc, [key, curr]) => {
        if (key === 'keterangan') return acc;
        const val = Number(curr);
        return acc + (!isNaN(val) ? val : 0);
    }, 0);

    const handleSubmit = () => {
        // Validate and submit non-zero values / empty string is considered 0 on save by the consumer
        onSubmit(formData);
        handleClose();
    };

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 z-[10000]"
                onClick={handleClose}
            />

            {/* MODAL */}
            <div className="fixed inset-0 z-[10010] flex items-end justify-center pointer-events-none pt-10">
                <div
                    className="pointer-events-auto relative flex flex-col w-full max-w-[450px] bg-[#1e2124] overflow-hidden rounded-t-[32px] max-h-[95vh] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_10px_20px_rgba(0,0,0,0.4)]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 shrink-0">
                        <h2 className="text-[17px] font-bold text-white tracking-wide uppercase">{title}</h2>
                        <button
                            onClick={handleClose}
                            className="rounded-full bg-white/10 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5 custom-scrollbar">
                        {/* Total NG Card */}
                        <div className="bg-[#2a4d66] rounded-xl p-5 flex flex-col items-center justify-center space-y-1 shadow-inner">
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">TOTAL NG</span>
                            <span className="text-[42px] leading-none font-bold text-white">{totalNg}</span>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4 pt-2">
                            {NG_PROCESS_FIELDS.map((field) => (
                                <div key={field.id} className="space-y-1.5">
                                    <label className="text-sm font-bold text-white/90">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData[field.id]}
                                            onChange={(e) => handleInputChange(field.id, e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full bg-[#151719] text-white rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-white/10 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/40 pointer-events-none">
                                            pcs
                                        </span>
                                    </div>

                                    {/* Conditional Keterangan Field for 'Other' */}
                                    {field.id === 'other' && Number(formData.other) > 0 && (
                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-bold text-white/60 uppercase">Keterangan (Wajib diisi jika Other &gt; 0)</label>
                                            <textarea
                                                value={formData.keterangan}
                                                onChange={(e) => handleInputChange('keterangan', e.target.value)}
                                                placeholder="Sebutkan detail kerusakan..."
                                                className="w-full mt-1.5 min-h-[60px] bg-[#151719] text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-white/10 transition-colors resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-row gap-3 px-6 pb-6 pt-4 shrink-0 bg-[#1e2124] border-t border-white/5">
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3.5 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-colors"
                        >
                            Batal Tambahkan
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3.5 rounded-full bg-[#3ab7ff] text-[#0a1f2e] text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#3ab7ff]/20"
                        >
                            Tambahkan Data
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NgProcessPopup;
