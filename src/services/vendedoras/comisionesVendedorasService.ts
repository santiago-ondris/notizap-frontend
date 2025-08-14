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
  ComisionesStats
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
  // ============================================
  // CÁLCULO Y RECÁLCULO DE COMISIONES
  // ============================================

  /**
   * Obtiene las vendedoras disponibles para trabajar en un turno específico
   */
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

  /**
   * Calcula las comisiones para un día específico
   */
  async calcularComisiones(request: CalcularComisionRequest): Promise<CalcularComisionResponse> {
    const response = await api.post(`${BASE_URL}/calcular`, request);
    return response.data;
  },

  /**
   * Recalcula las comisiones de un día específico (sobrescribe las existentes)
   */
  async recalcularComisiones(request: CalcularComisionRequest): Promise<CalcularComisionResponse> {
    const response = await api.put(`${BASE_URL}/recalcular`, request);
    return response.data;
  },

  /**
   * Verifica si existen comisiones calculadas para un día específico
   */
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

  // ============================================
  // CONSULTA DE COMISIONES
  // ============================================

  /**
   * Obtiene las comisiones con filtros y paginación
   */
  async obtenerComisiones(filtros: ComisionVendedoraFilters): Promise<ComisionesResponse> {
    const response = await api.get(`${BASE_URL}`, { params: filtros });
    return response.data;
  },

  /**
   * Obtiene el resumen de comisiones de una vendedora específica
   */
  async obtenerResumenVendedora(filtros: FiltrosVendedora): Promise<ResumenComisionVendedora> {
    const { vendedorNombre, fechaInicio, fechaFin } = filtros;
    const response = await api.get(`${BASE_URL}/vendedora/${vendedorNombre}`, {
      params: { fechaInicio, fechaFin }
    });
    return response.data;
  },

  /**
   * Obtiene las comisiones filtradas por sucursal y turno
   */
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
      pageSize: 500 // Obtener muchos para mostrar resumen completo
    };

    return await this.obtenerComisiones(comisionFilters);
  },

  // ============================================
  // ESTADO Y CALENDARIO
  // ============================================

  /**
   * Obtiene el estado de cálculo de comisiones para un rango de fechas
   */
  async obtenerEstadoCalculoPorRango(
    filtros: FiltrosEstadoCalculo
  ): Promise<EstadoCalculoComision[]> {
    const response = await api.get(`${BASE_URL}/estado-calculo`, {
      params: filtros
    });
    return response.data;
  },

  /**
   * Obtiene el calendario de comisiones para un mes específico
   */
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

  // ============================================
  // DATOS MAESTROS
  // ============================================

  /**
   * Obtiene los datos maestros (sucursales, vendedores, rango de fechas)
   */
  async obtenerDatosMaestros(): Promise<DatosMaestrosComisiones> {
    const response = await api.get(`${BASE_URL}/datos-maestros`);
    return response.data;
  },

  /**
   * Obtiene las sucursales que tienen datos de ventas
   */
  async obtenerSucursales(): Promise<string[]> {
    const response = await api.get(`${BASE_URL}/sucursales`);
    return response.data;
  },

  /**
   * Obtiene los vendedores que tienen datos de ventas o comisiones
   */
  async obtenerVendedores(): Promise<string[]> {
    const response = await api.get(`${BASE_URL}/vendedores`);
    return response.data;
  },

  /**
   * Obtiene el rango de fechas disponible para comisiones
   */
  async obtenerRangoFechas(): Promise<{ fechaMinima: string; fechaMaxima: string }> {
    const response = await api.get(`${BASE_URL}/rango-fechas`);
    return response.data;
  },

  // ============================================
  // GESTIÓN
  // ============================================

  /**
   * Elimina las comisiones de un día específico
   */
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

  // ============================================
  // ESTADÍSTICAS (OPCIONAL - NO REQUERIDAS INICIALMENTE)
  // ============================================

  /**
   * Obtiene estadísticas generales de comisiones
   */
  async obtenerEstadisticas(filtros: Partial<ComisionVendedoraFilters>): Promise<ComisionesStats> {
    const response = await api.get(`${BASE_URL}/estadisticas`, { params: filtros });
    return response.data;
  }
};

// ============================================
// HELPERS PARA MANEJO DE FECHAS Y FILTROS
// ============================================

export const comisionHelpers = {
  /**
   * Formatea fecha para envío a la API (YYYY-MM-DD)
   */
  formatearFechaParaApi(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  },

  /**
   * Formatea fecha desde la API para mostrar (DD/MM/YYYY)
   */
  formatearFechaParaMostrar(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Obtiene el primer día del mes anterior
   */
  obtenerPrimerDiaMesAnterior(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  },

  /**
   * Obtiene el último día del mes anterior
   */
  obtenerUltimoDiaMesAnterior(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  },

  /**
   * Convierte filtros del formulario a filtros de API
   */
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

  /**
   * Formatea moneda para mostrar
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(monto);
  }
};