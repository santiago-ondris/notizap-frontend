import type {
    EstadoCalculoComision,
    EstadoDia,
    ComisionVendedora,
    VendedoraDisponible
  } from '@/types/vendedoras/comisionTypes';
  
  // ============================================
  // HELPERS PARA PREVIEW Y VALIDACIONES UX
  // ============================================
  
  export const comisionPreview = {
    /**
     * Calcula preview del monto sin IVA (21%) - SOLO PARA MOSTRAR AL USUARIO
     */
    previewMontoSinIva(montoFacturado: number): number {
      if (montoFacturado <= 0) return 0;
      return montoFacturado - (montoFacturado * 21 / 100);
    },
  
    /**
     * Calcula preview de comisión individual - SOLO PARA MOSTRAR AL USUARIO
     */
    previewComisionIndividual(montoFacturado: number, totalVendedoras: number): number {
      if (totalVendedoras <= 0 || montoFacturado <= 0) return 0;
      const montoSinIva = this.previewMontoSinIva(montoFacturado);
      return (montoSinIva * 1 / 100) / totalVendedoras;
    },
  
    /**
     * Calcula preview de comisión total del día - SOLO PARA MOSTRAR AL USUARIO
     */
    previewComisionTotal(montoFacturado: number): number {
      if (montoFacturado <= 0) return 0;
      const montoSinIva = this.previewMontoSinIva(montoFacturado);
      return montoSinIva * 1 / 100;
    },
  
    /**
     * Validaciones básicas de UX antes de enviar al backend
     */
    validacionesBasicasUX(
      fecha: Date,
      totalVendedoras: number
    ): { esValido: boolean; mensaje: string } {
      if (fecha > new Date()) {
        return { esValido: false, mensaje: 'No se pueden calcular comisiones para fechas futuras' };
      }
  
      if (totalVendedoras <= 0) {
        return { esValido: false, mensaje: 'Debe seleccionar al menos una vendedora' };
      }
  
      return { esValido: true, mensaje: '' };
    }
  };
  
  // ============================================
  // HELPERS PARA FORMATEO Y DISPLAY
  // ============================================
  
  export const comisionFormato = {
    /**
     * Formatea moneda argentina
     */
    formatearMoneda(monto: number): string {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(monto);
    },
  
    /**
     * Formatea fecha para mostrar (DD/MM/YYYY)
     */
    formatearFecha(fechaIso: string): string {
      const [año, mes, dia] = fechaIso.split('T')[0].split('-');
      const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      
      return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  
    /**
     * Formatea fecha con día de la semana
     */
    formatearFechaCompleta(fechaIso: string): string {
      // Forzar interpretación como fecha local, no UTC
      const [año, mes, dia] = fechaIso.split('T')[0].split('-');
      const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  
    /**
     * Formatea fecha y hora
     */
    formatearFechaHora(fechaIso: string): string {
      const fecha = new Date(fechaIso);
      return fecha.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  
    /**
     * Formatea turno con emoji
     */
    formatearTurno(turno: string): string {
      switch (turno) {
        case 'Mañana': return '🌅 Mañana';
        case 'Tarde': return '🌆 Tarde';
        default: return turno;
      }
    },
  
    /**
     * Formatea número con separadores de miles
     */
    formatearNumero(numero: number): string {
      return new Intl.NumberFormat('es-AR').format(numero);
    }
  };
  
  // ============================================
  // HELPERS PARA FECHAS
  // ============================================
  
  export const comisionFechas = {
    /**
     * Formatea fecha para envío a la API (YYYY-MM-DD)
     */
    formatearParaApi(fecha: Date): string {
      return fecha.toISOString().split('T')[0];
    },
  
    /**
     * Convierte string ISO a Date
     */
    desdeApi(fechaIso: string): Date {
      return new Date(fechaIso);
    },
  
    /**
     * Obtiene el primer día del mes anterior
     */
    primerDiaMesAnterior(): Date {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    },
  
    /**
     * Obtiene el último día del mes anterior
     */
    ultimoDiaMesAnterior(): Date {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    },
  
    /**
     * Obtiene el rango del mes anterior
     */
    rangoMesAnterior(): { inicio: Date; fin: Date } {
      return {
        inicio: this.primerDiaMesAnterior(),
        fin: this.ultimoDiaMesAnterior()
      };
    },
  
    /**
     * Verifica si es domingo
     */
    esDomingo(fecha: Date): boolean {
      return fecha.getDay() === 0;
    },
  
    /**
     * Verifica si es hoy
     */
    esHoy(fecha: Date): boolean {
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString();
    },
  
    /**
     * Obtiene el nombre del mes
     */
    nombreMes(mes: number): string {
      const nombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return nombres[mes - 1] || '';
    }
  };
  
  // ============================================
  // HELPERS PARA ESTADOS DE COMISIONES
  // ============================================
  
  export const comisionEstados = {
    /**
     * Determina el estado de un día basado en los estados por sucursal/turno
     */
    determinarEstadoDia(estados: EstadoCalculoComision[]): EstadoDia {
      console.log('🔍 Determinando estado para:', estados);
      if (!estados || estados.length === 0) {
        console.log('❌ Sin estados');
        return 'sin-datos';
      }
  
      const conVentas = estados.filter(e => e.tieneVentas);
      console.log('✅ Con ventas:', conVentas);
      
      if (conVentas.length === 0) {
        return 'sin-datos';
      }
  
      const calculadas = conVentas.filter(e => e.tieneComisionesCalculadas);
      
      if (calculadas.length === 0) {
        return 'pendiente';
      }
      
      if (calculadas.length === conVentas.length) {
        return 'completo';
      }
      
      return 'parcial';
    },
  
    /**
     * Obtiene el color para el estado del día
     */
    colorEstado(estado: EstadoDia): string {
      switch (estado) {
        case 'completo': return 'bg-green-500/20 border-green-500/40 text-green-300';
        case 'parcial': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
        case 'pendiente': return 'bg-red-500/20 border-red-500/40 text-red-300';
        case 'sin-datos': return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
        default: return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
      }
    },
  
    /**
     * Obtiene el texto descriptivo para el estado
     */
    textoEstado(estado: EstadoDia): string {
      switch (estado) {
        case 'completo': return '✅ Completado';
        case 'parcial': return '⚠️ Parcial';
        case 'pendiente': return '❌ Pendiente';
        case 'sin-datos': return '⚪ Sin datos';
        default: return 'Sin información';
      }
    },
  
    /**
     * Obtiene el emoji para el estado
     */
    emojiEstado(estado: EstadoDia): string {
      switch (estado) {
        case 'completo': return '✅';
        case 'parcial': return '⚠️';
        case 'pendiente': return '❌';
        case 'sin-datos': return '⚪';
        default: return '❓';
      }
    }
  };
  
  // ============================================
  // HELPERS PARA VENDEDORAS
  // ============================================
  
  export const comisionVendedoras = {
    /**
     * Filtra vendedoras por criterio de búsqueda
     */
    filtrarVendedoras(vendedoras: VendedoraDisponible[], busqueda: string): VendedoraDisponible[] {
      if (!busqueda.trim()) return vendedoras;
      
      const busquedaLower = busqueda.toLowerCase();
      return vendedoras.filter(v => 
        v.nombre.toLowerCase().includes(busquedaLower)
      );
    },
  
    /**
     * Ordena vendedoras por nombre
     */
    ordenarPorNombre(vendedoras: VendedoraDisponible[]): VendedoraDisponible[] {
      return [...vendedoras].sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
  
    /**
     * Separa vendedoras con ventas de las disponibles
     */
    separarVendedoras(vendedoras: VendedoraDisponible[]): {
      conVentas: VendedoraDisponible[];
      disponibles: VendedoraDisponible[];
    } {
      return {
        conVentas: vendedoras.filter(v => v.tieneVentasEnElDia),
        disponibles: vendedoras.filter(v => !v.tieneVentasEnElDia)
      };
    },
  
    /**
     * Validaciones UX para selección de vendedoras
     */
    validarSeleccionUX(vendedoras: VendedoraDisponible[]): { esValida: boolean; mensaje: string } {
      const seleccionadas = vendedoras.filter(v => v.estaSeleccionada);
      
      if (seleccionadas.length === 0) {
        return { esValida: false, mensaje: 'Debe seleccionar al menos una vendedora' };
      }
      
      return { esValida: true, mensaje: '' };
    }
  };
  
  // ============================================
  // HELPERS PARA ESTADÍSTICAS Y RESÚMENES
  // ============================================
  
  export const comisionEstadisticas = {
    /**
     * Calcula promedio de comisiones
     */
    promedioComisiones(comisiones: ComisionVendedora[]): number {
      if (comisiones.length === 0) return 0;
      const total = comisiones.reduce((sum, c) => sum + c.montoComision, 0);
      return total / comisiones.length;
    },
  
    /**
     * Calcula total de comisiones
     */
    totalComisiones(comisiones: ComisionVendedora[]): number {
      return comisiones.reduce((sum, c) => sum + c.montoComision, 0);
    },
  
    /**
     * Agrupa comisiones por vendedora
     */
    agruparPorVendedora(comisiones: ComisionVendedora[]): Map<string, ComisionVendedora[]> {
      const grupos = new Map<string, ComisionVendedora[]>();
      
      comisiones.forEach(comision => {
        const vendedora = comision.vendedorNombre;
        if (!grupos.has(vendedora)) {
          grupos.set(vendedora, []);
        }
        grupos.get(vendedora)!.push(comision);
      });
      
      return grupos;
    },
  
    /**
     * Calcula resumen por vendedora
     */
    resumenPorVendedora(comisiones: ComisionVendedora[]): Array<{
      vendedora: string;
      total: number;
      dias: number;
      promedio: number;
    }> {
      const grupos = this.agruparPorVendedora(comisiones);
      const resumen: Array<{
        vendedora: string;
        total: number;
        dias: number;
        promedio: number;
      }> = [];
      
      grupos.forEach((comisionesVendedora, vendedora) => {
        const total = this.totalComisiones(comisionesVendedora);
        const dias = comisionesVendedora.length;
        const promedio = dias > 0 ? total / dias : 0;
        
        resumen.push({
          vendedora,
          total,
          dias,
          promedio
        });
      });
      
      return resumen.sort((a, b) => b.total - a.total);
    }
  };