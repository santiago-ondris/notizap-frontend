import { ordenarResumenPorCumplimiento, formatResumenCumplimiento } from '@/utils/vendedoras/rendimientoLocalesHelpers';
import { Card, CardContent } from '@/components/ui/card';

export function LocalesStatsVendedorasResumen({
  resumenVendedoras,
  metricaComparar,
  onVendedoraClick,
}: {
  resumenVendedoras: any[]; // RendimientoVendedoraResumen[]
  metricaComparar: 'monto' | 'cantidad';
  onVendedoraClick?: (nombre: string) => void;
}) {
  const ordenados = ordenarResumenPorCumplimiento(resumenVendedoras, metricaComparar);

  return (
    <div className="grid md:grid-cols-2 gap-4 mt-10">
      {ordenados.map((v, idx) => {
        const badge = formatResumenCumplimiento(v, metricaComparar);

        return (
          <Card
            key={v.vendedoraNombre}
            className="bg-white/10 border-white/10 rounded-2xl p-0 cursor-pointer transition hover:scale-[1.01]"
            onClick={() => onVendedoraClick?.(v.vendedoraNombre)}
          >
            <CardContent className="flex items-center gap-4 py-3">
              <span className="text-xl font-bold text-white/80 w-8">{idx + 1}</span>
              <div>
                <div className="text-white font-semibold">{v.vendedoraNombre}</div>
                <div className="text-xs text-white/60">{badge.texto} {badge.emoji}</div>
              </div>
              <div className="ml-auto">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: badge.color + '22',
                    color: badge.color,
                    border: `1px solid ${badge.color}88`,
                  }}
                >
                  {badge.emoji}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
