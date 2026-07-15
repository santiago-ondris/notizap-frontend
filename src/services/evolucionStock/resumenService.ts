import api from '@/api/api';
import type {
  ResumenEjecutivo,
  ResumenEjecutivoFiltros
} from '@/types/evolucionStock/resumenTypes';

const BASE_URL = '/api/v1/evolucion-stock/resumen';

export const resumenService = {
  async obtener(filtros: ResumenEjecutivoFiltros): Promise<ResumenEjecutivo> {
    const response = await api.get(BASE_URL, { params: filtros });
    return response.data;
  }
};
