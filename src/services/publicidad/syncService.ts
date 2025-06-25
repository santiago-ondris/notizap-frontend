// services/publicidad/syncService.ts
import api from '@/api/api';
import type {
  MetaCampaignInsightDto,
  SyncResultDto,
  AdReportDto
} from '@/types/publicidad/reportes';

interface SyncPreviewData {
  insights: MetaCampaignInsightDto[];
  existingReport?: AdReportDto;
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    dateRange: {
      from: string;
      to: string;
    };
    unidad: string;
  };
}

interface SyncValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface SyncHistoryItem {
  id: string;
  unidad: string;
  fechaSync: string;
  periodo: {
    from: string;
    to: string;
  };
  resultado: SyncResultDto;
  usuario: string;
}

class SyncService {
  private readonly baseUrl = '/api/v1/publicidad';

  /**
   * Obtiene preview de datos antes de sincronizar
   */
  async getPreviewData(
    unidad: string,
    from: string,
    to: string
  ): Promise<SyncPreviewData> {
    try {
      // Obtener insights de Meta API
      const insights = await this.getMetaInsights(unidad, from, to);
      
      // Buscar reporte existente para el período
      const existingReport = await this.findExistingReport(unidad, from);
      
      // Calcular resumen
      const summary = this.calculatePreviewSummary(insights, unidad, from, to);

      return {
        insights,
        existingReport,
        summary
      };
    } catch (error: any) {
      console.error('Error obteniendo preview de sincronización:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener vista previa de la sincronización'
      );
    }
  }

  /**
   * Valida los datos antes de sincronizar
   */
  validateSyncData(previewData: SyncPreviewData): SyncValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar que hay datos para sincronizar
    if (previewData.insights.length === 0) {
      errors.push('No se encontraron campañas en el período especificado');
    }

    // Validar unidad de negocio
    const validUnidades = ['montella', 'alenka'];
    if (!validUnidades.includes(previewData.summary.unidad.toLowerCase())) {
      errors.push('La unidad de negocio no está configurada para sincronización automática');
    }

