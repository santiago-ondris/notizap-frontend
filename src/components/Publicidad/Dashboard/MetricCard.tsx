import React from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import type { MetricCardProps } from '@/types/publicidad/dashboard';
import { dashboardService } from '@/services/publicidad/dashboardService';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  format,
  icon: Icon,
  color,
  isLoading = false
}) => {
  // Calcular cambio porcentual
  const percentageChange = previousValue && previousValue !== 0 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;

  // Determinar tendencia
  const trendIcon = dashboardService.getTrendIcon(percentageChange);
  const trendColor = dashboardService.getTrendColor(percentageChange);

  // Formatear valor principal
  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return dashboardService.formatCurrency(val);
      case 'percentage':
        return dashboardService.formatPercentage(val);
      case 'number':
        return dashboardService.formatNumber(val);
      default:
        return val.toString();
    }
  };

  // Formatear valor anterior
  const formatPreviousValue = (val: number): string => {
    if (format === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return dashboardService.formatNumber(val);
  };

  const TrendIcon = trendIcon === 'up' ? TrendingUp : 
                   trendIcon === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 transition-all hover:bg-white/15">
      {/* Header con ícono y título */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
          >
            <Icon 
              className="w-5 h-5" 
              style={{ color }}
            />
          </div>
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
        </div>

        {/* Indicador de tendencia */}
        {previousValue !== undefined && !isLoading && (
          <div className="flex items-center gap-1">
            <TrendIcon 
              className="w-4 h-4" 
              style={{ color: trendColor }}
            />
            <span 
              className="text-xs font-medium"
              style={{ color: trendColor }}
            >
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        ) : (
          <div 
            className="text-2xl font-bold"
            style={{ color }}
          >
            {formatValue(value)}
          </div>
        )}
      </div>

      {/* Comparación con período anterior */}
      {previousValue !== undefined && !isLoading && (
        <div className="text-xs text-white/60">
          <span>vs {formatPreviousValue(previousValue)} anterior</span>
        </div>
      )}

      {/* Texto adicional para porcentajes */}
      {format === 'percentage' && !isLoading && (
        <div className="text-xs text-white/50 mt-1">
          CTR promedio
        </div>
      )}

      {/* Loading state overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/5 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/40" />
        </div>
      )}
    </div>
  );
};

export default MetricCard;