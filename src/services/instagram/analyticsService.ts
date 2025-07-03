import type { AnalisisPatrones, AnalyticsFilters, ComparativaPeriodos, HorarioPerformance, ResumenEjecutivo } from '@/types/instagram/analytics';
import instagramAPI from './apiClient';
import type { CuentaInstagram } from '@/types/instagram/dashboard';
import type { ComparativaPeriodosParams } from '@/types/instagram/indexIg';


/**
 * Servicio para análisis avanzado de Instagram
 */
class InstagramAnalyticsService {

  /**
   * Obtiene análisis completo de patrones
   */
  async getAnalisisPatrones(filters: AnalyticsFilters): Promise<AnalisisPatrones> {
    const { cuenta, desde, hasta } = filters;
    
    return instagramAPI.withRetry(async () => {
      return await instagramAPI.get<AnalisisPatrones>(
        cuenta,
        '/analisis-patrones',
        { desde, hasta }
      );
    });
  }

  /**
   * Obtiene mejores horarios de publicación
   */
  async getMejoresHorarios(
    cuenta: CuentaInstagram,
    diasAnalisis: number = 30
  ): Promise<HorarioPerformance[]> {
    return instagramAPI.get<HorarioPerformance[]>(
      cuenta,
      '/mejores-horarios',
      { diasAnalisis }
    );
  }

  /**
   * Genera resumen ejecutivo
   */
  async getResumenEjecutivo(
    cuenta: CuentaInstagram,
    desde: string,
    hasta: string
  ): Promise<ResumenEjecutivo> {
    return instagramAPI.get<ResumenEjecutivo>(
      cuenta,
      '/resumen-ejecutivo',
      { desde, hasta }
    );
  }

  /**
   * Compara dos períodos
   */
  async compararPeriodos(params: ComparativaPeriodosParams): Promise<ComparativaPeriodos> {
    const {
      cuenta,
      periodoActualDesde,
      periodoActualHasta,
      periodoAnteriorDesde,
      periodoAnteriorHasta
    } = params;

    return instagramAPI.get<ComparativaPeriodos>(
      cuenta,
      '/comparar-periodos',
      {
        periodoActualDesde,
        periodoActualHasta,
        periodoAnteriorDesde,
        periodoAnteriorHasta
      }
    );
  }

  /**
   * Análisis rápido de últimos 30 días vs 30 días anteriores
   */
  async getComparativaRapida(cuenta: CuentaInstagram): Promise<ComparativaPeriodos> {
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    const hace60 = new Date();
    hace60.setDate(hoy.getDate() - 60);

    return this.compararPeriodos({
      cuenta,
      periodoActualDesde: hace30.toISOString().split('T')[0],
      periodoActualHasta: hoy.toISOString().split('T')[0],
      periodoAnteriorDesde: hace60.toISOString().split('T')[0],
      periodoAnteriorHasta: hace30.toISOString().split('T')[0]
    });
  }

  /**
   * Obtiene solo los horarios top (optimizado para widgets)
   */
  async getTopHorarios(
    cuenta: CuentaInstagram,
    cantidad: number = 5
  ): Promise<HorarioPerformance[]> {
    const horarios = await this.getMejoresHorarios(cuenta);
    return horarios.slice(0, cantidad);
  }

  /**
   * Análisis de contenido por tipo
   */
  async getAnalisisContenido(cuenta: CuentaInstagram, desde: string, hasta: string) {
    const patrones = await this.getAnalisisPatrones({ cuenta, desde, hasta });
    return patrones.patronesContenido;
  }

  /**
   * Obtiene solo las recomendaciones
   */
  async getRecomendaciones(cuenta: CuentaInstagram, desde: string, hasta: string) {
    const patrones = await this.getAnalisisPatrones({ cuenta, desde, hasta });
    return patrones.recomendaciones;
  }

  /**
   * Análisis temporal optimizado
   */
  async getAnalisisTemporal(cuenta: CuentaInstagram, desde: string, hasta: string) {
    const patrones = await this.getAnalisisPatrones({ cuenta, desde, hasta });
    return patrones.patronesTemporales;
  }

  /**
   * Utilities para procesamiento de datos
   */
  
  /**
   * Formatea horarios para gráfico de barras
   */
  formatHorariosForChart(horarios: HorarioPerformance[]) {
    return horarios.map(h => ({
      hora: `${h.hora}:00`,
      engagement: h.engagementPromedio,
      publicaciones: h.totalPublicaciones,
      rango: h.rangoHorario,
      // Color basado en performance
      color: h.engagementPromedio >= 3 ? '#51590E' : 
             h.engagementPromedio >= 2 ? '#B695BF' : '#D94854'
    }));
  }

