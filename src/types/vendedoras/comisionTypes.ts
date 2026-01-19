export interface ComisionVendedora {
    id: number;
    fecha: string; 
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedorNombre: string;
    montoFacturado: number;
    montoSinIva: number;
    totalVendedoras: number;
    porcentajeComision: number;
    montoComision: number;
    fechaCalculado: string; 
    calculadoPorNombre: string;
    fechaCreacion: string; 
  }
  
  export interface VendedoraDisponible {
    id: number;
    nombre: string;
    tieneVentasEnElDia: boolean;
    estaSeleccionada: boolean;
  }
  
  export interface VendedorasDisponiblesResponse {
    fecha: string;
    sucursalNombre: string;
    turno: string;
    montoFacturado: number;
    vendedorasDisponibles: VendedoraDisponible[];
    vendedorasConVentas: VendedoraDisponible[];
    yaExistenComisiones: boolean;
  }
  
  export interface ComisionVendedoraCalculada {
    vendedorNombre: string;
    montoComision: number;
    yaExistia: boolean;
  }
  
  export interface CalcularComisionResponse {
    fecha: string;
    sucursalNombre: string;
    turno: string;
    montoFacturado: number;
    montoSinIva: number;
    totalVendedoras: number;
    porcentajeComision: number;
    comisionIndividual: number;
    comisionesPorVendedora: ComisionVendedoraCalculada[];
    mensaje: string;
  }
  
  export interface ComisionesResponse {
    data: ComisionVendedora[];
    totalRegistros: number;
    pagina: number;
    pageSize: number;
    totalPaginas: number;
  }
  
  export interface EstadoCalculoComision {
    fecha: string; 
    sucursalNombre: string;
    turno: string;
    tieneVentas: boolean;
    tieneComisionesCalculadas: boolean;
    montoFacturado: number;
    vendedorasConVentas: number;
    vendedorasConComisiones: number;
  }
  
  export interface CalendarioComisiones {
    fecha: string; 
    estadosPorSucursalTurno: EstadoCalculoComision[];
  }
  
  export interface ResumenComisionVendedora {
    vendedorNombre: string;
    totalComisiones: number;
    diasConComisiones: number;
    promedioComisionPorDia: number;
    primeraComision: string; 
    ultimaComision: string; 
    sucursalesQueTrabaja: string[];
  }
  
  export interface DatosMaestrosComisiones {
    sucursales: string[];
    vendedores: string[];
    rangoFechas: {
      fechaMinima: string;
      fechaMaxima: string;
    };
  }
  
  export type EstadoDia = 'completo' | 'parcial' | 'pendiente' | 'sin-datos';
  
  export interface DiaCalendario {
    fecha: string; 
    dia: number;
    estado: EstadoDia;
    estadosPorSucursalTurno: EstadoCalculoComision[];
    esHoy: boolean;
    esDomingo: boolean;
    esDelMes: boolean; 
  }
  
  export interface CalcularComisionRequest {
    fecha: string;
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedorasNombres: string[];
    porcentajeComision: number;
  }
  
  export interface ComisionesStats {
    totalComisionesPagadas: number;
    totalDiasCalculados: number;
    totalVendedorasActivas: number;
    promedioComisionPorDia: number;
    promedioComisionPorVendedora: number;
    topVendedorasPorComisiones: ResumenComisionVendedora[];
    todasLasVendedoras: ResumenComisionVendedora[];
  }

  export interface ExportarLiquidacionComisionesRequest {
    fechaInicio?: string;
    fechaFin?: string;
    sucursalNombre?: string;
    turno?: 'Mañana' | 'Tarde' | '';
    vendedorNombre?: string;
    orderBy: 'nombre' | 'monto' | 'dias';
    orderDesc: boolean;
  }
  
  export interface LiquidacionVendedora {
    vendedoraNombre: string;
    totalComisiones: number;
    diasTrabajos: number;
    sucursalesQueTrabaja: string;
  }

  // ==================== Tipos para Cálculo Batch ====================

  export interface TurnoPendiente {
    fecha: string;
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    montoFacturado: number;
    cantidadVendedoras: number;
    vendedoras: VendedoraDisponible[];
    // Estado local para UI
    seleccionado?: boolean;
    modificado?: boolean;
    vendedorasSeleccionadas?: VendedoraDisponible[];
    porcentajeComision?: number;
  }

  export interface TurnosPendientesPorSucursal {
    sucursalNombre: string;
    turnos: TurnoPendiente[];
    totalTurnos: number;
    montoTotalFacturado: number;
  }

  export interface TurnosPendientesBatch {
    fechaInicio: string;
    fechaFin: string;
    porSucursal: TurnosPendientesPorSucursal[];
    totalTurnos: number;
    montoTotalFacturado: number;
  }

  export interface TurnoParaCalcular {
    fecha: string;
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedorasNombres: string[];
    porcentajeComision: number;
  }

  export interface CalcularBatchRequest {
    turnos: TurnoParaCalcular[];
  }

  export interface ResultadoTurnoBatch {
    fecha: string;
    sucursalNombre: string;
    turno: string;
    exitoso: boolean;
    error?: string;
    montoFacturado: number;
    comisionTotal: number;
    vendedorasCalculadas: number;
  }

  export interface CalcularBatchResponse {
    turnosCalculados: number;
    turnosConError: number;
    comisionTotalCalculada: number;
    resultados: ResultadoTurnoBatch[];
    mensaje: string;
  }