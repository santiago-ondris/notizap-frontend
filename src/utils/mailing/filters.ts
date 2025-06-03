import { type CampaignMailchimp } from "@/types/mailing/mailingTypes";

/**
 * Filtra campañas por un string en el título (case-insensitive)
 */
export function filterByTitle(campañas: CampaignMailchimp[], search: string): CampaignMailchimp[] {
  if (!search.trim()) return campañas;
  return campañas.filter(c =>
    c.title.toLowerCase().includes(search.trim().toLowerCase())
  );
}

/**
 * Filtra campañas por rango de fechas (inclusive)
 * Las fechas deben venir en formato Date o string ISO válido
 */
export function filterByDateRange(
  campañas: CampaignMailchimp[],
  from?: Date | null,
  to?: Date | null
): CampaignMailchimp[] {
  if (!from && !to) return campañas;
  return campañas.filter(c => {
    const fecha = new Date(c.sendTime);
    const afterFrom = from ? fecha >= from : true;
    const beforeTo = to ? fecha <= to : true;
    return afterFrom && beforeTo;
  });
}
