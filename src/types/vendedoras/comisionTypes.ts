export interface ComisionVendedora {
    id: number;
    fecha: string; // ISO string
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedorNombre: string;
    montoFacturado: number;
    montoSinIva: number;
    totalVendedoras: number;
    montoComision: number;
    fechaCalculado: string; // ISO string
    calculadoPorNombre: string;
    fechaCreacion: string; // ISO string
  }
  
  export interface VendedoraDisponible {
    id: number;
    nombre: string;
    tieneVentasEnElDia: boolean;
    estaSeleccionada: boolean;
  }
  
  export interface VendedorasDisponiblesResponse {
    fecha: string; // ISO string
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
    fecha: string; // ISO string
    sucursalNombre: string;
    turno: string;
    tieneVentas: boolean;
    tieneComisionesCalculadas: boolean;
    montoFacturado: number;
    vendedorasConVentas: number;
    vendedorasConComisiones: number;
  }
  
  export interface CalendarioComisiones {
    fecha: string; // ISO string
    estadosPorSucursalTurno: EstadoCalculoComision[];
  }
  
  export interface ResumenComisionVendedora {
    vendedorNombre: string;
    totalComisiones: number;
    diasConComisiones: number;
    promedioComisionPorDia: number;
    primeraComision: string; // ISO string
    ultimaComision: string; // ISO string
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
  
  // Tipos para el estado del calendario
  export type EstadoDia = 'completo' | 'parcial' | 'pendiente' | 'sin-datos';
  
  export interface DiaCalendario {
    fecha: string; // ISO string (solo fecha, sin hora)
    dia: number;
    estado: EstadoDia;
    estadosPorSucursalTurno: EstadoCalculoComision[];
    esHoy: boolean;
    esDomingo: boolean;
    esDelMes: boolean; // para días que se muestran de meses anteriores/siguientes
  }
  
  // Request types
  export interface CalcularComisionRequest {
    fecha: string; // ISO string
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    vendedorasNombres: string[];
  }
  
  // Tipos para estadísticas (opcional, por si los necesitas después)
  export interface ComisionesStats {
    totalComisionesPagadas: number;
    totalDiasCalculados: number;
    totalVendedorasActivas: number;
    promedioComisionPorDia: number;
    promedioComisionPorVendedora: number;
    topVendedorasPorComisiones: ResumenComisionVendedora[];
    todasLasVendedoras: ResumenComisionVendedora[];
  }