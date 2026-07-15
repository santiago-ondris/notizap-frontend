import React from 'react';
import { AlertTriangle, CalendarDays, ChevronDown, MapPin, PackageSearch, Route } from 'lucide-react';
import type { ValidacionRemitos } from '@/types/evolucionStock/remitosTypes';

interface Props {
  diagnostico: ValidacionRemitos;
  onMapearDeposito: (deposito: string) => void;
}

const formatoFecha = (fecha?: string | null) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const colorPorcentaje = (porcentaje: number) => {
  if (porcentaje >= 95) return { barra: '#7F9A45', texto: 'text-[#AFC56F]' };
  if (porcentaje >= 85) return { barra: '#FFD700', texto: 'text-[#FFD700]' };
  return { barra: '#F23D5E', texto: 'text-[#FCA5B5]' };
};

const BarraMatching: React.FC<{ etiqueta: string; valor: number; detalle: string }> = ({ etiqueta, valor, detalle }) => {
  const color = colorPorcentaje(valor);
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white/80">{etiqueta}</div>
          <div className="text-xs text-white/45">{detalle}</div>
        </div>
        <div className={`text-lg font-semibold ${color.texto}`}>{valor.toFixed(2)}%</div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.min(valor, 100)}%`, backgroundColor: color.barra }} />
      </div>
    </div>
  );
};

export const DiagnosticoRemitos: React.FC<Props> = ({ diagnostico, onMapearDeposito }) => {
  const matching = diagnostico.matching;

  return (
    <div className="space-y-5">
      <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
        <div className="bg-[#202027] p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><Route className="h-4 w-4" /> Remitos</div>
          <div className="mt-1 text-2xl font-semibold text-white">{diagnostico.remitosDistintos}</div>
        </div>
        <div className="bg-[#202027] p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><PackageSearch className="h-4 w-4" /> Líneas</div>
          <div className="mt-1 text-2xl font-semibold text-white">{diagnostico.filasProcesadas}</div>
        </div>
        <div className="bg-[#202027] p-4">
          <div className="flex items-center gap-2 text-xs text-white/45"><CalendarDays className="h-4 w-4" /> Período</div>
          <div className="mt-2 text-sm font-medium text-white">{formatoFecha(diagnostico.fechaDesde)} – {formatoFecha(diagnostico.fechaHasta)}</div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <BarraMatching
          etiqueta="Coincidencia de productos"
          valor={matching.porcentaje}
          detalle={`${matching.nombresMatcheados} de ${matching.nombresTotales} nombres`}
        />
        <BarraMatching
          etiqueta="Cobertura por unidades"
          valor={matching.porcentajeUnidades}
          detalle={`${matching.unidadesMatcheadas} de ${matching.unidadesTotales} unidades`}
        />
      </div>

      {diagnostico.depositosSinMapear.length > 0 && (
        <div className="border-l-2 border-[#FFD700] bg-[#FFD700]/5 px-4 py-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#FFD700]">
            <MapPin className="h-4 w-4" /> Depósitos sin mapear
          </div>
          <div className="flex flex-wrap gap-2">
            {diagnostico.depositosSinMapear.map(deposito => (
              <button
                key={deposito}
                type="button"
                onClick={() => onMapearDeposito(deposito)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/10 px-3 py-2 text-sm text-white/80 hover:bg-[#FFD700]/15"
              >
                <MapPin className="h-4 w-4 text-[#FFD700]" />
                {deposito}
              </button>
            ))}
          </div>
        </div>
      )}

      {matching.sinMatch.length > 0 && (
        <details className="group border-t border-white/10 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/80">
            <span>{matching.sinMatch.length} productos pendientes · {matching.unidadesTotales - matching.unidadesMatcheadas} unidades</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-white/10 text-left text-xs text-white/45">
                <tr><th className="px-3 py-2 font-medium">Producto</th><th className="px-3 py-2 text-right font-medium">Unidades</th><th className="px-3 py-2 font-medium">Estado</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matching.sinMatch.map(producto => (
                  <tr key={producto.nombre}>
                    <td className="px-3 py-2.5 text-white/80">{producto.nombre}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-white">{producto.unidades}</td>
                    <td className="px-3 py-2.5 text-white/50">{producto.motivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {diagnostico.advertencias.length > 0 && (
        <details className="group border-t border-white/10 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-[#FFD700]">
            <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {diagnostico.advertencias.length} advertencias</span>
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            {diagnostico.advertencias.map((advertencia, index) => <li key={`${index}-${advertencia}`}>{advertencia}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
};
