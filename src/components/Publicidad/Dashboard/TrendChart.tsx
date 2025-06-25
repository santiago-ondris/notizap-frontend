import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { TrendChartData } from '@/types/publicidad/dashboard';
import { dashboardService } from '@/services/publicidad/dashboardService';

interface TrendChartProps {
  data: TrendChartData[];
  isLoading?: boolean;
  showUnidades?: boolean;
  showPlataformas?: boolean;
  height?: number;
  title?: string;
}

type LineVisibility = {
  gastoTotal: boolean;
  gastoMontella: boolean;
  gastoAlenka: boolean;
  gastoKids: boolean;
  gastoMeta: boolean;
  gastoGoogle: boolean;
};

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  isLoading = false,
  showUnidades = true,
  showPlataformas = true,
  height = 400,
  title = "📈 Tendencia de Gastos"
}) => {
  const [lineVisibility, setLineVisibility] = useState<LineVisibility>({
    gastoTotal: true,
    gastoMontella: showUnidades,
    gastoAlenka: showUnidades,
    gastoKids: showUnidades,
    gastoMeta: showPlataformas,
    gastoGoogle: showPlataformas
  });

  const toggleLineVisibility = (line: keyof LineVisibility) => {
    setLineVisibility(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  // Configuración de líneas
  const lineConfigs = [
    {
      key: 'gastoTotal' as keyof TrendChartData,
      name: 'Total',
      color: '#3B82F6',
      strokeWidth: 4,
      visible: lineVisibility.gastoTotal,
      type: 'total' as const
    },
    {
      key: 'gastoMontella' as keyof TrendChartData,
      name: 'Montella',
      color: '#EF4444',
      strokeWidth: 3,
      visible: lineVisibility.gastoMontella && showUnidades,
      type: 'unidad' as const
    },
    {
      key: 'gastoAlenka' as keyof TrendChartData,
      name: 'Alenka',
      color: '#10B981',
      strokeWidth: 3,
      visible: lineVisibility.gastoAlenka && showUnidades,
      type: 'unidad' as const
    },
    {
      key: 'gastoKids' as keyof TrendChartData,
      name: 'Kids',
      color: '#F59E0B',
      strokeWidth: 3,
      visible: lineVisibility.gastoKids && showUnidades,
      type: 'unidad' as const
    },
    {
      key: 'gastoMeta' as keyof TrendChartData,
      name: 'Meta',
      color: '#8B5CF6',
      strokeWidth: 2,
      visible: lineVisibility.gastoMeta && showPlataformas,
      type: 'plataforma' as const,
      strokeDasharray: "5 5"
    },
    {
      key: 'gastoGoogle' as keyof TrendChartData,
      name: 'Google',
      color: '#06B6D4',
      strokeWidth: 2,
      visible: lineVisibility.gastoGoogle && showPlataformas,
      type: 'plataforma' as const,
      strokeDasharray: "5 5"
    }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as TrendChartData;

    return (
      <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white mb-2">{`${label} ${data.año}`}</p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-1 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-white/70">{entry.name}</span>
              </div>
              <span className="text-xs font-medium text-white">
                {dashboardService.formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Campañas</span>
            <span className="text-xs text-white/80">{data.totalCampañas}</span>
          </div>
        </div>
      </div>
    );
  };

  // Custom legend con controles de visibilidad
  const CustomLegend = () => (
    <div className="flex flex-wrap gap-4 justify-center mb-4">
      {lineConfigs.map(config => {
        if ((config.type === 'unidad' && !showUnidades) || 
            (config.type === 'plataforma' && !showPlataformas)) {
          return null;
        }

        return (
          <button
            key={config.key}
            onClick={() => toggleLineVisibility(config.key as keyof LineVisibility)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all text-xs font-medium ${
              config.visible 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-white/5 border border-white/10 opacity-50'
            }`}
          >
            {config.visible ? (
              <Eye className="w-3 h-3" style={{ color: config.color }} />
            ) : (
              <EyeOff className="w-3 h-3 text-white/40" />
            )}
            <div 
              className="w-4 h-1 rounded-full"
              style={{ 
                backgroundColor: config.visible ? config.color : '#6B7280',
                ...(config.strokeDasharray && { 
                  backgroundImage: config.visible 
                    ? `repeating-linear-gradient(90deg, ${config.color} 0px, ${config.color} 3px, transparent 3px, transparent 6px)`
                    : 'repeating-linear-gradient(90deg, #6B7280 0px, #6B7280 3px, transparent 3px, transparent 6px)'
                })
              }}
            />
            <span style={{ color: config.visible ? config.color : '#9CA3AF' }}>
              {config.name}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Calcular promedio para línea de referencia
  const totalValues = data.map(d => d.gastoTotal).filter(v => v > 0);
  const averageSpend = totalValues.length > 0 
    ? totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length 
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            <p className="text-sm text-white/60">Cargando tendencias...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-sm text-white/60">No hay datos de tendencia disponibles</p>
            <p className="text-xs text-white/40 mt-2">Prueba ajustando los filtros de fecha</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-white/60" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        {/* Resumen rápido */}
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="text-center">
            <div className="text-white/80 font-medium">
              {dashboardService.formatCurrency(averageSpend)}
            </div>
            <div>Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-white/80 font-medium">
              {data.length}
            </div>
            <div>Períodos</div>
          </div>
        </div>
      </div>

      {/* Leyenda personalizada */}
      <CustomLegend />

      {/* Gráfico */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255,255,255,0.1)" 
              vertical={false}
            />
            <XAxis 
              dataKey="mesCorto"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              tickFormatter={(value) => dashboardService.formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Línea de referencia del promedio */}
            {averageSpend > 0 && (
              <ReferenceLine 
                y={averageSpend} 
                stroke="rgba(255,255,255,0.3)" 
                strokeDasharray="2 2"
                label={{ 
                  value: "Promedio", 
                  position: "insideTopRight",
                  fill: "rgba(255,255,255,0.5)",
                  fontSize: 10
                }}
              />
            )}
            
            {/* Líneas de datos */}
            {lineConfigs.map(config => 
              config.visible && (
                <Line
                  key={config.key}
                  type="monotone"
                  dataKey={config.key}
                  stroke={config.color}
                  strokeWidth={config.strokeWidth}
                  strokeDasharray={config.strokeDasharray}
                  dot={{ 
                    fill: config.color, 
                    strokeWidth: 2, 
                    r: config.type === 'total' ? 6 : 4 
                  }}
                  activeDot={{ 
                    r: config.type === 'total' ? 8 : 6, 
                    stroke: config.color, 
                    strokeWidth: 2,
                    fill: config.color
                  }}
                  connectNulls={false}
                />
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer con información adicional */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
        <div>
          💡 Haz clic en las leyendas para mostrar/ocultar líneas
        </div>
        <div>
          Líneas punteadas: plataformas | Líneas sólidas: unidades
        </div>
      </div>
    </div>
  );
};

export default TrendChart;