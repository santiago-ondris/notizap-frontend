import React from 'react';
import { ArrowLeft, Download, FileBarChart, Info, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { InsightCard } from '@/components/EvolucionStock/InsightCard';
import { obtenerVisualSeccion } from '@/components/EvolucionStock/insightVisuals';
import { useResumenEjecutivo } from '@/hooks/evolucionStock/useResumen';
import { exportResumenEjecutivo } from '@/utils/evolucionStock/exportHelpers';
import type { ResumenEjecutivoFiltros, SeccionResumen } from '@/types/evolucionStock/resumenTypes';

export const ResumenPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = React.useState<ResumenEjecutivoFiltros>(() => rangoAnioActual());
  const [exportando, setExportando] = React.useState(false);
  const { data, isLoading, isFetching, isError } = useResumenEjecutivo(filtros);
  const seccionesVisibles = React.useMemo(
    () => data?.secciones.filter(seccion => seccion.insights.length > 0 || seccion.requiereRemitos) ?? [],
    [data?.secciones]
  );
  const totalInsights = data?.secciones.reduce((total, seccion) => total + seccion.insights.length, 0) ?? 0;

  const exportar = () => {
    if (!data) return;
    try {
      setExportando(true);
      exportResumenEjecutivo(data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo exportar el resumen');
    } finally {
      setExportando(false);
    }
  };

  const abrirProducto = (codigo: number) => {
    const params = new URLSearchParams();
    if (filtros.desde) params.set('desde', filtros.desde);
    if (filtros.hasta) params.set('hasta', filtros.hasta);
    const query = params.toString();
    navigate(`/evolucion-stock/producto/${codigo}${query ? `?${query}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="border-b border-white/10 pb-6">
          <button
            onClick={() => navigate('/evolucion-stock')}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-3">
              <FileBarChart className="mt-1 h-7 w-7 text-[#B695BF]" />
              <div>
                <h1 className="text-3xl font-bold text-white">Resumen ejecutivo</h1>
                <p className="mt-2 text-sm text-white/50">
                  Conclusiones del período basadas en compras, ventas y remitos internos.
                </p>
              </div>
            </div>
            <button
              onClick={exportar}
              disabled={!data || exportando || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#8A9624]/45 bg-[#51590E]/20 px-4 py-2 text-sm font-medium text-[#DDE8A2] hover:bg-[#51590E]/30 disabled:opacity-45"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Excel
            </button>
          </div>
        </header>

        <section className="border-b border-white/10 pb-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <PresetButton label="Ultimo mes" onClick={() => setFiltros(rangoUltimosDias(30))} />
            <PresetButton label="Ultimo trimestre" onClick={() => setFiltros(rangoUltimosDias(90))} />
            <PresetButton label="Año actual" onClick={() => setFiltros(rangoAnioActual())} />
            <button
              onClick={() => setFiltros({})}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Todo el historial
            </button>
          </div>
          <div className="grid max-w-xl gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase text-white/45">Desde</span>
              <input
                type="date"
                value={filtros.desde ?? ''}
                onChange={event => setFiltros(prev => ({ ...prev, desde: event.target.value || undefined }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase text-white/45">Hasta</span>
              <input
                type="date"
                value={filtros.hasta ?? ''}
                onChange={event => setFiltros(prev => ({ ...prev, hasta: event.target.value || undefined }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
          </div>
        </section>

        {isLoading && (
          <div className="flex min-h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white/45" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-[#D94854]/35 bg-[#D94854]/10 p-5 text-sm text-[#FFADB5]">
            No se pudo generar el resumen para este período.
          </div>
        )}

        {data && !isLoading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex gap-8">
                <Metric label="Conclusiones" value={totalInsights} />
                <Metric label="Secciones activas" value={data.secciones.filter(s => s.insights.length > 0).length} />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/35">
                {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Generado {formatearFechaHora(data.generadoEn)}
              </div>
            </div>

            {seccionesVisibles.map(seccion => (
              <SeccionInforme
                key={seccion.codigo}
                seccion={seccion}
                onOpenProducto={abrirProducto}
              />
            ))}

            {seccionesVisibles.length === 0 && (
              <div className="py-16 text-center text-sm text-white/45">
                No hay conclusiones con volumen suficiente para este período.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SeccionInforme = ({
  seccion,
  onOpenProducto
}: {
  seccion: SeccionResumen;
  onOpenProducto: (codigo: number) => void;
}) => {
  const visual = obtenerVisualSeccion(seccion.codigo);
  const Icono = visual.icono;

  return (
    <section className="space-y-3 border-b border-white/10 pb-7 last:border-0">
      <div className="flex items-center gap-2">
        <Icono className="h-5 w-5" style={{ color: visual.color }} />
        <h2 className="text-lg font-semibold text-white">{seccion.titulo}</h2>
        {seccion.insights.length > 0 && (
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40">{seccion.insights.length}</span>
        )}
      </div>

      {seccion.insights.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {seccion.insights.map((insight, index) => (
            <InsightCard
              key={`${insight.codigoProducto ?? 'general'}-${index}`}
              insight={insight}
              seccionCodigo={seccion.codigo}
              onOpenProducto={insight.codigoProducto != null
                ? () => onOpenProducto(insight.codigoProducto!)
                : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-4 text-sm text-white/55">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD166]" />
          <span>{seccion.mensaje ?? 'Datos insuficientes para elaborar conclusiones.'}</span>
        </div>
      )}
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-2xl font-semibold text-white">{value}</div>
    <div className="text-xs uppercase text-white/40">{label}</div>
  </div>
);

const PresetButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10">
    {label}
  </button>
);

const toIsoDate = (fecha: Date) => fecha.toISOString().slice(0, 10);
const rangoUltimosDias = (dias: number) => {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(hasta.getDate() - dias);
  return { desde: toIsoDate(desde), hasta: toIsoDate(hasta) };
};
const rangoAnioActual = () => {
  const hoy = new Date();
  return {
    desde: toIsoDate(new Date(hoy.getFullYear(), 0, 1)),
    hasta: toIsoDate(hoy)
  };
};
const formatearFechaHora = (valor: string) => new Date(valor).toLocaleString('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short'
});

export default ResumenPage;
