import React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, RotateCcw } from "lucide-react";
import { formatDateForDisplay } from "@/utils/instagram/instagramUtils";

interface DateRangePickerProps {
  dateFrom: Date;
  dateTo: Date;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  disabled = false,
  className = ""
}) => {
  const [isFromOpen, setIsFromOpen] = React.useState(false);
  const [isToOpen, setIsToOpen] = React.useState(false);

  const getPreviousMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: firstDay, to: lastDay };
  };

  const handleResetToPreviousMonth = () => {
    const { from, to } = getPreviousMonth();
    onDateFromChange(from);
    onDateToChange(to);
  };

  const handleFromDateSelect = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      onDateFromChange(localDate);
      setIsFromOpen(false);
      
      if (localDate > dateTo) {
        const newToDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
        onDateToChange(newToDate);
      }
    }
  };

  const handleToDateSelect = (date: Date | undefined) => {
    if (date) {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      onDateToChange(localDate);
      setIsToOpen(false);
      
      if (localDate < dateFrom) {
        const newFromDate = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
        onDateFromChange(newFromDate);
      }
    }
  };

  const calculateDaysDifference = () => {
    return Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        
        <button
          onClick={handleResetToPreviousMonth}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 hover:border-[#51590E]/50 text-[#51590E] rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-3 w-3" />
          Mes anterior
        </button>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha Desde */}
        <div className="space-y-2">
          <label className="text-xs text-white/60 font-medium">Desde</label>
          <Popover.Root open={isFromOpen} onOpenChange={setIsFromOpen}>
            <Popover.Trigger asChild>
              <button
                className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:bg-white/15 focus:bg-white/15 focus:border-[#B695BF]/50 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4 text-[#B695BF]" />
                <span className={dateFrom ? "text-white/90" : "text-white/50"}>
                  {dateFrom ? formatDateForDisplay(dateFrom) : "Seleccionar fecha"}
                </span>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-[#212026] backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl z-50 p-4"
                align="start"
                sideOffset={5}
              >
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleFromDateSelect}
                  disabled={(date) => 
                    date > new Date() || date < new Date("2020-01-01")
                  }
                  className="calendar-notizap"
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Fecha Hasta */}
        <div className="space-y-2">
          <label className="text-xs text-white/60 font-medium">Hasta</label>
          <Popover.Root open={isToOpen} onOpenChange={setIsToOpen}>
            <Popover.Trigger asChild>
              <button
                className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white/80 hover:bg-white/15 focus:bg-white/15 focus:border-[#B695BF]/50 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4 text-[#B695BF]" />
                <span className={dateTo ? "text-white/90" : "text-white/50"}>
                  {dateTo ? formatDateForDisplay(dateTo) : "Seleccionar fecha"}
                </span>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-[#212026] backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl z-50 p-4"
                align="start"
                sideOffset={5}
              >
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleToDateSelect}
                  disabled={(date) => 
                    date > new Date() || 
                    date < new Date("2020-01-01") ||
                    date < dateFrom
                  }
                  className="calendar-notizap"
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      {/* Range Summary */}
      {dateFrom && dateTo && (
        <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#B695BF]"></div>
              <span className="text-white/80">
                {formatDateForDisplay(dateFrom)} - {formatDateForDisplay(dateTo)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">📊</span>
              <span className="font-semibold text-[#B695BF]">
                {calculateDaysDifference()} días
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;