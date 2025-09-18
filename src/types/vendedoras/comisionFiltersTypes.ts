export interface ComisionVendedoraFilters {
    fechaInicio?: string; 
    fechaFin?: string; 
    sucursalNombre?: string;
    vendedorNombre?: string;
    turno?: 'Mañana' | 'Tarde' | '';
    montoComisionMinimo?: number;
    montoComisionMaximo?: number;
    excluirDomingos: boolean;
    orderBy: 'fecha' | 'vendedor' | 'sucursal' | 'comision' | 'montoFacturado';
    orderDesc: boolean;
    page: number;
    pageSize: number;
  }
  
  export interface FiltrosCalendario {
    año: number;
    mes: number; 
    sucursalNombre?: string;
    turno?: 'Mañana' | 'Tarde' | '';
  }
  
  export interface FiltrosVendedora {
    vendedorNombre: string;
    fechaInicio?: string; 
    fechaFin?: string; 
  }
  
  export interface FiltrosSucursalTurno {
    sucursalNombre: string;
    turno: 'Mañana' | 'Tarde';
    fechaInicio?: string; 
    fechaFin?: string; 
  }
  
  export interface FiltrosEstadoCalculo {
    fechaInicio: string; 
    fechaFin: string; 
    sucursalNombre?: string;
    turno?: 'Mañana' | 'Tarde';
  }
  
  export interface OrdenamientoComisiones {
    campo: 'fecha' | 'vendedor' | 'sucursal' | 'comision' | 'montoFacturado';
    direccion: 'asc' | 'desc';
  }
  
  export interface PaginacionComisiones {
    paginaActual: number;
    tamanioPagina: number;
    totalPaginas: number;
    totalRegistros: number;
  }
  
  export const TURNOS_COMISIONES = [
    { value: '', label: 'Todos los turnos' },
    { value: 'Mañana', label: '🌅 Mañana (8:00-14:30)' },
    { value: 'Tarde', label: '🌆 Tarde (15:00-22:00)' }
  ] as const;
  
  export const ORDENAMIENTO_COMISIONES = [
    { value: 'fecha', label: '📅 Fecha' },
    { value: 'vendedor', label: '👤 Vendedora' },
    { value: 'sucursal', label: '🏢 Sucursal' },
    { value: 'comision', label: '💰 Comisión' },
    { value: 'montoFacturado', label: '🧾 Monto Facturado' }
  ] as const;
  
  export const PAGE_SIZE_COMISIONES = [
    { value: 25, label: '25 por página' },
    { value: 50, label: '50 por página' },
    { value: 100, label: '100 por página' },
    { value: 200, label: '200 por página' }
  ] as const;
  
  export const RANGOS_PREDEFINIDOS = {
    ultimaSemana: {
      nombre: '📊 Última semana',
      descripcion: 'Últimos 7 días con datos'
    },
    mesAnterior: {
      nombre: '📈 Mes anterior',
      descripcion: 'Todo el mes anterior completo'
    },
    ultimosTreinta: {
      nombre: '📉 Últimos 30 días',
      descripcion: 'Últimos 30 días corridos'
    }
  } as const;
  
  export interface EstadoFiltros {
    aplicados: boolean;
    contador: number; 
  }
  
  export interface FiltrosForm {
    fechaInicio?: Date;
    fechaFin?: Date;
    sucursalNombre: string;
    vendedorNombre: string;
    turno: 'Mañana' | 'Tarde' | '';
    montoComisionMinimo?: number;
    montoComisionMaximo?: number;
    excluirDomingos: boolean;
  }
  
  export type VistaComision = 'calendario' | 'por-vendedora' | 'por-sucursal' | 'calcular' | 'tabla';
  
  export interface OpcionVista {
    key: VistaComision;
    label: string;
    icono: string; 
    descripcion: string;
  }