import api from '@/api/api';
import type { PagedResult } from '@/types/evolucionStock/evolucionStockTypes';
import type {
  MatrizTransferencias,
  ProductoTransferido,
  ProductosTransferidosFiltros,
  TransferenciasPeriodoFiltros
} from '@/types/evolucionStock/transferenciasTypes';

const BASE_URL = '/api/v1/evolucion-stock';

export const transferenciasService = {
  async obtenerMatriz(filtros: TransferenciasPeriodoFiltros): Promise<MatrizTransferencias> {
    const response = await api.get(`${BASE_URL}/transferencias/matriz`, { params: filtros });
    return response.data;
  },

  async obtenerProductos(
    filtros: ProductosTransferidosFiltros
  ): Promise<PagedResult<ProductoTransferido>> {
    const response = await api.get(`${BASE_URL}/transferencias/productos`, { params: filtros });
    return response.data;
  }
};
