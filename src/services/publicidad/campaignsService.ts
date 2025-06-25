import api from '@/api/api';
import type {
  AdCampaignReadDto,
  UpdateAdCampaignDto,
  CampaignsResponse,
  CampaignsStats,
  CampaignsFilters,
  CampaignFormData,
  CampaignValidationErrors
} from '@/types/publicidad/campaigns';

class CampaignsService {
  private readonly baseUrl = '/api/v1/publicidad/campanas';

  /**
   * Obtiene todas las campañas con filtros y paginación
   */
  async getAllCampaigns(filters: CampaignsFilters = {}): Promise<CampaignsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.unidad) params.append('unidad', filters.unidad);
      if (filters.plataforma) params.append('plataforma', filters.plataforma);
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.month) params.append('month', filters.month.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo campañas:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar las campañas'
      );
    }
  }

  /**
   * Obtiene una campaña por ID
   */
  async getCampaignById(id: number): Promise<AdCampaignReadDto> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo campaña:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar la campaña'
      );
    }
  }

  /**
   * Actualiza una campaña
   */
  async updateCampaign(id: number, data: UpdateAdCampaignDto): Promise<AdCampaignReadDto> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando campaña:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar la campaña'
      );
    }
  }

  /**
   * Obtiene estadísticas de campañas
   */
  async getCampaignsStats(filters: Omit<CampaignsFilters, 'page' | 'pageSize'> = {}): Promise<CampaignsStats> {
    try {
      const params = new URLSearchParams();
      
      if (filters.unidad) params.append('unidad', filters.unidad);
      if (filters.plataforma) params.append('plataforma', filters.plataforma);
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.month) params.append('month', filters.month.toString());

      const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar las estadísticas'
      );
    }
  }

  /**
   * Transforma CampaignFormData a UpdateAdCampaignDto
   */
  transformFormToDto(formData: CampaignFormData): UpdateAdCampaignDto {
    const dto: UpdateAdCampaignDto = {
      campaignId: formData.campaignId,
      nombre: formData.nombre,
      tipo: formData.tipo,
      montoInvertido: typeof formData.montoInvertido === 'number' ? formData.montoInvertido : 0,
      objetivo: formData.objetivo,
      resultados: formData.resultados,
      fechaInicio: formData.fechaInicio?.toISOString() || '',
      fechaFin: formData.fechaFin?.toISOString() || '',
      followersCount: typeof formData.followersCount === 'number' ? formData.followersCount : 0
    };

    // Agregar métricas si están habilitadas
    if (formData.showMetricsSection) {
      if (typeof formData.clicks === 'number') dto.clicks = formData.clicks;
      if (typeof formData.impressions === 'number') dto.impressions = formData.impressions;
      if (typeof formData.ctr === 'number') dto.ctr = formData.ctr;
      if (typeof formData.reach === 'number') dto.reach = formData.reach;
      if (typeof formData.valorResultado === 'number') dto.valorResultado = formData.valorResultado;
    }

    return dto;
  }

  /**
   * Transforma AdCampaignReadDto a CampaignFormData
   */
  transformDtoToForm(campaign: AdCampaignReadDto): CampaignFormData {
    const hasMetrics = campaign.clicks > 0 || campaign.impressions > 0 || campaign.reach > 0;

    return {
      campaignId: campaign.campaignId,
      nombre: campaign.nombre,
      tipo: campaign.tipo,
      montoInvertido: campaign.montoInvertido,
      objetivo: campaign.objetivo,
      resultados: campaign.resultados,
      fechaInicio: campaign.fechaInicio ? new Date(campaign.fechaInicio) : null,
      fechaFin: campaign.fechaFin ? new Date(campaign.fechaFin) : null,
      followersCount: campaign.followersCount,
      
      // Métricas
      showMetricsSection: hasMetrics,
      clicks: hasMetrics ? campaign.clicks : '',
      impressions: hasMetrics ? campaign.impressions : '',
      ctr: hasMetrics ? campaign.ctr : '',
      reach: hasMetrics ? campaign.reach : '',
      valorResultado: hasMetrics ? campaign.valorResultado : ''
    };
  }

  /**
   * Valida los datos del formulario
   */
  validateCampaignForm(data: CampaignFormData): CampaignValidationErrors {
    const errors: CampaignValidationErrors = {};

    if (!data.campaignId || data.campaignId.length < 3) {
      errors.campaignId = 'El ID de campaña debe tener al menos 3 caracteres';
    }

    if (!data.nombre || data.nombre.length < 5) {
      errors.nombre = 'El nombre debe tener al menos 5 caracteres';
    }

    if (!data.montoInvertido || data.montoInvertido <= 0) {
      errors.montoInvertido = 'El monto debe ser mayor a 0';
    }

    if (!data.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!data.fechaFin) {
      errors.fechaFin = 'La fecha de fin es requerida';
    }

    if (data.fechaInicio && data.fechaFin && data.fechaInicio > data.fechaFin) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    // Validaciones de métricas si están habilitadas
    if (data.showMetricsSection) {
      if (typeof data.clicks === 'number' && data.clicks < 0) {
        errors.clicks = 'Los clicks no pueden ser negativos';
      }
      
      if (typeof data.impressions === 'number' && data.impressions < 0) {
        errors.impressions = 'Las impresiones no pueden ser negativas';
      }
      
      if (typeof data.ctr === 'number' && (data.ctr < 0 || data.ctr > 100)) {
        errors.ctr = 'El CTR debe estar entre 0 y 100';
      }
      
      if (typeof data.reach === 'number' && data.reach < 0) {
        errors.reach = 'El reach no puede ser negativo';
      }
    }

    return errors;
  }

  /**
   * Formatea moneda
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Formatea números con separadores
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  /**
   * Genera opciones de años disponibles
   */
  getYearOptions(): Array<{ value: number; label: string }> {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push({ value: i, label: i.toString() });
    }
    
    return years;
  }

  /**
   * Genera opciones de meses
   */
  getMonthOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: 'Enero' },
      { value: 2, label: 'Febrero' },
      { value: 3, label: 'Marzo' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Mayo' },
      { value: 6, label: 'Junio' },
      { value: 7, label: 'Julio' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Septiembre' },
      { value: 10, label: 'Octubre' },
      { value: 11, label: 'Noviembre' },
      { value: 12, label: 'Diciembre' }
    ];
  }

  /**
   * Genera filtros por defecto
   */
  getDefaultFilters(): CampaignsFilters {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      page: 1,
      pageSize: 20
    };
  }
}

// Exportar instancia singleton
export const campaignsService = new CampaignsService();
export default campaignsService;