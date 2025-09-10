import React, { useState } from 'react';
import { Settings, RotateCcw, Edit3, Check, X } from 'lucide-react';
import { 
  type ConfiguracionAnalisis, 
  type CurvaTalles, 
  SUCURSALES_OBJETIVO,
  TALLES_DISPONIBLES 
} from '../../types/reposicion/reposicionTypes';
import { 
  crearConfiguracionDefecto, 
  clonarCurvaTalles, 
  obtenerColorSucursal,
  compararCurvas,
  calcularTotalUnidadesCurva
} from '../../utils/reposicionUtils';

interface ConfiguracionCurvasProps {
  configuracion: ConfiguracionAnalisis;
  onChange: (configuracion: ConfiguracionAnalisis) => void;
  sucursalesEncontradas: string[];
  disabled?: boolean;
}

export const ConfiguracionCurvas: React.FC<ConfiguracionCurvasProps> = ({
  configuracion,
  onChange,
  sucursalesEncontradas,
  disabled = false
}) => {
  const [sucursalEditando, setSucursalEditando] = useState<string | null>(null);
  const [curvaTemp, setCurvaTemp] = useState<CurvaTalles | null>(null);
  const [erroresCurva, setErroresCurva] = useState<Record<string, string>>({});

  const sucursalesDisponibles = SUCURSALES_OBJETIVO.filter(sucursal => 
    sucursalesEncontradas.includes(sucursal)
  );

  const iniciarEdicion = (sucursal: string) => {
    const curvaActual = configuracion.curvasPorSucursal[sucursal];
    setSucursalEditando(sucursal);
    setCurvaTemp(clonarCurvaTalles(curvaActual));
    setErroresCurva({});
  };

  const cancelarEdicion = () => {
    setSucursalEditando(null);
    setCurvaTemp(null);
    setErroresCurva({});
  };

  const validarCurva = (curva: CurvaTalles): Record<string, string> => {
    const errores: Record<string, string> = {};
    const talles = Object.entries(curva);
    let tieneStockPositivo = false;

    talles.forEach(([talle, cantidad]) => {
      if (cantidad < 0) {
        errores[talle] = 'No puede ser negativo';
      } else if (cantidad > 10) {
        errores[talle] = 'Máximo 10 unidades';
      } else if (cantidad > 0) {
        tieneStockPositivo = true;
      }
    });

    if (!tieneStockPositivo) {
      errores.general = 'Al menos un talle debe tener cantidad mayor a 0';
    }

    return errores;
  };

  const actualizarCantidadTalle = (talle: number, cantidad: number) => {
    if (!curvaTemp) return;

    const nuevaCurva = { ...curvaTemp };
    const talleProp = `talle${talle}` as keyof CurvaTalles;
    nuevaCurva[talleProp] = cantidad;

    setCurvaTemp(nuevaCurva);
    
    const errores = validarCurva(nuevaCurva);
    setErroresCurva(errores);
  };

  const guardarCurva = () => {
    if (!sucursalEditando || !curvaTemp) return;

    const errores = validarCurva(curvaTemp);
    if (Object.keys(errores).length > 0) {
      setErroresCurva(errores);
      return;
    }

    const nuevaConfiguracion = {
      ...configuracion,
      curvasPorSucursal: {
        ...configuracion.curvasPorSucursal,
        [sucursalEditando]: curvaTemp
      }
    };

    onChange(nuevaConfiguracion);
    cancelarEdicion();
  };

  const resetearCurvaDefecto = (sucursal: string) => {
    const configDefecto = crearConfiguracionDefecto();
    const curvaDefecto = configDefecto.curvasPorSucursal[sucursal];

    const nuevaConfiguracion = {
      ...configuracion,
      curvasPorSucursal: {
        ...configuracion.curvasPorSucursal,
        [sucursal]: curvaDefecto
      }
    };

    onChange(nuevaConfiguracion);
  };

  const resetearTodasCurvas = () => {
    const configDefecto = crearConfiguracionDefecto();
    onChange(configDefecto);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B695BF]/20 border border-[#B695BF]/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#B695BF]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Configuración de Curvas</h3>
            <p className="text-white/60">Personaliza la curva de talles por sucursal</p>
          </div>
        </div>

        <button
          onClick={resetearTodasCurvas}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Resetear Todo
        </button>
      </div>

      <div className="grid gap-4">
        {sucursalesDisponibles.map(sucursal => {
          const curvaActual = configuracion.curvasPorSucursal[sucursal];
          const color = obtenerColorSucursal(sucursal);
          const estaEditando = sucursalEditando === sucursal;
          const curvaParaMostrar = estaEditando ? curvaTemp! : curvaActual;
          const totalUnidades = calcularTotalUnidadesCurva(curvaParaMostrar);
          const configDefecto = crearConfiguracionDefecto();
          const esCurvaDefecto = compararCurvas(curvaActual, configDefecto.curvasPorSucursal[sucursal]);

          return (
            <div
              key={sucursal}
              className={`
                rounded-xl border backdrop-blur-sm transition-all duration-200
                ${estaEditando 
                  ? 'bg-white/15 border-white/30' 
                  : 'bg-white/10 border-white/20'
                }
              `}
            >
              <div className="p-4 border-b border-white/10">
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
                      <p className="text-white/60 text-sm">
                        {totalUnidades} unidades totales
                        {esCurvaDefecto && (
                          <span className="ml-2 text-[#51590E]">• Por defecto</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!estaEditando ? (
                      <>
                        <button
                          onClick={() => resetearCurvaDefecto(sucursal)}
                          disabled={disabled || esCurvaDefecto}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resetear a valores por defecto"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => iniciarEdicion(sucursal)}
                          disabled={disabled}
                          className="p-2 rounded-lg bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={cancelarEdicion}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={guardarCurva}
                          disabled={Object.keys(erroresCurva).length > 0}
                          className="p-2 rounded-lg bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  {TALLES_DISPONIBLES.map(talle => {
                    const talleProp = `talle${talle}` as keyof CurvaTalles;
                    const cantidad = curvaParaMostrar[talleProp];
                    const tieneError = erroresCurva[talleProp];

                    return (
                      <div key={talle} className="space-y-2">
                        <label className="block text-sm font-medium text-white/80">
                          Talle {talle}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={cantidad}
                          onChange={(e) => {
                            const valor = Math.max(0, parseInt(e.target.value) || 0);
                            if (estaEditando) {
                              actualizarCantidadTalle(talle, valor);
                            }
                          }}
                          disabled={!estaEditando}
                          className={`
                            w-full px-3 py-2 rounded-lg bg-white/10 border backdrop-blur-sm text-white text-center transition-all
                            ${estaEditando 
                              ? 'border-white/30 focus:border-[#B695BF] focus:ring-1 focus:ring-[#B695BF]/50' 
                              : 'border-white/20 cursor-not-allowed'
                            }
                            ${tieneError ? 'border-[#D94854] bg-[#D94854]/10' : ''}
                          `}
                        />
                        {tieneError && (
                          <p className="text-xs text-[#D94854]">{tieneError}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {erroresCurva.general && (
                  <div className="mt-3 p-3 rounded-lg bg-[#D94854]/10 border border-[#D94854]/30">
                    <p className="text-sm text-[#D94854]">{erroresCurva.general}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sucursalesEncontradas.length !== SUCURSALES_OBJETIVO.length && (
        <div className="p-4 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30">
          <p className="text-[#FFD700] text-sm">
            <strong>Nota:</strong> Solo se muestran las sucursales encontradas en el archivo. 
            Sucursales faltantes: {SUCURSALES_OBJETIVO.filter(s => !sucursalesEncontradas.includes(s)).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};