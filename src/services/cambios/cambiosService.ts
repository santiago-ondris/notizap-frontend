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
import { formatearFechaCambios } from '@/utils/fechaHelpers';


class CambiosService {
  private readonly baseUrl = '/api/v1/cambio';

  async obtenerTodos(): Promise<CambioSimpleDto[]> {
    try {     
      const response = await api.get<CambioSimpleDto[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('❌ [CambiosService] Error al obtener cambios:', error);
      throw new Error('Error al cargar la lista de cambios');
    }
  }

  async obtenerPorMes(mes: number, año: number): Promise<CambioSimpleDto[]> {
    try {
      const fechaDesde = new Date(año, mes - 1, 1);
      const fechaHasta = new Date(año, mes, 0);
  
      const filtros: CambiosFiltros = {
        fechaDesde: fechaDesde.toISOString().split('T')[0],
        fechaHasta: fechaHasta.toISOString().split('T')[0],
        mes,
        año
      };
    
      const todosCambios = await this.obtenerTodos();
      
      const cambiosFiltrados = this.filtrarCambios(todosCambios, filtros);
      
      return cambiosFiltrados;
    } catch (error) {
      console.error('❌ [obtenerPorMes] Error:', error);
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
        console.error('❌ [crear] Error del backend:', {
          status: error.response.status,
          data: error.response.data
        });
      } else {
        console.error('❌ [crear] Error de red:', error);
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
      const fechaCambioSoloFecha = new Date(Date.UTC(
        fechaCambio.getUTCFullYear(),
        fechaCambio.getUTCMonth(),
        fechaCambio.getUTCDate()
      ));
  
      if (filtros.mes && filtros.año) {
        const mesCambio = fechaCambio.getUTCMonth() + 1;
        const añoCambio = fechaCambio.getUTCFullYear();
        
        if (añoCambio !== filtros.año || mesCambio !== filtros.mes) {
          return false;
        }
      }
  
      if (filtros.fechaDesde) {
        const fechaDesde = new Date(filtros.fechaDesde + 'T00:00:00Z'); // Forzar UTC
        
        if (fechaCambioSoloFecha < fechaDesde) {
          return false;
        }
      }
  
      if (filtros.fechaHasta) {
        const fechaHasta = new Date(filtros.fechaHasta + 'T23:59:59Z'); // Forzar UTC y fin del día
        
        if (fechaCambioSoloFecha > fechaHasta) {
          return false;
        }
      }
  
      if (filtros.pedido) {
        if (!cambio.pedido.toLowerCase().includes(filtros.pedido.toLowerCase())) {
          return false;
        }
      }
  
      if (filtros.celular) {
        if (!cambio.celular.toLowerCase().includes(filtros.celular.toLowerCase())) {
          return false;
        }
      }
  
      if (filtros.nombre) {
        const nombreCompleto = `${cambio.nombre} ${cambio.apellido || ''}`.toLowerCase();
        if (!nombreCompleto.includes(filtros.nombre.toLowerCase())) {
          return false;
        }
      }
  
      if (filtros.motivo && filtros.motivo !== 'todos_motivos') {
        if (cambio.motivo !== filtros.motivo) {
          return false;
        }
      }
  
      if (filtros.estado && filtros.estado !== 'todos') {
        const estadoCambio = this.determinarEstado(cambio);
        if (estadoCambio !== filtros.estado) {
          return false;
        }
      }
  
      if (filtros.envio) {
        if (!cambio.envio || !cambio.envio.toLowerCase().includes(filtros.envio.toLowerCase())) {
          return false;
        }
      }
  
      return true;
    });
  }

  private determinarEstado(cambio: CambioSimpleDto): EstadoCambioFiltro {
    if (!cambio.llegoAlDeposito) return 'pendiente_llegada';
    if (cambio.llegoAlDeposito && !cambio.yaEnviado) return 'listo_envio';
    if (cambio.yaEnviado && !cambio.cambioRegistradoSistema) return 'enviado';
    if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) return 'completado';
    return 'sin_registrar';
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