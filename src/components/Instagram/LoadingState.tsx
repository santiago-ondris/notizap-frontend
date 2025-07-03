import React from 'react';
import { Loader2, Instagram } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'dashboard' | 'inline' | 'overlay';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Cargando datos de Instagram...',
  size = 'medium',
  variant = 'dashboard',
  className = ''
}) => {
  /**
   * Configuración de tamaños
   */
  const sizeConfig = {
    small: {
      container: 'min-h-[200px]',
      spinner: 'w-6 h-6',
      icon: 'w-8 h-8',
      title: 'text-base',
      message: 'text-sm'
    },
    medium: {
      container: 'min-h-[300px]',
      spinner: 'w-8 h-8',
      icon: 'w-10 h-10',
      title: 'text-lg',
      message: 'text-sm'
    },
    large: {
      container: 'min-h-[400px]',
      spinner: 'w-10 h-10',
      icon: 'w-12 h-12',
      title: 'text-xl',
      message: 'text-base'
    }
  };

  const config = sizeConfig[size];

  /**
   * Renderiza skeleton cards para dashboard
   */
  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Skeleton para métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse"
          >
            <div className="space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-8 bg-white/10 rounded w-1/2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton para gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-white/5 rounded-lg"></div>
        </div>
        <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-white/5 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton para secciones inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-white/5 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza loading simple con spinner
   */
  const renderSimpleLoading = () => (
    <div className={`${config.container} flex items-center justify-center`}>
      <div className="text-center max-w-sm mx-auto">
        {/* Icono de Instagram con animación */}
        <div className="relative mb-6">
          <div className={`${config.icon} mx-auto mb-4 bg-gradient-to-tr from-[#D94854] to-[#B695BF] rounded-xl 
                          flex items-center justify-center backdrop-blur-sm border border-white/20`}>
            <Instagram className="w-1/2 h-1/2 text-white" />
          </div>
          
          {/* Spinner superpuesto */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className={`${config.spinner} text-white/60 animate-spin`} />
          </div>
        </div>

        {/* Texto */}
        <h3 className={`${config.title} font-semibold text-white mb-2`}>
          Cargando Analytics
        </h3>
        <p className={`${config.message} text-white/60`}>
          {message}
        </p>

        {/* Indicador de puntos animados */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-[#D94854] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza overlay loading
   */
  const renderOverlayLoading = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1A1A20] border border-white/20 rounded-xl p-8 max-w-sm mx-4 text-center">
        <div className="relative mb-6">
          <Instagram className="w-12 h-12 mx-auto text-[#D94854] mb-4" />
          <Loader2 className="absolute inset-0 w-16 h-16 text-white/40 animate-spin" />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          Actualizando datos
        </h3>
        <p className="text-sm text-white/60">
          {message}
        </p>
      </div>
    </div>
  );

  /**
   * Renderiza loading inline
   */
  const renderInlineLoading = () => (
    <div className="flex items-center gap-3 p-4">
      <Loader2 className="w-5 h-5 text-[#D94854] animate-spin flex-shrink-0" />
      <span className="text-sm text-white/70">{message}</span>
    </div>
  );

  /**
   * Selector de variante
   */
  const renderContent = () => {
    switch (variant) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {renderSimpleLoading()}
            {renderDashboardSkeleton()}
          </div>
        );
      case 'overlay':
        return renderOverlayLoading();
      case 'inline':
        return renderInlineLoading();
      default:
        return renderSimpleLoading();
    }
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
};

export default LoadingState;