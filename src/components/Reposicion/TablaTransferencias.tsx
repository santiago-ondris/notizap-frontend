import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { TransferenciaEditable } from '../../types/reposicion/igualacionTypes';

interface Props {
  transferencias: TransferenciaEditable[];
  onChange: (actualizadas: TransferenciaEditable[]) => void;
}

const clave = (t: TransferenciaEditable) =>
  `${t.sucursalOrigen}|${t.sucursalDestino}|${t.producto}|${t.color}|${t.talle}`;

export const TablaTransferencias: React.FC<Props> = ({ transferencias, onChange }) => {
  const origenes = useMemo(
    () => [...new Set(transferencias.map((t) => t.sucursalOrigen))],
    [transferencias]
  );

  const [tabActiva, setTabActiva] = useState<string>(origenes[0] ?? '');
  const [busqueda, setBusqueda] = useState<Record<string, string>>({});

  const busquedaActual = busqueda[tabActiva] ?? '';

  const itemsTab = useMemo(() => {
    const items = transferencias.filter((t) => t.sucursalOrigen === tabActiva);
    if (!busquedaActual.trim()) return items;
    const q = busquedaActual.toLowerCase();
    return items.filter(
      (t) =>
        t.producto.toLowerCase().includes(q) ||
        t.color.toLowerCase().includes(q) ||
        t.sucursalDestino.toLowerCase().includes(q)
    );
  }, [transferencias, tabActiva, busquedaActual]);

  const contadorTab = (origen: string) => {
    const items = transferencias.filter((t) => t.sucursalOrigen === origen);
    const incluidas = items.filter((t) => t.incluida).length;
    return { total: items.length, incluidas };
  };

  const actualizarTransferencia = (
    k: string,
    campo: 'incluida' | 'cantidadEditada',
    valor: boolean | number
  ) => {
    onChange(transferencias.map((t) => (clave(t) === k ? { ...t, [campo]: valor } : t)));
  };

  const toggleTodosVisibles = (incluir: boolean) => {
    const clavesVisibles = new Set(itemsTab.map(clave));
    onChange(
      transferencias.map((t) =>
        clavesVisibles.has(clave(t)) ? { ...t, incluida: incluir } : t
      )
    );
  };

  const todasVisiblesIncluidas = itemsTab.every((t) => t.incluida);
  const algunaVisibleIncluida = itemsTab.some((t) => t.incluida);

  if (origenes.length === 0) return null;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 bg-white/[0.02]">
        {origenes.map((origen) => {
          const { total, incluidas } = contadorTab(origen);
          const activa = tabActiva === origen;
          return (
            <button
              key={origen}
              onClick={() => setTabActiva(origen)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activa
                  ? 'border-[#B695BF] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
              }`}
            >
              {origen}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activa ? 'bg-[#B695BF]/20 text-[#B695BF]' : 'bg-white/10 text-white/40'
                }`}
              >
                {incluidas}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra de búsqueda + toggle todo */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Buscar producto, color o destino..."
            value={busquedaActual}
            onChange={(e) =>
              setBusqueda((prev) => ({ ...prev, [tabActiva]: e.target.value }))
            }
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#B695BF]/40 transition-colors"
          />
          {busquedaActual && (
            <button
              onClick={() => setBusqueda((prev) => ({ ...prev, [tabActiva]: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {itemsTab.length > 0 && (
          <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer select-none flex-shrink-0">
            <input
              type="checkbox"
              checked={todasVisiblesIncluidas}
              ref={(el) => {
                if (el) el.indeterminate = !todasVisiblesIncluidas && algunaVisibleIncluida;
              }}
              onChange={(e) => toggleTodosVisibles(e.target.checked)}
              className="w-4 h-4 accent-[#B695BF] cursor-pointer"
            />
            {busquedaActual ? 'Sel. filtrados' : 'Sel. todos'}
          </label>
        )}
      </div>

      {/* Filas */}
      <div
        className="divide-y divide-white/5 max-h-[420px] overflow-y-auto custom-scrollbar"
        onWheel={(e) => e.stopPropagation()}
      >
        {itemsTab.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/30">
            {busquedaActual ? 'Sin resultados para esa búsqueda' : 'Sin transferencias para esta sucursal'}
          </div>
        ) : (
          itemsTab.map((t) => (
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

              <span className="flex-1 text-sm text-white/90 truncate min-w-0">
                {t.producto}
                <span className="text-white/50"> · {t.color} · T{t.talle}</span>
              </span>

              <span className="text-xs text-white/50 hidden sm:block flex-shrink-0">
                Stock: {t.stockOrigen}→{t.stockDestino}
              </span>

              <span className="text-xs text-white/60 px-2 flex-shrink-0">→ {t.sucursalDestino}</span>

              <div className="flex items-center gap-1 flex-shrink-0">
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
                  className="w-14 text-center bg-white/10 border border-white/20 rounded px-1.5 py-1 text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:border-[#B695BF]/50"
                />
                <span className="text-xs text-white/30">/{t.cantidad}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer de la tab activa */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-white/[0.02]">
        <span className="text-xs text-white/40">
          {busquedaActual
            ? `${itemsTab.length} resultado${itemsTab.length !== 1 ? 's' : ''}`
            : `${itemsTab.filter((t) => t.incluida).length} de ${itemsTab.length} incluidas`}
        </span>
        <span className="text-xs text-white/40">
          {itemsTab.filter((t) => t.incluida).reduce((a, t) => a + t.cantidadEditada, 0)} uds seleccionadas
        </span>
      </div>
    </div>
  );
};
