import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComisionesFilters } from './ComisionesFilters';
import { ComisionEstadoChip } from './ComisionEstadoChip';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import {
  calendarioGeneracion,
  calendarioActualizacion,
  calendarioNavegacion,
  calendarioAnalisis
} from '@/utils/vendedoras/calendarioHelpers';
import { comisionFormato } from '@/utils/vendedoras/comisionHelpers';
import type {
  DiaCalendario,
  DatosMaestrosComisiones
} from '@/types/vendedoras/comisionTypes';
import type {
  FiltrosCalendario,
  ComisionVendedoraFilters
} from '@/types/vendedoras/comisionFiltersTypes';

interface Props {
  onDiaClick?: (dia: DiaCalendario) => void;
  onRefreshReady?: (refrescar: () => void) => void;
  className?: string;
}

export const ComisionesCalendario: React.FC<Props> = ({
  onDiaClick,
  onRefreshReady,
  className
}) => {
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del calendario
  const mesAnterior = calendarioNavegacion.fechaMesAnterior();
  const [añoActual, setAñoActual] = useState(mesAnterior.año);
  const [mesActual, setMesActual] = useState(mesAnterior.mes);
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);

  // Estados de datos
  const [datosMaestros, setDatosMaestros] = useState<DatosMaestrosComisiones | null>(null);

  // Estados de filtros
  const [filtros, setFiltros] = useState<ComisionVendedoraFilters>({
    sucursalNombre: undefined,
    turno: undefined,
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

  const cargarDatosMaestros = async () => {
    try {
      setLoadingDatos(true);
      const datos = await comisionesVendedorasService.obtenerDatosMaestros();
      setDatosMaestros(datos);
    } catch (err) {
      console.error('Error cargando datos maestros:', err);
      setError('Error al cargar datos maestros');
    } finally {
      setLoadingDatos(false);
    }
  };

  const cargarCalendario = React.useCallback(async () => {
    if (!datosMaestros) return;

    try {
      setLoading(true);
      setError(null);

      // Generar estructura básica del calendario
      const diasBase = calendarioGeneracion.generarDiasDelMes(añoActual, mesActual);

      // Preparar filtros para el backend
      const filtrosCalendario: FiltrosCalendario = {
        año: añoActual,
        mes: mesActual,
        sucursalNombre: filtros.sucursalNombre,
        turno: filtros.turno === '' ? undefined : filtros.turno
      };

      // Obtener datos del backend
      const datosBackend = await comisionesVendedorasService.obtenerCalendarioComisiones(filtrosCalendario);

      // Actualizar días con datos del backend
      let diasActualizados = calendarioActualizacion.actualizarConDatos(diasBase, datosBackend);

      // Aplicar filtros locales si es necesario
      diasActualizados = calendarioActualizacion.aplicarFiltros(
        diasActualizados,
        filtros.sucursalNombre,
        filtros.turno
      );

      setDiasCalendario(diasActualizados);

    } catch (err) {
      console.error('Error cargando calendario:', err);
      setError('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [datosMaestros, añoActual, mesActual, filtros.sucursalNombre, filtros.turno]);

  // Cargar calendario cuando cambia mes o filtros
  useEffect(() => {
    if (datosMaestros) {
      cargarCalendario();
    }
  }, [cargarCalendario, datosMaestros]);

  useEffect(() => {
    if (onRefreshReady) {
      onRefreshReady(cargarCalendario);
    }
  }, [onRefreshReady, cargarCalendario]);

  const handleFiltrosChange = (nuevosFiltros: Partial<ComisionVendedoraFilters>) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros
    }));
  };

  const navegarMes = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior') {
      const { año, mes } = calendarioNavegacion.mesAnterior(añoActual, mesActual);
      setAñoActual(año);
      setMesActual(mes);
    } else {
      if (calendarioNavegacion.puedeAvanzar(añoActual, mesActual)) {
        const { año, mes } = calendarioNavegacion.mesSiguiente(añoActual, mesActual);
        setAñoActual(año);
        setMesActual(mes);
      }
    }
  };

  const handleDiaClick = (dia: DiaCalendario) => {
    if (dia.esDelMes && !loading) {
      onDiaClick?.(dia);
    }
  };

  const irAHoy = () => {
    const hoy = new Date();
    setAñoActual(hoy.getFullYear());
    setMesActual(hoy.getMonth() + 1);
  };

  const irAMesAnterior = () => {
    const mesAnterior = calendarioNavegacion.fechaMesAnterior();
    setAñoActual(mesAnterior.año);
    setMesActual(mesAnterior.mes);
  };

  // Calcular estadísticas del mes
  const estadisticas = calendarioAnalisis.estadisticasMes(diasCalendario);
  const diasAtencion = calendarioAnalisis.diasQueNecesitanAtencion(diasCalendario);

  if (loadingDatos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando calendario...</span>
        </div>
      </div>
    );
  }

  if (error) {
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

      {/* Filtros */}
      <ComisionesFilters
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        sucursales={datosMaestros?.sucursales || []}
        loading={loading}
      />

      {/* Header del calendario */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

          {/* Navegación del mes */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navegarMes('anterior')}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                disabled={loading}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
                {calendarioNavegacion.formatearTituloMes(añoActual, mesActual)}
              </h2>

              <button
                onClick={() => navegarMes('siguiente')}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !calendarioNavegacion.puedeAvanzar(añoActual, mesActual)}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Actualizando...</span>
              </div>
            )}
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-2">
            <button
              onClick={irAMesAnterior}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 text-sm transition-colors"
              disabled={loading}
            >
              📅 Mes anterior
            </button>
            <button
              onClick={irAHoy}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 text-sm transition-colors"
              disabled={loading}
            >
              🏠 Hoy
            </button>
          </div>
        </div>

        {/* Estadísticas del mes */}
        {estadisticas.diasConDatos > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-300">{estadisticas.diasCompletos}</div>
              <div className="text-xs text-white/60">Días completos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-300">{estadisticas.diasPendientes}</div>
              <div className="text-xs text-white/60">Días pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-300">{estadisticas.diasConDatos}</div>
              <div className="text-xs text-white/60">Días con datos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{estadisticas.porcentajeCompletitud}%</div>
              <div className="text-xs text-white/60">Completitud</div>
            </div>
          </div>
        )}
      </div>

      {/* Calendario */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dia => (
            <div key={dia} className="text-center text-sm font-medium text-white/60 py-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {diasCalendario.map((dia, index) => (
            <button
              key={`${dia.fecha}-${index}`}
              onClick={() => handleDiaClick(dia)}
              className={cn(
                'relative aspect-square border rounded-lg text-sm transition-all duration-200',
                'flex flex-col items-center justify-center gap-1 p-1',
                // Estilos base
                dia.esDelMes
                  ? 'border-white/20 hover:border-white/40 text-white'
                  : 'border-white/10 text-white/40',
                // Estados
                dia.esHoy && 'ring-2 ring-blue-400',
                dia.esDomingo && 'bg-red-500/10',
                // Cursor
                dia.esDelMes && !loading ? 'cursor-pointer' : 'cursor-default',
                // Hover
                dia.esDelMes && 'hover:bg-white/10'
              )}
              disabled={!dia.esDelMes || loading}
            >
              {/* Número del día */}
              <span className={cn(
                'font-medium',
                dia.esHoy && 'text-blue-300'
              )}>
                {dia.dia}
              </span>

              {/* Estado */}
              {dia.esDelMes && dia.estado !== 'sin-datos' && (
                <ComisionEstadoChip
                  estado={dia.estado}
                  showText={false}
                  size="sm"
                  className="absolute top-0.5 right-0.5 w-4 h-4 p-0 text-xs"
                />
              )}

              {/* Indicador de hoy */}
              {dia.esHoy && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ComisionEstadoChip estado="completo" size="sm" />
            <span className="text-white/60">Completado</span>
          </div>
          <div className="flex items-center gap-2">
            <ComisionEstadoChip estado="parcial" size="sm" />
            <span className="text-white/60">Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <ComisionEstadoChip estado="pendiente" size="sm" />
            <span className="text-white/60">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-white/20 rounded bg-transparent"></div>
            <span className="text-white/60">Sin datos</span>
          </div>
        </div>
      </div>

      {/* Días que necesitan atención */}
      {diasAtencion.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-yellow-300 mb-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Días que necesitan atención</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {diasAtencion.map(dia => (
              <button
                key={dia.fecha}
                onClick={() => handleDiaClick(dia)}
                className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm transition-colors"
              >
                {comisionFormato.formatearFecha(dia.fecha)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};