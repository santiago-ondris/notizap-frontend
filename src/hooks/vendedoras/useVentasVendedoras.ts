import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasVendedorasService } from '@/services/vendedoras/ventasVendedorasService';
import type { VentaVendedoraFilters } from '@/types/vendedoras/filtrosTypes';

export const vendedorasKeys = {
    all: ['ventas-vendedoras'] as const,
    initialData: () => [...vendedorasKeys.all, 'initial-data'] as const,
    ventas: (filtros: VentaVendedoraFilters) => [...vendedorasKeys.all, 'ventas', filtros] as const,
    stats: (filtros: Partial<VentaVendedoraFilters>) => [...vendedorasKeys.all, 'stats', filtros] as const,
    gestion: () => [...vendedorasKeys.all, 'gestion'] as const,
};

export const useVentasVendedorasInitialData = () => {
    return useQuery({
        queryKey: vendedorasKeys.initialData(),
        queryFn: async () => {
            const [sucursales, vendedores, rangoFechas] = await Promise.all([
                ventasVendedorasService.obtenerSucursales(),
                ventasVendedorasService.obtenerVendedores(),
                ventasVendedorasService.obtenerRangoFechas(),
            ]);
            return { sucursales, vendedores, rangoFechas };
        },
        staleTime: 1000 * 60 * 30, // 30 minutes for static data like sucursales/vendedores
    });
};

export const useVendedoresGestionQuery = (enabled: boolean = true) => {
    return useQuery({
        queryKey: vendedorasKeys.gestion(),
        queryFn: () => ventasVendedorasService.obtenerVendedoresGestion(),
        enabled,
        staleTime: 1000 * 60 * 5,
    });
};

export const useVentasVendedorasQuery = (filtros: VentaVendedoraFilters, enabled: boolean = true) => {
    return useQuery({
        queryKey: vendedorasKeys.ventas(filtros),
        queryFn: () => ventasVendedorasService.obtenerVentas(filtros),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useVentasVendedorasStatsQuery = (filtros: Partial<VentaVendedoraFilters>, enabled: boolean = true) => {
    return useQuery({
        queryKey: vendedorasKeys.stats(filtros),
        queryFn: async () => {
            const [statsResponse, todasVendedorasResponse] = await Promise.all([
                ventasVendedorasService.obtenerEstadisticas(filtros),
                ventasVendedorasService.obtenerTodasLasVendedoras(filtros),
            ]);
            return {
                ...statsResponse,
                todasVendedoras: todasVendedorasResponse,
            };
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};

export const useToggleVendedoraMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => ventasVendedorasService.toggleEstadoVendedora(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: vendedorasKeys.gestion() });
            queryClient.invalidateQueries({ queryKey: vendedorasKeys.initialData() });
        },
    });
};
