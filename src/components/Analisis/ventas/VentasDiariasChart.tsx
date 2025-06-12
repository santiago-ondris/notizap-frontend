import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { BarChart3, Calendar } from "lucide-react";

interface SucursalData {
  sucursal: string;
  serie: number[];
  color: string;
}

interface VentasDiariasChartProps {
  fechas: string[];
  sucursales: SucursalData[];
  sucursalesSeleccionadas: string[];
}

export const VentasDiariasChart: React.FC<VentasDiariasChartProps> = ({ 
  fechas, 
  sucursales,
  sucursalesSeleccionadas
}) => {
  // Filtrar sucursales: quitar GLOBAL, Sin Sucursal y mostrar solo las seleccionadas
  const sucursalesSinGlobal = sucursales.filter(s => 
    s.sucursal !== "GLOBAL" && 
    s.sucursal !== "Sin Sucursal" &&
    !s.sucursal.toLowerCase().includes("sin sucursal") &&
    sucursalesSeleccionadas.includes(s.sucursal)
  );

  // Convertir series acumuladas a ventas diarias
  const sucursalesDiarias = sucursalesSinGlobal.map(sucursal => {
    const ventasDiarias = sucursal.serie.map((valorAcumulado, index) => {
      if (index === 0) return valorAcumulado; // Primer día = valor inicial
      return valorAcumulado - sucursal.serie[index - 1]; // Resto = diferencia
    });

    return {
      ...sucursal,
      serie: ventasDiarias
    };
  });

  // Calcular el máximo de ventas diarias para fijar el eje Y
  const todasLasVentasDiarias = sucursalesDiarias.flatMap(s => s.serie);
  const maximoVentasDiarias = Math.max(...todasLasVentasDiarias);
  const limiteEjeY = maximoVentasDiarias + 10; // +10 para dar espacio arriba

  // Preparar datos para el gráfico
  const data = fechas.map((fecha, i) => {
    const point: any = { fecha: fecha.slice(8) + '-' + fecha.slice(5, 7) };
    sucursalesDiarias.forEach((sucursal) => {
      point[sucursal.sucursal] = sucursal.serie[i] ?? 0;
    });
    return point;
  });

  // Calcular estadísticas
  const totalDias = fechas.length;
  const promediosPorSucursal = sucursalesDiarias.map(s => ({
    sucursal: s.sucursal,
    promedio: s.serie.reduce((acc, val) => acc + val, 0) / s.serie.length,
    color: s.color
  }));

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">
            📅 Fecha: {label}
          </p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="font-semibold text-sm">
                🏢 {entry.dataKey}: {entry.value} ventas
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
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-1 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/80 text-sm font-medium">
              🏢 {entry.dataKey}
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
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <BarChart3 className="w-7 h-7 text-[#B695BF]" />
              Ventas Diarias por Sucursal
            </h2>
            <p className="text-white/60">
              📈 Evolución día a día de ventas por sucursal (sin acumular)
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D94854]">
                {maximoVentasDiarias}
              </div>
              <div className="text-white/60 text-xs">Máx. diario</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B695BF]">
                {sucursalesDiarias.length}
              </div>
              <div className="text-white/60 text-xs">Sucursales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#51590E]">
                {totalDias}
              </div>
              <div className="text-white/60 text-xs">Días</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div style={{ width: "100%", height: 450 }}>
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
                domain={[0, limiteEjeY]} // Eje Y fijo desde 0 hasta máximo + 10
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {/* Líneas de ventas diarias por sucursal */}
              {sucursalesDiarias.map((sucursal) => (
                <Line
                  key={sucursal.sucursal}
                  type="monotone"
                  dataKey={sucursal.sucursal}
                  name={sucursal.sucursal}
                  stroke={sucursal.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    stroke: sucursal.color,
                    strokeWidth: 2,
                    r: 10,
                    fill: "#212026",
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Promedios por sucursal */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B695BF]" />
          Promedio de ventas diarias por sucursal
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {promediosPorSucursal
            .sort((a, b) => b.promedio - a.promedio)
            .map((item) => (
              <div key={item.sucursal} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/80 text-sm font-medium">
                    {item.sucursal}
                  </span>
                </div>
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  {item.promedio.toFixed(1)}
                </div>
                <div className="text-white/50 text-xs">
                  unidades/día
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer con información */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between text-sm flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-white/60">
            📅 Período: {fechas[0]?.slice(8) + '-' + fechas[0]?.slice(5, 7)} - {fechas[fechas.length - 1]?.slice(8) + '-' + fechas[fechas.length - 1]?.slice(5, 7)}
            </div>
            <div className="text-white/60">
              📊 Rango Y: 0 - {limiteEjeY} unidades
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-white/60">
              🎯 Mejor día: {
                promediosPorSucursal.length > 0 
                  ? promediosPorSucursal.sort((a, b) => b.promedio - a.promedio)[0].sucursal
                  : "N/A"
              }
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#B695BF]" />
              <span className="text-white/60">Vista diaria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};