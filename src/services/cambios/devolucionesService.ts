import api from '@/api/api';
import {
  type DevolucionDto,
  type CreateDevolucionDto,
  type EstadosDevolucion,
  type DevolucionesFiltros,
  type DevolucionesEstadisticasData,
  type EstadoDevolucionFiltro,
  type DevolucionesPaginadasResponse,
  type DevolucionesQueryParams,
  MOTIVOS_DEVOLUCION,
  LABELS_ESTADO_DEVOLUCION,
  COLORES_ESTADO_DEVOLUCION,
  ICONOS_ESTADO_DEVOLUCION
} from '@/types/cambios/devolucionesTypes';

class DevolucionesService {
  async obtenerTodos(): Promise<DevolucionDto[]> {
    try {
      const response = await api.get('/api/v1/Devolucion');
      return response.data;
    } catch (error) {
      console.error('Error al obtener devoluciones:', error);
      throw new Error('No se pudieron cargar las devoluciones');
    }
  }

  async obtenerPaginadas(params: DevolucionesQueryParams): Promise<DevolucionesPaginadasResponse> {
    try {
      const response = await api.get('/api/v1/Devolucion/paginadas', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener devoluciones paginadas:', error);
      throw new Error('No se pudieron cargar las devoluciones');
    }
  }

  async obtenerPorId(id: number): Promise<DevolucionDto> {
    try {
      const response = await api.get(`/api/v1/Devolucion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener devolución ${id}:`, error);
      throw new Error('No se pudo encontrar la devolución');
    }
  }

  async crear(devolucion: CreateDevolucionDto): Promise<number> {
    try {
      this.validarDevolucion(devolucion);
      
      const response = await api.post('/api/v1/Devolucion', devolucion);
      return response.data; 
    } catch (error) {
      console.error('Error al crear devolución:', error);
      throw new Error('No se pudo crear la devolución');
    }
  }

  async actualizar(id: number, devolucion: DevolucionDto): Promise<void> {
    try {
      this.validarDevolucion(devolucion);
      
      await api.put(`/api/v1/Devolucion/${id}`, devolucion);
    } catch (error) {
      console.error(`Error al actualizar devolución ${id}:`, error);
      throw new Error('No se pudo actualizar la devolución');
    }
  }

  async actualizarEstados(id: number, estados: EstadosDevolucion): Promise<void> {
    try {
      const devolucionActual = await this.obtenerPorId(id);
      
      const devolucionActualizada: DevolucionDto = {
        ...devolucionActual,
        ...estados
      };
      
      await this.actualizar(id, devolucionActualizada);
    } catch (error) {
      console.error(`Error al actualizar estados de devolución ${id}:`, error);
      throw new Error('No se pudieron actualizar los estados');
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await api.delete(`/api/v1/Devolucion/${id}`);
    } catch (error) {
      console.error(`Error al eliminar devolución ${id}:`, error);
      throw new Error('No se pudo eliminar la devolución');
    }
  }

  filtrarDevoluciones(devoluciones: DevolucionDto[], filtros: DevolucionesFiltros): DevolucionDto[] {
    return devoluciones.filter(devolucion => {
      if (filtros.pedido && !devolucion.pedido.toLowerCase().includes(filtros.pedido.toLowerCase())) {
        return false;
      }

      if (filtros.celular && !devolucion.celular.includes(filtros.celular)) {
        return false;
      }

      if (filtros.modelo && !devolucion.modelo.toLowerCase().includes(filtros.modelo.toLowerCase())) {
        return false;
      }

      if (filtros.responsable && !devolucion.responsable.toLowerCase().includes(filtros.responsable.toLowerCase())) {
        return false;
      }

      if (filtros.motivo && devolucion.motivo !== filtros.motivo) {
        return false;
      }

      if (filtros.estado && filtros.estado !== 'todos') {
        const estadoDevolucion = this.obtenerEstadoDevolucion(devolucion);
        if (estadoDevolucion !== filtros.estado) {
          return false;
        }
      }

      if (filtros.fechaDesde) {
        const fechaDevolucion = new Date(devolucion.fecha);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaDevolucion < fechaDesde) {
          return false;
        }
      }

      if (filtros.fechaHasta) {
        const fechaDevolucion = new Date(devolucion.fecha);
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999);
        if (fechaDevolucion > fechaHasta) {
          return false;
        }
      }

      if (filtros.montoMinimo && devolucion.monto && devolucion.monto < filtros.montoMinimo) {
        return false;
      }

      if (filtros.montoMaximo && devolucion.monto && devolucion.monto > filtros.montoMaximo) {
        return false;
      }

      return true;
    });
  }

  obtenerEstadoDevolucion(devolucion: DevolucionDto): EstadoDevolucionFiltro {
    const { llegoAlDeposito, dineroDevuelto, notaCreditoEmitida } = devolucion;

    if (llegoAlDeposito && dineroDevuelto && notaCreditoEmitida) {
      return 'completado';
    }

    if (llegoAlDeposito && dineroDevuelto && !notaCreditoEmitida) {
      return 'dinero_devuelto';
    }

    if (llegoAlDeposito && !dineroDevuelto && notaCreditoEmitida) {
      return 'nota_emitida';
    }

    if (llegoAlDeposito && !dineroDevuelto && !notaCreditoEmitida) {
      return 'llegado_sin_procesar';
    }

    if (!llegoAlDeposito) {
      return 'pendiente_llegada';
    }

    return 'sin_llegar';
  }

  obtenerColorEstado(devolucion: DevolucionDto): string {
    const estado = this.obtenerEstadoDevolucion(devolucion);
    return COLORES_ESTADO_DEVOLUCION[estado];
  }

  obtenerDescripcionEstado(devolucion: DevolucionDto): string {
    const estado = this.obtenerEstadoDevolucion(devolucion);
    return LABELS_ESTADO_DEVOLUCION[estado];
  }

  obtenerIconoEstado(devolucion: DevolucionDto): string {
    const estado = this.obtenerEstadoDevolucion(devolucion);
    return ICONOS_ESTADO_DEVOLUCION[estado];
  }

  calcularEstadisticas(devoluciones: DevolucionDto[]): DevolucionesEstadisticasData {
    const total = devoluciones.length;
    
    let pendientesLlegada = 0;
    let llegadosSinProcesar = 0;
    let completados = 0;
    let dineroDevuelto = 0;
    let notasEmitidas = 0;
    let sinProcesar = 0;

    let montoTotalDevoluciones = 0;
    let montoTotalPagosEnvio = 0;
    let contadorMontos = 0;

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    let devolucionesMesActual = 0;

    devoluciones.forEach(devolucion => {
      const estado = this.obtenerEstadoDevolucion(devolucion);
      
      switch (estado) {
        case 'pendiente_llegada':
        case 'sin_llegar':
          pendientesLlegada++;
          break;
        case 'llegado_sin_procesar':
          llegadosSinProcesar++;
          break;
        case 'completado':
          completados++;
          break;
        case 'dinero_devuelto':
          dineroDevuelto++;
          break;
        case 'nota_emitida':
          notasEmitidas++;
          break;
      }

      if (!devolucion.llegoAlDeposito || (!devolucion.dineroDevuelto && !devolucion.notaCreditoEmitida)) {
        sinProcesar++;
      }

      if (devolucion.monto) {
        montoTotalDevoluciones += devolucion.monto;
        contadorMontos++;
      }
      if (devolucion.pagoEnvio) {
        montoTotalPagosEnvio += devolucion.pagoEnvio;
      }

      const fechaDevolucion = new Date(devolucion.fecha);
      if (fechaDevolucion.getMonth() === mesActual && fechaDevolucion.getFullYear() === añoActual) {
        devolucionesMesActual++;
      }
    });

    const montoPromedioDevolucion = contadorMontos > 0 ? montoTotalDevoluciones / contadorMontos : 0;
    const porcentajeCompletadas = total > 0 ? (completados / total) * 100 : 0;

    return {
      totalDevoluciones: total,
      pendientesLlegada,
      llegadosSinProcesar,
      completados,
      dineroDevuelto,
      notasEmitidas,
      sinProcesar,
      montoTotalDevoluciones,
      montoTotalPagosEnvio,
      montoPromedioDevolucion,
      devolucionesMesActual,
      porcentajeCompletadas
    };
  }

  private validarDevolucion(devolucion: CreateDevolucionDto | DevolucionDto): void {
    if (!devolucion.fecha) {
      throw new Error('La fecha es obligatoria');
    }

    if (!devolucion.pedido?.trim()) {
      throw new Error('El número de pedido es obligatorio');
    }

    if (!devolucion.celular?.trim()) {
      throw new Error('El celular es obligatorio');
    }

    if (!devolucion.modelo?.trim()) {
      throw new Error('El modelo es obligatorio');
    }

    if (!devolucion.motivo?.trim()) {
      throw new Error('El motivo es obligatorio');
    }

    if (!devolucion.responsable?.trim()) {
      throw new Error('El responsable es obligatorio');
    }

    // Validar montos si están presentes
    if (devolucion.monto !== undefined && devolucion.monto < 0) {
      throw new Error('El monto no puede ser negativo');
    }

    if (devolucion.pagoEnvio !== undefined && devolucion.pagoEnvio < 0) {
      throw new Error('El pago de envío no puede ser negativo');
    }
  }

  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-AR');
    } catch (error) {
      return fecha;
    }
  }

  formatearDinero(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(monto);
  }

  obtenerMotivos(): readonly string[] {
    return MOTIVOS_DEVOLUCION;
  }

  estaCompleta(devolucion: DevolucionDto): boolean {
    return devolucion.llegoAlDeposito && 
           devolucion.dineroDevuelto && 
           devolucion.notaCreditoEmitida;
  }

  obtenerPrioridad(devolucion: DevolucionDto): number {
    if (!devolucion.llegoAlDeposito) return 1;
    if (devolucion.llegoAlDeposito && !devolucion.dineroDevuelto && !devolucion.notaCreditoEmitida) return 2;
    if (this.estaCompleta(devolucion)) return 4; 
    return 3; 
  }
}

const devolucionesService = new DevolucionesService();
export default devolucionesService;