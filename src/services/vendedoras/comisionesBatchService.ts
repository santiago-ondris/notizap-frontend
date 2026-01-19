import api from '@/api/api';
import type {
    TurnosPendientesBatch,
    CalcularBatchRequest,
    CalcularBatchResponse
} from '@/types/vendedoras/comisionTypes';

const BASE_URL = '/api/v1/vendedoras/comisiones';

export const comisionesBatchService = {
    /**
     * Obtiene todos los turnos pendientes de calcular en un rango de fechas
     */
    async obtenerTurnosPendientes(
        fechaInicio: string,
        fechaFin: string
    ): Promise<TurnosPendientesBatch> {
        const response = await api.get(`${BASE_URL}/pendientes-batch`, {
            params: { fechaInicio, fechaFin }
        });
        return response.data;
    },

    /**
     * Calcula comisiones para múltiples turnos en una sola operación
     */
    async calcularBatch(request: CalcularBatchRequest): Promise<CalcularBatchResponse> {
        const response = await api.post(`${BASE_URL}/calcular-batch`, request);
        return response.data;
    }
};

// Helpers para el manejo de fechas del batch
export const batchHelpers = {
    /**
     * Obtiene el primer día de hace un mes
     */
    obtenerFechaInicioDefault(): string {
        const hoy = new Date();
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        return hace30Dias.toISOString().split('T')[0];
    },

    /**
     * Obtiene la fecha de ayer
     */
    obtenerFechaFinDefault(): string {
        const hoy = new Date();
        const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);
        return ayer.toISOString().split('T')[0];
    },

    /**
     * Formatea la fecha para mostrar (corrige timezone)
     */
    formatearFecha(fechaIso: string): string {
        // Extraer solo la parte de fecha (YYYY-MM-DD) para evitar problemas de timezone
        const soloFecha = fechaIso.split('T')[0];
        const [year, month, day] = soloFecha.split('-').map(Number);
        // Crear fecha usando componentes locales (no UTC)
        const fecha = new Date(year, month - 1, day);
        return fecha.toLocaleDateString('es-AR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    },

    /**
     * Formatea moneda
     */
    formatearMoneda(monto: number): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2
        }).format(monto);
    }
};
