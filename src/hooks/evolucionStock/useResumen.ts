import { useQuery } from '@tanstack/react-query';
import { resumenService } from '@/services/evolucionStock/resumenService';
import type { ResumenEjecutivoFiltros } from '@/types/evolucionStock/resumenTypes';

export const resumenKeys = {
  all: ['evolucion-stock', 'resumen'] as const,
  detalle: (filtros: ResumenEjecutivoFiltros) => [...resumenKeys.all, filtros] as const
};

export const useResumenEjecutivo = (filtros: ResumenEjecutivoFiltros) => useQuery({
  queryKey: resumenKeys.detalle(filtros),
  queryFn: () => resumenService.obtener(filtros),
  staleTime: 1000 * 60 * 5
});
