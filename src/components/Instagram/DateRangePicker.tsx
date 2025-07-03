import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { TIME_RANGES } from '@/utils/instagram/constants';
import { formatDateRange } from '@/utils/instagram/formatters';

interface DateRangePickerProps {
  desde?: string;
  hasta?: string;
  onChange: (desde?: string, hasta?: string) => void;
  className?: string;
  disabled?: boolean;
}

type TimeRangeKey = keyof typeof TIME_RANGES;

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  desde,
  hasta,
  onChange,
  className = '',
  disabled = false
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey | 'custom'>('30d');
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [customDesde, setCustomDesde] = useState(desde || '');
  const [customHasta, setCustomHasta] = useState(hasta || '');

  /**
   * Calcula fechas para rangos predefinidos
   */
  const calculateDateRange = (range: TimeRangeKey): { desde: string; hasta: string } => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - TIME_RANGES[range].days);

    return {
      desde: inicio.toISOString().split('T')[0],
      hasta: hoy.toISOString().split('T')[0]
    };
  };

  /**
   * Maneja cambio de rango predefinido
   */
  const handleRangeChange = (range: string) => {
    setSelectedRange(range as TimeRangeKey | 'custom');

    if (range === 'custom') {
      setShowCustomInputs(true);
      return;
    }

    setShowCustomInputs(false);
    const timeRange = range as TimeRangeKey;
    const { desde: newDesde, hasta: newHasta } = calculateDateRange(timeRange);
    onChange(newDesde, newHasta);
  };

  /**
   * Maneja aplicación de fechas custom
   */
  const handleCustomApply = () => {
    if (customDesde && customHasta) {
      onChange(customDesde, customHasta);
      setShowCustomInputs(false);
    }
  };

  /**
   * Maneja limpiar filtro de fechas
   */
  const handleClear = () => {
    setSelectedRange('30d');
    setShowCustomInputs(false);
    setCustomDesde('');
    setCustomHasta('');
    onChange(undefined, undefined);
  };

  /**
   * Obtiene texto del trigger
   */
  const getTriggerText = () => {
    if (desde && hasta) {
      return formatDateRange(desde, hasta);
    }
    
    if (selectedRange !== 'custom') {
      return TIME_RANGES[selectedRange as TimeRangeKey].label;
    }
    
    return 'Seleccionar período';
  };

  /**
   * Renderiza inputs custom
   */
  const renderCustomInputs = () => {
    if (!showCustomInputs) return null;

    return (
      <div className="p-4 space-y-3 bg-[#1A1A20] border-t border-white/10">
        <div className="text-sm font-medium text-white/80 mb-2">
          📅 Período personalizado
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Desde</label>
            <input
              type="date"
              value={customDesde}
              onChange={(e) => setCustomDesde(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-white/20
                         focus:border-white/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Hasta</label>
            <input
              type="date"
              value={customHasta}
              onChange={(e) => setCustomHasta(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-white/20
                         focus:border-white/40 transition-all"
            />
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleCustomApply}
            disabled={!customDesde || !customHasta}
            className="flex-1 px-3 py-2 bg-[#51590E]/20 hover:bg-[#51590E]/30 
                       border border-[#51590E]/30 rounded-lg transition-all
                       text-[#51590E] text-sm font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
          <button
            onClick={() => setShowCustomInputs(false)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 
                       rounded-lg transition-all text-white/70 text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Select.Root
        value={selectedRange}
        onValueChange={handleRangeChange}
        disabled={disabled}
      >
        <div className="relative">
          <Select.Trigger
            className={`
              relative flex items-center justify-between gap-2 px-4 py-2.5
              bg-white/10 hover:bg-white/15 backdrop-blur-sm
              border border-white/20 hover:border-white/30
              rounded-lg transition-all duration-200
              text-white/80 hover:text-white text-sm font-medium
              min-w-[160px] h-10
              focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="truncate">
                {getTriggerText()}
              </span>
            </div>

            {(desde && hasta) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            )}

            <Select.Icon asChild>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              className="
                relative z-50 min-w-[200px] overflow-hidden rounded-lg
                bg-[#212026] border border-white/20 shadow-2xl backdrop-blur-sm
              "
              position="popper"
              side="bottom"
              align="start"
              sideOffset={8}
            >
              <Select.Viewport>
                <div className="p-2">
                  {Object.entries(TIME_RANGES).map(([key, config]) => (
                    <Select.Item
                      key={key}
                      value={key}
                      className="
                        relative flex items-center justify-between px-3 py-2.5 rounded-md
                        text-white/80 hover:text-white text-sm
                        hover:bg-white/10 focus:bg-white/10
                        cursor-pointer outline-none transition-all duration-150
                        data-[highlighted]:bg-white/10
                      "
                    >
                      <span>{config.label}</span>
                      {key !== 'custom' && (
                        <span className="text-xs text-white/50">
                          {config.days}d
                        </span>
                      )}
                    </Select.Item>
                  ))}
                  
                  <Select.Item
                    value="custom"
                    className="
                      relative flex items-center justify-between px-3 py-2.5 rounded-md
                      text-white/80 hover:text-white text-sm
                      hover:bg-white/10 focus:bg-white/10
                      cursor-pointer outline-none transition-all duration-150
                      data-[highlighted]:bg-white/10
                    "
                  >
                    <span>Personalizado</span>
                    <Calendar className="w-4 h-4 text-white/50" />
                  </Select.Item>
                </div>

                {renderCustomInputs()}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </div>
      </Select.Root>
    </div>
  );
};

export default DateRangePicker;