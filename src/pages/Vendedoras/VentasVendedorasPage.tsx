import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  TrendingUp,
  Eye,
  Settings
} from 'lucide-react';
import { VentasVendedorasUpload } from '@/components/Vendedoras/VentasVendedorasUpload';
import { VentasVendedorasFilters } from '@/components/Vendedoras/VentasVendedorasFilters';
import { VentasVendedorasStats } from '@/components/Vendedoras/VentasVendedorasStats';
import { VentasVendedorasTable } from '@/components/Vendedoras/VentasVendedorasTable';
import { VentasVendedorasChart } from '@/components/Vendedoras/VentasVendedorasChart';
import { ventasVendedorasService } from '@/services/vendedoras/ventasVendedorasService';
import type { 
    VentaVendedoraStats,
    VentasResponse,
    RangoFechas
  } from '@/types/vendedoras/ventaVendedoraTypes';
  
  import type { 
    VentaVendedoraFilters
  } from '@/types/vendedoras/filtrosTypes';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';

type VistaActual = 'dashboard' | 'upload' | 'tabla' | 'graficos';

export const VentasVendedorasPage: React.FC = () => {
  // Estados principales
  const [vistaActual, setVistaActual] = useState<VistaActual>('dashboard');
  const [modoAdmin, setModoAdmin] = useState(false);
  
  // Estados de datos
  const [stats, setStats] = useState<VentaVendedoraStats | null>(null);
  const [ventasData, setVentasData] = useState<VentasResponse | null>(null);
  const [sucursales, setSucursales] = useState<string[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [rangoFechas, setRangoFechas] = useState<RangoFechas | null>(null);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  // Estados de filtros
  const [filtros, setFiltros] = useState<VentaVendedoraFilters>({
    incluirProductosDescuento: true,
    excluirDomingos: true,
    orderBy: 'fecha',
    orderDesc: true,
    page: 1,
    pageSize: 50
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (!loadingInicial) {
      cargarVentas();
      cargarEstadisticas();
    }
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      setLoadingInicial(true);

      // Cargar datos maestros en paralelo
      const [sucursalesRes, vendedoresRes, rangoFechasRes] = await Promise.all([
        ventasVendedorasService.obtenerSucursales(),
        ventasVendedorasService.obtenerVendedores(),
        ventasVendedorasService.obtenerRangoFechas()
      ]);

      setSucursales(sucursalesRes);
      setVendedores(vendedoresRes);
      setRangoFechas(rangoFechasRes);

      // Si hay datos disponibles, configurar filtro por defecto a la última semana
      if (rangoFechasRes.ultimaSemana.fechaInicio && rangoFechasRes.ultimaSemana.fechaFin) {
        const filtrosConFechas: VentaVendedoraFilters = {
          ...filtros,
          fechaInicio: rangoFechasRes.ultimaSemana.fechaInicio,
          fechaFin: rangoFechasRes.ultimaSemana.fechaFin
        };
        setFiltros(filtrosConFechas);
      }

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setLoadingInicial(false);
    }
  };

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await ventasVendedorasService.obtenerVentas(filtros);
      setVentasData(response);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      toast.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true);
      
      const [statsResponse, todasVendedorasResponse] = await Promise.all([
        ventasVendedorasService.obtenerEstadisticas(filtros),
        ventasVendedorasService.obtenerTodasLasVendedoras(filtros)
      ]);
      
      const statsCompletas = {
        ...statsResponse,
        todasVendedoras: todasVendedorasResponse
      };
      
      setStats(statsCompletas);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUploadSuccess = async () => {
    toast.success('¡Archivo subido exitosamente!', {
      icon: <CheckCircle2 className="text-green-500" />
    });
    
    // Recargar todos los datos
    await cargarDatosIniciales();
    setVistaActual('dashboard');
  };

  const handleUploadError = (error: string) => {
    toast.error(error, {
      icon: <AlertCircle className="text-red-500" />
    });
  };

  const handleFiltrosChange = (nuevosFiltros: VentaVendedoraFilters) => {
    setFiltros(nuevosFiltros);
  };

  const refrescarDatos = async () => {
    await Promise.all([
      cargarVentas(),
      cargarEstadisticas(),
      cargarDatosIniciales()
    ]);
    toast.success('Datos actualizados');
  };

  const opcionesVista = [
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      icono: BarChart3,
      descripcion: 'Vista general con estadísticas'
    },
    {
      id: 'upload',
      label: '📤 Subir Datos',
      icono: Upload,
      descripcion: 'Cargar archivos Excel',
      soloAdmin: true
    },
    {
      id: 'tabla',
      label: '📋 Tabla Detallada',
      icono: Eye,
      descripcion: 'Vista detallada de ventas'
    },
    {
      id: 'graficos',
      label: '📈 Gráficos',
      icono: TrendingUp,
      descripcion: 'Análisis visual de tendencias'
    }
  ];

  if (loadingInicial) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando Notizap</h2>
            <p className="text-white/60">Inicializando módulo de ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header principal */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">📊 Rendimiento de Vendedoras</h1>
                <p className="text-white/70 mt-1">
                  Análisis detallado de performance por vendedora, sucursal y turno
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón de refrescar */}
              <button
                onClick={refrescarDatos}
                disabled={loading || loadingStats}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || loadingStats) ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              {/* Toggle modo admin */}
              <button
                onClick={() => setModoAdmin(!modoAdmin)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  modoAdmin
                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                }`}
              >
                <Settings className="w-4 h-4" />
                {modoAdmin ? 'Modo Admin' : 'Vista Básica'}
              </button>
            </div>
          </div>
        </div>

        {/* Navegación de vistas */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex flex-wrap gap-3">
            {opcionesVista
              .filter(opcion => !opcion.soloAdmin || modoAdmin)
              .map(opcion => (
                <button
                  key={opcion.id}
                  onClick={() => setVistaActual(opcion.id as VistaActual)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
                    vistaActual === opcion.id
                      ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <opcion.icono className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{opcion.label}</p>
                    <p className="text-xs opacity-70">{opcion.descripcion}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Información de datos cargados */}
        {rangoFechas && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-blue-400 font-medium">
                  💡 Datos disponibles desde{' '}
                  {rangoFechas.fechaMinima ? 
                    dateHelpers.formatearFechaCompleta(rangoFechas.fechaMinima) : 
                    'N/A'
                  } hasta{' '}
                  {rangoFechas.fechaMaxima ? 
                    dateHelpers.formatearFechaCompleta(rangoFechas.fechaMaxima) : 
                    'N/A'
                  }
                </p>
                <p className="text-blue-300/70 text-sm">
                  {sucursales.length} sucursales • {vendedores.length} vendedoras registradas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal según la vista */}
        {vistaActual === 'dashboard' && (
          <div className="space-y-6">
            {/* Filtros */}
            <VentasVendedorasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              sucursales={sucursales}
              vendedores={vendedores}
              rangoFechasDisponible={rangoFechas ? {
                fechaMinima: rangoFechas.fechaMinima,
                fechaMaxima: rangoFechas.fechaMaxima
              } : undefined}
              loading={loading || loadingStats}
            />

            {/* Estadísticas */}
            <VentasVendedorasStats
              stats={stats || {} as VentaVendedoraStats}
              loading={loadingStats}
            />
          </div>
        )}

        {vistaActual === 'upload' && modoAdmin && (
          <VentasVendedorasUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {vistaActual === 'tabla' && (
          <div className="space-y-6">
            {/* Filtros */}
            <VentasVendedorasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              sucursales={sucursales}
              vendedores={vendedores}
              rangoFechasDisponible={rangoFechas ? {
                fechaMinima: rangoFechas.fechaMinima,
                fechaMaxima: rangoFechas.fechaMaxima
              } : undefined}
              loading={loading}
            />

            {/* Tabla completa */}
            <VentasVendedorasTable
              data={ventasData || { data: [], totalRegistros: 0, pagina: 1, pageSize: 50, totalPaginas: 0 }}
              stats={stats ?? ({} as VentaVendedoraStats)}
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              loading={loading}
            />
          </div>
        )}

        {vistaActual === 'graficos' && (
          <div className="space-y-6">
            {/* Filtros */}
            <VentasVendedorasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              sucursales={sucursales}
              vendedores={vendedores}
              rangoFechasDisponible={rangoFechas ? {
                fechaMinima: rangoFechas.fechaMinima,
                fechaMaxima: rangoFechas.fechaMaxima
              } : undefined}
              loading={loadingStats}
            />

            {/* Gráficos */}
            <VentasVendedorasChart
              ventasPorDia={stats?.ventasPorDia || []}
              todasVendedoras={stats?.topVendedoras || []}
              ventasPorSucursal={stats?.ventasPorSucursal || []}
              ventasPorTurno={stats?.ventasPorTurno || []}
              loading={loadingStats}
            />
          </div>
        )}

        {/* Estado sin datos */}
        {!loadingInicial && sucursales.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay datos cargados
            </h3>
            <p className="text-white/70 mb-6">
              Para comenzar el análisis, necesitas subir un archivo Excel con datos de ventas
            </p>
            {modoAdmin ? (
              <button
                onClick={() => setVistaActual('upload')}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl mx-auto transition-all"
              >
                <Upload className="w-5 h-5" />
                Subir primer archivo
              </button>
            ) : (
              <p className="text-white/50 text-sm">
                Contacta al administrador para cargar datos iniciales
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};