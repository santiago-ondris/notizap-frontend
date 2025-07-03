import type { AnalyticsFilters, AnalyticsState, ChartConfig } from './analytics';
import type { CuentaInstagram, DashboardFilters, InstagramDashboard } from './dashboard';

export type {
    InstagramDashboard,
    MetricasGenerales,
    EvolucionSeguidores,
    ComparativaContenido,
    ContenidoMetricas,
    TopContentItem,
    DashboardFilters,
    DashboardState,
    DashboardProps,
    MetricCardProps,
    TopPerformerCardProps,
    ChartDataPoint,
    EngagementChartData,
    CuentaInstagram,
    TipoContenido,
    MetricaOrden
  } from './dashboard';
  
  // Re-exports de analytics
  export type {
    AnalisisPatrones,
    PatronesTemporales,
    HorarioPerformance,
    DiaPerformance,
    PatronesContenido,
    TipoContenidoAnalisis,
    PalabraClave,
    DuracionVideoAnalisis,
    Recomendaciones,
    ResumenEjecutivo,
    ComparativaPeriodos,
    PeriodoMetricas,
    CambiosPeriodo,
    AnalyticsFilters,
    AnalyticsState,
    PatronesVisualizationProps,
    HorariosChartProps,
    PalabrasClaveProps,
    RecomendacionesCardProps,
    ChartConfig,
    TendenciaType,
    AnalysisTimeframe,
    ContentType
  } from './analytics';
  
  // Types específicos para APIs
  export interface InstagramAPIResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    timestamp: string;
  }
  
  export interface InstagramAPIError {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
  }
  
  // Types para servicios
  export interface InstagramServiceConfig {
    baseURL: string;
    timeout: number;
    retries: number;
  }
  
  // Types para hooks personalizados
  export interface UseInstagramDashboard {
    dashboard: InstagramDashboard | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateFilters: (filters: Partial<DashboardFilters>) => void;
  }
  
  export interface UseInstagramAnalytics {
    analytics: AnalyticsState;
    actions: {
      fetchPatrones: (filters: AnalyticsFilters) => Promise<void>;
      fetchHorarios: (cuenta: string, dias?: number) => Promise<void>;
      fetchResumen: (cuenta: string, desde: string, hasta: string) => Promise<void>;
      comparePeridos: (params: ComparativaPeriodosParams) => Promise<void>;
      clearError: () => void;
    };
  }
  
  export interface ComparativaPeriodosParams {
    cuenta: string;
    periodoActualDesde: string;
    periodoActualHasta: string;
    periodoAnteriorDesde: string;
    periodoAnteriorHasta: string;
  }
  
  // Types para Context/Providers
  export interface InstagramContextValue {
    selectedAccount: CuentaInstagram;
    setSelectedAccount: (cuenta: CuentaInstagram) => void;
    dateRange: {
      desde: string;
      hasta: string;
    };
    setDateRange: (range: { desde: string; hasta: string }) => void;
    refreshData: () => Promise<void>;
    isRefreshing: boolean;
  }
  
  // Types para configuración de la aplicación
  export interface InstagramModuleConfig {
    cuentasDisponibles: CuentaInstagram[];
    defaultDateRange: number; // días hacia atrás
    updateInterval: number; // minutos
    chartConfig: ChartConfig;
    enabledFeatures: {
      dashboard: boolean;
      analytics: boolean;
      comparativas: boolean;
      exportes: boolean;
    };
  }
  
  // Types para navegación del módulo
  export interface InstagramRouteParams {
    cuenta?: string;
    view?: 'dashboard' | 'analytics' | 'horarios' | 'comparativa';
  }
  
  // Types para permisos y roles
  export interface InstagramPermissions {
    canViewDashboard: boolean;
    canViewAnalytics: boolean;
    canExportData: boolean;
    canCompareAccounts: boolean;
    canManageSync: boolean;
  }
  
  // Constants como types
  export const INSTAGRAM_ACCOUNTS = ['montella', 'alenka', 'kids'] as const;
  export const CONTENT_TYPES = ['reel', 'post', 'story'] as const;
  export const TIME_RANGES = ['7d', '30d', '90d', 'custom'] as const;
  
  // Utility types para validación
  export type RequiredDashboardFilters = Required<Pick<DashboardFilters, 'cuenta'>>;
  export type OptionalDates = Pick<DashboardFilters, 'desde' | 'hasta'>;
  
  // Types para estado global del módulo
  export interface InstagramModuleState {
    activeAccount: CuentaInstagram | null;
    dashboards: Record<CuentaInstagram, InstagramDashboard | null>;
    analytics: Record<CuentaInstagram, AnalyticsState>;
    syncStatus: Record<CuentaInstagram, {
      lastSync: string;
      isLoading: boolean;
      error: string | null;
    }>;
    preferences: {
      defaultView: 'dashboard' | 'analytics';
      chartAnimations: boolean;
      autoRefresh: boolean;
      notifications: boolean;
    };
  }