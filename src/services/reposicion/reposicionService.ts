import api from '../../api/api';
import type {
  AnalisisReposicionRequest,
  AnalisisReposicionResponse,
  ResultadoValidacionArchivo,
  ConfiguracionPorDefectoResponse,
  ConfiguracionAnalisis,
  CurvaTalles
} from '../../types/reposicion/reposicionTypes';

const API_BASE_URL = '/api/v1/reposicion';

export class ReposicionService {
  
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

  async analizarReposicion(request: AnalisisReposicionRequest): Promise<Blob> {
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

  async previewAnalisis(request: AnalisisReposicionRequest): Promise<AnalisisReposicionResponse> {
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

  async obtenerConfiguracionDefecto(): Promise<ConfiguracionPorDefectoResponse> {
    const response = await api.get(`${API_BASE_URL}/configuracion-defecto`);
    return response.data;
  }

  async obtenerSucursalesEsperadas(): Promise<string[]> {
    const response = await api.get(`${API_BASE_URL}/sucursales-esperadas`);
    return response.data;
  }

  async obtenerCurvaTallesDefecto(): Promise<Record<number, number>> {
    const response = await api.get(`${API_BASE_URL}/curva-talles-defecto`);
    return response.data;
  }

  descargarArchivo(blob: Blob, nombreArchivo: string = 'reposicion.xlsx'): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  validarArchivosInput(archivos: FileList | null): string | null {
    if (!archivos || archivos.length === 0) {
      return 'Debe seleccionar un archivo';
    }

    const archivo = archivos[0];
    
    if (!archivo.name.match(/\.(xlsx|xls)$/i)) {
      return 'El archivo debe ser un Excel (.xlsx o .xls)';
    }

    if (archivo.size > 500 * 1024) {
      return 'El archivo no puede superar los 500KB';
    }

    if (archivo.size === 0) {
      return 'El archivo está vacío';
    }

    return null;
  }

  validarConfiguracion(configuracion: ConfiguracionAnalisis): string[] {
    const errores: string[] = [];

    if (!configuracion.sucursalesObjetivo.length) {
      errores.push('Debe haber al menos una sucursal objetivo');
    }

    if (!configuracion.ordenPrioridad.length) {
      errores.push('Debe definirse un orden de prioridad');
    }

    for (const [sucursal, curva] of Object.entries(configuracion.curvasPorSucursal)) {
      const erroresCurva = this.validarCurvaTalles(curva);
      if (erroresCurva.length > 0) {
        errores.push(`Curva de ${sucursal}: ${erroresCurva.join(', ')}`);
      }
    }

    return errores;
  }

  validarCurvaTalles(curva: CurvaTalles): string[] {
    const errores: string[] = [];
    const talles = Object.entries(curva);

    let tieneStockPositivo = false;
    for (const [talle, cantidad] of talles) {
      if (cantidad < 0) {
        errores.push(`${talle.replace('talle', 'Talle ')}: no puede ser negativo`);
      }
      if (cantidad > 0) {
        tieneStockPositivo = true;
      }
      if (cantidad > 10) {
        errores.push(`${talle.replace('talle', 'Talle ')}: cantidad muy alta (máximo 10)`);
      }
    }

    if (!tieneStockPositivo) {
      errores.push('Al menos un talle debe tener cantidad mayor a 0');
    }

    return errores;
  }

  formatearNombreArchivo(prefijo: string = 'Reposicion'): string {
    const fecha = new Date();
    const timestamp = fecha.toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19);
    return `${prefijo}_${timestamp}.xlsx`;
  }

  obtenerExtensionArchivo(nombreArchivo: string): string {
    return nombreArchivo.split('.').pop()?.toLowerCase() || '';
  }

  esTipoArchivoValido(nombreArchivo: string): boolean {
    const extension = this.obtenerExtensionArchivo(nombreArchivo);
    return ['xlsx', 'xls'].includes(extension);
  }

  formatearTamanoArchivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const reposicionService = new ReposicionService();