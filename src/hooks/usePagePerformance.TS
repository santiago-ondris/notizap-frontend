import { useEffect, useRef } from 'react';
import { trackMetric, trackEvent } from '../lib/applicationInsights';
import type { NotizapModule } from '../types/analytics';

// Hook para trackear performance de carga de páginas
export const usePagePerformance = (pageName: string, module: NotizapModule) => {
  const startTimeRef = useRef<number>(Date.now());
  const isFirstRenderRef = useRef<boolean>(true);

  useEffect(() => {
    // Track tiempo de carga inicial de la página
    if (isFirstRenderRef.current) {
      const loadTime = Date.now() - startTimeRef.current;
      
      trackMetric('PageLoadTime', loadTime, {
        page: pageName,
        module,
        timestamp: new Date().toISOString()
      });

      // Track evento de página visitada
      trackEvent('PageVisited', {
        page: pageName,
        module,
        loadTime,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent
      });

      isFirstRenderRef.current = false;
    }

    // Track tiempo de permanencia en la página al desmontarse
    return () => {
      const timeOnPage = Date.now() - startTimeRef.current;
      
      trackMetric('TimeOnPage', timeOnPage, {
        page: pageName,
        module,
        timestamp: new Date().toISOString()
      });
    };
  }, [pageName, module]);

  // Función para trackear interacciones específicas de la página
  const trackPageInteraction = (interaction: string, properties?: Record<string, any>) => {
    trackEvent('PageInteraction', {
      page: pageName,
      module,
      interaction,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  // Función para trackear errores específicos de la página
  const trackPageError = (error: Error, context?: string) => {
    trackEvent('PageError', {
      page: pageName,
      module,
      error: error.message,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackPageInteraction,
    trackPageError
  };
};

// Hook específico para trackear performance de componentes pesados
export const useComponentPerformance = (componentName: string, module: NotizapModule) => {
  const renderTimeRef = useRef<number>(0);

  useEffect(() => {
    renderTimeRef.current = Date.now();
  });

  useEffect(() => {
    const renderDuration = Date.now() - renderTimeRef.current;
    
    if (renderDuration > 100) { // Solo trackear renders lentos
      trackMetric('ComponentRenderTime', renderDuration, {
        component: componentName,
        module,
        timestamp: new Date().toISOString()
      });
    }
  });

  const trackComponentAction = (action: string, properties?: Record<string, any>) => {
    trackEvent('ComponentAction', {
      component: componentName,
      module,
      action,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  return {
    trackComponentAction
  };
};