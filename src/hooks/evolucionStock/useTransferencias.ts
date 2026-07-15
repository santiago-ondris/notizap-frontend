import { useQuery } from '@tanstack/react-query';
import { transferenciasService } from '@/services/evolucionStock/transferenciasService';
import type {
  ProductosTransferidosFiltros,
  TransferenciasPeriodoFiltros
} from '@/types/evolucionStock/transferenciasTypes';

export const transferenciasKeys = {
  all: ['evolucion-stock', 'transferencias'] as const,
  matriz: (filtros: TransferenciasPeriodoFiltros) =>
    [...transferenciasKeys.all, 'matriz', filtros] as const,
  productos: (filtros: ProductosTransferidosFiltros) =>
    [...transferenciasKeys.all, 'productos', filtros] as const
};

export const useMatrizTransferencias = (filtros: TransferenciasPeriodoFiltros) => useQuery({
  queryKey: transferenciasKeys.matriz(filtros),
  queryFn: () => transferenciasService.obtenerMatriz(filtros),
  staleTime: 1000 * 60 * 5
});

export const useProductosTransferidos = (filtros: ProductosTransferidosFiltros) => useQuery({
  queryKey: transferenciasKeys.productos(filtros),
  queryFn: () => transferenciasService.obtenerProductos(filtros),
  staleTime: 1000 * 60 * 5
});
