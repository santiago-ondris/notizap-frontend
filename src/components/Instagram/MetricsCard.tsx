import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  type LucideIcon
} from "lucide-react";
import { formatNumber, formatPercentage } from "@/utils/instagram/instagramUtils";

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  };
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
  loading?: boolean;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  subtitle,
  variant = 'default',
  className = "",
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-[#51590E]/20 border-[#51590E]/30 hover:bg-[#51590E]/25';
      case 'warning':
        return 'bg-[#FFD700]/20 border-[#FFD700]/30 hover:bg-[#FFD700]/25';
      case 'error':
        return 'bg-[#D94854]/20 border-[#D94854]/30 hover:bg-[#D94854]/25';
      default:
        return 'bg-white/10 border-white/20 hover:bg-white/15';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-[#51590E]';
      case 'warning': return 'text-[#FFD700]';
      case 'error': return 'text-[#D94854]';
      default: return 'text-[#B695BF]';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-[#51590E]" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-[#D94854]" />;
      default:
        return <Minus className="h-3 w-3 text-white/50" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-white/50';
    
    switch (trend.direction) {
      case 'up': return 'text-[#51590E]';
      case 'down': return 'text-[#D94854]';
      default: return 'text-white/50';
    }
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    return formatNumber(val);
  };

  if (loading) {
    return (
      <div className={`backdrop-blur-sm border rounded-2xl p-6 ${getVariantStyles()} ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
          <div className="animate-pulse">
            <div className="h-4 w-4 bg-white/20 rounded"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-white/20 rounded animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 ${getVariantStyles()} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
        <div className={`p-1.5 rounded-lg ${variant === 'success' ? 'bg-[#51590E]/30' : variant === 'error' ? 'bg-[#D94854]/30' : variant === 'warning' ? 'bg-[#FFD700]/30' : 'bg-[#B695BF]/30'}`}>
          <Icon className={`h-4 w-4 ${getIconColor()}`} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="text-2xl font-bold text-white/90">
          {formatValue(value)}
        </div>

        {subtitle && (
          <p className="text-xs text-white/60 leading-relaxed">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : ''}
              {formatNumber(Math.abs(trend.value))}
            </span>
            <span className="text-xs text-white/50">
              ({formatPercentage(Math.abs(trend.percentage), 1)})
            </span>
          </div>
        )}

        {description && (
          <p className="text-xs text-white/60 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// Specialized metric card variants for quick usage
export const FollowersMetricCard: React.FC<{
  current: number;
  growth: number;
  growthPercentage: number;
  loading?: boolean;
}> = ({ current, growth, growthPercentage, loading }) => (
  <MetricsCard
    title="👥 Seguidores"
    value={current}
    icon={TrendingUp}
    trend={{
      value: growth,
      percentage: growthPercentage,
      direction: growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral'
    }}
    variant={growth > 0 ? 'success' : growth < 0 ? 'error' : 'default'}
    description="Seguidores actuales"
    loading={loading}
  />
);

export const EngagementMetricCard: React.FC<{
  value: number;
  comparison?: number;
  loading?: boolean;
}> = ({ value, comparison, loading }) => (
  <MetricsCard
    title="📊 Engagement Promedio"
    value={`${value.toFixed(2)}%`}
    icon={TrendingUp}
    trend={comparison ? {
      value: value - comparison,
      percentage: comparison > 0 ? ((value - comparison) / comparison) * 100 : 0,
      direction: value > comparison ? 'up' : value < comparison ? 'down' : 'neutral'
    } : undefined}
    variant={value >= 3 ? 'success' : value >= 1 ? 'warning' : 'error'}
    description="Tasa de interacción"
    loading={loading}
  />
);

export const ContentMetricCard: React.FC<{
  posts: number;
  stories: number;
  reels: number;
  loading?: boolean;
}> = ({ posts, stories, reels, loading }) => (
  <MetricsCard
    title="📦 Contenido Publicado"
    value={posts + stories + reels}
    icon={TrendingUp}
    subtitle={`${posts} posts • ${reels} reels • ${stories} stories`}
    description="Total de publicaciones"
    loading={loading}
  />
);

export default MetricsCard;