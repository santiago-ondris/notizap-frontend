import api from '@/api/api';
import type {
  ActualizarDepositoMapeoRequest,
  CargaRemitos,
  CargarRemitosRequest,
  DepositoMapeoRemitos,
  ResultadoCargaRemitos,
  ResultadoDepositoMapeo,
  ValidacionRemitos
} from '@/types/evolucionStock/remitosTypes';

const BASE_URL = '/api/v1/evolucion-stock/remitos';

const crearFormData = (archivo: File) => {
  const formData = new FormData();
  formData.append('archivo', archivo);
  return formData;
};

export const remitosService = {
  async validar(archivo: File): Promise<ValidacionRemitos> {
    const response = await api.post(`${BASE_URL}/validar`, crearFormData(archivo), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async cargar(request: CargarRemitosRequest): Promise<ResultadoCargaRemitos> {
    const formData = crearFormData(request.archivo);
    formData.append('sobreescribir', String(request.sobreescribir ?? false));

    const response = await api.post(BASE_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async obtenerDepositos(): Promise<DepositoMapeoRemitos[]> {
    const response = await api.get(`${BASE_URL}/depositos`);
    return response.data;
  },

  async actualizarDeposito(request: ActualizarDepositoMapeoRequest): Promise<ResultadoDepositoMapeo> {
    const response = await api.put(`${BASE_URL}/depositos`, request);
    return response.data;
  },

  async obtenerCargas(): Promise<CargaRemitos[]> {
    const response = await api.get(`${BASE_URL}/cargas`);
    return response.data;
  },

  async eliminarCarga(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/api/v1/evolucion-stock/cargas/${id}`);
    return response.data;
  }
};
