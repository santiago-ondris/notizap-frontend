import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Users, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComisionesFilters } from './ComisionesFilters';
import { ComisionesTable } from './ComisionesTable';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFormato, comisionFechas, comisionEstadisticas } from '@/utils/vendedoras/comisionHelpers';
import { toast } from 'react-toastify';
import { TURNOS_COMISIONES } from '@/types/vendedoras/comisionFiltersTypes';
import type { 
  ComisionesResponse,
  DatosMaestrosComisiones,
} from '@/types/vendedoras/comisionTypes';
import type { 
  ComisionVendedoraFilters,
  FiltrosSucursalTurno 
} from '@/types/vendedoras/comisionFiltersTypes';

interface Props {
  className?: string;
}

export const ComisionesPorSucursal: React.FC<Props> = ({ className }) => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de datos
  const [datosMaestros, setDatosMaestros] = useState<DatosMaestrosComisiones | null>(null);
  const [comisionesData, setComisionesData] = useState<ComisionesResponse | null>(null);

  // Estados de selección
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string>('');

  // Estados de filtros
  const rangoMesAnterior = comisionFechas.rangoMesAnterior();
  const [filtrosSucursal, setFiltrosSucursal] = useState<FiltrosSucursalTurno>({
    sucursalNombre: '',
    turno: 'Mañana' as 'Mañana' | 'Tarde',
    fechaInicio: comisionFechas.formatearParaApi(rangoMesAnterior.inicio),
    fechaFin: comisionFechas.formatearParaApi(rangoMesAnterior.fin)
  });

  const [filtrosDetalle, setFiltrosDetalle] = useState<ComisionVendedoraFilters>({
    sucursalNombre: '',
    turno: '',
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

  // Cargar comisiones cuando cambian sucursal/turno/fechas
  useEffect(() => {
    if (sucursalSeleccionada && turnoSeleccionado && filtrosSucursal.fechaInicio && filtrosSucursal.fechaFin) {
      cargarComisiones();
    } else {
      setComisionesData(null);
    }
  }, [sucursalSeleccionada, turnoSeleccionado, filtrosSucursal, filtrosDetalle]);

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

  const cargarComisiones = async () => {
    if (!sucursalSeleccionada || !turnoSeleccionado) return;

    try {
      setLoading(true);
      setError(null);
      
      const comisiones = await comisionesVendedorasService.obtenerComisionesPorSucursalTurno({
        sucursalNombre: sucursalSeleccionada,
        turno: turnoSeleccionado as 'Mañana' | 'Tarde',
        fechaInicio: filtrosSucursal.fechaInicio,
        fechaFin: filtrosSucursal.fechaFin
      });
      
      setComisionesData(comisiones);
    } catch (err) {
      console.error('Error cargando comisiones:', err);
      setError('Error al cargar comisiones');
      toast.error('Error al cargar comisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarSucursal = (sucursal: string) => {
    setSucursalSeleccionada(sucursal);
    
    // Actualizar filtros
    const nuevosFiltrosSucursal = {
      ...filtrosSucursal,
      sucursalNombre: sucursal
    };
    
    const nuevosFiltrosDetalle = {
      ...filtrosDetalle,
      sucursalNombre: sucursal,
      page: 1
    };
    
    setFiltrosSucursal(nuevosFiltrosSucursal);
    setFiltrosDetalle(nuevosFiltrosDetalle);
  };

  const handleSeleccionarTurno = (turno: string) => {
    setTurnoSeleccionado(turno);
    
    // Actualizar filtros
    const nuevosFiltrosSucursal = {
      ...filtrosSucursal,
      turno: turno as 'Mañana' | 'Tarde'
    };
    
    const nuevosFiltrosDetalle = {
      ...filtrosDetalle,
      turno: turno as 'Mañana' | 'Tarde',
      page: 1
    };
    
    setFiltrosSucursal(nuevosFiltrosSucursal);
    setFiltrosDetalle(nuevosFiltrosDetalle);
  };

  const handleCambiarRangoFechas = (fechaInicio?: string, fechaFin?: string) => {
    const nuevosFiltrosSucursal = {
      ...filtrosSucursal,
      fechaInicio,
      fechaFin
    };
    
    const nuevosFiltrosDetalle = {
      ...filtrosDetalle,
      fechaInicio,
      fechaFin,
      page: 1
    };
    
    setFiltrosSucursal(nuevosFiltrosSucursal);
    setFiltrosDetalle(nuevosFiltrosDetalle);
  };

  const handleFiltrosDetalleChange = (filtros: Partial<ComisionVendedoraFilters>) => {
    setFiltrosDetalle(prev => ({
      ...prev,
      ...filtros
    }));
  };

  // Calcular estadísticas del resumen
  const estadisticas = comisionesData ? {
    totalComisiones: comisionEstadisticas.totalComisiones(comisionesData.data),
    promedioComisiones: comisionEstadisticas.promedioComisiones(comisionesData.data),
    resumenPorVendedora: comisionEstadisticas.resumenPorVendedora(comisionesData.data),
    diasConComisiones: new Set(comisionesData.data.map(c => c.fecha)).size,
    totalVendedoras: new Set(comisionesData.data.map(c => c.vendedorNombre)).size
  } : null;

  if (loadingDatos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando sucursales...</span>
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
          <Building2 className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Comisiones por sucursal y turno</h2>
        </div>

        {/* Selección de sucursal y turno */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Selector de sucursal */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Sucursal <span className="text-red-400">*</span>
              </label>
              
              <select
                value={sucursalSeleccionada}
                onChange={(e) => handleSeleccionarSucursal(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="">Seleccionar sucursal</option>
                {datosMaestros?.sucursales.map(sucursal => (
                  <option key={sucursal} value={sucursal}>{sucursal}</option>
                ))}
              </select>
            </div>

            {/* Selector de turno */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Turno <span className="text-red-400">*</span>
              </label>
              
              <select
                value={turnoSeleccionado}
                onChange={(e) => handleSeleccionarTurno(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                disabled={!sucursalSeleccionada}
              >
                <option value="">Seleccionar turno</option>
                {TURNOS_COMISIONES.slice(1).map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
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
                      value={filtrosSucursal.fechaInicio || ''}
                      onChange={(e) => handleCambiarRangoFechas(e.target.value, filtrosSucursal.fechaFin)}
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Hasta</label>
                    <input
                      type="date"
                      value={filtrosSucursal.fechaFin || ''}
                      onChange={(e) => handleCambiarRangoFechas(filtrosSucursal.fechaInicio, e.target.value)}
                      className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-blue-400 transition-colors"
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
                  className="w-full px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded text-blue-300 text-sm transition-colors"
                >
                  📅 Mes anterior
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen acumulado */}
      {sucursalSeleccionada && turnoSeleccionado && estadisticas && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Resumen acumulado - {sucursalSeleccionada} ({comisionFormato.formatearTurno(turnoSeleccionado)})
            </h3>
            
            {loading && (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            )}
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">
                {comisionFormato.formatearMoneda(estadisticas.totalComisiones)}
              </div>
              <div className="text-xs text-white/60">Total comisiones</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300">
                {estadisticas.diasConComisiones}
              </div>
              <div className="text-xs text-white/60">Días con comisiones</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {estadisticas.totalVendedoras}
              </div>
              <div className="text-xs text-white/60">Vendedoras</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">
                {comisionFormato.formatearMoneda(estadisticas.promedioComisiones)}
              </div>
              <div className="text-xs text-white/60">Promedio por día</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {comisionFormato.formatearNumero(comisionesData?.totalRegistros || 0)}
              </div>
              <div className="text-xs text-white/60">Total registros</div>
            </div>
          </div>

          {/* Desglose por vendedora */}
          <div>
            <h4 className="font-medium text-white mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Desglose por vendedora
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estadisticas.resumenPorVendedora.slice(0, 9).map((vendedora, index) => (
                <div 
                  key={vendedora.vendedora}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white truncate">
                      {vendedora.vendedora}
                    </span>
                    <span className="text-xs text-white/60">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Total:</span>
                      <span className="text-green-300 font-medium">
                        {comisionFormato.formatearMoneda(vendedora.total)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-white/60">Días:</span>
                      <span className="text-white">{vendedora.dias}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-white/60">Promedio:</span>
                      <span className="text-blue-300">
                        {comisionFormato.formatearMoneda(vendedora.promedio)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Mostrar "ver más" si hay más vendedoras */}
              {estadisticas.resumenPorVendedora.length > 9 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-center">
                  <span className="text-white/60 text-sm">
                    +{estadisticas.resumenPorVendedora.length - 9} vendedoras más en el detalle
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalle completo */}
      {sucursalSeleccionada && turnoSeleccionado && comisionesData && (
        <div className="space-y-6">
          {/* Filtros para la tabla */}
          <ComisionesFilters
            filtros={filtrosDetalle}
            onFiltrosChange={handleFiltrosDetalleChange}
            sucursales={datosMaestros?.sucursales || []}
            vendedores={datosMaestros?.vendedores || []}
            loading={loading}
            showVendedorFilter={true}
            showAdvancedFilters={true}
          />

          {/* Tabla de comisiones */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Detalle completo
            </h3>

            <ComisionesTable
              data={comisionesData}
              filtros={filtrosDetalle}
              onFiltrosChange={handleFiltrosDetalleChange}
              loading={loading}
              showSucursalColumn={false} // No mostrar sucursal ya que es específica
              showTurnoColumn={false}    // No mostrar turno ya que es específico
            />
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {(!sucursalSeleccionada || !turnoSeleccionado) && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white/80 mb-2">
            Selecciona sucursal y turno
          </h3>
          <p className="text-white/60 max-w-md mx-auto">
            Elige una sucursal y un turno para ver las comisiones acumuladas y el detalle por vendedora.
          </p>
          
          {/* Ayuda visual */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>1. Sucursal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span>2. Turno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>3. Ver resultados</span>
            </div>
          </div>
        </div>
      )}

      {/* Error de carga */}
      {error && sucursalSeleccionada && turnoSeleccionado && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={cargarComisiones}
            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-300 text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
};