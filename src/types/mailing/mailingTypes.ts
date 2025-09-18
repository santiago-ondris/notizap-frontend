export interface CampaignMailchimp {
  id: number;
  campaignId: string;
  title: string;
  sendTime: string;     
  emailsSent: number;
  openRate: number;        
  clickRate: number;       
  conversions: number;
  cuenta: "Montella" | "Alenka";
}

export interface CampaignHighlights {
  bestOpenRateCampaign: string;
  bestOpenRate: number;
  bestClickRateCampaign: string;
  bestClickRate: number;
  bestConversionCampaign: string;
  bestConversions: number;
}

export interface CampaignStats {
  campaignTitle: string;
  sendTime: string;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversions: number;
}

export interface MailchimpSyncResult {
  nuevasCampañas: number;
  campañasActualizadas: number;
  totalProcesadas: number;
  mensaje: string;
}