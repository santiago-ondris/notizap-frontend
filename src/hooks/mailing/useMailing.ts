import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCampaigns,
  getHighlights,
  getCampaignStats,
  syncCampaigns,
} from "@/services/mailing/mailingService";
import {
  type CampaignMailchimp,
  type CampaignHighlights,
  type CampaignStats,
} from "@/types/mailing/mailingTypes";

// Hook para listar campañas de una cuenta
export function useMailingCampaigns(cuenta: "Montella" | "Alenka") {
  return useQuery<CampaignMailchimp[], Error>({
    queryKey: ["mailing-campaigns", cuenta],
    queryFn: () => getCampaigns(cuenta),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para traer los highlights de una cuenta
export function useMailingHighlights(cuenta: "Montella" | "Alenka") {
  return useQuery<CampaignHighlights, Error>({
    queryKey: ["mailing-highlights", cuenta],
    queryFn: () => getHighlights(cuenta),
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para detalle de campaña (stats)
export function useMailingCampaignStats(campaignId: string) {
  return useQuery<CampaignStats, Error>({
    queryKey: ["mailing-campaign-stats", campaignId],
    queryFn: () => getCampaignStats(campaignId),
    enabled: !!campaignId, // Solo consulta si hay id
  });
}

// Hook para sincronizar campañas (mutación)
export function useSyncMailingCampaigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cuenta: "Montella" | "Alenka") => syncCampaigns(cuenta),
    onSuccess: (_, cuenta) => {
      // Refresca la lista y highlights automáticamente
      queryClient.invalidateQueries({ queryKey: ["mailing-campaigns", cuenta] });
      queryClient.invalidateQueries({ queryKey: ["mailing-highlights", cuenta] });
    },
  });
}
