import api from '@/api/api';
import { 
  type CambioSimpleDto, 
  type CreateCambioSimpleDto, 
  type CambiosFiltros,
  type CambiosEstadisticasData,
  type EstadosCambio,
  type EstadoCambioFiltro,
} from '@/types/cambios/cambiosTypes';

/**
 * Servicio para gestión de cambios
 */
class CambiosService {
  private readonly baseUrl = '/api/v1/cambio';

  /**
   * Obtener todos los cambios
   */
  async obtenerTodos(): Promise<CambioSimpleDto[]> {
    try {
      const response = await api.get<CambioSimpleDto[]>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cambios:', error);
      throw new Error('Error al cargar la lista de cambios');
    }
  }

  /**
   * Obtener un cambio por ID
   */
  async obtenerPorId(id: number): Promise<CambioSimpleDto> {
    try {
      const response = await api.get<CambioSimpleDto>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cambio por ID:', error);
      throw new Error('Error al cargar el cambio solicitado');
    }
  }

  /**
   * Crear un nuevo cambio
   */
  async crear(cambio: CreateCambioSimpleDto): Promise<number> {
    try {
      this.validarCambio(cambio);
      const response = await api.post<number>(this.baseUrl, cambio);
      return response.data;
    } catch (error: any) {
      // Si viene de Axios, mostramos cuerpo y status
      if (error.response) {
        console.error(
          'Error al crear cambio:',
          error.response.status,
          error.response.data
        );
      } else {
        console.error('Error al crear cambio:', error);
      }
      throw error;  // o throw new Error(error.response?.data?.message || error.message)
    }
  }

  /**
   * Actualizar un cambio existente
   */
  async actualizar(id: number, cambio: CambioSimpleDto): Promise<void> {
    try {
      // Validar antes de enviar
      this.validarCambio(cambio);
      
      await api.put(`${this.baseUrl}/${id}`, cambio);
    } catch (error) {
      console.error('Error al actualizar cambio:', error);
      throw new Error('Error al actualizar el cambio');
    }
  }

