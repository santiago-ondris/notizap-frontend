import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { TrendingUp, Building2 } from "lucide-react";

interface SucursalData {
  sucursal: string;
  serie: number[];
  color: string;
}

interface VentasResumenChartProps {
  fechas: string[];
  sucursales: SucursalData[];
  sucursalesSeleccionadas: string[];
  tipoVista: 'cantidad' | 'facturacion';
}

export const VentasResumenChart: React.FC<VentasResumenChartProps> = ({ 
  fechas, 
  sucursales,
  sucursalesSeleccionadas,
  tipoVista
}) => {
  // Filtrar sucursales: quitar "Sin Sucursal" y mostrar solo las seleccionadas + GLOBAL
  const sucursalesFiltradas = sucursales.filter(s => {
    if (s.sucursal === "GLOBAL") return true; // Siempre mostrar GLOBAL
    if (s.sucursal === "Sin Sucursal" || s.sucursal.toLowerCase().includes("sin sucursal")) return false; // Nunca mostrar Sin Sucursal
    return sucursalesSeleccionadas.includes(s.sucursal); // Solo las seleccionadas
  });
  
  // Preparar datos para el gráfico
  const data = fechas.map((fecha, i) => {
    const point: any = { fecha: fecha.slice(8) + '-' + fecha.slice(5, 7) }; // DD-MM
    sucursalesFiltradas.forEach((sucursal) => {
      point[sucursal.sucursal] = sucursal.serie[i] ?? 0;
    });
    return point;
  });

  // Calcular estadísticas globales
  const ventasGlobales = sucursalesFiltradas.find(s => s.sucursal === "GLOBAL");
  const totalVentas = ventasGlobales?.serie[ventasGlobales.serie.length - 1] ?? 0;
  const sucursalesSinGlobal = sucursalesFiltradas.filter(s => s.sucursal !== "GLOBAL");

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">
            📅 Fecha: {label}
          </p>
          {payload
            .sort((a: any, b: any) => {
              if (a.dataKey === "GLOBAL") return -1;
              if (b.dataKey === "GLOBAL") return 1;
              return b.value - a.value;
            })
            .map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="font-semibold text-sm">
                {entry.dataKey === "GLOBAL" 
                  ? `🌍 Global: ${tipoVista === 'cantidad' 
                      ? `${entry.value?.toLocaleString()} unid.`
                      : `$${entry.value?.toLocaleString()}`}`
                  : `🏢 ${entry.dataKey}: ${tipoVista === 'cantidad' 
                      ? `${entry.value?.toLocaleString()} unid.`
                      : `$${entry.value?.toLocaleString()}`}`
                }
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  // Leyenda personalizada
  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
        {payload
          .sort((a: any, b: any) => {
            if (a.dataKey === "GLOBAL") return -1;
            if (b.dataKey === "GLOBAL") return 1;
            return 0;
          })
          .map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-1 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/80 text-sm font-medium">
                {entry.dataKey === "GLOBAL" 
                  ? `🌍 ${tipoVista === 'cantidad' ? 'Ventas' : 'Facturación'} Globales` 
                  : `🏢 ${entry.dataKey}`
                }
              </span>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      {/* Header del gráfico */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#FF7675]" />
              {tipoVista === 'cantidad' ? 'Evolución Acumulada de Ventas' : 'Evolución Acumulada de Facturación'}
            </h2>
            <p className="text-white/60 mb-6">
              {tipoVista === 'cantidad' 
                ? '📈 Crecimiento acumulativo de unidades vendidas por sucursal'
                : '💰 Crecimiento acumulativo de facturación por sucursal'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#51590E]">
                {tipoVista === 'cantidad' 
                  ? totalVentas.toLocaleString()
                  : `$${totalVentas.toLocaleString()}`
                }
              </div>
              <div className="text-white/60 text-xs">
                {tipoVista === 'cantidad' ? 'Unidades Totales' : 'Facturación Total'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B695BF]">
                {sucursalesSinGlobal.length}
              </div>
              <div className="text-white/60 text-xs">Sucursales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D94854]">
                {fechas.length}
              </div>
              <div className="text-white/60 text-xs">Días</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div style={{ width: "100%", height: 500 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="fecha" 
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                stroke="rgba(255,255,255,0.3)"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                stroke="rgba(255,255,255,0.3)"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {/* Líneas de ventas por sucursal */}
              {sucursalesFiltradas.map((sucursal) => (
                <Line
                  key={sucursal.sucursal}
                  type="monotone"
                  dataKey={sucursal.sucursal}
                  name={sucursal.sucursal}
                  stroke={sucursal.color}
                  strokeWidth={sucursal.sucursal === "GLOBAL" ? 5 : 4}
                  dot={false}
                  activeDot={{
                    stroke: sucursal.color,
                    strokeWidth: 3,
                    r: 10,
                    fill: "#212026",
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer con ranking de sucursales */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between text-sm flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-white/60">
              📅 Período: {fechas[0]?.slice(8) + '-' + fechas[0]?.slice(5, 7)} - {fechas[fechas.length - 1]?.slice(8) + '-' + fechas[fechas.length - 1]?.slice(5, 7)}
            </div>
            <div className="text-white/60">
              🏆 Top sucursal: {
                sucursalesSinGlobal
                  .sort((a, b) => (b.serie[b.serie.length - 1] || 0) - (a.serie[a.serie.length - 1] || 0))[0]?.sucursal || "N/A"
              }
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white/60">
              📊 {fechas.length} días de datos
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#B695BF]" />
              <span className="text-white/60">
                💡 Las líneas muestran {tipoVista === 'cantidad' ? 'unidades' : 'facturación'} acumuladas • GLOBAL incluye todas las sucursales
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};