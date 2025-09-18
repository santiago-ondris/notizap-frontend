import api from '@/api/api';
import { 
  type CambioSimpleDto, 
  type CreateCambioSimpleDto, 
  type CambiosFiltros,
  type CambiosEstadisticasData,
  type EstadosCambio,
  type EstadoCambioFiltro,
  MesesUtils
} from '@/types/cambios/cambiosTypes';
import { formatearFechaCambios } from '@/utils/envios/fechaHelpers';


class CambiosService {
  private readonly baseUrl = '/api/v1/cambio';

  async obtenerTodos(): Promise<CambioSimpleDto[]> {
    try {
      const response = await api.get<CambioSimpleDto[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cambios:', error);
      throw new Error('Error al cargar la lista de cambios');
    }
  }

  async obtenerPorMes(mes: number, año: number): Promise<CambioSimpleDto[]> {
    try {
      const fechaDesde = new Date(año, mes - 1, 1);
      const fechaHasta = new Date(año, mes, 0); // Último día del mes

      const filtros: CambiosFiltros = {
        fechaDesde: fechaDesde.toISOString().split('T')[0],
        fechaHasta: fechaHasta.toISOString().split('T')[0],
        mes,
        año
      };

      console.log(`🗓️ Obteniendo cambios para ${MesesUtils.formatearMes(mes, año)}:`, filtros);

      const todosCambios = await this.obtenerTodos();
      return this.filtrarCambios(todosCambios, filtros);
    } catch (error) {
      console.error('Error al obtener cambios por mes:', error);
      throw new Error(`Error al cargar cambios de ${MesesUtils.formatearMes(mes, año)}`);
    }
  }

  async obtenerPorId(id: number): Promise<CambioSimpleDto> {
    try {
      const response = await api.get<CambioSimpleDto>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cambio por ID:', error);
      throw new Error('Error al cargar el cambio solicitado');
    }
  }

  async crear(cambio: CreateCambioSimpleDto): Promise<number> {
    try {
      this.validarCambio(cambio);
      const response = await api.post<number>(this.baseUrl, cambio);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error(
          'Error al crear cambio:',
          error.response.status,
          error.response.data
        );
      } else {
        console.error('Error al crear cambio:', error);
      }
      throw error;
    }
  }

  async actualizar(id: number, cambio: CambioSimpleDto): Promise<void> {
    try {
      this.validarCambio(cambio);
      
      await api.put(`${this.baseUrl}/${id}`, cambio);
    } catch (error) {
      console.error('Error al actualizar cambio:', error);
      throw new Error('Error al actualizar el cambio');
    }
  }

  async actualizarEtiqueta(id: number, etiqueta: string, etiquetaDespachada: boolean): Promise<void> {
    try {
      const dto = {
        etiqueta: etiqueta.trim(),
        etiquetaDespachada
      };

      await api.put(`${this.baseUrl}/${id}/etiqueta`, dto);
    } catch (error) {
      console.error('Error al actualizar etiqueta:', error);
      throw new Error('Error al actualizar la etiqueta del cambio');
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error al eliminar cambio:', error);
      throw new Error('Error al eliminar el cambio');
    }
  }

  async actualizarEnvio(id: number, envio: string): Promise<void> {
    try {
      const cambioCompleto = await this.obtenerPorId(id);
      
      const cambioActualizado: CambioSimpleDto = {
        ...cambioCompleto,
        envio: envio.trim()
      };
  
      await this.actualizarSinValidacionCompleta(id, cambioActualizado);
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      throw new Error('Error al actualizar el envío del cambio');
    }
  }

  async actualizarEstados(id: number, estados: EstadosCambio): Promise<void> {
    try {
      const cambioCompleto = await this.obtenerPorId(id);
      
      const cambioActualizado: CambioSimpleDto = {
        ...cambioCompleto,
        llegoAlDeposito: estados.llegoAlDeposito,
        yaEnviado: estados.yaEnviado,
        cambioRegistradoSistema: estados.cambioRegistradoSistema,
        parPedido: estados.parPedido
      };

      await this.actualizarSinValidacionCompleta(id, cambioActualizado);
    } catch (error) {
      console.error('Error al actualizar estados:', error);
      throw new Error('Error al actualizar el estado del cambio');
    }
  }

