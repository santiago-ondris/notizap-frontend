import api from '@/api/api';
import { 
  type EnvioDiario, 
  type CreateEnvioDiarioDto, 
  type UpdateEnvioDiarioDto, 
  type EnvioResumenMensual,
  type EnviosFiltros,
  type EnviosFecha, 
} from '@/types/envios/enviosTypes';

/**
 * Servicio para manejar todas las operaciones relacionadas con envíos
 * Centraliza todas las llamadas a la API del módulo de envíos
 */
class EnviosService {
  private readonly BASE_URL = '/api/v1/envios';

  /**
   * Obtiene todos los envíos de un mes específico
   * @param filtros - Año y mes a consultar
   * @returns Array de envíos diarios del mes
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
   * @param filtros - Fecha específica en formato YYYY-MM-DD
   * @returns Envío diario de la fecha especificada
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
   * Guarda un envío (el backend maneja automáticamente CREATE o UPDATE por fecha)
   * @param envio - Datos del envío
   * @returns Mensaje de confirmación
   */
  async guardarEnvio(envio: CreateEnvioDiarioDto): Promise<string> {
    try {
      const response = await api.post<string>(this.BASE_URL, envio);
      return response.data || 'Registro guardado correctamente';
    } catch (error) {
      console.error('Error al guardar envío:', error);
      throw new Error('No se pudo guardar el registro de envío');
    }
  }

  /**
   * Actualiza un envío existente específicamente por ID
   * (Solo usar si necesitas actualizar un registro específico)
   * @param id - ID del envío a actualizar
   * @param envio - Nuevos datos del envío
   * @returns Mensaje de confirmación
   */
  async actualizarEnvioPorId(id: number, envio: UpdateEnvioDiarioDto): Promise<string> {
    try {
      const response = await api.put<string>(`${this.BASE_URL}/${id}`, envio);
      return response.data || 'Registro actualizado correctamente';
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      throw new Error('No se pudo actualizar el registro de envío');
    }
  }

  /**
   * Elimina un envío por ID
   * @param id - ID del envío a eliminar
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
   * @param filtros - Año y mes a consultar
   * @returns Resumen con totales mensuales
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

  // MÉTODOS LEGACY - ELIMINADOS porque el backend maneja automáticamente CREATE/UPDATE
  // async crearEnvio() - No necesario, usar guardarEnvio()
  // async actualizarEnvio() - No necesario, usar guardarEnvio()
  
  /**
   * Método simplificado que SIEMPRE usa POST
   * El backend decide automáticamente si crear o actualizar según la fecha
   * @param envio - Datos del envío  
   * @param _id - Parámetro ignorado (mantenido por compatibilidad)
   * @returns Mensaje de confirmación
   */
  async guardarEnvioLegacy(envio: CreateEnvioDiarioDto, _id?: number): Promise<string> {
    // Ignoramos el ID y SIEMPRE usamos POST
    // El backend maneja CREATE/UPDATE automáticamente por fecha
    return this.guardarEnvio(envio);
  }

  /**
   * Valida los datos de un envío antes de enviarlo
   * @param envio - Datos a validar
   * @returns true si es válido, string con error si no
   */
  validarEnvio(envio: CreateEnvioDiarioDto | UpdateEnvioDiarioDto): true | string {
    // Validar que todos los números sean >= 0
    const campos = ['oca', 'andreani', 'retirosSucursal', 'roberto', 'tino', 'caddy', 'mercadoLibre'] as const;
    
    for (const campo of campos) {
      const valor = envio[campo];
      if (typeof valor !== 'number' || valor < 0 || !Number.isInteger(valor)) {
        return `El campo ${campo} debe ser un número entero mayor o igual a 0`;
      }
    }

    // Validar formato de fecha
    if (!envio.fecha) {
      return 'La fecha es requerida';
    }

    const fecha = new Date(envio.fecha);
    if (isNaN(fecha.getTime())) {
      return 'La fecha no tiene un formato válido';
    }

    return true;
  }

  /**
   * Genera los días faltantes de un mes para mostrar en la tabla
   * @param enviosExistentes - Envíos ya registrados
   * @param year - Año
   * @param month - Mes (1-12)
   * @returns Array completo de 31 días con envíos existentes o vacíos
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
          oca: 0,
          andreani: 0,
          retirosSucursal: 0,
          roberto: 0,
          tino: 0,
          caddy: 0,
          mercadoLibre: 0,
          totalCordobaCapital: 0,
          totalEnvios: 0
        });
      }
    }

    return diasCompletos;
  }
}

// Exportar una instancia singleton del servicio
export const enviosService = new EnviosService();
export default enviosService;