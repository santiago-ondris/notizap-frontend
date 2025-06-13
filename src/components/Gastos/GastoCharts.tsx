import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import type { GastoTendencia, GastoPorCategoria, Gasto } from '../../types/gastos';
import { CATEGORIA_CONFIG } from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastoChartsProps {
  tendencia: GastoTendencia[];
  porCategoria: GastoPorCategoria[];
  topGastos?: Gasto[];
  isLoading?: boolean;
}

export const GastoCharts: React.FC<GastoChartsProps> = ({
  tendencia,
  porCategoria,
  topGastos = [],
  isLoading = false
}) => {

  // Colores para gráficos (siguiendo la paleta de Notizap)
  const coloresPaleta = [
    '#51590E', // Verde oliva (GLOBAL)
    '#D94854', // Rojo principal
    '#B695BF', // Violeta
    '#F23D5E', // Rojo secundario
    '#FFD700', // Dorado
    '#00D5D5', // Azul aqua
    '#465005', // Verde oscuro
    '#e327c4', // Fucsia
    '#523b4e', // Ciruela
    '#0febcd'  // Cyan vibrante
  ];

  // Tooltip personalizado para todos los gráficos
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white/80 text-sm mb-1">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-white font-medium">
              <span style={{ color: item.color }}>●</span>
              {' '}{item.name}: {formatter ? formatter(item.value) : item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Formatear monto para tooltips
  const formatearMontoTooltip = (value: number) => GastoService.formatearMonto(value);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/20 rounded mb-4" />
            <div className="h-64 bg-white/20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Tendencia mensual */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">📈 Tendencia Mensual</h3>
            <p className="text-sm text-white/60">Evolución de gastos en el tiempo</p>
          </div>
        </div>

        {tendencia.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No hay datos de tendencia disponibles</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tendencia}>
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#51590E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#51590E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="mesNombre" 
                stroke="rgba(255,255,255,0.7)" 
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                content={<CustomTooltip formatter={formatearMontoTooltip} />}
              />
              <Area
                type="monotone"
                dataKey="totalMonto"
                stroke="#51590E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMonto)"
                name="Total gastado"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gastos por categoría - Pie Chart */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <PieChartIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">🥧 Por Categoría</h3>
              <p className="text-sm text-white/60">Distribución del presupuesto</p>
            </div>
          </div>

          {porCategoria.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/60">
              <div className="text-center">
                <div className="text-4xl mb-2">🏷️</div>
                <p>No hay datos por categoría</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-4">
              {/* Gráfico de torta */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={porCategoria}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="totalMonto"
                    >
                      {porCategoria.map((entry, index) => {
                        const categoriaConfig = CATEGORIA_CONFIG[entry.categoria as keyof typeof CATEGORIA_CONFIG];
                        const color = categoriaConfig?.color || coloresPaleta[index % coloresPaleta.length];
                        
                        return (
                          <Cell key={`cell-${index}`} fill={color} />
                        );
                      })}
                    </Pie>
                    <Tooltip 
                      content={<CustomTooltip formatter={(value: number) => 
                        `${formatearMontoTooltip(value)} (${porCategoria.find(c => c.totalMonto === value)?.porcentaje.toFixed(1)}%)`
                      } />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda */}
              <div className="flex-1 space-y-2">
                {porCategoria.slice(0, 6).map((categoria, index) => {
                  const categoriaConfig = CATEGORIA_CONFIG[categoria.categoria as keyof typeof CATEGORIA_CONFIG];
                  const color = categoriaConfig?.color || coloresPaleta[index % coloresPaleta.length];
                  
                  return (
                    <div key={categoria.categoria} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-white/80 truncate">
                          {categoriaConfig?.emoji} {categoria.categoria}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {GastoService.formatearMonto(categoria.totalMonto)}
                        </div>
                        <div className="text-xs text-white/50">
                          {categoria.porcentaje.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Top gastos - Bar Chart */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">🏆 Top Gastos</h3>
              <p className="text-sm text-white/60">Los 5 gastos más altos</p>
            </div>
          </div>

          {topGastos.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/60">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <p>No hay datos de top gastos</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topGastos.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number"
                  stroke="rgba(255,255,255,0.7)" 
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="nombre"
                  stroke="rgba(255,255,255,0.7)" 
                  fontSize={12}
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip 
                  content={<CustomTooltip formatter={formatearMontoTooltip} />}
                />
                <Bar 
                  dataKey="monto" 
                  fill="#D94854"
                  radius={[0, 4, 4, 0]}
                  name="Monto"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Comparación cantidad vs monto - Combo Chart */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">📊 Análisis Mensual Detallado</h3>
            <p className="text-sm text-white/60">Cantidad de gastos vs monto total por mes</p>
          </div>
        </div>

        {tendencia.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>No hay datos de análisis mensual</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="mesNombre" 
                stroke="rgba(255,255,255,0.7)" 
                fontSize={12}
              />
              <YAxis 
                yAxisId="monto"
                orientation="left"
                stroke="rgba(255,255,255,0.7)" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="cantidad"
                orientation="right"
                stroke="rgba(255,255,255,0.7)" 
                fontSize={12}
              />
              <Tooltip 
                content={<CustomTooltip />}
              />
              
              {/* Línea de monto total */}
              <Line
                yAxisId="monto"
                type="monotone"
                dataKey="totalMonto"
                stroke="#51590E"
                strokeWidth={3}
                dot={{ fill: '#51590E', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#51590E', strokeWidth: 2 }}
                name="Monto total"
              />
              
              {/* Línea de cantidad de gastos */}
              <Line
                yAxisId="cantidad"
                type="monotone"
                dataKey="cantidadGastos"
                stroke="#B695BF"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#B695BF', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#B695BF', strokeWidth: 2 }}
                name="Cantidad de gastos"
              />
              
              {/* Línea de promedio por gasto */}
              <Line
                yAxisId="monto"
                type="monotone"
                dataKey="promedioGasto"
                stroke="#F23D5E"
                strokeWidth={2}
                strokeDasharray="10 5"
                dot={{ fill: '#F23D5E', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F23D5E', strokeWidth: 2 }}
                name="Promedio por gasto"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Leyenda del gráfico combo */}
        <div className="flex flex-wrap justify-center gap-6 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#51590E] rounded-full" />
            <span className="text-sm text-white/70">Monto Total (Eje izq.)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#B695BF] rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #B695BF 0, #B695BF 5px, transparent 5px, transparent 10px)' }} />
            <span className="text-sm text-white/70">Cantidad (Eje der.)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-[#F23D5E] rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #F23D5E 0, #F23D5E 10px, transparent 10px, transparent 15px)' }} />
            <span className="text-sm text-white/70">Promedio (Eje izq.)</span>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      {(tendencia.length > 0 || porCategoria.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total acumulado */}
          {tendencia.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-400">
                {GastoService.formatearMonto(
                  tendencia.reduce((acc, mes) => acc + mes.totalMonto, 0)
                )}
              </div>
              <div className="text-xs text-white/60">Total Período</div>
            </div>
          )}

          {/* Promedio mensual */}
          {tendencia.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-2xl font-bold text-blue-400">
                {GastoService.formatearMonto(
                  tendencia.reduce((acc, mes) => acc + mes.totalMonto, 0) / tendencia.length
                )}
              </div>
              <div className="text-xs text-white/60">Promedio Mensual</div>
            </div>
          )}

          {/* Categoría top */}
          {porCategoria.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏷️</div>
              <div className="text-lg font-bold text-purple-400 truncate">
                {porCategoria[0].categoria}
              </div>
              <div className="text-xs text-white/60">
                {porCategoria[0].porcentaje.toFixed(1)}% del total
              </div>
            </div>
          )}

          {/* Gasto más alto */}
          {topGastos.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-lg font-bold text-orange-400">
                {GastoService.formatearMonto(topGastos[0].monto)}
              </div>
              <div className="text-xs text-white/60 truncate">
                {topGastos[0].nombre}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};