import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { type OpcionMes, MesesUtils } from '@/types/cambios/cambiosTypes';

interface SelectorMesesProps {
  valorSeleccionado: string;
  onCambio: (valor: string) => void;
  deshabilitado?: boolean;
  className?: string;
}

export const SelectorMeses: React.FC<SelectorMesesProps> = ({
  valorSeleccionado,
  onCambio,
  deshabilitado = false,
  className = ''
}) => {
  const [opciones, setOpciones] = useState<OpcionMes[]>([]);

  useEffect(() => {
    const opcionesMeses = MesesUtils.generarOpcionesMeses(24); // Últimos 24 meses
    setOpciones(opcionesMeses);
  }, []);

  const opcionSeleccionada = opciones.find(opcion => opcion.valor === valorSeleccionado);

  return (
    <div className={`min-w-[200px] ${className}`}>
      <Select.Root 
        value={valorSeleccionado} 
        onValueChange={onCambio}
        disabled={deshabilitado}
      >
        <Select.Trigger className={`
          w-full flex items-center justify-between px-4 py-3 
          bg-white/10 border border-white/20 rounded-xl text-white 
          hover:bg-white/15 transition-all focus:outline-none 
          focus:border-[#B695BF] data-[state=open]:border-[#B695BF]
          ${deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          shadow-lg backdrop-blur-sm
        `}>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#B695BF]/20 rounded-lg">
              <Calendar className="w-4 h-4 text-[#B695BF]" />
            </div>
            <div className="text-left">
              <div className="text-xs text-white/60 font-medium">
                📅 Periodo
              </div>
              <Select.Value placeholder="Seleccionar mes">
                {opcionSeleccionada?.etiqueta || 'Seleccionar mes'}
              </Select.Value>
            </div>
          </div>
          <Select.Icon>
            <ChevronDown className="w-4 h-4 text-white/60" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content 
            className="bg-[#212026] border border-white/20 rounded-xl shadow-2xl z-[9999] overflow-hidden min-w-[280px]"
            position="popper"
            sideOffset={4}
          >
            <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-[#212026] text-white cursor-default">
              <ChevronDown className="w-4 h-4 rotate-180" />
            </Select.ScrollUpButton>
            
            <Select.Viewport className="p-2 max-h-80">
              {/* Header del dropdown */}
              <div className="px-3 py-2 border-b border-white/10 mb-2">
                <span className="text-sm font-medium text-white/80">
                  🗓️ Seleccionar periodo
                </span>
              </div>

              {/* Opciones de meses */}
              {opciones.map((opcion) => {
                const esActual = opcion.mes === MesesUtils.obtenerMesActual().mes && 
                                opcion.año === MesesUtils.obtenerMesActual().año;
                
                return (
                  <Select.Item
                    key={opcion.valor}
                    value={opcion.valor}
                    className={`
                      relative flex items-center justify-between px-3 py-3 text-sm 
                      text-white/80 cursor-pointer hover:bg-white/10 
                      focus:bg-white/15 focus:outline-none rounded-lg 
                      data-[state=checked]:bg-[#B695BF]/20 
                      data-[state=checked]:text-[#B695BF] transition-colors
                      ${esActual ? 'bg-[#51590E]/10 border border-[#51590E]/30' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-2 h-2 rounded-full flex-shrink-0
                        ${esActual ? 'bg-[#51590E]' : 'bg-white/30'}
                      `} />
                      <div>
                        <Select.ItemText>
                          <span className="font-medium">{opcion.nombre}</span>
                          <span className="text-white/60 ml-2">{opcion.año}</span>
                        </Select.ItemText>
                        {esActual && (
                          <div className="text-xs text-[#51590E] mt-0.5">
                            📍 Mes actual
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Select.ItemIndicator className="ml-2">
                      <Check className="w-4 h-4 text-[#B695BF]" />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}

              {/* Footer informativo */}
              <div className="px-3 py-2 border-t border-white/10 mt-2">
                <span className="text-xs text-white/50">
                  💡 Mostrando últimos 24 meses disponibles
                </span>
              </div>
            </Select.Viewport>
            
            <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-[#212026] text-white cursor-default">
              <ChevronDown className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default SelectorMeses;