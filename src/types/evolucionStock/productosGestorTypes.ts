import type { PagedResult } from '@/types/evolucionStock/evolucionStockTypes';

export interface ProductosGestorFiltros {
  q?: string;
  soloOcultos: boolean;
  orderBy: string;
  orderDesc: boolean;
  page: number;
  pageSize: number;
}

export interface ProductoGestor {
  codigoProducto: number;
  nombreProducto: string;
  unidadesCompradas: number;
  unidadesVendidas: number;
  primerMovimiento: string;
  ultimoMovimiento: string;
  oculto: boolean;
  fechaOcultado?: string | null;
  usuarioId?: number | null;
}

export interface ActualizarProductoOcultoRequest {
  codigoProducto: number;
  oculto: boolean;
}

export type ProductosGestorResultado = PagedResult<ProductoGestor>;
