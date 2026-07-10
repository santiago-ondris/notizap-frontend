import api from '../../api/api';
import type {
  ConfiguracionIgualacion,
  IgualacionStockResponseDto,
  TransferenciaDto,
} from '../../types/reposicion/igualacionTypes';
import type { ResultadoValidacionArchivo } from '../../types/reposicion/reposicionTypes';

const API_BASE = '/api/v1/igualacion-stock';

export class IgualacionService {
  async validarArchivo(archivo: File): Promise<ResultadoValidacionArchivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    const response = await api.post(`${API_BASE}/validar-archivo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async previewIgualacion(
    archivo: File,
    configuracion: ConfiguracionIgualacion,
    usuarioAnalisis: string = 'Usuario Actual'
  ): Promise<IgualacionStockResponseDto> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('usuarioAnalisis', usuarioAnalisis);
    formData.append('configuracionJson', JSON.stringify(configuracion));

    const response = await api.post(`${API_BASE}/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async generarExcel(
    transferencias: TransferenciaDto[],
    usuarioAnalisis: string = 'Usuario Actual'
  ): Promise<Blob> {
    const response = await api.post(
      `${API_BASE}/generar-excel`,
      { transferencias, usuarioAnalisis },
      { responseType: 'blob' }
    );
    return response.data;
  }

  descargarArchivo(blob: Blob, nombreArchivo: string = 'IgualacionStock.xlsx'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  formatearNombreArchivo(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19);
    return `IgualacionStock_${timestamp}.xlsx`;
  }
}

export const igualacionService = new IgualacionService();
