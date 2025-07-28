import { ApplicationInsights, type IEventTelemetry } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

// 1) History sin opciones
export const browserHistory = createBrowserHistory();

// 2) Plugin React
export const reactPlugin = new ReactPlugin();

// 3) Configuración base de App Insights (sin telemetryInitializers)
const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING || '',
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableCorsCorrelation: true,
    enableUnhandledPromiseRejectionTracking: true,
    enablePerfMgr: true,
    perfEvtsSendAll: false,
    samplingPercentage: 100,
    isStorageUseDisabled: false,
    isCookieUseDisabled: false,
    loggingLevelConsole: 1,
    loggingLevelTelemetry: 1,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: {
        history: browserHistory,
        enableComponentTracking: true
      }
    }
  }
});

// 4) Inicializar y luego registrar initializer
appInsights.loadAppInsights();
appInsights.addTelemetryInitializer((envelope) => {
  envelope.tags = envelope.tags || {};
  envelope.tags['ai.application.ver'] = '1.0.0';
  envelope.tags['ai.device.type'] = 'Browser';
  envelope.data = envelope.data || {};
  envelope.data.baseData = envelope.data.baseData || {};
  envelope.data.baseData.properties = envelope.data.baseData.properties || {};
  envelope.data.baseData.properties.environment = import.meta.env.MODE;
  envelope.data.baseData.properties.buildTime = new Date().toISOString();
  return true;
});

console.log('🔍 Application Insights initialized successfully');

// 5) Wrappers corregidos
export const trackEvent = (
  name: string,
  properties?: Record<string, any>,
  measurements?: Record<string, number>
) => {
  const ev: IEventTelemetry = { name };
  if (properties)   ev.properties   = properties;
  if (measurements) ev.measurements = measurements;
  appInsights.trackEvent(ev);
};

export const trackPageView = (name?: string, uri?: string) => {
  appInsights.trackPageView({ name, uri });
};

export const trackException = (
  exception: Error,
  properties?: Record<string, any>
) => {
  appInsights.trackException({ exception, properties });
};

export const trackTrace = (
  message: string,
  severityLevel?: number,
  properties?: Record<string, any>
) => {
  appInsights.trackTrace({ message, severityLevel, properties });
};

export const trackMetric = (
  name: string,
  average: number,
  properties?: Record<string, any>
) => {
  appInsights.trackMetric({ name, average }, properties);
};

// Función para setear información del usuario cuando hace login
export const setUser = (userId: string, email?: string, role?: string) => {
  appInsights.setAuthenticatedUserContext(userId, email);
  
  // Trackear evento de login
  trackEvent('UserLogin', {
    userId,
    email,
    role,
    loginTime: new Date().toISOString()
  });
};

// Función para limpiar información del usuario cuando hace logout
export const clearUser = () => {
  appInsights.clearAuthenticatedUserContext();
  trackEvent('UserLogout', {
    logoutTime: new Date().toISOString()
  });
};

// Función para trackear errores de API
export const trackApiError = (url: string, method: string, statusCode: number, error: string) => {
  trackEvent('ApiError', {
    url,
    method,
    statusCode,
    error,
    timestamp: new Date().toISOString()
  });
};

// Función para trackear performance de API
export const trackApiCall = (url: string, method: string, duration: number, statusCode: number) => {
  trackMetric('ApiCall.Duration', duration, {
    url,
    method,
    statusCode: statusCode.toString(),
    timestamp: new Date().toISOString()
  });
};

// Función para trackear acciones específicas de Notizap
export const trackBusinessEvent = (action: string, module: string, properties?: Record<string, any>) => {
  trackEvent('BusinessAction', {
    action,
    module,
    timestamp: new Date().toISOString(),
    ...properties
  });
};

// Exportar instancias
export { appInsights };