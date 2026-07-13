type TurnoLegacy = '' | 'Mañana' | 'MaÃ±ana' | 'Tarde';

export interface ComisionVendedoraFilters {
  fechaInicio?: string;
  fechaFin?: string;
  sucursalNombre?: string;
  vendedorNombre?: string;
  turno?: TurnoLegacy;
  montoComisionMinimo?: number;
  montoComisionMaximo?: number;
  excluirDomingos: boolean;
  orderBy: 'fecha' | 'vendedor' | 'sucursal' | 'comision' | 'montoFacturado';
  orderDesc: boolean;
  page: number;
  pageSize: number;
}

export interface ComisionFiltrosFormData {
  fechaInicio?: Date;
  fechaFin?: Date;
  sucursalNombre: string;
  vendedorNombre: string;
  turno: TurnoLegacy;
  montoComisionMinimo?: number;
  montoComisionMaximo?: number;
  excluirDomingos: boolean;
}

export const COMISION_TURNOS_OPTIONS = [
  { value: '', label: 'Todos los turnos' },
  { value: 'MaÃ±ana', label: 'MaÃ±ana (8:00-14:30)' },
  { value: 'Tarde', label: 'Tarde (15:00-22:00)' }
] as const;

export const COMISION_ORDENAMIENTO_OPTIONS = [
  { value: 'fecha', label: 'Fecha' },
  { value: 'vendedor', label: 'Vendedora' },
  { value: 'sucursal', label: 'Sucursal' },
  { value: 'comision', label: 'Comision' },
  { value: 'montoFacturado', label: 'Monto facturado' }
] as const;

export const COMISION_PAGE_SIZE_OPTIONS = [
  { value: 25, label: '25 por pagina' },
  { value: 50, label: '50 por pagina' },
  { value: 100, label: '100 por pagina' },
  { value: 200, label: '200 por pagina' }
] as const;

export const ESTADOS_DIA_CALENDARIO = {
  sinVentas: {
    nombre: 'Sin ventas',
    descripcion: 'No hay ventas registradas',
    color: 'bg-gray-500/20 text-gray-400'
  },
  ventasSinComisiones: {
    nombre: 'Pendiente calculo',
    descripcion: 'Hay ventas pero no se calcularon comisiones',
    color: 'bg-yellow-500/20 text-yellow-400'
  },
  comisionesCalculadas: {
    nombre: 'Comisiones calculadas',
    descripcion: 'Comisiones calculadas y guardadas',
    color: 'bg-green-500/20 text-green-400'
  },
  domingo: {
    nombre: 'Domingo',
    descripcion: 'Dia no laborable',
    color: 'bg-purple-500/20 text-purple-400'
  },
  futuro: {
    nombre: 'Futuro',
    descripcion: 'Fecha futura',
    color: 'bg-blue-500/20 text-blue-400'
  }
} as const;

export const COMISION_FILTROS_PREDEFINIDOS = {
  ultimaSemana: {
    nombre: 'Ultima semana',
    descripcion: 'Comisiones de la ultima semana',
    icono: ''
  },
  mesActual: {
    nombre: 'Mes actual',
    descripcion: 'Comisiones del mes actual',
    icono: ''
  },
  mesAnterior: {
    nombre: 'Mes anterior',
    descripcion: 'Comisiones del mes anterior',
    icono: ''
  },
  trimestre: {
    nombre: 'Ultimo trimestre',
    descripcion: 'Comisiones de los ultimos 3 meses',
    icono: ''
  }
} as const;
