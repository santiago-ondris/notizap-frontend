import api from '@/api/api';
import type {
  RendimientoLocalesResponse,
  RendimientoLocalesFilters
} from '@/types/vendedoras/rendimientoLocalesTypes';

const BASE_URL = '/api/v1/vendedoras/locales';

export const rendimientoLocalesService = {
  async obtenerResumenLocales(
    filtros: RendimientoLocalesFilters
  ): Promise<RendimientoLocalesResponse> {
    const response = await api.get(`${BASE_URL}/resumen`, { params: filtros });
    return response.data;
  },
};
