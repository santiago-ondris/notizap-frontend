import api from '@/api/api';
import { 
  type EnvioDiario, 
  type CreateEnvioDiarioDto, 
  type EnvioResumenMensual,
  type EnviosFiltros,
  type EnviosFecha,
  type GuardarEnviosLoteDto,
  type ResultadoLoteDto,
  type CambioEnvio,
} from '@/types/envios/enviosTypes';

/**
 * Servicio para manejar todas las operaciones relacionadas con envíos
 * VERSIÓN CON BATCH SAVE - Sin auto-save
 */
class EnviosService {
  private readonly BASE_URL = '/api/v1/envios';

  /**
   * Obtiene todos los envíos de un mes específico
   */
  async getEnviosMensuales(filtros: EnviosFiltros): Promise<EnvioDiario[]> {
    try {
      const response = await api.get<EnvioDiario[]>(`${this.BASE_URL}/mensual`, {
        params: {
          year: filtros.year,
          month: filtros.month
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener envíos mensuales:', error);
      throw new Error('No se pudieron cargar los envíos del mes seleccionado');
    }
  }

  /**
   * Obtiene los envíos de una fecha específica
   */
  async getEnvioPorFecha(filtros: EnviosFecha): Promise<EnvioDiario | null> {
    try {
      const response = await api.get<EnvioDiario>(`${this.BASE_URL}/fecha`, {
        params: {
          fecha: filtros.fecha
        }
      });
      return response.data;
    } catch (error) {
      // Si no existe el registro para esa fecha, retornamos null
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error('Error al obtener envío por fecha:', error);
      throw new Error('No se pudo cargar el envío de la fecha seleccionada');
    }
  }

  /**
   * NUEVO: Guarda múltiples envíos en una sola operación (BATCH SAVE)
   */
  async guardarEnviosLote(cambios: Map<string, CambioEnvio>): Promise<ResultadoLoteDto> {
    try {
      // Agrupar cambios por fecha y construir DTOs completos
      const enviosPorFecha = new Map<string, CreateEnvioDiarioDto>();
      
      for (const cambio of cambios.values()) {
        const fechaKey = cambio.fecha;
        
        if (!enviosPorFecha.has(fechaKey)) {
          // Crear DTO base con todos los campos en 0
          enviosPorFecha.set(fechaKey, {
            fecha: cambio.fecha,
            oca: 0,
            andreani: 0,
            retirosSucursal: 0,
            roberto: 0,
            tino: 0,
            caddy: 0,
            mercadoLibre: 0
          });
        }
        
        // Aplicar el cambio específico
        const dto = enviosPorFecha.get(fechaKey)!;
        dto[cambio.campo] = cambio.valorNuevo ?? 0;
      }

      const enviosArray = Array.from(enviosPorFecha.values());
      
      const request: GuardarEnviosLoteDto = {
        envios: enviosArray
      };

      const response = await api.post<ResultadoLoteDto>(`${this.BASE_URL}/lote`, request);
      return response.data;
      
    } catch (error: any) {
      console.error('Error al guardar lote de envíos:', error);
      
      // Si el backend retornó un ResultadoLoteDto con errores
      if (error?.response?.data?.mensaje) {
        return error.response.data as ResultadoLoteDto;
      }
      
      // Error genérico
      throw new Error('No se pudieron guardar los cambios. Intenta guardando celda por celda para encontrar el error específico.');
    }
  }

  /**
   * FALLBACK: Guarda un envío individual (para cuando falla el lote)
   */
  async guardarEnvioIndividual(envio: CreateEnvioDiarioDto): Promise<string> {
    try {
      const envioCompleto: CreateEnvioDiarioDto = {
        fecha: envio.fecha,
        oca: envio.oca ?? 0,
        andreani: envio.andreani ?? 0,
        retirosSucursal: envio.retirosSucursal ?? 0,
        roberto: envio.roberto ?? 0,
        tino: envio.tino ?? 0,
        caddy: envio.caddy ?? 0,
        mercadoLibre: envio.mercadoLibre ?? 0
      };

      const response = await api.post<string>(this.BASE_URL, envioCompleto);
      return response.data || 'Registro guardado correctamente';
    } catch (error) {
      console.error('Error al guardar envío individual:', error);
      throw new Error('No se pudo guardar el registro de envío');
    }
  }

  /**
   * Elimina un envío por ID
   */
  async eliminarEnvio(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error al eliminar envío:', error);
      throw new Error('No se pudo eliminar el registro de envío');
    }
  }

  /**
   * Obtiene el resumen mensual con totales por tipo de envío
   */
  async getResumenMensual(filtros: EnviosFiltros): Promise<EnvioResumenMensual> {
    try {
      const response = await api.get<EnvioResumenMensual>(`${this.BASE_URL}/resumen`, {
        params: {
          year: filtros.year,
          month: filtros.month
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener resumen mensual:', error);
      throw new Error('No se pudo cargar el resumen mensual');
    }
  }

  /**
   * Genera los días faltantes de un mes para mostrar en la tabla
   */
  generarDiasCompletos(enviosExistentes: EnvioDiario[], year: number, month: number): EnvioDiario[] {
    const diasEnMes = new Date(year, month, 0).getDate();
    const diasCompletos: EnvioDiario[] = [];

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaString = `${year}-${month.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      
      // Buscar si ya existe un registro para este día
      const envioExistente = enviosExistentes.find(e => {
        const fechaEnvio = new Date(e.fecha).toISOString().split('T')[0];
        return fechaEnvio === fechaString;
      });

      if (envioExistente) {
        diasCompletos.push(envioExistente);
      } else {
        // Crear un registro vacío para este día
        diasCompletos.push({
          id: 0, // ID temporal para días sin registro
          fecha: `${fechaString}T00:00:00.000Z`,
          oca: null as any,
          andreani: null as any,
          retirosSucursal: null as any,
          roberto: null as any,
          tino: null as any,
          caddy: null as any,
          mercadoLibre: null as any,
          totalCordobaCapital: 0,
          totalEnvios: 0
        });
      }
    }

    return diasCompletos;
  }

  /**
   * Convierte Map de cambios a formato legible para debugging
   */
  debugCambios(cambios: Map<string, CambioEnvio>): void {
    console.log('🔍 Cambios pendientes:', {
      total: cambios.size,
      cambios: Array.from(cambios.values()).map(c => ({
        fecha: c.fecha.split('T')[0],
        campo: c.campo,
        valor: c.valorNuevo
      }))
    });
  }
}

// Exportar una instancia singleton del servicio
export const enviosService = new EnviosService();
export default enviosService;