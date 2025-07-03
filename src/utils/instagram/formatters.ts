export function formatNumber(num: number, decimals: number = 1): string {
    if (num === 0) return '0';
    
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    
    if (abs >= 1000000000) {
      return `${sign}${(abs / 1000000000).toFixed(decimals)}B`;
    }
    if (abs >= 1000000) {
      return `${sign}${(abs / 1000000).toFixed(decimals)}M`;
    }
    if (abs >= 1000) {
      return `${sign}${(abs / 1000).toFixed(decimals)}K`;
    }
    
    return num.toString();
  }
  
  /**
   * Formatea porcentajes con signo y color
   */
  export function formatPercentage(
    value: number, 
    decimals: number = 1,
    showSign: boolean = true
  ): string {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }
  
  /**
   * Formatea engagement rate con contexto
   */
  export function formatEngagement(rate: number): {
    value: string;
    level: 'excelente' | 'bueno' | 'promedio' | 'bajo';
    color: string;
  } {
    const formatted = `${rate.toFixed(1)}%`;
    
    let level: 'excelente' | 'bueno' | 'promedio' | 'bajo';
    let color: string;
    
    if (rate >= 4) {
      level = 'excelente';
      color = '#51590E';
    } else if (rate >= 2.5) {
      level = 'bueno';
      color = '#B695BF';
    } else if (rate >= 1.5) {
      level = 'promedio';
      color = '#FFD700';
    } else {
      level = 'bajo';
      color = '#D94854';
    }
    
    return { value: formatted, level, color };
  }
  
  /**
   * Formatea fechas en formato argentino
   */
  export function formatDate(date: string | Date, format: 'short' | 'long' | 'chart' = 'short'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'chart':
        return dateObj.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit'
        });
      default:
        return dateObj.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
    }
  }
  
  /**
   * Formatea diferencia de tiempo relativa
   */
  export function formatTimeAgo(date: string | Date): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 60) {
      return `hace ${diffMinutes} minutos`;
    }
    if (diffHours < 24) {
      return `hace ${diffHours} horas`;
    }
    if (diffDays < 30) {
      return `hace ${diffDays} días`;
    }
    
    return formatDate(dateObj);
  }
  
  /**
   * Formatea métricas para display
   */
  export function formatMetric(
    value: number, 
    type: 'followers' | 'engagement' | 'reach' | 'interactions'
  ): string {
    switch (type) {
      case 'followers':
      case 'reach':
      case 'interactions':
        return formatNumber(value);
      case 'engagement':
        return `${value.toFixed(1)}%`;
      default:
        return value.toString();
    }
  }
  
  /**
   * Formatea crecimiento con indicadores visuales
   */
  export function formatGrowth(value: number): {
    formatted: string;
    isPositive: boolean;
    isNeutral: boolean;
    icon: 'trending-up' | 'trending-down' | 'minus';
    color: string;
  } {
    const isPositive = value > 0;
    const isNeutral = Math.abs(value) < 0.1;
    
    return {
      formatted: formatPercentage(value),
      isPositive,
      isNeutral,
      icon: isNeutral ? 'minus' : isPositive ? 'trending-up' : 'trending-down',
      color: isNeutral ? '#B695BF' : isPositive ? '#51590E' : '#D94854'
    };
  }
  
  /**
   * Formatea horarios para display
   */
  export function formatTimeRange(hora: number): string {
    const start = hora.toString().padStart(2, '0');
    const end = ((hora + 1) % 24).toString().padStart(2, '0');
    return `${start}:00 - ${end}:00`;
  }
  
  /**
   * Formatea contenido para preview (truncado)
   */
  export function formatContentPreview(content: string, maxLength: number = 80): string {
    if (!content) return '';
    
    if (content.length <= maxLength) {
      return content;
    }
    
    return content.substring(0, maxLength).trim() + '...';
  }
  
  /**
   * Formatea días de la semana en español
   */
  export function formatDayOfWeek(day: string | number): string {
    const days = [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 
      'Jueves', 'Viernes', 'Sábado'
    ];
    
    if (typeof day === 'number') {
      return days[day] || 'Desconocido';
    }
    
    // Si viene como string en inglés, convertir
    const englishDays: Record<string, string> = {
      'Sunday': 'Domingo',
      'Monday': 'Lunes',
      'Tuesday': 'Martes', 
      'Wednesday': 'Miércoles',
      'Thursday': 'Jueves',
      'Friday': 'Viernes',
      'Saturday': 'Sábado'
    };
    
    return englishDays[day] || day;
  }
  
  /**
   * Formatea duración en formato legible
   */
  export function formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  /**
   * Formatea rangos de fechas para filtros
   */
  export function formatDateRange(desde: string, hasta: string): string {
    const start = formatDate(desde, 'chart');
    const end = formatDate(hasta, 'chart');
    return `${start} - ${end}`;
  }
  
  /**
   * Formatea URLs para display seguro
   */
  export function formatUrlForDisplay(url: string, maxLength: number = 50): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      const display = urlObj.hostname + urlObj.pathname;
      
      if (display.length <= maxLength) {
        return display;
      }
      
      return display.substring(0, maxLength - 3) + '...';
    } catch {
      return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url;
    }
  }