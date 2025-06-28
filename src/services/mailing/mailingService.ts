import api from "@/api/api";
import {
  type CampaignMailchimp,
  type CampaignHighlights,
  type CampaignStats,
  type MailchimpSyncResult
} from "@/types/mailing/mailingTypes";

// Trae todas las campañas para una cuenta (Montella o Alenka)
export async function getCampaigns(cuenta: "Montella" | "Alenka"): Promise<CampaignMailchimp[]> {
  const res = await api.get(`/api/v1/mailchimp?cuenta=${cuenta}`);
  return res.data;
}

// Trae los highlights de campañas para una cuenta
export async function getHighlights(cuenta: "Montella" | "Alenka"): Promise<CampaignHighlights> {
  const res = await api.get(`/api/v1/mailchimp/highlights?cuenta=${cuenta}`);
  return res.data;
}

// Trae las métricas detalladas de una campaña
export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const res = await api.get(`/api/v1/mailchimp/stats?campaignId=${campaignId}`);
  return res.data;
}

// Sincroniza campañas desde Mailchimp (solo admin/superadmin)
export async function syncCampaigns(cuenta: "Montella" | "Alenka"): Promise<MailchimpSyncResult> {
  const res = await api.post(`/api/v1/mailchimp/sync?cuenta=${cuenta}`);
  return res.data;
}

// Actualiza el título de una campaña (solo admin/superadmin)
export async function updateCampaignTitle(campaignId: number, title: string): Promise<{ message: string; title: string }> {
  const res = await api.patch(`/api/v1/mailchimp/${campaignId}/title`, { title });
  return res.data;
}