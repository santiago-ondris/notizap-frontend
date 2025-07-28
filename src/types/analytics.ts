// Tipos para Application Insights y analytics de Notizap

export interface AnalyticsUser {
    id: string;
    email?: string;
    role?: 'viewer' | 'admin' | 'superadmin';
    loginTime?: string;
  }
  
  export interface BusinessEvent {
    action: string;
    module: NotizapModule;
    properties?: Record<string, any>;
    timestamp?: string;
  }
  
  export interface ApiCallMetrics {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    duration: number;
    statusCode: number;
    timestamp?: string;
  }
  
  export interface ApiError {
    url: string;
    method: string;
    statusCode: number;
    error: string;
    timestamp?: string;
  }
  
  export interface PageViewEvent {
    pageName: string;
    module?: NotizapModule;
    userRole?: string;
    timestamp?: string;
  }
  
  export interface UserInteraction {
    element: string;
    action: 'click' | 'hover' | 'focus' | 'submit';
    page?: string;
    module?: NotizapModule;
    timestamp?: string;
  }
  
  // Módulos específicos de Notizap
  export type NotizapModule = 
    | 'landing'
    | 'auth'
    | 'analisis'
    | 'mailing'
    | 'clientes'
    | 'mercadolibre'
    | 'envios'
    | 'cambios'
    | 'usuarios'
    | 'health';
  
  // Acciones específicas de business para cada módulo
  export interface ModuleActions {
    mailing: 'sync-mailchimp' | 'view-campaigns' | 'export-data';
    clientes: 'import-excel' | 'export-clients' | 'search-client' | 'view-client-detail';
    mercadolibre: 'sync-data' | 'view-reports' | 'export-excel' | 'upload-publicidad';
    envios: 'view-shipments' | 'export-shipments' | 'filter-shipments';
    analisis: 'view-dashboard' | 'change-filters' | 'export-analysis';
    auth: 'login' | 'logout' | 'change-role';
    usuarios: 'create-user' | 'delete-user' | 'change-role';
  }
  
  // Configuración de tracking por ambiente
  export interface AnalyticsConfig {
    enabled: boolean;
    samplingPercentage: number;
    trackPageViews: boolean;
    trackUserInteractions: boolean;
    trackApiCalls: boolean;
    debugMode: boolean;
  }
  
  // Métricas de performance específicas
  export interface PerformanceMetrics {
    pageLoadTime?: number;
    apiResponseTime?: number;
    componentRenderTime?: number;
    memoryUsage?: number;
  }
  
  // Contexto de sesión del usuario
  export interface SessionContext {
    sessionId: string;
    userId?: string;
    userRole?: string;
    startTime: string;
    lastActivityTime: string;
    pageCount: number;
    modulesSeen: NotizapModule[];
  }
  
  // Eventos de error específicos de Notizap
  export interface NotizapError {
    type: 'api-error' | 'validation-error' | 'auth-error' | 'file-upload-error' | 'export-error';
    module: NotizapModule;
    message: string;
    stack?: string;
    userAction?: string;
    timestamp?: string;
  }
  
  // Custom properties que se pueden agregar a cualquier evento
  export interface CustomProperties {
    userRole?: string;
    module?: NotizapModule;
    environment?: string;
    buildVersion?: string;
    browserInfo?: string;
    screenResolution?: string;
    timestamp?: string;
    [key: string]: any;
  }