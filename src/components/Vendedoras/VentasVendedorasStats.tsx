import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Award, Clock, ShoppingCart } from 'lucide-react';
import type { VentaVendedoraStats } from '@/types/vendedoras/ventaVendedoraTypes';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';
import { turnoHelpers } from '@/utils/vendedoras/turnoHelpers';
import { TodasLasVendedorasTable } from './TodasLasVendedorasTable';
import { SucursalesComparison } from './SucursalesComparison';

interface Props {
  stats: VentaVendedoraStats;
  loading?: boolean;
  mostrarComparacionSucursales?: boolean;
}

export const VentasVendedorasStats: React.FC<Props> = ({ 
  stats, 
  loading = false,
  mostrarComparacionSucursales = false 
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading para stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
              <div className="h-12 bg-white/10 rounded-xl mb-4"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
              <div className="h-4 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>

        {/* Loading para comparación de sucursales si corresponde */}
        {mostrarComparacionSucursales && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <div className="h-6 bg-white/10 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-white/10 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const montoTotalCorrecto = stats.todasVendedoras?.length > 0 
    ? stats.todasVendedoras.reduce((sum, v) => sum + v.montoTotal, 0)
    : stats.montoTotal; // fallback al valor del backend si no hay vendedoras

  const statsCorrected = {
    ...stats,
    montoTotal: montoTotalCorrecto
  };

  const promedios = estadisticasHelpers.calcularPromedios(statsCorrected);
  const comparacionSucursales = estadisticasHelpers.compararSucursales(stats.ventasPorSucursal);
  
  // Análisis de turnos
  const datosMañana = stats.ventasPorTurno?.find(t => t.turno === 'Mañana');
  const datosTarde = stats.ventasPorTurno?.find(t => t.turno === 'Tarde');
  const comparacionTurnos = turnoHelpers.compararTurnos(
    datosMañana ? [datosMañana] : [],
    datosTarde ? [datosTarde] : []
  );

  const statsCards = [
    {
      titulo: 'Cantidad neta de productos Vendida',
      valor: estadisticasHelpers.formatearNumero(stats.cantidadTotal),
      subtitulo: 'de productos',
      icono: Users,
      color: 'bg-blue-500/20 text-blue-400',
      emoji: '📦'
    },
    {
      titulo: 'Monto Total',
      valor: estadisticasHelpers.formatearMonedaCompleta(montoTotalCorrecto),
      subtitulo: estadisticasHelpers.formatearMonedaCompleta(montoTotalCorrecto),
      icono: DollarSign,
      color: 'bg-green-500/20 text-green-400',
      emoji: '💰'
    },
    {
      titulo: 'Promedio Monto por Día',
      valor: estadisticasHelpers.formatearMonedaCompleta(promedios.ventaPorDia),
      subtitulo: 'sin domingos',
      icono: TrendingUp,
      color: 'bg-orange-500/20 text-orange-400',
      emoji: '📈'
    },
    {
      titulo: 'Promedio Productos Netos por Día',
      valor: estadisticasHelpers.formatearNumero(Math.round(promedios.ventasNetasPorDia)),
      subtitulo: 'transacciones diarias',
      icono: ShoppingCart,
      color: 'bg-cyan-500/20 text-cyan-400',
      emoji: '🛒'
    },
    {
      titulo: 'Días con Ventas',
      valor: estadisticasHelpers.formatearNumero(stats.diasConVentas),
      subtitulo: 'días activos',
      icono: Calendar,
      color: 'bg-purple-500/20 text-purple-400',
      emoji: '📅'
    },
    {
      titulo: 'Mejor Turno',
      valor: comparacionTurnos.mejorTurno,
      subtitulo: `${estadisticasHelpers.formatearPorcentaje(
        comparacionTurnos.mejorTurno === 'Mañana' 
          ? comparacionTurnos.mañana.porcentaje 
          : comparacionTurnos.tarde.porcentaje
      )}`,
      icono: Clock,
      color: 'bg-indigo-500/20 text-indigo-400',
      emoji: comparacionTurnos.mejorTurno === 'Mañana' ? '🌅' : '🌆'
    },
    {
      titulo: 'Sucursal Líder',
      valor: comparacionSucursales.lider?.sucursalNombre || 'N/A',
      subtitulo: comparacionSucursales.lider ? 
        estadisticasHelpers.formatearMonedaCompacta(comparacionSucursales.lider.montoTotal) : 
        'Sin datos',
      icono: Award,
      color: 'bg-pink-500/20 text-pink-400',
      emoji: '🏢'
    },
    {
      titulo: 'Transacciones Totales',
      valor: estadisticasHelpers.formatearNumero(stats.totalVentas),
      subtitulo: 'total de movimientos',
      icono: TrendingUp,
      color: 'bg-red-500/20 text-red-400',
      emoji: '📊'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabla de todas las vendedoras */}
      {stats.todasVendedoras?.length > 0 && (
        <TodasLasVendedorasTable 
          vendedoras={stats.todasVendedoras}
          loading={loading}
        />
      )}
      
      {/* Comparación por sucursales - Solo cuando se muestre "Todas las sucursales" */}
      {mostrarComparacionSucursales && stats.ventasPorSucursal && stats.ventasPorSucursal.length > 1 && (
        <SucursalesComparison 
          ventasPorSucursal={stats.ventasPorSucursal}
          diasConVentas={stats.diasConVentas}
          loading={loading}
        />
      )}

      {/* Cards principales de estadísticas acumuladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icono className="w-6 h-6" />
              </div>
              <span className="text-2xl">{card.emoji}</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white">{card.valor}</h3>
              <p className="text-sm text-white/60">{card.titulo}</p>
              <p className="text-xs text-white/50">{card.subtitulo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};