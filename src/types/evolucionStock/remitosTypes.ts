export interface ProductoRemitoSinMatch {
  nombre: string;
  unidades: number;
  motivo: string;
  codigosCandidatos: number[];
}

export interface MatchingRemitos {
  nombresTotales: number;
  nombresMatcheados: number;
  porcentaje: number;
  unidadesTotales: number;
  unidadesMatcheadas: number;
  porcentajeUnidades: number;
  sinMatch: ProductoRemitoSinMatch[];
}

export interface ValidacionRemitos {
  success: boolean;
  message: string;
  filasProcesadas: number;
  filasDescartadas: number;
  motivosDescarte: Record<string, number>;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  remitosDistintos: number;
  matching: MatchingRemitos;
  depositosSinMapear: string[];
  remitosYaCargados: number[];
  advertencias: string[];
  errores: string[];
}

export interface ResultadoCargaRemitos extends ValidacionRemitos {
  requiereConfirmacion: boolean;
  remitosReemplazados: number;
  productosReconciliados: number;
}

export interface DepositoMapeoRemitos {
  id?: number | null;
  nombreDeposito: string;
  nombreDepositoOriginal: string;
  sucursal?: string | null;
  estaMapeado: boolean;
  cantidadLineasAfectadas: number;
}

export interface ResultadoDepositoMapeo {
  success: boolean;
  message: string;
  mapeo?: DepositoMapeoRemitos | null;
  lineasActualizadas: number;
}

export interface CargaRemitos {
  id: number;
  nombreArchivoOriginal: string;
  fechaSubida: string;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  usuarioId: number;
  filasProcesadas: number;
  filasDescartadas: number;
  cantidadLineas: number;
  remitosDistintos: number;
}

export interface CargarRemitosRequest {
  archivo: File;
  sobreescribir?: boolean;
}

export interface ActualizarDepositoMapeoRequest {
  nombreDeposito: string;
  sucursal: string;
}
