import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Palette } from "lucide-react";

interface SerieData {
  nombre: string;
  serie: number[];
  colorLinea?: string;
  visible?: boolean;
}

interface VentasChartMultiProps {
  fechas: string[];
  series: SerieData[];
  fechasCompra?: string[];
  modoComparacion: "colores" | "sucursales";
}

const coloresPorDefecto = [
  "#51590E", // 1. Verde oliva (global, fijo)
  "#D94854", // 2. Rojo
  "#B695BF", // 3. Violeta
  "#F23D5E", // 4. Rojo secundario
  "#FFD700", // 5. Dorado
  "#00D5D5", // 6. Azul aqua
  "#465005", // 7. Verde oscuro
  "#e327c4", // 8. Fucsia
  "#523b4e", // 9. Ciruela
  "#0febcd", // 10. Cyan vibrante
  "#0feb7d", // 11. Verde lima
  "#d4fc93", // 12. Verde pastel
  "#875f1e", // 13. Marrón
  "#2e2f69", // 14. Azul navy
  "#772f00", // 15. Marrón rojizo
  "#E67E22", // 16. Naranja
  "#9B59B6", // 17. Púrpura
  "#27AE60", // 18. Verde clásico
  "#F39C12", // 19. Amarillo mango
  "#2980B9", // 20. Azul fuerte
];

export const VentasChartMulti: React.FC<VentasChartMultiProps> = ({ 
  fechas, 
  series, 
  fechasCompra,
  modoComparacion
}) => {
  // Preparar datos para el gráfico
  const data = fechas.map((fecha, i) => {
    const point: any = { fecha: fecha.slice(5) }; // Solo MM-DD
    series.forEach((s) => {
      point[s.nombre] = s.serie[i] ?? 0;
    });
    // Agregar puntos de compra SIEMPRE en Y = 0
    if (fechasCompra?.includes(fecha)) {
      point.compra = 0; // ← SIEMPRE en Y = 0, no escalando
    } else {
      point.compra = null;
    }
    return point;
  });

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">
            {`Fecha: ${label}`}
          </p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === "compra" && entry.value) {
              return (
                <p key={index} className="text-[#e327c4] font-semibold">
                  🛒 Compra realizada
                </p>
              );
            }
            return (
              <p key={index} style={{ color: entry.color }} className="font-semibold">
                {`${entry.dataKey === "GLOBAL" ? "Ventas Globales" : `Color: ${entry.dataKey}`}: ${entry.value}`}
              </p>
            );
          })}
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <TrendingUp className="w-7 h-7 text-[#D94854]" />
              Evolución de Ventas - {modoComparacion === "colores" ? "Por Colores" : "Por Sucursales"}
            </h2>
            <p className="text-white/60">
              Análisis temporal de ventas {modoComparacion === "colores" ? "con comparativas por color" : "con comparativas por sucursal"} y fechas de compra
            </p>
          </div>
          

        </div>
      </div>

      {/* Leyenda personalizada */}
      <div className="px-6 py-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-[#B695BF]" />
          <span className="text-white/80 text-sm font-medium">
            Leyenda del gráfico - Modo: {modoComparacion === "colores" ? "Colores" : "Sucursales"}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {series.map((s, idx) => (
            <div
              key={s.nombre}
              className="flex items-center gap-2"
            >
              <div
                className="w-4 h-1 rounded-full"
                style={{ backgroundColor: coloresPorDefecto[idx % coloresPorDefecto.length] }}
              />
              <span className="text-white/80 text-sm font-medium">
                {s.nombre === "GLOBAL" 
                  ? "📊 Ventas Globales" 
                  : modoComparacion === "colores"
                    ? `🎨 ${s.nombre}`
                    : `🏢 ${s.nombre}`
                }
              </span>
            </div>
          ))}
          
          {/* Leyenda de puntos de compra */}
          {fechasCompra && fechasCompra.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e327c4] border-2 border-[#212026]" />
              <span className="text-white/80 text-sm font-medium">
                🛒 Fechas de compra
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div style={{ width: "100%", height: 450 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                stroke="rgba(255,255,255,0.3)"
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Líneas de ventas por color */}
              {series.map((s, idx) => (
                <Line
                  key={s.nombre}
                  type="monotone"
                  dataKey={s.nombre}
                  name={s.nombre === "GLOBAL" ? "Ventas Globales" : `Color: ${s.nombre}`}
                  stroke={coloresPorDefecto[idx % coloresPorDefecto.length]}
                  strokeWidth={s.nombre === "GLOBAL" ? 4 : 3}
                  dot={{
                    stroke: coloresPorDefecto[idx % coloresPorDefecto.length],
                    strokeWidth: 2,
                    r: s.nombre === "GLOBAL" ? 5 : 4,
                    fill: "#212026",
                  }}
                  activeDot={{
                    stroke: coloresPorDefecto[idx % coloresPorDefecto.length],
                    strokeWidth: 3,
                    r: 8,
                    fill: "#212026",
                  }}
                />
              ))}

              {/* Puntos de fechas de compra - SIEMPRE EN Y = 0 */}
              {fechasCompra && fechasCompra.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="compra"
                  name="Fechas de compra"
                  stroke="transparent"
                  strokeWidth={0}
                  dot={{
                    stroke: "#212026",
                    strokeWidth: 3,
                    r: 8,
                    fill: "#e327c4",
                  }}
                  activeDot={{
                    stroke: "#F23D5E",
                    strokeWidth: 3,
                    fill: "#e327c4",
                    r: 12,
                  }}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between text-sm flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-white/60">
              📅 Período: {fechas[0]?.slice(5)} - {fechas[fechas.length - 1]?.slice(5)}
            </div>
            {fechasCompra && fechasCompra.length > 0 && (
              <div className="text-white/60">
                🛒 {fechasCompra.length} fechas de compra
              </div>
            )}
          </div>
          
          <div className="text-white/60">
            📊 {fechas.length} días de datos
          </div>
        </div>
      </div>
    </div>
  );
};