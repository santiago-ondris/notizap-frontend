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
    
    // Métricas de API
    clicks: number;
    impressions: number;
    ctr: number;
    reach: number;
    valorResultado: string;
    
    // Información del reporte padre
    unidadNegocio: string;
    plataforma: string;
    year: number;
    month: number;
  }
  
  export interface UpdateAdCampaignDto {
    campaignId: string;
    nombre: string;
    tipo: string;
    montoInvertido: number;
    objetivo: string;
    resultados: string;
    fechaInicio: string; // ISO date string
    fechaFin: string; // ISO date string
    followersCount: number;
    
    // Campos opcionales de métricas
    clicks?: number;
    impressions?: number;
    ctr?: number;
    reach?: number;
    valorResultado?: string;
  }
  
  export interface CampaignsResponse {
    data: AdCampaignReadDto[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    filters: {
      unidad?: string;
      plataforma?: string;
      year?: number;
      month?: number;
    };
  }
  
  export interface CampaignsStats {
    totalCampaigns: number;
    totalInvestment: number;
    avgInvestmentPerCampaign: number;
    campaignsWithMetrics: number;
    manualCampaigns: number;
    unidadesRepresented: number;
    plataformasRepresented: number;
  }
  
  export interface CampaignsFilters {
    unidad?: string;
    plataforma?: string;
    year?: number;
    month?: number;
    page?: number;
    pageSize?: number;
  }
  
  // Para el formulario de edición
  export interface CampaignFormData {
    campaignId: string;
    nombre: string;
    tipo: string;
    montoInvertido: number | '';
    objetivo: string;
    resultados: string;
    fechaInicio: Date | null;
    fechaFin: Date | null;
    followersCount: number | '';
    
    // Métricas opcionales (para campañas de API)
    showMetricsSection: boolean;
    clicks: number | '';
    impressions: number | '';
    ctr: number | '';
    reach: number | '';
    valorResultado: number | '';
  }
  
  export interface CampaignValidationErrors {
    campaignId?: string;
    nombre?: string;
    montoInvertido?: string;
    fechaInicio?: string;
    fechaFin?: string;
    clicks?: string;
    impressions?: string;
    ctr?: string;
    reach?: string;
    valorResultado?: string;
  }
  
  // Opciones para selects (reutilizando las existentes)
  export const TIPOS_CAMPAÑA_OPTIONS = [
    { value: 'Venta', label: 'Venta' },
    { value: 'Branding', label: 'Branding' },
    { value: 'Tráfico', label: 'Tráfico' },
    { value: 'Engagement', label: 'Engagement' },
    { value: 'Conversión', label: 'Conversión' },
    { value: 'Alcance', label: 'Alcance' }
  ] as const;
  
  export const OBJETIVOS_CAMPAÑA_OPTIONS = [
    { value: 'OUTCOME_SALES', label: 'Ventas' },
    { value: 'LINK_CLICKS', label: 'Clics en enlace' },
    { value: 'PROFILE_VISITS', label: 'Visitas al perfil' },
    { value: 'FOLLOWERS', label: 'Seguidores' },
    { value: 'PAGE_LIKES', label: 'Me gusta de página' },
    { value: 'BRAND_AWARENESS', label: 'Reconocimiento de marca' },
    { value: 'REACH', label: 'Alcance' },
    { value: 'CONVERSIONS', label: 'Conversiones' }
  ] as const;
  
  // Helpers
  export const formatCampaignPeriod = (fechaInicio: string, fechaFin: string): string => {
    const inicio = new Date(fechaInicio).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
    const fin = new Date(fechaFin).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
    return `${inicio} - ${fin}`;
  };
  
  export const isCampaignFromApi = (campaign: AdCampaignReadDto): boolean => {
    return campaign.clicks > 0 || campaign.impressions > 0 || campaign.reach > 0;
  };
  
  export const calculateCampaignPerformance = (campaign: AdCampaignReadDto): number => {
    if (isCampaignFromApi(campaign) && campaign.montoInvertido > 0) {
      const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions) * 100 : 0;
      return (ctr * campaign.reach) / campaign.montoInvertido;
    }
    
    if (campaign.followersCount > 0 && campaign.montoInvertido > 0) {
      return (campaign.followersCount / campaign.montoInvertido) * 100;
    }
    
    return 0;
  };