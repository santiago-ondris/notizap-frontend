import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';
import type {
  CargarComprasRequest,
  CargarVentasRequest,
  MarcarSinComprasRequest,
  ProductoDetalleFiltros,
  RankingRotacionFiltros,
  RotacionAgregadoFiltros,
  TipoCalendarioStock
} from '@/types/evolucionStock/evolucionStockTypes';

export const evolucionStockKeys = {
  all: ['evolucion-stock'] as const,
  calendario: (tipo: TipoCalendarioStock, anio: number, mes: number) =>
    [...evolucionStockKeys.all, 'calendario', tipo, anio, mes] as const,
  buscarProductos: (q: string) => [...evolucionStockKeys.all, 'productos', 'buscar', q] as const,
  productoDetalle: (codigo: number, filtros: ProductoDetalleFiltros) =>
    [...evolucionStockKeys.all, 'productos', codigo, filtros] as const,
  ranking: (filtros: RankingRotacionFiltros) => [...evolucionStockKeys.all, 'ranking', filtros] as const,
  rotacionMarcas: (filtros: RotacionAgregadoFiltros) => [...evolucionStockKeys.all, 'rotacion', 'marcas', filtros] as const,
  rotacionProveedores: (filtros: RotacionAgregadoFiltros) => [...evolucionStockKeys.all, 'rotacion', 'proveedores', filtros] as const
};

export const useCalendarioEvolucionStock = (
  tipo: TipoCalendarioStock,
  anio: number,
  mes: number,
  enabled = true
) => {
  return useQuery({
    queryKey: evolucionStockKeys.calendario(tipo, anio, mes),
    queryFn: () => evolucionStockService.obtenerCalendario(tipo, anio, mes),
    enabled,
    staleTime: 1000 * 60 * 5
  });
};

export const useCargarComprasMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CargarComprasRequest) => evolucionStockService.cargarCompras(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all });
    }
  });
};

export const useCargarVentasMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CargarVentasRequest) => evolucionStockService.cargarVentas(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all });
    }
  });
};

export const useMarcarSinComprasMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MarcarSinComprasRequest) => evolucionStockService.marcarSinCompras(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all });
    }
  });
};

export const useBuscarProductosStock = (q: string, enabled = true) => {
  return useQuery({
    queryKey: evolucionStockKeys.buscarProductos(q),
    queryFn: () => evolucionStockService.buscarProductos(q),
    enabled: enabled && q.trim().length >= 2,
    staleTime: 1000 * 60 * 5
  });
};

export const useDetalleProductoStock = (codigo: number, filtros: ProductoDetalleFiltros, enabled = true) => {
  return useQuery({
    queryKey: evolucionStockKeys.productoDetalle(codigo, filtros),
    queryFn: () => evolucionStockService.obtenerDetalleProducto(codigo, filtros),
    enabled: enabled && codigo > 0,
    staleTime: 1000 * 60 * 5
  });
};

export const useRankingRotacionStock = (filtros: RankingRotacionFiltros) => {
  return useQuery({
    queryKey: evolucionStockKeys.ranking(filtros),
    queryFn: () => evolucionStockService.obtenerRankingRotacion(filtros),
    staleTime: 1000 * 60 * 5
  });
};

export const useRotacionMarcasStock = (filtros: RotacionAgregadoFiltros) => {
  return useQuery({
    queryKey: evolucionStockKeys.rotacionMarcas(filtros),
    queryFn: () => evolucionStockService.obtenerRotacionMarcas(filtros),
    staleTime: 1000 * 60 * 5
  });
};

export const useRotacionProveedoresStock = (filtros: RotacionAgregadoFiltros) => {
  return useQuery({
    queryKey: evolucionStockKeys.rotacionProveedores(filtros),
    queryFn: () => evolucionStockService.obtenerRotacionProveedores(filtros),
    staleTime: 1000 * 60 * 5
  });
};
