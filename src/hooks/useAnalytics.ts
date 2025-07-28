import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackEvent, 
  trackPageView, 
  trackBusinessEvent, 
  trackException,
  trackMetric 
} from '@/lib/applicationInsights';
import type { 
  NotizapModule, 
  UserInteraction, 
  CustomProperties 
} from '@/types/analytics';

// Hook principal para analytics en componentes
export const useAnalytics = (module: NotizapModule) => {
  const location = useLocation();

  // Track page view automáticamente cuando cambia la ruta
  useEffect(() => {
    const pageName = `${module}${location.pathname}`;
    trackPageView(pageName, location.pathname);
    
    // Track tiempo en página
    const startTime = Date.now();
    
    return () => {
      const timeOnPage = Date.now() - startTime;
      trackMetric('PageViewDuration', timeOnPage, {
        module,
        page: location.pathname
      });
    };
  }, [location, module]);

  // Función para trackear acciones de business específicas del módulo
  const trackModuleAction = useCallback((action: string, properties?: CustomProperties) => {
    trackBusinessEvent(action, module, {
      page: location.pathname,
      ...properties
    });
  }, [module, location.pathname]);

  // Función para trackear interacciones del usuario (clicks, etc.)
  const trackUserInteraction = useCallback((element: string, action: UserInteraction['action'], properties?: CustomProperties) => {
    trackEvent('UserInteraction', {
      element,
      action,
      module,
      page: location.pathname,
      timestamp: new Date().toISOString(),
      ...properties
    });
  }, [module, location.pathname]);

  // Función para trackear errores específicos del módulo
  const trackModuleError = useCallback((error: Error, userAction?: string, properties?: CustomProperties) => {
    trackException(error, {
      module,
      page: location.pathname,
      userAction,
      timestamp: new Date().toISOString(),
      ...properties
    });
  }, [module, location.pathname]);

  // Función para trackear métricas de performance
  const trackPerformance = useCallback((metricName: string, value: number, properties?: CustomProperties) => {
    trackMetric(`${module}.${metricName}`, value, {
      page: location.pathname,
      ...properties
    });
  }, [module, location.pathname]);

  // Función para trackear tiempo de carga de datos
  const trackDataLoadTime = useCallback((dataType: string, startTime: number, properties?: CustomProperties) => {
    const loadTime = Date.now() - startTime;
    trackMetric(`${module}.DataLoad.${dataType}`, loadTime, {
      page: location.pathname,
      ...properties
    });
  }, [module, location.pathname]);

  return {
    trackModuleAction,
    trackUserInteraction,
    trackModuleError,
    trackPerformance,
    trackDataLoadTime
  };
};

// Hook específico para tracking de formularios
export const useFormAnalytics = (formName: string, module: NotizapModule) => {
  const { trackModuleAction, trackModuleError } = useAnalytics(module);

  const trackFormStart = useCallback(() => {
    trackModuleAction('form-start', { formName });
  }, [trackModuleAction, formName]);

  const trackFormSubmit = useCallback((isSuccess: boolean, errors?: string[]) => {
    trackModuleAction('form-submit', { 
      formName, 
      isSuccess, 
      errorCount: errors?.length || 0,
      errors: errors?.join(', ')
    });
  }, [trackModuleAction, formName]);

  const trackFormError = useCallback((error: Error, fieldName?: string) => {
    trackModuleError(error, 'form-input', { 
      formName, 
      fieldName 
    });
  }, [trackModuleError, formName]);

  const trackFormField = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change') => {
    trackModuleAction('form-field-interaction', { 
      formName, 
      fieldName, 
      action 
    });
  }, [trackModuleAction, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError,
    trackFormField
  };
};

// Hook para tracking de exports/imports
export const useDataAnalytics = (module: NotizapModule) => {
  const { trackModuleAction, trackPerformance } = useAnalytics(module);

  const trackExport = useCallback((exportType: string, recordCount: number, startTime: number) => {
    const duration = Date.now() - startTime;
    
    trackModuleAction('data-export', {
      exportType,
      recordCount,
      duration
    });

    trackPerformance(`Export.${exportType}`, duration, {
      recordCount
    });
  }, [trackModuleAction, trackPerformance]);

  const trackImport = useCallback((importType: string, recordCount: number, successCount: number, errorCount: number, startTime: number) => {
    const duration = Date.now() - startTime;
    
    trackModuleAction('data-import', {
      importType,
      recordCount,
      successCount,
      errorCount,
      duration,
      successRate: successCount / recordCount
    });

    trackPerformance(`Import.${importType}`, duration, {
      recordCount,
      successRate: successCount / recordCount
    });
  }, [trackModuleAction, trackPerformance]);

  const trackDataFilter = useCallback((filterType: string, resultCount: number) => {
    trackModuleAction('data-filter', {
      filterType,
      resultCount
    });
  }, [trackModuleAction]);

  const trackDataSearch = useCallback((searchTerm: string, resultCount: number, searchTime: number) => {
    trackModuleAction('data-search', {
      searchTermLength: searchTerm.length,
      resultCount,
      searchTime
    });

    // No trackear el término real por privacidad, solo la longitud
    trackPerformance('Search', searchTime, {
      resultCount
    });
  }, [trackModuleAction, trackPerformance]);

  return {
    trackExport,
    trackImport,
    trackDataFilter,
    trackDataSearch
  };
};

// Hook para tracking de modo admin
export const useAdminAnalytics = (module: NotizapModule) => {
  const { trackModuleAction } = useAnalytics(module);

  const trackAdminModeToggle = useCallback((isAdminMode: boolean) => {
    trackModuleAction('admin-mode-toggle', {
      isAdminMode,
      timestamp: new Date().toISOString()
    });
  }, [trackModuleAction]);

  const trackAdminAction = useCallback((action: string, targetId?: string, properties?: CustomProperties) => {
    trackModuleAction('admin-action', {
      adminAction: action,
      targetId,
      timestamp: new Date().toISOString(),
      ...properties
    });
  }, [trackModuleAction]);

  return {
    trackAdminModeToggle,
    trackAdminAction
  };
};