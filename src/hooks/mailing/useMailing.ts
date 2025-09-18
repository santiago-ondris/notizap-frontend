import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCampaigns, getHighlights, syncCampaigns, updateCampaignTitle } from "@/services/mailing/mailingService";
import type { CampaignMailchimp, CampaignHighlights, MailchimpSyncResult } from "@/types/mailing/mailingTypes";

export function useMailingCampaigns(cuenta: "Montella" | "Alenka") {
  return useQuery<CampaignMailchimp[], Error>({
    queryKey: ["mailing-campaigns", cuenta],
    queryFn: () => getCampaigns(cuenta),
    staleTime: 5 * 60 * 1000, 
  });
}

// Hook para obtener highlights
export function useMailingHighlights(cuenta: "Montella" | "Alenka") {
  return useQuery<CampaignHighlights, Error>({
    queryKey: ["mailing-highlights", cuenta],
    queryFn: () => getHighlights(cuenta),
    staleTime: 5 * 60 * 1000, 
  });
}

// Hook para sincronización con invalidación automática de queries
export function useSyncMailingCampaigns() {
  const queryClient = useQueryClient();

  return useMutation<MailchimpSyncResult, Error, "Montella" | "Alenka">({
    mutationFn: (cuenta) => syncCampaigns(cuenta),
    onSuccess: (cuenta) => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: ["mailing-campaigns", cuenta] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["mailing-highlights", cuenta] 
      });
    },
  });
}

// Hook para actualizar título de campaña
export function useUpdateCampaignTitle() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; title: string }, 
    Error, 
    { campaignId: number; title: string; cuenta: "Montella" | "Alenka" }
  >({
    mutationFn: ({ campaignId, title }) => updateCampaignTitle(campaignId, title),
    onSuccess: (_data, variables) => {
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ 
        queryKey: ["mailing-campaigns", variables.cuenta] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["mailing-highlights", variables.cuenta] 
      });
    },
  });
}