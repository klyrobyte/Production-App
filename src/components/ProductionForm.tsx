import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SHIFTS,
} from "@/data/productionData";
import { useProductionData, SebangoDetail } from "@/hooks/useProductionData";
import LossTimePopup, { LossTimeData } from "@/components/LossTimePopup";
import NgDataPopup, { NgDataValues } from "@/components/NgDataPopup";
import NgProcessPopup, { NgProcessValues } from "@/components/NgProcessPopup";

// ── Reusable dropdown ─────────────────────────────────────────────────
interface CustomSelectProps {
  label: string;
  options: readonly string[] | string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}

const CustomSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  searchable,
}: CustomSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayOptions = searchable && search
    ? options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm text-foreground",
              disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            <span
              className={value ? "text-foreground" : "text-muted-foreground"}
            >
              {value || placeholder || `Pilih ${label.toLowerCase()}`}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-300",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-1 bg-secondary border-border max-h-60 overflow-y-auto flex flex-col gap-1"
          align="start"
        >
          {searchable && (
            <div className="sticky top-0 bg-secondary z-10 pb-1 pt-1 px-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ketik untuk mencari..."
                className="w-full rounded-md bg-background px-3 py-2 text-sm text-foreground outline-none border border-border focus:border-[#22A8F7] transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {displayOptions.length > 0 ? (
            displayOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  value === opt
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Tidak ada hasil yang ditemukan.
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

// ── Read-only field with optional unit badge ──────────────────────────
const ReadOnlyField = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="space-y-1">
    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </label>
    <div className="flex items-center rounded-xl bg-secondary px-4 py-3">
      <span className="flex-1 text-sm font-bold text-foreground">{value}</span>
      {unit && (
        <span className="ml-2 rounded-md bg-card px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// ── Editable input with unit badge ────────────────────────────────────
const InputField = ({
  label,
  value,
  onChange,
  unit,
  headerRight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  headerRight?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {headerRight}
    </div>
    <div className="flex items-center rounded-xl bg-secondary overflow-hidden">
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        placeholder="0"
      />
      <span className="mr-3 rounded-md bg-card px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground tracking-wider shrink-0">
        {unit}
      </span>
    </div>
  </div>
);

// ── Main form ─────────────────────────────────────────────────────────
const ProductionForm = () => {
  // Form state
  const [date, setDate] = useState<Date>();
  const [factory, setFactory] = useState("");
  const [machine, setMachine] = useState("");
  const [shift, setShift] = useState("");
  const [operator, setOperator] = useState("");
  const [sebango, setSebango] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  // Hook data
  const {
    factories,
    machinesByFactory,
    tonaseMap,
    operators: operatorData,
    sebangoOptions,
    sebangoDetails,
    loading: dbLoading,
    error: dbError
  } = useProductionData();

  // Production input fields
  const [planTeiTei, setPlanTeiTei] = useState("");
  const [actualTotal, setActualTotal] = useState("");
  const [actualDirectOk, setActualDirectOk] = useState("");
  const [actualOkRepair, setActualOkRepair] = useState("");
  const [actualCycleTime, setActualCycleTime] = useState("");
  const [planDanGai, setPlanDanGai] = useState("");
  const [actualDanGai, setActualDanGai] = useState("");
  const [lossTime, setLossTime] = useState("");

  // LossTime Popup states
  const [lossTimePopupOpen, setLossTimePopupOpen] = useState(false);
  const [lossTimeData, setLossTimeData] = useState<LossTimeData | null>(null);

  // Dan Go Popup states
  const [danGoPopupOpen, setDanGoPopupOpen] = useState(false);
  const [danGoData, setDanGoData] = useState<NgDataValues | null>(null);

  // NgAwal Popup states
  const [ngAwalPopupOpen, setNgAwalPopupOpen] = useState(false);
  const [ngAwalData, setNgAwalData] = useState<NgDataValues | null>(null);

  // NgProcess (NG Tengah Proses) Popup states
  const [ngProcessPopupOpen, setNgProcessPopupOpen] = useState(false);
  const [ngProcessData, setNgProcessData] = useState<NgProcessValues | null>(null);

  // Detail NG fields
  const [ngAwal, setNgAwal] = useState("");
  const [ngTengahProses, setNgTengahProses] = useState("");

  const computedNgTotal = (Number(ngAwal) || 0) + (Number(ngTengahProses) || 0);
  const ngTotal = computedNgTotal > 0 ? computedNgTotal.toString() : "";

  // Lain Lain Nya fields
  const [danGo, setDanGo] = useState("");
  const [trial, setTrial] = useState("");
  const [danGoPart, setDanGoPart] = useState("");

  // Derived keys
  const machineKey = factory && machine ? `${factory}|${machine}` : "";

  // Derived data
  const machineOptions = factory ? machinesByFactory[factory] ?? [] : [];
  const tonase = machineKey ? tonaseMap[machineKey] ?? "-" : "";
  const detail: SebangoDetail | null = sebango ? sebangoDetails[sebango] : null;

  // Format operators appropriately dependent on db format
  const operators = operatorData.map(op => op.name || op.nama_operator || op.operator || String(op.id)).filter(Boolean);

  // Check if all required fields are filled
  const isFormComplete = Boolean(
    date &&
    factory &&
    machine &&
    shift &&
    sebango &&
    planTeiTei &&
    actualTotal &&
    actualDirectOk &&
    actualOkRepair &&
    actualCycleTime &&
    planDanGai &&
    actualDanGai &&
    lossTime &&
    ngAwal &&
    ngTengahProses &&
    ngTotal &&
    danGo &&
    trial &&
    danGoPart
  );

  // Clear entire form
  const clearForm = () => {
    setDate(undefined);
    setFactory("");
    setMachine("");
    setShift("");
    setOperator("");
    setSebango("");
    setDetailOpen(false);
    setPlanTeiTei("");
    setActualTotal("");
    setActualDirectOk("");
    setActualOkRepair("");
    setActualCycleTime("");
    setPlanDanGai("");
    setActualDanGai("");
    setLossTime("");
    setNgAwal("");
    setNgTengahProses("");
    setNgTotal("");
    setDanGo("");
    setTrial("");
    setDanGoPart("");
  };

  // Reset handlers
  const handleFactoryChange = (v: string) => {
    setFactory(v);
    setMachine("");
    setSebango("");
    setDetailOpen(false);
  };

  const handleMachineChange = (v: string) => {
    setMachine(v);
    setSebango("");
    setDetailOpen(false);
  };

  const handleSebangoChange = (v: string) => {
    setSebango(v);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground md:hidden">
        Buat daftar produksi baru
      </h2>

      {dbError && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 font-medium">
          Error connecting to database: {dbError}
        </div>
      )}

      {/* ── Date Picker ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prod. Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
              <span
                className={
                  date ? "text-foreground" : "text-muted-foreground"
                }
              >
                {date
                  ? format(date, "dd MMMM yyyy", { locale: localeId })
                  : "Pilih tanggal"}
              </span>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-card border-border"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Factory ─────────────────────────────────────────────── */}
      <CustomSelect
        label="Factory"
        options={factories}
        value={factory}
        onChange={handleFactoryChange}
        disabled={dbLoading}
        placeholder={dbLoading ? "Loading factories..." : undefined}
      />

      {/* ── Machine (conditional on factory) ────────────────────── */}
      <CustomSelect
        label="Mesin"
        options={machineOptions}
        value={machine}
        onChange={handleMachineChange}
        placeholder={
          dbLoading ? "Loading..." : factory ? "Pilih mesin" : "Pilih factory terlebih dahulu"
        }
        disabled={!factory || dbLoading}
      />

      {/* ── Shift ───────────────────────────────────────────────── */}
      <CustomSelect
        label="Shift"
        options={[...SHIFTS]}
        value={shift}
        onChange={setShift}
      />

      {/* ── Operator (optional) ─────────────────────────────────── */}
      <CustomSelect
        label="Operator"
        options={operators}
        value={operator}
        onChange={setOperator}
        placeholder={dbLoading ? "Loading operators..." : "Tolong Pilih Operator"}
        disabled={dbLoading}
      />

      {/* ── Tonase (read-only, shows when machine selected) ─────── */}
      {machine && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tonase
          </label>
          <div className="flex items-center rounded-xl bg-secondary px-4 py-3">
            <span className="text-sm font-bold text-foreground">
              {tonase}
            </span>
          </div>
        </div>
      )}

      {/* ── Sebango (independent of machine) ────────────────────── */}
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        <CustomSelect
          label="Sebango"
          options={sebangoOptions}
          value={sebango}
          onChange={handleSebangoChange}
          placeholder={dbLoading ? "Loading sebango..." : "Tolong pilih sebango"}
          disabled={dbLoading}
          searchable
        />
      </div>

      {/* ── Detail Produksi (collapsible, shows when sebango selected) */}
      {sebango && detail && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <button
            onClick={() => setDetailOpen((prev) => !prev)}
            className="flex w-full items-center justify-between py-2"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detail Produksi
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {detailOpen ? "Tutup Detail" : "Lihat Detail"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  detailOpen && "rotate-180"
                )}
              />
            </span>
          </button>

          {/* Collapsed placeholder */}
          {!detailOpen && (
            <div className="rounded-xl bg-secondary px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Buka Detail untuk melihat
              </span>
            </div>
          )}

          {/* Expanded detail */}
          {detailOpen && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl bg-card/50 border border-border p-4">
              <ReadOnlyField label="Sebango" value={detail.sebango} />
              <ReadOnlyField label="Part Name" value={detail.partName} />
              <ReadOnlyField label="Part No" value={detail.partNo} />
              <ReadOnlyField label="Model" value={detail.model} />
              <ReadOnlyField label="Material" value={detail.material} />
              <ReadOnlyField
                label="PCS/Mold"
                value={detail.pcsMold}
                unit="PCS"
              />
              <ReadOnlyField
                label="Cycle Time Gentan-I"
                value={detail.cycleTimeGentanI}
                unit="DTK"
              />
              <ReadOnlyField
                label="Part Weight Gentan-I"
                value={detail.partWeightGentanI}
                unit="GRAM"
              />
              <ReadOnlyField
                label="Runner Weight Gentan-I"
                value={detail.runnerWeightGentanI}
                unit="GRAM"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Production Input Fields ─────────────────────────────── */}
      <InputField
        label="Plan Tei Tei"
        value={planTeiTei}
        onChange={setPlanTeiTei}
        unit="PCS"
      />

      <InputField
        label="Actual Total"
        value={actualTotal}
        onChange={setActualTotal}
        unit="PCS"
      />

      <InputField
        label="Actual Direct OK"
        value={actualDirectOk}
        onChange={setActualDirectOk}
        unit="PCS"
      />

      <InputField
        label="Actual OK Repair"
        value={actualOkRepair}
        onChange={setActualOkRepair}
        unit="PCS"
      />

      <InputField
        label="Actual Cycle Time"
        value={actualCycleTime}
        onChange={setActualCycleTime}
        unit="DTK"
      />

      <InputField
        label="Plan Dan - Gai"
        value={planDanGai}
        onChange={setPlanDanGai}
        unit="MNT"
      />

      <InputField
        label="Actual Dan - Gai"
        value={actualDanGai}
        onChange={setActualDanGai}
        unit="MNT"
      />

      <InputField
        label="Loss Time"
        value={lossTime}
        onChange={setLossTime}
        unit="MNT"
        headerRight={
          <button
            type="button"
            onClick={() => setLossTimePopupOpen(true)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>(Tambahkan Detail)</span>
            <Plus className="h-4 w-4 rounded-md bg-card p-0.5" />
          </button>
        }
      />

      {/* ── Detail NG ─────────────────────────────────────────────── */}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">
        Detail NG
      </h3>

      <InputField
        label="(NG) Awal"
        value={ngAwal}
        onChange={setNgAwal}
        unit="PCS"
        headerRight={
          <button
            type="button"
            onClick={() => setNgAwalPopupOpen(true)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors pointer-events-auto relative z-10"
          >
            <span>(Tambahkan Detail)</span>
            <Plus className="h-4 w-4 rounded-md bg-card p-0.5" />
          </button>
        }
      />

      <InputField
        label="(NG) Tengah Proses"
        value={ngTengahProses}
        onChange={setNgTengahProses}
        unit="PCS"
        headerRight={
          <button
            type="button"
            onClick={() => setNgProcessPopupOpen(true)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors pointer-events-auto relative z-10"
          >
            <span>(Tambahkan Detail)</span>
            <Plus className="h-4 w-4 rounded-md bg-card p-0.5" />
          </button>
        }
      />

      <ReadOnlyField
        label="(NG) Total"
        value={ngTotal || "0"}
        unit="PCS"
      />

      {/* ── Lain Lain Nya ─────────────────────────────────────────── */}
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground pt-4 border-t border-border">
        Lain Lain Nya
      </h3>

      <InputField
        label="Dan Go"
        value={danGo}
        onChange={setDanGo}
        unit="PCS"
      />

      <InputField
        label="Trial"
        value={trial}
        onChange={setTrial}
        unit="PCS"
        headerRight={
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>(Tambahkan Detail)</span>
            <Plus className="h-4 w-4 rounded-md bg-card p-0.5" />
          </button>
        }
      />

      <InputField
        label="Dan Go Part"
        value={danGoPart}
        onChange={setDanGoPart}
        unit="PCS"
      />

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "OK Rasio", value: "0" },
            { label: "Efesiensi", value: "0" },
            { label: "Budomari", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex items-center justify-center rounded-xl bg-secondary py-4">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit Buttons ───────────────────────────────────────── */}
      <div className="space-y-3 pt-4">
        <button
          type="button"
          disabled={!isFormComplete}
          onClick={() => {
            // Static save — will integrate with DB later
            clearForm();
          }}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300",
            isFormComplete
              ? "bg-[#22A8F7] text-white shadow-lg shadow-[#22A8F7]/25 hover:brightness-110 active:scale-[0.98]"
              : "bg-[#22A8F7]/20 text-[#22A8F7]/40 cursor-not-allowed"
          )}
        >
          Simpan dan Lanjutkan
        </button>

        <button
          type="button"
          disabled={!isFormComplete}
          onClick={() => {
            // Static save — keeps form data
          }}
          className={cn(
            "w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all duration-300",
            isFormComplete
              ? "bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/25 hover:brightness-110 active:scale-[0.98]"
              : "bg-[#22C55E]/20 text-[#22C55E]/40 cursor-not-allowed"
          )}
        >
          Simpan Aja
        </button>
      </div>

      <LossTimePopup
        open={lossTimePopupOpen}
        onClose={() => setLossTimePopupOpen(false)}
        initialTotal={lossTimeData?.totalLossTime ?? (Number(lossTime) || 0)}
        initialEntries={lossTimeData?.entries || []}
        onSubmit={(data) => {
          setLossTimeData(data);
          setLossTime(data.totalLossTime.toString());
        }}
      />

      <NgDataPopup
        open={ngAwalPopupOpen}
        onClose={() => setNgAwalPopupOpen(false)}
        initialData={ngAwalData || undefined}
        title="INPUT DATA NG AWAL"
        onSubmit={(data) => {
          setNgAwalData(data);

          const totalNg = Object.values(data).reduce((acc, curr) => {
            const val = Number(curr);
            return acc + (!isNaN(val) ? val : 0);
          }, 0);

          setNgAwal(totalNg.toString());
        }}
      />

      <NgDataPopup
        open={danGoPopupOpen}
        onClose={() => setDanGoPopupOpen(false)}
        initialData={danGoData || undefined}
        title="INPUT DATA DAN GO"
        onSubmit={(data) => {
          setDanGoData(data);

          // Calculate the total automatically for the Dan Go field
          const totalNg = Object.values(data).reduce((acc, curr) => {
            const val = Number(curr);
            return acc + (!isNaN(val) ? val : 0);
          }, 0);

          setDanGo(totalNg.toString());
        }}
      />

      <NgProcessPopup
        open={ngProcessPopupOpen}
        onClose={() => setNgProcessPopupOpen(false)}
        initialData={ngProcessData || undefined}
        title="INPUT DATA NG TENGAH PROSES"
        onSubmit={(data) => {
          setNgProcessData(data);

          // Calculate the total automatically for the NG Tengah Proses field
          const totalNg = Object.entries(data).reduce((acc, [key, curr]) => {
            if (key === 'keterangan') return acc;
            const val = Number(curr);
            return acc + (!isNaN(val) ? val : 0);
          }, 0);

          setNgTengahProses(totalNg.toString());
        }}
      />
    </div>
  );
};

export default ProductionForm;
