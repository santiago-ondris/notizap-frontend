import { 
    Line, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer, 
    CartesianGrid,
    Bar,
    ComposedChart
  } from "recharts";
  import { TrendingUp } from "lucide-react";
  import { type ChartDataPoint } from "@/types/mercadolibre/ml";
  
  interface SalesVsInvestmentChartProps {
    data: ChartDataPoint[];
    loading?: boolean;
  }
  
  export default function SalesVsInvestmentChart({ data, loading = false }: SalesVsInvestmentChartProps) {
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
            <TrendingUp className="w-8 h-8 text-white/40" />
            <p className="text-white/60 text-sm">📊 No hay datos suficientes para mostrar el gráfico.</p>
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
  
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[#212026] border border-white/20 rounded-lg p-4 shadow-lg">
            <p className="text-white font-medium mb-3">📅 {label}</p>
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white/80 text-sm">
                  <strong>{entry.name}:</strong> {
                    entry.dataKey === 'roi' 
                      ? formatPercentage(entry.value)
                      : formatCurrency(entry.value)
                  }
                </span>
              </div>
            ))}
          </div>
        );
      }
      return null;
    };
  
    // Estadísticas rápidas
    const totalVentas = data.reduce((sum, d) => sum + d.ventas, 0);
    const totalInversion = data.reduce((sum, d) => sum + d.inversion, 0);
    const roiPromedio = data.length > 0 
      ? data.reduce((sum, d) => sum + d.roi, 0) / data.length 
      : 0;
  
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <TrendingUp className="w-7 h-7 text-[#D94854]" />
                📊 Evolución: Ventas vs Inversión Publicitaria
              </h2>
              <p className="text-white/60">
                Análisis temporal de ventas, inversión publicitaria y ROI mensual
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-[#51590E]">
                  {formatCurrency(totalVentas)}
                </div>
                <div className="text-white/60 text-xs">Total Ventas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#D94854]">
                  {formatCurrency(totalInversion)}
                </div>
                <div className="text-white/60 text-xs">Total Inversión</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${roiPromedio >= 0 ? 'text-[#51590E]' : 'text-[#D94854]'}`}>
                  {formatPercentage(roiPromedio)}
                </div>
                <div className="text-white/60 text-xs">ROI Promedio</div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Leyenda */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-[#51590E]" />
              <span className="text-white/80 font-medium">💰 Ventas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-[#D94854]" />
              <span className="text-white/80 font-medium">🎯 Inversión Publicitaria</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-[#B695BF]" />
              <span className="text-white/80 font-medium">📈 ROI (%)</span>
            </div>
          </div>
        </div>
  
        {/* Gráfico */}
        <div className="p-6">
          <div style={{ width: "100%", height: 450 }}>
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                />
                <YAxis 
                  yAxisId="money"
                  orientation="left"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={formatCurrency}
                />
                <YAxis 
                  yAxisId="percentage"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.7)" }}
                  stroke="rgba(255,255,255,0.3)"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
  
                {/* Barras de inversión */}
                <Bar
                  yAxisId="money"
                  dataKey="inversion"
                  name="💸 Inversión Publicitaria"
                  fill="rgba(217, 72, 84, 0.3)"
                  stroke="#D94854"
                  strokeWidth={1}
                  radius={[2, 2, 0, 0]}
                />
  
                {/* Línea de ventas */}
                <Line
                  yAxisId="money"
                  type="monotone"
                  dataKey="ventas"
                  name="💰 Ventas"
                  stroke="#51590E"
                  strokeWidth={4}
                  dot={{
                    stroke: "#51590E",
                    strokeWidth: 2,
                    r: 5,
                    fill: "#212026",
                  }}
                  activeDot={{
                    stroke: "#51590E",
                    strokeWidth: 3,
                    r: 8,
                    fill: "#212026",
                  }}
                />
  
                {/* Línea de ROI */}
                <Line
                  yAxisId="percentage"
                  type="monotone"
                  dataKey="roi"
                  name="📈 ROI (%)"
                  stroke="#B695BF"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{
                    stroke: "#B695BF",
                    strokeWidth: 2,
                    r: 4,
                    fill: "#212026",
                  }}
                  activeDot={{
                    stroke: "#B695BF",
                    strokeWidth: 3,
                    r: 7,
                    fill: "#212026",
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Footer con insights */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-white/60">
                📅 Período: <span className="text-white font-medium">{data[0]?.periodo} - {data[data.length - 1]?.periodo}</span>
              </span>
              <span className="text-white/60">
                📊 Meses analizados: <span className="text-white font-medium">{data.length}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                🎯 Eficiencia: <span className={`font-semibold ${roiPromedio >= 50 ? 'text-[#51590E]' : roiPromedio >= 0 ? 'text-[#FFD700]' : 'text-[#D94854]'}`}>
                  {roiPromedio >= 50 ? 'Excelente' : roiPromedio >= 20 ? 'Buena' : roiPromedio >= 0 ? 'Moderada' : 'Necesita mejora'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }