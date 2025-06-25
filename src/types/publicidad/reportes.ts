export interface AdReportDto {
  id: number;
  unidadNegocio: string;
  plataforma: string;
  year: number;
  month: number;
  campañas: AdCampaignReadDto[];
}

export interface SaveAdReportDto {
  unidadNegocio: string;
  plataforma: string;
  year: number;
  month: number;
  campañas: AdCampaignDto[];
}

export interface AdCampaignDto {
  campaignId: string;
  nombre: string;
  tipo: string;
  montoInvertido: number;
  objetivo: string;
  resultados: string;
  fechaInicio: string; // ISO date string
  fechaFin: string; // ISO date string
  followersCount: number;
}

export interface AdCampaignReadDto {
  id: number;
  campaignId: string;
  nombre: string;
  tipo: string;
  montoInvertido: number;
  objetivo: string;
  resultados: string;
  fechaInicio: string; // ISO date string
  fechaFin: string; // ISO date string
  followersCount: number;
  // Métricas automáticas (opcional para campañas manuales)
  clicks?: number;
  impressions?: number;
  ctr?: number;
  reach?: number;
  valorResultado?: number;
}

export interface PublicidadResumenMensualDto {
  unidadNegocio: string;
  montoTotal: number;
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalManualFollowers: number;
  campaignCount: number;
}

// Insights automáticos de Meta
export interface MetaCampaignInsightDto {
  campaignId: string;
  campaignName: string;
  objective: string;
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  reach: number;
  start: string; // ISO date string
  end: string; // ISO date string
  resultadoPrincipal: string;
  valorResultado: number;
}

export interface MixedCampaignInsightDto extends MetaCampaignInsightDto {
  manualFollowers: number;
}

export interface SyncResultDto {
  updatedCampaigns: string[];
  unchangedCampaigns: string[];
  reportId: number;
}

// Estados para el frontend
export interface ReportesState {
  reportes: AdReportDto[];
  reporteActual: AdReportDto | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: {
    unidad?: string;
    plataforma?: string;
    año?: number;
    mes?: number;
  };
}

export interface SyncState {
  loading: boolean;
  error: string | null;
  lastSync: SyncResultDto | null;
  previewData: MetaCampaignInsightDto[] | null;
}

// Para formularios
export interface ReporteFormData {
  unidadNegocio: string;
  plataforma: string;
  año: number;
  mes: number;
  campañas: CampañaFormData[];
}

export interface CampañaFormData {
  campaignId: string;
  nombre: string;
  tipo: string;
  montoInvertido: number | '';
  objetivo: string;
  resultados: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  followersMode: 'default' | 'especifica';
  followersCount: number | '';
}

// Opciones para selects
export const UNIDADES_OPCIONES = [
  { value: 'montella', label: 'Montella' },
  { value: 'alenka', label: 'Alenka' },
  { value: 'kids', label: 'Kids' }
] as const;

export const PLATAFORMAS_OPCIONES = [
  { value: 'Meta', label: 'Meta (Facebook/Instagram)' },
  { value: 'Google', label: 'Google Ads' }
] as const;

export const TIPOS_CAMPAÑA = [
  { value: 'Venta', label: 'Venta' },
  { value: 'Branding', label: 'Branding' },
  { value: 'Tráfico', label: 'Tráfico' },
  { value: 'Engagement', label: 'Engagement' },
  { value: 'Conversión', label: 'Conversión' },
  { value: 'Alcance', label: 'Alcance' }
] as const;

export const OBJETIVOS_META = [
  { value: 'OUTCOME_SALES', label: 'Ventas' },
  { value: 'LINK_CLICKS', label: 'Clics en enlace' },
  { value: 'PROFILE_VISITS', label: 'Visitas al perfil' },
  { value: 'FOLLOWERS', label: 'Seguidores' },
  { value: 'PAGE_LIKES', label: 'Me gusta de página' },
  { value: 'BRAND_AWARENESS', label: 'Reconocimiento de marca' },
  { value: 'REACH', label: 'Alcance' },
  { value: 'CONVERSIONS', label: 'Conversiones' }
] as const;

// Helpers para validación
export interface CampañaValidationErrors {
  campaignId?: string;
  nombre?: string;
  montoInvertido?: string;
  fechaInicio?: string;
  fechaFin?: string;
  followersCount?: string;
}

export interface ReporteValidationErrors {
  unidadNegocio?: string;
  plataforma?: string;
  año?: string;
  mes?: string;
  campañas?: CampañaValidationErrors[];
}

// Tipos para tablas
export interface ReporteTableRow {
  id: number;
  unidadNegocio: string;
  plataforma: string;
  periodo: string; // "Junio 2025"
  totalCampañas: number;
  gastoTotal: number;
  esAutomatico: boolean;
  fechaCreacion?: string;
}

export interface CampañaTableRow {
  id: number;
  campaignId: string;
  nombre: string;
  tipo: string;
  montoInvertido: number;
  periodo: string; // "01/06 - 30/06"
  followersCount: number;
  tipoFuente: 'manual' | 'automatico';
  performance?: number;
}

// Constantes de validación
export const VALIDATION_RULES = {
  CAMPAIGN_ID_MIN_LENGTH: 3,
  CAMPAIGN_ID_MAX_LENGTH: 50,
  NOMBRE_MIN_LENGTH: 5,
  NOMBRE_MAX_LENGTH: 100,
  MONTO_MIN: 0.01,
  MONTO_MAX: 1000000,
  FOLLOWERS_MIN: 0,
  FOLLOWERS_MAX: 100000
} as const;