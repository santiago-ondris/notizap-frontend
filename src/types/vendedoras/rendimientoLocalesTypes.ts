export interface RendimientoLocalesDia {
    sucursalNombre: string;
    fecha: string; // ISO
    turno: 'Mañana' | 'Tarde';
    montoTotal: number;
    cantidadTotal: number;
    promedioMontoVendedora: number;
    promedioCantidadVendedora: number;
    vendedoras: RendimientoVendedoraDia[];
  }
  
  export interface RendimientoVendedoraDia {
    vendedoraNombre: string;
    monto: number;
    cantidad: number;
    cumplioMontoPromedio: boolean;
    cumplioCantidadPromedio: boolean;
  }
  
  export interface RendimientoVendedoraResumen {
    map(arg0: (r: any) => any): unknown;
    filter(arg0: (r: any) => boolean): unknown;
    vendedoraNombre: string;
    diasTrabajados: number;
    diasCumplioMonto: number;
    diasCumplioCantidad: number;
    porcentajeCumplimientoMonto: number;
    porcentajeCumplimientoCantidad: number;
  }
  
  export interface RendimientoLocalesResponse {
    dias: RendimientoLocalesDia[];
    resumenVendedoras: RendimientoVendedoraResumen[];
    totalDias: number;
    pagina: number;
    pageSize: number;
    totalPaginas: number;
  }
  
  export interface RendimientoLocalesFilters {
    fechaInicio: string; // ISO
    fechaFin: string; // ISO
    sucursalNombre: string;
    turno?: 'Mañana' | 'Tarde' | '';
    metricaComparar: 'monto' | 'cantidad';
    page: number;
    pageSize: number;
    excluirDomingos: boolean;
  }
  