import api from '@/api/api';
import type {
  ActualizarProductoOcultoRequest,
  ProductoGestor,
  ProductosGestorFiltros,
  ProductosGestorResultado
} from '@/types/evolucionStock/productosGestorTypes';

const BASE_URL = '/api/v1/evolucion-stock/productos';

export const productosGestorService = {
  async obtener(filtros: ProductosGestorFiltros): Promise<ProductosGestorResultado> {
    const response = await api.get(BASE_URL, { params: filtros });
    return response.data;
  },

  async actualizarOculto(request: ActualizarProductoOcultoRequest): Promise<ProductoGestor> {
    const response = await api.put(`${BASE_URL}/${request.codigoProducto}/ocultar`, {
      oculto: request.oculto
    });
    return response.data;
  }
};
