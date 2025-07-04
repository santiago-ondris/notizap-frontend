import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Trash2,
  X,
  Loader2,
  Edit3,
  Check,
  AlertTriangle,
  Save,
  RotateCcw,
  Eye
} from 'lucide-react';
import {
  type EnvioDiario,
  type TipoEnvio,
  type CambioEnvio,
  TIPOS_ENVIO
} from '@/types/envios/enviosTypes';
import { formatearFechaConDia } from '@/utils/envios/fechaHelpers';

interface EnviosTablaProps {
  envios: EnvioDiario[];
  onGuardarLote: (cambios: Map<string, CambioEnvio>) => Promise<boolean>;
  onEliminarEnvio: (id: number) => Promise<boolean>;
  puedeEditar: boolean;
  cargando?: boolean;
}

interface CeldaEditando {
  dia: number;
  campo: TipoEnvio;
  valorTemporal: string;
}

/**
 * Componente de celda editable CON estado local (no auto-save)
 */
const CeldaEditable: React.FC<{
  valor: number | null;
  valorLocal?: number | null; // Valor modificado localmente
  esEditable: boolean;
  estaEditando: boolean;
  tieneModificacion: boolean; // Indica si fue modificada localmente
  onIniciarEdicion: () => void;
  onGuardarLocal: (nuevoValor: number | null) => void;
  onCancelar: () => void;
  color: string;
}> = ({
  valor,
  valorLocal,
  esEditable,
  estaEditando,
  tieneModificacion,
  onIniciarEdicion,
  onGuardarLocal,
  onCancelar,
  color
}) => {
  // Usar valor local si existe, sino el valor original
  const valorAMostrar = tieneModificacion ? valorLocal : valor;
  
  const [valorTemporal, setValorTemporal] = useState(
    valorAMostrar != null ? valorAMostrar.toString() : ''
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus cuando entra en edición
  useEffect(() => {
    if (estaEditando && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [estaEditando]);

  // Si cambia el valor externo, lo reflejamos
  useEffect(() => {
    setValorTemporal(valorAMostrar !== null && valorAMostrar !== undefined ? valorAMostrar.toString() : '');
  }, [valorAMostrar]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuardarLocal();
    } else if (e.key === 'Escape') {
      onCancelar();
    }
  };

  const handleGuardarLocal = () => {
    // Si dejó el campo vacío, interpretamos como null
    if (valorTemporal.trim() === '') {
      onGuardarLocal(null);
      return;
    }
    
    const num = parseInt(valorTemporal, 10);
    if (Number.isInteger(num) && num >= 0) {
      onGuardarLocal(num);
    } else {
      onCancelar();
    }
  };

  if (estaEditando) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={valorTemporal}
          onChange={(e) => setValorTemporal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleGuardarLocal}
          className="w-full px-2 py-1 bg-white/20 border border-white/40 rounded text-white text-center text-sm focus:outline-none focus:border-white/60"
        />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
          <button
            onClick={handleGuardarLocal}
            className="p-1 bg-[#51590E]/80 hover:bg-[#51590E] rounded text-white"
            title="Confirmar cambio local"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={onCancelar}
            className="p-1 bg-[#D94854]/80 hover:bg-[#D94854] rounded text-white"
            title="Cancelar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={esEditable ? onIniciarEdicion : undefined}
      className={`
        px-3 py-2 text-center text-sm font-medium rounded transition-all relative
        ${esEditable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
        ${valorAMostrar !== null ? 'text-white' : 'text-white/50'}
        ${tieneModificacion ? 'ring-2 ring-yellow-400/50 bg-yellow-400/10' : ''}
      `}
      style={{
        backgroundColor: valorAMostrar !== null && !tieneModificacion ? `${color}20` : 
                        tieneModificacion ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
        borderColor: valorAMostrar !== null ? `${color}30` : 'transparent'
      }}
    >
      {valorAMostrar !== null ? valorAMostrar : '-'}
      {esEditable && valorAMostrar === null && !tieneModificacion && (
        <Edit3 className="w-3 h-3 inline ml-1 text-white/40" />
      )}
      {tieneModificacion && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
      )}
    </div>
  );
};

