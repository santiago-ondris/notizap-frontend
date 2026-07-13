import React from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import { DropzoneExcel } from './DropzoneExcel';
import { ConfirmacionReemplazo } from './ConfirmacionReemplazo';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';
import { useCargarComprasMutation, useMarcarSinComprasMutation } from '@/hooks/evolucionStock/useCargaArchivos';
import type { DiaCalendarioUi, ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  dia: DiaCalendarioUi | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (resultado: ResultadoCargaStock) => void;
}

export const CargaComprasModal: React.FC<Props> = ({ dia, isOpen, onClose, onSuccess }) => {
  const [archivo, setArchivo] = React.useState<File | null>(null);
  const [conflicto, setConflicto] = React.useState<ResultadoCargaStock | null>(null);
  const [sobreescribir, setSobreescribir] = React.useState(false);
  const [ignorarFacturas, setIgnorarFacturas] = React.useState(false);
  const cargarCompras = useCargarComprasMutation();
  const marcarSinCompras = useMarcarSinComprasMutation();

  React.useEffect(() => {
    if (!isOpen) {
      setArchivo(null);
      setConflicto(null);
      setSobreescribir(false);
      setIgnorarFacturas(false);
    }
  }, [isOpen]);

  if (!isOpen || !dia) return null;

  const fecha = dia.fecha.slice(0, 10);

  const subir = async () => {
    if (!archivo) return;

    const error = evolucionStockService.validarArchivo(archivo);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const resultado = await cargarCompras.mutateAsync({
        archivo,
        fecha,
        sobreescribir,
        ignorarFacturasDuplicadas: ignorarFacturas
      });
      toast.success('Compras cargadas');
      onSuccess(resultado);
      onClose();
    } catch (error) {
      const data = (error as AxiosError<ResultadoCargaStock>).response?.data;
      if (data?.requiereConfirmacion) {
        setConflicto(data);
        return;
      }

      toast.error(data?.message ?? 'Error al cargar compras');
    }
  };

  const marcarSinMovimiento = async () => {
    try {
      await marcarSinCompras.mutateAsync({ fecha });
      toast.success('Dia marcado sin compras');
      onClose();
    } catch {
      toast.error('No se pudo marcar el dia');
    }
  };

  const puedeSubir = Boolean(archivo) &&
    !cargarCompras.isPending &&
    (!conflicto?.requiereConfirmacion ||
      ((!conflicto.diasEnConflicto?.length || sobreescribir) &&
       (!conflicto.facturasDuplicadas?.length || ignorarFacturas)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#1A1A20] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-semibold text-white">Carga de compras</h2>
            <p className="text-sm text-white/50">{new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR')}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <DropzoneExcel archivo={archivo} onArchivoChange={setArchivo} disabled={cargarCompras.isPending} />

          <ConfirmacionReemplazo
            conflicto={conflicto}
            confirmarSobreescritura={sobreescribir}
            confirmarFacturas={ignorarFacturas}
            onSobreescrituraChange={setSobreescribir}
            onFacturasChange={setIgnorarFacturas}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={marcarSinMovimiento}
              disabled={marcarSinCompras.isPending || cargarCompras.isPending}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 disabled:opacity-50"
            >
              Sin compras este dia
            </button>

            <button
              onClick={subir}
              disabled={!puedeSubir}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#F23D5E]/40 bg-[#F23D5E]/20 px-5 py-2.5 font-medium text-[#FCA5B5] hover:bg-[#F23D5E]/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargarCompras.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Cargar compras
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
