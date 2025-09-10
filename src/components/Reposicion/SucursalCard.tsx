import React from 'react';
import { Package, Hash } from 'lucide-react';
import type { ReposicionPorSucursal } from '../../types/reposicion/reposicionTypes';
import { obtenerColorSucursal, abreviarNombreSucursal } from '../../utils/reposicionUtils';

interface SucursalCardProps {
  reposicion: ReposicionPorSucursal;
  onClick?: () => void;
  seleccionada?: boolean;
  compacta?: boolean;
}

export const SucursalCard: React.FC<SucursalCardProps> = ({
  reposicion,
  onClick,
  seleccionada = false,
  compacta = false
}) => {
  const color = obtenerColorSucursal(reposicion.nombreSucursal);
  const abreviacion = abreviarNombreSucursal(reposicion.nombreSucursal);

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl backdrop-blur-sm border transition-all duration-200
        ${onClick ? 'cursor-pointer hover:bg-white/15' : ''}
        ${seleccionada 
          ? 'bg-white/15 border-white/30 shadow-lg' 
          : 'bg-white/10 border-white/20'
        }
        ${compacta ? 'p-4' : 'p-6'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color + '40', border: `2px solid ${color}` }}
          >
            {abreviacion}
          </div>
          
          <div>
            <h3 className={`font-semibold text-white ${compacta ? 'text-sm' : 'text-base'}`}>
              {reposicion.nombreSucursal}
            </h3>
            {!compacta && (
              <p className="text-white/60 text-sm">
                {reposicion.totalItems} productos únicos
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-1">
            <Package className="w-4 h-4 text-white/70" />
            <span className={`font-bold text-white ${compacta ? 'text-lg' : 'text-xl'}`}>
              {reposicion.totalUnidades}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Hash className="w-3 h-3 text-white/50" />
            <span className="text-white/70 text-sm">
              {reposicion.totalItems} ítems
            </span>
          </div>
        </div>
      </div>

      {!compacta && reposicion.totalUnidades > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/50 mb-2">
            Distribución por cantidad
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(10, reposicion.totalUnidades) }, (_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ backgroundColor: color + '60' }}
              />
            ))}
            {reposicion.totalUnidades > 10 && (
              <span className="text-xs text-white/50 ml-2">
                +{reposicion.totalUnidades - 10}
              </span>
            )}
          </div>
        </div>
      )}

      <div 
        className="absolute inset-0 rounded-xl opacity-5 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};