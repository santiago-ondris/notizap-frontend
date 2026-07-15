export interface TransferenciasPeriodoFiltros {
  desde?: string;
  hasta?: string;
}

export interface RutaTransferencia {
  origen: string;
  destino: string;
  unidadesRecibidas: number;
  remitosInvolucrados: number;
}

export interface MatrizTransferencias {
  sucursales: string[];
  rutas: RutaTransferencia[];
  totalUnidades: number;
}

export interface ProductosTransferidosFiltros extends TransferenciasPeriodoFiltros {
  origen?: string;
  destino?: string;
  orderBy: string;
  orderDesc: boolean;
  page: number;
  pageSize: number;
}

export interface ProductoTransferido {
  codigoProducto?: number | null;
  nombreProducto: string;
  unidadesRecibidas: number;
  remitosInvolucrados: number;
  porcentajeFlujo: number;
}
