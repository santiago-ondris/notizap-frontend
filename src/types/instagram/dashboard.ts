export interface InstagramDashboard {
  cuenta: string;
  metricasGenerales: MetricasGenerales;
  evolucionSeguidores: EvolucionSeguidores[];
  comparativaContenido: ComparativaContenido;
  topPerformers: TopContentItem[];
  ultimaSincronizacion: string;
}

export interface MetricasGenerales {
  seguidoresActuales: number;
  crecimientoSemanal: number;
  porcentajeCrecimientoSemanal: number;
  totalPublicacionesPeriodo: number;
  engagementPromedio: number;
  totalInteracciones: number;
  alcancePromedio: number;
}

export interface EvolucionSeguidores {
  fecha: string;
  seguidores: number;
  crecimientoDiario: number;
}

export interface ComparativaContenido {
  reels: ContenidoMetricas;
  posts: ContenidoMetricas;
  stories: ContenidoMetricas;
}

export interface ContenidoMetricas {
  totalPublicaciones: number;
  engagementPromedio: number;
  alcancePromedio: number;
  interaccionesPromedio: number;
  mejorPerformance: number;
  tipoMetricaMejor: string;
}

export interface TopContentItem {
  id: string;
  tipoContenido: 'reel' | 'post' | 'story';
  fechaPublicacion: string;
  imageUrl?: string;
  url?: string;
  contenido: string;
  metricaPrincipal: number;
  nombreMetrica: string;
  engagementRate: number;
  metricasAdicionales: Record<string, any>;
}

// Types para filtros y parámetros
export interface DashboardFilters {
  cuenta: CuentaInstagram;
  desde?: string;
  hasta?: string;
}

export interface DashboardState {
  data: InstagramDashboard | null;
  loading: boolean;
  error: string | null;
  filters: DashboardFilters;
}

// Types para props de componentes
export interface DashboardProps {
  cuenta: string;
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
  onClick?: () => void;
}

export interface TopPerformerCardProps {
  item: TopContentItem;
  onClick?: () => void;
  className?: string;
}

// Types para gráficos
export interface ChartDataPoint {
  fecha: string;
  seguidores: number;
  crecimiento?: number;
}

export interface EngagementChartData {
  tipo: string;
  engagement: number;
  color: string;
  publicaciones: number;
}

export interface ContentPreviewProps {
  item: TopContentItem;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showMetrics?: boolean;
  showContent?: boolean;
  interactive?: boolean;
}

// Utility types
export type CuentaInstagram = 'montella' | 'alenka' | 'kids';

export type TipoContenido = 'reel' | 'post' | 'story';

export type MetricaOrden = 'views' | 'likes' | 'comments' | 'engagement' | 'reach';