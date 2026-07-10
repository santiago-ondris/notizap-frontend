import React, { useMemo } from 'react';
import { Package } from 'lucide-react';
import type { TransferenciaEditable } from '../../types/reposicion/igualacionTypes';

interface Props {
  transferencias: TransferenciaEditable[];
  onChange: (actualizadas: TransferenciaEditable[]) => void;
}

export const TablaTransferencias: React.FC<Props> = ({ transferencias, onChange }) => {
  const porOrigen = useMemo(() => {
    const grupos: Record<string, TransferenciaEditable[]> = {};
    for (const t of transferencias) {
      if (!grupos[t.sucursalOrigen]) grupos[t.sucursalOrigen] = [];
      grupos[t.sucursalOrigen].push(t);
    }
    return grupos;
  }, [transferencias]);

  const totalSeleccionadas = transferencias.filter((t) => t.incluida).length;
  const totalUnidades = transferencias
    .filter((t) => t.incluida)
    .reduce((acc, t) => acc + t.cantidadEditada, 0);

  const actualizarTransferencia = (
    clave: string,
    campo: 'incluida' | 'cantidadEditada',
    valor: boolean | number
  ) => {
    const actualizadas = transferencias.map((t) =>
      t.sucursalOrigen + '|' + t.sucursalDestino + '|' + t.producto + '|' + t.color + '|' + t.talle === clave
        ? { ...t, [campo]: valor }
        : t
    );
    onChange(actualizadas);
  };

  const toggleTodoOrigen = (origen: string, incluir: boolean) => {
    const actualizadas = transferencias.map((t) =>
      t.sucursalOrigen === origen ? { ...t, incluida: incluir } : t
    );
    onChange(actualizadas);
  };

  const clave = (t: TransferenciaEditable) =>
    `${t.sucursalOrigen}|${t.sucursalDestino}|${t.producto}|${t.color}|${t.talle}`;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/10">
        <span className="text-sm text-white/70">
          <span className="font-semibold text-white">{totalSeleccionadas}</span> de{' '}
          {transferencias.length} transferencias incluidas
        </span>
        <span className="text-sm text-white/70">
          <span className="font-semibold text-white">{totalUnidades}</span> unidades a mover
        </span>
      </div>

      {Object.entries(porOrigen).map(([origen, items]) => {
        const todasIncluidas = items.every((t) => t.incluida);
        const algunaIncluida = items.some((t) => t.incluida);

        return (
          <div key={origen} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            {/* Header del origen */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
              <input
                type="checkbox"
                checked={todasIncluidas}
                ref={(el) => {
                  if (el) el.indeterminate = !todasIncluidas && algunaIncluida;
                }}
                onChange={(e) => toggleTodoOrigen(origen, e.target.checked)}
                className="w-4 h-4 accent-[#B695BF] cursor-pointer"
              />
              <Package className="w-4 h-4 text-[#B695BF]" />
              <span className="font-semibold text-white">{origen}</span>
              <span className="ml-auto text-xs text-white/50">
                {items.filter((t) => t.incluida).length}/{items.length} incluidas ·{' '}
                {items.filter((t) => t.incluida).reduce((a, t) => a + t.cantidadEditada, 0)} uds
              </span>
            </div>

            {/* Filas */}
            <div className="divide-y divide-white/5">
              {items.map((t) => (
                <div
                  key={clave(t)}
                  className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    t.incluida ? '' : 'opacity-40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={t.incluida}
                    onChange={(e) => actualizarTransferencia(clave(t), 'incluida', e.target.checked)}
                    className="w-4 h-4 accent-[#B695BF] cursor-pointer flex-shrink-0"
                  />

                  <span className="flex-1 text-sm text-white/90 truncate">
                    {t.producto}{' '}
                    <span className="text-white/50">
                      · {t.color} · T{t.talle}
                    </span>
                  </span>

                  <span className="text-xs text-white/50 hidden sm:block">
                    Stock: {t.stockOrigen}→{t.stockDestino}
                  </span>

                  <span className="text-xs text-white/60 px-2">→ {t.sucursalDestino}</span>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={t.cantidad}
                      value={t.cantidadEditada}
                      disabled={!t.incluida}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(t.cantidad, Number(e.target.value)));
                        actualizarTransferencia(clave(t), 'cantidadEditada', val);
                      }}
                      className="w-16 text-center bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-[#B695BF]/50"
                    />
                    <span className="text-xs text-white/40">/ {t.cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
