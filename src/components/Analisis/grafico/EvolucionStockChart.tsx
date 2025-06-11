// components/Analisis/grafico/EvolucionStockChart.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { type EvolucionStockPorPuntoDeVenta } from "@/types/analisis/analisis";

interface EvolucionStockChartProps {
  data: EvolucionStockPorPuntoDeVenta;
}

export const EvolucionStockChart: React.FC<EvolucionStockChartProps> = ({ data }) => {
  // Calcular estadísticas
  const stocks = data.evolucion.map((e) => e.stock);
  const minStock = Math.min(...stocks);
  const maxStock = Math.max(...stocks);
  const stockPromedio = stocks.reduce((acc, val) => acc + val, 0) / stocks.length;
  
  // Calcular tendencia (comparar primer y último valor)
  const primerStock = stocks[0];
  const ultimoStock = stocks[stocks.length - 1];
  const tendencia = ultimoStock > primerStock ? 'up' : ultimoStock < primerStock ? 'down' : 'stable';
  const variacionPorcentual = primerStock !== 0 ? ((ultimoStock - primerStock) / primerStock) * 100 : 0;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">
            {`Fecha: ${new Date(label).toLocaleDateString("es-AR")}`}
          </p>
          <p className="text-[#51590E] font-semibold">
            {`Stock: ${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header del gráfico */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-[#51590E]" />
              {data.puntoDeVenta}
            </h3>
            <p className="text-white/60 text-sm">
              Evolución temporal del stock - {data.evolucion.length} registros
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {tendencia === 'up' && <TrendingUp className="w-5 h-5 text-green-400" />}
            {tendencia === 'down' && <TrendingDown className="w-5 h-5 text-red-400" />}
            {tendencia === 'stable' && <Activity className="w-5 h-5 text-yellow-400" />}
            <span className={`font-semibold ${
              tendencia === 'up' ? 'text-green-400' :
              tendencia === 'down' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {variacionPorcentual > 0 ? '+' : ''}{variacionPorcentual.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-green-400 font-bold text-lg">{maxStock.toLocaleString()}</div>
            <div className="text-white/60 text-xs">Stock Máximo</div>
          </div>
          <div className="space-y-1">
            <div className="text-[#B695BF] font-bold text-lg">{Math.round(stockPromedio).toLocaleString()}</div>
            <div className="text-white/60 text-xs">Stock Promedio</div>
          </div>
          <div className="space-y-1">
            <div className="text-red-400 font-bold text-lg">{minStock.toLocaleString()}</div>
            <div className="text-white/60 text-xs">Stock Mínimo</div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={data.evolucion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                tickFormatter={(fecha) =>
                  new Date(fecha).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
                stroke="rgba(255,255,255,0.3)"
              />
              <YAxis
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                domain={["auto", "auto"]}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: "rgba(255,255,255,0.8)" }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="#51590E"
                strokeWidth={3}
                dot={{ 
                  r: 4, 
                  fill: "#51590E",
                  strokeWidth: 2,
                  stroke: "#B695BF"
                }}
                activeDot={{ 
                  r: 6, 
                  fill: "#B695BF",
                  strokeWidth: 2,
                  stroke: "#51590E"
                }}
                name="Stock"
              />
              
              {/* Línea de promedio */}
              <Line
                type="monotone"
                dataKey={() => stockPromedio}
                stroke="#B695BF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Promedio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/60">
            Período: {new Date(data.evolucion[0]?.fecha).toLocaleDateString()} - {new Date(data.evolucion[data.evolucion.length - 1]?.fecha).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#51590E]" />
              <span className="text-white/70 text-xs">Stock actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[#B695BF] opacity-60" style={{ borderTop: '2px dashed' }} />
              <span className="text-white/70 text-xs">Promedio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};