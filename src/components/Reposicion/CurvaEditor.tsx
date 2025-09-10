import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { 
  type CurvaTalles, 
  TALLES_DISPONIBLES,
  CURVA_TALLES_DEFECTO 
} from '../../types/reposicion/reposicionTypes';
import { 
  obtenerCantidadPorTalle, 
  establecerCantidadPorTalle,
  calcularTotalUnidadesCurva,
  compararCurvas
} from '../../utils/reposicionUtils';

interface CurvaEditorProps {
  sucursal: string;
  curva: CurvaTalles;
  onChange: (curva: CurvaTalles) => void;
  errores?: Record<string, string>;
  disabled?: boolean;
  mostrarTotales?: boolean;
  compacto?: boolean;
  color?: string;
}

export const CurvaEditor: React.FC<CurvaEditorProps> = ({
  sucursal,
  curva,
  onChange,
  errores = {},
  disabled = false,
  mostrarTotales = true,
  compacto = false,
  color = '#B695BF'
}) => {
  const totalUnidades = calcularTotalUnidadesCurva(curva);
  const esCurvaDefecto = compararCurvas(curva, CURVA_TALLES_DEFECTO);

  const actualizarCantidad = (talle: number, nuevaCantidad: number) => {
    const cantidad = Math.max(0, Math.min(10, nuevaCantidad));
    const nuevaCurva = establecerCantidadPorTalle(curva, talle, cantidad);
    onChange(nuevaCurva);
  };

  const incrementar = (talle: number) => {
    const cantidadActual = obtenerCantidadPorTalle(curva, talle);
    actualizarCantidad(talle, cantidadActual + 1);
  };

  const decrementar = (talle: number) => {
    const cantidadActual = obtenerCantidadPorTalle(curva, talle);
    actualizarCantidad(talle, cantidadActual - 1);
  };

  const resetearADefecto = () => {
    onChange(CURVA_TALLES_DEFECTO);
  };

  const aplicarCurvaUniforme = (cantidad: number) => {
    let nuevaCurva = { ...curva };
    TALLES_DISPONIBLES.forEach(talle => {
      nuevaCurva = establecerCantidadPorTalle(nuevaCurva, talle, cantidad);
    });
    onChange(nuevaCurva);
  };

  return (
    <div className="space-y-4">
      {!compacto && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: color + '40', border: `2px solid ${color}` }}
            >
              {sucursal.substring(0, 2)}
            </div>
            <div>
              <h4 className="font-semibold text-white">{sucursal}</h4>
              {mostrarTotales && (
                <p className="text-white/60 text-sm">
                  {totalUnidades} unidades totales
                  {esCurvaDefecto && (
                    <span className="ml-2 text-[#51590E]">• Por defecto</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => aplicarCurvaUniforme(1)}
              disabled={disabled}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Todo a 1
            </button>
            <button
              onClick={() => aplicarCurvaUniforme(2)}
              disabled={disabled}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Todo a 2
            </button>
            <button
              onClick={resetearADefecto}
              disabled={disabled || esCurvaDefecto}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Resetear a valores por defecto"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`grid gap-3 ${compacto ? 'grid-cols-8' : 'grid-cols-4'}`}>
        {TALLES_DISPONIBLES.map(talle => {
          const cantidad = obtenerCantidadPorTalle(curva, talle);
          const tieneError = errores[`talle${talle}`];

          return (
            <div key={talle} className="space-y-2">
              <label className={`block font-medium text-white/80 ${compacto ? 'text-xs' : 'text-sm'}`}>
                {compacto ? talle : `Talle ${talle}`}
              </label>
              
              <div className="relative">
                <div className="flex items-center">
                  <button
                    onClick={() => decrementar(talle)}
                    disabled={disabled || cantidad <= 0}
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-l-lg bg-white/10 hover:bg-white/20 border border-r-0 border-white/20 
                      flex items-center justify-center text-white/70 hover:text-white transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${compacto ? 'w-6 h-6' : 'w-8 h-8'}
                    `}
                  >
                    <Minus className={compacto ? 'w-3 h-3' : 'w-4 h-4'} />
                  </button>
                  
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={cantidad}
                    onChange={(e) => {
                      const valor = Math.max(0, parseInt(e.target.value) || 0);
                      actualizarCantidad(talle, valor);
                    }}
                    disabled={disabled}
                    className={`
                      flex-1 px-3 py-2 bg-white/10 border-t border-b border-white/20 backdrop-blur-sm text-white text-center transition-all
                      focus:border-${color.replace('#', '')} focus:ring-1 focus:ring-${color.replace('#', '')}/50
                      disabled:cursor-not-allowed
                      ${tieneError ? 'border-[#D94854] bg-[#D94854]/10' : ''}
                      ${compacto ? 'py-1 text-sm' : 'py-2'}
                    `}
                    style={{
                      borderColor: tieneError ? '#D94854' : undefined
                    }}
                  />
                  
                  <button
                    onClick={() => incrementar(talle)}
                    disabled={disabled || cantidad >= 10}
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-r-lg bg-white/10 hover:bg-white/20 border border-l-0 border-white/20 
                      flex items-center justify-center text-white/70 hover:text-white transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${compacto ? 'w-6 h-6' : 'w-8 h-8'}
                    `}
                  >
                    <Plus className={compacto ? 'w-3 h-3' : 'w-4 h-4'} />
                  </button>
                </div>

                {tieneError && !compacto && (
                  <p className="text-xs text-[#D94854] mt-1">{tieneError}</p>
                )}
              </div>

              {!compacto && cantidad > 0 && (
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(cantidad / 10) * 100}%`,
                      backgroundColor: color + '80'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!compacto && mostrarTotales && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Total de unidades:</span>
            <span className="font-semibold text-white">{totalUnidades}</span>
          </div>
          
          {totalUnidades > 0 && (
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, (totalUnidades / 20) * 100)}%`,
                  backgroundColor: color
                }}
              />
            </div>
          )}
        </div>
      )}

      {Object.keys(errores).length > 0 && errores.general && (
        <div className="p-3 rounded-lg bg-[#D94854]/10 border border-[#D94854]/30">
          <p className="text-sm text-[#D94854]">{errores.general}</p>
        </div>
      )}
    </div>
  );
};