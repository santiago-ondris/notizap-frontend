import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  conflicto: ResultadoCargaStock | null;
  confirmarSobreescritura: boolean;
  confirmarFacturas: boolean;
  onSobreescrituraChange: (value: boolean) => void;
  onFacturasChange: (value: boolean) => void;
}

export const ConfirmacionReemplazo: React.FC<Props> = ({
  conflicto,
  confirmarSobreescritura,
  confirmarFacturas,
  onSobreescrituraChange,
  onFacturasChange
}) => {
  if (!conflicto?.requiereConfirmacion) return null;

  const tieneDias = conflicto.diasEnConflicto?.length > 0;
  const tieneFacturas = conflicto.facturasDuplicadas?.length > 0;

  return (
    <div className="rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/10 p-4 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5" />
        <div>
          <h4 className="font-medium text-[#FFD700]">Confirmacion requerida</h4>
          <p className="text-sm text-white/70">{conflicto.message}</p>
        </div>
      </div>

      {tieneDias && (
        <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmarSobreescritura}
            onChange={(event) => onSobreescrituraChange(event.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-white/10"
          />
          Reemplazar los dias en conflicto
        </label>
      )}

      {tieneFacturas && (
        <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmarFacturas}
            onChange={(event) => onFacturasChange(event.target.checked)}
            className="h-4 w-4 rounded border-white/30 bg-white/10"
          />
          Continuar aunque haya facturas ya cargadas en otra fecha
        </label>
      )}
    </div>
  );
};
