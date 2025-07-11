import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit3, Package } from 'lucide-react';
import { type EstadoEtiqueta } from '@/types/cambios/cambiosTypes';

interface CeldaEtiquetaProps {
  estado: EstadoEtiqueta;
  onActualizar: (etiqueta: string, despachada: boolean) => Promise<boolean>;
  deshabilitado?: boolean;
  className?: string;
}

export const CeldaEtiqueta: React.FC<CeldaEtiquetaProps> = ({
  estado,
  onActualizar,
  deshabilitado = false,
  className = ''
}) => {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(estado.valor);
  const [despachada, setDespachada] = useState(estado.despachada);
  const [guardando, setGuardando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar con props cuando cambien
  useEffect(() => {
    setValor(estado.valor);
    setDespachada(estado.despachada);
  }, [estado]);

  // Auto-focus al iniciar edición
  useEffect(() => {
    if (editando && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editando]);

  const iniciarEdicion = () => {
    if (deshabilitado) return;
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setValor(estado.valor);
    setDespachada(estado.despachada);
    setEditando(false);
  };

  const guardarCambios = async () => {
    if (guardando) return;

    setGuardando(true);
    try {
      const exitoso = await onActualizar(valor, despachada);
      if (exitoso) {
        setEditando(false);
      }
    } catch (error) {
      // El error ya se maneja en el componente padre
      setValor(estado.valor);
      setDespachada(estado.despachada);
    } finally {
      setGuardando(false);
    }
  };

  const manejarKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      guardarCambios();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelarEdicion();
    }
  };

  const toggleDespachada = async () => {
    if (deshabilitado || guardando) return;

    setGuardando(true);
    try {
      // Usar el valor actual del estado, no el local
      const etiquetaActual = valor || estado.valor || '';
      await onActualizar(etiquetaActual, !despachada);
    } catch (error) {
      // El error ya se maneja en el componente padre
    } finally {
      setGuardando(false);
    }
  };

  if (editando) {
    return (
      <div className={`flex items-center gap-2 min-w-[200px] ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={manejarKeyDown}
          className="flex-1 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF] focus:bg-white/15"
          placeholder="Escribir etiqueta..."
          disabled={guardando}
        />
        
        <div className="flex items-center gap-1">
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="p-1 text-[#51590E] hover:bg-[#51590E]/20 rounded transition-colors disabled:opacity-50"
            title="Guardar cambios"
          >
            <Check className="w-4 h-4" />
          </button>
          
          <button
            onClick={cancelarEdicion}
            disabled={guardando}
            className="p-1 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-colors disabled:opacity-50"
            title="Cancelar edición"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 min-w-[200px] ${className}`}>
      {/* Campo de texto (click para editar) */}
      <div
        onClick={iniciarEdicion}
        className={`flex-1 px-2 py-1 text-sm rounded border transition-colors cursor-pointer ${
          deshabilitado
            ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
            : 'bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30'
        }`}
        title={deshabilitado ? 'Solo lectura' : 'Click para editar etiqueta'}
      >
        {valor || (
          <span className="text-white/50 italic flex items-center gap-1">
            <Package className="w-3 h-3" />
            Sin etiqueta
          </span>
        )}
      </div>

      {/* Checkbox "Despachada" */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleDespachada}
          disabled={deshabilitado || guardando}
          className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
            despachada
              ? 'bg-[#51590E] border-[#51590E] text-white'
              : 'bg-transparent border-white/30 hover:border-white/50'
          } ${
            deshabilitado || guardando
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:scale-105'
          }`}
          title={despachada ? 'Etiqueta despachada' : 'Marcar como despachada'}
        >
          {despachada && <Check className="w-3 h-3" />}
        </button>
        
        <span 
          className={`text-xs ${
            despachada ? 'text-[#51590E]' : 'text-white/50'
          }`}
        >
          {despachada ? 'Despachada' : 'Marcar Despachada'}
        </span>
      </div>

      {/* Indicador de edición */}
      {!deshabilitado && (
        <button
          onClick={iniciarEdicion}
          className="p-1 text-white/40 hover:text-white/70 hover:bg-white/10 rounded transition-colors"
          title="Editar etiqueta"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default CeldaEtiqueta;