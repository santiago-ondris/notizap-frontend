import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { BarChart3, TrendingDown } from "lucide-react";

interface SucursalData {
  sucursal: string;
  serie: number[];
  color: string;
}

interface VentasDiariasChartProps {
  fechas: string[];
  sucursales: SucursalData[];
  sucursalesSeleccionadas: string[];
  tipoVista: 'cantidad' | 'facturacion';
}

export const VentasDiariasChart: React.FC<VentasDiariasChartProps> = ({ 
  fechas, 
  sucursales,
  sucursalesSeleccionadas,
  tipoVista
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
      if (index === 0) return valorAcumulado;
      return Math.max(0, valorAcumulado - sucursal.serie[index - 1]);
    });
    
    return {
      ...sucursal,
      serie: ventasDiarias
    };
  });

  // Preparar datos para el gráfico
  const data = fechas.map((fecha, i) => {
    const point: any = { fecha: fecha.slice(8) + '-' + fecha.slice(5, 7) }; // DD-MM
    sucursalesDiarias.forEach((sucursal) => {
      point[sucursal.sucursal] = sucursal.serie[i] ?? 0;
    });
    return point;
  });

  // Calcular estadísticas
  const maxVentaDiaria = Math.max(
    ...sucursalesDiarias.flatMap(s => s.serie)
  );

  const promedioVentas = sucursalesDiarias.map(sucursal => {
    const total = sucursal.serie.reduce((acc, val) => acc + val, 0);
    return {
      sucursal: sucursal.sucursal,
      promedio: total / sucursal.serie.length
    };
  });

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalDia = payload.reduce((acc: number, entry: any) => acc + entry.value, 0);
      
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">
            📅 Fecha: {label}
          </p>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="font-semibold text-sm">
                🏢 {entry.dataKey}: {tipoVista === 'cantidad' 
                  ? `${entry.value?.toLocaleString()} unid.`
                  : `$${entry.value?.toLocaleString()}`}
              </p>
            ))}
          <div className="border-t border-white/20 mt-2 pt-2">
            <p className="text-white/80 font-medium text-sm">
              📊 Total del día: {tipoVista === 'cantidad' 
                ? `${totalDia.toLocaleString()} unid.`
                : `$${totalDia.toLocaleString()}`}
            </p>
          </div>
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
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#B695BF]" />
              {tipoVista === 'cantidad' ? 'Ventas Diarias por Sucursal' : 'Facturación Diaria por Sucursal'}
            </h2>
            <p className="text-white/60 mb-6">
              {tipoVista === 'cantidad' 
                ? '📊 Evolución día a día de unidades vendidas por sucursal (sin acumular)'
                : '💰 Evolución día a día de facturación por sucursal (sin acumular)'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B695BF]">
                {tipoVista === 'cantidad' 
                  ? maxVentaDiaria.toLocaleString()
                  : `$${maxVentaDiaria.toLocaleString()}`}
              </div>
              <div className="text-white/60 text-xs">Máx. diario</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#51590E]">
                {sucursalesDiarias.length}
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
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            >
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
                domain={[0, 'dataMax']}
                tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                stroke="rgba(255,255,255,0.3)"
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
                  strokeWidth={4}
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

      {/* Footer con promedios */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="space-y-3">
          {/* Primera fila - Info general */}
          <div className="flex items-center justify-between text-sm flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-white/60">
                📅 Período: {fechas[0]?.slice(8) + '-' + fechas[0]?.slice(5, 7)} - {fechas[fechas.length - 1]?.slice(8) + '-' + fechas[fechas.length - 1]?.slice(5, 7)}
              </div>
              <div className="text-white/60">
                🏆 Mejor día: {tipoVista === 'cantidad' 
                  ? `${maxVentaDiaria.toLocaleString()} unid.`
                  : `$${maxVentaDiaria.toLocaleString()}`}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#B695BF]" />
              <span className="text-white/60">
                💡 Las líneas muestran {tipoVista === 'cantidad' ? 'unidades' : 'facturación'} diarias (sin acumular)
              </span>
            </div>
          </div>

          {/* Segunda fila - Promedios por sucursal */}
          {promedioVentas.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <div className="text-white/70 text-xs mb-2">📊 Promedio diario por sucursal:</div>
              <div className="flex flex-wrap gap-4 text-xs">
                {promedioVentas
                  .sort((a, b) => b.promedio - a.promedio)
                  .map((item) => (
                    <div key={item.sucursal} className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: sucursalesDiarias.find(s => s.sucursal === item.sucursal)?.color 
                        }}
                      />
                      <span className="text-white/60">
                        {item.sucursal}: {tipoVista === 'cantidad' 
                          ? `${Math.round(item.promedio).toLocaleString()} unid.`
                          : `$${Math.round(item.promedio).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};