import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import type { 
  PublicidadDashboardParamsDto, 
  PublicidadDashboardFiltersDto,
  FiltrosAvanzados 
} from '@/types/publicidad/dashboard';
import { UNIDADES_COLORES, PLATAFORMAS_COLORES } from '@/types/publicidad/dashboard';

interface DashboardFiltersProps {
  filters: PublicidadDashboardFiltersDto | null;
  selectedFilters: PublicidadDashboardParamsDto;
  onFiltersChange: (filters: PublicidadDashboardParamsDto) => void;
  isLoading?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  selectedFilters,
  onFiltersChange,
  isLoading = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltrosAvanzados>({
    fechaInicio: selectedFilters.fechaInicio ? new Date(selectedFilters.fechaInicio) : null,
    fechaFin: selectedFilters.fechaFin ? new Date(selectedFilters.fechaFin) : null,
    unidadesSeleccionadas: selectedFilters.unidadesNegocio || [],
    plataformasSeleccionadas: selectedFilters.plataformas || [],
    mesesTendencia: selectedFilters.mesesHaciaAtras || 6,
    limiteCampañas: selectedFilters.topCampañasLimit || 10
  });

  const handleApplyFilters = () => {
    const newFilters: PublicidadDashboardParamsDto = {
      fechaInicio: localFilters.fechaInicio?.toISOString().split('T')[0],
      fechaFin: localFilters.fechaFin?.toISOString().split('T')[0],
      unidadesNegocio: localFilters.unidadesSeleccionadas,
      plataformas: localFilters.plataformasSeleccionadas,
      mesesHaciaAtras: localFilters.mesesTendencia,
      topCampañasLimit: localFilters.limiteCampañas
    };

    onFiltersChange(newFilters);
    setIsAdvancedOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FiltrosAvanzados = {
      fechaInicio: null,
      fechaFin: null,
      unidadesSeleccionadas: [],
      plataformasSeleccionadas: [],
      mesesTendencia: 6,
      limiteCampañas: 10
    };

    setLocalFilters(clearedFilters);
    onFiltersChange({
      mesesHaciaAtras: 6,
      topCampañasLimit: 10
    });
    setIsAdvancedOpen(false);
  };

  const hasActiveFilters = 
    localFilters.fechaInicio || 
    localFilters.fechaFin || 
    localFilters.unidadesSeleccionadas.length > 0 || 
    localFilters.plataformasSeleccionadas.length > 0 ||
    localFilters.mesesTendencia !== 6 ||
    localFilters.limiteCampañas !== 10;

  const formatDateInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Filtros rápidos - Período actual */}
      <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <Calendar className="w-4 h-4 text-white/60" />
        <span className="text-sm text-white/80">Período actual</span>
      </div>

      {/* Chips de filtros activos */}
      {localFilters.unidadesSeleccionadas.map(unidad => (
        <div 
          key={unidad}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium"
          style={{ 
            backgroundColor: `${UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES]}20`,
            color: UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES],
            border: `1px solid ${UNIDADES_COLORES[unidad as keyof typeof UNIDADES_COLORES]}30`
          }}
        >
          <span>{unidad}</span>
          <button
            onClick={() => setLocalFilters(prev => ({
              ...prev,
              unidadesSeleccionadas: prev.unidadesSeleccionadas.filter(u => u !== unidad)
            }))}
            className="hover:bg-white/20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {localFilters.plataformasSeleccionadas.map(plataforma => (
        <div 
          key={plataforma}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium"
          style={{ 
            backgroundColor: `${PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES]}20`,
            color: PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES],
            border: `1px solid ${PLATAFORMAS_COLORES[plataforma as keyof typeof PLATAFORMAS_COLORES]}30`
          }}
        >
          <span>{plataforma}</span>
          <button
            onClick={() => setLocalFilters(prev => ({
              ...prev,
              plataformasSeleccionadas: prev.plataformasSeleccionadas.filter(p => p !== plataforma)
            }))}
            className="hover:bg-white/20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Botón de filtros avanzados */}
      <Popover.Root open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <Popover.Trigger asChild>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              hasActiveFilters 
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-400' 
                : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
            }`}
            disabled={isLoading}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-violet-400 rounded-full" />
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content 
            className="bg-[#212026] border border-white/20 rounded-xl p-6 shadow-2xl z-50 w-96"
            sideOffset={8}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
                <Popover.Close asChild>
                  <button className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </Popover.Close>
              </div>

              {/* Rango de fechas */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">📅 Período personalizado</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Desde</label>
                    <input
                      type="date"
                      value={formatDateInput(localFilters.fechaInicio)}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        fechaInicio: parseDate(e.target.value)
                      }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:border-violet-500/50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Hasta</label>
                    <input
                      type="date"
                      value={formatDateInput(localFilters.fechaFin)}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        fechaFin: parseDate(e.target.value)
                      }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:border-violet-500/50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Unidades de negocio */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">🏢 Unidades de negocio</label>
                <div className="space-y-2">
                  {filters?.unidadesNegocio.map(unidad => (
                    <label key={unidad} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.unidadesSeleccionadas.includes(unidad)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLocalFilters(prev => ({
                              ...prev,
                              unidadesSeleccionadas: [...prev.unidadesSeleccionadas, unidad]
                            }));
                          } else {
                            setLocalFilters(prev => ({
                              ...prev,
                              unidadesSeleccionadas: prev.unidadesSeleccionadas.filter(u => u !== unidad)
                            }));
                          }
                        }}
                        className="w-4 h-4 rounded border border-white/30 bg-white/10 checked:bg-violet-500 checked:border-violet-500"
                      />
                      <span className="text-sm text-white/80 capitalize">{unidad}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Plataformas */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">📊 Plataformas</label>
                <div className="space-y-2">
                  {filters?.plataformas.map(plataforma => (
                    <label key={plataforma} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.plataformasSeleccionadas.includes(plataforma)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLocalFilters(prev => ({
                              ...prev,
                              plataformasSeleccionadas: [...prev.plataformasSeleccionadas, plataforma]
                            }));
                          } else {
                            setLocalFilters(prev => ({
                              ...prev,
                              plataformasSeleccionadas: prev.plataformasSeleccionadas.filter(p => p !== plataforma)
                            }));
                          }
                        }}
                        className="w-4 h-4 rounded border border-white/30 bg-white/10 checked:bg-violet-500 checked:border-violet-500"
                      />
                      <span className="text-sm text-white/80">{plataforma}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Configuraciones adicionales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Meses de tendencia</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={localFilters.mesesTendencia}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      mesesTendencia: parseInt(e.target.value) || 6
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:border-violet-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Top campañas</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={localFilters.limiteCampañas}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      limiteCampañas: parseInt(e.target.value) || 10
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:border-violet-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white/80 hover:bg-white/15 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-sm font-medium text-violet-400 hover:bg-violet-500/30 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Botón de limpiar filtros (si hay filtros activos) */}
      {hasActiveFilters && (
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Limpiar todo</span>
        </button>
      )}
    </div>
  );
};

export default DashboardFilters;