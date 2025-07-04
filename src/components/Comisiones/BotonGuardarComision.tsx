import { useState, useEffect } from "react";
import { Save, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { formatearPeriodo } from "@/services/woocommerce/comisionService";
import type { CalculoComision } from "@/types/woocommerce/comisionTypes";

interface BotonGuardarComisionProps {
  onGuardar: () => void;
  calculoActual: CalculoComision | null;
  mes: number;
  año: number;
  loading: boolean;
  disabled?: boolean;
  existeComision?: boolean;
  variant?: 'default' | 'compact' | 'prominent';
  mostrarResumen?: boolean;
  className?: string;
}

export default function BotonGuardarComision({
  onGuardar,
  calculoActual,
  mes,
  año,
  loading,
  disabled = false,
  existeComision = false,
  variant = 'default',
  className = ''
}: BotonGuardarComisionProps) {
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(false);

  // Resetear estado cuando cambie el período o cálculo
  useEffect(() => {
    setGuardadoExitoso(false);
    setMostrandoConfirmacion(false);
  }, [mes, año, calculoActual]);

  // Manejar éxito del guardado
  useEffect(() => {
    if (!loading && guardadoExitoso) {
      const timer = setTimeout(() => {
        setGuardadoExitoso(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, guardadoExitoso]);

  const handleGuardar = () => {
    if (existeComision && !mostrandoConfirmacion) {
      setMostrandoConfirmacion(true);
      return;
    }

    onGuardar();
    setMostrandoConfirmacion(false);
    
    // Marcar como exitoso cuando termine de cargar
    if (!loading) {
      setGuardadoExitoso(true);
    }
  };

  const handleCancelar = () => {
    setMostrandoConfirmacion(false);
  };

  const puedeGuardar = calculoActual && !loading && !disabled;

  // Variante compacta
  if (variant === 'compact') {
    return (
      <button
        onClick={handleGuardar}
        disabled={!puedeGuardar}
        className={`
          flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${puedeGuardar
            ? 'bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:scale-105'
            : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
          }
          ${className}
        `}
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : guardadoExitoso ? (
          <Check className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span className="text-sm">
          {loading ? 'Guardando...' : guardadoExitoso ? 'Guardado' : 'Guardar'}
        </span>
      </button>
    );
  }

  // Variante prominente (con confirmación)
  if (mostrandoConfirmacion) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-[#D94854]/30 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#D94854]" />
          <div>
            <h4 className="text-sm font-semibold text-white">⚠️ Sobrescribir datos existentes</h4>
            <p className="text-xs text-white/60">
              Ya existe una comisión para {formatearPeriodo(mes, año)}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGuardar}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all"
          >
            <Save className="w-4 h-4" />
            <span>✅ Confirmar</span>
          </button>
          <button
            onClick={handleCancelar}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 rounded-lg text-sm font-medium transition-all"
          >
            <span>❌ Cancelar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Botón principal */}
      <button
        onClick={handleGuardar}
        disabled={!puedeGuardar}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200
          ${variant === 'prominent' ? 'text-lg py-5' : 'text-base'}
          ${puedeGuardar
            ? guardadoExitoso
              ? 'bg-[#51590E]/30 border border-[#51590E]/50 text-[#51590E] cursor-default'
              : existeComision
                ? 'bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] hover:scale-[1.02] shadow-lg'
                : 'bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:scale-[1.02] shadow-lg'
            : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
          }
        `}
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>💾 Guardando datos...</span>
          </>
        ) : guardadoExitoso ? (
          <>
            <Check className="w-5 h-5" />
            <span>✅ Datos guardados correctamente</span>
          </>
        ) : !puedeGuardar ? (
          <>
            <Save className="w-5 h-5" />
            <span>💾 Completa el cálculo para guardar</span>
          </>
        ) : existeComision ? (
          <>
            <Save className="w-5 h-5" />
            <span>🔄 Actualizar Datos Existentes</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>💾 Guardar Datos de Comisión</span>
          </>
        )}
      </button>

      {/* Estado de éxito */}
      {guardadoExitoso && (
        <div className="flex items-center gap-2 p-3 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
          <Check className="w-4 h-4 text-[#51590E]" />
          <span className="text-sm text-[#51590E] font-medium">
            ✅ Los datos se guardaron correctamente y estarán disponibles para futuras consultas
          </span>
        </div>
      )}
    </div>
  );
}