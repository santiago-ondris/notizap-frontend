/**
 * Helper para formatear fechas en el módulo de envíos
 * Maneja días de la semana en español y formatos personalizados
 */

/**
 * Días de la semana en español (formato corto)
 */
const DIAS_SEMANA = [
    'Domingo', // 0 = Domingo
    'Lunes', // 1 = Lunes  
    'Martes', // 2 = Martes
    'Miércoles', // 3 = Miércoles
    'Jueves', // 4 = Jueves
    'Viernes', // 5 = Viernes
    'Sábado'  // 6 = Sábado
  ];
  
  /**
   * Convierte una fecha ISO string a formato "DD Día (DD/MM)"
   * Ejemplo: "2025-06-19T00:00:00.000Z" → "19 Jue (19/06)"
   * 
   * @param fechaISO - Fecha en formato ISO string
   * @returns String formateado o "--/--" si hay error
   */
  export const formatearFechaConDia = (fechaISO: string): string => {
    try {
      const fecha = new Date(fechaISO);
      
      // Verificar que la fecha sea válida
      if (isNaN(fecha.getTime())) {
        return '--/--';
      }
      
      // Obtener componentes de la fecha
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const diaSemana = fecha.getDay();
      
      // Formatear con ceros a la izquierda
      const diaStr = dia.toString().padStart(2, '0');
      const mesStr = mes.toString().padStart(2, '0');
      const diaSemanaStr = DIAS_SEMANA[diaSemana];
      
      // Retornar en formato: "DD Día (DD/MM)"
      return `${diaStr} ${diaSemanaStr} (${diaStr}/${mesStr})`;
      
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '--/--';
    }
  };
  
  /**
   * Obtiene solo el día de la semana en español
   * 
   * @param fechaISO - Fecha en formato ISO string
   * @returns Día de la semana ("Lun", "Mar", etc.) o "---"
   */
  export const obtenerDiaSemana = (fechaISO: string): string => {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return '---';
      }
      return DIAS_SEMANA[fecha.getDay()];
    } catch (error) {
      console.error('Error al obtener día de la semana:', error);
      return '---';
    }
  };
  
  /**
   * Formatea solo la fecha sin día de la semana (formato anterior)
   * Mantenido para compatibilidad
   * 
   * @param fechaISO - Fecha en formato ISO string  
   * @returns String en formato "DD/MM" o "--/--"
   */
  export const formatearFechaSolo = (fechaISO: string): string => {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return '--/--';
      }
      
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      
      return `${dia}/${mes}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '--/--';
    }
  };
  
  /**
   * Verifica si una fecha corresponde a fin de semana
   * 
   * @param fechaISO - Fecha en formato ISO string
   * @returns true si es sábado o domingo
   */
  export const esFinDeSemana = (fechaISO: string): boolean => {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return false;
      }
      const diaSemana = fecha.getDay();
      return diaSemana === 0 || diaSemana === 6; // 0 = domingo, 6 = sábado
    } catch (error) {
      return false;
    }
  };

  /**
 * Convierte una fecha de input date (YYYY-MM-DD) a ISO string sin problemas de zona horaria
 * Mantiene el día exacto independiente de la zona horaria local
 * 
 * @param fechaInput - Fecha en formato YYYY-MM-DD del input date
 * @returns String ISO con día fijo (mediodía UTC)
 */
export const fechaInputAISO = (fechaInput: string): string => {
  if (!fechaInput || fechaInput.trim() === '') {
    throw new Error('Fecha input requerida');
  }
  
  // Validar formato básico YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInput)) {
    throw new Error('Formato de fecha inválido. Esperado: YYYY-MM-DD');
  }
  
  // Convertir a mediodía UTC para evitar cambios de día por zona horaria
  return `${fechaInput}T12:00:00.000Z`;
};

/**
 * Convierte una fecha ISO a formato para input date (YYYY-MM-DD)
 * Extrae solo la parte de fecha sin considerar hora/zona horaria
 * 
 * @param fechaISO - Fecha en formato ISO string
 * @returns String en formato YYYY-MM-DD para input date
 */
export const fechaISOAInput = (fechaISO: string): string => {
  try {
    if (!fechaISO || fechaISO.trim() === '') {
      return '';
    }
    
    // Extraer solo la parte de la fecha (antes de la T)
    return fechaISO.split('T')[0];
  } catch (error) {
    console.error('Error al convertir fecha ISO a input:', error);
    return '';
  }
};

/**
 * Formatear fecha para mostrar en cambios (DD/MM/YYYY)
 * Usa UTC para evitar problemas de zona horaria
 * 
 * @param fechaISO - Fecha en formato ISO string
 * @returns String en formato DD/MM/YYYY
 */
export const formatearFechaCambios = (fechaISO: string): string => {
  try {
    if (!fechaISO || fechaISO.trim() === '') {
      return '--/--/----';
    }
    
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      return '--/--/----';
    }
    
    // Usar UTC para mantener consistencia
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    
    return `${dia}/${mes}/${año}`;
  } catch (error) {
    console.error('Error al formatear fecha para cambios:', error);
    return '--/--/----';
  }
};