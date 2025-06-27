import { type RendimientoVendedoraDia, type RendimientoVendedoraResumen } from '@/types/vendedoras/rendimientoLocalesTypes';

// Formatea cumplimiento para mostrar chip de color, emoji, texto
export function getCumplimientoBadge(cumplio: boolean, metrica: 'monto' | 'cantidad') {
  if (cumplio) {
    return {
      color: metrica === 'monto' ? '#51590E' : '#B695BF', // Verde oliva o violeta
      emoji: '✅',
      label: metrica === 'monto' ? 'Superó/Igualó promedio de $' : 'Superó/Igualó promedio de pares',
    };
  }
  return {
    color: '#D94854', // Rojo
    emoji: '⚠️',
    label: metrica === 'monto' ? 'Por debajo del promedio $' : 'Por debajo del promedio pares',
  };
}

// Devuelve emoji según % de cumplimiento
export function getRendimientoEmoji(porcentaje: number) {
  if (porcentaje >= 90) return '🔥';
  if (porcentaje >= 70) return '✅';
  if (porcentaje >= 50) return '🟡';
  return '⚠️';
}

// Formatea resumen de cumplimiento para un badge visual
export function formatResumenCumplimiento(resumen: RendimientoVendedoraResumen, metrica: 'monto' | 'cantidad') {
  const porcentaje = metrica === 'monto'
    ? resumen.porcentajeCumplimientoMonto
    : resumen.porcentajeCumplimientoCantidad;

  return {
    texto: `${porcentaje.toFixed(0)}% de días cumplidos`,
    emoji: getRendimientoEmoji(porcentaje),
    color:
      porcentaje >= 90 ? '#51590E'
      : porcentaje >= 70 ? '#B695BF'
      : porcentaje >= 50 ? '#FFD700'
      : '#D94854',
  };
}

// Ordena vendedoras por rendimiento en el período
export function ordenarResumenPorCumplimiento(
  resumenes: RendimientoVendedoraResumen[],
  metrica: 'monto' | 'cantidad'
) {
  return [...resumenes].sort((a, b) => {
    const pa = metrica === 'monto' ? a.porcentajeCumplimientoMonto : a.porcentajeCumplimientoCantidad;
    const pb = metrica === 'monto' ? b.porcentajeCumplimientoMonto : b.porcentajeCumplimientoCantidad;
    return pb - pa;
  });
}

// Tooltip rápido de comparación diaria
export function buildComparacionTooltip(v: RendimientoVendedoraDia, promedio: number, metrica: 'monto' | 'cantidad') {
  const valor = metrica === 'monto' ? v.monto : v.cantidad;
  return `${valor} (${v.cumplioMontoPromedio ? '≥' : '<'} ${Math.round(promedio)})`;
}

// Helper para destacar top cumplimiento
export function getTopCumplidoras(resumenes: RendimientoVendedoraResumen[], metrica: 'monto' | 'cantidad') {
  const max = Math.max(
    ...resumenes.map(r => metrica === 'monto' ? r.porcentajeCumplimientoMonto : r.porcentajeCumplimientoCantidad)
  );
  return resumenes.filter(r =>
    (metrica === 'monto' ? r.porcentajeCumplimientoMonto : r.porcentajeCumplimientoCantidad) === max
  );
}

export function generarInsightsRendimiento(
    resumenes: RendimientoVendedoraResumen[],
    metrica: 'monto' | 'cantidad'
  ): string[] {
    if (!resumenes.length) return ['No hay datos de vendedoras en este período.'];
  
    const total = resumenes.length;
    const porcentajeProm = (r: RendimientoVendedoraResumen) =>
      metrica === 'monto' ? r.porcentajeCumplimientoMonto : r.porcentajeCumplimientoCantidad;
  
    const top = Math.max(...resumenes.map(porcentajeProm));
    const todas100 = resumenes.every(r => porcentajeProm(r) === 100);
    const ninguna50 = resumenes.every(r => porcentajeProm(r) < 50);
    const alMenosUna0 = resumenes.some(r => porcentajeProm(r) === 0);
    const promedio = resumenes.reduce((acc, r) => acc + porcentajeProm(r), 0) / total;
  
    const insights: string[] = [];
  
    if (todas100) {
      insights.push('🔥 Todas las vendedoras cumplieron el 100% de los días en el período.');
    } else if (ninguna50) {
      insights.push('⚠️ Todas las vendedoras estuvieron por debajo del 50% de cumplimiento.');
    } else if (alMenosUna0) {
      insights.push('🤔 Al menos una vendedora no cumplió ningún día el promedio.');
    }
  
    if (top >= 90 && top < 100) {
      insights.push('🌟 Hay vendedoras con cumplimiento sobresaliente (+90%).');
    }
  
    if (promedio < 50) {
      insights.push('📉 El promedio de cumplimiento general fue bajo (<50%).');
    } else if (promedio > 80) {
      insights.push('📈 Excelente promedio grupal de cumplimiento (>80%).');
    }
  
    // Extra: destacar la(s) top cumplidora(s)
    const topCumplidoras = resumenes
      .filter(r => porcentajeProm(r) === top)
      .map(r => r.vendedoraNombre);
    if (topCumplidoras.length) {
      insights.push(`🏅 Top cumplidora(s): ${topCumplidoras.join(', ')} (${top.toFixed(0)}%)`);
    }
  
    return insights;
  }