    // Validar rango de fechas
    const fromDate = new Date(previewData.summary.dateRange.from);
    const toDate = new Date(previewData.summary.dateRange.to);
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays > 31) {
      warnings.push('El período seleccionado es mayor a 31 días, esto puede afectar el rendimiento');
    }

    // Validar si ya existe un reporte
    if (previewData.existingReport) {
      warnings.push(`Ya existe un reporte para ${previewData.existingReport.unidadNegocio} en ${this.formatPeriodo(previewData.existingReport.month, previewData.existingReport.year)}. Los datos serán actualizados.`);
    }

    // Validar gastos excesivos
    if (previewData.summary.totalSpend > 500000) {
      warnings.push('El gasto total es inusualmente alto, verifique los datos antes de continuar');
    }

    // Validar campañas duplicadas
    const campaignIds = previewData.insights.map(i => i.campaignId);
    const duplicateIds = campaignIds.filter((id, index) => campaignIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      warnings.push(`Se encontraron campañas duplicadas: ${duplicateIds.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Ejecuta la sincronización
   */
  async executeSync(
    unidad: string,
    from: string,
    to: string
  ): Promise<SyncResultDto> {
    try {
      const response = await api.post(`${this.baseUrl}/sync`, null, {
        params: { unidad, from, to }
      });

      // Guardar en historial local (solo en memoria para esta sesión)
      this.addToSyncHistory({
        id: Date.now().toString(),
        unidad,
        fechaSync: new Date().toISOString(),
        periodo: { from, to },
        resultado: response.data,
        usuario: 'current-user' // Esto debería venir del contexto de auth
      });

      return response.data;
    } catch (error: any) {
      console.error('Error ejecutando sincronización:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al ejecutar la sincronización'
      );
    }
  }

  /**
   * Obtiene insights de Meta (wrapper para consistencia)
   */
  private async getMetaInsights(
    unidad: string,
    from: string,
    to: string
  ): Promise<MetaCampaignInsightDto[]> {
    try {
      const params = new URLSearchParams({ unidad, from, to });
      const response = await api.get(`${this.baseUrl}/meta-insights?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo insights de Meta:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al obtener datos de Meta API'
      );
    }
  }

  /**
   * Busca reporte existente para el período
   */
  private async findExistingReport(unidad: string, from: string): Promise<AdReportDto | undefined> {
    try {
      const fromDate = new Date(from);
      const year = fromDate.getFullYear();
      const month = fromDate.getMonth() + 1;

      // Obtener todos los reportes y filtrar
      const response = await api.get(this.baseUrl);
      const reportes: AdReportDto[] = response.data;

      return reportes.find(r => 
        r.unidadNegocio.toLowerCase() === unidad.toLowerCase() &&
        r.plataforma === 'Meta' &&
        r.year === year &&
        r.month === month
      );
    } catch (error) {
      // Si hay error al buscar, continuar sin reporte existente
      console.warn('No se pudo verificar reportes existentes:', error);
      return undefined;
    }
  }

  /**
   * Calcula resumen para el preview
   */
  private calculatePreviewSummary(
    insights: MetaCampaignInsightDto[],
    unidad: string,
    from: string,
    to: string
  ) {
    return {
      totalCampaigns: insights.length,
      totalSpend: insights.reduce((sum, insight) => sum + insight.spend, 0),
      dateRange: { from, to },
      unidad
    };
  }

  /**
   * Manejo del historial de sincronizaciones (en memoria)
   */
  private syncHistory: SyncHistoryItem[] = [];

  private addToSyncHistory(item: SyncHistoryItem): void {
    this.syncHistory.unshift(item);
    // Mantener solo los últimos 20 items
    if (this.syncHistory.length > 20) {
      this.syncHistory = this.syncHistory.slice(0, 20);
    }
  }

  /**
   * Obtiene historial de sincronizaciones
   */
  getSyncHistory(): SyncHistoryItem[] {
    return [...this.syncHistory];
  }

  /**
   * Limpia el historial
   */
  clearSyncHistory(): void {
    this.syncHistory = [];
  }

  /**
   * Formatea el resultado de sincronización para mostrar
   */
  formatSyncResult(result: SyncResultDto): string {
    const updated = result.updatedCampaigns.length;
    const unchanged = result.unchangedCampaigns.length;
    const total = updated + unchanged;

    if (total === 0) {
      return 'No se encontraron campañas para sincronizar';
    }

    if (updated === 0) {
      return `${total} campañas verificadas, ninguna requirió actualización`;
    }

    if (unchanged === 0) {
      return `${updated} campañas sincronizadas exitosamente`;
    }

    return `${updated} campañas actualizadas, ${unchanged} sin cambios`;
  }

  /**
   * Determina el estado de la sincronización
   */
  getSyncStatus(result: SyncResultDto): 'success' | 'partial' | 'warning' {
    const updated = result.updatedCampaigns.length;
    const unchanged = result.unchangedCampaigns.length;
    const total = updated + unchanged;

    if (total === 0) return 'warning';
    if (updated > 0) return 'success';
    return 'partial';
  }

  /**
   * Genera recomendaciones basadas en el preview
   */
  generateRecommendations(previewData: SyncPreviewData): string[] {
    const recommendations: string[] = [];

    // Recomendar según número de campañas
    if (previewData.insights.length > 20) {
      recommendations.push('Alto número de campañas detectado. Considere filtrar por fechas más específicas para mejor rendimiento.');
    }

    // Recomendar según gastos
    const avgSpend = previewData.summary.totalSpend / previewData.insights.length;
    if (avgSpend < 1000) {
      recommendations.push('Gasto promedio por campaña es bajo. Verifique que las campañas estén activas.');
    }

    // Recomendar según reporte existente
    if (previewData.existingReport) {
      const existingCampaigns = previewData.existingReport.campañas.length;
      const newCampaigns = previewData.insights.length;
      
      if (newCampaigns > existingCampaigns * 1.5) {
        recommendations.push('Se detectaron significativamente más campañas que en el reporte existente. Verifique los filtros de fecha.');
      }
    }

    // Recomendación por defecto
    if (recommendations.length === 0) {
      recommendations.push('Los datos están listos para sincronizar. Revise el preview y confirme la operación.');
    }

    return recommendations;
  }

  /**
   * Calcula métricas de comparación
   */
  calculateComparisonMetrics(previewData: SyncPreviewData) {
    const insights = previewData.insights;
    
    return {
      totalSpend: insights.reduce((sum, i) => sum + i.spend, 0),
      totalClicks: insights.reduce((sum, i) => sum + i.clicks, 0),
      totalImpressions: insights.reduce((sum, i) => sum + i.impressions, 0),
      totalReach: insights.reduce((sum, i) => sum + i.reach, 0),
      averageCtr: insights.length > 0 ? insights.reduce((sum, i) => sum + i.ctr, 0) / insights.length : 0,
      averageCpc: insights.reduce((sum, i) => sum + i.clicks, 0) > 0 ? 
        insights.reduce((sum, i) => sum + i.spend, 0) / insights.reduce((sum, i) => sum + i.clicks, 0) : 0
    };
  }

  /**
   * Valida conexión con Meta API
   */
  async validateApiConnection(unidad: string): Promise<boolean> {
    try {
      // Intentar obtener datos de un día reciente
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      await this.getMetaInsights(unidad, dateStr, dateStr);
      return true;
    } catch (error) {
      console.warn('API connection validation failed:', error);
      return false;
    }
  }

  /**
   * Helpers de formato
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatPeriodo(month: number, year: number): string {
    const meses = [
      '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[month]} ${year}`;
  }

  /**
   * Obtiene las unidades disponibles para sync
   */
  getAvailableUnits(): Array<{ value: string; label: string; apiSupported: boolean }> {
    return [
      { value: 'montella', label: 'Montella', apiSupported: true },
      { value: 'alenka', label: 'Alenka', apiSupported: true },
      { value: 'kids', label: 'Kids', apiSupported: false }
    ];
  }

  /**
   * Calcula rango de fechas recomendado
   */
  getRecommendedDateRange(): { from: string; to: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  }
}

// Exportar instancia singleton
export const syncService = new SyncService();
export default syncService;