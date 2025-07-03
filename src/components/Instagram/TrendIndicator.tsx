import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { formatPercentage } from '@/utils/instagram/formatters';

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  label?: string;
  variant?: 'simple' | 'detailed' | 'compact' | 'badge';
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showPercentage?: boolean;
  showLabel?: boolean;
  threshold?: {
    positive: number;
    negative: number;
  };
  className?: string;
  animate?: boolean;
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  previousValue,
  label,
  variant = 'simple',
  size = 'medium',
  showIcon = true,
  showPercentage = true,
  showLabel = false,
  threshold = { positive: 0.1, negative: -0.1 },
  className = '',
  animate = true
}) => {
  /**
   * Calcula el cambio y tendencia
   */
  const change = previousValue !== undefined ? value - previousValue : value;
  const percentageChange = previousValue && previousValue !== 0 ? 
    ((value - previousValue) / Math.abs(previousValue)) * 100 : 0;

  const isPositive = change > threshold.positive;
  const isNegative = change < threshold.negative;
  const isNeutral = !isPositive && !isNegative;

  /**
   * Configuración de tamaños
   */
  const sizeConfig = {
    small: {
      icon: 'w-3 h-3',
      text: 'text-xs',
      value: 'text-sm',
      padding: 'px-2 py-1',
      gap: 'gap-1'
    },
    medium: {
      icon: 'w-4 h-4',
      text: 'text-sm',
      value: 'text-base',
      padding: 'px-3 py-1.5',
      gap: 'gap-2'
    },
    large: {
      icon: 'w-5 h-5',
      text: 'text-base',
      value: 'text-lg',
      padding: 'px-4 py-2',
      gap: 'gap-2'
    }
  };

  const config = sizeConfig[size];

  /**
   * Obtiene el color basado en la tendencia
   */
  const getColor = () => {
    if (isPositive) return '#51590E'; // Verde oliva
    if (isNegative) return '#D94854'; // Rojo
    return '#B695BF'; // Violeta neutro
  };

  /**
   * Obtiene el ícono de tendencia
   */
  const getTrendIcon = () => {
    if (isNeutral) return <Minus className={config.icon} />;
    return isPositive ? <TrendingUp className={config.icon} /> : <TrendingDown className={config.icon} />;
  };

  /**
   * Obtiene el ícono de flecha simple
   */
  const getArrowIcon = () => {
    if (isNeutral) return <Minus className={config.icon} />;
    return isPositive ? <ArrowUp className={config.icon} /> : <ArrowDown className={config.icon} />;
  };

  /**
   * Formatea el valor de cambio
   */
  const formatChangeValue = () => {
    if (showPercentage && previousValue !== undefined) {
      return formatPercentage(percentageChange, 1, true);
    }
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}`;
  };

  /**
   * Obtiene el texto de estado
   */
  const getStatusText = () => {
    if (isPositive) return 'Creciendo';
    if (isNegative) return 'Decreciendo';
    return 'Estable';
  };

  /**
   * Renderiza variante simple
   */
  const renderSimple = () => (
    <div className={`inline-flex items-center ${config.gap}`} style={{ color: getColor() }}>
      {showIcon && getTrendIcon()}
      <span className={`${config.value} font-semibold`}>
        {formatChangeValue()}
      </span>
      {showLabel && label && (
        <span className={`${config.text} text-white/70 ml-1`}>
          {label}
        </span>
      )}
    </div>
  );

  /**
   * Renderiza variante detallada
   */
  const renderDetailed = () => (
    <div className={`flex items-center ${config.gap} ${config.padding} bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg`}>
      {showIcon && (
        <div 
          className="p-1.5 rounded-lg"
          style={{ 
            backgroundColor: `${getColor()}20`,
            color: getColor()
          }}
        >
          {getTrendIcon()}
        </div>
      )}
      
      <div className="flex-1">
        <div className={`${config.value} font-bold text-white`}>
          {formatChangeValue()}
        </div>
        {showLabel && label && (
          <div className={`${config.text} text-white/60`}>
            {label}
          </div>
        )}
      </div>
      
      <div className={`${config.text} font-medium`} style={{ color: getColor() }}>
        {getStatusText()}
      </div>
    </div>
  );

  /**
   * Renderiza variante compacta
   */
  const renderCompact = () => (
    <div 
      className={`inline-flex items-center ${config.gap} ${config.padding} rounded-full border`}
      style={{ 
        backgroundColor: `${getColor()}10`,
        borderColor: `${getColor()}30`,
        color: getColor()
      }}
    >
      {showIcon && getArrowIcon()}
      <span className={`${config.text} font-semibold`}>
        {formatChangeValue()}
      </span>
    </div>
  );

  /**
   * Renderiza variante badge
   */
  const renderBadge = () => (
    <div 
      className={`inline-flex items-center ${config.gap} px-2 py-1 rounded-md text-xs font-medium`}
      style={{ 
        backgroundColor: `${getColor()}20`,
        color: getColor()
      }}
    >
      {showIcon && (
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor() }} />
      )}
      <span>
        {Math.abs(percentageChange) < 0.1 ? 'Sin cambios' : 
         isPositive ? `+${Math.abs(percentageChange).toFixed(1)}%` : 
         `-${Math.abs(percentageChange).toFixed(1)}%`}
      </span>
    </div>
  );

  /**
   * Renderiza indicador con animación de pulso para cambios significativos
   */
  const renderWithAnimation = (content: React.ReactNode) => {
    const isSignificantChange = Math.abs(percentageChange) > 10;
    
    return (
      <div className={`${animate && isSignificantChange ? 'animate-pulse' : ''} ${className}`}>
        {content}
      </div>
    );
  };

  /**
   * Selector de variante
   */
  const renderContent = () => {
    switch (variant) {
      case 'detailed':
        return renderDetailed();
      case 'compact':
        return renderCompact();
      case 'badge':
        return renderBadge();
      default:
        return renderSimple();
    }
  };

  return renderWithAnimation(renderContent());
};

/**
 * Componente especializado para tendencias de métricas específicas
 */
export const FollowersTrend: React.FC<{
  current: number;
  previous: number;
  className?: string;
}> = ({ current, previous, className = '' }) => (
  <TrendIndicator
    value={current}
    previousValue={previous}
    label="seguidores"
    variant="detailed"
    showLabel={true}
    className={className}
  />
);

/**
 * Componente especializado para engagement
 */
export const EngagementTrend: React.FC<{
  current: number;
  previous: number;
  className?: string;
}> = ({ current, previous, className = '' }) => (
  <TrendIndicator
    value={current}
    previousValue={previous}
    label="engagement"
    variant="compact"
    showPercentage={false}
    threshold={{ positive: 0.1, negative: -0.1 }}
    className={className}
  />
);

/**
 * Componente especializado para métricas simples
 */
export const MetricTrend: React.FC<{
  value: number;
  previousValue?: number;
  label?: string;
  positive?: boolean;
  className?: string;
}> = ({ value, previousValue, label, positive, className = '' }) => {
  const trendValue = positive !== undefined ? (positive ? 1 : -1) : value;
  
  return (
    <TrendIndicator
      value={trendValue}
      previousValue={previousValue}
      label={label}
      variant="badge"
      size="small"
      className={className}
    />
  );
};

/**
 * Componente para mostrar múltiples tendencias
 */
export const TrendGroup: React.FC<{
  trends: Array<{
    label: string;
    current: number;
    previous?: number;
    format?: 'number' | 'percentage';
  }>;
  className?: string;
}> = ({ trends, className = '' }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    {trends.map((trend, index) => (
      <TrendIndicator
        key={index}
        value={trend.current}
        previousValue={trend.previous}
        label={trend.label}
        variant="compact"
        size="small"
        showPercentage={trend.format === 'percentage'}
        showLabel={true}
      />
    ))}
  </div>
);

export default TrendIndicator;