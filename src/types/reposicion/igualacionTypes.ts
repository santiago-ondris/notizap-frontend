export interface TransferenciaDto {
  sucursalOrigen: string;
  sucursalDestino: string;
  producto: string;
  color: string;
  talle: number;
  cantidad: number;
  stockOrigen: number;
  stockDestino: number;
}

export interface EnviosPorSucursalDto {
  nombreSucursal: string;
  transferencias: TransferenciaDto[];
  totalItems: number;
  totalUnidades: number;
}

export interface EstadisticasIgualacionDto {
  totalVariantesAnalizadas: number;
  variantesYaEquitativas: number;
  variantesConMovimientos: number;
  totalTransferencias: number;
  totalUnidadesAMover: number;
}

export interface ResultadoIgualacionDto {
  transferencias: TransferenciaDto[];
  enviosPorSucursal: EnviosPorSucursalDto[];
  estadisticas: EstadisticasIgualacionDto;
  mensajesInformativos: string[];
  fechaAnalisis: string;
  usuarioAnalisis: string;
}

export interface IgualacionStockResponseDto {
  exitoso: boolean;
  mensaje: string;
  resultado?: ResultadoIgualacionDto;
  errores: string[];
  nombreArchivo?: string;
  tiempoEjecucionMs: number;
}

export interface ConfiguracionIgualacion {
  sucursalesParticipantes: string[];
  // A quién darle cuando el stock no alcanza para todas
  ordenPrioridad: string[];
  // A quién sacarle primero cuando varias tienen excedente igual
  ordenPrioridadDonante: string[];
}

// Estado extendido por fila para UI (edición/veto)
export interface TransferenciaEditable extends TransferenciaDto {
  incluida: boolean;
  cantidadEditada: number;
}

// Estado de la página
export type PasoIgualacion = 'upload' | 'configuracion' | 'resultado';

export interface IgualacionPageState {
  paso: PasoIgualacion;
  upload: {
    archivo: File | null;
    validando: boolean;
    validacion: import('./reposicionTypes').ResultadoValidacionArchivo | null;
    error: string | null;
  };
  configuracion: {
    configuracion: ConfiguracionIgualacion;
  };
  analisis: {
    analizando: boolean;
    resultado: ResultadoIgualacionDto | null;
    transferenciasEditables: TransferenciaEditable[];
    error: string | null;
    progreso: number;
    mensaje: string;
  };
}
