import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComisionesFilters } from './ComisionesFilters';
import { ComisionesTable } from './ComisionesTable';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFormato, comisionFechas } from '@/utils/vendedoras/comisionHelpers';
import { toast } from 'react-toastify';
import type { 
  ResumenComisionVendedora,
  ComisionesResponse,
  DatosMaestrosComisiones
} from '@/types/vendedoras/comisionTypes';
import type { 
  ComisionVendedoraFilters,
  FiltrosVendedora 
} from '@/types/vendedoras/comisionFiltersTypes';

interface Props {
  className?: string;
}

export const ComisionesPorVendedora: React.FC<Props> = ({ className }) => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [datosMaestros, setDatosMaestros] = useState<DatosMaestrosComisiones | null>(null);
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState<string>('');
  const [busquedaVendedora, setBusquedaVendedora] = useState('');
  const [resumenVendedora, setResumenVendedora] = useState<ResumenComisionVendedora | null>(null);
  const [comisionesData, setComisionesData] = useState<ComisionesResponse | null>(null);

  // Estados de filtros
  const rangoMesAnterior = comisionFechas.rangoMesAnterior();
  const [filtrosVendedora, setFiltrosVendedora] = useState<FiltrosVendedora>({
    vendedorNombre: '',
    fechaInicio: comisionFechas.formatearParaApi(rangoMesAnterior.inicio),
    fechaFin: comisionFechas.formatearParaApi(rangoMesAnterior.fin)
  });

  const [filtrosDetalle, setFiltrosDetalle] = useState<ComisionVendedoraFilters>({
    vendedorNombre: '',
    fechaInicio: comisionFechas.formatearParaApi(rangoMesAnterior.inicio),
    fechaFin: comisionFechas.formatearParaApi(rangoMesAnterior.fin),
    excluirDomingos: true,
    orderBy: 'fecha',
    orderDesc: true,
    page: 1,
    pageSize: 50
  });

  // Inicializar datos maestros
  useEffect(() => {
    cargarDatosMaestros();
  }, []);

  // Cargar resumen cuando cambia vendedora o rango
  useEffect(() => {
    if (vendedoraSeleccionada && filtrosVendedora.fechaInicio && filtrosVendedora.fechaFin) {
      cargarResumenVendedora();
    } else {
      setResumenVendedora(null);
    }
  }, [vendedoraSeleccionada, filtrosVendedora.fechaInicio, filtrosVendedora.fechaFin]);

  // Cargar detalle cuando cambia vendedora o filtros
  useEffect(() => {
    if (vendedoraSeleccionada && filtrosDetalle.fechaInicio && filtrosDetalle.fechaFin) {
      cargarDetalleComisiones();
    } else {
      setComisionesData(null);
    }
  }, [vendedoraSeleccionada, filtrosDetalle]);

  const cargarDatosMaestros = async () => {
    try {
      setLoadingDatos(true);
      const datos = await comisionesVendedorasService.obtenerDatosMaestros();
      setDatosMaestros(datos);
    } catch (err) {
      console.error('Error cargando datos maestros:', err);
      setError('Error al cargar datos maestros');
      toast.error('Error al cargar datos maestros');
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarResumenVendedora = async () => {
    if (!vendedoraSeleccionada) return;

    try {
      setLoadingResumen(true);
      const resumen = await comisionesVendedorasService.obtenerResumenVendedora(filtrosVendedora);
      setResumenVendedora(resumen);
    } catch (err) {
      console.error('Error cargando resumen:', err);
      toast.error('Error al cargar resumen de la vendedora');
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarDetalleComisiones = async () => {
    if (!vendedoraSeleccionada) return;

    try {
      setLoading(true);
      setError(null);
      const comisiones = await comisionesVendedorasService.obtenerComisiones(filtrosDetalle);
      setComisionesData(comisiones);
    } catch (err) {
      console.error('Error cargando comisiones:', err);
      setError('Error al cargar el detalle de comisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarVendedora = (nombreVendedora: string) => {
    setVendedoraSeleccionada(nombreVendedora);
    setBusquedaVendedora('');
    // Actualizar filtros
    const nuevosFiltrosVendedora = {
      ...filtrosVendedora,
      vendedorNombre: nombreVendedora
    };
    const nuevosFiltrosDetalle = {
      ...filtrosDetalle,
      vendedorNombre: nombreVendedora
    };
    setFiltrosVendedora(nuevosFiltrosVendedora);
    setFiltrosDetalle(nuevosFiltrosDetalle);
  };

  const handleCambiarRangoFechas = (fechaInicio?: string, fechaFin?: string) => {
    const nuevosFiltrosVendedora = {
      ...filtrosVendedora,
      fechaInicio,
      fechaFin
    };
    const nuevosFiltrosDetalle = {
      ...filtrosDetalle,
      fechaInicio,
      fechaFin,
      page: 1 // Reset página
    };
    setFiltrosVendedora(nuevosFiltrosVendedora);
    setFiltrosDetalle(nuevosFiltrosDetalle);
  };

  const handleFiltrosDetalleChange = (filtros: Partial<ComisionVendedoraFilters>) => {
    setFiltrosDetalle(prev => ({
      ...prev,
      ...filtros
    }));
  };

  // Filtrar vendedoras por búsqueda
  const vendedorasFiltradas = datosMaestros?.vendedores.filter(vendedora =>
    vendedora.toLowerCase().includes(busquedaVendedora.toLowerCase())
  ) || [];

  if (loadingDatos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando vendedoras...</span>
        </div>
      </div>
    );
  }

  if (error && !datosMaestros) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-red-300">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={cargarDatosMaestros}
          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-300 text-sm transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Comisiones por vendedora</h2>
        </div>

        {/* Selección de vendedora */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Buscador y lista de vendedoras */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Seleccionar vendedora
              </label>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar vendedora..."
                  value={busquedaVendedora}
                  onChange={(e) => setBusquedaVendedora(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* Lista de vendedoras: altura ~4 ítems, scroll interno */}
              <div className="relative">
                <div
                  className="overflow-y-auto max-h-48 pr-1 custom-scrollbar rounded-lg"
                  onWheel={(e) => { e.stopPropagation(); }}
                >
                  {vendedorasFiltradas.length === 0 ? (
                    <div className="p-4 text-center text-white/60">
                      {busquedaVendedora ? 'No se encontraron vendedoras' : 'Sin vendedoras disponibles'}
                    </div>
                  ) : (
                    vendedorasFiltradas.map(vendedora => (
                      <button
                        key={vendedora}
                        onClick={() => handleSeleccionarVendedora(vendedora)}
                        className={cn(
                          'w-full text-left px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 text-white',
                          vendedoraSeleccionada === vendedora && 'bg-blue-500/20'
                        )}
                        title={vendedora}
                      >
                        {vendedora}
                      </button>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Rango de fechas
              </label>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Desde</label>
                    <input
                      type="date"
                      value={filtrosVendedora.fechaInicio || ''}
                      onChange={(e) => handleCambiarRangoFechas(e.target.value, filtrosVendedora.fechaFin)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={filtrosVendedora.fechaFin || ''}
                      onChange={(e) => handleCambiarRangoFechas(filtrosVendedora.fechaInicio, e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const rango = comisionFechas.rangoMesAnterior();
                    handleCambiarRangoFechas(
                      comisionFechas.formatearParaApi(rango.inicio),
                      comisionFechas.formatearParaApi(rango.fin)
                    );
                  }}
                  className="w-full px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 text-sm transition-colors"
                >
                  📅 Mes anterior
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de la vendedora */}
      {vendedoraSeleccionada && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumen - {vendedoraSeleccionada}
            </h3>
            {loadingResumen && (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            )}
          </div>

          {resumenVendedora ? (
            <div>
              {/* Estadísticas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-300">
                    {comisionFormato.formatearMoneda(resumenVendedora.totalComisiones)}
                  </div>
                  <div className="text-xs text-white/60">Total comisiones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-300">
                    {resumenVendedora.diasConComisiones}
                  </div>
                  <div className="text-xs text-white/60">Turnos trabajados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-300">
                    {comisionFormato.formatearMoneda(resumenVendedora.promedioComisionPorDia)}
                  </div>
                  <div className="text-xs text-white/60">Promedio por turno</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-300">
                    {resumenVendedora.sucursalesQueTrabaja.length}
                  </div>
                  <div className="text-xs text-white/60">Sucursales</div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Período: </span>
                  <span className="text-white">
                    {comisionFormato.formatearFecha(resumenVendedora.primeraComision)} - {comisionFormato.formatearFecha(resumenVendedora.ultimaComision)}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Sucursales: </span>
                  <span className="text-white">
                    {resumenVendedora.sucursalesQueTrabaja.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/80 mb-2">
                {loadingResumen ? 'Cargando resumen...' : 'Sin datos de comisiones'}
              </h3>
              <p className="text-white/60">
                {loadingResumen 
                  ? 'Obteniendo información de la vendedora'
                  : 'No hay comisiones registradas en el período seleccionado'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detalle de comisiones */}
      {vendedoraSeleccionada && resumenVendedora && (
        <div className="space-y-6">
          {/* Filtros para la tabla */}
          <ComisionesFilters
            filtros={filtrosDetalle}
            onFiltrosChange={handleFiltrosDetalleChange}
            sucursales={datosMaestros?.sucursales || []}
            loading={loading}
            showAdvancedFilters={true}
          />

          {/* Tabla de comisiones */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Detalle por día
            </h3>

            {comisionesData ? (
              <ComisionesTable
                data={comisionesData}
                filtros={filtrosDetalle}
                onFiltrosChange={handleFiltrosDetalleChange}
                loading={loading}
                showVendedorColumn={false}
              />
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/80 mb-2">
                  {loading ? 'Cargando detalle...' : 'Sin detalle disponible'}
                </h3>
                <p className="text-white/60">
                  {loading 
                    ? 'Obteniendo comisiones detalladas'
                    : 'No hay comisiones para mostrar en el detalle'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!vendedoraSeleccionada && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white/80 mb-2">Selecciona una vendedora</h3>
          <p className="text-white/60 max-w-md mx-auto">
            Elegi una vendedora de la lista para ver sus comisiones acumuladas y el detalle por día.
          </p>
        </div>
      )}
    </div>
  );
};
