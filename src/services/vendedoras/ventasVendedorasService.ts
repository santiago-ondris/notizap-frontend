import api from '@/api/api';
import type { 
  VentaVendedoraStats,
  VentaVendedoraUpload,
  VentaPorVendedora,
  VentaPorSucursal,
  VentaPorTurno,
  VentaPorDia,
  RangoFechas,
  UploadResult,
  ValidacionArchivo,
  VentasResponse
} from '@/types/vendedoras/ventaVendedoraTypes';
import type { VentaVendedoraFilters } from '@/types/vendedoras/filtrosTypes';

const BASE_URL = '/api/v1/ventas-vendedoras';

export const ventasVendedorasService = {
  async subirArchivo(uploadData: VentaVendedoraUpload): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('archivo', uploadData.archivo);
    formData.append('sobreescribirDuplicados', uploadData.sobreescribirDuplicados.toString());

    const response = await api.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async validarArchivo(archivo: File): Promise<ValidacionArchivo> {
    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await api.post(`${BASE_URL}/validate`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async eliminarPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<{ message: string }> {
    const response = await api.delete(`${BASE_URL}/eliminar-rango`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  async obtenerVentas(filtros: VentaVendedoraFilters): Promise<VentasResponse> {
    const response = await api.get(`${BASE_URL}`, { params: filtros });
    return response.data;
  },

  async obtenerEstadisticas(filtros: Partial<VentaVendedoraFilters>): Promise<VentaVendedoraStats> {
    const response = await api.get(`${BASE_URL}/estadisticas`, { params: filtros });
    return response.data;
  },

  async obtenerSucursales(): Promise<string[]> {
    const response = await api.get(`${BASE_URL}/sucursales`);
    return response.data;
  },

  async obtenerVendedores(): Promise<string[]> {
    const response = await api.get(`${BASE_URL}/vendedores`);
    return response.data;
  },

  async obtenerRangoFechas(): Promise<RangoFechas> {
    const response = await api.get(`${BASE_URL}/rango-fechas`);
    return response.data;
  },

  async obtenerVentasPorDia(filtros: Partial<VentaVendedoraFilters>): Promise<VentaPorDia[]> {
    const response = await api.get(`${BASE_URL}/por-dia`, { params: filtros });
    return response.data;
  },

  async obtenerTopVendedoras(filtros: Partial<VentaVendedoraFilters>, top: number = 10): Promise<VentaPorVendedora[]> {
    const response = await api.get(`${BASE_URL}/top-vendedoras`, { 
      params: { ...filtros, top } 
    });
    return response.data;
  },

  async obtenerVentasPorSucursal(filtros: Partial<VentaVendedoraFilters>): Promise<VentaPorSucursal[]> {
    const response = await api.get(`${BASE_URL}/por-sucursal`, { params: filtros });
    return response.data;
  },

  async obtenerVentasPorTurno(filtros: Partial<VentaVendedoraFilters>): Promise<VentaPorTurno[]> {
    const response = await api.get(`${BASE_URL}/por-turno`, { params: filtros });
    return response.data;
  },

  async verificarDatos(fechaInicio: string, fechaFin: string): Promise<{ existenDatos: boolean }> {
    const response = await api.get(`${BASE_URL}/verificar-datos`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  async obtenerTodasLasVendedoras(filtros: Partial<VentaVendedoraFilters>): Promise<VentaPorVendedora[]> {
    const response = await api.get(`${BASE_URL}/todas-vendedoras`, { params: filtros });
    return response.data;
  },
};

export const dateHelpers = {
  formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  },

  formatearFechaLocal(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  formatearFechaHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  obtenerUltimaSemana(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    return {
      inicio: hace7Dias,
      fin: hoy
    };
  },

  obtenerMesActual(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    return {
      inicio: inicioMes,
      fin: finMes
    };
  },

  esSabado(fechaISO: string): boolean {
    const fecha = new Date(fechaISO);
    return fecha.getDay() === 6;
  },

  esDomingo(fechaISO: string): boolean {
    const fecha = new Date(fechaISO);
    return fecha.getDay() === 0;
  }
};

export const moneyHelpers = {
  formatear(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  },

  formatearCompacto(monto: number): string {
    if (monto >= 1000000) {
      return `$${(monto / 1000000).toFixed(1)}M`;
    }
    if (monto >= 1000) {
      return `$${(monto / 1000).toFixed(1)}K`;
    }
    return `$${monto.toFixed(0)}`;
  }
};

export const validationHelpers = {
  esArchivoValido(archivo: File): { valido: boolean; mensaje?: string } {
    if (!archivo.name.toLowerCase().endsWith('.xlsx')) {
      return { 
        valido: false, 
        mensaje: 'Solo se permiten archivos Excel (.xlsx)' 
      };
    }

    if (archivo.size > 10 * 1024 * 1024) {
      return { 
        valido: false, 
        mensaje: 'El archivo no puede exceder los 10MB' 
      };
    }

    return { valido: true };
  },

  validarRangoFechas(inicio?: Date, fin?: Date): { valido: boolean; mensaje?: string } {
    if (!inicio || !fin) {
      return { valido: true };
    }

    if (inicio > fin) {
      return { 
        valido: false, 
        mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin' 
      };
    }

    const unAno = 365 * 24 * 60 * 60 * 1000;
    if (fin.getTime() - inicio.getTime() > unAno) {
      return { 
        valido: false, 
        mensaje: 'El rango no puede exceder 1 año' 
      };
    }

    return { valido: true };
  }
};