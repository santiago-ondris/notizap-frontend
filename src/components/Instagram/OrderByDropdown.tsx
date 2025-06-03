import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export const OrderByDropdown: React.FC<Props> = ({ options, value, onChange, label = "Ordenar por:" }) => {
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.value === value);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[120px] justify-between">
            {selected?.label || "Seleccionar"}
            <ChevronDown size={18} className="ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-0 w-[140px]">
          <div className="py-2">
            {options.map(opt => (
              <button
                key={opt.value}
                className={`w-full px-4 py-2 text-left hover:bg-violet-100 dark:hover:bg-violet-900 transition ${
                  value === opt.value ? "font-bold text-violet-700" : ""
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
