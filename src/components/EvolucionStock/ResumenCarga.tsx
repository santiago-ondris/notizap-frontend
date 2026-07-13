import React from 'react';
import { AlertTriangle, CheckCircle2, Palette } from 'lucide-react';
import type { ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  resultado: ResultadoCargaStock | null;
}

export const ResumenCarga: React.FC<Props> = ({ resultado }) => {
  if (!resultado) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#51590E] mt-0.5" />
        <div>
          <h3 className="font-semibold text-white">Carga procesada</h3>
          <p className="text-sm text-white/60">{resultado.message}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{resultado.filasProcesadas}</div>
          <div className="text-xs text-white/50">Filas procesadas</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="text-2xl font-bold text-[#FFD700]">{resultado.filasDescartadas}</div>
          <div className="text-xs text-white/50">Filas descartadas</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-[#B695BF]">
            <Palette className="w-5 h-5" />
            {resultado.coloresNuevos}
          </div>
          <div className="text-xs text-white/50">Colores aprendidos</div>
        </div>
      </div>

      {Object.keys(resultado.motivosDescarte || {}).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-2">Motivos de descarte</h4>
          <div className="space-y-2">
            {Object.entries(resultado.motivosDescarte).map(([motivo, cantidad]) => (
              <div key={motivo} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                <span className="text-white/70">{motivo}</span>
                <span className="text-white font-medium">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {resultado.facturasDuplicadas?.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/10 p-4">
          <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <div className="text-sm text-white/70">
            <div className="font-medium text-[#FFD700] mb-1">Facturas duplicadas confirmadas</div>
            {resultado.facturasDuplicadas.map(f => (
              <div key={f.numeroFactura}>{f.numeroFactura} - {new Date(f.fechaExistente).toLocaleDateString('es-AR')}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
