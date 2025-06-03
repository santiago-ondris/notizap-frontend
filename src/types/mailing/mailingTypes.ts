export interface CampaignMailchimp {
    id: number;
    campaignId: string;
    title: string;
    sendTime: string;        // ISO String
    emailsSent: number;
    openRate: number;        // 0.45 = 45%
    clickRate: number;       // 0.23 = 23%
    conversions: number;
    cuenta: "Montella" | "Alenka";
  }
  
  // Tipo para el resumen de highlights
  export interface CampaignHighlights {
    bestOpenRateCampaign: string;
    bestOpenRate: number;
    bestClickRateCampaign: string;
    bestClickRate: number;
    bestConversionCampaign: string;
    bestConversions: number;
  }
  
  // Tipo para los detalles de una campaña específica
  export interface CampaignStats {
    campaignTitle: string;
    sendTime: string;
    emailsSent: number;
    openRate: number;
    clickRate: number;
    conversions: number;
  }