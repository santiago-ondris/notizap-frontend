// services/publicidad/reportesService.ts
import api from '@/api/api';
import {
  type AdReportDto,
  type SaveAdReportDto,
  type PublicidadResumenMensualDto,
  type MetaCampaignInsightDto,
  type MixedCampaignInsightDto,
  type SyncResultDto,
  type ReporteFormData,
  type CampañaFormData,
  type ReporteTableRow,
  type CampañaTableRow,
  type ReporteValidationErrors,
  type CampañaValidationErrors,
  VALIDATION_RULES
} from '@/types/publicidad/reportes';

class ReportesService {
  private readonly baseUrl = '/api/v1/publicidad';

  /**
   * Obtiene todos los reportes
   */
  async getAllReportes(): Promise<AdReportDto[]> {
    try {
      const response = await api.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo reportes:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar los reportes'
      );
    }
  }

  /**
   * Obtiene un reporte por ID
   */
  async getReporteById(id: number): Promise<AdReportDto> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo reporte:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar el reporte'
      );
    }
  }

  /**
   * Crea un nuevo reporte
   */
  async createReporte(data: SaveAdReportDto): Promise<AdReportDto> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creando reporte:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al crear el reporte'
      );
    }
  }

  /**
   * Actualiza un reporte existente
   */
  async updateReporte(id: number, data: SaveAdReportDto): Promise<AdReportDto> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando reporte:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al actualizar el reporte'
      );
    }
  }

  /**
   * Elimina un reporte
   */
  async deleteReporte(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error('Error eliminando reporte:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al eliminar el reporte'
      );
    }
  }

  /**
   * Obtiene resumen mensual
   */
  async getResumenMensual(
    year: number, 
    month: number, 
    unidad?: string
  ): Promise<PublicidadResumenMensualDto[]> {
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString()
      });
      
      if (unidad) {
        params.append('unidad', unidad);
      }

      const response = await api.get(`${this.baseUrl}/stats/resumen?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo resumen mensual:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar el resumen mensual'
      );
    }
  }

  /**
   * Obtiene insights de Meta API
   */
  async getMetaInsights(
    unidad: string,
    from: string,
    to: string
  ): Promise<MetaCampaignInsightDto[]> {
    try {
      const params = new URLSearchParams({
        unidad,
        from,
        to
      });

      const response = await api.get(`${this.baseUrl}/meta-insights?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo insights de Meta:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener insights de Meta'
      );
    }
  }

  /**
   * Obtiene insights mixtos (API + manual)
   */
  async getMixedInsights(
    unidad: string,
    from: string,
    to: string,
    reportId: number
  ): Promise<MixedCampaignInsightDto[]> {
    try {
      const params = new URLSearchParams({
        unidad,
        from,
        to,
        reportId: reportId.toString()
      });

      const response = await api.get(`${this.baseUrl}/mixed-insights?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo insights mixtos:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener insights mixtos'
      );
    }
  }

  /**
   * Sincroniza datos desde Meta API
   */
  async syncFromApi(
    unidad: string,
    from: string,
    to: string
  ): Promise<SyncResultDto> {
    try {
      const params = new URLSearchParams({
        unidad,
        from,
        to
      });

      const response = await api.post(`${this.baseUrl}/sync?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error sincronizando desde API:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al sincronizar desde la API'
      );
    }
  }

  /**
   * Transforma ReporteFormData a SaveAdReportDto
   */
  transformFormToDto(formData: ReporteFormData): SaveAdReportDto {
    return {
      unidadNegocio: formData.unidadNegocio,
      plataforma: formData.plataforma,
      year: formData.año,
      month: formData.mes,
      campañas: formData.campañas.map(this.transformCampañaFormToDto)
    };
  }

  /**
   * Transforma CampañaFormData a AdCampaignDto
   */
  transformCampañaFormToDto(campaña: CampañaFormData): import('@/types/publicidad/reportes').AdCampaignDto {
    return {
      campaignId: campaña.campaignId,
      nombre: campaña.nombre,
      tipo: campaña.tipo,
      montoInvertido: typeof campaña.montoInvertido === 'number' ? campaña.montoInvertido : 0,
      objetivo: campaña.objetivo,
      resultados: campaña.resultados,
      fechaInicio: campaña.fechaInicio?.toISOString() || '',
      fechaFin: campaña.fechaFin?.toISOString() || '',
      followersCount:
      campaña.followersMode === 'default'
        ? -1
        : typeof campaña.followersCount === 'number'
          ? campaña.followersCount
          : 0,
    };
  }

  /**
   * Transforma AdReportDto a ReporteFormData
   */
  transformDtoToForm(reporte: AdReportDto): ReporteFormData {
    return {
      unidadNegocio: reporte.unidadNegocio,
      plataforma: reporte.plataforma,
      año: reporte.year,
      mes: reporte.month,
      campañas: reporte.campañas.map(this.transformCampañaDtoToForm)
    };
  }

  /**
   * Transforma AdCampaignReadDto a CampañaFormData
   */
  transformCampañaDtoToForm(campaña: import('@/types/publicidad/reportes').AdCampaignReadDto): CampañaFormData {
    return {
      campaignId: campaña.campaignId,
      nombre: campaña.nombre,
      tipo: campaña.tipo,
      montoInvertido: campaña.montoInvertido,
      objetivo: campaña.objetivo,
      resultados: campaña.resultados,
      fechaInicio: campaña.fechaInicio ? new Date(campaña.fechaInicio) : null,
      fechaFin: campaña.fechaFin ? new Date(campaña.fechaFin) : null,
      followersMode:
        campaña.followersCount === -1 ? 'default' : 'especifica',
      followersCount:
        campaña.followersCount === -1
          ? ''
          : campaña.followersCount,
    };
  }

  /**
   * Transforma reportes para tabla
   */
  transformToTableRows(reportes: AdReportDto[]): ReporteTableRow[] {
    return reportes.map(reporte => ({
      id: reporte.id,
      unidadNegocio: reporte.unidadNegocio,
      plataforma: reporte.plataforma,
      periodo: this.formatPeriodo(reporte.month, reporte.year),
      totalCampañas: reporte.campañas.length,
      gastoTotal: reporte.campañas.reduce((sum, c) => sum + c.montoInvertido, 0),
      esAutomatico: reporte.campañas.some(c => (c.clicks || 0) > 0 || (c.impressions || 0) > 0)
    }));
  }

  /**
   * Transforma campañas para tabla
   */
  transformCampañasToTableRows(campañas: import('@/types/publicidad/reportes').AdCampaignReadDto[]): CampañaTableRow[] {
    return campañas.map(campaña => ({
      id: campaña.id,
      campaignId: campaña.campaignId,
      nombre: campaña.nombre,
      tipo: campaña.tipo,
      montoInvertido: campaña.montoInvertido,
      periodo: this.formatRangoFechas(campaña.fechaInicio, campaña.fechaFin),
      followersCount: campaña.followersCount,
      tipoFuente: (campaña.clicks || 0) > 0 || (campaña.impressions || 0) > 0 ? 'automatico' : 'manual',
      performance: this.calculateCampaignPerformance(campaña)
    }));
  }

  /**
   * Valida los datos del reporte
   */
  validateReporte(data: ReporteFormData): ReporteValidationErrors {
    const errors: ReporteValidationErrors = {};

    if (!data.unidadNegocio) {
      errors.unidadNegocio = 'La unidad de negocio es requerida';
    }

    if (!data.plataforma) {
      errors.plataforma = 'La plataforma es requerida';
    }

    if (!data.año || data.año < 2020 || data.año > new Date().getFullYear() + 1) {
      errors.año = 'El año debe estar entre 2020 y el año siguiente al actual';
    }

    if (!data.mes || data.mes < 1 || data.mes > 12) {
      errors.mes = 'El mes debe estar entre 1 y 12';
    }

    if (!data.campañas.length) {
      errors.campañas = [{ nombre: 'Debe incluir al menos una campaña' }];
    } else {
      errors.campañas = data.campañas.map(this.validateCampaña);
    }

    return errors;
  }

  /**
   * Valida una campaña individual
   */
  validateCampaña(campaña: CampañaFormData): CampañaValidationErrors {
    const errors: CampañaValidationErrors = {};

    if (!campaña.campaignId || campaña.campaignId.length < VALIDATION_RULES.CAMPAIGN_ID_MIN_LENGTH) {
      errors.campaignId = `El ID de campaña debe tener al menos ${VALIDATION_RULES.CAMPAIGN_ID_MIN_LENGTH} caracteres`;
    }

    if (!campaña.nombre || campaña.nombre.length < VALIDATION_RULES.NOMBRE_MIN_LENGTH) {
      errors.nombre = `El nombre debe tener al menos ${VALIDATION_RULES.NOMBRE_MIN_LENGTH} caracteres`;
    }

    if (!campaña.montoInvertido || campaña.montoInvertido < VALIDATION_RULES.MONTO_MIN) {
      errors.montoInvertido = `El monto debe ser mayor a ${VALIDATION_RULES.MONTO_MIN}`;
    }

    if (!campaña.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!campaña.fechaFin) {
      errors.fechaFin = 'La fecha de fin es requerida';
    }

    if (campaña.fechaInicio && campaña.fechaFin && campaña.fechaInicio > campaña.fechaFin) {
      errors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (typeof campaña.followersCount === 'number' && campaña.followersCount < 0) {
      errors.followersCount = 'Los followers no pueden ser negativos';
    }

    return errors;
  }

  /**
   * Helpers de formato
   */
  formatPeriodo(month: number, year: number): string {
    const meses = [
      '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[month]} ${year}`;
  }

  formatRangoFechas(inicio: string, fin: string): string {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    };
    
    return `${formatDate(inicio)} - ${formatDate(fin)}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Calcula performance de campaña
   */
  private calculateCampaignPerformance(campaña: import('@/types/publicidad/reportes').AdCampaignReadDto): number {
    if ((campaña.clicks || 0) > 0 && (campaña.impressions || 0) > 0 && (campaña.reach || 0) > 0 && campaña.montoInvertido > 0) {
      const ctr = ((campaña.clicks || 0) / (campaña.impressions || 0)) * 100;
      return (ctr * (campaña.reach || 0)) / campaña.montoInvertido;
    }
    
    if (campaña.followersCount > 0 && campaña.montoInvertido > 0) {
      return (campaña.followersCount / campaña.montoInvertido) * 100;
    }

    return 0;
  }

  /**
   * Crea campaña vacía para formularios
   */
  createEmptyCampaña(): CampañaFormData {
    return {
      campaignId: '',
      nombre: '',
      tipo: '',
      montoInvertido: '',
      objetivo: '',
      resultados: '',
      fechaInicio: null,
      fechaFin: null,
      followersMode: 'default',     // <- modo inicial
      followersCount: '', 
    };
  }

  /**
   * Crea reporte vacío para formularios
   */
  createEmptyReporte(): ReporteFormData {
    const now = new Date();
    return {
      unidadNegocio: '',
      plataforma: '',
      año: now.getFullYear(),
      mes: now.getMonth() + 1,
      campañas: [this.createEmptyCampaña()]
    };
  }
}

// Exportar instancia singleton
export const reportesService = new ReportesService();
export default reportesService;