import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Target,
  Loader2,
  Info
} from 'lucide-react';
import type { UnidadPerformanceData } from '@/types/publicidad/dashboard';
import { dashboardService } from '@/services/publicidad/dashboardService';

interface UnidadPerformanceChartProps {
  data: UnidadPerformanceData[];
  isLoading?: boolean;
  height?: number;
  title?: string;
  showComparison?: boolean;
}

type ChartType = 'bar' | 'pie';
type MetricType = 'gasto' | 'performance' | 'campañas' | 'followers';

const UnidadPerformanceChart: React.FC<UnidadPerformanceChartProps> = ({
  data,
  isLoading = false,
  height = 400,
  title = "🏢 Performance por Unidad",
  showComparison = true
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('gasto');

  // Configuración de métricas
  const metricConfigs = {
    gasto: {
      label: 'Gasto Total',
      key: 'gasto' as keyof UnidadPerformanceData,
      format: 'currency',
      icon: Target,
      color: '#D94854'
    },
    performance: {
      label: 'Performance',
      key: 'performance' as keyof UnidadPerformanceData,
      format: 'number',
      icon: TrendingUp,
      color: '#51590E'
    },
    campañas: {
      label: 'Campañas',
      key: 'campañas' as keyof UnidadPerformanceData,
      format: 'number',
      icon: BarChart3,
      color: '#B695BF'
    },
    followers: {
      label: 'Followers',
      key: 'followers' as keyof UnidadPerformanceData,
      format: 'number',
      icon: Users,
      color: '#e327c4'
    }
  };

  const currentMetric = metricConfigs[selectedMetric];

  // Formatear valores según el tipo
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return dashboardService.formatCurrency(value);
      case 'number':
        return dashboardService.formatNumber(value);
      case 'percentage':
        return dashboardService.formatPercentage(value);
      default:
        return value.toString();
    }
  };

  // Tooltip personalizado para gráfico de barras
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as UnidadPerformanceData;

    return (
      <div className="bg-[#212026] border border-white/20 rounded-lg p-4 shadow-lg min-w-[200px]">
        <p className="text-sm font-semibold text-white mb-3 capitalize">{label}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Gasto Total</span>
            <span className="text-xs font-medium text-white">
              {dashboardService.formatCurrency(data.gasto)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">% del Total</span>
            <span className="text-xs font-medium text-white">
              {data.porcentaje.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Cambio vs Anterior</span>
            <div className="flex items-center gap-1">
              {data.cambio > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : data.cambio < 0 ? (
                <TrendingDown className="w-3 h-3 text-red-400" />
              ) : null}
              <span className={`text-xs font-medium ${
                data.cambio > 0 ? 'text-green-400' : 
                data.cambio < 0 ? 'text-red-400' : 'text-white/60'
              }`}>
                {data.cambio > 0 ? '+' : ''}{data.cambio.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Campañas</span>
              <span className="text-xs text-white/80">{data.campañas}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Performance</span>
              <span className="text-xs text-white/80">{data.performance.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Followers</span>
              <span className="text-xs text-white/80">{data.followers}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Tooltip personalizado para gráfico de torta
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as UnidadPerformanceData;

    return (
      <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white mb-2 capitalize">{data.unidad}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-white/70">{currentMetric.label}</span>
          <span className="text-xs font-medium text-white">
            {formatValue(data[currentMetric.key] as number, currentMetric.format)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 mt-1">
          <span className="text-xs text-white/60">Porcentaje</span>
          <span className="text-xs text-white/80">{data.porcentaje.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  // Datos para el gráfico de torta
  const pieData = data.map(item => ({
    ...item,
    value: item[currentMetric.key] as number,
    name: item.unidad
  }));

  // Calcular totales para estadísticas
  const totalGasto = data.reduce((sum, item) => sum + item.gasto, 0);
  const totalCampañas = data.reduce((sum, item) => sum + item.campañas, 0);
  const totalFollowers = data.reduce((sum, item) => sum + item.followers, 0);
  const avgPerformance = data.length > 0 
    ? data.reduce((sum, item) => sum + item.performance, 0) / data.length 
    : 0;

  // Mejor y peor unidad
  const mejorUnidad = data.reduce((best, current) => 
    current.performance > best.performance ? current : best, data[0]);
  const peorUnidad = data.reduce((worst, current) => 
    current.performance < worst.performance ? current : worst, data[0]);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Cargando performance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-sm text-white/60">No hay datos de performance disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de métrica */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            {Object.entries(metricConfigs).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key as MetricType)}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedMetric === key
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                <config.icon className="w-3 h-3" />
                <span>{config.label}</span>
              </button>
            ))}
          </div>

          {/* Selector de tipo de gráfico */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-all ${
                chartType === 'bar'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md transition-all ${
                chartType === 'pie'
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico principal */}
        <div className="lg:col-span-2" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="unidad"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                  tickFormatter={(value) => formatValue(value, currentMetric.format)}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar 
                  dataKey={currentMetric.key}
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color }} className="text-sm">
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  )}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Panel de estadísticas */}
        <div className="space-y-4">
          {/* Resumen general */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Resumen General
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Gasto Total</span>
                <span className="text-xs font-medium text-white">
                  {dashboardService.formatCurrency(totalGasto)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Total Campañas</span>
                <span className="text-xs font-medium text-white">{totalCampañas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Total Followers</span>
                <span className="text-xs font-medium text-white">{totalFollowers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/60">Performance Promedio</span>
                <span className="text-xs font-medium text-white">{avgPerformance.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Mejores y peores */}
          {showComparison && data.length > 1 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white/80 mb-3">🏆 Comparativa</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Mejor Performance</span>
                  </div>
                  <div className="ml-5">
                    <div className="text-xs font-medium text-white capitalize">{mejorUnidad.unidad}</div>
                    <div className="text-xs text-white/60">{mejorUnidad.performance.toFixed(1)} puntos</div>
                  </div>
                </div>
                
                {mejorUnidad !== peorUnidad && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">Menor Performance</span>
                    </div>
                    <div className="ml-5">
                      <div className="text-xs font-medium text-white capitalize">{peorUnidad.unidad}</div>
                      <div className="text-xs text-white/60">{peorUnidad.performance.toFixed(1)} puntos</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unidades individuales */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white/80 mb-3">📊 Por Unidad</h4>
            <div className="space-y-3">
              {data.map(unidad => (
                <div key={unidad.unidad} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: unidad.color }}
                    />
                    <span className="text-xs text-white/80 capitalize">{unidad.unidad}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white">
                      {formatValue(unidad[currentMetric.key] as number, currentMetric.format)}
                    </div>
                    <div className="text-xs text-white/60">{unidad.porcentaje.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnidadPerformanceChart;