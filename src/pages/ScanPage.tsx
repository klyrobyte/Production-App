import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    RotateCcw,
    HelpCircle,
    Camera,
    X,
    ArrowRight,
    Upload,
    Files,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/usePersistentState";

// ── ScanPage ──────────────────────────────────────────────────────────
const ScanPage = () => {
    const navigate = useNavigate();

    // Notification
    const [showNotif, setShowNotif] = useState(true);

    // Camera mirroring
    const [mirrored, setMirrored] = useState(false);

    // Collapsible panel — persisted
    const [panelOpen, setPanelOpen] = usePersistentState(
        "scan_main_hover_state",
        true
    );

    // Camera stream
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCam, setHasCam] = useState(false);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setHasCam(true);
            }
        } catch {
            setHasCam(false);
        }
    }, []);

    useEffect(() => {
        startCamera();
        return () => {
            // cleanup stream
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach((t) => t.stop());
            }
        };
    }, [startCamera]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") navigate(-1);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [navigate]);

    // File uploads
    const singleUploadRef = useRef<HTMLInputElement>(null);
    const multiUploadRef = useRef<HTMLInputElement>(null);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black">
            {/* ── HEADER ──────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-3 pb-2">
                {/* Sub 1: nav row */}
                <div className="flex w-full max-w-md items-center justify-between">
                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2F32] transition-colors hover:bg-[#363B3E]"
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-5 w-5 text-white" />
                    </button>

                    {/* Brand */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-white/50">Powered by</span>
                        <img
                            src="./aris.jpg"
                            alt="ARIS"
                            className="h-5 w-auto object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                (e.target as HTMLImageElement).parentElement!.insertAdjacentHTML(
                                    "beforeend",
                                    '<span class="text-sm font-black text-white tracking-wider">ARIS</span>'
                                );
                            }}
                        />
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setMirrored((p) => !p)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2F32] transition-colors hover:bg-[#363B3E]"
                            aria-label="Rotate camera"
                        >
                            <RotateCcw className="h-5 w-5 text-white" />
                        </button>
                        <button
                            onClick={() => setShowNotif(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2F32] transition-colors hover:bg-[#363B3E]"
                            aria-label="Help"
                        >
                            <HelpCircle className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Sub 2: notification pill */}
                <div
                    role="status"
                    aria-live="polite"
                    className="mt-2 w-full max-w-md flex justify-center"
                >
                    {showNotif && (
                        <div className="scan-notif-enter flex items-center gap-2 rounded-full bg-[#363B3E] px-4 py-2 text-[12px] text-white/90">
                            <span>Arahkan dokumen ke dalam bingkai. Tekan Ambil Foto</span>
                            <button
                                onClick={() => setShowNotif(false)}
                                className="shrink-0 rounded-full p-0.5 hover:bg-white/10 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* ── CAMERA AREA ────────────────────────────────────── */}
            <div
                className="flex-1 relative flex items-center justify-center overflow-hidden"
                role="application"
                aria-label="Camera preview"
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "absolute inset-0 h-full w-full object-cover",
                        mirrored && "scale-x-[-1]"
                    )}
                />
                {/* Fallback when no camera */}
                {!hasCam && (
                    <div className="relative z-10 flex flex-col items-center gap-3 text-white/40">
                        <Camera className="h-16 w-16" />
                        <span className="text-sm">Kamera tidak tersedia</span>
                    </div>
                )}
            </div>

            {/* ── FOOTER CONTROLS ────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-9">
                {/* Camera button */}
                <div className="relative -mb-6 z-10">
                    {/* Liquid glass outer ring */}
                    <div
                        className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                            backdropFilter: "blur(16px) saturate(150%)",
                            WebkitBackdropFilter: "blur(16px) saturate(150%)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            boxShadow:
                                "0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.08)",
                        }}
                    >
                        {/* Inner button */}
                        <button
                            onClick={() => {
                                // Future: emit capture:clicked
                            }}
                            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#2A2F32] transition-transform active:scale-90"
                            aria-label="Capture photo"
                        >
                            <Camera className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Collapsible main panel */}
                <div
                    className={cn(
                        "w-full max-w-md transition-all overflow-hidden",
                        panelOpen
                            ? "scan-panel-open"
                            : "scan-panel-closed"
                    )}
                    style={{
                        background: "#202427",
                        borderRadius: "24px 24px 0 0",
                        boxShadow: "inset 0 2px 6px rgba(255,255,255,0.04)",
                    }}
                >
                    {/* Drag pill / close indicator */}
                    <button
                        onClick={() => setPanelOpen((p) => !p)}
                        className="flex w-full items-center justify-center pt-3 pb-2"
                        aria-label={panelOpen ? "Close panel" : "Open panel"}
                    >
                        <div className="h-1 w-10 rounded-full bg-[#909496]" />
                    </button>

                    {/* Panel content */}
                    <div
                        className={cn(
                            "px-4 pb-6 space-y-4 transition-opacity",
                            panelOpen ? "opacity-100" : "opacity-0"
                        )}
                    >
                        {/* Help pill */}
                        <button
                            className="flex w-full items-center justify-between rounded-full px-4 py-2.5"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(1,137,255,0.25) 0%, rgba(1,137,255,0.10) 100%)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(1,137,255,0.3)",
                            }}
                        >
                            <span className="text-[12px] font-medium text-white">
                                Klik disini untuk membaca cara penggunaan nya
                            </span>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2A2F32]">
                                <ArrowRight className="h-3.5 w-3.5 text-white" />
                            </div>
                        </button>

                        {/* Upload section */}
                        <div
                            className="rounded-2xl p-3"
                            style={{
                                background: "#202427",
                                boxShadow: "inset 0 1px 3px rgba(255,255,255,0.04)",
                            }}
                        >
                            <div className="grid grid-cols-2 gap-3">
                                {/* Unggah Dokumen */}
                                <button
                                    onClick={() => singleUploadRef.current?.click()}
                                    className="flex flex-col items-center gap-2 rounded-xl bg-[#2F3336] py-4 transition-colors hover:bg-[#363B3E] active:scale-[0.97]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22A6F4]">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/80">
                                        Unggah Dokumen
                                    </span>
                                </button>

                                {/* Unggah Banyak */}
                                <button
                                    onClick={() => multiUploadRef.current?.click()}
                                    className="flex flex-col items-center gap-2 rounded-xl bg-[#2F3336] py-4 transition-colors hover:bg-[#363B3E] active:scale-[0.97]"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22A6F4]">
                                        <Files className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[11px] font-medium text-white/80">
                                        Unggah Banyak
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden file inputs */}
                <input
                    ref={singleUploadRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={() => {
                        /* future: upload:single */
                    }}
                />
                <input
                    ref={multiUploadRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={() => {
                        /* future: upload:bulk */
                    }}
                />
            </div>
        </div>
    );
};

//10 backdrop-blur-md/

export default ScanPage;
