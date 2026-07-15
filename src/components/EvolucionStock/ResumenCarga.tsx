import React from 'react';
import { AlertTriangle, CheckCircle2, Link2, Palette, Route } from 'lucide-react';
import type { ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';
import type { ResultadoCargaRemitos } from '@/types/evolucionStock/remitosTypes';

interface Props {
  resultado: ResultadoCargaStock | ResultadoCargaRemitos | null;
}

export const ResumenCarga: React.FC<Props> = ({ resultado }) => {
  if (!resultado) return null;

  const esRemitos = 'remitosDistintos' in resultado;
  const facturasDuplicadas = !esRemitos ? resultado.facturasDuplicadas : [];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#7F9A45] mt-0.5" />
        <div>
          <h3 className="font-semibold text-white">Carga procesada</h3>
          <p className="text-sm text-white/60">{resultado.message}</p>
        </div>
      </div>

      <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
        <div className="bg-[#202027] p-4">
          <div className="text-2xl font-bold text-white">{resultado.filasProcesadas}</div>
          <div className="text-xs text-white/50">Filas procesadas</div>
        </div>
        <div className="bg-[#202027] p-4">
          <div className="text-2xl font-bold text-[#FFD700]">{resultado.filasDescartadas}</div>
          <div className="text-xs text-white/50">Filas descartadas</div>
        </div>
        <div className="bg-[#202027] p-4">
          {esRemitos ? (
            <>
              <div className="flex items-center gap-2 text-2xl font-bold text-[#FCA5B5]"><Route className="w-5 h-5" />{resultado.remitosDistintos}</div>
              <div className="text-xs text-white/50">Remitos distintos</div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-2xl font-bold text-[#CDB6D5]"><Palette className="w-5 h-5" />{resultado.coloresNuevos}</div>
              <div className="text-xs text-white/50">Colores aprendidos</div>
            </>
          )}
        </div>
      </div>

      {esRemitos && (
        <div className="flex flex-col gap-2 border-l-2 border-[#B695BF] bg-[#B695BF]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Link2 className="h-4 w-4 text-[#CDB6D5]" />
            {resultado.matching.nombresMatcheados} de {resultado.matching.nombresTotales} productos vinculados
          </div>
          <div className="text-sm font-medium text-[#CDB6D5]">{resultado.matching.porcentajeUnidades.toFixed(2)}% de unidades</div>
        </div>
      )}

      {Object.keys(resultado.motivosDescarte || {}).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-2">Motivos de descarte</h4>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {Object.entries(resultado.motivosDescarte).map(([motivo, cantidad]) => (
              <div key={motivo} className="flex items-center justify-between px-1 py-2 text-sm">
                <span className="text-white/70">{motivo}</span>
                <span className="font-medium text-white">{cantidad}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {facturasDuplicadas.length > 0 && (
        <div className="flex items-start gap-3 border-l-2 border-[#FFD700] bg-[#FFD700]/5 px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-[#FFD700] mt-0.5" />
          <div className="text-sm text-white/70">
            <div className="font-medium text-[#FFD700] mb-1">Facturas duplicadas confirmadas</div>
            {facturasDuplicadas.map(f => (
              <div key={f.numeroFactura}>{f.numeroFactura} - {new Date(f.fechaExistente).toLocaleDateString('es-AR')}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
