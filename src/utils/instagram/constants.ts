import type { ChartConfig } from "@/types/instagram/analytics";
import type { CuentaInstagram } from "@/types/instagram/dashboard";

export const INSTAGRAM_ACCOUNTS: CuentaInstagram[] = ['montella', 'alenka', 'kids'];

export const ACCOUNT_INFO = {
  montella: {
    name: 'Montella',
    emoji: '🏢',
    color: '#D94854',
    description: 'Cuenta principal'
  },
  alenka: {
    name: 'Alenka',
    emoji: '👗',
    color: '#B695BF', 
    description: 'Línea femenina'
  },
  kids: {
    name: 'Kids',
    emoji: '👶',
    color: '#51590E',
    description: 'Línea infantil'
  }
} as const;

// Tipos de contenido
export const CONTENT_TYPES = ['reel', 'post', 'story'] as const;

export const CONTENT_TYPE_INFO = {
  reel: {
    name: 'Reels',
    emoji: '🎬',
    color: '#D94854',
    icon: 'play',
    primaryMetric: 'views'
  },
  post: {
    name: 'Posts',
    emoji: '📸',
    color: '#B695BF',
    icon: 'image',
    primaryMetric: 'likes'
  },
  story: {
    name: 'Stories',
    emoji: '📱',
    color: '#51590E',
    icon: 'circle',
    primaryMetric: 'impressions'
  }
} as const;

// Rangos de tiempo predefinidos
export const TIME_RANGES = {
  '7d': { label: 'Últimos 7 días', days: 7 },
  '30d': { label: 'Últimos 30 días', days: 30 },
  '90d': { label: 'Últimos 90 días', days: 90 },
  'custom': { label: 'Personalizado', days: 0 }
} as const;

// Configuración de colores para gráficos
export const CHART_COLORS: ChartConfig = {
  colors: {
    primary: '#D94854',
    secondary: '#B695BF', 
    success: '#51590E',
    warning: '#FFD700',
    error: '#D94854'
  },
  gradients: {
    engagement: ['#D94854', '#F23D5E'],
    followers: ['#B695BF', '#e327c4'],
    content: ['#51590E', '#465005']
  }
};

// Paleta de colores para múltiples series
export const MULTI_CHART_COLORS = [
  '#51590E', // Verde oliva (GLOBAL)
  '#D94854', // Rojo principal
  '#B695BF', // Violeta
  '#F23D5E', // Rojo secundario
  '#FFD700', // Dorado
  '#00D5D5', // Azul aqua
  '#465005', // Verde oscuro
  '#e327c4', // Fucsia
  '#523b4e', // Ciruela
  '#0febcd'  // Cyan vibrante
];

// Métricas y sus configuraciones
export const METRICS_CONFIG = {
  followers: {
    name: 'Seguidores',
    icon: 'users',
    format: 'number',
    color: '#B695BF'
  },
  engagement: {
    name: 'Engagement',
    icon: 'heart',
    format: 'percentage',
    color: '#D94854'
  },
  reach: {
    name: 'Alcance',
    icon: 'eye',
    format: 'number',
    color: '#51590E'
  },
  interactions: {
    name: 'Interacciones',
    icon: 'message-circle',
    format: 'number',
    color: '#F23D5E'
  }
} as const;

// Niveles de engagement
export const ENGAGEMENT_LEVELS = {
  excelente: { min: 4, color: '#51590E', label: 'Excelente' },
  bueno: { min: 2.5, color: '#B695BF', label: 'Bueno' },
  promedio: { min: 1.5, color: '#FFD700', label: 'Promedio' },
  bajo: { min: 0, color: '#D94854', label: 'Bajo' }
} as const;

// Franjas horarias
export const TIME_FRAMES = {
  madrugada: { start: 0, end: 6, label: 'Madrugada', emoji: '🌙' },
  mañana: { start: 6, end: 12, label: 'Mañana', emoji: '🌅' },
  tarde: { start: 12, end: 18, label: 'Tarde', emoji: '☀️' },
  noche: { start: 18, end: 24, label: 'Noche', emoji: '🌆' }
} as const;

// Días de la semana
export const DAYS_OF_WEEK = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 
  'Jueves', 'Viernes', 'Sábado'
] as const;

export const DAY_ABBREVIATIONS = [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'
] as const;

// Configuraciones de API
export const API_CONFIG = {
  baseURL: '/api/v1/instagram-analytics',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
} as const;

// Límites y validaciones
export const VALIDATION_LIMITS = {
  maxDateRange: 365, // días
  minDateRange: 1,   // días
  maxAnalysisDays: 365,
  minAnalysisDays: 7,
  maxContentPreview: 80, // caracteres
  maxUrlDisplay: 50,     // caracteres
  maxRetries: 3
} as const;

