import api from '@/api/api';
import type {
  ComisionesResponse,
  VendedorasDisponiblesResponse,
  CalcularComisionRequest,
  CalcularComisionResponse,
  EstadoCalculoComision,
  CalendarioComisiones,
  ResumenComisionVendedora,
  DatosMaestrosComisiones,
  ComisionesStats,
  ExportarLiquidacionComisionesRequest
} from '@/types/vendedoras/comisionTypes';
import type {
  ComisionVendedoraFilters,
  FiltrosCalendario,
  FiltrosVendedora,
  FiltrosSucursalTurno,
  FiltrosEstadoCalculo
} from '@/types/vendedoras/comisionFiltersTypes';

const BASE_URL = '/api/v1/vendedoras/comisiones';

export const comisionesVendedorasService = {
  async obtenerVendedorasDisponibles(
    fecha: string,
    sucursalNombre: string,
    turno: string
  ): Promise<VendedorasDisponiblesResponse> {
    const response = await api.get(`${BASE_URL}/vendedoras-disponibles`, {
      params: { fecha, sucursalNombre, turno }
    });
    return response.data;
  },

  async exportarLiquidacion(
    filtros: ExportarLiquidacionComisionesRequest
  ): Promise<Blob> {
    const response = await api.post(`${BASE_URL}/exportar-liquidacion`, filtros, {
      responseType: 'blob'
    });
    return response.data;
  },

  async calcularComisiones(request: CalcularComisionRequest): Promise<CalcularComisionResponse> {
    const response = await api.post(`${BASE_URL}/calcular`, request);
    return response.data;
  },

  async recalcularComisiones(request: CalcularComisionRequest): Promise<CalcularComisionResponse> {
    const response = await api.put(`${BASE_URL}/recalcular`, request);
    return response.data;
  },

  async existenComisionesCalculadas(
    fecha: string,
    sucursalNombre: string,
    turno: string
  ): Promise<boolean> {
    const response = await api.get(`${BASE_URL}/existen`, {
      params: { fecha, sucursalNombre, turno }
    });
    return response.data;
  },

  async obtenerComisiones(filtros: ComisionVendedoraFilters): Promise<ComisionesResponse> {
    const response = await api.get(`${BASE_URL}`, { params: filtros });
    return response.data;
  },

  async obtenerResumenVendedora(filtros: FiltrosVendedora): Promise<ResumenComisionVendedora> {
    const { vendedorNombre, fechaInicio, fechaFin } = filtros;
    const response = await api.get(`${BASE_URL}/vendedora/${vendedorNombre}`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  async obtenerComisionesPorSucursalTurno(
    filtros: FiltrosSucursalTurno
  ): Promise<ComisionesResponse> {
    const comisionFilters: ComisionVendedoraFilters = {
      sucursalNombre: filtros.sucursalNombre,
      turno: filtros.turno,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      excluirDomingos: true,
      orderBy: 'fecha',
      orderDesc: true,
      page: 1,
      pageSize: 500 
    };

    return await this.obtenerComisiones(comisionFilters);
  },
  async obtenerEstadoCalculoPorRango(
    filtros: FiltrosEstadoCalculo
  ): Promise<EstadoCalculoComision[]> {
    const response = await api.get(`${BASE_URL}/estado-calculo`, {
      params: filtros
    });
    return response.data;
  },

  async obtenerCalendarioComisiones(
    filtros: FiltrosCalendario
  ): Promise<CalendarioComisiones[]> {
    const response = await api.get(`${BASE_URL}/calendario`, {
      params: {
        año: filtros.año,  
        mes: filtros.mes 
      }
    });
    return response.data;
  },

  async obtenerDatosMaestros(): Promise<DatosMaestrosComisiones> {
    const response = await api.get(`${BASE_URL}/datos-maestros`);
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

  async obtenerRangoFechas(): Promise<{ fechaMinima: string; fechaMaxima: string }> {
    const response = await api.get(`${BASE_URL}/rango-fechas`);
    return response.data;
  },

  async eliminarComisionesDia(
    fecha: string,
    sucursalNombre: string,
    turno: string
  ): Promise<boolean> {
    const response = await api.delete(`${BASE_URL}`, {
      params: { fecha, sucursalNombre, turno }
    });
    return response.data;
  },

  async obtenerEstadisticas(filtros: Partial<ComisionVendedoraFilters>): Promise<ComisionesStats> {
    const response = await api.get(`${BASE_URL}/estadisticas`, { params: filtros });
    return response.data;
  }
};

export const comisionHelpers = {
  formatearFechaParaApi(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  },

  formatearFechaParaMostrar(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  obtenerPrimerDiaMesAnterior(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  },

  obtenerUltimoDiaMesAnterior(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  },

  convertirFiltrosParaApi(filtros: any): ComisionVendedoraFilters {
    return {
      fechaInicio: filtros.fechaInicio ? this.formatearFechaParaApi(filtros.fechaInicio) : undefined,
      fechaFin: filtros.fechaFin ? this.formatearFechaParaApi(filtros.fechaFin) : undefined,
      sucursalNombre: filtros.sucursalNombre || undefined,
      vendedorNombre: filtros.vendedorNombre || undefined,
      turno: filtros.turno || undefined,
      montoComisionMinimo: filtros.montoComisionMinimo || undefined,
      montoComisionMaximo: filtros.montoComisionMaximo || undefined,
      excluirDomingos: filtros.excluirDomingos ?? true,
      orderBy: filtros.orderBy || 'fecha',
      orderDesc: filtros.orderDesc ?? true,
      page: filtros.page || 1,
      pageSize: filtros.pageSize || 50
    };
  },

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(monto);
  }
};