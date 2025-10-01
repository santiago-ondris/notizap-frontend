export interface VentaVendedoraFilters {
    fechaInicio?: string; 
    fechaFin?: string; 
    sucursalNombre?: string;
    vendedorNombre?: string;
    productoNombre?: string;
    turno?: 'Mañana' | 'Tarde' | '';
    montoMinimo?: number;
    montoMaximo?: number;
    cantidadMinima?: number;
    cantidadMaxima?: number;
    incluirProductosDescuento: boolean;
    excluirDomingos: boolean;
    orderBy: 'fecha' | 'vendedor' | 'sucursal' | 'total' | 'cantidad';
    orderDesc: boolean;
    page: number;
    pageSize: number;
  }
  
  export interface FiltrosFormData {
    fechaInicio?: Date;
    fechaFin?: Date;
    sucursalNombre: string;
    vendedorNombre: string;
    productoNombre: string;
    turno: 'Mañana' | 'Tarde' | '';
    montoMinimo?: number;
    montoMaximo?: number;
    cantidadMinima?: number;
    cantidadMaxima?: number;
    incluirProductosDescuento: boolean;
    excluirDomingos: boolean;
  }
  
  export interface OrdenamientoConfig {
    campo: 'fecha' | 'vendedor' | 'sucursal' | 'total' | 'cantidad';
    direccion: 'asc' | 'desc';
  }
  
  export interface PaginacionConfig {
    paginaActual: number;
    tamanioPagina: number;
    totalPaginas: number;
    totalRegistros: number;
  }
  
  export const TURNOS_OPTIONS = [
    { value: '', label: 'Todos los turnos' },
    { value: 'Mañana', label: '🌅 Mañana (8:00-14:30)' },
    { value: 'Tarde', label: '🌆 Tarde (15:00-22:00)' }
  ] as const;
  
  export const ORDENAMIENTO_OPTIONS = [
    { value: 'fecha', label: '📅 Fecha' },
    { value: 'vendedor', label: '👤 Vendedora' },
    { value: 'sucursal', label: '🏢 Sucursal' },
    { value: 'total', label: '💰 Monto Total' },
    { value: 'cantidad', label: '📦 Cantidad' }
  ] as const;
  
  export const PAGE_SIZE_OPTIONS = [
    { value: 25, label: '25 por página' },
    { value: 50, label: '50 por página' },
    { value: 100, label: '100 por página' },
    { value: 200, label: '200 por página' }
  ] as const;
  
  export const FILTROS_PREDEFINIDOS = {
    ultimaSemana: {
      nombre: '📊 Última semana',
      descripcion: 'Datos de la última semana con información'
    },
    mesActual: {
      nombre: '📈 Mes actual',
      descripcion: 'Ventas del mes actual'
    },
    mesAnterior: {
      nombre: '📉 Mes anterior',
      descripcion: 'Ventas del mes anterior para comparar'
    }
  } as const;