  /**
   * Eliminar un cambio
   */
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
        envio: envio.trim() // Limpiamos espacios en blanco
      };
  
      await this.actualizarSinValidacionCompleta(id, cambioActualizado);
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      throw new Error('Error al actualizar el envío del cambio');
    }
  }

  /**
   * Actualizar solo los estados de un cambio (para checkboxes inline)
   */
  async actualizarEstados(id: number, estados: EstadosCambio): Promise<void> {
    try {
      // Primero obtenemos el cambio completo
      const cambioCompleto = await this.obtenerPorId(id);
      
      // Actualizamos solo los estados
      const cambioActualizado: CambioSimpleDto = {
        ...cambioCompleto,
        llegoAlDeposito: estados.llegoAlDeposito,
        yaEnviado: estados.yaEnviado,
        cambioRegistradoSistema: estados.cambioRegistradoSistema,
        parPedido: estados.parPedido
      };

      // Para actualización de estados, usamos una validación más permisiva
      await this.actualizarSinValidacionCompleta(id, cambioActualizado);
    } catch (error) {
      console.error('Error al actualizar estados:', error);
      throw new Error('Error al actualizar el estado del cambio');
    }
  }

  /**
   * Actualizar un cambio sin validación completa (solo para estados)
   */
  private async actualizarSinValidacionCompleta(id: number, cambio: CambioSimpleDto): Promise<void> {
    try {
      await api.put(`${this.baseUrl}/${id}`, cambio);
    } catch (error) {
      console.error('Error al actualizar cambio:', error);
      throw new Error('Error al actualizar el cambio');
    }
  }

  /**
   * Filtrar cambios según criterios
   */
  filtrarCambios(cambios: CambioSimpleDto[], filtros: CambiosFiltros): CambioSimpleDto[] {
    return cambios.filter(cambio => {
      // Filtro por fecha
      if (filtros.fechaDesde) {
        const fechaCambio = new Date(cambio.fecha);
        const fechaDesde = new Date(filtros.fechaDesde);
        if (fechaCambio < fechaDesde) return false;
      }

      if (filtros.fechaHasta) {
        const fechaCambio = new Date(cambio.fecha);
        const fechaHasta = new Date(filtros.fechaHasta);
        if (fechaCambio > fechaHasta) return false;
      }

      // Filtro por pedido
      if (filtros.pedido && !cambio.pedido.toLowerCase().includes(filtros.pedido.toLowerCase())) {
        return false;
      }

      // Filtro por celular
      if (filtros.celular && !cambio.celular.includes(filtros.celular)) {
        return false;
      }

      // Filtro por nombre
      if (filtros.nombre) {
        const nombreCompleto = `${cambio.nombre} ${cambio.apellido || ''}`.toLowerCase();
        if (!nombreCompleto.includes(filtros.nombre.toLowerCase())) {
          return false;
        }
      }

      // Filtro por motivo
      if (filtros.motivo && cambio.motivo !== filtros.motivo) {
        return false;
      }

      // Filtro por estado
      if (filtros.estado && filtros.estado !== 'todos') {
        return this.cumpleEstado(cambio, filtros.estado);
      }

      return true;
    });
  }

  /**
   * Verificar si un cambio cumple con un estado específico
   */
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

  /**
   * Calcular estadísticas de cambios
   */
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
      // Contadores de estado
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

      // Sumar diferencias monetarias
      if (cambio.diferenciaAbonada) {
        stats.diferenciaAbonada += cambio.diferenciaAbonada;
      }

      if (cambio.diferenciaAFavor) {
        stats.diferenciaAFavor += cambio.diferenciaAFavor;
      }
    });

    // Calcular diferencia neta
    stats.diferencianNeta = stats.diferenciaAbonada - stats.diferenciaAFavor;

    return stats;
  }

  /**
   * Obtener cambios listos para OCA (llegoAlDeposito = true, yaEnviado = false)
   */
  obtenerListosParaOCA(cambios: CambioSimpleDto[]): CambioSimpleDto[] {
    return cambios.filter(cambio => 
      cambio.llegoAlDeposito && !cambio.yaEnviado
    );
  }

  /**
   * Validar datos de un cambio antes del envío
   */
  validarCambio(cambio: CreateCambioSimpleDto | CambioSimpleDto): void {
    const errores: string[] = [];

    // Validaciones básicas
    if (!cambio.pedido?.trim()) errores.push('El número de pedido es obligatorio');
    if (!cambio.celular?.trim()) errores.push('El celular es obligatorio');
    if (!cambio.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!cambio.modeloOriginal?.trim()) errores.push('El modelo original es obligatorio');
    if (!cambio.modeloCambio?.trim()) errores.push('El modelo de cambio es obligatorio');
    if (!cambio.motivo?.trim()) errores.push('El motivo es obligatorio');

    // Validar diferencias (mutuamente excluyentes)
    if (cambio.diferenciaAbonada && cambio.diferenciaAFavor) {
      errores.push('No puede haber diferencia abonada y a favor al mismo tiempo');
    }

    if (cambio.diferenciaAbonada && cambio.diferenciaAbonada < 0) {
      errores.push('La diferencia abonada no puede ser negativa');
    }

    if (cambio.diferenciaAFavor && cambio.diferenciaAFavor < 0) {
      errores.push('La diferencia a favor no puede ser negativa');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cambio.email && !emailRegex.test(cambio.email)) {
      errores.push('El formato del email no es válido');
    }

    // Validar fechas
    if (!cambio.fecha) errores.push('La fecha es obligatoria');

    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }
  }

  /**
   * Formatear fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '--/--/----';
      
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const año = date.getFullYear();
      
      return `${dia}/${mes}/${año}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '--/--/----';
    }
  }

  /**
   * Formatear dinero para mostrar
   */
  formatearDinero(cantidad: number | undefined): string {
    if (!cantidad || cantidad === 0) return '-';
    return `$${cantidad.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  }

  /**
   * Obtener color del estado
   */
  obtenerColorEstado(cambio: CambioSimpleDto): string {
    if (!cambio.llegoAlDeposito) return '#FFD700'; // Pendiente llegada
    if (cambio.llegoAlDeposito && !cambio.yaEnviado) return '#B695BF'; // Listo envío
    if (cambio.yaEnviado && !cambio.cambioRegistradoSistema) return '#51590E'; // Enviado
    if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) return '#51590E'; // Completado
    return '#D94854'; // Error o estado indefinido
  }

  /**
   * Obtener descripción del estado
   */
  obtenerDescripcionEstado(cambio: CambioSimpleDto): string {
    if (!cambio.llegoAlDeposito) return 'Pendiente llegada';
    if (cambio.llegoAlDeposito && !cambio.yaEnviado) return 'Listo para envío';
    if (cambio.yaEnviado && !cambio.cambioRegistradoSistema) return 'Enviado';
    if (cambio.llegoAlDeposito && cambio.yaEnviado && cambio.cambioRegistradoSistema) return 'Completado';
    return 'Estado indefinido';
  }
}

// Exportar instancia única del servicio
const cambiosService = new CambiosService();
export default cambiosService;