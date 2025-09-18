import React from "react";
import { TrendingUp, MousePointer, Target, Loader2, Filter } from "lucide-react";

interface HighlightsData {
  bestOpenRateCampaign: string;
  bestOpenRate: number;
  bestClickRateCampaign: string;
  bestClickRate: number;
  bestConversionCampaign: string;
  bestConversions: number;
}

interface MailingHighlightsProps {
  highlights: HighlightsData | undefined;
  isLoading: boolean;
  isDynamic?: boolean;
}

export const MailingHighlights: React.FC<MailingHighlightsProps> = ({
  highlights,
  isLoading,
  isDynamic = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#B695BF]" />
          Mejores métricas
          {isDynamic && <Filter className="w-4 h-4 text-[#B695BF]" />}
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin w-6 h-6 text-white/60" />
        </div>
      </div>
    );
  }

  if (!highlights) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#B695BF]" />
          Mejores métricas
          {isDynamic && <Filter className="w-4 h-4 text-[#B695BF]" />}
        </h2>
        <div className="text-center py-8">
          <div className="text-white/60 text-sm">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  const highlightCards = [
    {
      icon: TrendingUp,
      label: "Mejor Open Rate",
      campaign: highlights.bestOpenRateCampaign,
      value: `${(highlights.bestOpenRate * 100).toFixed(1)}%`,
      color: "#D94854",
      bgColor: "from-[#D94854]/20 to-[#F23D5E]/10"
    },
    {
      icon: MousePointer,
      label: "Mejor Click Rate",
      campaign: highlights.bestClickRateCampaign,
      value: `${(highlights.bestClickRate * 100).toFixed(1)}%`,
      color: "#F23D5E",
      bgColor: "from-[#F23D5E]/20 to-[#D94854]/10"
    },
    {
      icon: Target,
      label: "Más Conversiones",
      campaign: highlights.bestConversionCampaign,
      value: highlights.bestConversions.toString(),
      color: "#51590E",
      bgColor: "from-[#51590E]/20 to-[#B695BF]/10"
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#B695BF]" />
        Mejores métricas
        {isDynamic && <Filter className="w-4 h-4 text-[#B695BF]" />}
      </h2>
      
      {/* Indicador de filtros activos */}
      {isDynamic && (
        <div className="mb-4 px-3 py-1 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
          <div className="text-xs text-[#B695BF] font-medium">
            Basado en filtros aplicados
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {highlightCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${card.bgColor} border border-white/10 p-4 group hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                    {card.label}
                  </span>
                </div>
                <div className="text-white font-bold text-lg mb-1" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="text-white/80 text-sm truncate font-medium">
                  {card.campaign}
                </div>
              </div>
            </div>
            
            {/* Decorative gradient */}
            <div 
              className="absolute top-0 right-0 w-16 h-16 opacity-20 blur-2xl rounded-full"
              style={{ backgroundColor: card.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};