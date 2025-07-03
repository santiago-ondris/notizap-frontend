import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { MetricCardProps } from '@/types/instagram/indexIg';

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
  iconColor = '#B695BF',
  showTooltip = false,
  tooltipContent,
  onClick
}) => {
  /**
   * Obtiene el ícono de tendencia
   */
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (Math.abs(trend.value) < 0.1) {
      return <Minus className="w-3 h-3" />;
    }
    
    return trend.isPositive ? 
      <TrendingUp className="w-3 h-3" /> : 
      <TrendingDown className="w-3 h-3" />;
  };

  /**
   * Obtiene el color de la tendencia
   */
  const getTrendColor = () => {
    if (!trend) return 'text-white/50';
    
    if (Math.abs(trend.value) < 0.1) {
      return 'text-white/60';
    }
    
    return trend.isPositive ? 'text-[#51590E]' : 'text-[#D94854]';
  };

  /**
   * Formatea el valor de tendencia
   */
  const formatTrendValue = () => {
    if (!trend) return '';
    
    const sign = trend.value > 0 ? '+' : '';
    return `${sign}${trend.value.toFixed(1)}%`;
  };

  /**
   * Maneja el click en la card
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
        transition-all duration-200 hover:bg-white/10 hover:border-white/20
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Header con icono y título */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div 
              className="p-2 rounded-lg backdrop-blur-sm border border-white/20"
              style={{ 
                backgroundColor: `${iconColor}20`,
                borderColor: `${iconColor}40`
              }}
            >
              <div style={{ color: iconColor }}>
                {icon}
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-white/80 truncate">
                {title}
              </h3>
              {showTooltip && (
                <button 
                  className="text-white/40 hover:text-white/60 transition-colors"
                  title={typeof tooltipContent === "string" ? tooltipContent : undefined}
                  >
                  <Info className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-white tracking-tight">
          {value}
        </div>
      </div>

      {/* Subtitle y tendencia */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {subtitle && (
            <p className="text-xs text-white/60 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 ml-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-xs font-medium">
              {formatTrendValue()}
            </span>
          </div>
        )}
      </div>

      {/* Indicador visual de tendencia */}
      {trend && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              trend.isPositive 
                ? 'bg-gradient-to-r from-[#51590E]/50 to-[#51590E]' 
                : Math.abs(trend.value) < 0.1
                  ? 'bg-gradient-to-r from-white/20 to-white/40'
                  : 'bg-gradient-to-r from-[#D94854]/50 to-[#D94854]'
            }`}
            style={{
              width: `${Math.min(Math.abs(trend.value) * 10, 100)}%`
            }}
          />
        </div>
      )}

      {/* Efecto hover */}
      {onClick && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent 
                        opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}
    </div>
  );
};

export default MetricCard;