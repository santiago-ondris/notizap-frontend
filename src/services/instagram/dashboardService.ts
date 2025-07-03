import type { CuentaInstagram, DashboardFilters, EvolucionSeguidores, InstagramDashboard } from '@/types/instagram/dashboard';
import instagramAPI from './apiClient';

/**
 * Servicio para gestionar el dashboard de Instagram Analytics
 */
class InstagramDashboardService {
  
  /**
   * Obtiene el dashboard principal con todas las métricas
   */
  async getDashboard(filters: DashboardFilters): Promise<InstagramDashboard> {
    const { cuenta, desde, hasta } = filters;
    
    return instagramAPI.withRetry(async () => {
      return await instagramAPI.get<InstagramDashboard>(
        cuenta,
        '/dashboard',
        { desde, hasta }
      );
    });
  }

  /**
   * Obtiene solo las métricas generales (más rápido)
   */
  async getMetricasGenerales(cuenta: CuentaInstagram, desde?: string, hasta?: string) {
    const dashboard = await this.getDashboard({ cuenta, desde, hasta });
    return dashboard.metricasGenerales;
  }

  /**
   * Obtiene la evolución de seguidores con detalles
   */
  async getEvolucionSeguidores(
    cuenta: CuentaInstagram, 
    desde: string, 
    hasta: string
  ): Promise<EvolucionSeguidores[]> {
    return instagramAPI.get<EvolucionSeguidores[]>(
      cuenta,
      '/evolucion-seguidores',
      { desde, hasta }
    );
  }

  /**
   * Obtiene engagement rate por tipo de contenido
   */
  async getEngagementPorTipo(
    cuenta: CuentaInstagram,
    desde?: string,
    hasta?: string
  ): Promise<Record<string, number>> {
    return instagramAPI.get<Record<string, number>>(
      cuenta,
      '/engagement-por-tipo',
      { desde, hasta }
    );
  }

  /**
   * Obtiene dashboards para múltiples cuentas (comparativa rápida)
   */
  async getDashboardsMultiples(
    cuentas: CuentaInstagram[],
    desde?: string,
    hasta?: string
  ): Promise<Record<string, InstagramDashboard | null>> {
    return instagramAPI.batchRequest<InstagramDashboard>(
      cuentas,
      '/dashboard',
      { desde, hasta }
    );
  }

  /**
   * Obtiene solo los top performers para widget rápido
   */
  async getTopPerformers(cuenta: CuentaInstagram, desde?: string, hasta?: string) {
    const dashboard = await this.getDashboard({ cuenta, desde, hasta });
    return dashboard.topPerformers;
  }

  /**
   * Obtiene evolución simplificada para gráfico mini
   */
  async getEvolucionSimplificada(
    cuenta: CuentaInstagram,
    dias: number = 30
  ): Promise<{ fecha: string; seguidores: number }[]> {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - dias);

    const evolucion = await this.getEvolucionSeguidores(
      cuenta,
      desde.toISOString().split('T')[0],
      hasta.toISOString().split('T')[0]
    );

    return evolucion.map(item => ({
      fecha: item.fecha,
      seguidores: item.seguidores
    }));
  }

  /**
   * Verifica el estado de sincronización
   */
  async getEstadoSincronizacion(cuenta: CuentaInstagram): Promise<{
    ultimaSincronizacion: string;
    estaActualizado: boolean;
    minutosDesdeSync: number;
  }> {
    const dashboard = await this.getDashboard({ cuenta });
    const ultimaSync = new Date(dashboard.ultimaSincronizacion);
    const ahora = new Date();
    const minutosDesdeSync = Math.floor((ahora.getTime() - ultimaSync.getTime()) / (1000 * 60));
    
    return {
      ultimaSincronizacion: dashboard.ultimaSincronizacion,
      estaActualizado: minutosDesdeSync < 60, // Actualizado si es menor a 1 hora
      minutosDesdeSync
    };
  }

  /**
   * Calcula métricas de crecimiento
   */
  calculateGrowthMetrics(evolucion: EvolucionSeguidores[]): {
    crecimientoTotal: number;
    crecimientoPromedioDiario: number;
    mayorCrecimientoDia: { fecha: string; crecimiento: number };
    tendencia: 'positiva' | 'negativa' | 'estable';
  } {
    if (evolucion.length < 2) {
      return {
        crecimientoTotal: 0,
        crecimientoPromedioDiario: 0,
        mayorCrecimientoDia: { fecha: '', crecimiento: 0 },
        tendencia: 'estable'
      };
    }

    const crecimientoTotal = evolucion[evolucion.length - 1].seguidores - evolucion[0].seguidores;
    const diasConDatos = evolucion.filter(e => e.crecimientoDiario !== 0).length;
    const crecimientoPromedioDiario = diasConDatos > 0 ? 
      evolucion.reduce((sum, e) => sum + e.crecimientoDiario, 0) / diasConDatos : 0;

    const mayorCrecimiento = evolucion.reduce((max, current) => 
      current.crecimientoDiario > max.crecimientoDiario ? current : max
    );

    // Calcular tendencia basada en últimos 7 días vs anteriores
    const mitad = Math.floor(evolucion.length / 2);
    const primeraMitad = evolucion.slice(0, mitad);
    const segundaMitad = evolucion.slice(mitad);
    
    const promedioInicio = primeraMitad.reduce((sum, e) => sum + e.crecimientoDiario, 0) / primeraMitad.length;
    const promedioFin = segundaMitad.reduce((sum, e) => sum + e.crecimientoDiario, 0) / segundaMitad.length;
    
    let tendencia: 'positiva' | 'negativa' | 'estable' = 'estable';
    if (promedioFin > promedioInicio * 1.1) tendencia = 'positiva';
    else if (promedioFin < promedioInicio * 0.9) tendencia = 'negativa';

    return {
      crecimientoTotal,
      crecimientoPromedioDiario: Math.round(crecimientoPromedioDiario * 100) / 100,
      mayorCrecimientoDia: {
        fecha: mayorCrecimiento.fecha,
        crecimiento: mayorCrecimiento.crecimientoDiario
      },
      tendencia
    };
  }

  /**
   * Formatea datos para gráficos de Recharts
   */
  formatForChart(evolucion: EvolucionSeguidores[]) {
    return evolucion.map(item => ({
      fecha: new Date(item.fecha).toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      seguidores: item.seguidores,
      crecimiento: item.crecimientoDiario,
      // Formatear para tooltip
      fechaCompleta: new Date(item.fecha).toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));
  }

  /**
   * Obtiene comparativa rápida entre tipos de contenido
   */
  async getComparativaRapida(cuenta: CuentaInstagram, desde?: string, hasta?: string) {
    const [dashboard, engagement] = await Promise.all([
      this.getDashboard({ cuenta, desde, hasta }),
      this.getEngagementPorTipo(cuenta, desde, hasta)
    ]);

    return {
      contenido: dashboard.comparativaContenido,
      engagement,
      topPerformer: dashboard.topPerformers[0] || null,
      resumen: {
        totalPublicaciones: dashboard.metricasGenerales.totalPublicacionesPeriodo,
        engagementPromedio: dashboard.metricasGenerales.engagementPromedio,
        alcancePromedio: dashboard.metricasGenerales.alcancePromedio
      }
    };
  }
}

// Instancia singleton
export const dashboardService = new InstagramDashboardService();

export default dashboardService;