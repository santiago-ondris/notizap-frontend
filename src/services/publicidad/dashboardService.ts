// services/publicidad/dashboardService.ts
import api from '@/api/api';
import {
    MESES_CORTOS,
    UNIDADES_COLORES,
  type PublicidadDashboardDto,
  type PublicidadDashboardParamsDto,
  type PublicidadDashboardFiltersDto,
  type TrendChartData,
  type UnidadPerformanceData,
  type PlataformaDistribution,
  PLATAFORMAS_COLORES,
  type UnidadNegocio,
  type PlataformaPublicidad
} from '@/types/publicidad/dashboard';

class DashboardService {
  private readonly baseUrl = '/api/v1/publicidad';

  /**
   * Obtiene los datos completos del dashboard
   */
  async getDashboardData(params?: PublicidadDashboardParamsDto): Promise<PublicidadDashboardDto> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.fechaInicio) {
        queryParams.append('fechaInicio', params.fechaInicio);
      }
      if (params?.fechaFin) {
        queryParams.append('fechaFin', params.fechaFin);
      }
      if (params?.mesesHaciaAtras) {
        queryParams.append('mesesHaciaAtras', params.mesesHaciaAtras.toString());
      }
      if (params?.unidadesNegocio?.length) {
        params.unidadesNegocio.forEach(unidad => {
          queryParams.append('unidadesNegocio', unidad);
        });
      }
      if (params?.plataformas?.length) {
        params.plataformas.forEach(plataforma => {
          queryParams.append('plataformas', plataforma);
        });
      }
      if (params?.topCampañasLimit) {
        queryParams.append('topCampañasLimit', params.topCampañasLimit.toString());
      }

      const url = queryParams.toString() 
        ? `${this.baseUrl}/dashboard?${queryParams.toString()}`
        : `${this.baseUrl}/dashboard`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo datos del dashboard:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar los datos del dashboard'
      );
    }
  }

  /**
   * Obtiene las opciones disponibles para los filtros
   */
  async getFiltersOptions(): Promise<PublicidadDashboardFiltersDto> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard/filters`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo opciones de filtros:', error);
      throw new Error(
        error.response?.data?.message || 
        'Error al cargar las opciones de filtros'
      );
    }
  }

  /**
   * Transforma los datos de tendencia mensual para los gráficos
   */
  transformTrendData(tendenciaMensual: PublicidadDashboardDto['tendenciaMensual']): TrendChartData[] {
    return tendenciaMensual.map(item => ({
      mes: item.mesNombre,
      mesCorto: MESES_CORTOS[item.mes] || '',
      año: item.año,
      gastoTotal: item.gastoTotal,
      gastoMontella: item.gastoMontella,
      gastoAlenka: item.gastoAlenka,
      gastoKids: item.gastoKids,
      gastoMeta: item.gastoMeta,
      gastoGoogle: item.gastoGoogle,
      totalCampañas: item.totalCampañas
    }));
  }

  /**
   * Transforma los datos de unidades para visualización
   */
  transformUnidadData(resumenPorUnidad: PublicidadDashboardDto['resumenPorUnidad']): UnidadPerformanceData[] {
    return resumenPorUnidad.map(item => ({
      unidad: item.unidadNegocio,
      gasto: item.gastoTotal,
      porcentaje: item.porcentajeDelTotal,
      cambio: item.cambioVsMesAnterior,
      campañas: item.totalCampañas,
      performance: item.performance,
      followers: item.followersObtenidos,
      color: UNIDADES_COLORES[item.unidadNegocio.toLowerCase() as UnidadNegocio] || '#9CA3AF'
    }));
  }

  /**
   * Transforma los datos de plataformas para visualización
   */
  transformPlataformaData(resumenPorPlataforma: PublicidadDashboardDto['resumenPorPlataforma']): PlataformaDistribution[] {
    return resumenPorPlataforma.map(item => ({
      plataforma: item.plataforma,
      gasto: item.gastoTotal,
      porcentaje: item.porcentajeDelTotal,
      esAutomatico: item.esAutomatico,
      color: PLATAFORMAS_COLORES[item.plataforma as PlataformaPublicidad] || '#9CA3AF'
    }));
  }

  /**
   * Formatea valores monetarios
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
   * Formatea números con separadores de miles
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('es-AR').format(value);
  }

  /**
   * Formatea porcentajes
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Determina el color de tendencia basado en el cambio porcentual
   */
  getTrendColor(percentage: number): string {
    if (percentage > 5) return '#51590E'; // Verde oliva (positivo)
    if (percentage < -5) return '#D94854'; // Rojo (negativo)
    return '#B695BF'; // Violeta (estable)
  }

  /**
   * Obtiene el ícono de tendencia
   */
  getTrendIcon(percentage: number): 'up' | 'down' | 'stable' {
    if (percentage > 5) return 'up';
    if (percentage < -5) return 'down';
    return 'stable';
  }

  /**
   * Calcula el rango de fechas para el período actual
   */
  getCurrentPeriodRange(): { fechaInicio: string; fechaFin: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      fechaInicio: firstDay.toISOString().split('T')[0],
      fechaFin: lastDay.toISOString().split('T')[0]
    };
  }

  /**
   * Calcula el rango de fechas para el período anterior
   */
  getPreviousPeriodRange(): { fechaInicio: string; fechaFin: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      fechaInicio: firstDay.toISOString().split('T')[0],
      fechaFin: lastDay.toISOString().split('T')[0]
    };
  }

  /**
   * Valida los parámetros del dashboard
   */
  validateDashboardParams(params: PublicidadDashboardParamsDto): string[] {
    const errors: string[] = [];

    if (params.fechaInicio && params.fechaFin) {
      const inicio = new Date(params.fechaInicio);
      const fin = new Date(params.fechaFin);
      
      if (inicio > fin) {
        errors.push('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }

    if (params.mesesHaciaAtras && (params.mesesHaciaAtras < 1 || params.mesesHaciaAtras > 24)) {
      errors.push('Los meses hacia atrás deben estar entre 1 y 24');
    }

    if (params.topCampañasLimit && (params.topCampañasLimit < 1 || params.topCampañasLimit > 50)) {
      errors.push('El límite de campañas debe estar entre 1 y 50');
    }

    return errors;
  }

  /**
   * Genera parámetros por defecto para el dashboard
   */
  getDefaultParams(): PublicidadDashboardParamsDto {
    const { fechaInicio, fechaFin } = this.getPreviousPeriodRange(); // <- Cambiar a período anterior
    
    return {
      fechaInicio,
      fechaFin,
      mesesHaciaAtras: 6,
      unidadesNegocio: [],
      plataformas: [],
      topCampañasLimit: 10
    };
  }

  /**
   * Calcula el rango de fechas para el mes anterior completo
   */
  getPreviousMonthRange(): { fechaInicio: string; fechaFin: string } {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0); // Último día del mes anterior
    
    return {
      fechaInicio: firstDay.toISOString().split('T')[0],
      fechaFin: lastDay.toISOString().split('T')[0]
    };
  }

  /**
   * Construye la URL con parámetros para compartir/bookmarking
   */
  buildShareableUrl(params: PublicidadDashboardParamsDto): string {
    const searchParams = new URLSearchParams();
    
    if (params.fechaInicio) searchParams.set('inicio', params.fechaInicio);
    if (params.fechaFin) searchParams.set('fin', params.fechaFin);
    if (params.mesesHaciaAtras) searchParams.set('meses', params.mesesHaciaAtras.toString());
    if (params.unidadesNegocio?.length) {
      searchParams.set('unidades', params.unidadesNegocio.join(','));
    }
    if (params.plataformas?.length) {
      searchParams.set('plataformas', params.plataformas.join(','));
    }
    if (params.topCampañasLimit) searchParams.set('limit', params.topCampañasLimit.toString());

    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  /**
   * Parsea parámetros desde URL
   */
  parseUrlParams(searchParams: URLSearchParams): PublicidadDashboardParamsDto {
    const params: PublicidadDashboardParamsDto = {};

    const inicio = searchParams.get('inicio');
    const fin = searchParams.get('fin');
    const meses = searchParams.get('meses');
    const unidades = searchParams.get('unidades');
    const plataformas = searchParams.get('plataformas');
    const limit = searchParams.get('limit');

    if (inicio) params.fechaInicio = inicio;
    if (fin) params.fechaFin = fin;
    if (meses) params.mesesHaciaAtras = parseInt(meses, 10);
    if (unidades) params.unidadesNegocio = unidades.split(',');
    if (plataformas) params.plataformas = plataformas.split(',');
    if (limit) params.topCampañasLimit = parseInt(limit, 10);

    return params;
  }
}

// Exportar instancia singleton
export const dashboardService = new DashboardService();
export default dashboardService;