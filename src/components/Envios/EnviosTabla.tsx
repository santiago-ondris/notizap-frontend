import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Trash2,
  X,
  Loader2,
  Edit3,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  type EnvioDiario,
  type CreateEnvioDiarioDto,
  type UpdateEnvioDiarioDto,
  type TipoEnvio,
  TIPOS_ENVIO
} from '@/types/envios/enviosTypes';
import { formatearFechaConDia } from '@/utils/envios/fechaHelpers';

interface EnviosTablaProps {
  envios: EnvioDiario[];
  onGuardarEnvio: (
    envio: CreateEnvioDiarioDto | UpdateEnvioDiarioDto,
    id?: number
  ) => Promise<boolean>;
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
 * Componente de celda editable
 */
const CeldaEditable: React.FC<{
  valor: number | null;
  esEditable: boolean;
  estaEditando: boolean;
  onIniciarEdicion: () => void;
  onGuardar: (nuevoValor: number | null) => void;
  onCancelar: () => void;
  color: string;
}> = ({
  valor,
  esEditable,
  estaEditando,
  onIniciarEdicion,
  onGuardar,
  onCancelar,
  color
}) => {
  // Inicializamos con string vacío si es null, o con su valor de texto
  const [valorTemporal, setValorTemporal] = useState(
    valor !== null ? valor.toString() : ''
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
    setValorTemporal(valor !== null ? valor.toString() : '');
  }, [valor]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuardar();
    } else if (e.key === 'Escape') {
      onCancelar();
    }
  };

  const handleGuardar = () => {
    // Si dejó el campo vacío, interpretamos como borrar valor
    if (valorTemporal.trim() === '') {
      onGuardar(null);
      return;
    }
    const num = parseInt(valorTemporal, 10);
    if (Number.isInteger(num) && num >= 0) {
      onGuardar(num);
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
          onBlur={handleGuardar}
          className="w-full px-2 py-1 bg-white/20 border border-white/40 rounded text-white text-center text-sm focus:outline-none focus:border-white/60"
        />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
          <button
            onClick={handleGuardar}
            className="p-1 bg-[#51590E]/80 hover:bg-[#51590E] rounded text-white"
            title="Guardar (o borrar si vacío)"
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
        px-3 py-2 text-center text-sm font-medium rounded transition-all
        ${esEditable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
        ${valor !== null ? 'text-white' : 'text-white/50'}
      `}
      style={{
        backgroundColor: valor !== null ? `${color}20` : 'transparent',
        borderColor: valor !== null ? `${color}30` : 'transparent'
      }}
    >
      {valor !== null ? valor : '-'}
      {esEditable && valor === null && (
        <Edit3 className="w-3 h-3 inline ml-1 text-white/40" />
      )}
    </div>
  );
};

/**
 * Componente principal de la tabla de envíos
 */
export const EnviosTabla: React.FC<EnviosTablaProps> = ({
  envios,
  onGuardarEnvio,
  onEliminarEnvio,
  puedeEditar,
  cargando = false
}) => {
  const [celdaEditando, setCeldaEditando] = useState<CeldaEditando | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<number | null>(null);

  // Totales para footer
  const totales = {
    oca: envios.reduce((sum, e) => sum + (e.oca ?? 0), 0),
    andreani: envios.reduce((sum, e) => sum + (e.andreani ?? 0), 0),
    retirosSucursal: envios.reduce((sum, e) => sum + (e.retirosSucursal ?? 0), 0),
    roberto: envios.reduce((sum, e) => sum + (e.roberto ?? 0), 0),
    tino: envios.reduce((sum, e) => sum + (e.tino ?? 0), 0),
    caddy: envios.reduce((sum, e) => sum + (e.caddy ?? 0), 0),
    mercadoLibre: envios.reduce((sum, e) => sum + (e.mercadoLibre ?? 0), 0),
    total: envios.reduce((sum, e) => sum + (e.totalEnvios ?? 0), 0)
  };

  const handleIniciarEdicion = (dia: number, campo: TipoEnvio) => {
    if (!puedeEditar) return;
    const envio = envios[dia - 1];
    const val = envio[campo] ?? null;
    setCeldaEditando({ dia, campo, valorTemporal: val !== null ? val.toString() : '' });
  };

  const handleGuardarCelda = async (
    dia: number,
    campo: TipoEnvio,
    nuevoValor: number | null
  ) => {
    const envio = envios[dia - 1];
    if (!envio) return;
    setGuardando(true);
    try {
      // Preparamos solo el campo modificado
      const updateDto: UpdateEnvioDiarioDto = {
        // asignamos null o número según corresponda
        [campo]: nuevoValor
      } as unknown as UpdateEnvioDiarioDto;

      // Usamos el id para actualizar
      const exito = await onGuardarEnvio(updateDto, envio.id);
      if (exito) {
        setCeldaEditando(null);
      }
    } catch (error) {
      console.error('Error al guardar celda:', error);
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelarEdicion = () => {
    setCeldaEditando(null);
  };

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

  const filaConDatos = (envio: EnvioDiario) => envio.totalEnvios > 0;

  if (cargando) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B695BF] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Cargando envíos.</h3>
          <p className="text-white/60 text-sm">
            Obteniendo datos del período seleccionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#B695BF]" />
          <h3 className="text-lg font-semibold text-white">
            📋 Registro Diario de Envíos
          </h3>
          {guardando && (
            <div className="flex items-center gap-2 ml-4">
              <Loader2 className="w-4 h-4 animate-spin text-[#51590E]" />
              <span className="text-sm text-[#51590E]">Guardando.</span>
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
              const conDatos = filaConDatos(envio);
              return (
                <tr
                  key={`${dia}-${envio.fecha}`}
                  className={`
                    border-b border-white/5 hover:bg-white/5 transition-colors
                    ${conDatos ? 'bg-white/2' : ''}
                  `}
                >
                <td className="px-4 py-3 border-r border-white/10">
                  <span className="text-sm font-medium text-white">
                    {formatearFechaConDia(envio.fecha)}
                  </span>
                </td>
                  {Object.entries(TIPOS_ENVIO).map(([key, cfg]) => {
                    const t = key as TipoEnvio;
                    const editando =
                      celdaEditando?.dia === dia && celdaEditando.campo === t;
                    return (
                      <td key={key} className="border-r border-white/10">
                        <CeldaEditable
                          valor={envio[t]}
                          esEditable={puedeEditar}
                          estaEditando={!!editando}
                          onIniciarEdicion={() => handleIniciarEdicion(dia, t)}
                          onGuardar={(v) => handleGuardarCelda(dia, t, v)}
                          onCancelar={handleCancelarEdicion}
                          color={cfg.color}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center border-r border-white/10">
                    <span
                      className={`
                        text-sm font-bold px-2 py-1 rounded
                        ${envio.totalEnvios > 0
                          ? 'text-[#e327c4] bg-[#e327c4]/20'
                          : 'text-white/50'}
                      `}
                    >
                      {envio.totalEnvios > 0 ? envio.totalEnvios : '-'}
                    </span>
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
            <span>📊 Total registros: {envios.filter(e => e.totalEnvios > 0).length}</span>
            <span>📦 Total envíos: {totales.total.toLocaleString()}</span>
          </div>
          {puedeEditar && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FFD700]" />
              <span className="text-[#FFD700]">Clic en cualquier celda para editar</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnviosTabla;
