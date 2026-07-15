import React from 'react';
import { FileClock, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCargasRemitosQuery, useEliminarCargaRemitosMutation } from '@/hooks/evolucionStock/useRemitos';

const fecha = (valor?: string | null) => valor
  ? new Date(valor).toLocaleDateString('es-AR', { timeZone: 'UTC' })
  : '—';

interface Props {
  onDeleted?: () => void | Promise<void>;
}

export const HistorialRemitos: React.FC<Props> = ({ onDeleted }) => {
  const cargasQuery = useCargasRemitosQuery();
  const eliminar = useEliminarCargaRemitosMutation();
  const [confirmandoId, setConfirmandoId] = React.useState<number | null>(null);

  const eliminarCarga = async (id: number) => {
    try {
      const resultado = await eliminar.mutateAsync(id);
      toast.success(resultado.message);
      setConfirmandoId(null);
      await onDeleted?.();
    } catch {
      toast.error('No se pudo eliminar la carga');
    }
  };

  return (
    <div className="border-t border-white/10 pt-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
        <FileClock className="h-4 w-4" /> Historial de remitos
      </div>

      {cargasQuery.isLoading && (
        <div className="flex items-center gap-2 py-3 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" /> Cargando historial</div>
      )}

      {!cargasQuery.isLoading && !cargasQuery.data?.length && (
        <div className="py-3 text-sm text-white/40">Todavía no hay cargas de remitos.</div>
      )}

      <div className="divide-y divide-white/10">
        {cargasQuery.data?.map(carga => (
          <div key={carga.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white/80">{carga.nombreArchivoOriginal}</div>
              <div className="mt-1 text-xs text-white/40">
                {fecha(carga.fechaDesde)} – {fecha(carga.fechaHasta)} · {carga.remitosDistintos} remitos · {carga.cantidadLineas} líneas
              </div>
            </div>

            {confirmandoId === carga.id ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmandoId(null)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => eliminarCarga(carga.id)}
                  disabled={eliminar.isPending}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#F23D5E]/40 bg-[#F23D5E]/10 px-3 py-1.5 text-xs text-[#FCA5B5] hover:bg-[#F23D5E]/20 disabled:opacity-50"
                >
                  {eliminar.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Eliminar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmandoId(carga.id)}
                className="shrink-0 rounded-lg p-2 text-white/35 hover:bg-[#F23D5E]/10 hover:text-[#FCA5B5]"
                title="Eliminar carga"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
