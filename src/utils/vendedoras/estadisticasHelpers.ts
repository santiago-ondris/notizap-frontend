import type { 
  VentaVendedoraStats, 
  VentaPorVendedora, 
  VentaPorSucursal,
  VentaPorDia 
} from '@/types/vendedoras/ventaVendedoraTypes';

export const estadisticasHelpers = {
  // Formateo de moneda
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto);
  },

  // Formateo de moneda sin decimales para números grandes
  formatearMonedaCompleta(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  },

  formatearMonedaCompacta(monto: number): string {
    if (monto >= 1000000) {
      return `$${(monto / 1000000).toFixed(1)}M`;
    }
    if (monto >= 1000) {
      return `$${(monto / 1000).toFixed(1)}K`;
    }
    return this.formatearMonedaCompleta(monto);
  },

  // Formateo de números
  formatearNumero(numero: number): string {
    return new Intl.NumberFormat('es-AR').format(numero);
  },

  formatearPorcentaje(valor: number): string {
    return `${valor.toFixed(1)}%`;
  },

  // Calculadores de rendimiento
  calcularCrecimiento(valorActual: number, valorAnterior: number): {
    porcentaje: number;
    tendencia: 'up' | 'down' | 'stable';
    emoji: string;
  } {
    if (valorAnterior === 0) {
      return {
        porcentaje: valorActual > 0 ? 100 : 0,
        tendencia: valorActual > 0 ? 'up' : 'stable',
        emoji: valorActual > 0 ? '🚀' : '➖'
      };
    }

    const cambio = ((valorActual - valorAnterior) / valorAnterior) * 100;
    
    return {
      porcentaje: Math.abs(cambio),
      tendencia: cambio > 5 ? 'up' : cambio < -5 ? 'down' : 'stable',
      emoji: cambio > 5 ? '📈' : cambio < -5 ? '📉' : '➖'
    };
  },

  calcularPromedios(stats: VentaVendedoraStats) {
    const { diasConVentas, montoTotal, cantidadTotal, topVendedoras } = stats;
    const numVendedoras = topVendedoras?.length || 0;
    
    return {
      ventaPorDia: diasConVentas > 0 ? montoTotal / diasConVentas : 0,
      cantidadPorDia: diasConVentas > 0 ? cantidadTotal / diasConVentas : 0,
      ventaPorVendedora: numVendedoras > 0 ? 
        montoTotal / numVendedoras : 0,
      eficienciaDiaria: diasConVentas > 0 ? 
        (montoTotal / diasConVentas) / (numVendedoras || 1) : 0,
      // Nueva función para promedio de cantidad neta vendida por día
      ventasNetasPorDia: diasConVentas > 0 ? stats.cantidadTotal / diasConVentas : 0
    };
  },

  // Ranking y comparaciones
  generarRankingVendedoras(vendedoras: VentaPorVendedora[]): VentaPorVendedora[] {
    return vendedoras
      .sort((a, b) => b.montoTotal - a.montoTotal)
      .map((vendedora, index) => ({
        ...vendedora,
        posicion: index + 1,
        emoji: this.obtenerEmojiPosicion(index + 1)
      }));
  },

  obtenerEmojiPosicion(posicion: number): string {
    const emojis = {
      1: '🥇',
      2: '🥈', 
      3: '🥉'
    };
    return emojis[posicion as keyof typeof emojis] || '🏅';
  },

  // Análisis de tendencias
  analizarTendenciaSemanal(ventasPorDia: VentaPorDia[]): {
    tendencia: 'creciente' | 'decreciente' | 'estable';
    fuerza: 'fuerte' | 'moderada' | 'débil';
    mejorDia: VentaPorDia | null;
    peorDia: VentaPorDia | null;
    emoji: string;
  } {
    if (ventasPorDia.length < 3) {
      return {
        tendencia: 'estable',
        fuerza: 'débil',
        mejorDia: null,
        peorDia: null,
        emoji: '📊'
      };
    }

    const ordenados = [...ventasPorDia].sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    const inicio = ordenados.slice(0, Math.ceil(ordenados.length / 3));
    const fin = ordenados.slice(-Math.ceil(ordenados.length / 3));

    const promedioInicio = inicio.reduce((sum, dia) => sum + dia.montoTotal, 0) / inicio.length;
    const promedioFin = fin.reduce((sum, dia) => sum + dia.montoTotal, 0) / fin.length;

    const cambio = ((promedioFin - promedioInicio) / promedioInicio) * 100;

    const mejorDia = ordenados.reduce((mejor, actual) => 
      actual.montoTotal > mejor.montoTotal ? actual : mejor
    );

    const peorDia = ordenados.reduce((peor, actual) => 
      actual.montoTotal < peor.montoTotal ? actual : peor
    );

    return {
      tendencia: cambio > 10 ? 'creciente' : cambio < -10 ? 'decreciente' : 'estable',
      fuerza: Math.abs(cambio) > 25 ? 'fuerte' : Math.abs(cambio) > 10 ? 'moderada' : 'débil',
      mejorDia,
      peorDia,
      emoji: cambio > 10 ? '📈' : cambio < -10 ? '📉' : '📊'
    };
  },

  // Detección de anomalías
  detectarAnomalias(ventasPorDia: VentaPorDia[]): {
    diasAtipicos: VentaPorDia[];
    alertas: string[];
  } {
    if (ventasPorDia.length < 5) {
      return { diasAtipicos: [], alertas: [] };
    }

    const montos = ventasPorDia.map(dia => dia.montoTotal);
    const promedio = montos.reduce((sum, monto) => sum + monto, 0) / montos.length;
    const desviacion = Math.sqrt(
      montos.reduce((sum, monto) => sum + Math.pow(monto - promedio, 2), 0) / montos.length
    );

    const umbralAlto = promedio + (desviacion * 2);
    const umbralBajo = promedio - (desviacion * 2);

    const diasAtipicos = ventasPorDia.filter(dia => 
      dia.montoTotal > umbralAlto || dia.montoTotal < umbralBajo
    );

    const alertas: string[] = [];

    diasAtipicos.forEach(dia => {
      if (dia.montoTotal > umbralAlto) {
        alertas.push(`🚀 ${dia.fecha}: Ventas excepcionalmente altas`);
      } else {
        alertas.push(`⚠️ ${dia.fecha}: Ventas inusualmente bajas`);
      }
    });

    // Detectar domingos con ventas (no deberían tener)
    const domingoConVentas = ventasPorDia.filter(dia => dia.esDomingo && dia.montoTotal > 0);
    domingoConVentas.forEach(dia => {
      alertas.push(`🤔 ${dia.fecha}: Ventas registradas en domingo`);
    });

    return { diasAtipicos, alertas };
  },

  // Comparaciones entre sucursales
  compararSucursales(sucursales: VentaPorSucursal[] = []): {
    lider: VentaPorSucursal | null;
    rezagada: VentaPorSucursal | null;
    diferenciaPorcentual: number;
    distribucion: { nombre: string; porcentaje: number; color: string }[];
  } {
    if (sucursales.length === 0) {
      return { lider: null, rezagada: null, diferenciaPorcentual: 0, distribucion: [] };
    }

    const ordenadas = [...sucursales].sort((a, b) => b.montoTotal - a.montoTotal);
    const lider = ordenadas[0];
    const rezagada = ordenadas[ordenadas.length - 1];
    
    const totalGeneral = sucursales.reduce((sum, suc) => sum + suc.montoTotal, 0);
    const diferenciaPorcentual = totalGeneral > 0 && ordenadas.length > 1 ?
      ((lider.montoTotal - rezagada.montoTotal) / totalGeneral) * 100 : 0;

    // Colores temáticos de la guía
    const colores = ['#D94854', '#B695BF', '#51590E', '#F23D5E', '#e327c4'];
    
    const distribucion = sucursales.map((sucursal, index) => ({
      nombre: sucursal.sucursalNombre,
      porcentaje: totalGeneral > 0 ? (sucursal.montoTotal / totalGeneral) * 100 : 0,
      color: colores[index % colores.length]
    }));

    return { lider, rezagada, diferenciaPorcentual, distribucion };
  },

  // Insights automáticos
  generarInsights(stats: VentaVendedoraStats): string[] {
    const insights: string[] = [];
    const promedios = this.calcularPromedios(stats);

    // Insight sobre vendedoras top
    if (stats.topVendedoras && stats.topVendedoras.length >= 3) {
      const top3 = stats.topVendedoras.slice(0, 3);
      const totalTop3 = top3.reduce((sum, v) => sum + v.montoTotal, 0);
      const porcentajeTop3 = stats.montoTotal > 0 ? (totalTop3 / stats.montoTotal) * 100 : 0;
      
      if (porcentajeTop3 > 60) {
        insights.push(`🎯 Las top 3 vendedoras generan ${porcentajeTop3.toFixed(1)}% de las ventas totales`);
      }
    }

    // Insight sobre días de venta
    if (stats.diasConVentas > 0) {
      const eficiencia = promedios.ventaPorDia;
      if (eficiencia > 500000) {
        insights.push(`🚀 Excelente rendimiento: ${this.formatearMonedaCompacta(eficiencia)} promedio por día`);
      } else if (eficiencia < 100000) {
        insights.push(`📊 Oportunidad de mejora: ${this.formatearMonedaCompacta(eficiencia)} promedio por día`);
      }
    }

    // Insight sobre distribución por turnos
    const turnoStats = stats.ventasPorTurno || [];
    if (turnoStats.length === 2) {
      const [turno1, turno2] = turnoStats.sort((a, b) => b.montoTotal - a.montoTotal);
      const diferencia = stats.montoTotal > 0 ? ((turno1.montoTotal - turno2.montoTotal) / stats.montoTotal) * 100 : 0;
      
      if (diferencia > 30) {
        const emoji = turno1.turno === 'Mañana' ? '🌅' : '🌆';
        insights.push(`${emoji} Turno ${turno1.turno} supera significativamente al turno ${turno2.turno}`);
      }
    }

    return insights;
  }
};