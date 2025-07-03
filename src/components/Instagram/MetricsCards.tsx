import React from 'react';
import { Users, Heart, Image, Eye } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/utils/instagram/formatters';
import MetricCard from './MetricCard';
import type { MetricasGenerales } from '@/types/instagram/dashboard';

interface MetricsCardsProps {
  metricas: MetricasGenerales;
  className?: string;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  metricas, 
  className = '' 
}) => {
  /**
   * Configuración de métricas principales
   */
  const metricsConfig = [
    {
      id: 'seguidores',
      title: 'Seguidores',
      value: formatNumber(metricas.seguidoresActuales),
      subtitle: 'Total actual',
      icon: <Users className="w-5 h-5" />,
      trend: {
        value: metricas.porcentajeCrecimientoSemanal,
        label: `${formatPercentage(metricas.porcentajeCrecimientoSemanal)} esta semana`,
        isPositive: metricas.porcentajeCrecimientoSemanal > 0,
        isNeutral: Math.abs(metricas.porcentajeCrecimientoSemanal) < 0.1
      },
      color: '#B695BF', // Violeta para seguidores
      bgGradient: 'from-[#B695BF]/20 to-[#B695BF]/5'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      value: `${metricas.engagementPromedio.toFixed(1)}%`,
      subtitle: 'Promedio del período',
      icon: <Heart className="w-5 h-5" />,
      trend: {
        value: 0, // Se calculará con datos históricos en futuras iteraciones
        label: 'vs período anterior',
        isPositive: metricas.engagementPromedio > 2.5,
        isNeutral: false
      },
      color: '#D94854', // Rojo para engagement
      bgGradient: 'from-[#D94854]/20 to-[#D94854]/5'
    },
    {
      id: 'publicaciones',
      title: 'Publicaciones',
      value: metricas.totalPublicacionesPeriodo.toString(),
      subtitle: 'En el período',
      icon: <Image className="w-5 h-5" />,
      trend: {
        value: 0,
        label: 'contenido total',
        isPositive: metricas.totalPublicacionesPeriodo > 20,
        isNeutral: true
      },
      color: '#51590E', // Verde oliva para publicaciones
      bgGradient: 'from-[#51590E]/20 to-[#51590E]/5'
    },
    {
      id: 'alcance',
      title: 'Alcance',
      value: formatNumber(metricas.alcancePromedio),
      subtitle: 'Promedio por post',
      icon: <Eye className="w-5 h-5" />,
      trend: {
        value: 0,
        label: 'personas alcanzadas',
        isPositive: metricas.alcancePromedio > metricas.seguidoresActuales * 0.3,
        isNeutral: false
      },
      color: '#F23D5E', // Rojo secundario para alcance
      bgGradient: 'from-[#F23D5E]/20 to-[#F23D5E]/5'
    }
  ];

  /**
   * Obtiene el color de tendencia
   */
  const getTrendColor = (isPositive: boolean, isNeutral: boolean) => {
    if (isNeutral) return 'text-white/60';
    return isPositive ? 'text-[#51590E]' : 'text-[#D94854]';
  };

  /**
   * Calcula insights rápidos
   */
  const getQuickInsights = () => {
    const insights = [];

    // Insight de crecimiento
    if (metricas.porcentajeCrecimientoSemanal > 2) {
      insights.push(`🚀 Excelente crecimiento de seguidores`);
    } else if (metricas.porcentajeCrecimientoSemanal < -1) {
      insights.push(`⚠️ Pérdida de seguidores esta semana`);
    }

    // Insight de engagement
    if (metricas.engagementPromedio > 4) {
      insights.push(`🎯 Engagement excepcional`);
    } else if (metricas.engagementPromedio < 1.5) {
      insights.push(`📈 Oportunidad de mejorar engagement`);
    }

    // Insight de actividad
    if (metricas.totalPublicacionesPeriodo > 30) {
      insights.push(`📸 Alta actividad de publicación`);
    } else if (metricas.totalPublicacionesPeriodo < 10) {
      insights.push(`⏰ Considerar aumentar frecuencia`);
    }

    return insights;
  };

  const insights = getQuickInsights();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grid de métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsConfig.map((metric) => {

          return (
            <MetricCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              icon={metric.icon}
              trend={metric.trend.value !== 0 ? {
                value: metric.trend.value,
                isPositive: metric.trend.isPositive
              } : undefined}
              className={`bg-gradient-to-br ${metric.bgGradient} border-[${metric.color}]/20`}
              iconColor={metric.color}
            />
          );
        })}
      </div>

      {/* Insights rápidos */}
      {insights.length > 0 && (
        <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
            💡 Insights rápidos
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="text-xs text-white/70 bg-white/5 rounded-lg px-3 py-2 border border-white/10"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas adicionales en formato compacto */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Interacciones</div>
          <div className="text-lg font-semibold text-white">
            {formatNumber(metricas.totalInteracciones)}
          </div>
        </div>

        <div className="text-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Crecimiento</div>
          <div className={`text-lg font-semibold ${getTrendColor(
            metricas.crecimientoSemanal > 0, 
            metricas.crecimientoSemanal === 0
          )}`}>
            {metricas.crecimientoSemanal > 0 ? '+' : ''}{metricas.crecimientoSemanal}
          </div>
        </div>

        <div className="text-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Posts/día</div>
          <div className="text-lg font-semibold text-white">
            {(metricas.totalPublicacionesPeriodo / 30).toFixed(1)}
          </div>
        </div>

        <div className="text-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="text-sm text-white/60 mb-1">Efectividad</div>
          <div className="text-lg font-semibold text-white">
            {metricas.alcancePromedio > 0 ? 
              Math.round((metricas.alcancePromedio / metricas.seguidoresActuales) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;