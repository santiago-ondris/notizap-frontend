import type { Key, ReactNode } from "react";

export interface ClienteResumenDto {
  id: number;
  nombre: string;
  cantidadCompras: number;
  montoTotalGastado: number;
  fechaPrimeraCompra: string;
  fechaUltimaCompra: string;
  canales: string;
  sucursales: string;
  observaciones?: string;
}

export interface ClienteDetalleDto extends ClienteResumenDto {
  compras: CompraDto[];
  topProductos: TopProductoDto[];
  topCategorias: TopCategoriaDto[];
  topMarcas: TopMarcaDto[];
}

export interface CompraDto {
  id: Key | null | undefined;
  fecha: string;
  canal: string;
  sucursal: string;
  total: number;
  detalles: CompraDetalleDto[];
}

export interface CompraDetalleDto {
  id: Key | null | undefined;
  producto: string;
  cantidad: number;
  total: number;
  marca: string;
  categoria: string;
}

export interface TopProductoDto {
  producto: string;
  cantidad: number;
  totalGastado: number;
}

export interface TopCategoriaDto {
  categoria: string;
  cantidad: number;
  totalGastado: number;
}

export interface TopMarcaDto {
  marca: string;
  cantidad: number;
  totalGastado: number;
}

// Nuevo: tipo para paginación
export interface PagedResult<T> {
  totalRecords: ReactNode;
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}