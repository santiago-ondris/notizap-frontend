import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Award, Clock } from 'lucide-react';
import type { VentaVendedoraStats } from '@/types/vendedoras/ventaVendedoraTypes';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';
import { turnoHelpers } from '@/utils/vendedoras/turnoHelpers';
import { TodasLasVendedorasTable } from './TodasLasVendedorasTable';

interface Props {
  stats: VentaVendedoraStats;
  loading?: boolean;
}

export const VentasVendedorasStats: React.FC<Props> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
            <div className="h-12 bg-white/10 rounded-xl mb-4"></div>
            <div className="h-8 bg-white/10 rounded mb-2"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const promedios = estadisticasHelpers.calcularPromedios(stats);
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
      titulo: 'Cantidad neta Vendida',
      valor: estadisticasHelpers.formatearNumero(stats.cantidadTotal),
      subtitulo: 'de productos',
      icono: Users,
      color: 'bg-blue-500/20 text-blue-400',
      emoji: '📦'
    },
    {
      titulo: 'Monto Total',
      valor: estadisticasHelpers.formatearMonedaCompacta(stats.montoTotal),
      subtitulo: estadisticasHelpers.formatearMoneda(stats.montoTotal),
      icono: DollarSign,
      color: 'bg-green-500/20 text-green-400',
      emoji: '💰'
    },
    {
      titulo: 'Promedio por Día',
      valor: estadisticasHelpers.formatearMonedaCompacta(promedios.ventaPorDia),
      subtitulo: 'sin domingos',
      icono: TrendingUp,
      color: 'bg-orange-500/20 text-orange-400',
      emoji: '📈'
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
      {stats.todasVendedoras?.length > 0 && (
        <TodasLasVendedorasTable 
          vendedoras={stats.todasVendedoras}
          loading={loading}
        />
      )}
      {/* Cards principales */}
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

      {/* Análisis de turnos detallado */}
      {datosMañana && datosTarde && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">⏰ Análisis por Turnos</h3>
              <p className="text-sm text-white/60">Comparación de rendimiento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turno Mañana */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌅</span>
                <h4 className="font-medium text-white">Turno Mañana</h4>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  8:00 - 14:30
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {estadisticasHelpers.formatearMonedaCompacta(comparacionTurnos.mañana.total)}
                  </p>
                  <p className="text-xs text-white/60">Total ventas</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {estadisticasHelpers.formatearPorcentaje(comparacionTurnos.mañana.porcentaje)}
                  </p>
                  <p className="text-xs text-white/60">Del total</p>
                </div>
              </div>
            </div>

            {/* Turno Tarde */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌆</span>
                <h4 className="font-medium text-white">Turno Tarde</h4>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  15:00 - 22:00
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {estadisticasHelpers.formatearMonedaCompacta(comparacionTurnos.tarde.total)}
                  </p>
                  <p className="text-xs text-white/60">Total ventas</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {estadisticasHelpers.formatearPorcentaje(comparacionTurnos.tarde.porcentaje)}
                  </p>
                  <p className="text-xs text-white/60">Del total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Diferencia */}
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-white/80 text-center">
              {comparacionTurnos.mejorTurno === 'Mañana' ? '🌅' : '🌆'} 
              <strong> Turno {comparacionTurnos.mejorTurno}</strong> supera por{' '}
              <strong>{estadisticasHelpers.formatearMonedaCompacta(comparacionTurnos.diferencia)}</strong>
              {' '}({estadisticasHelpers.formatearPorcentaje(comparacionTurnos.diferenciaPorc)})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};