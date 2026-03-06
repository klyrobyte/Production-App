const AppHeader = () => {
  const today = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const dateStr = `${days[today.getDay()]}, ${String(today.getDate()).padStart(2, "0")} ${months[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <header className="flex items-center justify-between py-4">
      {/* Logo */}
      <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
        <img
          src="./cdn/comp.jpg"
          alt="Company Logo"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<span class="text-xs font-bold text-foreground">CO</span>';
          }}
        />
      </div>

      {/* Date pill with liquid glass */}
      <div className="liquid-glass rounded-full px-4 py-1.5 relative overflow-hidden">
        {/* Glossy highlight */}
        <div
          className="absolute pointer-events-none inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%)",
          }}
        />
        <span className="relative text-xs font-medium text-foreground">
          {dateStr}
        </span>
      </div>
    </header>
  );
};

export default AppHeader;
