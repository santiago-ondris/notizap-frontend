export const turnoHelpers = {
    determinarTurno(fecha: Date): 'Mañana' | 'Tarde' {
      const hora = fecha.getHours();
      const minutos = fecha.getMinutes();
      const tiempoEnMinutos = hora * 60 + minutos;
      
      // Mañana: 8:00 - 14:30 (480 - 870 minutos)
      if (tiempoEnMinutos >= 480 && tiempoEnMinutos <= 870) {
        return 'Mañana';
      }
      
      // Tarde: 15:00 - 22:00 (900 - 1320 minutos)
      if (tiempoEnMinutos >= 900 && tiempoEnMinutos <= 1320) {
        return 'Tarde';
      }
      
      // Por defecto mañana para casos edge
      return 'Mañana';
    },
  
    obtenerInfoTurno(turno: 'Mañana' | 'Tarde') {
      const info = {
        Mañana: {
          emoji: '🌅',
          horario: '8:00 - 14:30',
          descripcion: 'Turno Mañana',
          color: '#51590E', 
          horaInicio: '08:00',
          horaFin: '14:30'
        },
        Tarde: {
          emoji: '🌆',
          horario: '15:00 - 22:00',
          descripcion: 'Turno Tarde',
          color: '#D94854', 
          horaInicio: '15:00',
          horaFin: '22:00'
        }
      };
      
      return info[turno];
    },
  
    formatearTurno(turno: 'Mañana' | 'Tarde'): string {
      const info = this.obtenerInfoTurno(turno);
      return `${info.emoji} ${info.descripcion} (${info.horario})`;
    },
  
    formatearTurnoCorto(turno: 'Mañana' | 'Tarde'): string {
      const info = this.obtenerInfoTurno(turno);
      return `${info.emoji} ${turno}`;
    },
  
    puedeVenderEnSabadoTarde(sucursal: string, turno: 'Mañana' | 'Tarde'): boolean {
      const sucursalesEspeciales = ['25 de mayo', 'DEAN FUNES'];
      
      if (turno === 'Tarde' && sucursalesEspeciales.includes(sucursal)) {
        return false;
      }
      
      return true;
    },
  
    obtenerMensajeHorarioEspecial(sucursal: string, fecha: string): string | null {
      const sucursalesEspeciales = ['25 de mayo', 'DEAN FUNES'];
      const esSabado = new Date(fecha).getDay() === 6;
      
      if (esSabado && sucursalesEspeciales.includes(sucursal)) {
        return `⚠️ ${sucursal} solo abre sábados por la mañana`;
      }
      
      return null;
    },
  
    compararTurnos(datosManana: any[], datosTarde: any[]) {
      const calcularTotal = (datos: any[]) => 
        datos.reduce((sum, item) => sum + (item.montoTotal || item.total || 0), 0);
      
      const totalManana = calcularTotal(datosManana);
      const totalTarde = calcularTotal(datosTarde);
      const totalGeneral = totalManana + totalTarde;
      
      return {
        mañana: {
          total: totalManana,
          porcentaje: totalGeneral > 0 ? (totalManana / totalGeneral) * 100 : 0,
          cantidad: datosManana.length,
          emoji: '🌅'
        },
        tarde: {
          total: totalTarde,
          porcentaje: totalGeneral > 0 ? (totalTarde / totalGeneral) * 100 : 0,
          cantidad: datosTarde.length,
          emoji: '🌆'
        },
        mejorTurno: totalManana > totalTarde ? 'Mañana' : 'Tarde',
        diferencia: Math.abs(totalManana - totalTarde),
        diferenciaPorc: totalGeneral > 0 ? Math.abs((totalManana - totalTarde) / totalGeneral) * 100 : 0
      };
    },
  
    obtenerConfigTurnoParaGrafico(turno: 'Mañana' | 'Tarde') {
      const info = this.obtenerInfoTurno(turno);
      return {
        name: info.descripcion,
        color: info.color,
        emoji: info.emoji,
        strokeWidth: 3
      };
    },
  
    aplicarFiltroTurno(datos: any[], turno: 'Mañana' | 'Tarde' | 'Todos'): any[] {
      if (turno === 'Todos') return datos;
      return datos.filter(item => item.turno === turno);
    },
  
    obtenerAlertaRendimientoTurno(datos: any[]): string | null {
      if (datos.length < 2) return null;
      
      const porManana = datos.filter(d => d.turno === 'Mañana');
      const porTarde = datos.filter(d => d.turno === 'Tarde');
      
      if (porManana.length === 0) {
        return '⚠️ No hay ventas registradas en el turno mañana';
      }
      
      if (porTarde.length === 0) {
        return '⚠️ No hay ventas registradas en el turno tarde';
      }
      
      const comparacion = this.compararTurnos(porManana, porTarde);
      
      if (comparacion.diferenciaPorc > 70) {
        const turnoMejor = comparacion.mejorTurno;
        const emoji = turnoMejor === 'Mañana' ? '🌅' : '🌆';
        return `${emoji} Gran diferencia: turno ${turnoMejor} supera significativamente al otro`;
      }
      
      return null;
    }
  };