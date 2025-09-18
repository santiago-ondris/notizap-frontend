import api from '../../api/api';
import type {
  AnalisisReposicionNinosRequest,
  AnalisisReposicionNinosResponse,
  ConfiguracionPorDefectoNinosResponse,
  InformacionModuloNinos
} from '../../types/reposicion/reposicionNinosTypes';
import type { ResultadoValidacionArchivo } from '../../types/reposicion/reposicionTypes';

const API_BASE_URL = '/api/v1/reposicion-ninos';

export class ReposicionNinosService {
  
  async validarArchivo(archivo: File): Promise<ResultadoValidacionArchivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await api.post(`${API_BASE_URL}/validar-archivo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  async analizarReposicion(request: AnalisisReposicionNinosRequest): Promise<Blob> {
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    
    if (request.usuarioAnalisis) {
      formData.append('usuarioAnalisis', request.usuarioAnalisis);
    }
    
    if (request.continuarConSucursalesFaltantes !== undefined) {
      formData.append('continuarConSucursalesFaltantes', request.continuarConSucursalesFaltantes.toString());
    }
    
    if (request.configuracion) {
      formData.append('configuracionJson', JSON.stringify(request.configuracion));
    }

    const response = await api.post(`${API_BASE_URL}/analizar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });

    return response.data;
  }

  async previewAnalisis(request: AnalisisReposicionNinosRequest): Promise<AnalisisReposicionNinosResponse> {
    const formData = new FormData();
    formData.append('archivo', request.archivo);
    
    if (request.usuarioAnalisis) {
      formData.append('usuarioAnalisis', request.usuarioAnalisis);
    }
    
    if (request.continuarConSucursalesFaltantes !== undefined) {
      formData.append('continuarConSucursalesFaltantes', request.continuarConSucursalesFaltantes.toString());
    }
    
    if (request.configuracion) {
      formData.append('configuracionJson', JSON.stringify(request.configuracion));
    }

    const response = await api.post(`${API_BASE_URL}/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }

  async obtenerConfiguracionDefecto(): Promise<ConfiguracionPorDefectoNinosResponse> {
    const response = await api.get(`${API_BASE_URL}/configuracion-defecto`);
    
    return {
      configuracion: response.data
    };
  }

  async obtenerInformacionModulo(): Promise<InformacionModuloNinos> {
    const response = await api.get(`${API_BASE_URL}/info-modulo`);
    return response.data;
  }

  formatearNombreArchivo(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    
    return `Reposicion_Ninos_${año}${mes}${dia}_${hora}${minuto}.xlsx`;
  }

  async descargarArchivo(blob: Blob, nombreArchivo?: string): Promise<void> {
    const nombre = nombreArchivo || this.formatearNombreArchivo();
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  validarTamañoArchivo(archivo: File): boolean {
    const tamañoMaximo = 900 * 1024; // 900KB
    return archivo.size <= tamañoMaximo;
  }

  validarTipoArchivo(archivo: File): boolean {
    const tiposPermitidos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    const extension = archivo.name.toLowerCase();
    return tiposPermitidos.includes(archivo.type) || 
           extension.endsWith('.xlsx') || 
           extension.endsWith('.xls');
  }

  obtenerEstadisticasRapidas(archivo: File): {
    nombre: string;
    tamaño: string;
    tipo: string;
    fechaModificacion: string;
  } {
    return {
      nombre: archivo.name,
      tamaño: this.formatearTamaño(archivo.size),
      tipo: archivo.type || 'Desconocido',
      fechaModificacion: new Date(archivo.lastModified).toLocaleString('es-AR')
    };
  }

  private formatearTamaño(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const decimales = 2;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimales)) + ' ' + tamaños[i];
  }
}

export const reposicionNinosService = new ReposicionNinosService();