interface ScanButtonProps {
  onClick: () => void;
}

const ScanButton = ({ onClick }: ScanButtonProps) => {
  return (
    <button
      onClick={onClick}
      role="button"
      aria-label="Scan QR / barcode"
      className="relative flex items-center justify-center w-[100px] h-[80px] rounded-[20px] transition-transform duration-150 active:scale-[0.98] hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 14px 36px rgba(0,8,18,0.62), 0 6px 12px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.06)",
        outline: "1px solid rgba(0,0,0,0.48)",
      }}
    >
      {/* Subtle specular */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "14%",
          top: "10%",
          width: "50%",
          height: "30%",
          borderRadius: "40px",
          background: "rgba(255,255,255,0.12)",
          filter: "blur(14px)",
          transform: "rotate(-18deg)",
        }}
      />

      {/* Inner blue plate */}
      <div
        className="relative flex items-center justify-center w-[64px] h-[64px] rounded-[14px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #2DB6FF 0%, #1AA0F5 60%, #0EA0F0 100%)",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.18)",
        }}
      >
        {/* Subtle plate specular */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "12%",
            top: "6%",
            width: "60%",
            height: "36%",
            borderRadius: "30px",
            background: "rgba(255,255,255,0.3)",
            filter: "blur(12px)",
            transform: "rotate(-15deg)",
          }}
        />

        {/* Scanner icon — corner brackets + center dash */}
        <svg
          viewBox="0 0 48 48"
          width="36"
          height="36"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Top-left corner */}
          <path d="M4 16V8C4 5.8 5.8 4 8 4H16" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Top-right corner */}
          <path d="M32 4H40C42.2 4 44 5.8 44 8V16" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bottom-left corner */}
          <path d="M4 32V40C4 42.2 5.8 44 8 44H16" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Bottom-right corner */}
          <path d="M32 44H40C42.2 44 44 42.2 44 40V32" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Center scan line */}
          <rect x="12" y="22.5" width="24" height="3" rx="1.5" fill="white" />
        </svg>
      </div>
    </button>
  );
};

export default ScanButton;
