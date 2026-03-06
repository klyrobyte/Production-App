import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FACTORIES = ["Factory A", "Factory B", "Factory C"];
const MACHINES = ["Mesin 1", "Mesin 2", "Mesin 3", "Mesin 4"];
const SHIFTS = ["Shift 1 (06:00-14:00)", "Shift 2 (14:00-22:00)", "Shift 3 (22:00-06:00)"];

interface CustomSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

const CustomSelect = ({ label, options, value, onChange }: CustomSelectProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm text-foreground">
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || `Pilih ${label.toLowerCase()}`}
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
          className="w-[var(--radix-popover-trigger-width)] p-1 bg-secondary border-border"
          align="start"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
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
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
};

const ProductionForm = () => {
  const [date, setDate] = useState<Date>();
  const [factory, setFactory] = useState("");
  const [machine, setMachine] = useState("");
  const [shift, setShift] = useState("");

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground md:hidden">
        Buat daftar produksi baru
      </h2>

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Prod. Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
              <span className={date ? "text-foreground" : "text-muted-foreground"}>
                {date ? format(date, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
              </span>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
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

      <CustomSelect label="Factory" options={FACTORIES} value={factory} onChange={setFactory} />
      <CustomSelect label="Mesin" options={MACHINES} value={machine} onChange={setMachine} />
      <CustomSelect label="Shift" options={SHIFTS} value={shift} onChange={setShift} />
    </div>
  );
};

export default ProductionForm;
