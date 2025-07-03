export interface AnalisisPatrones {
    cuenta: string;
    periodoDesde: string;
    periodoHasta: string;
    patronesTemporales: PatronesTemporales;
    patronesContenido: PatronesContenido;
    recomendaciones: Recomendaciones;
  }
  
  export interface PatronesTemporales {
    mejoresHorarios: HorarioPerformance[];
    mejoresDias: DiaPerformance[];
    engagementPorHora: Record<string, number>;
    engagementPorDia: Record<string, number>;
  }
  
  export interface HorarioPerformance {
    hora: number;
    engagementPromedio: number;
    totalPublicaciones: number;
    rangoHorario: string;
  }
  
  export interface DiaPerformance {
    diaSemana: string;
    engagementPromedio: number;
    totalPublicaciones: number;
    ordenDia: number;
  }
  
  export interface PatronesContenido {
    analisisPorTipo: TipoContenidoAnalisis[];
    palabrasClaveExitosas: PalabraClave[];
    duracionVideos: DuracionVideoAnalisis;
  }
  
  export interface TipoContenidoAnalisis {
    tipoContenido: string;
    engagementPromedio: number;
    totalPublicaciones: number;
    alcancePromedio: number;
    temasRecurrentes: string[];
    porcentajeExito: number;
  }
  
  export interface PalabraClave {
    palabra: string;
    frecuencia: number;
    engagementPromedio: number;
    impactoPositivo: number;
  }
  
  export interface DuracionVideoAnalisis {
    rangoDuracionOptimo: string;
    engagementPorDuracion: Record<string, number>;
    duracionPromedioExitosos: number;
  }
  
  export interface Recomendaciones {
    horariosRecomendados: string[];
    diasRecomendados: string[];
    tiposContenidoRecomendados: string[];
    temasRecomendados: string[];
    proximaAccionSugerida: string;
    confianzaRecomendacion: number;
  }
  
  // Types para resumen ejecutivo
  export interface ResumenEjecutivo {
    cuenta: string;
    periodoAnalizado: string;
    tendenciaGeneral: 'Creciente' | 'Estable' | 'Decreciente';
    logrosPrincipales: string[];
    areasDeOportunidad: string[];
    accionesRecomendadas: string[];
    metricasClave: Record<string, string>;
  }
  
  // Types para comparativa de períodos
  export interface ComparativaPeriodos {
    cuenta: string;
    periodoActual: PeriodoMetricas;
    periodoAnterior: PeriodoMetricas;
    cambios: CambiosPeriodo;
  }
  
  export interface PeriodoMetricas {
    desde: string;
    hasta: string;
    seguidores: number;
    engagementPromedio: number;
    totalPublicaciones: number;
    totalInteracciones: number;
    alcancePromedio: number;
  }
  
  export interface CambiosPeriodo {
    cambioSeguidores: number;
    porcentajeCambioSeguidores: number;
    cambioEngagement: number;
    porcentajeCambioEngagement: number;
    cambioPublicaciones: number;
    porcentajeCambioPublicaciones: number;
    tendenciaGeneral: string;
    insightsClaves: string[];
  }
  
  // Types para filtros avanzados
  export interface AnalyticsFilters {
    cuenta: string;
    desde: string;
    hasta: string;
    tipoAnalisis?: 'patrones' | 'horarios' | 'contenido';
    diasAnalisis?: number;
  }
  
  // Types para estados de componentes
  export interface AnalyticsState {
    patrones: AnalisisPatrones | null;
    horarios: HorarioPerformance[];
    resumenEjecutivo: ResumenEjecutivo | null;
    comparativa: ComparativaPeriodos | null;
    loading: boolean;
    error: string | null;
  }
  
  // Types para props de componentes específicos
  export interface PatronesVisualizationProps {
    patrones: PatronesTemporales;
    className?: string;
  }
  
  export interface HorariosChartProps {
    horarios: HorarioPerformance[];
    destacarMejores?: number;
    className?: string;
  }
  
  export interface PalabrasClaveProps {
    palabras: PalabraClave[];
    maxItems?: number;
    showImpact?: boolean;
    className?: string;
  }
  
  export interface RecomendacionesCardProps {
    recomendaciones: Recomendaciones;
    onAcceptRecommendation?: (accion: string) => void;
    className?: string;
  }
  
  // Types para configuración de gráficos
  export interface ChartConfig {
    colors: {
      primary: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
    };
    gradients: {
      engagement: string[];
      followers: string[];
      content: string[];
    };
  }
  
  // Types utilitarios para análisis
  export type TendenciaType = 'up' | 'down' | 'stable';
  
  export type AnalysisTimeframe = '7d' | '30d' | '90d' | 'custom';
  
  export type ContentType = 'reels' | 'posts' | 'stories' | 'all';