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

class EnviosService {
  private readonly BASE_URL = '/api/v1/envios';

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

  async getEnvioPorFecha(filtros: EnviosFecha): Promise<EnvioDiario | null> {
    try {
      const response = await api.get<EnvioDiario>(`${this.BASE_URL}/fecha`, {
        params: {
          fecha: filtros.fecha
        }
      });
      return response.data;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error('Error al obtener envío por fecha:', error);
      throw new Error('No se pudo cargar el envío de la fecha seleccionada');
    }
  }

  async guardarEnviosLote(cambios: Map<string, CambioEnvio>): Promise<ResultadoLoteDto> {
    try {
      const cambiosPorFecha = new Map<string, CambioEnvio[]>();
      
      for (const cambio of cambios.values()) {
        const fechaKey = cambio.fecha;
        
        if (!cambiosPorFecha.has(fechaKey)) {
          cambiosPorFecha.set(fechaKey, []);
        }
        
        cambiosPorFecha.get(fechaKey)!.push(cambio);
      }

      const enviosArray: CreateEnvioDiarioDto[] = [];
      
      for (const [fechaKey, cambiosFecha] of cambiosPorFecha.entries()) {
        const dto: Partial<CreateEnvioDiarioDto> = {
          fecha: fechaKey
        };

        for (const cambio of cambiosFecha) {
          if (cambio.valorNuevo !== null) {
            (dto as any)[cambio.campo] = cambio.valorNuevo;
          }
        }
        enviosArray.push(dto as CreateEnvioDiarioDto);
      }
      
      const request: GuardarEnviosLoteDto = {
        envios: enviosArray
      };

      const response = await api.post<ResultadoLoteDto>(`${this.BASE_URL}/lote`, request);
      return response.data;
      
    } catch (error: any) {
      console.error('Error al guardar lote de envíos:', error);
      
      if (error?.response?.data?.mensaje) {
        return error.response.data as ResultadoLoteDto;
      }
      
      throw new Error('No se pudieron guardar los cambios. Intenta guardando celda por celda para encontrar el error específico.');
    }
  }

  async guardarEnvioIndividual(envio: Partial<CreateEnvioDiarioDto>): Promise<string> {
    try {
      const envioLimpio: Partial<CreateEnvioDiarioDto> = {
        fecha: envio.fecha
      };

      if (envio.oca !== undefined && envio.oca !== null) envioLimpio.oca = envio.oca;
      if (envio.andreani !== undefined && envio.andreani !== null) envioLimpio.andreani = envio.andreani;
      if (envio.retirosSucursal !== undefined && envio.retirosSucursal !== null) envioLimpio.retirosSucursal = envio.retirosSucursal;
      if (envio.roberto !== undefined && envio.roberto !== null) envioLimpio.roberto = envio.roberto;
      if (envio.tino !== undefined && envio.tino !== null) envioLimpio.tino = envio.tino;
      if (envio.caddy !== undefined && envio.caddy !== null) envioLimpio.caddy = envio.caddy;
      if (envio.mercadoLibre !== undefined && envio.mercadoLibre !== null) envioLimpio.mercadoLibre = envio.mercadoLibre;

      const response = await api.post<string>(this.BASE_URL, envioLimpio);
      return response.data || 'Registro guardado correctamente';
    } catch (error) {
      console.error('Error al guardar envío individual:', error);
      throw new Error('No se pudo guardar el registro de envío');
    }
  }

  async eliminarEnvio(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error al eliminar envío:', error);
      throw new Error('No se pudo eliminar el registro de envío');
    }
  }

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

  generarDiasCompletos(enviosExistentes: EnvioDiario[], year: number, month: number): EnvioDiario[] {
    const diasEnMes = new Date(year, month, 0).getDate();
    const diasCompletos: EnvioDiario[] = [];

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaString = `${year}-${month.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
      
      const envioExistente = enviosExistentes.find(e => {
        const fechaEnvio = new Date(e.fecha).toISOString().split('T')[0];
        return fechaEnvio === fechaString;
      });

      if (envioExistente) {
        diasCompletos.push(envioExistente);
      } else {
        diasCompletos.push({
          id: 0,
          fecha: `${fechaString}T00:00:00.000Z`,
          oca: null,
          andreani: null,
          retirosSucursal: null,
          roberto: null,
          tino: null,
          caddy: null,
          mercadoLibre: null,
          totalCordobaCapital: 0,
          totalEnvios: 0
        });
      }
    }

    return diasCompletos;
  }

  debugCambios(cambios: Map<string, CambioEnvio>): void {
    console.log('🔍 Cambios pendientes:', {
      total: cambios.size,
      cambios: Array.from(cambios.values()).map(c => ({
        fecha: c.fecha.split('T')[0],
        campo: c.campo,
        valorAnterior: c.valorAnterior,
        valorNuevo: c.valorNuevo
      }))
    });
  }
}

export const enviosService = new EnviosService();
export default enviosService;