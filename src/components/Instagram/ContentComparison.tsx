import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Play, Image, Circle, Trophy } from 'lucide-react';
import { formatNumber, formatEngagement } from '@/utils/instagram/formatters';
import type { ComparativaContenido } from '@/types/instagram/dashboard';

interface ContentComparisonProps {
  data: ComparativaContenido;
  className?: string;
  variant?: 'bar' | 'pie' | 'mixed';
  showEngagement?: boolean;
}

const ContentComparison: React.FC<ContentComparisonProps> = ({
  data,
  className = '',
  variant = 'mixed',
  showEngagement = true
}) => {
  /**
   * Procesa datos para gráficos
   */
  const chartData = useMemo(() => {
    const types = [
      { key: 'reels', label: 'Reels', data: data.reels, icon: Play, color: '#D94854' },
      { key: 'posts', label: 'Posts', data: data.posts, icon: Image, color: '#B695BF' },
      { key: 'stories', label: 'Stories', data: data.stories, icon: Circle, color: '#51590E' }
    ];

    return types.map(type => ({
      name: type.label,
      engagement: type.data.engagementPromedio,
      publicaciones: type.data.totalPublicaciones,
      alcance: type.data.alcancePromedio,
      interacciones: type.data.interaccionesPromedio,
      mejor: type.data.mejorPerformance,
      color: type.color,
      icon: type.icon,
      metrica: type.data.tipoMetricaMejor
    }));
  }, [data]);

  /**
   * Encuentra el mejor performer
   */
  const bestPerformer = useMemo(() => {
    return chartData.reduce((best, current) => 
      current.engagement > best.engagement ? current : best
    );
  }, [chartData]);

  /**
   * Tooltip customizado
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const IconComponent = data.icon;

    return (
      <div className="bg-[#212026] border border-white/20 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className="w-4 h-4" style={{ color: data.color }} />
          <span className="text-sm font-medium text-white">{data.name}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-xs text-white/70">Engagement:</span>
            <span className="text-sm font-semibold text-white">
              {data.engagement.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-white/70">Publicaciones:</span>
            <span className="text-sm font-semibold text-white">
              {data.publicaciones}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-white/70">Alcance promedio:</span>
            <span className="text-sm font-semibold text-white">
              {formatNumber(data.alcance)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-white/70">Mejor {data.metrica}:</span>
            <span className="text-sm font-semibold text-white">
              {formatNumber(data.mejor)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza gráfico de barras
   */
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
        dataKey="engagement"
        radius={[4, 4, 0, 0]}
        fill="#8884d8"
        >
        {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  /**
   * Renderiza gráfico de pie
   */
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="engagement"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  /**
   * Renderiza cards de métricas
   */
  const renderMetricCards = () => (
    <div className="grid grid-cols-3 gap-3">
      {chartData.map((item) => {
        const IconComponent = item.icon;
        const engagement = formatEngagement(item.engagement);
        
        return (
          <div 
            key={item.name}
            className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg 
                       hover:bg-white/10 transition-all relative overflow-hidden"
          >
            {/* Indicador de mejor performer */}
            {item.name === bestPerformer.name && (
              <div className="absolute top-2 right-2">
                <Trophy className="w-4 h-4 text-[#FFD700]" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: `${item.color}20`,
                  border: `1px solid ${item.color}40`
                }}
              >
                <IconComponent className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{item.name}</h4>
                <p className="text-xs text-white/60">{item.publicaciones} publicaciones</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Engagement</span>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: engagement.color }}
                >
                  {engagement.value}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Alcance</span>
                <span className="text-sm font-medium text-white/80">
                  {formatNumber(item.alcance)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Mejor {item.metrica}</span>
                <span className="text-sm font-medium text-white/80">
                  {formatNumber(item.mejor)}
                </span>
              </div>
            </div>

            {/* Barra de progreso de engagement */}
            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full"
                style={{ 
                  width: `${Math.min((item.engagement / 5) * 100, 100)}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  /**
   * Renderiza insights
   */
  const renderInsights = () => {
    const totalPublicaciones = chartData.reduce((sum, item) => sum + item.publicaciones, 0);
    const engagementPromedio = chartData.reduce((sum, item) => sum + item.engagement, 0) / chartData.length;
    
    return (
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <h5 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
          💡 Insights
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="text-white/70">
            🏆 Mejor tipo: <span className="text-white font-medium">{bestPerformer.name}</span>
          </div>
          <div className="text-white/70">
            📊 Engagement promedio: <span className="text-white font-medium">{engagementPromedio.toFixed(1)}%</span>
          </div>
          <div className="text-white/70">
            📈 Total publicaciones: <span className="text-white font-medium">{totalPublicaciones}</span>
          </div>
          <div className="text-white/70">
            🎯 Distribución: <span className="text-white font-medium">
              {Math.round((bestPerformer.publicaciones / totalPublicaciones) * 100)}% {bestPerformer.name.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📊 Comparativa de Contenido
      </h3>

      {variant === 'bar' && renderBarChart()}
      {variant === 'pie' && renderPieChart()}
      {variant === 'mixed' && (
        <div className="space-y-4">
          {renderMetricCards()}
          {showEngagement && renderBarChart()}
        </div>
      )}

      {renderInsights()}
    </div>
  );
};

export default ContentComparison;