  private async actualizarSinValidacionCompleta(id: number, cambio: CambioSimpleDto): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/${id}`, cambio);
    } catch (error) {
      console.error('Error al actualizar cambio:', error);
      throw new Error('Error al actualizar el cambio');
    }
  }

  filtrarCambios(cambios: CambioSimpleDto[], filtros: CambiosFiltros): CambioSimpleDto[] {
    return cambios.filter(cambio => {
      const fechaCambio = new Date(cambio.fecha);

      if (filtros.mes && filtros.año) {
        if (fechaCambio.getFullYear() !== filtros.año || 
            fechaCambio.getMonth() + 1 !== filtros.mes) {
          return false;
        }
      }

      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaCambio < fechaDesde) return false;
      }

      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta);
        fechaHasta.setHours(23, 59, 59, 999); 
        if (fechaCambio > fechaHasta) return false;
      }

      if (filtros.pedido && !cambio.pedido.toLowerCase().includes(filtros.pedido.toLowerCase())) {
        return false;
      }

      if (filtros.celular && !cambio.celular.includes(filtros.celular)) {
        return false;
      }

      if (filtros.nombre) {
        const nombreCompleto = `${cambio.nombre} ${cambio.apellido || ''}`.toLowerCase();
        if (!nombreCompleto.includes(filtros.nombre.toLowerCase())) {
          return false;
        }
      }

      if (filtros.motivo && cambio.motivo !== filtros.motivo) {
        return false;
      }

      if (filtros.estado && filtros.estado !== 'todos') {
        return this.cumpleEstado(cambio, filtros.estado);
      }

      return true;
    });
  }

  private cumpleEstado(cambio: CambioSimpleDto, estado: EstadoCambioFiltro): boolean {
    switch (estado) {
      case 'pendiente_llegada':
        return !cambio.llegoAlDeposito;
      case 'listo_envio':
        return cambio.llegoAlDeposito && !cambio.yaEnviado;
      case 'enviado':
        return cambio.yaEnviado;
      case 'completado':
        return cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema;
      case 'sin_registrar':
        return !cambio.cambioRegistradoSistema;
      default:
        return true;
    }
  }

  calcularEstadisticas(cambios: CambioSimpleDto[]): CambiosEstadisticasData {
    const stats: CambiosEstadisticasData = {
      totalCambios: cambios.length,
      pendientesLlegada: 0,
      listosParaEnvio: 0,
      enviados: 0,
      completados: 0,
      sinRegistrar: 0,
      diferenciaAbonada: 0,
      diferenciaAFavor: 0,
      diferencianNeta: 0
    };

    cambios.forEach(cambio => {
      if (!cambio.llegoAlDeposito) {
        stats.pendientesLlegada++;
      } else if (cambio.llegoAlDeposito && !cambio.yaEnviado) {
        stats.listosParaEnvio++;
      }

      if (cambio.yaEnviado) {
        stats.enviados++;
      }

      if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) {
        stats.completados++;
      }

      if (!cambio.cambioRegistradoSistema) {
        stats.sinRegistrar++;
      }

      if (cambio.diferenciaAbonada) {
        stats.diferenciaAbonada += cambio.diferenciaAbonada;
      }

      if (cambio.diferenciaAFavor) {
        stats.diferenciaAFavor += cambio.diferenciaAFavor;
      }
    });

    stats.diferencianNeta = stats.diferenciaAbonada - stats.diferenciaAFavor;

    return stats;
  }

  obtenerListosParaOCA(cambios: CambioSimpleDto[]): CambioSimpleDto[] {
    return cambios.filter(cambio => 
      cambio.llegoAlDeposito && !cambio.yaEnviado
    );
  }

  validarCambio(cambio: CreateCambioSimpleDto | CambioSimpleDto): void {
    const errores: string[] = [];

    if (!cambio.pedido?.trim()) errores.push('El número de pedido es obligatorio');
    if (!cambio.celular?.trim()) errores.push('El celular es obligatorio');
    if (!cambio.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!cambio.modeloOriginal?.trim()) errores.push('El modelo original es obligatorio');
    if (!cambio.modeloCambio?.trim()) errores.push('El modelo de cambio es obligatorio');
    if (!cambio.motivo?.trim()) errores.push('El motivo es obligatorio');

    if (cambio.diferenciaAbonada && cambio.diferenciaAFavor) {
      errores.push('No puede haber diferencia abonada y a favor al mismo tiempo');
    }

    if (cambio.diferenciaAbonada && cambio.diferenciaAbonada < 0) {
      errores.push('La diferencia abonada no puede ser negativa');
    }

    if (cambio.diferenciaAFavor && cambio.diferenciaAFavor < 0) {
      errores.push('La diferencia a favor no puede ser negativa');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cambio.email && !emailRegex.test(cambio.email)) {
      errores.push('El formato del email no es válido');
    }

    if (!cambio.fecha) errores.push('La fecha es obligatoria');

    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }
  }

  formatearFecha(fecha: string): string {
    return formatearFechaCambios(fecha);
  }

  formatearDinero(cantidad: number | undefined): string {
    if (!cantidad || cantidad === 0) return '-';
    return `${cantidad.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  }

  obtenerColorEstado(cambio: CambioSimpleDto): string {
    if (!cambio.llegoAlDeposito) return '#FFD700';
    if (cambio.llegoAlDeposito && !cambio.yaEnviado) return '#B695BF'; 
    if (cambio.yaEnviado && !cambio.cambioRegistradoSistema) return '#51590E'; 
    if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) return '#51590E';
    return '#D94854'; 
  }

  obtenerDescripcionEstado(cambio: CambioSimpleDto): string {
    if (!cambio.llegoAlDeposito) return 'Pendiente llegada';
    if (cambio.llegoAlDeposito && !cambio.yaEnviado) return 'Listo para envío';
    if (cambio.yaEnviado && !cambio.cambioRegistradoSistema) return 'Enviado';
    if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) return 'Completado';
    return 'Estado indefinido';
  }

  crearFiltrosDesdeMes(valorMes: string): CambiosFiltros {
    const { fechaDesde, fechaHasta } = MesesUtils.convertirMesAFiltros(valorMes);
    const [año, mes] = valorMes.split('-').map(Number);

    return {
      fechaDesde,
      fechaHasta,
      mes,
      año
    };
  }

  obtenerMesActualSelector(): string {
    const { mes, año } = MesesUtils.obtenerMesActual();
    return `${año}-${mes.toString().padStart(2, '0')}`;
  }
}

const cambiosService = new CambiosService();
export default cambiosService;