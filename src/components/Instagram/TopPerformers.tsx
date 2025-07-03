import React, { useState } from 'react';
import { ExternalLink, Play, Image, Circle, Trophy, Heart, MessageCircle, Share } from 'lucide-react';
import { formatNumber, formatDate, formatContentPreview, formatEngagement } from '@/utils/instagram/formatters';
import { CONTENT_TYPE_INFO } from '@/utils/instagram/constants';
import type { TopContentItem } from '@/types/instagram/dashboard';

interface TopPerformersProps {
  data: TopContentItem[];
  className?: string;
  maxItems?: number;
  variant?: 'grid' | 'list';
  showFilters?: boolean;
}

const TopPerformers: React.FC<TopPerformersProps> = ({
  data,
  className = '',
  maxItems = 5,
  variant = 'grid',
  showFilters = true
}) => {
  const [filterType, setFilterType] = useState<'all' | 'reel' | 'post' | 'story'>('all');
  const [sortBy, setSortBy] = useState<'metric' | 'engagement' | 'date'>('metric');

  /**
   * Filtra y ordena los datos
   */
  const processedData = React.useMemo(() => {
    let filtered = data;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.tipoContenido === filterType);
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        case 'date':
          return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
        default:
          return b.metricaPrincipal - a.metricaPrincipal;
      }
    });

    return filtered.slice(0, maxItems);
  }, [data, filterType, sortBy, maxItems]);

  /**
   * Obtiene el ícono del tipo de contenido
   */
  const getContentIcon = (tipo: string) => {
    switch (tipo) {
      case 'reel': return <Play className="w-4 h-4" />;
      case 'post': return <Image className="w-4 h-4" />;
      case 'story': return <Circle className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  /**
   * Obtiene el color del tipo de contenido
   */
  const getContentColor = (tipo: string) => {
    const info = CONTENT_TYPE_INFO[tipo as keyof typeof CONTENT_TYPE_INFO];
    return info?.color || '#B695BF';
  };

  /**
   * Renderiza filtros
   */
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-white/10">
        {/* Filtro por tipo */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Tipo:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white/80
                       focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
          >
            <option value="all">Todos</option>
            <option value="reel">Reels</option>
            <option value="post">Posts</option>
            <option value="story">Stories</option>
          </select>
        </div>

        {/* Filtro por ordenamiento */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/70">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white/80
                       focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40"
          >
            <option value="metric">Por métrica principal</option>
            <option value="engagement">Por engagement</option>
            <option value="date">Por fecha</option>
          </select>
        </div>

        {/* Contador */}
        <div className="ml-auto text-sm text-white/60">
          {processedData.length} de {data.length} contenidos
        </div>
      </div>
    );
  };

  /**
   * Renderiza una card de contenido
   */
  const renderContentCard = (item: TopContentItem, index: number) => {
    const contentColor = getContentColor(item.tipoContenido);
    const engagement = formatEngagement(item.engagementRate);
    
    return (
      <div
        key={item.id}
        className="group relative p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl
                   hover:bg-white/10 hover:border-white/20 transition-all duration-200
                   hover:scale-[1.02] cursor-pointer"
        onClick={() => item.url && window.open(item.url, '_blank')}
      >
        {/* Badge de posición */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
            {index === 0 && <Trophy className="w-3 h-3 text-[#FFD700]" />}
            <span className="text-xs font-semibold text-white">#{index + 1}</span>
          </div>
        </div>

        {/* Badge de tipo */}
        <div className="absolute top-3 right-3 z-10">
          <div 
            className="flex items-center gap-1 px-2 py-1 backdrop-blur-sm rounded-lg border"
            style={{ 
              backgroundColor: `${contentColor}20`,
              borderColor: `${contentColor}40`
            }}
          >
            <div style={{ color: contentColor }}>
              {getContentIcon(item.tipoContenido)}
            </div>
            <span className="text-xs font-medium text-white capitalize">
              {item.tipoContenido}
            </span>
          </div>
        </div>

        {/* Imagen de preview */}
        <div className="aspect-square bg-white/5 rounded-lg mb-3 overflow-hidden relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={`Contenido ${item.tipoContenido}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div style={{ color: contentColor }}>
                {getContentIcon(item.tipoContenido)}
              </div>
            </div>
          )}
          
          {/* Overlay con métrica principal */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <div className="text-white">
              <div className="text-lg font-bold">
                {formatNumber(item.metricaPrincipal)}
              </div>
              <div className="text-xs opacity-80 capitalize">
                {item.nombreMetrica}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-2">
          <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">
            {formatContentPreview(item.contenido, 60)}
          </p>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">
              {formatDate(item.fechaPublicacion, 'chart')}
            </span>
            <div 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${engagement.color}20`,
                color: engagement.color
              }}
            >
              {engagement.value}
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-white/60">
              {item.metricasAdicionales.likes && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {formatNumber(item.metricasAdicionales.likes as number)}
                </div>
              )}
              {item.metricasAdicionales.comentarios && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {formatNumber(item.metricasAdicionales.comentarios as number)}
                </div>
              )}
              {item.metricasAdicionales.compartidos && (
                <div className="flex items-center gap-1">
                  <Share className="w-3 h-3" />
                  {formatNumber(item.metricasAdicionales.compartidos as number)}
                </div>
              )}
            </div>
            
            {item.url && (
              <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-white/70 transition-colors" />
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza vista de lista
   */
  const renderListView = () => (
    <div className="space-y-3">
      {processedData.map((item, index) => {
        const contentColor = getContentColor(item.tipoContenido);
        const engagement = formatEngagement(item.engagementRate);
        
        return (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg
                       hover:bg-white/10 transition-all cursor-pointer"
            onClick={() => item.url && window.open(item.url, '_blank')}
          >
            {/* Número */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
              <span className="text-sm font-semibold text-white">#{index + 1}</span>
            </div>

            {/* Preview imagen */}
            <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: contentColor }}>
                  {getContentIcon(item.tipoContenido)}
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div style={{ color: contentColor }}>
                  {getContentIcon(item.tipoContenido)}
                </div>
                <span className="text-sm font-medium text-white capitalize">
                  {item.tipoContenido}
                </span>
                <span className="text-xs text-white/60">
                  {formatDate(item.fechaPublicacion, 'chart')}
                </span>
              </div>
              <p className="text-sm text-white/80 truncate">
                {formatContentPreview(item.contenido, 80)}
              </p>
            </div>

            {/* Métricas */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-white">
                {formatNumber(item.metricaPrincipal)}
              </div>
              <div className="text-xs text-white/60 capitalize">
                {item.nombreMetrica}
              </div>
              <div 
                className="text-xs font-medium mt-1"
                style={{ color: engagement.color }}
              >
                {engagement.value}
              </div>
            </div>

            {/* Link externo */}
            {item.url && (
              <ExternalLink className="w-4 h-4 text-white/40 hover:text-white/70 transition-colors" />
            )}
          </div>
        );
      })}
    </div>
  );

  /**
   * Renderiza vista de grid
   */
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {processedData.map((item, index) => renderContentCard(item, index))}
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          🏆 Top Performers
        </h3>
        <div className="h-48 flex items-center justify-center text-white/40">
          <div className="text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No hay contenido destacado disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          🏆 Top Performers
        </h3>
        
        {/* Toggle de vista */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`p-2 rounded-lg transition-all ${
              variant === 'grid' 
                ? 'bg-white/20 text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
            title="Vista de grid"
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              {[1,2,3,4].map(i => <div key={i} className="bg-current rounded-sm" />)}
            </div>
          </button>
        </div>
      </div>

      {renderFilters()}
      
      {variant === 'list' ? renderListView() : renderGridView()}

      {/* Estadísticas del bottom */}
      {processedData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
            <div>
              <div className="text-white/60">Engagement promedio</div>
              <div className="text-white font-semibold">
                {(processedData.reduce((sum, item) => sum + item.engagementRate, 0) / processedData.length).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-white/60">Mejor performer</div>
              <div className="text-white font-semibold">
                {formatNumber(Math.max(...processedData.map(item => item.metricaPrincipal)))}
              </div>
            </div>
            <div>
              <div className="text-white/60">Más reciente</div>
              <div className="text-white font-semibold">
                {formatDate(processedData.sort((a, b) => 
                  new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
                )[0]?.fechaPublicacion, 'chart')}
              </div>
            </div>
            <div>
              <div className="text-white/60">Total mostrado</div>
              <div className="text-white font-semibold">
                {processedData.length} contenidos
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPerformers;