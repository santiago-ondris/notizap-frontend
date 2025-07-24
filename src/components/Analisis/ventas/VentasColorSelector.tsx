import React from "react";
import { Palette, Check, X } from "lucide-react";

interface VentasColorSelectorProps {
  variantesPorColor: any[];
  coloresSeleccionados: string[];
  setColoresSeleccionados: React.Dispatch<React.SetStateAction<string[]>>;
}

export const VentasColorSelector: React.FC<VentasColorSelectorProps> = ({
  variantesPorColor,
  coloresSeleccionados,
  setColoresSeleccionados,
}) => {
  const handleToggleColor = (color: string) => {
    setColoresSeleccionados((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleSelectAll = () => {
    setColoresSeleccionados(variantesPorColor.map(v => v.color));
  };

  const handleClearAll = () => {
    setColoresSeleccionados([]);
  };

  if (variantesPorColor.length === 0) {
    return (
      <div className="text-center py-8">
        <Palette className="w-8 h-8 text-white/40 mx-auto mb-3" />
        <div className="text-white/60 text-sm">
          No hay variantes de color disponibles para este producto y sucursal
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#51590E]" />
          <span className="text-white/80 text-sm font-medium">
            Colores disponibles ({variantesPorColor.length})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-[#51590E]/20 hover:bg-[#51590E]/30 text-[#51590E] rounded-lg transition-colors border border-[#51590E]/30"
          >
            Todos
          </button>
          <button
            onClick={handleClearAll}
            className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors border border-white/20"
          >
            Ninguno
          </button>
        </div>
      </div>

      {/* Grid de colores */}
      <div className="flex flex-wrap gap-2">
        {variantesPorColor.map((variante) => {
          const isSelected = coloresSeleccionados.includes(variante.color);
          
          return (
            <button
              key={variante.color}
              onClick={() => handleToggleColor(variante.color)}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all border-2
                ${isSelected
                  ? 'bg-[#51590E]/20 border-[#51590E] text-white'
                  : 'bg-white/5 border-white/20 hover:border-white/40 text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Color indicator */}
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-[#51590E] bg-[#51590E]' : 'border-white/40 bg-white/10'}
                `}>
                  {isSelected && <Check className="w-2 h-2 text-white" />}
                </div>
                
                {/* Color name */}
                <span className="font-medium">{variante.color}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Resumen de selección */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/70">
            Colores seleccionados: 
            <span className="text-[#51590E] font-semibold ml-1">
              {coloresSeleccionados.length}
            </span>
          </div>
          
          {coloresSeleccionados.length > 0 && (
            <div className="text-white/60 text-xs">
              + GLOBAL en el gráfico
            </div>
          )}
        </div>

        {/* Lista de colores seleccionados */}
        {coloresSeleccionados.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex flex-wrap gap-1">
              {coloresSeleccionados.map((color) => (
                <div
                  key={color}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#51590E]/20 text-[#51590E] rounded-md text-xs"
                >
                  <span>{color}</span>
                  <button
                    onClick={() => handleToggleColor(color)}
                    className="hover:bg-[#51590E]/30 rounded-sm p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="text-xs text-white/50 text-center">
        💡 Selecciona uno o más colores para compararlos con las ventas globales
      </div>
    </div>
  );
};