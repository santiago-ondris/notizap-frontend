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
     * Obtiene el primer día del mes actual (YYYY-MM-DD)
     */
    obtenerPrimerDiaMesActual(): string {
        const hoy = new Date();
        return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            .toISOString().split('T')[0];
    },

    /**
     * Obtiene la fecha de ayer (YYYY-MM-DD)
     */
    obtenerAyer(): string {
        const hoy = new Date();
        return new Date(hoy.getTime() - 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
    },

    /**
     * Formatea una fecha ISO para mostrar siempre como DD/MM/YYYY
     */
    formatearFechaDisplay(fechaIso: string): string {
        if (!fechaIso) return '';
        const soloFecha = fechaIso.split('T')[0];
        const partes = soloFecha.split('-');
        if (partes.length !== 3) return fechaIso;

        const [year, month, day] = partes;
        return `${day}/${month}/${year}`;
    },

    /**
     * Formatea la fecha para mostrar con el nombre del día
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
