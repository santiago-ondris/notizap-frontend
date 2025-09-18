import api from '@/api/api';
import {
  type DevolucionMercadoLibreDto,
  type CreateDevolucionMercadoLibreDto,
  type UpdateDevolucionMercadoLibreDto,
  type DevolucionesMercadoLibreFiltros,
  type DevolucionesMercadoLibreEstadisticas,
  type MesDisponible,
  COLORES_NOTA_CREDITO
} from '@/types/cambios/devolucionesMercadoLibreTypes';

const BASE_URL = '/api/v1/cambios/mercadolibre/devoluciones';

class DevolucionesMercadoLibreService {
  async obtenerTodos(): Promise<DevolucionMercadoLibreDto[]> {
    const response = await api.get(BASE_URL);
    return response.data;
  }

  async obtenerPorId(id: number): Promise<DevolucionMercadoLibreDto> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  }

  async crear(devolucion: CreateDevolucionMercadoLibreDto): Promise<DevolucionMercadoLibreDto> {
    const response = await api.post(BASE_URL, devolucion);
    return response.data;
  }

  async actualizar(id: number, devolucion: UpdateDevolucionMercadoLibreDto): Promise<DevolucionMercadoLibreDto> {
    const response = await api.put(`${BASE_URL}/${id}`, devolucion);
    return response.data;
  }

  async eliminar(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }

  async actualizarNotaCredito(id: number, notaCreditoEmitida: boolean): Promise<void> {
    try {
      const response = await api.patch(
        `${BASE_URL}/${id}/nota-credito`, 
        { notaCreditoEmitida },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar nota de crédito:', error);
      throw new Error('Error al actualizar el estado de la nota de crédito');
    }
  }

  async actualizarTrasladado(id: number, trasladado: boolean): Promise<void> {
    try {
      const response = await api.patch(
        `${BASE_URL}/${id}/traslado`, 
        { trasladado },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar trasladado:', error);
      throw new Error('Error al actualizar el estado de trasladado');
    }
  }

  async obtenerFiltradas(filtros: DevolucionesMercadoLibreFiltros): Promise<DevolucionMercadoLibreDto[]> {
    const response = await api.post(`${BASE_URL}/filtrar`, filtros);
    return response.data;
  }

  filtrarDevoluciones(
    devoluciones: DevolucionMercadoLibreDto[], 
    filtros: DevolucionesMercadoLibreFiltros
  ): DevolucionMercadoLibreDto[] {
    return devoluciones.filter(devolucion => {
      const fecha = new Date(devolucion.fecha);
      
      if (filtros.año && fecha.getFullYear() !== filtros.año) {
        return false;
      }

      if (filtros.mes && fecha.getMonth() + 1 !== filtros.mes) {
        return false;
      }

      if (filtros.cliente && !devolucion.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) {
        return false;
      }

      if (filtros.modelo && !devolucion.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) {
        return false;
      }

      if (filtros.pedido && !devolucion.pedido.toLowerCase().includes(filtros.pedido.toLowerCase())) {
        return false;
      }

      if (filtros.notaCreditoEmitida !== undefined && devolucion.notaCreditoEmitida !== filtros.notaCreditoEmitida) {
        return false;
      }

      return true;
    });
  }

  async obtenerEstadisticas(): Promise<DevolucionesMercadoLibreEstadisticas> {
    const response = await api.get(`${BASE_URL}/estadisticas`);
    return response.data;
  }

  async obtenerEstadisticasFiltradas(filtros: DevolucionesMercadoLibreFiltros): Promise<DevolucionesMercadoLibreEstadisticas> {
    const response = await api.post(`${BASE_URL}/estadisticas/filtrar`, filtros);
    return response.data;
  }

  calcularEstadisticas(devoluciones: DevolucionMercadoLibreDto[]): DevolucionesMercadoLibreEstadisticas {
    const total = devoluciones.length;
    const notasEmitidas = devoluciones.filter(d => d.notaCreditoEmitida).length;
    const notasPendientes = total - notasEmitidas;

    const fechaActual = new Date();
    const devolucionesMesActual = devoluciones.filter(d => {
      const fecha = new Date(d.fecha);
      return fecha.getFullYear() === fechaActual.getFullYear() && 
             fecha.getMonth() === fechaActual.getMonth();
    }).length;

    const porcentajeNotas = total > 0 ? Math.round((notasEmitidas / total) * 100 * 10) / 10 : 0;

    const estadisticasPorMes = this.calcularEstadisticasPorMes(devoluciones);

    return {
      totalDevoluciones: total,
      notasCreditoEmitidas: notasEmitidas,
      notasCreditoPendientes: notasPendientes,
      devolucionesMesActual: devolucionesMesActual,
      porcentajeNotasEmitidas: porcentajeNotas,
      estadisticasPorMes: estadisticasPorMes
    };
  }

  async obtenerMesesDisponibles(): Promise<MesDisponible[]> {
    const response = await api.get(`${BASE_URL}/meses-disponibles`);
    return response.data;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearMesAño(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  }

  obtenerColorNotaCredito(notaCreditoEmitida: boolean): string {
    return notaCreditoEmitida ? COLORES_NOTA_CREDITO.emitida : COLORES_NOTA_CREDITO.pendiente;
  }

  obtenerTextoNotaCredito(notaCreditoEmitida: boolean): string {
    return notaCreditoEmitida ? 'Emitida' : 'Pendiente';
  }

  obtenerEmojiNotaCredito(notaCreditoEmitida: boolean): string {
    return notaCreditoEmitida ? '✅' : '⏳';
  }

  async existe(id: number): Promise<boolean> {
    try {
      await api.head(`${BASE_URL}/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  private calcularEstadisticasPorMes(devoluciones: DevolucionMercadoLibreDto[]) {
    const grupos = devoluciones.reduce((acc, devolucion) => {
      const fecha = new Date(devolucion.fecha);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      const clave = `${año}-${mes}`;

      if (!acc[clave]) {
        acc[clave] = {
          año,
          mes,
          nombreMes: fecha.toLocaleDateString('es-AR', { month: 'long' }),
          devoluciones: []
        };
      }

      acc[clave].devoluciones.push(devolucion);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grupos).map((grupo: any) => ({
      año: grupo.año,
      mes: grupo.mes,
      nombreMes: grupo.nombreMes,
      totalDevoluciones: grupo.devoluciones.length,
      notasCreditoEmitidas: grupo.devoluciones.filter((d: DevolucionMercadoLibreDto) => d.notaCreditoEmitida).length,
      notasCreditoPendientes: grupo.devoluciones.filter((d: DevolucionMercadoLibreDto) => !d.notaCreditoEmitida).length
    })).sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año;
      return b.mes - a.mes;
    });
  }
}

const devolucionesMercadoLibreService = new DevolucionesMercadoLibreService();
export default devolucionesMercadoLibreService;