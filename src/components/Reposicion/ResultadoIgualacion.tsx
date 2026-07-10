import React from 'react';
import { Download, ArrowRightLeft, CheckCircle, Package, Loader2 } from 'lucide-react';
import type { ResultadoIgualacionDto, TransferenciaEditable } from '../../types/reposicion/igualacionTypes';
import { TablaTransferencias } from './TablaTransferencias';

interface Props {
  resultado: ResultadoIgualacionDto;
  transferenciasEditables: TransferenciaEditable[];
  onTransferenciasChange: (t: TransferenciaEditable[]) => void;
  onDescargar: () => void;
  descargando: boolean;
  tiempoEjecucion: number;
}

export const ResultadoIgualacion: React.FC<Props> = ({
  resultado,
  transferenciasEditables,
  onTransferenciasChange,
  onDescargar,
  descargando,
  tiempoEjecucion,
}) => {
  const { estadisticas, mensajesInformativos } = resultado;
  const incluidas = transferenciasEditables.filter((t) => t.incluida);

  if (!resultado.transferencias.length) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 py-12">
        <div className="w-16 h-16 rounded-full bg-[#51590E]/20 border border-[#51590E]/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-[#51590E]" />
        </div>
        <h3 className="text-xl font-semibold text-white">Stock ya equitativo</h3>
        <p className="text-white/60">
          No se encontraron movimientos necesarios. La distribución actual ya está equilibrada
          entre todas las sucursales.
        </p>
        {mensajesInformativos.map((msg, i) => (
          <p key={i} className="text-sm text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-2">
            {msg}
          </p>
        ))}
        <p className="text-xs text-white/30">Análisis completado en {tiempoEjecucion}ms</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header: stats + botón de descarga */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {[
            { label: 'Variantes analizadas', valor: estadisticas.totalVariantesAnalizadas, color: '#B695BF' },
            { label: 'Con movimientos', valor: estadisticas.variantesConMovimientos, color: '#F59E0B' },
            { label: 'Ya equitativas', valor: estadisticas.variantesYaEquitativas, color: '#4CAF50' },
            { label: 'Unidades a mover', valor: estadisticas.totalUnidadesAMover, color: '#B695BF' },
          ].map(({ label, valor, color }) => (
            <div
              key={label}
              className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
            >
              <p className="text-xl font-bold" style={{ color }}>{valor}</p>
              <p className="text-xs text-white/50 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button
            onClick={onDescargar}
            disabled={descargando || incluidas.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] hover:text-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {descargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {descargando ? 'Generando...' : 'Descargar Excel'}
          </button>
          <span className="text-xs text-white/30">
            {incluidas.length} transferencias · {incluidas.reduce((a, t) => a + t.cantidadEditada, 0)} uds · {tiempoEjecucion}ms
          </span>
        </div>
      </div>

      {mensajesInformativos.map((msg, i) => (
        <p key={i} className="text-sm text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded-lg px-4 py-3">
          {msg}
        </p>
      ))}

      {/* Tabla con tabs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-[#B695BF]" />
          <h3 className="text-sm font-semibold text-white">Transferencias sugeridas</h3>
          <span className="text-xs text-white/40 ml-auto flex items-center gap-1">
            <Package className="w-3 h-3" />
            Podés vetar o ajustar cantidades antes de descargar
          </span>
        </div>
        <TablaTransferencias
          transferencias={transferenciasEditables}
          onChange={onTransferenciasChange}
        />
      </div>
    </div>
  );
};
