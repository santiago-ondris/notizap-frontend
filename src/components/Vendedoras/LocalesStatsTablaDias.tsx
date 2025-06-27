import { getCumplimientoBadge, buildComparacionTooltip } from '@/utils/vendedoras/rendimientoLocalesHelpers';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';
import { cn } from '@/lib/utils';

export function LocalesStatsTablaDias({
  dias,
  metricaComparar,
  onVendedoraClick,
}: {
  dias: any[]; // RendimientoLocalesDia[]
  metricaComparar: 'monto' | 'cantidad';
  onVendedoraClick?: (nombre: string) => void;
}) {
  return (
    <div className="mt-8">
      <div className="overflow-x-auto rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-2">
        <table className="min-w-[800px] w-full text-white/80">
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-2 px-2 text-left">Fecha</th>
              <th className="py-2 px-2 text-left">Turno</th>
              <th className="py-2 px-2 text-left">Promedio</th>
              <th className="py-2 px-2 text-left">Vendedora</th>
              <th className="py-2 px-2 text-left">Monto</th>
              <th className="py-2 px-2 text-left">Cantidad</th>
              <th className="py-2 px-2 text-left">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {dias.map(dia =>
              dia.vendedoras.map((v: any, j: number) => {
                const promedio = metricaComparar === 'monto' ? dia.promedioMontoVendedora : dia.promedioCantidadVendedora;
                const cumplimiento = metricaComparar === 'monto' ? v.cumplioMontoPromedio : v.cumplioCantidadPromedio;
                const badge = getCumplimientoBadge(cumplimiento, metricaComparar);

                return (
                  <tr key={`${dia.fecha}-${v.vendedoraNombre}-${j}`} className="border-b border-white/10 hover:bg-white/10 transition">
                    <td className="py-1 px-2 text-white/70">{dateHelpers.formatearFechaConDia(dia.fecha)}</td>
                    <td className="py-1 px-2">{dia.turno}</td>
                    <td className="py-1 px-2 font-bold text-white/80">
                      {Math.round(promedio)} {metricaComparar === 'monto' ? '$' : 'pares'}
                    </td>
                    <td className={cn("py-1 px-2 font-semibold cursor-pointer", onVendedoraClick && "underline hover:text-[#B695BF]")}
                        onClick={() => onVendedoraClick?.(v.vendedoraNombre)}>
                      {v.vendedoraNombre}
                    </td>
                    <td className="py-1 px-2">{v.monto}</td>
                    <td className="py-1 px-2">{v.cantidad}</td>
                    <td className="py-1 px-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: badge.color + '22',
                          color: badge.color,
                          border: `1px solid ${badge.color}88`,
                        }}
                        title={buildComparacionTooltip(v, promedio, metricaComparar)}
                      >
                        {badge.emoji} {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
