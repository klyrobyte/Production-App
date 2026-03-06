interface ScanButtonProps {
  onClick: () => void;
}

const ScanButton = ({ onClick }: ScanButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-[76px] h-[60px] rounded-[18px]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 12px 32px rgba(0,12,22,0.48), 0 4px 8px rgba(0,0,0,0.32)",
      }}
    >
      {/* Specular highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "12%",
          top: "8%",
          width: "55%",
          height: "35%",
          borderRadius: "40px",
          background: "rgba(255,255,255,0.18)",
          filter: "blur(12px)",
          transform: "rotate(-18deg)",
        }}
      />

      {/* Inner blue plate */}
      <div
        className="relative flex items-center justify-center w-[48px] h-[48px] rounded-[12px] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #22A8F7 0%, #0EA0F0 60%, #0491E3 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        {/* Plate specular */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "10%",
            top: "5%",
            width: "65%",
            height: "38%",
            borderRadius: "30px",
            background: "rgba(255,255,255,0.45)",
            filter: "blur(10px)",
            transform: "rotate(-15deg)",
          }}
        />

        {/* Scanner icon */}
        <svg
          viewBox="0 0 72 72"
          width="30"
          height="30"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <rect
            x="10"
            y="10"
            width="52"
            height="52"
            rx="10"
            ry="10"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="22" y="33" width="28" height="5" rx="2.5" fill="white" />
        </svg>
      </div>
    </button>
  );
};

export default ScanButton;
