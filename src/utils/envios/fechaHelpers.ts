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