export const dateHelpers = {
  // Formateo para display
  formatearFechaCorta(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  },

  formatearFechaCompleta(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  formatearFechaConDia(fechaISO: string): string {
    const [datePart] = fechaISO.split('T');
    const [year, month, day] = datePart.split('-').map(n => parseInt(n, 10));
    const fecha = new Date(year, month - 1, day, 12, 0, 0);
    return fecha.toLocaleDateString('es-AR', {
      weekday: 'short',
      day:     '2-digit',
      month:   '2-digit'
    });
  },

  formatearFechaHora(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Formateo para inputs y API
  formatearParaInput(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  },

  formatearParaAPI(fecha: Date): string {
    return fecha.toISOString();
  },

  // Detectores de días especiales
  esSabado(fechaISO: string): boolean {
    const fecha = new Date(fechaISO);
    return fecha.getDay() === 6;
  },

  esDomingo(fechaISO: string): boolean {
    const fecha = new Date(fechaISO);
    return fecha.getDay() === 0;
  },

  esFinDeSemana(fechaISO: string): boolean {
    return this.esSabado(fechaISO) || this.esDomingo(fechaISO);
  },

  // Generadores de rangos comunes
  obtenerUltimaSemana(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    return {
      inicio: hace7Dias,
      fin: hoy
    };
  },

  obtenerMesActual(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    return {
      inicio: inicioMes,
      fin: finMes
    };
  },

  obtenerMesAnterior(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    
    return {
      inicio: inicioMesAnterior,
      fin: finMesAnterior
    };
  },

  obtenerUltimos30Dias(): { inicio: Date; fin: Date } {
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    return {
      inicio: hace30Dias,
      fin: hoy
    };
  },

  // Validaciones
  validarRangoFechas(inicio?: Date, fin?: Date): { valido: boolean; mensaje?: string } {
    if (!inicio || !fin) {
      return { valido: true }; // Rangos opcionales son válidos
    }

    if (inicio > fin) {
      return { 
        valido: false, 
        mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin' 
      };
    }

    // Validar que no sea más de 1 año
    const unAno = 365 * 24 * 60 * 60 * 1000;
    if (fin.getTime() - inicio.getTime() > unAno) {
      return { 
        valido: false, 
        mensaje: 'El rango no puede exceder 1 año' 
      };
    }

    // Validar que no sea en el futuro (más de 1 día)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    if (inicio > mañana || fin > mañana) {
      return { 
        valido: false, 
        mensaje: 'No se pueden seleccionar fechas futuras' 
      };
    }

    return { valido: true };
  },

  // Helpers para análisis
  calcularDiasHabiles(fechaInicio: Date, fechaFin: Date): number {
    let dias = 0;
    const fecha = new Date(fechaInicio);
    
    while (fecha <= fechaFin) {
      const diaSemana = fecha.getDay();
      // Excluir domingos (0)
      if (diaSemana !== 0) {
        dias++;
      }
      fecha.setDate(fecha.getDate() + 1);
    }
    
    return dias;
  },

  obtenerEmojiDia(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDay();
    
    const emojis = {
      0: '🌙', // Domingo
      1: '💼', // Lunes
      2: '💼', // Martes
      3: '💼', // Miércoles
      4: '💼', // Jueves
      5: '💼', // Viernes
      6: '🎯'  // Sábado
    };
    
    return emojis[dia as keyof typeof emojis] || '📅';
  },

  obtenerDescripcionTurno(turno: 'Mañana' | 'Tarde'): string {
    return turno === 'Mañana' 
      ? '🌅 Mañana (8:00-14:30)' 
      : '🌆 Tarde (15:00-22:00)';
  }
};