  /**
   * Agrupa horarios por franjas (mañana, tarde, noche)
   */
  agruparHorariosPorFranja(horarios: HorarioPerformance[]) {
    const franjas: {
      mañana: { rango: string; horarios: HorarioPerformance[]; engagement: number };
      tarde: { rango: string; horarios: HorarioPerformance[]; engagement: number };
      noche: { rango: string; horarios: HorarioPerformance[]; engagement: number };
      madrugada: { rango: string; horarios: HorarioPerformance[]; engagement: number };
    } = {
      mañana: { rango: '6:00-12:00', horarios: [], engagement: 0 },
      tarde: { rango: '12:00-18:00', horarios: [], engagement: 0 },
      noche: { rango: '18:00-24:00', horarios: [], engagement: 0 },
      madrugada: { rango: '0:00-6:00', horarios: [], engagement: 0 }
    };

    horarios.forEach(h => {
      if (h.hora >= 6 && h.hora < 12) {
        franjas.mañana.horarios.push(h);
      } else if (h.hora >= 12 && h.hora < 18) {
        franjas.tarde.horarios.push(h);
      } else if (h.hora >= 18 && h.hora < 24) {
        franjas.noche.horarios.push(h);
      } else {
        franjas.madrugada.horarios.push(h);
      }
    });

    // Calcular engagement promedio por franja
    Object.values(franjas).forEach(franja => {
      if (franja.horarios.length > 0) {
        franja.engagement = franja.horarios.reduce((sum, h) => sum + h.engagementPromedio, 0) / franja.horarios.length;
      }
    });

    return franjas;
  }

  /**
   * Calcula score de optimización temporal
   */
  calcularScoreOptimizacion(patrones: AnalisisPatrones): {
    score: number;
    nivel: 'bajo' | 'medio' | 'alto';
    recomendaciones: string[];
  } {
    const { patronesTemporales, recomendaciones } = patrones;
    let score = 0;
    const tips: string[] = [];

    // Puntuación basada en consistencia de horarios
    const horariosConBuenEngagement = patronesTemporales.mejoresHorarios
      .filter(h => h.engagementPromedio > 2.5).length;
    score += (horariosConBuenEngagement / 24) * 40;

    // Puntuación basada en días óptimos
    const diasConBuenEngagement = patronesTemporales.mejoresDias
      .filter(d => d.engagementPromedio > 2.5).length;
    score += (diasConBuenEngagement / 7) * 30;

    // Puntuación basada en confianza de recomendaciones
    score += recomendaciones.confianzaRecomendacion * 30;

    // Generar recomendaciones específicas
    if (horariosConBuenEngagement < 3) {
      tips.push('Identificar más horarios óptimos de publicación');
    }
    if (diasConBuenEngagement < 3) {
      tips.push('Experimentar con diferentes días de la semana');
    }
    if (recomendaciones.confianzaRecomendacion < 0.7) {
      tips.push('Necesitas más datos para recomendaciones precisas');
    }

    const nivel: 'bajo' | 'medio' | 'alto' = 
      score >= 70 ? 'alto' : score >= 40 ? 'medio' : 'bajo';

    return {
      score: Math.round(score),
      nivel,
      recomendaciones: tips
    };
  }

  /**
   * Formatea comparativa para visualización
   */
  formatComparativaForDisplay(comparativa: ComparativaPeriodos) {
    const { periodoActual, periodoAnterior, cambios } = comparativa;
    
    return {
      metricas: [
        {
          nombre: 'Seguidores',
          actual: periodoActual.seguidores,
          anterior: periodoAnterior.seguidores,
          cambio: cambios.cambioSeguidores,
          porcentaje: cambios.porcentajeCambioSeguidores,
          icono: 'users',
          color: cambios.cambioSeguidores > 0 ? 'success' : 'error'
        },
        {
          nombre: 'Engagement',
          actual: `${periodoActual.engagementPromedio}%`,
          anterior: `${periodoAnterior.engagementPromedio}%`,
          cambio: `${cambios.cambioEngagement > 0 ? '+' : ''}${cambios.cambioEngagement.toFixed(1)}%`,
          porcentaje: cambios.porcentajeCambioEngagement,
          icono: 'heart',
          color: cambios.cambioEngagement > 0 ? 'success' : 'error'
        },
        {
          nombre: 'Publicaciones',
          actual: periodoActual.totalPublicaciones,
          anterior: periodoAnterior.totalPublicaciones,
          cambio: cambios.cambioPublicaciones,
          porcentaje: cambios.porcentajeCambioPublicaciones,
          icono: 'image',
          color: cambios.cambioPublicaciones > 0 ? 'success' : 'warning'
        }
      ],
      tendencia: cambios.tendenciaGeneral,
      insights: cambios.insightsClaves
    };
  }

  /**
   * Genera período automático (útil para llamadas rápidas)
   */
  generateAutoPeriod(dias: number = 30): { desde: string; hasta: string } {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(hasta.getDate() - dias);

    return {
      desde: desde.toISOString().split('T')[0],
      hasta: hasta.toISOString().split('T')[0]
    };
  }
}

// Instancia singleton
export const analyticsService = new InstagramAnalyticsService();

export default analyticsService;