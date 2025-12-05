import type {
    EstadoCalculoComision,
    EstadoDia,
    ComisionVendedora,
    VendedoraDisponible
  } from '@/types/vendedoras/comisionTypes';
  
  export const comisionPreview = {
    previewMontoSinIva(montoFacturado: number): number {
      if (montoFacturado <= 0) return 0;
      return montoFacturado - (montoFacturado * 21 / 100);
    },
  
    previewComisionIndividual(montoFacturado: number, totalVendedoras: number, porcentajeComision: number = 1): number {
      if (totalVendedoras <= 0 || montoFacturado <= 0) return 0;
      const montoSinIva = this.previewMontoSinIva(montoFacturado);
      return (montoSinIva * porcentajeComision / 100) / totalVendedoras;
    },
  
    previewComisionTotal(montoFacturado: number, porcentajeComision: number = 1): number {
      if (montoFacturado <= 0) return 0;
      const montoSinIva = this.previewMontoSinIva(montoFacturado);
      return montoSinIva * porcentajeComision / 100;
    },
  
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
  
  export const comisionFormato = {
    formatearMoneda(monto: number): string {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(monto);
    },
  
    formatearFecha(fechaIso: string): string {
      const [año, mes, dia] = fechaIso.split('T')[0].split('-');
      const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      
      return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  
    formatearFechaCompleta(fechaIso: string): string {
      const [año, mes, dia] = fechaIso.split('T')[0].split('-');
      const fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  
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
  
    formatearTurno(turno: string): string {
      switch (turno) {
        case 'Mañana': return '🌅 Mañana';
        case 'Tarde': return '🌆 Tarde';
        default: return turno;
      }
    },
  
    formatearNumero(numero: number): string {
      return new Intl.NumberFormat('es-AR').format(numero);
    }
  };
  
  export const comisionFechas = {
    formatearParaApi(fecha: Date): string {
      return fecha.toISOString().split('T')[0];
    },

    formatearFechaCorta(fecha: Date): string {
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}${mes}${dia}`;
    },
  
    desdeApi(fechaIso: string): Date {
      return new Date(fechaIso);
    },
  
    primerDiaMesAnterior(): Date {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    },
  
    ultimoDiaMesAnterior(): Date {
      const hoy = new Date();
      return new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    },
  
    rangoMesAnterior(): { inicio: Date; fin: Date } {
      return {
        inicio: this.primerDiaMesAnterior(),
        fin: this.ultimoDiaMesAnterior()
      };
    },
  
    esDomingo(fecha: Date): boolean {
      return fecha.getDay() === 0;
    },
  
    esHoy(fecha: Date): boolean {
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString();
    },
  
    nombreMes(mes: number): string {
      const nombres = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return nombres[mes - 1] || '';
    }
  };
  
  export const comisionEstados = {
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
  
    colorEstado(estado: EstadoDia): string {
      switch (estado) {
        case 'completo': return 'bg-green-500/20 border-green-500/40 text-green-300';
        case 'parcial': return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
        case 'pendiente': return 'bg-red-500/20 border-red-500/40 text-red-300';
        case 'sin-datos': return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
        default: return 'bg-gray-500/20 border-gray-500/40 text-gray-400';
      }
    },
  
    textoEstado(estado: EstadoDia): string {
      switch (estado) {
        case 'completo': return '✅ Completado';
        case 'parcial': return '⚠️ Parcial';
        case 'pendiente': return '❌ Pendiente';
        case 'sin-datos': return '⚪ Sin datos';
        default: return 'Sin información';
      }
    },
  
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
  
  export const comisionVendedoras = {
    filtrarVendedoras(vendedoras: VendedoraDisponible[], busqueda: string): VendedoraDisponible[] {
      if (!busqueda.trim()) return vendedoras;
      
      const busquedaLower = busqueda.toLowerCase();
      return vendedoras.filter(v => 
        v.nombre.toLowerCase().includes(busquedaLower)
      );
    },
  
    ordenarPorNombre(vendedoras: VendedoraDisponible[]): VendedoraDisponible[] {
      return [...vendedoras].sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
  
    separarVendedoras(vendedoras: VendedoraDisponible[]): {
      conVentas: VendedoraDisponible[];
      disponibles: VendedoraDisponible[];
    } {
      return {
        conVentas: vendedoras.filter(v => v.tieneVentasEnElDia),
        disponibles: vendedoras.filter(v => !v.tieneVentasEnElDia)
      };
    },
  
    validarSeleccionUX(vendedoras: VendedoraDisponible[]): { esValida: boolean; mensaje: string } {
      const seleccionadas = vendedoras.filter(v => v.estaSeleccionada);
      
      if (seleccionadas.length === 0) {
        return { esValida: false, mensaje: 'Debe seleccionar al menos una vendedora' };
      }
      
      return { esValida: true, mensaje: '' };
    }
  };
  
  export const comisionEstadisticas = {
    promedioComisiones(comisiones: ComisionVendedora[]): number {
      if (comisiones.length === 0) return 0;
      const total = comisiones.reduce((sum, c) => sum + c.montoComision, 0);
      return total / comisiones.length;
    },
  
    totalComisiones(comisiones: ComisionVendedora[]): number {
      return comisiones.reduce((sum, c) => sum + c.montoComision, 0);
    },
  
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