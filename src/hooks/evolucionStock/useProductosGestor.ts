import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evolucionStockKeys } from '@/hooks/evolucionStock/useCargaArchivos';
import { productosGestorService } from '@/services/evolucionStock/productosGestorService';
import type {
  ActualizarProductoOcultoRequest,
  ProductosGestorFiltros
} from '@/types/evolucionStock/productosGestorTypes';

export const productosGestorKeys = {
  all: [...evolucionStockKeys.all, 'productos-gestor'] as const,
  listado: (filtros: ProductosGestorFiltros) => [...productosGestorKeys.all, filtros] as const
};

export const useProductosGestor = (filtros: ProductosGestorFiltros) => useQuery({
  queryKey: productosGestorKeys.listado(filtros),
  queryFn: () => productosGestorService.obtener(filtros),
  placeholderData: previousData => previousData,
  staleTime: 1000 * 60 * 2
});

export const useActualizarProductoOculto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ActualizarProductoOcultoRequest) =>
      productosGestorService.actualizarOculto(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all })
  });
};
