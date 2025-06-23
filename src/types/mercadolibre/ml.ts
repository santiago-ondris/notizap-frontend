export interface MercadoLibreManualReport {
    id: number;
    year: number;
    month: number;
    unitsSold: number;
    revenue: number;
  }
  
  export interface MercadoLibreManualDto {
    year: number;
    month: number;
    unitsSold: number;
    revenue: number;
  }
  
  export interface DailySalesDto {
    date: string;
    unitsSold: number;
    revenue: number;
  }
  
  // Publicidad
  export interface ReadAdDto {
    id: number;
    tipo: string;
    nombreCampania: string;
    inversion: number;
    year: number;
    month: number;
    detalles?: ProductAdDetailsDto | BrandAdDetailsDto | DisplayAdDetailsDto;
  }
  
  export interface ProductAdDetailsDto {
    acosObjetivo: number;
    ventasPads: number;
    acosReal: number;
    impresiones: number;
    clics: number;
    ingresos: number;
  }
  
  export interface BrandAdDetailsDto {
    presupuesto: number;
    ventas: number;
    clics: number;
    ingresos: number;
    cpc: number;
  }
  
  export interface DisplayAdDetailsDto {
    visitasConDisplay: number;
    visitasSinDisplay: number;
    clics: number;
    impresiones: number;
    alcance: number;
    costoPorVisita: number;
    anuncios: DisplayAnuncioDto[];
  }
  
  export interface DisplayAnuncioDto {
    nombre: string;
    impresiones: number;
    clics: number;
    visitas: number;
    ctr: number;
  }
  
  // Excel Analysis
  export interface ExcelTopProductoDto {
    modeloColor: string;
    cantidad: number;
    year?: number;
    month?: number;
  }
  
  // Para análisis
  export interface AnalysisMetrics {
    totalVentas: number;
    totalInversion: number;
    roi: number;
    ticketPromedio: number;
    mejorMes: string;
    crecimientoMensual: number;
  }
  
  export interface ChartDataPoint {
    periodo: string;
    ventas: number;
    inversion: number;
    roi: number;
    unidades: number;
  }
  
  export interface CampaignROI {
    tipo: string;
    totalInversion: number;
    totalIngresos: number;
    roi: number;
    campanias: number;
  }
  
  export interface TopProduct {
    modelo: string;
    totalVentas: number;
    meses: Array<{
      periodo: string;
      cantidad: number;
    }>;
  }