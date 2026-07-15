import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { evolucionStockKeys } from './useCargaArchivos';
import { remitosService } from '@/services/evolucionStock/remitosService';
import type {
  ActualizarDepositoMapeoRequest,
  CargarRemitosRequest
} from '@/types/evolucionStock/remitosTypes';

export const remitosKeys = {
  all: [...evolucionStockKeys.all, 'remitos'] as const,
  depositos: () => [...remitosKeys.all, 'depositos'] as const,
  cargas: () => [...remitosKeys.all, 'cargas'] as const
};

export const useValidarRemitosMutation = () => {
  return useMutation({ mutationFn: (archivo: File) => remitosService.validar(archivo) });
};

export const useCargarRemitosMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CargarRemitosRequest) => remitosService.cargar(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all })
  });
};

export const useDepositosRemitosQuery = (enabled = true) => {
  return useQuery({
    queryKey: remitosKeys.depositos(),
    queryFn: remitosService.obtenerDepositos,
    enabled,
    staleTime: 1000 * 60 * 5
  });
};

export const useActualizarDepositoMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ActualizarDepositoMapeoRequest) => remitosService.actualizarDeposito(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all })
  });
};

export const useCargasRemitosQuery = () => {
  return useQuery({
    queryKey: remitosKeys.cargas(),
    queryFn: remitosService.obtenerCargas,
    staleTime: 1000 * 60 * 2
  });
};

export const useEliminarCargaRemitosMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => remitosService.eliminarCarga(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: evolucionStockKeys.all })
  });
};