/**
 * Componente principal de la tabla de envíos CON BATCH SAVE
 */
export const EnviosTabla: React.FC<EnviosTablaProps> = ({
  envios,
  onGuardarLote,
  onEliminarEnvio,
  puedeEditar,
  cargando = false
}) => {
  // Estados para edición local
  const [celdaEditando, setCeldaEditando] = useState<CeldaEditando | null>(null);
  const [cambiosPendientes, setCambiosPendientes] = useState<Map<string, CambioEnvio>>(new Map());
  const [filasModificadas, setFilasModificadas] = useState<Set<number>>(new Set());
  
  // Estados para acciones
  const [guardandoLote, setGuardandoLote] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  // Calcular si hay cambios pendientes
  const tieneChangesPendientes = cambiosPendientes.size > 0;

  // Función para generar key única para cada cambio
  const generarCambioKey = (dia: number, campo: TipoEnvio): string => {
    return `${dia}-${campo}`;
  };

  // Función para obtener valor local de una celda
  const obtenerValorLocal = (dia: number, campo: TipoEnvio): number | null | undefined => {
    const key = generarCambioKey(dia, campo);
    return cambiosPendientes.get(key)?.valorNuevo;
  };

  // Función para verificar si una celda tiene modificaciones
  const tieneModificacionLocal = (dia: number, campo: TipoEnvio): boolean => {
    const key = generarCambioKey(dia, campo);
    return cambiosPendientes.has(key);
  };

  // Manejar inicio de edición
  const handleIniciarEdicion = (dia: number, campo: TipoEnvio) => {
    if (!puedeEditar) return;
    
    const envio = envios[dia - 1];
    const valorActual = obtenerValorLocal(dia, campo) ?? envio[campo] ?? null;
    
    setCeldaEditando({ 
      dia, 
      campo, 
      valorTemporal: valorActual !== null ? valorActual.toString() : '' 
    });
  };

  // Manejar guardado local de celda (NO envía al servidor)
  const handleGuardarLocal = (dia: number, campo: TipoEnvio, nuevoValor: number | null) => {
    const envio = envios[dia - 1];
    if (!envio) return;

    const valorOriginal = envio[campo];
    const key = generarCambioKey(dia, campo);

    // Si el nuevo valor es igual al original, remover del mapa de cambios
    if (nuevoValor === valorOriginal) {
      const nuevosCambios = new Map(cambiosPendientes);
      nuevosCambios.delete(key);
      setCambiosPendientes(nuevosCambios);
      
      // Actualizar filas modificadas
      const filasConCambios = new Set<number>();
      nuevosCambios.forEach(cambio => filasConCambios.add(cambio.dia));
      setFilasModificadas(filasConCambios);
    } else {
      // Agregar/actualizar cambio
      const cambio: CambioEnvio = {
        dia,
        fecha: envio.fecha,
        campo,
        valorAnterior: valorOriginal,
        valorNuevo: nuevoValor
      };

      setCambiosPendientes(prev => new Map(prev.set(key, cambio)));
      setFilasModificadas(prev => new Set(prev.add(dia)));
    }

    setCeldaEditando(null);
  };

  // Manejar cancelación de edición
  const handleCancelarEdicion = () => {
    setCeldaEditando(null);
  };

  // Manejar guardado de todos los cambios (BATCH SAVE)
  const handleGuardarTodos = async () => {
    if (!tieneChangesPendientes) return;

    setGuardandoLote(true);
    try {
      const exito = await onGuardarLote(cambiosPendientes);
      if (exito) {
        // Limpiar cambios pendientes solo si fue exitoso
        setCambiosPendientes(new Map());
        setFilasModificadas(new Set());
      }
    } catch (error) {
      console.error('Error al guardar lote:', error);
    } finally {
      setGuardandoLote(false);
    }
  };

  // Manejar descarte de todos los cambios
  const handleDescartarCambios = () => {
    setCambiosPendientes(new Map());
    setFilasModificadas(new Set());
    setCeldaEditando(null);
  };

  // Manejar eliminación de envío
  const handleEliminar = async (envio: EnvioDiario) => {
    if (!puedeEditar || envio.id === 0) return;
    setEliminando(envio.id);
    try {
      await onEliminarEnvio(envio.id);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setEliminando(null);
    }
  };

  // Totales (considerando cambios locales)
  const calcularTotales = () => {
    const totales = {
      oca: 0, andreani: 0, retirosSucursal: 0, roberto: 0, 
      tino: 0, caddy: 0, mercadoLibre: 0, total: 0
    };

    envios.forEach((envio, index) => {
      const dia = index + 1;
      Object.entries(TIPOS_ENVIO).forEach(([key]) => {
        const campo = key as TipoEnvio;
        const valorLocal = obtenerValorLocal(dia, campo);
        const valorFinal = valorLocal !== undefined ? (valorLocal ?? 0) : (envio[campo] ?? 0);
        totales[campo] += valorFinal;
        totales.total += valorFinal;
      });
    });

    return totales;
  };

  const totales = calcularTotales();
  const filaConDatos = (envio: EnvioDiario, dia: number) => {
    // Una fila tiene datos si tiene valores originales O modificaciones locales
    const tieneValoresOriginales = envio.totalEnvios > 0;
    const tieneModificacionesLocales = filasModificadas.has(dia);
    return tieneValoresOriginales || tieneModificacionesLocales;
  };

  if (cargando) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B695BF] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Cargando envíos...</h3>
          <p className="text-white/60 text-sm">
            Obteniendo datos del período seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      
      {/* Header con controles de batch save */}
      <div className="bg-white/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#B695BF]" />
            <h3 className="text-lg font-semibold text-white">
              📋 Registro Diario de Envíos
            </h3>
            {guardandoLote && (
              <div className="flex items-center gap-2 ml-4">
                <Loader2 className="w-4 h-4 animate-spin text-[#51590E]" />
                <span className="text-sm text-[#51590E]">Guardando todos los cambios...</span>
              </div>
            )}
          </div>

          {/* Controles de batch save */}
          {puedeEditar && (
            <div className="flex items-center gap-2">
              {tieneChangesPendientes && (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      {cambiosPendientes.size} cambio{cambiosPendientes.size !== 1 ? 's' : ''} pendiente{cambiosPendientes.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleDescartarCambios}
                    disabled={guardandoLote}
                    className="flex items-center gap-2 px-3 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all disabled:opacity-50"
                    title="Descartar todos los cambios"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">Descartar</span>
                  </button>
                  
                  <button
                    onClick={handleGuardarTodos}
                    disabled={guardandoLote}
                    className="flex items-center gap-2 px-4 py-2 bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 rounded-lg text-[#51590E] transition-all disabled:opacity-50"
                  >
                    {guardandoLote ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Guardar Todo</span>
                  </button>
                </>
              )}
              
              {!tieneChangesPendientes && (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Haz cambios y presiona "Guardar Todo"</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div 
        className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar"
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        <table className="w-full">
          <thead className="bg-white/5 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                Fecha
              </th>
              {Object.entries(TIPOS_ENVIO).map(([key, cfg]) => (
                <th
                  key={key}
                  className="px-3 py-3 text-center text-sm font-medium border-r border-white/10"
                  style={{ color: cfg.color }}
                >
                  {cfg.label}
                </th>
              ))}
              <th className="px-3 py-3 text-center text-sm font-medium text-[#e327c4] border-r border-white/10">
                Total
              </th>
              {puedeEditar && (
                <th className="px-3 py-3 text-center text-sm font-medium text-white/60">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {envios.map((envio, i) => {
              const dia = i + 1;
              const conDatos = filaConDatos(envio, dia);
              const tieneModificaciones = filasModificadas.has(dia);
              
              return (
                <tr
                  key={`${dia}-${envio.fecha}`}
                  className={`
                    border-b border-white/5 hover:bg-white/5 transition-colors
                    ${conDatos ? 'bg-white/2' : ''}
                    ${tieneModificaciones ? 'bg-yellow-400/5 border-yellow-400/20' : ''}
                  `}
                >
                  <td className="px-4 py-3 border-r border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {formatearFechaConDia(envio.fecha)}
                      </span>
                      {tieneModificaciones && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Fila con cambios pendientes"></div>
                      )}
                    </div>
                  </td>
                  
                  {Object.entries(TIPOS_ENVIO).map(([key, cfg]) => {
                    const t = key as TipoEnvio;
                    const editando = celdaEditando?.dia === dia && celdaEditando.campo === t;
                    const valorLocal = obtenerValorLocal(dia, t);
                    const tieneModificacion = tieneModificacionLocal(dia, t);
                    
                    return (
                      <td key={key} className="border-r border-white/10">
                        <CeldaEditable
                          valor={envio[t]}
                          valorLocal={valorLocal}
                          esEditable={puedeEditar}
                          estaEditando={!!editando}
                          tieneModificacion={tieneModificacion}
                          onIniciarEdicion={() => handleIniciarEdicion(dia, t)}
                          onGuardarLocal={(v) => handleGuardarLocal(dia, t, v)}
                          onCancelar={handleCancelarEdicion}
                          color={cfg.color}
                        />
                      </td>
                    );
                  })}
                  
                  <td className="px-3 py-2 text-center border-r border-white/10">
                    {(() => {
                      // Calcular total incluyendo modificaciones locales
                      let totalFila = 0;
                      Object.keys(TIPOS_ENVIO).forEach(campo => {
                        const valorLocal = obtenerValorLocal(dia, campo as TipoEnvio);
                        const valorFinal = valorLocal !== undefined ? (valorLocal ?? 0) : (envio[campo as TipoEnvio] ?? 0);
                        totalFila += valorFinal;
                      });
                      
                      return (
                        <span
                          className={`
                            text-sm font-bold px-2 py-1 rounded
                            ${totalFila > 0
                              ? 'text-[#e327c4] bg-[#e327c4]/20'
                              : 'text-white/50'}
                          `}
                        >
                          {totalFila > 0 ? totalFila : '-'}
                        </span>
                      );
                    })()}
                  </td>
                  
                  {puedeEditar && (
                    <td className="px-3 py-2 text-center">
                      {conDatos && envio.id > 0 && (
                        <button
                          onClick={() => handleEliminar(envio)}
                          disabled={eliminando === envio.id}
                          className="p-1 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-colors disabled:opacity-50"
                          title="Eliminar registro"
                        >
                          {eliminando === envio.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          
          <tfoot className="bg-white/10 border-t-2 border-white/20">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-bold text-white border-r border-white/10">
                TOTALES
              </th>
              {Object.entries(TIPOS_ENVIO).map(([key, cfg]) => (
                <th
                  key={key}
                  className="px-3 py-4 text-center text-sm font-bold border-r border-white/10"
                >
                  <span
                    className="px-2 py-1 rounded"
                    style={{
                      color: cfg.color,
                      backgroundColor: `${cfg.color}20`
                    }}
                  >
                    {totales[key as keyof typeof totales].toLocaleString()}
                  </span>
                </th>
              ))}
              <th className="px-3 py-4 text-center text-sm font-bold text-[#e327c4] border-r border-white/10">
                <span className="px-2 py-1 rounded bg-[#e327c4]/20">
                  {totales.total.toLocaleString()}
                </span>
              </th>
              {puedeEditar && <th className="px-3 py-4"></th>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-4">
            <span>📊 Registros con datos: {envios.filter((e, i) => filaConDatos(e, i + 1)).length}</span>
            <span>📦 Total envíos: {totales.total.toLocaleString()}</span>
            {tieneChangesPendientes && (
              <span className="text-yellow-400">⚠️ {cambiosPendientes.size} cambios sin guardar</span>
            )}
          </div>
          {puedeEditar && (
            <div className="flex items-center gap-2">
              <span className="text-[#FFD700]">
                💡 Edita las celdas y presiona "Guardar Todo" para aplicar los cambios
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnviosTabla;