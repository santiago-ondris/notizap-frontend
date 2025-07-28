import React from 'react';
import { Building2, BarChart3 } from 'lucide-react';
import type { VentaPorSucursal } from '@/types/vendedoras/ventaVendedoraTypes';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';

interface Props {
  ventasPorSucursal: VentaPorSucursal[];
  diasConVentas: number;
  loading?: boolean;
}

// Colores temáticos para cada sucursal
const coloresSucursales = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-green-500/20 text-green-400 border-green-500/30', 
  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'bg-orange-500/20 text-orange-400 border-orange-500/30'
];

export const SucursalesComparison: React.FC<Props> = ({ 
  ventasPorSucursal, 
  diasConVentas,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-white/10 rounded-xl animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 animate-pulse">
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
    );
  }

  // Si no hay datos, no mostrar nada
  if (!ventasPorSucursal || ventasPorSucursal.length === 0) {
    return null;
  }

  const calcularPromedios = (sucursal: VentaPorSucursal) => {
    const promedioVentasNetas = diasConVentas > 0 ? sucursal.cantidadTotal / diasConVentas : 0;
    const promedioMonto = diasConVentas > 0 ? sucursal.montoTotal / diasConVentas : 0;
    
    return {
      promedioVentasNetas,
      promedioMonto
    };
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            🏢 Comparación por Sucursales
          </h3>
          <p className="text-sm text-white/60">
            Vista comparativa de las {ventasPorSucursal.length} sucursales
          </p>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ventasPorSucursal.map((sucursal, index) => {
          const colorClase = coloresSucursales[index % coloresSucursales.length];
          const promedios = calcularPromedios(sucursal);
          
          return (
            <div
              key={sucursal.sucursalNombre}
              className={`bg-white/10 backdrop-blur-sm border rounded-xl p-4 hover:bg-white/15 transition-all group ${colorClase}`}
            >
              {/* Nombre de la sucursal */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-current/20">
                <Building2 className="w-4 h-4" />
                <h4 className="font-semibold text-sm truncate">
                  {sucursal.sucursalNombre}
                </h4>
              </div>

              {/* Métricas en formato viñetas */}
              <div className="space-y-3 text-xs">
                {/* Cantidad neta vendida */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-white/70">Cantidad neta vendida:</span>
                    <br />
                    <span className="font-semibold text-white">
                      {estadisticasHelpers.formatearNumero(sucursal.cantidadTotal)} productos
                    </span>
                  </div>
                </div>

                {/* Promedio ventas netas por día */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-white/70">Promedio ventas netas/día:</span>
                    <br />
                    <span className="font-semibold text-white">
                      {estadisticasHelpers.formatearNumero(Math.round(promedios.promedioVentasNetas))} productos/día
                    </span>
                  </div>
                </div>

                {/* Monto total */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-white/70">Monto total:</span>
                    <br />
                    <span className="font-semibold text-white">
                      {estadisticasHelpers.formatearMonedaCompleta(sucursal.montoTotal)}
                    </span>
                  </div>
                </div>

                {/* Promedio monto por día */}
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <span className="text-white/70">Promedio monto/día:</span>
                    <br />
                    <span className="font-semibold text-white">
                      {estadisticasHelpers.formatearMonedaCompleta(promedios.promedioMonto)}/día
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          💡 Promedios calculados en base a {diasConVentas} días con ventas (excluyendo domingos)
        </p>
      </div>
    </div>
  );
};