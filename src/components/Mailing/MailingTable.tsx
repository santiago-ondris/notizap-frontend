import React from "react";
import { Loader2, Mail, AlertCircle, Calendar, Users, MousePointer, Target } from "lucide-react";

interface Campaign {
  campaignId: string;
  title: string;
  sendTime: string;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversions: number;
}

interface MailingTableProps {
  campañas: Campaign[];
  isLoading: boolean;
  error: Error | null;
  totalCampaigns?: number;
  currentPage?: number;
  itemsPerPage?: number;
}

export const MailingTable: React.FC<MailingTableProps> = ({
  campañas,
  isLoading,
  error,
  totalCampaigns = 0,
  currentPage = 1,
  itemsPerPage = 15
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin w-8 h-8 text-white/60 mx-auto mb-4" />
            <p className="text-white/60">Cargando campañas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-medium">Error al cargar campañas</p>
            <p className="text-white/60 text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campañas || campañas.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Mail className="w-8 h-8 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No hay campañas para mostrar</p>
            <p className="text-white/40 text-sm mt-2">Intenta ajustar los filtros</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular rango de elementos mostrados
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCampaigns);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#B695BF]" />
            Campañas enviadas
          </h2>
          
          {totalCampaigns > 0 && (
            <div className="text-white/60 text-sm">
              Mostrando {startItem}-{endItem} de {totalCampaigns} campañas
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                Campaña
              </th>
              <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha
                </div>
              </th>
              <th className="text-center px-6 py-4 font-semibold text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Emails
                </div>
              </th>
              <th className="text-center px-6 py-4 font-semibold text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Open Rate
                </div>
              </th>
              <th className="text-center px-6 py-4 font-semibold text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Click Rate
                </div>
              </th>
              <th className="text-center px-6 py-4 font-semibold text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  Conversiones
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {campañas.map((campaña, index) => (
              <tr 
                key={campaña.campaignId} 
                className={`
                  border-b border-white/5 hover:bg-white/5 transition-colors
                  ${index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                `}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-white">
                    {campaña.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white/70 text-sm">
                    {new Date(campaña.sendTime).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-white/50 text-xs">
                    {new Date(campaña.sendTime).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-white font-medium">
                    {campaña.emailsSent.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-[#D94854]/20 text-[#D94854] font-semibold text-sm">
                    {(campaña.openRate * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-[#F23D5E]/20 text-[#F23D5E] font-semibold text-sm">
                    {(campaña.clickRate * 100).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-[#51590E]/20 text-[#51590E] font-semibold text-sm">
                    {campaña.conversions}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};