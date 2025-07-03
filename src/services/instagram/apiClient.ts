import api from '@/api/api';
import type { InstagramAPIError } from '@/types/instagram/indexIg';

/**
 * Cliente base para las APIs de Instagram Analytics
 */
class InstagramAPIClient {
  private readonly baseURL = '/api/v1/instagram-analytics';

  /**
   * Wrapper genérico para requests con manejo de errores
   */
  private async request<T>(
    endpoint: string,
    options?: {
      params?: Record<string, any>;
      timeout?: number;
    }
  ): Promise<T> {
    try {
      const response = await api.get<T>(`${this.baseURL}${endpoint}`, {
        params: options?.params,
        timeout: options?.timeout || 30000,
      });

      return response.data;
    } catch (error: any) {
      console.error(`Error en ${endpoint}:`, error);
      
      // Extraer mensaje de error del backend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Error desconocido';

      const apiError: InstagramAPIError = {
        error: 'API_ERROR',
        message: errorMessage,
        statusCode: error.response?.status || 500,
        timestamp: new Date().toISOString()
      };

      throw apiError;
    }
  }

  /**
   * Valida que la cuenta sea válida
   */
  private validateAccount(cuenta: string): void {
    const validAccounts = ['montella', 'alenka', 'kids'];
    if (!validAccounts.includes(cuenta.toLowerCase())) {
      throw new Error(`Cuenta '${cuenta}' no válida. Cuentas disponibles: ${validAccounts.join(', ')}`);
    }
  }

  /**
   * Valida rango de fechas
   */
  private validateDateRange(desde?: string, hasta?: string): void {
    if (desde && hasta) {
      const fechaDesde = new Date(desde);
      const fechaHasta = new Date(hasta);
      
      if (fechaDesde >= fechaHasta) {
        throw new Error('La fecha desde debe ser anterior a la fecha hasta');
      }

      const diffDays = (fechaHasta.getTime() - fechaDesde.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 365) {
        throw new Error('El rango de fechas no puede ser mayor a 365 días');
      }
    }
  }

  /**
   * Formatea fechas para la API
   */
  private formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Construye parámetros de query con validación
   */
  private buildParams(params: Record<string, any>): Record<string, any> {
    const cleanParams: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    return cleanParams;
  }

  /**
   * GET request con validaciones específicas para Instagram
   */
  async get<T>(
    cuenta: string,
    endpoint: string,
    params?: {
      desde?: string | Date;
      hasta?: string | Date;
      [key: string]: any;
    }
  ): Promise<T> {
    // Validaciones
    this.validateAccount(cuenta);
    
    if (params?.desde || params?.hasta) {
      this.validateDateRange(
        params.desde ? this.formatDate(params.desde) : undefined,
        params.hasta ? this.formatDate(params.hasta) : undefined
      );
    }

    // Formatear parámetros
    const formattedParams: Record<string, any> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (key === 'desde' || key === 'hasta') {
          if (value) {
            formattedParams[key] = this.formatDate(value);
          }
        } else {
          formattedParams[key] = value;
        }
      });
    }

    const cleanParams = this.buildParams(formattedParams);
    const fullEndpoint = `/${cuenta}${endpoint}`;

    return this.request<T>(fullEndpoint, { params: cleanParams });
  }

  /**
   * Health check del servicio
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  /**
   * Retry wrapper para requests críticos
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Solo reintentar en errores de red o 5xx
        const shouldRetry = !(error as any).response || 
                           (error as any).response.status >= 500 ||
                           (error as any).code === 'NETWORK_ERROR';

        if (!shouldRetry) {
          break;
        }

        console.warn(`Intento ${attempt}/${maxRetries} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }

    throw lastError;
  }

  /**
   * Batch requests para múltiples cuentas
   */
  async batchRequest<T>(
    cuentas: string[],
    endpoint: string,
    params?: Record<string, any>
  ): Promise<Record<string, T | null>> {
    const results: Record<string, T | null> = {};

    // Ejecutar requests en paralelo
    const promises = cuentas.map(async (cuenta) => {
      try {
        const data = await this.get<T>(cuenta, endpoint, params);
        results[cuenta] = data;
      } catch (error) {
        console.error(`Error fetching data for ${cuenta}:`, error);
        results[cuenta] = null;
      }
    });

    await Promise.allSettled(promises);
    return results;
  }
}

// Instancia singleton del cliente
export const instagramAPI = new InstagramAPIClient();

// Exports adicionales
export default instagramAPI;
export type { InstagramAPIClient };