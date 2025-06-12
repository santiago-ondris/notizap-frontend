// components/Analisis/ventas/VentasSucursalSelector.tsx
import React from "react";
import { Building2, Check, X } from "lucide-react";

interface SucursalData {
  sucursal: string;
  serie: number[];
  color: string;
}

interface VentasSucursalSelectorProps {
  sucursales: SucursalData[];
  sucursalesSeleccionadas: string[];
  setSucursalesSeleccionadas: React.Dispatch<React.SetStateAction<string[]>>;
  tipoVista?: 'cantidad' | 'facturacion';
}

export const VentasSucursalSelector: React.FC<VentasSucursalSelectorProps> = ({
  sucursales,
  sucursalesSeleccionadas,
  setSucursalesSeleccionadas,
  tipoVista = 'cantidad'
}) => {
  // Filtrar sucursales: quitar GLOBAL y Sin Sucursal
  const sucursalesDisponibles = sucursales.filter(s => 
    s.sucursal !== "GLOBAL" && 
    s.sucursal !== "Sin Sucursal" &&
    !s.sucursal.toLowerCase().includes("sin sucursal")
  );

  const handleToggleSucursal = (sucursal: string) => {
    setSucursalesSeleccionadas((prev) =>
      prev.includes(sucursal)
        ? prev.filter((s) => s !== sucursal)
        : [...prev, sucursal]
    );
  };

  const handleSelectAll = () => {
    setSucursalesSeleccionadas(sucursalesDisponibles.map(s => s.sucursal));
  };

  const handleClearAll = () => {
    setSucursalesSeleccionadas([]);
  };

  if (sucursalesDisponibles.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="w-8 h-8 text-white/40 mx-auto mb-3" />
        <div className="text-white/60 text-sm">
          No hay sucursales disponibles para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#B695BF]" />
          <span className="text-white/80 text-sm font-medium">
            Sucursales disponibles ({sucursalesDisponibles.length})
          </span>
          {tipoVista && (
            <span className="text-white/50 text-xs">
              • Vista por {tipoVista === 'cantidad' ? 'unidades' : 'facturación'}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-[#B695BF]/20 hover:bg-[#B695BF]/30 text-[#B695BF] rounded-lg transition-colors border border-[#B695BF]/30"
          >
            Todas
          </button>
          <button
            onClick={handleClearAll}
            className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/70 rounded-lg transition-colors border border-white/20"
          >
            Ninguna
          </button>
        </div>
      </div>

      {/* Grid de sucursales */}
      <div 
        className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2" 
        style={{ scrollbarWidth: "thin" }}
        onWheel={(e) => {
          e.stopPropagation();
          const container = e.currentTarget;
          container.scrollTop += e.deltaY;
        }}
      >
        {sucursalesDisponibles.map((sucursal) => {
          const isSelected = sucursalesSeleccionadas.includes(sucursal.sucursal);
          const ventasFinales = sucursal.serie[sucursal.serie.length - 1] || 0;
          
          return (
            <button
              key={sucursal.sucursal}
              onClick={() => handleToggleSucursal(sucursal.sucursal)}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all border-2
                ${isSelected
                  ? 'bg-[#B695BF]/20 border-[#B695BF] text-white'
                  : 'bg-white/5 border-white/20 hover:border-white/40 text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Check indicator */}
                <div className={`
                  w-4 h-4 rounded-full border-2 flex items-center justify-center
                  ${isSelected ? 'border-[#B695BF] bg-[#B695BF]' : 'border-white/40 bg-white/10'}
                `}>
                  {isSelected && <Check className="w-2 h-2 text-white" />}
                </div>
                
                {/* Color indicator */}
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: sucursal.color }}
                />
                
                {/* Sucursal name */}
                <span className="font-medium">🏢 {sucursal.sucursal}</span>
              </div>

              {/* Ventas totales de la sucursal */}
              <div className="text-right">
                <div className={`text-sm font-semibold ${isSelected ? 'text-[#B695BF]' : 'text-white/60'}`}>
                  {tipoVista === 'cantidad' 
                    ? ventasFinales.toLocaleString()
                    : `$${ventasFinales.toLocaleString()}`
                  }
                </div>
                <div className="text-xs text-white/50">
                  {tipoVista === 'cantidad' ? 'unidades' : 'facturado'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Resumen de selección */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/70">
            Sucursales seleccionadas: 
            <span className="text-[#B695BF] font-semibold ml-1">
              {sucursalesSeleccionadas.length}
            </span>
          </div>
          
          {sucursalesSeleccionadas.length > 0 && (
            <div className="text-white/60 text-xs">
              + GLOBAL (solo en acumulado)
            </div>
          )}
        </div>

        {/* Lista de sucursales seleccionadas */}
        {sucursalesSeleccionadas.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex flex-wrap gap-1">
              {sucursalesSeleccionadas.map((sucursalNombre) => {
                const sucursalData = sucursalesDisponibles.find(s => s.sucursal === sucursalNombre);
                return (
                  <div
                    key={sucursalNombre}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#B695BF]/20 text-[#B695BF] rounded-md text-xs"
                  >
                    {sucursalData && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sucursalData.color }}
                      />
                    )}
                    <span>{sucursalNombre}</span>
                    <button
                      onClick={() => handleToggleSucursal(sucursalNombre)}
                      className="hover:bg-[#B695BF]/30 rounded-sm p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="text-xs text-white/50 text-center">
        💡 Selecciona las sucursales que quieres comparar en los gráficos
        {tipoVista && (
          <span className="block mt-1">
            {tipoVista === 'cantidad' 
              ? '📦 Mostrando totales por unidades vendidas'
              : '💰 Mostrando totales por facturación'
            }
          </span>
        )}
      </div>
    </div>
  );
};