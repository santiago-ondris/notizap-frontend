import React, { useState } from 'react';
import { Filter, X, Calendar, Building, Smartphone, RefreshCw } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import type { CampaignsFilters } from '@/types/publicidad/campaigns';
import { UNIDADES_COLORES, PLATAFORMAS_COLORES } from '@/types/publicidad/dashboard';
import { campaignsService } from '@/services/publicidad/campaignsService';

interface CampaignsFiltersProps {
  filters: CampaignsFilters;
  onFiltersChange: (filters: CampaignsFilters) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const CampaignsFiltersC: React.FC<CampaignsFiltersProps> = ({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading = false
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<CampaignsFilters>(filters);

  // Opciones disponibles
  const unidadesOpciones = [
    { value: 'montella', label: 'Montella' },
    { value: 'alenka', label: 'Alenka' },
    { value: 'kids', label: 'Kids' }
  ];

  const plataformasOpciones = [
    { value: 'Meta', label: 'Meta (Facebook/Instagram)' },
    { value: 'Google', label: 'Google Ads' }
  ];

  const yearOptions = campaignsService.getYearOptions();
  const monthOptions = campaignsService.getMonthOptions();

  // Manejadores
  const handleLocalFilterChange = (key: keyof CampaignsFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset página al cambiar filtros
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsAdvancedOpen(false);
  };

  const handleClearFilters = () => {
    const defaultFilters = campaignsService.getDefaultFilters();
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
    setIsAdvancedOpen(false);
  };

  const handleQuickFilter = (key: keyof CampaignsFilters, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = 
    filters.unidad || 
    filters.plataforma || 
    filters.year !== new Date().getFullYear() ||
    filters.month !== (new Date().getMonth() + 1);

  const activeFiltersCount = [
    filters.unidad,
    filters.plataforma,
    filters.year !== new Date().getFullYear() ? filters.year : null,
    filters.month !== (new Date().getMonth() + 1) ? filters.month : null
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Filtros rápidos */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filtros rápidos por unidad */}
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80 font-medium">Unidad:</span>
          <div className="flex gap-1">
            {unidadesOpciones.map(unidad => (
              <button
                key={unidad.value}
                onClick={() => handleQuickFilter('unidad', 
                  filters.unidad === unidad.value ? undefined : unidad.value
                )}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filters.unidad === unidad.value
                    ? 'border border-white/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                style={filters.unidad === unidad.value ? {
                  backgroundColor: `${UNIDADES_COLORES[unidad.value as keyof typeof UNIDADES_COLORES]}20`,
                  color: UNIDADES_COLORES[unidad.value as keyof typeof UNIDADES_COLORES],
                  borderColor: `${UNIDADES_COLORES[unidad.value as keyof typeof UNIDADES_COLORES]}30`
                } : {}}
              >
                {unidad.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros rápidos por plataforma */}
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80 font-medium">Plataforma:</span>
          <div className="flex gap-1">
            {plataformasOpciones.map(plataforma => (
              <button
                key={plataforma.value}
                onClick={() => handleQuickFilter('plataforma', 
                  filters.plataforma === plataforma.value ? undefined : plataforma.value
                )}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  filters.plataforma === plataforma.value
                    ? 'border border-white/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                style={filters.plataforma === plataforma.value ? {
                  backgroundColor: `${PLATAFORMAS_COLORES[plataforma.value as keyof typeof PLATAFORMAS_COLORES]}20`,
                  color: PLATAFORMAS_COLORES[plataforma.value as keyof typeof PLATAFORMAS_COLORES],
                  borderColor: `${PLATAFORMAS_COLORES[plataforma.value as keyof typeof PLATAFORMAS_COLORES]}30`
                } : {}}
              >
                {plataforma.value}
              </button>
            ))}
          </div>
        </div>

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
              <span className="text-sm font-medium">Período</span>
              {activeFiltersCount > 0 && (
                <div className="w-5 h-5 bg-violet-400 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </div>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content 
              className="bg-[#212026] border border-white/20 rounded-xl p-6 shadow-2xl z-50 w-80"
              sideOffset={8}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Filtros de Período</h3>
                  <Popover.Close asChild>
                    <button className="text-white/60 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </Popover.Close>
                </div>

                {/* Año */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Año
                  </label>
                  <select
                    value={localFilters.year || ''}
                    onChange={(e) => handleLocalFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value="">Todos los años</option>
                    {yearOptions.map(year => (
                      <option key={year.value} value={year.value} className="bg-[#212026] text-white">
                        {year.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Mes</label>
                  <select
                    value={localFilters.month || ''}
                    onChange={(e) => handleLocalFilterChange('month', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value="">Todos los meses</option>
                    {monthOptions.map(month => (
                      <option key={month.value} value={month.value} className="bg-[#212026] text-white">
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tamaño de página */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/80">Campañas por página</label>
                  <select
                    value={localFilters.pageSize || 20}
                    onChange={(e) => handleLocalFilterChange('pageSize', parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:border-violet-500/50 focus:outline-none"
                  >
                    <option value={10} className="bg-[#212026] text-white">10 por página</option>
                    <option value={20} className="bg-[#212026] text-white">20 por página</option>
                    <option value={50} className="bg-[#212026] text-white">50 por página</option>
                    <option value={100} className="bg-[#212026] text-white">100 por página</option>
                  </select>
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

        {/* Botón de actualizar */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>
        )}

        {/* Limpiar todos los filtros */}
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

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Filter className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-xs text-white/70">
              <span className="text-blue-400 font-medium">Filtros activos:</span>
              {filters.unidad && <span className="ml-2">Unidad: {filters.unidad}</span>}
              {filters.plataforma && <span className="ml-2">Plataforma: {filters.plataforma}</span>}
              {filters.year && <span className="ml-2">Año: {filters.year}</span>}
              {filters.month && <span className="ml-2">Mes: {monthOptions.find(m => m.value === filters.month)?.label}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsFiltersC;