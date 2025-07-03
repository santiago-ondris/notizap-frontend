import type { AnalyticsFilters } from "@/types/instagram/analytics";
import type { CuentaInstagram, DashboardFilters } from "@/types/instagram/dashboard";

export function isValidAccount(cuenta: string): cuenta is CuentaInstagram {
  const validAccounts: CuentaInstagram[] = ['montella', 'alenka', 'kids'];
  return validAccounts.includes(cuenta.toLowerCase() as CuentaInstagram);
}

/**
 * Valida formato de fecha YYYY-MM-DD
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * Valida rango de fechas
 */
export function isValidDateRange(desde: string, hasta: string): {
  isValid: boolean;
  error?: string;
} {
  if (!isValidDateFormat(desde)) {
    return { isValid: false, error: 'Fecha desde no válida' };
  }
  
  if (!isValidDateFormat(hasta)) {
    return { isValid: false, error: 'Fecha hasta no válida' };
  }
  
  const startDate = new Date(desde);
  const endDate = new Date(hasta);
  const today = new Date();
  
  if (startDate >= endDate) {
    return { isValid: false, error: 'La fecha desde debe ser anterior a la fecha hasta' };
  }
  
  if (endDate > today) {
    return { isValid: false, error: 'La fecha hasta no puede ser futura' };
  }
  
  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    return { isValid: false, error: 'El rango no puede ser mayor a 365 días' };
  }
  
  if (diffDays < 1) {
    return { isValid: false, error: 'El rango debe ser de al menos 1 día' };
  }
  
  return { isValid: true };
}

/**
 * Valida filtros del dashboard
 */
export function validateDashboardFilters(filters: DashboardFilters): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!filters.cuenta) {
    errors.push('La cuenta es requerida');
  } else if (!isValidAccount(filters.cuenta)) {
    errors.push('Cuenta no válida');
  }
  
  if (filters.desde && filters.hasta) {
    const dateValidation = isValidDateRange(filters.desde, filters.hasta);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error!);
    }
  } else if (filters.desde && !filters.hasta) {
    errors.push('Si especificas fecha desde, también debes especificar fecha hasta');
  } else if (!filters.desde && filters.hasta) {
    errors.push('Si especificas fecha hasta, también debes especificar fecha desde');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida filtros de analytics
 */
export function validateAnalyticsFilters(filters: AnalyticsFilters): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!filters.cuenta) {
    errors.push('La cuenta es requerida');
  } else if (!isValidAccount(filters.cuenta)) {
    errors.push('Cuenta no válida');
  }
  
  if (!filters.desde) {
    errors.push('La fecha desde es requerida');
  }
  
  if (!filters.hasta) {
    errors.push('La fecha hasta es requerida');
  }
  
  if (filters.desde && filters.hasta) {
    const dateValidation = isValidDateRange(filters.desde, filters.hasta);
    if (!dateValidation.isValid) {
      errors.push(dateValidation.error!);
    }
  }
  
  if (filters.diasAnalisis !== undefined) {
    if (filters.diasAnalisis < 7 || filters.diasAnalisis > 365) {
      errors.push('Los días de análisis deben estar entre 7 y 365');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida parámetros de comparativa de períodos
 */
export function validateComparativePeriods(params: {
  cuenta: string;
  periodoActualDesde: string;
  periodoActualHasta: string;
  periodoAnteriorDesde: string;
  periodoAnteriorHasta: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isValidAccount(params.cuenta)) {
    errors.push('Cuenta no válida');
  }
  
  // Validar período actual
  const actualValidation = isValidDateRange(params.periodoActualDesde, params.periodoActualHasta);
  if (!actualValidation.isValid) {
    errors.push(`Período actual: ${actualValidation.error}`);
  }
  
  // Validar período anterior
  const anteriorValidation = isValidDateRange(params.periodoAnteriorDesde, params.periodoAnteriorHasta);
  if (!anteriorValidation.isValid) {
    errors.push(`Período anterior: ${anteriorValidation.error}`);
  }
  
  // Validar que los períodos no se solapen
  if (actualValidation.isValid && anteriorValidation.isValid) {
    const actualStart = new Date(params.periodoActualDesde);
    const anteriorEnd = new Date(params.periodoAnteriorHasta);
    
    if (actualStart <= anteriorEnd) {
      errors.push('Los períodos no pueden solaparse');
    }
    
    // Validar que tengan duración similar (diferencia máxima de 7 días)
    const actualDays = (new Date(params.periodoActualHasta).getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24);
    const anteriorDays = (anteriorEnd.getTime() - new Date(params.periodoAnteriorDesde).getTime()) / (1000 * 60 * 60 * 24);
    
    if (Math.abs(actualDays - anteriorDays) > 7) {
      errors.push('Los períodos deben tener duraciones similares (diferencia máxima: 7 días)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida número de engagement
 */
export function isValidEngagement(value: number): boolean {
  return value >= 0 && value <= 100 && !isNaN(value);
}

/**
 * Valida número de seguidores
 */
export function isValidFollowerCount(value: number): boolean {
  return value >= 0 && Number.isInteger(value);
}

/**
 * Valida URL de Instagram
 */
export function isValidInstagramUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'www.instagram.com' || urlObj.hostname === 'instagram.com';
  } catch {
    return false;
  }
}

/**
 * Valida configuración de gráficos
 */
export function validateChartData(data: any[]): {
  isValid: boolean;
  error?: string;
} {
  if (!Array.isArray(data)) {
    return { isValid: false, error: 'Los datos deben ser un array' };
  }
  
  if (data.length === 0) {
    return { isValid: false, error: 'No hay datos para mostrar' };
  }
  
  // Validar que todos los elementos tengan las propiedades requeridas
  const hasRequiredFields = data.every(item => 
    typeof item === 'object' && item !== null
  );
  
  if (!hasRequiredFields) {
    return { isValid: false, error: 'Formato de datos inválido' };
  }
  
  return { isValid: true };
}

/**
 * Valida rango de horarios (0-23)
 */
export function isValidHour(hour: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

/**
 * Valida tipo de contenido
 */
export function isValidContentType(type: string): type is 'reel' | 'post' | 'story' {
  return ['reel', 'post', 'story'].includes(type);
}

/**
 * Sanitiza input del usuario para búsquedas
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '') // Remover caracteres peligrosos
    .substring(0, 100); // Limitar longitud
}

/**
 * Valida permisos de usuario para funcionalidades
 */
export function validateUserPermissions(
  userRole: 'viewer' | 'admin' | 'superadmin',
  requiredFeature: 'dashboard' | 'analytics' | 'export' | 'compare'
): boolean {
  const permissions: Record<string, string[]> = {
    dashboard: ['viewer', 'admin', 'superadmin'],
    analytics: ['admin', 'superadmin'],
    export: ['admin', 'superadmin'],
    compare: ['admin', 'superadmin']
  };
  
  return permissions[requiredFeature]?.includes(userRole) || false;
}