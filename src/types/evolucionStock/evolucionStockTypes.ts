export type TipoCalendarioStock = 'compras' | 'ventas';

export type EstadoDiaCarga = 'Cargado' | 'SinMovimientos' | 'Pendiente' | 'Futuro';

export interface DiaCalendarioStock {
  fecha: string;
  estado: EstadoDiaCarga | number;
  cargaArchivoId?: number | null;
}

export interface DiaCalendarioUi extends DiaCalendarioStock {
  dia: number;
  esDelMes: boolean;
  esHoy: boolean;
}

export interface FacturaDuplicada {
  numeroFactura: string;
  fechaExistente: string;
}

export interface ResultadoCargaStock {
  success: boolean;
  message: string;
  requiereConfirmacion: boolean;
  filasProcesadas: number;
  filasDescartadas: number;
  motivosDescarte: Record<string, number>;
  diasEnConflicto: string[];
  facturasDuplicadas: FacturaDuplicada[];
  coloresNuevos: number;
}

export interface CargarComprasRequest {
  archivo: File;
  fecha: string;
  sobreescribir?: boolean;
  ignorarFacturasDuplicadas?: boolean;
}

export interface CargarVentasRequest {
  archivo: File;
  sobreescribir?: boolean;
}

export interface MarcarSinComprasRequest {
  fecha: string;
}

export interface ProductoBusqueda {
  codigoProducto: number;
  nombreProducto: string;
}

export interface EventoEvolucionStock {
  fecha: string;
  tipo: number | string;
  cantidad: number;
  netoDelta: number;
  netoAcumulado: number;
}

export interface CurvaTalle {
  talle: string;
  comprado: number;
  vendido: number;
  porcentajeVendido: number;
}

export interface DesgloseColor {
  codigoColor: string;
  nombreColor: string;
  comprado: number;
  vendido: number;
  neto: number;
  porcentajeVendido: number;
}

export interface DesgloseSucursal {
  sucursal: string;
  vendido: number;
  devolucionesCliente: number;
  netoVendido: number;
  recibido?: number | null;
  enviadoAOtras?: number | null;
  sellThrough?: number | null;
}

export interface ProductoDetalle {
  codigoProducto: number;
  nombreProducto: string;
  oculto: boolean;
  netoNegativo: boolean;
  comprado: number;
  vendido: number;
  neto: number;
  serieTemporal: EventoEvolucionStock[];
  curvaTalles: CurvaTalle[];
  desglosePorColor: DesgloseColor[];
  desglosePorSucursal: DesgloseSucursal[];
}

export interface ProductoDetalleFiltros {
  desde?: string;
  hasta?: string;
  sucursal?: string;
  color?: string;
  talle?: string;
}

export interface RankingRotacionFiltros {
  desde?: string;
  hasta?: string;
  marca?: string;
  proveedor?: string;
  orderBy: string;
  orderDesc: boolean;
  page: number;
  pageSize: number;
}

export interface RankingRotacion {
  codigoProducto: number;
  nombreProducto: string;
  marca?: string | null;
  proveedor?: string | null;
  primeraCompraRegistrada: string;
  unidadesCompradas: number;
  unidadesVendidas: number;
  porcentajeVendido: number;
  porcentajeVendido7Dias: number;
  porcentajeVendido14Dias: number;
  porcentajeVendido30Dias: number;
  tieneNetoNegativo: boolean;
}

export interface RotacionAgregadoFiltros {
  desde?: string;
  hasta?: string;
}

export interface RotacionAgregado {
  nombre: string;
  unidadesCompradas: number;
  unidadesVendidas: number;
  porcentajeRotacion: number;
}

export interface PagedResult<T> {
  data: T[];
  totalRegistros: number;
  pagina: number;
  pageSize: number;
  totalPaginas: number;
}
