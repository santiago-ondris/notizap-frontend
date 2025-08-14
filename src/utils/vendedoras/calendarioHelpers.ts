import type {
    CalendarioComisiones,
    EstadoCalculoComision,
    DiaCalendario,
    EstadoDia
  } from '@/types/vendedoras/comisionTypes';
  import { comisionEstados } from './comisionHelpers';
  
  // ============================================
  // HELPERS PARA GENERACIÓN DEL CALENDARIO
  // ============================================
  
  export const calendarioGeneracion = {
    /**
     * Genera la estructura básica del calendario para un mes
     */
    generarDiasDelMes(año: number, mes: number): DiaCalendario[] {
      const primerDia = new Date(año, mes - 1, 1);
      const ultimoDia = new Date(año, mes, 0);
      const diasEnMes = ultimoDia.getDate();
      
      // Agregar días del mes anterior para completar la primera semana
      const diasAnteriores = this.obtenerDiasAnteriores(primerDia);
      
      // Generar días del mes actual
      const diasActuales = Array.from({ length: diasEnMes }, (_, i) => {
        const fecha = new Date(año, mes - 1, i + 1);
        return this.crearDiaCalendario(fecha, true);
      });
      
      // Agregar días del mes siguiente para completar la última semana
      const diasSiguientes = this.obtenerDiasSiguientes(ultimoDia);
      
      return [...diasAnteriores, ...diasActuales, ...diasSiguientes];
    },
  
    /**
     * Crea un objeto DiaCalendario
     */
    crearDiaCalendario(fecha: Date, esDelMes: boolean = true): DiaCalendario {
      return {
        fecha: this.formatearFechaParaApi(fecha),
        dia: fecha.getDate(),
        estado: 'sin-datos',
        estadosPorSucursalTurno: [],
        esHoy: this.esHoy(fecha),
        esDomingo: this.esDomingo(fecha),
        esDelMes
      };
    },
  
    /**
     * Obtiene días del mes anterior para completar la primera semana
     */
    obtenerDiasAnteriores(primerDia: Date): DiaCalendario[] {
      const diaSemana = primerDia.getDay();
      const diasAMostrar = diaSemana === 0 ? 6 : diaSemana - 1; // Lunes = 0
      
      const dias: DiaCalendario[] = [];
      for (let i = diasAMostrar; i > 0; i--) {
        const fecha = new Date(primerDia);
        fecha.setDate(fecha.getDate() - i);
        dias.push(this.crearDiaCalendario(fecha, false));
      }
      
      return dias;
    },
  
    /**
     * Obtiene días del mes siguiente para completar la última semana
     */
    obtenerDiasSiguientes(ultimoDia: Date): DiaCalendario[] {
      const diaSemana = ultimoDia.getDay();
      const diasAMostrar = diaSemana === 0 ? 0 : 7 - diaSemana; // Completar hasta domingo
      
      const dias: DiaCalendario[] = [];
      for (let i = 1; i <= diasAMostrar; i++) {
        const fecha = new Date(ultimoDia);
        fecha.setDate(fecha.getDate() + i);
        dias.push(this.crearDiaCalendario(fecha, false));
      }
      
      return dias;
    },
  
    /**
     * Formatea fecha para API (YYYY-MM-DD)
     */
    formatearFechaParaApi(fecha: Date): string {
      return fecha.toISOString().split('T')[0];
    },
  
    /**
     * Verifica si es hoy
     */
    esHoy(fecha: Date): boolean {
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString();
    },
  
    /**
     * Verifica si es domingo
     */
    esDomingo(fecha: Date): boolean {
      return fecha.getDay() === 0;
    }
  };
  
  // ============================================
  // HELPERS PARA ACTUALIZACIÓN DEL CALENDARIO
  // ============================================
  
  export const calendarioActualizacion = {
    /**
     * Actualiza los días del calendario con datos del backend
     */
    actualizarConDatos(
      diasCalendario: DiaCalendario[],
      datosBackend: CalendarioComisiones[]
    ): DiaCalendario[] {
      const mapaEstados = new Map<string, EstadoCalculoComision[]>();
      
      // Crear mapa de fechas -> estados
      datosBackend.forEach(item => {
        const fechaSinHora = item.fecha.split('T')[0];
        mapaEstados.set(fechaSinHora, item.estadosPorSucursalTurno);
      });
      
      // Actualizar cada día
      return diasCalendario.map(dia => ({
        ...dia,
        estadosPorSucursalTurno: mapaEstados.get(dia.fecha) || [],
        estado: comisionEstados.determinarEstadoDia(mapaEstados.get(dia.fecha) || [])
      }));
    },
  
    /**
     * Filtra días según los filtros aplicados
     */
    aplicarFiltros(
      dias: DiaCalendario[],
      sucursalNombre?: string,
      turno?: string
    ): DiaCalendario[] {
      if (!sucursalNombre && !turno) return dias;
      
      return dias.map(dia => {
        let estadosFiltrados = dia.estadosPorSucursalTurno;
        
        if (sucursalNombre) {
          estadosFiltrados = estadosFiltrados.filter(e => 
            e.sucursalNombre === sucursalNombre
          );
        }
        
        if (turno && turno !== '') {
          estadosFiltrados = estadosFiltrados.filter(e => 
            e.turno === turno
          );
        }
        
        return {
          ...dia,
          estadosPorSucursalTurno: estadosFiltrados,
          estado: comisionEstados.determinarEstadoDia(estadosFiltrados)
        };
      });
    }
  };
  
  // ============================================
  // HELPERS PARA NAVEGACIÓN DEL CALENDARIO
  // ============================================
  
  export const calendarioNavegacion = {
    /**
     * Obtiene el mes anterior
     */
    mesAnterior(año: number, mes: number): { año: number; mes: number } {
      if (mes === 1) {
        return { año: año - 1, mes: 12 };
      }
      return { año, mes: mes - 1 };
    },
  
    /**
     * Obtiene el mes siguiente
     */
    mesSiguiente(año: number, mes: number): { año: number; mes: number } {
      if (mes === 12) {
        return { año: año + 1, mes: 1 };
      }
      return { año, mes: mes + 1 };
    },
  
    /**
     * Obtiene el mes anterior como fecha
     */
    fechaMesAnterior(): { año: number; mes: number } {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = hoy.getMonth(); // 0-11
      
      if (mes === 0) {
        return { año: año - 1, mes: 12 };
      }
      return { año, mes };
    },
  
    /**
     * Formatea título del mes
     */
    formatearTituloMes(año: number, mes: number): string {
      const nombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${nombres[mes - 1]} ${año}`;
    },
  
    /**
     * Verifica si un mes está en el futuro
     */
    esEnElFuturo(año: number, mes: number): boolean {
      const hoy = new Date();
      const fechaMes = new Date(año, mes - 1, 1);
      const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      
      return fechaMes > fechaHoy;
    },
  
    /**
     * Verifica si se puede navegar hacia adelante
     */
    puedeAvanzar(año: number, mes: number): boolean {
      return !this.esEnElFuturo(año, mes + 1);
    }
  };
  
  // ============================================
  // HELPERS PARA ANÁLISIS DEL CALENDARIO
  // ============================================
  
  export const calendarioAnalisis = {
    /**
     * Cuenta días por estado
     */
    contarPorEstado(dias: DiaCalendario[]): {
      completo: number;
      parcial: number;
      pendiente: number;
      sinDatos: number;
    } {
      const contadores = {
        completo: 0,
        parcial: 0,
        pendiente: 0,
        sinDatos: 0
      };
      
      dias.filter(d => d.esDelMes).forEach(dia => {
        switch (dia.estado) {
          case 'completo': contadores.completo++; break;
          case 'parcial': contadores.parcial++; break;
          case 'pendiente': contadores.pendiente++; break;
          case 'sin-datos': contadores.sinDatos++; break;
        }
      });
      
      return contadores;
    },
  
    /**
     * Calcula porcentaje de completitud
     */
    porcentajeCompletitud(dias: DiaCalendario[]): number {
      const diasDelMes = dias.filter(d => d.esDelMes);
      const diasConDatos = diasDelMes.filter(d => d.estado !== 'sin-datos');
      const diasCompletos = diasDelMes.filter(d => d.estado === 'completo');
      
      if (diasConDatos.length === 0) return 0;
      
      return Math.round((diasCompletos.length / diasConDatos.length) * 100);
    },
  
    /**
     * Obtiene estadísticas del mes
     */
    estadisticasMes(dias: DiaCalendario[]): {
      totalDias: number;
      diasConDatos: number;
      diasCompletos: number;
      diasPendientes: number;
      porcentajeCompletitud: number;
    } {
      const diasDelMes = dias.filter(d => d.esDelMes);
      const contadores = this.contarPorEstado(dias);
      
      return {
        totalDias: diasDelMes.length,
        diasConDatos: contadores.completo + contadores.parcial + contadores.pendiente,
        diasCompletos: contadores.completo,
        diasPendientes: contadores.pendiente + contadores.parcial,
        porcentajeCompletitud: this.porcentajeCompletitud(dias)
      };
    },
  
    /**
     * Identifica días que necesitan atención
     */
    diasQueNecesitanAtencion(dias: DiaCalendario[]): DiaCalendario[] {
      return dias
        .filter(d => d.esDelMes && (d.estado === 'pendiente' || d.estado === 'parcial'))
        .sort((a, b) => a.dia - b.dia);
    }
  };
  
  // ============================================
  // HELPERS PARA DETALLE DE DÍAS
  // ============================================
  
  export const calendarioDetalle = {
    /**
     * Obtiene resumen de un día específico
     */
    resumenDia(dia: DiaCalendario): {
      fecha: string;
      estado: EstadoDia;
      totalSucursales: number;
      sucursalesCompletas: number;
      totalTurnos: number;
      turnosCompletos: number;
    } {
      const estados = dia.estadosPorSucursalTurno;
      const conVentas = estados.filter(e => e.tieneVentas);
      const calculadas = estados.filter(e => e.tieneComisionesCalculadas);
      
      const sucursales = new Set(estados.map(e => e.sucursalNombre));
      const sucursalesCompletas = new Set(
        estados
          .filter(e => e.tieneVentas && e.tieneComisionesCalculadas)
          .map(e => e.sucursalNombre)
      );
      
      return {
        fecha: dia.fecha,
        estado: dia.estado,
        totalSucursales: sucursales.size,
        sucursalesCompletas: sucursalesCompletas.size,
        totalTurnos: conVentas.length,
        turnosCompletos: calculadas.length
      };
    },
  
    /**
     * Agrupa estados por sucursal
     */
    agruparPorSucursal(estados: EstadoCalculoComision[]): Map<string, EstadoCalculoComision[]> {
      const grupos = new Map<string, EstadoCalculoComision[]>();
      
      estados.forEach(estado => {
        const sucursal = estado.sucursalNombre;
        if (!grupos.has(sucursal)) {
          grupos.set(sucursal, []);
        }
        grupos.get(sucursal)!.push(estado);
      });
      
      return grupos;
    },
  
    /**
     * Calcula totales por sucursal
     */
    totalesPorSucursal(estados: EstadoCalculoComision[]): Array<{
      sucursal: string;
      montoTotal: number;
      vendedorasTotal: number;
      turnosCompletos: number;
      turnosTotal: number;
    }> {
      const grupos = this.agruparPorSucursal(estados);
      const totales: Array<{
        sucursal: string;
        montoTotal: number;
        vendedorasTotal: number;
        turnosCompletos: number;
        turnosTotal: number;
      }> = [];
      
      grupos.forEach((estadosSucursal, sucursal) => {
        const conVentas = estadosSucursal.filter(e => e.tieneVentas);
        const calculadas = estadosSucursal.filter(e => e.tieneComisionesCalculadas);
        
        totales.push({
          sucursal,
          montoTotal: conVentas.reduce((sum, e) => sum + e.montoFacturado, 0),
          vendedorasTotal: conVentas.reduce((sum, e) => sum + e.vendedorasConVentas, 0),
          turnosCompletos: calculadas.length,
          turnosTotal: conVentas.length
        });
      });
      
      return totales.sort((a, b) => a.sucursal.localeCompare(b.sucursal));
    }
  };