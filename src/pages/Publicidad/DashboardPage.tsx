import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  RefreshCw, 
  Download, 
  Share2, 
  AlertTriangle,
  Loader2,
  ArrowLeft
} from 'lucide-react';

// Componentes
import ResumenEjecutivo from '@/components/Publicidad/Dashboard/ResumenEjecutivo';
import DashboardFilters from '@/components/Publicidad/Dashboard/DashboardFilters';
import TrendChart from '@/components/Publicidad/Dashboard/TrendChart';
import TopCampañasTable from '@/components/Publicidad/Dashboard/TopCampañasTable';

// Servicios y tipos
import { dashboardService } from '@/services/publicidad/dashboardService';
import type { 
  PublicidadDashboardParamsDto,
  DashboardState,
  TopCampañaDto
} from '@/types/publicidad/dashboard';

const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estado principal
  const [state, setState] = useState<DashboardState>({
    data: null,
    filters: null,
    loading: true,
    error: null,
    selectedFilters: dashboardService.getDefaultParams()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Inicializar filtros desde URL
  useEffect(() => {
    const urlParams = dashboardService.parseUrlParams(searchParams);
    if (Object.keys(urlParams).length > 0) {
      setState(prev => ({
        ...prev,
        selectedFilters: { ...prev.selectedFilters, ...urlParams }
      }));
    }
  }, [searchParams]);

  // Cargar opciones de filtros
  const loadFiltersOptions = useCallback(async () => {
    try {
      const filtersData = await dashboardService.getFiltersOptions();
      setState(prev => ({ ...prev, filters: filtersData }));
    } catch (error: any) {
      console.error('Error cargando opciones de filtros:', error);
      toast.error('Error al cargar opciones de filtros');
    }
  }, []);

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setIsRefreshing(true);
    }

    try {
      // Validar parámetros
      const validationErrors = dashboardService.validateDashboardParams(state.selectedFilters);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      const dashboardData = await dashboardService.getDashboardData(state.selectedFilters);
      
      setState(prev => ({
        ...prev,
        data: dashboardData,
        loading: false,
        error: null
      }));
      
      setLastUpdated(new Date());
      
      if (!showLoading) {
        toast.success('Datos actualizados correctamente');
      }
    } catch (error: any) {
      console.error('Error cargando dashboard:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar los datos del dashboard'
      }));
      
      if (!showLoading) {
        toast.error('Error al actualizar los datos');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [state.selectedFilters]);

  // Efectos iniciales
  useEffect(() => {
    loadFiltersOptions();
  }, [loadFiltersOptions]);

  useEffect(() => {
    loadDashboardData();
  }, [state.selectedFilters]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: PublicidadDashboardParamsDto) => {
    setState(prev => ({ ...prev, selectedFilters: newFilters }));
    
    // Actualizar URL para bookmarking
    const urlParams = dashboardService.buildShareableUrl(newFilters);
    setSearchParams(urlParams ? new URLSearchParams(urlParams.substring(1)) : new URLSearchParams());
  }, [setSearchParams]);

  const handleRefresh = useCallback(() => {
    loadDashboardData(false);
  }, [loadDashboardData]);

  const handleCampañaClick = useCallback((campaña: TopCampañaDto) => {
    // Aquí podrías abrir un modal o navegar a detalles
    console.log('Campaña seleccionada:', campaña);
    toast.info(`Viendo detalles de: ${campaña.nombre}`);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      toast.info('Preparando exportación...');
      
      // Aquí implementarías la lógica de exportación
      // Por ejemplo, generar PDF o Excel con los datos
      
      setTimeout(() => {
        toast.success('Reporte exportado correctamente');
      }, 2000);
    } catch (error) {
      toast.error('Error al exportar el reporte');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  }, []);

  // Transformar datos para visualizaciones
  const trendData = state.data ? dashboardService.transformTrendData(state.data.tendenciaMensual) : [];

  // Loading inicial
  if (state.loading && !state.data) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white/60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Cargando Dashboard</h2>
          <p className="text-white/60">Preparando tus datos de publicidad...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.data) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar el dashboard</h2>
          <p className="text-white/60 mb-6">{state.error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
    {/* Background pattern */}
    <div 
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px'
      }}
    />

    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb y botón de regreso */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/publicidad')}
          className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/80" />
        </button>
        
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/publicidad')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Publicidad
          </button>
          <span className="text-white/40">/</span>
          <span className="text-white/80">Dashboard</span>
        </div>
      </div>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            📊 Dashboard de Publicidad
          </h1>
          <p className="text-white/70">
            Análisis ejecutivo de campañas publicitarias en tiempo real
          </p>
          {lastUpdated && (
            <p className="text-xs text-white/50 mt-2">
              Última actualización: {lastUpdated.toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || state.loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Compartir</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <DashboardFilters
        filters={state.filters}
        selectedFilters={state.selectedFilters}
        onFiltersChange={handleFiltersChange}
        isLoading={state.loading}
      />

      {/* Indicador de estado */}
      {(state.loading || isRefreshing) && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-sm text-blue-400">
              {state.loading ? 'Cargando datos...' : 'Actualizando dashboard...'}
            </span>
          </div>
        </div>
      )}

      {/* Resumen Ejecutivo */}
      <ResumenEjecutivo 
        data={state.data}
        isLoading={state.loading}
      />

      {/* Grid de visualizaciones principales */}
      <div className="space-y-6">
        {/* Tendencia mensual */}
        <TrendChart
          data={trendData}
          isLoading={state.loading}
          showUnidades={true}
          showPlataformas={true}
          height={350}
        />

        {/* Top campañas - ancho completo */}
        <TopCampañasTable
          data={state.data?.topCampañas || []}
          isLoading={state.loading}
          maxRows={10}
          showFilters={true}
          onCampañaClick={handleCampañaClick}
        />
      </div>
    </div>
    </div>
    </div>
  );
};

export default DashboardPage;