import api from '@/api/api';
import type {
  CargarComprasRequest,
  CargarVentasRequest,
  DiaCalendarioStock,
  MarcarSinComprasRequest,
  PagedResult,
  ProductoBusqueda,
  ProductoDetalle,
  ProductoDetalleFiltros,
  RankingRotacion,
  RankingRotacionFiltros,
  RotacionAgregado,
  RotacionAgregadoFiltros,
  ResultadoCargaStock,
  TipoCalendarioStock
} from '@/types/evolucionStock/evolucionStockTypes';

const BASE_URL = '/api/v1/evolucion-stock';

export const evolucionStockService = {
  async cargarCompras(request: CargarComprasRequest): Promise<ResultadoCargaStock> {
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    formData.append('fecha', request.fecha);
    formData.append('sobreescribir', String(request.sobreescribir ?? false));
    formData.append('ignorarFacturasDuplicadas', String(request.ignorarFacturasDuplicadas ?? false));

    const response = await api.post(`${BASE_URL}/compras`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async cargarVentas(request: CargarVentasRequest): Promise<ResultadoCargaStock> {
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    formData.append('sobreescribir', String(request.sobreescribir ?? false));

    const response = await api.post(`${BASE_URL}/ventas`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async marcarSinCompras(request: MarcarSinComprasRequest): Promise<{ message: string }> {
    const response = await api.post(`${BASE_URL}/compras/sin-movimientos`, request);
    return response.data;
  },

  async obtenerCalendario(tipo: TipoCalendarioStock, anio: number, mes: number): Promise<DiaCalendarioStock[]> {
    const response = await api.get(`${BASE_URL}/calendario`, {
      params: { tipo, anio, mes }
    });
    return response.data;
  },

  async buscarProductos(q: string): Promise<ProductoBusqueda[]> {
    const response = await api.get(`${BASE_URL}/productos/buscar`, { params: { q } });
    return response.data;
  },

  async obtenerDetalleProducto(codigo: number, filtros: ProductoDetalleFiltros): Promise<ProductoDetalle> {
    const response = await api.get(`${BASE_URL}/productos/${codigo}`, { params: filtros });
    return response.data;
  },

  async obtenerRankingRotacion(filtros: RankingRotacionFiltros): Promise<PagedResult<RankingRotacion>> {
    const response = await api.get(`${BASE_URL}/ranking-rotacion`, { params: filtros });
    return response.data;
  },

  async obtenerRotacionMarcas(filtros: RotacionAgregadoFiltros): Promise<RotacionAgregado[]> {
    const response = await api.get(`${BASE_URL}/rotacion/marcas`, { params: filtros });
    return response.data;
  },

  async obtenerRotacionProveedores(filtros: RotacionAgregadoFiltros): Promise<RotacionAgregado[]> {
    const response = await api.get(`${BASE_URL}/rotacion/proveedores`, { params: filtros });
    return response.data;
  },

  validarArchivo(archivo: File): string | null {
    if (!archivo.name.toLowerCase().endsWith('.xlsx')) {
      return 'Solo se permiten archivos .xlsx.';
    }

    if (archivo.size > 10 * 1024 * 1024) {
      return 'El archivo no puede exceder los 10MB.';
    }

    return null;
  }
};
