// Interfaz principal de ComisionOnline
export interface ComisionOnline {
    id: number;
    mes: number;
    año: number;
    totalSinNC: number;
    montoAndreani: number;
    montoOCA: number;
    montoCaddy: number;
    fechaCreacion: string;
    fechaActualizacion?: string;
    
    // Campos calculados
    totalEnvios: number;
    baseCalculo: number;
    baseCalculoSinIVA: number;
    comisionBruta: number;
    comisionPorPersona: number;
    periodoCompleto: string;
  }
  
  // DTO para crear nueva comisión
  export interface CreateComisionOnline {
    mes: number;
    año: number;
    totalSinNC: number;
    montoAndreani: number;
    montoOCA: number;
    montoCaddy: number;
  }
  
  // DTO para actualizar comisión existente
  export interface UpdateComisionOnline extends CreateComisionOnline {
    id: number;
  }
  
  // DTO para consultas con filtros
  export interface ComisionOnlineQuery {
    mes?: number;
    año?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pageNumber?: number;
    pageSize?: number;
    orderBy?: string;
    orderDescending?: boolean;
  }
  
  // Respuesta paginada
  export interface PaginatedComisionResponse {
    items: ComisionOnline[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }
  
  // DTO para cálculo de comisiones
  export interface CalculoComision {
    totalSinNC: number;
    totalEnvios: number;
    baseCalculo: number;
    baseCalculoSinIVA: number;
    comisionBruta: number;
    comisionPorPersona: number;
    detalleEnvios: DetalleEnvio[];
  }
  
  // Detalle de envíos por empresa
  export interface DetalleEnvio {
    empresa: string;
    monto: number;
  }
  
  // Request para calcular comisión
  export interface CalcularComisionRequest {
    mes: number;
    año: number;
    totalSinNC: number;
    montoAndreani: number;
    montoOCA: number;
    montoCaddy: number;
  }
  
  // Datos auxiliares
  export interface AuxiliaresComision {
    años: number[];
  }
  
  // Estado para UI
  export interface ComisionUIState {
    loading: boolean;
    error: string | null;
    selectedMes: number;
    selectedAño: number;
    comisionActual: ComisionOnline | null;
    calculoTemporal: CalculoComision | null;
    filtros: ComisionOnlineQuery;
  }
  
  // Formulario de datos de comisión
  export interface FormularioComision {
    totalSinNC: string;
    montoAndreani: string;
    montoOCA: string;
    montoCaddy: string;
  }
  
  // Validación de formulario
  export interface ValidacionFormulario {
    totalSinNC: string | null;
    montoAndreani: string | null;
    montoOCA: string | null;
    montoCaddy: string | null;
  }
  
  // Para integración con módulo de ventas
  export interface DatosVentasPeriodo {
    montella: number;
    alenka: number;
    mercadoLibre: number;
    total: number;
  }
  
  // Estados de carga específicos
  export interface EstadosCarga {
    guardando: boolean;
    calculando: boolean;
    cargandoVentas: boolean;
    cargandoComision: boolean;
  }
  
  // Constantes útiles
  export const EMPRESAS_ENVIO = ['ANDREANI', 'OCA', 'CADDY'] as const;
  export type EmpresaEnvio = typeof EMPRESAS_ENVIO[number];
  
  export const MESES_COMISION = [
    { value: 1, label: 'Enero', abrev: 'Ene' },
    { value: 2, label: 'Febrero', abrev: 'Feb' },
    { value: 3, label: 'Marzo', abrev: 'Mar' },
    { value: 4, label: 'Abril', abrev: 'Abr' },
    { value: 5, label: 'Mayo', abrev: 'May' },
    { value: 6, label: 'Junio', abrev: 'Jun' },
    { value: 7, label: 'Julio', abrev: 'Jul' },
    { value: 8, label: 'Agosto', abrev: 'Ago' },
    { value: 9, label: 'Septiembre', abrev: 'Sep' },
    { value: 10, label: 'Octubre', abrev: 'Oct' },
    { value: 11, label: 'Noviembre', abrev: 'Nov' },
    { value: 12, label: 'Diciembre', abrev: 'Dic' },
  ] as const;
  
  // Configuración de validación
  export const VALIDACION_CONFIG = {
    MIN_MONTO: 0,
    MAX_MONTO: 999999999,
    MIN_AÑO: 2020,
    MAX_AÑO: 2030,
    DECIMAL_PLACES: 2
  } as const;
  
  // Colores temáticos por empresa de envío
  export const COLORES_EMPRESAS = {
    ANDREANI: '#D94854', // Rojo principal
    OCA: '#B695BF',      // Violeta
    CADDY: '#51590E',    // Verde oliva
    TOTAL: '#FFD700'     // Dorado para totales
  } as const;
  
  // Emojis por empresa
  export const EMOJIS_EMPRESAS = {
    ANDREANI: '🚚',
    OCA: '📦',
    CADDY: '🛵',
    TOTAL: '💰'
  } as const;