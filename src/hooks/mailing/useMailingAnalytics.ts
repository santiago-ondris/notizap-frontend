import { useCallback } from 'react';
import { useAnalytics, useDataAnalytics } from '@/hooks/useAnalytics';
import { trackEvent, trackMetric } from '@/lib/applicationInsights';

// Hook específico para analytics del módulo Mailing
export const useMailingAnalytics = () => {
  const { trackModuleAction, trackUserInteraction, trackModuleError } = useAnalytics('mailing');
  const { trackDataFilter, trackExport } = useDataAnalytics('mailing');

  // Track sincronización de Mailchimp
  const trackMailchimpSync = useCallback((
    account: string,
    action: 'start' | 'success' | 'error',
    properties?: {
      duration?: number;
      campaignsCount?: number;
      error?: string;
      userRole?: string;
    }
  ) => {
    trackModuleAction(`mailchimp-sync-${action}`, {
      account,
      timestamp: new Date().toISOString(),
      ...properties
    });

    // Métricas específicas
    if (action === 'success' && properties?.duration) {
      trackMetric('Mailing.SyncDuration', properties.duration, {
        account,
        campaignsCount: properties.campaignsCount?.toString() || '0'
      });
    }

    if (action === 'success' && properties?.campaignsCount) {
      trackMetric('Mailing.CampaignsCount', properties.campaignsCount, {
        account
      });
    }
  }, [trackModuleAction]);

  // Track interacciones con campañas
  const trackCampaignInteraction = useCallback((
    action: 'view' | 'click' | 'expand' | 'sort',
    campaignData: {
      campaignId?: string;
      campaignTitle?: string;
      account?: string;
      openRate?: number;
      clickRate?: number;
    }
  ) => {
    trackUserInteraction(`campaign-${action}`, 'click', {
      campaignId: campaignData.campaignId,
      campaignTitle: campaignData.campaignTitle?.substring(0, 50),
      account: campaignData.account,
      hasHighOpenRate: (campaignData.openRate || 0) > 25,
      hasHighClickRate: (campaignData.clickRate || 0) > 3
    });
  }, [trackUserInteraction]);

  // Track uso de filtros específicos de Mailing
  const trackMailingFilter = useCallback((
    filterType: 'search' | 'dateRange' | 'account' | 'clear',
    filterData: {
      searchTerm?: string;
      dateFrom?: string;
      dateTo?: string;
      account?: string;
      resultCount: number;
    }
  ) => {
    trackDataFilter(filterType, filterData.resultCount);

    // Métricas adicionales
    if (filterType === 'search' && filterData.searchTerm) {
      trackMetric('Mailing.SearchTermLength', filterData.searchTerm.length, {
        resultCount: filterData.resultCount.toString()
      });
    }

    if (filterType === 'dateRange') {
      trackModuleAction('filter-date-range', {
        dateFrom: filterData.dateFrom,
        dateTo: filterData.dateTo,
        resultCount: filterData.resultCount
      });
    }
  }, [trackDataFilter, trackModuleAction]);

  // Track performance de highlights/métricas
  const trackHighlightsPerformance = useCallback((
    highlights: {
      totalCampaigns?: number;
      avgOpenRate?: number;
      avgClickRate?: number;
      totalSent?: number;
      loadTime?: number;
    }
  ) => {
    // Track métricas de negocio
    if (highlights.totalCampaigns) {
      trackMetric('Mailing.Highlights.TotalCampaigns', highlights.totalCampaigns);
    }

    if (highlights.avgOpenRate) {
      trackMetric('Mailing.Highlights.AvgOpenRate', highlights.avgOpenRate);
    }

    if (highlights.avgClickRate) {
      trackMetric('Mailing.Highlights.AvgClickRate', highlights.avgClickRate);
    }

    if (highlights.totalSent) {
      trackMetric('Mailing.Highlights.TotalSent', highlights.totalSent);
    }

    // Track performance de carga
    if (highlights.loadTime) {
      trackMetric('Mailing.Highlights.LoadTime', highlights.loadTime);
    }
  }, []);

  // Track export específico de campañas
  const trackCampaignExport = useCallback((
    exportType: 'csv' | 'excel' | 'pdf',
    exportData: {
      campaignCount: number;
      account: string;
      dateRange?: string;
      includeMetrics: boolean;
      startTime: number;
    }
  ) => {
    const duration = Date.now() - exportData.startTime;

    trackExport(`mailchimp-campaigns-${exportType}`, exportData.campaignCount, exportData.startTime);

    trackModuleAction('campaign-export', {
      exportType,
      campaignCount: exportData.campaignCount,
      account: exportData.account,
      dateRange: exportData.dateRange,
      includeMetrics: exportData.includeMetrics,
      duration,
      timestamp: new Date().toISOString()
    });
  }, [trackExport, trackModuleAction]);

  // Track errores específicos de Mailing
  const trackMailingError = useCallback((
    errorType: 'sync-failed' | 'api-error' | 'data-loading' | 'export-failed',
    errorData: {
      account?: string;
      error: string;
      context?: string;
      userAction?: string;
    }
  ) => {
    trackModuleError(new Error(errorData.error), errorData.userAction, {
      errorType,
      account: errorData.account,
      context: errorData.context
    });

    // Event específico para errores de Mailchimp
    trackEvent('MailingError', {
      errorType,
      account: errorData.account,
      error: errorData.error,
      context: errorData.context,
      userAction: errorData.userAction,
      timestamp: new Date().toISOString()
    });
  }, [trackModuleError]);

  // Track métricas de usuario en tiempo real
  const trackUserBehavior = useCallback((
    behaviorType: 'page-scroll' | 'table-sort' | 'filter-usage' | 'long-session',
    behaviorData?: {
      scrollDepth?: number;
      sortColumn?: string;
      filterCount?: number;
      sessionDuration?: number;
    }
  ) => {
    trackEvent('MailingUserBehavior', {
      behaviorType,
      timestamp: new Date().toISOString(),
      ...behaviorData
    });

    // Métricas específicas
    if (behaviorType === 'page-scroll' && behaviorData?.scrollDepth) {
      trackMetric('Mailing.ScrollDepth', behaviorData.scrollDepth);
    }

    if (behaviorType === 'long-session' && behaviorData?.sessionDuration) {
      trackMetric('Mailing.SessionDuration', behaviorData.sessionDuration);
    }
  }, []);

  return {
    trackMailchimpSync,
    trackCampaignInteraction,
    trackMailingFilter,
    trackHighlightsPerformance,
    trackCampaignExport,
    trackMailingError,
    trackUserBehavior
  };
};