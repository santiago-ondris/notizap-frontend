import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, AlertCircle } from 'lucide-react';
import { dashboardService } from '@/services/instagram/dashboardService';
import { formatTimeAgo } from '@/utils/instagram/formatters';
import { validateDashboardFilters } from '@/utils/instagram/validators';
import AccountSelector from './AccountSelector';
import DateRangePicker from './DateRangePicker';
import LoadingState from './LoadingState';
import type { CuentaInstagram, DashboardFilters, InstagramDashboard } from '@/types/instagram/dashboard';

interface InstagramDashboardProps {
  className?: string;
}

const InstagramDashboardComponent: React.FC<InstagramDashboardProps> = ({ className = '' }) => {
  // Estados principales
  const [dashboardData, setDashboardData] = useState<InstagramDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<DashboardFilters>({
    cuenta: 'montella',
    desde: undefined,
    hasta: undefined
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboard();
  }, [filters]);

  /**
   * Carga el dashboard con los filtros actuales
   */
  const loadDashboard = async () => {
    if (loading) return;

    // Validar filtros
    const validation = validateDashboardFilters(filters);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getDashboard(filters);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el refresh manual
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  /**
   * Maneja cambio de cuenta
   */
  const handleAccountChange = (cuenta: CuentaInstagram) => {
    setFilters(prev => ({ ...prev, cuenta }));
  };

  /**
   * Maneja cambio de rango de fechas
   */
  const handleDateRangeChange = (desde?: string, hasta?: string) => {
    setFilters(prev => ({ ...prev, desde, hasta }));
  };

  /**
   * Renderiza header con controles
   */
  const renderHeader = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-[#D94854]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">📸 Instagram Analytics</h1>
          <p className="text-sm text-white/60">
            Dashboard de métricas y análisis de rendimiento
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <AccountSelector
          value={filters.cuenta}
          onChange={handleAccountChange}
          className="min-w-[140px]"
        />
        
        <DateRangePicker
          desde={filters.desde}
          hasta={filters.hasta}
          onChange={handleDateRangeChange}
          className="min-w-[160px]"
        />

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg 
                     transition-all flex items-center gap-2 text-sm text-white/80 hover:text-white
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>
    </div>
  );

  /**
   * Renderiza información de sincronización
   */
  const renderSyncInfo = () => {
    if (!dashboardData) return null;

    return (
      <div className="mb-6 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#51590E] rounded-full"></div>
            <span className="text-sm text-white/70">
              Última sincronización: {formatTimeAgo(dashboardData.ultimaSincronizacion)}
            </span>
          </div>
          <span className="text-xs text-white/50 capitalize">
            {filters.cuenta}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Renderiza estado de error
   */
  const renderError = () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-[#D94854]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#D94854]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Error al cargar datos
        </h3>
        <p className="text-white/60 mb-4 text-sm">
          {error}
        </p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 
                     rounded-lg transition-all text-[#D94854] text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  /**
   * Renderiza contenido principal del dashboard
   */
  const renderDashboardContent = () => {
    if (!dashboardData) return null;

    return (
      <div className="grid gap-6">
        {/* Métricas principales - Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
            >
              <div className="h-20 flex items-center justify-center text-white/40">
                Métrica {i} - Próximamente
              </div>
            </div>
          ))}
        </div>

        {/* Gráficos principales - Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              📈 Evolución de Seguidores
            </h3>
            <div className="h-64 flex items-center justify-center text-white/40">
              Gráfico - Próximamente
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Comparativa de Contenido
            </h3>
            <div className="h-64 flex items-center justify-center text-white/40">
              Comparativa - Próximamente
            </div>
          </div>
        </div>

        {/* Sección inferior - Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              🏆 Top Performers
            </h3>
            <div className="h-48 flex items-center justify-center text-white/40">
              Top Content - Próximamente
            </div>
          </div>

          <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              ⏰ Mejores Horarios
            </h3>
            <div className="h-48 flex items-center justify-center text-white/40">
              Horarios - Próximamente
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {renderHeader()}
      
      {error && renderError()}
      
      {!error && (
        <>
          {loading && <LoadingState />}
          
          {!loading && dashboardData && (
            <>
              {renderSyncInfo()}
              {renderDashboardContent()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default InstagramDashboardComponent;