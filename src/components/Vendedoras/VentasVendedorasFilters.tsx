import React, { useState } from 'react';
import { Search, Filter, Calendar, DollarSign, Package, RotateCcw, Zap } from 'lucide-react';
import type { 
  FiltrosFormData, 
  VentaVendedoraFilters 
} from '@/types/vendedoras/filtrosTypes';
import { 
  TURNOS_OPTIONS, 
  ORDENAMIENTO_OPTIONS, 
  PAGE_SIZE_OPTIONS,
  FILTROS_PREDEFINIDOS 
} from '@/types/vendedoras/filtrosTypes';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';
import { turnoHelpers } from '@/utils/vendedoras/turnoHelpers';

interface Props {
  filtros: VentaVendedoraFilters;
  onFiltrosChange: (filtros: VentaVendedoraFilters) => void;
  sucursales: string[];
  vendedores: string[];
  rangoFechasDisponible?: {
    fechaMinima: string | null;
    fechaMaxima: string | null;
  };
  loading?: boolean;
}

export const VentasVendedorasFilters: React.FC<Props> = ({
  filtros,
  onFiltrosChange,
  sucursales,
  vendedores,
  rangoFechasDisponible,
  loading = false
}) => {
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
  const [formData, setFormData] = useState<FiltrosFormData>({
    fechaInicio: filtros.fechaInicio ? new Date(filtros.fechaInicio) : undefined,
    fechaFin: filtros.fechaFin ? new Date(filtros.fechaFin) : undefined,
    sucursalNombre: filtros.sucursalNombre || '',
    vendedorNombre: filtros.vendedorNombre || '',
    turno: filtros.turno || '',
    montoMinimo: filtros.montoMinimo,
    montoMaximo: filtros.montoMaximo,
    cantidadMinima: filtros.cantidadMinima,
    cantidadMaxima: filtros.cantidadMaxima,
    incluirProductosDescuento: filtros.incluirProductosDescuento,
    excluirDomingos: filtros.excluirDomingos
  });

  const aplicarFiltros = () => {
    const filtrosActualizados: VentaVendedoraFilters = {
      ...filtros,
      fechaInicio: formData.fechaInicio ? dateHelpers.formatearParaAPI(formData.fechaInicio) : undefined,
      fechaFin: formData.fechaFin ? dateHelpers.formatearParaAPI(formData.fechaFin) : undefined,
      sucursalNombre: formData.sucursalNombre || undefined,
      vendedorNombre: formData.vendedorNombre || undefined,
      turno: formData.turno || undefined,
      montoMinimo: formData.montoMinimo,
      montoMaximo: formData.montoMaximo,
      cantidadMinima: formData.cantidadMinima,
      cantidadMaxima: formData.cantidadMaxima,
      incluirProductosDescuento: formData.incluirProductosDescuento,
      excluirDomingos: formData.excluirDomingos,
      page: 1 // Reset página al cambiar filtros
    };

    onFiltrosChange(filtrosActualizados);
  };

  const limpiarFiltros = () => {
    const formLimpio: FiltrosFormData = {
      fechaInicio: undefined,
      fechaFin: undefined,
      sucursalNombre: '',
      vendedorNombre: '',
      turno: '',
      montoMinimo: undefined,
      montoMaximo: undefined,
      cantidadMinima: undefined,
      cantidadMaxima: undefined,
      incluirProductosDescuento: true,
      excluirDomingos: true
    };

    setFormData(formLimpio);
    
    const filtrosLimpios: VentaVendedoraFilters = {
      incluirProductosDescuento: true,
      excluirDomingos: true,
      orderBy: 'fecha',
      orderDesc: true,
      page: 1,
      pageSize: 50
    };

    onFiltrosChange(filtrosLimpios);
  };

  const aplicarFiltroPredefinido = (tipo: keyof typeof FILTROS_PREDEFINIDOS) => {
    let rangoFechas: { inicio: Date; fin: Date } | null = null;

    switch (tipo) {
      case 'ultimaSemana':
        rangoFechas = dateHelpers.obtenerUltimaSemana();
        break;
      case 'mesActual':
        rangoFechas = dateHelpers.obtenerMesActual();
        break;
      case 'mesAnterior':
        rangoFechas = dateHelpers.obtenerMesAnterior();
        break;
    }

    const nuevosFormData = { ...formData };

    if (rangoFechas) {
      nuevosFormData.fechaInicio = rangoFechas.inicio;
      nuevosFormData.fechaFin = rangoFechas.fin;
    }

    setFormData(nuevosFormData);
  };

  // Validación de fechas
  const validacionFechas = dateHelpers.validarRangoFechas(formData.fechaInicio, formData.fechaFin);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
            <Filter className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">🔍 Filtros de Búsqueda</h3>
            <p className="text-sm text-white/60">Personaliza tu análisis de ventas</p>
          </div>
        </div>

        <button
          onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all"
        >
          <Zap className="w-4 h-4" />
          {mostrarFiltrosAvanzados ? 'Filtros básicos' : 'Filtros avanzados'}
        </button>
      </div>

      {/* Filtros predefinidos */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white/80 mb-3">⚡ Filtros rápidos</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTROS_PREDEFINIDOS).map(([key, filtro]) => (
            <button
              key={key}
              onClick={() => aplicarFiltroPredefinido(key as keyof typeof FILTROS_PREDEFINIDOS)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-sm text-white/80 transition-all hover:scale-105"
              title={filtro.descripcion}
            >
              {filtro.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Fechas */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-white/80 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Rango de fechas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={formData.fechaInicio ? dateHelpers.formatearParaInput(formData.fechaInicio) : ''}
              onChange={(e) => setFormData({
                ...formData,
                fechaInicio: e.target.value ? new Date(e.target.value) : undefined
              })}
              min={rangoFechasDisponible?.fechaMinima ? rangoFechasDisponible.fechaMinima.split('T')[0] : undefined}
              max={rangoFechasDisponible?.fechaMaxima ? rangoFechasDisponible.fechaMaxima.split('T')[0] : undefined}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
            />
            <input
              type="date"
              value={formData.fechaFin ? dateHelpers.formatearParaInput(formData.fechaFin) : ''}
              onChange={(e) => setFormData({
                ...formData,
                fechaFin: e.target.value ? new Date(e.target.value) : undefined
              })}
              min={rangoFechasDisponible?.fechaMinima ? rangoFechasDisponible.fechaMinima.split('T')[0] : undefined}
              max={rangoFechasDisponible?.fechaMaxima ? rangoFechasDisponible.fechaMaxima.split('T')[0] : undefined}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
            />
          </div>
          {!validacionFechas.valido && (
            <p className="text-xs text-red-400 mt-1">{validacionFechas.mensaje}</p>
          )}
        </div>

        {/* Sucursal */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            🏢 Sucursal
          </label>
          <select
            value={formData.sucursalNombre}
            onChange={(e) => setFormData({ ...formData, sucursalNombre: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map(sucursal => (
              <option key={sucursal} value={sucursal} className="bg-gray-900">
                {sucursal}
              </option>
            ))}
          </select>
        </div>

        {/* Turno */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            ⏰ Turno
          </label>
          <select
            value={formData.turno}
            onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
          >
            {TURNOS_OPTIONS.map(opcion => (
              <option key={opcion.value} value={opcion.value} className="bg-gray-900">
                {opcion.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendedora */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white/80 mb-2">
          <Search className="w-4 h-4 inline mr-1" />
          Buscar vendedora
        </label>
        <input
          type="text"
          value={formData.vendedorNombre}
          onChange={(e) => setFormData({ ...formData, vendedorNombre: e.target.value })}
          placeholder="Nombre de la vendedora..."
          list="vendedores-list"
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
        />
        <datalist id="vendedores-list">
          {vendedores.map(vendedor => (
            <option key={vendedor} value={vendedor} />
          ))}
        </datalist>
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="border-t border-white/10 pt-6 space-y-4">
          {/* Rangos de monto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto mínimo
              </label>
              <input
                type="number"
                value={formData.montoMinimo || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  montoMinimo: e.target.value ? Number(e.target.value) : undefined
                })}
                placeholder="0"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto máximo
              </label>
              <input
                type="number"
                value={formData.montoMaximo || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  montoMaximo: e.target.value ? Number(e.target.value) : undefined
                })}
                placeholder="Sin límite"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
          </div>

          {/* Rangos de cantidad */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Cantidad mínima
              </label>
              <input
                type="number"
                value={formData.cantidadMinima || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  cantidadMinima: e.target.value ? Number(e.target.value) : undefined
                })}
                placeholder="0"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Cantidad máxima
              </label>
              <input
                type="number"
                value={formData.cantidadMaxima || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  cantidadMaxima: e.target.value ? Number(e.target.value) : undefined
                })}
                placeholder="Sin límite"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
          </div>

          {/* Opciones booleanas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.incluirProductosDescuento}
                onChange={(e) => setFormData({
                  ...formData,
                  incluirProductosDescuento: e.target.checked
                })}
                className="w-4 h-4 rounded border border-white/30 bg-white/10 text-violet-500 focus:ring-violet-500/20"
              />
              <span className="text-sm text-white/80">
                🎁 Incluir productos de descuento
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.excluirDomingos}
                onChange={(e) => setFormData({
                  ...formData,
                  excluirDomingos: e.target.checked
                })}
                className="w-4 h-4 rounded border border-white/30 bg-white/10 text-violet-500 focus:ring-violet-500/20"
              />
              <span className="text-sm text-white/80">
                🌙 Excluir domingos del análisis
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Configuración de ordenamiento y paginación */}
      <div className="border-t border-white/10 pt-6 mt-6">
        <h4 className="text-sm font-medium text-white/80 mb-3">📊 Configuración de vista</h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Ordenar por
            </label>
            <select
              value={filtros.orderBy}
              onChange={(e) => onFiltrosChange({
                ...filtros,
                orderBy: e.target.value as any
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
            >
              {ORDENAMIENTO_OPTIONS.map(opcion => (
                <option key={opcion.value} value={opcion.value} className="bg-gray-900">
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Dirección
            </label>
            <select
              value={filtros.orderDesc ? 'desc' : 'asc'}
              onChange={(e) => onFiltrosChange({
                ...filtros,
                orderDesc: e.target.value === 'desc'
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
            >
              <option value="desc" className="bg-gray-900">📉 Mayor a menor</option>
              <option value="asc" className="bg-gray-900">📈 Menor a mayor</option>
            </select>
          </div>

          {/* Tamaño de página */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Resultados por página
            </label>
            <select
              value={filtros.pageSize}
              onChange={(e) => onFiltrosChange({
                ...filtros,
                pageSize: Number(e.target.value),
                page: 1 // Reset página
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
            >
              {PAGE_SIZE_OPTIONS.map(opcion => (
                <option key={opcion.value} value={opcion.value} className="bg-gray-900">
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
        <button
          onClick={limpiarFiltros}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white/60 hover:text-white/80 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Limpiar filtros
        </button>

        <button
          onClick={aplicarFiltros}
          disabled={!validacionFechas.valido || loading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            validacionFechas.valido && !loading
              ? 'bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-400'
              : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          <Search className="w-4 h-4" />
          {loading ? 'Buscando...' : 'Aplicar filtros'}
        </button>
      </div>

      {/* Indicadores de filtros activos */}
      {(formData.fechaInicio || formData.fechaFin || formData.sucursalNombre || 
        formData.vendedorNombre || formData.turno || formData.montoMinimo || 
        formData.montoMaximo) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {formData.sucursalNombre && (
            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs">
              🏢 {formData.sucursalNombre}
            </span>
          )}
          {formData.vendedorNombre && (
            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs">
              👤 {formData.vendedorNombre}
            </span>
          )}
          {formData.turno && (
            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs">
              {turnoHelpers.formatearTurnoCorto(formData.turno as any)}
            </span>
          )}
          {formData.montoMinimo && (
            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs">
              💰 Min: ${formData.montoMinimo.toLocaleString()}
            </span>
          )}
          {formData.montoMaximo && (
            <span className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-lg text-xs">
              💰 Max: ${formData.montoMaximo.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};