// Configuración de features por rol
export const ROLE_FEATURES = {
  viewer: ['dashboard', 'metrics', 'charts'],
  admin: ['dashboard', 'metrics', 'charts', 'analytics', 'patterns', 'export'],
  superadmin: ['dashboard', 'metrics', 'charts', 'analytics', 'patterns', 'export', 'compare', 'manage']
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  invalidAccount: 'Cuenta no válida. Cuentas disponibles: montella, alenka, kids',
  invalidDateRange: 'Rango de fechas no válido',
  futureDate: 'La fecha no puede ser futura',
  dateRangeTooLarge: 'El rango de fechas no puede ser mayor a 365 días',
  dateRangeTooSmall: 'El rango de fechas debe ser de al menos 1 día',
  networkError: 'Error de conexión. Verifica tu internet.',
  serverError: 'Error del servidor. Intenta de nuevo más tarde.',
  unauthorized: 'No tienes permisos para esta acción',
  noData: 'No hay datos disponibles para el período seleccionado'
} as const;

// Configuración de gráficos por defecto
export const DEFAULT_CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  strokeWidth: 3,
  strokeOpacity: 0.8,
  fillOpacity: 0.1,
  animationDuration: 300,
  gridOpacity: 0.1,
  axisColor: 'rgba(255,255,255,0.3)',
  textColor: 'rgba(255,255,255,0.7)',
  tooltipStyle: {
    backgroundColor: '#212026',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  }
} as const;

// Configuración de refreshing/polling
export const REFRESH_CONFIG = {
  dashboardInterval: 5 * 60 * 1000, // 5 minutos
  analyticsInterval: 15 * 60 * 1000, // 15 minutos
  healthCheckInterval: 60 * 1000,    // 1 minuto
  maxStaleTime: 30 * 60 * 1000       // 30 minutos
} as const;

// Configuración de cache
export const CACHE_CONFIG = {
  dashboard: 5 * 60 * 1000,    // 5 minutos
  analytics: 15 * 60 * 1000,   // 15 minutos
  horarios: 60 * 60 * 1000,    // 1 hora
  comparativa: 30 * 60 * 1000  // 30 minutos
} as const;

// Emojis para diferentes contextos
export const EMOJI_INDICATORS = {
  trends: {
    up: '📈',
    down: '📉', 
    stable: '➡️'
  },
  performance: {
    excellent: '🚀',
    good: '✅',
    average: '⚡',
    poor: '⚠️'
  },
  content: {
    reel: '🎬',
    post: '📸',
    story: '📱',
    video: '🎥',
    image: '🖼️'
  },
  metrics: {
    followers: '👥',
    likes: '❤️',
    comments: '💬',
    shares: '🔄',
    views: '👁️',
    reach: '📡',
    engagement: '🎯'
  },
  time: {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
    weekend: '🎉',
    weekday: '💼'
  }
} as const;

// Configuración de tooltips
export const TOOLTIP_CONFIG = {
  delay: { show: 500, hide: 100 },
  placement: 'top' as const,
  className: 'bg-[#212026] border border-white/20 rounded-lg shadow-lg',
  maxWidth: 300
} as const;

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: 'ease-in-out' as const,
  stagger: 50 // Para animaciones en lista
} as const;

// URLs y endpoints
export const EXTERNAL_URLS = {
  instagram: 'https://www.instagram.com/',
  instagramBusiness: 'https://business.instagram.com/',
  metricool: 'https://metricool.com/',
  help: '/help/instagram-analytics',
  documentation: '/docs/instagram'
} as const;

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  duration: {
    success: 3000,
    error: 5000,
    warning: 4000,
    info: 3000
  },
  position: 'top-right' as const,
  maxNotifications: 3
} as const;

// Breakpoints responsive (para usar con Tailwind)
export const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  largeDesktop: '(min-width: 1440px)'
} as const;

// Configuración de exportación
export const EXPORT_CONFIG = {
  formats: ['pdf', 'excel', 'csv'] as const,
  maxRecords: 10000,
  filename: {
    dashboard: 'instagram-dashboard',
    analytics: 'instagram-analytics',
    comparison: 'instagram-comparison'
  }
} as const;

// Configuración de búsqueda/filtros
export const SEARCH_CONFIG = {
  debounceDelay: 300,
  minSearchLength: 2,
  maxResults: 50,
  highlightClassName: 'bg-yellow-200 text-black'
} as const;

// Configuración de paginación
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPagesShown: 5
} as const;