export interface PublicidadDashboardDto {
    resumenGeneral: PublicidadResumenGeneralDto;
    resumenPorUnidad: PublicidadResumenUnidadDto[];
    resumenPorPlataforma: PublicidadResumenPlataformaDto[];
    comparativa: PublicidadComparativaDto;
    topCampañas: TopCampañaDto[];
    tendenciaMensual: TendenciaMensualDto[];
  }
  
  export interface PublicidadResumenGeneralDto {
    gastoTotalActual: number;
    gastoTotalAnterior: number;
    porcentajeCambio: number;
    totalCampañasActivas: number;
    totalClicks: number;
    totalImpressions: number;
    totalReach: number;
    ctrPromedio: number;
    costoPromedioPorClick: number;
  }
  
  export interface PublicidadResumenUnidadDto {
    unidadNegocio: string;
    gastoTotal: number;
    porcentajeDelTotal: number;
    cambioVsMesAnterior: number;
    totalCampañas: number;
    performance: number;
    followersObtenidos: number;
  }
  
  export interface PublicidadResumenPlataformaDto {
    plataforma: string;
    gastoTotal: number;
    porcentajeDelTotal: number;
    totalCampañas: number;
    ctrPromedio: number;
    totalClicks: number;
    totalImpressions: number;
    esAutomatico: boolean;
  }
  
  export interface PublicidadComparativaDto {
    mesActual: number;
    añoActual: number;
    mesAnterior: number;
    añoAnterior: number;
    diferenciaGasto: number;
    porcentajeCambio: number;
    tendencia: 'aumento' | 'disminucion' | 'estable';
    mejorUnidad: string;
    mejorPlataforma: string;
  }
  
  export interface TopCampañaDto {
    valorResultado: string;
    campaignId: string;
    nombre: string;
    unidadNegocio: string;
    plataforma: string;
    montoInvertido: number;
    performance: number;
    clicks: number;
    impressions: number;
    ctr: number;
    reach: number;
    tipoFuente: 'manual' | 'automatico';
    fechaInicio: string; // ISO date string
    fechaFin: string; // ISO date string
  }
  
  export interface TendenciaMensualDto {
    mes: number;
    año: number;
    mesNombre: string;
    gastoTotal: number;
    gastoMontella: number;
    gastoAlenka: number;
    gastoKids: number;
    gastoMeta: number;
    gastoGoogle: number;
    totalCampañas: number;
  }
  
  // Parámetros para filtros del dashboard
  export interface PublicidadDashboardParamsDto {
    fechaInicio?: string; // ISO date string
    fechaFin?: string; // ISO date string
    mesesHaciaAtras?: number;
    unidadesNegocio?: string[];
    plataformas?: string[];
    topCampañasLimit?: number;
  }
  
  // Opciones disponibles para filtros
  export interface PublicidadDashboardFiltersDto {
    unidadesNegocio: string[];
    plataformas: string[];
    fechaMinima?: string; // ISO date string
    fechaMaxima?: string; // ISO date string
  }
  
  // Estados del dashboard para el frontend
  export interface DashboardState {
    data: PublicidadDashboardDto | null;
    filters: PublicidadDashboardFiltersDto | null;
    loading: boolean;
    error: string | null;
    selectedFilters: PublicidadDashboardParamsDto;
  }
  
  // Tipos para componentes específicos
  export interface MetricCardProps {
    title: string;
    value: number;
    previousValue?: number;
    format: 'currency' | 'number' | 'percentage';
    icon: React.ComponentType<any>;
    color: string;
    isLoading?: boolean;
  }
  
  export interface TrendChartData {
    mes: string;
    mesCorto: string; // "Ene", "Feb", etc.
    año: number;
    gastoTotal: number;
    gastoMontella: number;
    gastoAlenka: number;
    gastoKids: number;
    gastoMeta: number;
    gastoGoogle: number;
    totalCampañas: number;
  }
  
  export interface UnidadPerformanceData {
    unidad: string;
    gasto: number;
    porcentaje: number;
    cambio: number;
    campañas: number;
    performance: number;
    followers: number;
    color: string; // Color temático según unidad
  }
  
  export interface PlataformaDistribution {
    plataforma: string;
    gasto: number;
    porcentaje: number;
    esAutomatico: boolean;
    color: string;
  }
  
  // Constantes para el frontend
  export const UNIDADES_COLORES = {
    montella: '#D94854', // Rojo principal
    alenka: '#B695BF',   // Violeta
    kids: '#51590E'      // Verde oliva
  } as const;
  
  export const PLATAFORMAS_COLORES = {
    Meta: '#D94854',     // Rojo principal
    Google: '#51590E'    // Verde oliva
  } as const;
  
  export const MESES_NOMBRES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ] as const;
  
  export const MESES_CORTOS = [
    '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ] as const;
  
  // Tipos para filtros del componente
  export interface FiltrosAvanzados {
    fechaInicio: Date | null;
    fechaFin: Date | null;
    unidadesSeleccionadas: string[];
    plataformasSeleccionadas: string[];
    mesesTendencia: number;
    limiteCampañas: number;
  }
  
  // Helpers type-safe
  export type UnidadNegocio = keyof typeof UNIDADES_COLORES;
  export type PlataformaPublicidad = keyof typeof PLATAFORMAS_COLORES;
  export type TendenciaType = PublicidadComparativaDto['tendencia'];