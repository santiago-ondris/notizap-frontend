// components/MercadoLibre/Analysis/ROIChart.tsx
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid,
    Cell
  } from "recharts";
  import { Target, Package, Monitor, TrendingUp } from "lucide-react";
  import { type CampaignROI } from "@/types/mercadolibre/ml";
  
  interface ROIChartProps {
    data: CampaignROI[];
    loading?: boolean;
  }
  
  export default function ROIChart({ data, loading = false }: ROIChartProps) {
    if (loading) {
      return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
            <div className="h-80 bg-white/10 rounded"></div>
          </div>
        </div>
      );
    }
  
    if (!data || data.length === 0) {
      return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Target className="w-8 h-8 text-white/40" />
            <p className="text-white/60 text-sm">🎯 No hay datos de campañas para analizar ROI.</p>
          </div>
        </div>
      );
    }
  
    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('es-AR', { 
        style: 'currency', 
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: value >= 1000000 ? 'compact' : 'standard'
      }).format(value);
  
    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  
    const getTypeIcon = (tipo: string) => {
      switch (tipo.toLowerCase()) {
        case 'productads':
        case 'product':
          return <Package className="w-4 h-4" />;
        case 'brandads':
        case 'brand':
          return <Target className="w-4 h-4" />;
        case 'displayads':
        case 'display':
          return <Monitor className="w-4 h-4" />;
        default:
          return <TrendingUp className="w-4 h-4" />;
      }
    };
  
    const getTypeLabel = (tipo: string) => {
      switch (tipo.toLowerCase()) {
        case 'productads':
        case 'product':
          return '📦 Product Ads';
        case 'brandads':
        case 'brand':
          return '🎯 Brand Ads';
        case 'displayads':
        case 'display':
          return '📺 Display Ads';
        default:
          return tipo;
      }
    };
  
    const getBarColor = (roi: number) => {
      if (roi >= 50) return '#51590E';
      if (roi >= 20) return '#FFD700';
      if (roi >= 0) return '#B695BF';
      return '#D94854';
    };
  
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-[#212026] border border-white/20 rounded-lg p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              {getTypeIcon(label)}
              <p className="text-white font-medium">{getTypeLabel(label)}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-white/80">
                <strong>ROI:</strong> <span className={`font-semibold ${data.roi >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'}`}>
                  {formatPercentage(data.roi)}
                </span>
              </p>
              <p className="text-white/80">
                <strong>Inversión:</strong> {formatCurrency(data.totalInversion)}
              </p>
              <p className="text-white/80">
                <strong>Ingresos:</strong> {formatCurrency(data.totalIngresos)}
              </p>
              <p className="text-white/80">
                <strong>Campañas:</strong> {data.campanias}
              </p>
            </div>
          </div>
        );
      }
      return null;
    };
  
    // Estadísticas rápidas
    const mejorROI = data.reduce((mejor, actual) => actual.roi > mejor.roi ? actual : mejor, data[0]);
    const totalInversion = data.reduce((sum, d) => sum + d.totalInversion, 0);
    const totalCampanias = data.reduce((sum, d) => sum + d.campanias, 0);
  
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <Target className="w-7 h-7 text-[#D94854]" />
                🎯 ROI por Tipo de Campaña
              </h2>
              <p className="text-white/60">
                Análisis de retorno de inversión segmentado por tipo de publicidad
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-[#FFD700]">
                  {getTypeLabel(mejorROI.tipo)}
                </div>
                <div className="text-white/60 text-xs">Mejor ROI</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#D94854]">
                  {formatCurrency(totalInversion)}
                </div>
                <div className="text-white/60 text-xs">Inversión Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#B695BF]">
                  {totalCampanias}
                </div>
                <div className="text-white/60 text-xs">Campañas</div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Gráfico */}
        <div className="p-6">
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="tipo"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={getTypeLabel}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="roi" 
                  name="ROI"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.roi)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Detalles por tipo */}
        <div className="p-6 bg-white/5 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B695BF]" />
            📊 Detalles por Tipo de Campaña
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((campaign, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    campaign.roi >= 50 ? 'bg-[#51590E]/20' :
                    campaign.roi >= 20 ? 'bg-[#FFD700]/20' :
                    campaign.roi >= 0 ? 'bg-[#B695BF]/20' : 'bg-[#D94854]/20'
                  }`}>
                    {getTypeIcon(campaign.tipo)}
                  </div>
                  <h4 className="font-medium text-white">{getTypeLabel(campaign.tipo)}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">ROI:</span>
                    <span className={`font-semibold ${
                      campaign.roi >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'
                    }`}>
                      {formatPercentage(campaign.roi)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Inversión:</span>
                    <span className="text-white font-medium">{formatCurrency(campaign.totalInversion)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Ingresos:</span>
                    <span className="text-white font-medium">{formatCurrency(campaign.totalIngresos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Campañas:</span>
                    <span className="text-white font-medium">{campaign.campanias}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Footer con insights */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                🏆 Mejor tipo: <span className="text-[#FFD700] font-medium">
                  {getTypeLabel(mejorROI.tipo)} ({formatPercentage(mejorROI.roi)})
                </span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                💡 Recomendación: <span className="text-white font-medium">
                  {mejorROI.roi >= 50 ? 'Mantener estrategia' : 
                   mejorROI.roi >= 20 ? 'Optimizar campañas' : 
                   'Revisar targeting'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }