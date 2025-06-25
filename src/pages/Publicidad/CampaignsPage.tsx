import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle,
  Loader2,
  Target,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';

// Componentes
import CampaignsFiltersC from '@/components/Publicidad/Campaigns/CampaignsFiltersC';
import CampaignsTable from '@/components/Publicidad/Campaigns/CampaignsTable';

// Servicios y tipos
import { campaignsService } from '@/services/publicidad/campaignsService';
import type { 
  CampaignsResponse,
  CampaignsStats,
  CampaignsFilters,
  AdCampaignReadDto
} from '@/types/publicidad/campaigns';

interface CampaignsPageState {
  campaigns: CampaignsResponse | null;
  stats: CampaignsStats | null;
  loading: boolean;
  error: string | null;
  filters: CampaignsFilters;
}

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  // Estados
  const [state, setState] = useState<CampaignsPageState>({
    campaigns: null,
    stats: null,
    loading: true,
    error: null,
    filters: campaignsService.getDefaultFilters()
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Permisos
  const canView = ['viewer', 'admin', 'superadmin'].includes(role || '');
  const canEdit = ['admin', 'superadmin'].includes(role || '');

  // Cargar datos de campañas
  const loadCampaigns = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    } else {
      setIsRefreshing(true);
    }

    try {
      // Cargar campañas y estadísticas en paralelo
      const [campaignsData, statsData] = await Promise.all([
        campaignsService.getAllCampaigns(state.filters),
        campaignsService.getCampaignsStats({
          unidad: state.filters.unidad,
          plataforma: state.filters.plataforma,
          year: state.filters.year,
          month: state.filters.month
        })
      ]);

      setState(prev => ({
        ...prev,
        campaigns: campaignsData,
        stats: statsData,
        loading: false,
        error: null
      }));

      setLastUpdated(new Date());

      if (!showLoading) {
        toast.success('Datos actualizados correctamente');
      }
    } catch (error: any) {
      console.error('Error cargando campañas:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error al cargar las campañas'
      }));

      if (!showLoading) {
        toast.error('Error al actualizar los datos');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [state.filters]);

  // Cargar datos iniciales
  useEffect(() => {
    if (canView) {
      loadCampaigns();
    }
  }, [canView, state.filters]);

  // Handlers
  const handleFiltersChange = useCallback((newFilters: CampaignsFilters) => {
    setState(prev => ({ ...prev, filters: newFilters }));
  }, []);

  const handleRefresh = useCallback(() => {
    loadCampaigns(false);
  }, [loadCampaigns]);

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page }
    }));
  }, []);

  const handleCampaignEdit = useCallback((campaign: AdCampaignReadDto) => {
    navigate(`/publicidad/campanas/editar/${campaign.id}`);
  }, [navigate]);

  const handleCampaignView = useCallback((campaign: AdCampaignReadDto) => {
    // Aquí podrías abrir un modal de detalles o navegar a una página de vista
    console.log('Ver campaña:', campaign);
    toast.info(`Viendo detalles de: ${campaign.nombre}`);
  }, []);

  // Control de acceso
  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
              <p className="text-white/70 mb-6">
                No tienes permisos para acceder a la gestión de campañas.
              </p>
              <button
                onClick={() => navigate('/publicidad')}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Volver al Módulo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading inicial
  if (state.loading && !state.campaigns) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-white/60 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Cargando Gestión de Campañas</h2>
              <p className="text-white/60">Preparando todas las campañas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.campaigns) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Error al cargar campañas</h2>
              <p className="text-white/60 mb-6">{state.error}</p>
              <button
                onClick={() => loadCampaigns()}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
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
        <div className="space-y-6">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate('/publicidad')}
              className="text-white/60 hover:text-white transition-colors"
            >
              Publicidad
            </button>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Gestión de Campañas</span>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/publicidad')}
                className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/80" />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  🎯 Gestión de Campañas
                </h1>
                <p className="text-white/70">
                  Administra todas las campañas publicitarias (manuales y sincronizadas)
                </p>
                {lastUpdated && (
                  <p className="text-xs text-white/50 mt-2">
                    Última actualización: {lastUpdated.toLocaleString('es-AR')}
                  </p>
                )}
              </div>
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

              {canEdit && (
                <button
                  onClick={() => navigate('/publicidad/reportes/nuevo')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg text-[#D94854] hover:bg-[#D94854]/30 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Crear Reporte</span>
                </button>
              )}

              <button
                onClick={() => navigate('/publicidad/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </div>
          </div>

          {/* Indicador de estado */}
          {(state.loading || isRefreshing) && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-sm text-blue-400">
                  {state.loading ? 'Cargando campañas...' : 'Actualizando datos...'}
                </span>
              </div>
            </div>
          )}

          {/* Filtros */}
          <CampaignsFiltersC
            filters={state.filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isLoading={state.loading || isRefreshing}
          />

          {/* Tabla de campañas */}
          <CampaignsTable
            data={state.campaigns}
            isLoading={state.loading}
            onEdit={canEdit ? handleCampaignEdit : undefined}
            onView={handleCampaignView}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignsPage;