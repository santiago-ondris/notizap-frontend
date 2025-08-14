import React, { useState } from 'react';
import { Filter, X, Calendar, Building2, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comisionFechas } from '@/utils/vendedoras/comisionHelpers';
import { TURNOS_COMISIONES } from '@/types/vendedoras/comisionFiltersTypes';
import type { 
  ComisionVendedoraFilters,
  FiltrosForm 
} from '@/types/vendedoras/comisionFiltersTypes';

interface Props {
  filtros: ComisionVendedoraFilters;
  onFiltrosChange: (filtros: Partial<ComisionVendedoraFilters>) => void;
  sucursales: string[];
  vendedores?: string[];
  loading?: boolean;
  showVendedorFilter?: boolean;
  showMontoFilters?: boolean;
  showAdvancedFilters?: boolean;
  className?: string;
}

export const ComisionesFilters: React.FC<Props> = ({
  filtros,
  onFiltrosChange,
  sucursales,
  vendedores = [],
  loading = false,
  showVendedorFilter = false,
  showMontoFilters = false,
  showAdvancedFilters = false,
  className
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [filtrosForm, setFiltrosForm] = useState<FiltrosForm>({
    fechaInicio: filtros.fechaInicio ? new Date(filtros.fechaInicio) : undefined,
    fechaFin: filtros.fechaFin ? new Date(filtros.fechaFin) : undefined,
    sucursalNombre: filtros.sucursalNombre || '',
    vendedorNombre: filtros.vendedorNombre || '',
    turno: filtros.turno || '',
    montoComisionMinimo: filtros.montoComisionMinimo,
    montoComisionMaximo: filtros.montoComisionMaximo,
    excluirDomingos: filtros.excluirDomingos
  });

  const handleInputChange = (field: keyof FiltrosForm, value: any) => {
    const nuevosFiltros = { ...filtrosForm, [field]: value };
    setFiltrosForm(nuevosFiltros);
    
    // Convertir y enviar al parent
    const filtrosParaApi: Partial<ComisionVendedoraFilters> = {
      [field === 'fechaInicio' ? 'fechaInicio' : 
       field === 'fechaFin' ? 'fechaFin' :
       field]: field === 'fechaInicio' || field === 'fechaFin' 
        ? (value ? comisionFechas.formatearParaApi(value) : undefined)
        : value || undefined,
      page: 1 // Reset página al cambiar filtros
    };
    
    onFiltrosChange(filtrosParaApi);
  };

  const aplicarRangoMesAnterior = () => {
    const rango = comisionFechas.rangoMesAnterior();
    handleInputChange('fechaInicio', rango.inicio);
    handleInputChange('fechaFin', rango.fin);
  };

  const limpiarFiltros = () => {
    const filtrosLimpios: FiltrosForm = {
      fechaInicio: undefined,
      fechaFin: undefined,
      sucursalNombre: '',
      vendedorNombre: '',
      turno: '',
      montoComisionMinimo: undefined,
      montoComisionMaximo: undefined,
      excluirDomingos: true
    };
    
    setFiltrosForm(filtrosLimpios);
    onFiltrosChange({
      fechaInicio: undefined,
      fechaFin: undefined,
      sucursalNombre: undefined,
      vendedorNombre: undefined,
      turno: undefined,
      montoComisionMinimo: undefined,
      montoComisionMaximo: undefined,
      excluirDomingos: true,
      page: 1
    });
  };

  const contarFiltrosActivos = (): number => {
    let count = 0;
    if (filtrosForm.fechaInicio || filtrosForm.fechaFin) count++;
    if (filtrosForm.sucursalNombre) count++;
    if (filtrosForm.vendedorNombre && showVendedorFilter) count++;
    if (filtrosForm.turno) count++;
    if (filtrosForm.montoComisionMinimo || filtrosForm.montoComisionMaximo) count++;
    if (!filtrosForm.excluirDomingos) count++; // Default es true
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filtros principales */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Rango de fechas */}
          <div className="flex flex-col sm:flex-row gap-2 min-w-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80 whitespace-nowrap">Desde:</span>
            </div>
            <input
              type="date"
              value={filtrosForm.fechaInicio ? comisionFechas.formatearParaApi(filtrosForm.fechaInicio) : ''}
              onChange={(e) => handleInputChange('fechaInicio', e.target.value ? new Date(e.target.value) : undefined)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
              disabled={loading}
            />
            <span className="text-white/60 self-center">hasta</span>
            <input
              type="date"
              value={filtrosForm.fechaFin ? comisionFechas.formatearParaApi(filtrosForm.fechaFin) : ''}
              onChange={(e) => handleInputChange('fechaFin', e.target.value ? new Date(e.target.value) : undefined)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
              disabled={loading}
            />
          </div>

          {/* Sucursal */}
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-white/60" />
            <select
              value={filtrosForm.sucursalNombre}
              onChange={(e) => handleInputChange('sucursalNombre', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 transition-colors min-w-0"
              disabled={loading}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(sucursal => (
                <option key={sucursal} value={sucursal}>{sucursal}</option>
              ))}
            </select>
          </div>

          {/* Turno */}
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-4 h-4 text-white/60" />
            <select
              value={filtrosForm.turno}
              onChange={(e) => handleInputChange('turno', e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 transition-colors min-w-0"
              disabled={loading}
            >
              {TURNOS_COMISIONES.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 items-center">
            <button
              onClick={aplicarRangoMesAnterior}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 text-sm transition-colors whitespace-nowrap"
              disabled={loading}
            >
              📅 Mes anterior
            </button>
            
            {filtrosActivos > 0 && (
              <button
                onClick={limpiarFiltros}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 text-sm transition-colors flex items-center gap-1"
                disabled={loading}
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            )}

            {(showVendedorFilter || showMontoFilters || showAdvancedFilters) && (
              <button
                onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
                className={cn(
                  'px-3 py-2 border rounded-lg text-sm transition-colors flex items-center gap-1',
                  mostrarFiltrosAvanzados 
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80'
                )}
                disabled={loading}
              >
                <Filter className="w-3 h-3" />
                Filtros
                {filtrosActivos > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {filtrosActivos}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (showVendedorFilter || showMontoFilters || showAdvancedFilters) && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros avanzados
            </h3>
            <button
              onClick={() => setMostrarFiltrosAvanzados(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Filtro por vendedora */}
            {showVendedorFilter && (
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Vendedora</label>
                <select
                  value={filtrosForm.vendedorNombre}
                  onChange={(e) => handleInputChange('vendedorNombre', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
                  disabled={loading}
                >
                  <option value="">Todas las vendedoras</option>
                  {vendedores.map(vendedor => (
                    <option key={vendedor} value={vendedor}>{vendedor}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtros de monto */}
            {showMontoFilters && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm text-white/80">Comisión mínima</label>
                  <input
                    type="number"
                    value={filtrosForm.montoComisionMinimo || ''}
                    onChange={(e) => handleInputChange('montoComisionMinimo', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="$0"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm text-white/80">Comisión máxima</label>
                  <input
                    type="number"
                    value={filtrosForm.montoComisionMaximo || ''}
                    onChange={(e) => handleInputChange('montoComisionMaximo', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="$999999"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Opciones adicionales */}
            {showAdvancedFilters && (
              <div className="space-y-2">
                <label className="block text-sm text-white/80">Opciones</label>
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={filtrosForm.excluirDomingos}
                    onChange={(e) => handleInputChange('excluirDomingos', e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    disabled={loading}
                  />
                  Excluir domingos
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};