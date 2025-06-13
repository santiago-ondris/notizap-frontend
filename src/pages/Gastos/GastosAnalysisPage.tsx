import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, 
  List, 
  Download, 
  TrendingUp,
  BarChart3,
  RefreshCw,
  Settings,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import { GastoCharts } from '@/components/Gastos/GastoCharts';
import { GastoStats } from '@/components/Gastos/GastoStats';

// Types & Services
import type { 
  GastoTendencia,
  GastoPorCategoria,
  GastoResumen,
  Gasto
} from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastosAnalysisPageProps {
  // Props ??
}

type PeriodoAnalisis = '6-meses' | '12-meses' | '24-meses' | 'personalizado';
type TipoComparacion = 'mes-anterior' | 'año-anterior' | 'promedio';

export const GastosAnalysisPage: React.FC<GastosAnalysisPageProps> = () => {
  
  // Estados principales de datos
  const [resumenActual, setResumenActual] = useState<GastoResumen | null>(null);
  const [tendenciaMensual, setTendenciaMensual] = useState<GastoTendencia[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastoPorCategoria[]>([]);
  const [topGastos, setTopGastos] = useState<Gasto[]>([]);
  const [gastosRecurrentes, setGastosRecurrentes] = useState<Gasto[]>([]);

  // Estados de configuración del análisis
  const [periodoAnalisis, setPeriodoAnalisis] = useState<PeriodoAnalisis>('12-meses');
  const [tipoComparacion, setTipoComparacion] = useState<TipoComparacion>('mes-anterior');
  const [fechaPersonalizadaInicio, setFechaPersonalizadaInicio] = useState('');
  const [fechaPersonalizadaFin, setFechaPersonalizadaFin] = useState('');
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // Configurar fechas por defecto para período personalizado
  useEffect(() => {
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hoy.getMonth() - 6);
    
    setFechaPersonalizadaInicio(hace6Meses.toISOString().split('T')[0]);
    setFechaPersonalizadaFin(hoy.toISOString().split('T')[0]);
  }, []);

  // Función para obtener el número de meses según el período
  const obtenerMesesPorPeriodo = (periodo: PeriodoAnalisis): number => {
    switch (periodo) {
      case '6-meses': return 6;
      case '12-meses': return 12;
      case '24-meses': return 24;
      case 'personalizado': return 12; // Default para personalizado
      default: return 12;
    }
  };

  // Función para obtener fechas del período personalizado
  const obtenerFechasPeriodoPersonalizado = (): { desde?: string; hasta?: string } => {
    if (periodoAnalisis === 'personalizado') {
      return {
        desde: fechaPersonalizadaInicio || undefined,
        hasta: fechaPersonalizadaFin || undefined
      };
    }
    return {};
  };

  // Cargar todos los datos del análisis
  const cargarDatosAnalisis = useCallback(async () => {
    try {
      setIsLoading(true);

      const mesesPeriodo = obtenerMesesPorPeriodo(periodoAnalisis);
      const fechasPeriodo = obtenerFechasPeriodoPersonalizado();

      // Ejecutar todas las llamadas en paralelo
      const [
        resumen,
        tendencia,
        categorias,
        top,
        recurrentes
      ] = await Promise.all([
        GastoService.obtenerResumenMensual(añoSeleccionado, mesSeleccionado),
        GastoService.obtenerTendenciaMensual(mesesPeriodo),
        GastoService.obtenerGastosPorCategoria(fechasPeriodo.desde, fechasPeriodo.hasta),
        GastoService.obtenerTopGastos(10, fechasPeriodo.desde, fechasPeriodo.hasta),
        GastoService.obtenerGastosRecurrentes()
      ]);

      setResumenActual(resumen);
      setTendenciaMensual(tendencia);
      setGastosPorCategoria(categorias);
      setTopGastos(top);
      setGastosRecurrentes(recurrentes);

    } catch (error) {
      console.error('Error al cargar datos de análisis:', error);
      toast.error('Error al cargar los datos de análisis');
    } finally {
      setIsLoading(false);
    }
  }, [periodoAnalisis, añoSeleccionado, mesSeleccionado, fechaPersonalizadaInicio, fechaPersonalizadaFin]);

  // Cargar datos al montar y cuando cambien los parámetros
  useEffect(() => {
    cargarDatosAnalisis();
  }, [cargarDatosAnalisis]);

  // Refrescar datos
  const refrescarDatos = async () => {
    try {
      setIsRefreshing(true);
      await cargarDatosAnalisis();
      toast.success('Datos de análisis actualizados');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Exportar reporte (función placeholder)
  const exportarReporte = () => {
    toast.info('🚀 Función de exportación de reportes próximamente');
  };

  // Generar análisis automático basado en los datos
  const generarInsights = () => {
    if (!resumenActual || tendenciaMensual.length === 0) return [];

    const insights = [];

    // Insight sobre tendencia
    const tendenciaReciente = tendenciaMensual.slice(-3);
    if (tendenciaReciente.length >= 2) {
      const cambioTendencia = ((tendenciaReciente[tendenciaReciente.length - 1].totalMonto - tendenciaReciente[0].totalMonto) / tendenciaReciente[0].totalMonto) * 100;
      
      if (cambioTendencia > 10) {
        insights.push({
          tipo: 'warning',
          icono: '📈',
          titulo: 'Tendencia de Crecimiento',
          descripcion: `Los gastos han aumentado ${cambioTendencia.toFixed(1)}% en los últimos 3 meses.`
        });
      } else if (cambioTendencia < -10) {
        insights.push({
          tipo: 'success',
          icono: '📉',
          titulo: 'Reducción de Gastos',
          descripcion: `Los gastos han disminuido ${Math.abs(cambioTendencia).toFixed(1)}% en los últimos 3 meses.`
        });
      }
    }

    // Insight sobre categoría dominante
    if (gastosPorCategoria.length > 0 && gastosPorCategoria[0].porcentaje > 40) {
      insights.push({
        tipo: 'info',
        icono: '🏷️',
        titulo: 'Categoría Dominante',
        descripcion: `${gastosPorCategoria[0].categoria} representa ${gastosPorCategoria[0].porcentaje.toFixed(1)}% del presupuesto.`
      });
    }

    // Insight sobre gastos recurrentes
    const porcentajeRecurrentes = (gastosRecurrentes.length / (topGastos.length || 1)) * 100;
    if (porcentajeRecurrentes > 60) {
      insights.push({
        tipo: 'info',
        icono: '🔄',
        titulo: 'Alta Recurrencia',
        descripcion: `${porcentajeRecurrentes.toFixed(0)}% de tus gastos principales son recurrentes.`
      });
    }

    // Insight sobre comparación con promedio
    if (resumenActual.totalMes > resumenActual.promedioMensual * 1.2) {
      insights.push({
        tipo: 'warning',
        icono: '💰',
        titulo: 'Mes por Encima del Promedio',
        descripcion: `Este mes gastas ${((resumenActual.totalMes / resumenActual.promedioMensual - 1) * 100).toFixed(0)}% más que tu promedio.`
      });
    }

    return insights;
  };

  const insights = generarInsights();

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Link to="/gastos" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <span>Análisis</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Análisis de Gastos</h1>
            <p className="text-white/70">
              Insights detallados y tendencias de tus gastos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Panel de configuración */}
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
                showConfigPanel 
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurar
            </button>

            {/* Refrescar */}
            <button
              onClick={refrescarDatos}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            {/* Exportar */}
            <button
              onClick={exportarReporte}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {/* Navegación */}
            <Link
              to="/gastos"
              className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              to="/gastos/lista"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl transition-colors"
            >
              <List className="w-4 h-4" />
              Lista
            </Link>
          </div>
        </div>

        {/* Panel de configuración (colapsable) */}
        {showConfigPanel && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <Filter className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">⚙️ Configuración del Análisis</h3>
                <p className="text-sm text-white/60">Personaliza el período y tipo de análisis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Período de análisis */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📅 Período de Tendencia
                </label>
                <select
                  value={periodoAnalisis}
                  onChange={(e) => setPeriodoAnalisis(e.target.value as PeriodoAnalisis)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                >
                  <option value="6-meses">Últimos 6 meses</option>
                  <option value="12-meses">Últimos 12 meses</option>
                  <option value="24-meses">Últimos 24 meses</option>
                  <option value="personalizado">Período personalizado</option>
                </select>
              </div>

              {/* Mes de referencia para resumen */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📊 Mes de Referencia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleDateString('es-AR', { month: 'short' })}
                      </option>
                    ))}
                  </select>
                  <select
                    value={añoSeleccionado}
                    onChange={(e) => setAñoSeleccionado(parseInt(e.target.value))}
                    className="px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const año = new Date().getFullYear() - 2 + i;
                      return <option key={año} value={año}>{año}</option>;
                    })}
                  </select>
                </div>
              </div>

              {/* Fechas personalizadas (solo si está seleccionado) */}
              {periodoAnalisis === 'personalizado' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      📅 Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={fechaPersonalizadaInicio}
                      onChange={(e) => setFechaPersonalizadaInicio(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      📅 Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={fechaPersonalizadaFin}
                      onChange={(e) => setFechaPersonalizadaFin(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Tipo de comparación */}
              {periodoAnalisis !== 'personalizado' && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    📈 Comparar Con
                  </label>
                  <select
                    value={tipoComparacion}
                    onChange={(e) => setTipoComparacion(e.target.value as TipoComparacion)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                  >
                    <option value="mes-anterior">Mes anterior</option>
                    <option value="año-anterior">Mismo mes año anterior</option>
                    <option value="promedio">Promedio histórico</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights automáticos */}
        {insights.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">💡 Insights Automáticos</h3>
                <p className="text-sm text-white/60">Análisis inteligente de tus patrones de gasto</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-xl border ${
                  insight.tipo === 'warning' ? 'bg-red-500/10 border-red-500/20' :
                  insight.tipo === 'success' ? 'bg-green-500/10 border-green-500/20' :
                  'bg-blue-500/10 border-blue-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{insight.icono}</span>
                    <div>
                      <h4 className={`font-medium ${
                        insight.tipo === 'warning' ? 'text-red-400' :
                        insight.tipo === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>
                        {insight.titulo}
                      </h4>
                      <p className="text-sm text-white/70 mt-1">
                        {insight.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estadísticas del mes de referencia */}
        {resumenActual && (
          <GastoStats 
            resumen={resumenActual} 
            isLoading={isLoading} 
          />
        )}

        {/* Gráficos principales */}
        <GastoCharts
          tendencia={tendenciaMensual}
          porCategoria={gastosPorCategoria}
          topGastos={topGastos}
          isLoading={isLoading}
        />

        {/* Análisis adicional */}
        {!isLoading && gastosRecurrentes.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">🔄 Análisis de Gastos Recurrentes</h3>
                <p className="text-sm text-white/60">Gastos que se repiten mensualmente</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gastosRecurrentes.slice(0, 6).map(gasto => (
                <div key={gasto.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white truncate">{gasto.nombre}</h4>
                    <span className="text-purple-400 font-semibold text-sm">
                      {GastoService.formatearMonto(gasto.monto)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{gasto.categoria}</span>
                    <span className="bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-1 rounded text-xs">
                      {gasto.frecuenciaRecurrencia}
                    </span>
                  </div>
                  
                  {gasto.descripcion && (
                    <p className="text-xs text-white/50 mt-2 truncate">
                      {gasto.descripcion}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Proyección anual */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <h4 className="text-white font-medium mb-2">📈 Proyección Anual de Gastos Recurrentes</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-purple-400">
                    {GastoService.formatearMonto(
                      gastosRecurrentes.reduce((acc, gasto) => {
                        const multiplicador = gasto.frecuenciaRecurrencia === 'mensual' ? 12 :
                                              gasto.frecuenciaRecurrencia === 'bimestral' ? 6 :
                                              gasto.frecuenciaRecurrencia === 'trimestral' ? 4 :
                                              gasto.frecuenciaRecurrencia === 'semestral' ? 2 : 1;
                        return acc + (gasto.monto * multiplicador);
                      }, 0)
                    )}
                  </div>
                  <div className="text-xs text-white/60">Gasto Anual Proyectado</div>
                </div>
                
                <div>
                  <div className="text-xl font-bold text-blue-400">
                    {GastoService.formatearMonto(
                      gastosRecurrentes.reduce((acc, gasto) => {
                        const multiplicador = gasto.frecuenciaRecurrencia === 'mensual' ? 1 :
                                              gasto.frecuenciaRecurrencia === 'bimestral' ? 0.5 :
                                              gasto.frecuenciaRecurrencia === 'trimestral' ? 0.33 :
                                              gasto.frecuenciaRecurrencia === 'semestral' ? 0.17 : 0.08;
                        return acc + (gasto.monto * multiplicador);
                      }, 0)
                    )}
                  </div>
                  <div className="text-xs text-white/60">Promedio Mensual</div>
                </div>
                
                <div>
                  <div className="text-xl font-bold text-green-400">{gastosRecurrentes.length}</div>
                  <div className="text-xs text-white/60">Gastos Recurrentes Activos</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};