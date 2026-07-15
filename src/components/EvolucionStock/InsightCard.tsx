import React from 'react';
import type { InsightResumen } from '@/types/evolucionStock/resumenTypes';
import { obtenerVisualSeccion } from '@/components/EvolucionStock/insightVisuals';

interface Props {
  insight: InsightResumen;
  seccionCodigo: string;
  onOpenProducto?: () => void;
}

export const InsightCard: React.FC<Props> = ({ insight, seccionCodigo, onOpenProducto }) => {
  const visual = obtenerVisualSeccion(seccionCodigo);
  const Icono = visual.icono;

  return (
    <article
      className="flex min-h-40 flex-col rounded-lg border bg-white/[0.035] p-4"
      style={{ borderColor: `${visual.color}45` }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
          style={{ borderColor: `${visual.color}55`, backgroundColor: `${visual.color}18` }}
        >
          <Icono className="h-4.5 w-4.5" style={{ color: visual.color }} />
        </div>
        <p className="min-w-0 flex-1 text-sm leading-6 text-white/85">{insight.frase}</p>
      </div>

      {Object.keys(insight.valores).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/8 pt-3">
          {Object.entries(insight.valores).map(([clave, valor]) => (
            <div key={clave} className="min-w-20">
              <div className="text-xs font-semibold text-white/80">{formatearNumero(valor)}</div>
              <div className="text-[11px] text-white/35">{etiqueta(clave)}</div>
            </div>
          ))}
        </div>
      )}

      {insight.codigoProducto != null && onOpenProducto && (
        <button
          onClick={onOpenProducto}
          className="mt-4 inline-flex items-center gap-2 self-start rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/65 hover:bg-white/10 hover:text-white"
        >
          Ver producto {insight.codigoProducto}
        </button>
      )}
    </article>
  );
};

const etiqueta = (clave: string) => clave
  .replace(/([a-záéíóú])([A-Z])/g, '$1 $2')
  .replace(/^./, letra => letra.toUpperCase());

const formatearNumero = (valor: number) => valor.toLocaleString('es-AR', {
  maximumFractionDigits: 2
});

export default InsightCard;
