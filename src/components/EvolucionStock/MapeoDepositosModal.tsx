import React from 'react';
import { CheckCircle2, Loader2, MapPin, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useActualizarDepositoMutation, useDepositosRemitosQuery } from '@/hooks/evolucionStock/useRemitos';
import type { DepositoMapeoRemitos } from '@/types/evolucionStock/remitosTypes';

const SUCURSALES = [
  'Dean Funes',
  'General Paz',
  'Nueva Córdoba',
  'Peatonal',
  'Jardín',
  'E-commerce',
  'Depósito',
  'Fallas'
];

interface Props {
  isOpen: boolean;
  depositoInicial?: string | null;
  onClose: () => void;
  onMapped: () => void | Promise<void>;
}

export const MapeoDepositosModal: React.FC<Props> = ({
  isOpen,
  depositoInicial,
  onClose,
  onMapped
}) => {
  const depositosQuery = useDepositosRemitosQuery(isOpen);
  const actualizar = useActualizarDepositoMutation();
  const [depositoSeleccionado, setDepositoSeleccionado] = React.useState('');
  const [sucursal, setSucursal] = React.useState('');

  const depositos = React.useMemo(() => {
    const existentes = depositosQuery.data ?? [];
    if (!depositoInicial || existentes.some(d => d.nombreDepositoOriginal === depositoInicial))
      return existentes;

    return [{
      nombreDeposito: depositoInicial,
      nombreDepositoOriginal: depositoInicial,
      estaMapeado: false,
      cantidadLineasAfectadas: 0
    } satisfies DepositoMapeoRemitos, ...existentes];
  }, [depositoInicial, depositosQuery.data]);

  React.useEffect(() => {
    if (!isOpen) return;

    const inicial = depositos.find(d => d.nombreDepositoOriginal === depositoInicial)
      ?? depositos.find(d => !d.estaMapeado)
      ?? depositos[0];

    setDepositoSeleccionado(inicial?.nombreDepositoOriginal ?? depositoInicial ?? '');
    setSucursal(inicial?.sucursal ?? '');
  }, [depositoInicial, depositos, isOpen]);

  const seleccionar = (deposito: DepositoMapeoRemitos) => {
    setDepositoSeleccionado(deposito.nombreDepositoOriginal);
    setSucursal(deposito.sucursal ?? '');
  };

  const guardar = async () => {
    if (!depositoSeleccionado || !sucursal) return;

    try {
      const resultado = await actualizar.mutateAsync({
        nombreDeposito: depositoSeleccionado,
        sucursal
      });
      toast.success(resultado.message);
      await onMapped();
      onClose();
    } catch {
      toast.error('No se pudo guardar el mapeo del depósito');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A20] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Mapeo de depósitos</h2>
            <p className="text-sm text-white/50">Depósitos ERP y sucursales de stock</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" title="Cerrar">
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(260px,0.85fr)_1.15fr]">
          <div className="min-h-0 overflow-y-auto border-b border-white/10 md:border-b-0 md:border-r">
            {depositosQuery.isLoading && (
              <div className="flex items-center gap-2 p-5 text-sm text-white/60">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando depósitos
              </div>
            )}
            {depositos.map(deposito => {
              const activo = deposito.nombreDepositoOriginal === depositoSeleccionado;
              return (
                <button
                  type="button"
                  key={deposito.nombreDeposito}
                  onClick={() => seleccionar(deposito)}
                  className={`flex w-full items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-left transition-colors ${activo ? 'bg-[#B695BF]/15' : 'hover:bg-white/5'}`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{deposito.nombreDepositoOriginal}</div>
                    <div className="text-xs text-white/45">
                      {deposito.estaMapeado ? deposito.sucursal : 'Sin mapear'} · {deposito.cantidadLineasAfectadas} líneas
                    </div>
                  </div>
                  {deposito.estaMapeado
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#7F9A45]" />
                    : <MapPin className="h-4 w-4 shrink-0 text-[#FFD700]" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-5 p-5 md:p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Depósito ERP</label>
              <input
                value={depositoSeleccionado}
                onChange={event => setDepositoSeleccionado(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-[#B695BF]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Sucursal</label>
              <select
                value={sucursal}
                onChange={event => setSucursal(event.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#24242C] px-3 py-2.5 text-white outline-none focus:border-[#B695BF]"
              >
                <option value="">Seleccionar sucursal</option>
                {SUCURSALES.map(nombre => <option key={nombre} value={nombre}>{nombre}</option>)}
              </select>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={guardar}
                disabled={!depositoSeleccionado || !sucursal || actualizar.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-[#51590E]/50 bg-[#51590E]/25 px-5 py-2.5 font-medium text-[#DCE6B8] hover:bg-[#51590E]/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actualizar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar mapeo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
