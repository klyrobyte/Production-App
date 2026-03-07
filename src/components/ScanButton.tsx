interface ScanButtonProps {
  onClick: () => void;
}

const ScanButton = ({ onClick }: ScanButtonProps) => {
  return (
    <button
      onClick={onClick}
      role="button"
      aria-label="Scan QR / barcode"
      className="scan-btn relative flex items-center justify-center overflow-hidden"
      style={{
        width: "100px",
        height: "48px",
        borderRadius: "24px",
        background: "rgba(45, 45, 45, 0.6)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: `
          0 4px 12px rgba(0, 0, 0, 0.3),
          inset 0 2px 4px rgba(255, 255, 255, 0.05)
        `,
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
    >
      {/* Top edge glossy highlight — 3D glass look */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "50%",
          borderRadius: "24px 24px 0 0",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)",
        }}
      />

      {/* Scanner icon — corner brackets + center line */}
      <svg
        viewBox="0 0 48 48"
        width="26"
        height="26"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Top-left corner */}
        <path
          d="M6 16V10C6 7.8 7.8 6 10 6H16"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Top-right corner */}
        <path
          d="M32 6H38C40.2 6 42 7.8 42 10V16"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom-left corner */}
        <path
          d="M6 32V38C6 40.2 7.8 42 10 42H16"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom-right corner */}
        <path
          d="M32 42H38C40.2 42 42 40.2 42 38V32"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center scan line */}
        <rect x="12" y="22.5" width="24" height="3" rx="1.5" fill="white" />
      </svg>
    </button>
  );
};

export default ScanButton;
