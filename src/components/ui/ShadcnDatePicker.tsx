"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface ShadcnDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
}

export const ShadcnDatePicker: React.FC<ShadcnDatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  placeholder = "Elegir fecha",
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-left font-normal bg-white/10 border border-white/10 rounded-lg text-white/80"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-white/50" />
          {value ? (
            format(value, "dd/MM/yyyy", { locale: es })
          ) : (
            <span className="text-white/50">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#212026] border border-white/20 rounded-xl shadow-2xl">
        <Calendar
          mode="single"
          required
          selected={value ?? undefined}
          onSelect={onChange}
          disabled={(date) => {
            if (min && date < min) return true;
            if (max && date > max) return true;
            return false;
          }}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
