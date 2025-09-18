const DIAS_SEMANA = [
    'Domingo', 
    'Lunes', 
    'Martes', 
    'Miércoles', 
    'Jueves', 
    'Viernes', 
    'Sábado'  
  ];
  
  export const formatearFechaConDia = (fechaISO: string): string => {
    try {
      const fecha = new Date(fechaISO);
      
      if (isNaN(fecha.getTime())) {
        return '--/--';
      }
      
      const dia = fecha.getDate();
      const mes = fecha.getMonth() + 1;
      const diaSemana = fecha.getDay();
      
      const diaStr = dia.toString().padStart(2, '0');
      const mesStr = mes.toString().padStart(2, '0');
      const diaSemanaStr = DIAS_SEMANA[diaSemana];
      
      return `${diaStr} ${diaSemanaStr} (${diaStr}/${mesStr})`;
      
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '--/--';
    }
  };
  
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
  
  export const esFinDeSemana = (fechaISO: string): boolean => {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return false;
      }
      const diaSemana = fecha.getDay();
      return diaSemana === 0 || diaSemana === 6; 
    } catch (error) {
      return false;
    }
  };

export const fechaInputAISO = (fechaInput: string): string => {
  if (!fechaInput || fechaInput.trim() === '') {
    throw new Error('Fecha input requerida');
  }
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInput)) {
    throw new Error('Formato de fecha inválido. Esperado: YYYY-MM-DD');
  }
  
  return `${fechaInput}T12:00:00.000Z`;
};

export const fechaISOAInput = (fechaISO: string): string => {
  try {
    if (!fechaISO || fechaISO.trim() === '') {
      return '';
    }
    
    return fechaISO.split('T')[0];
  } catch (error) {
    console.error('Error al convertir fecha ISO a input:', error);
    return '';
  }
};

export const formatearFechaCambios = (fechaISO: string): string => {
  try {
    if (!fechaISO || fechaISO.trim() === '') {
      return '--/--/----';
    }
    
    const fecha = new Date(fechaISO);
    
    if (isNaN(fecha.getTime())) {
      return '--/--/----';
    }
    
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    
    return `${dia}/${mes}/${año}`;
  } catch (error) {
    console.error('Error al formatear fecha para cambios:', error);
    return '--/--/----';
  }
};