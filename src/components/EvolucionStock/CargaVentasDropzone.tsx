import React from 'react';
import { Loader2, Upload } from 'lucide-react';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { DropzoneExcel } from './DropzoneExcel';
import { ConfirmacionReemplazo } from './ConfirmacionReemplazo';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';
import { useCargarVentasMutation } from '@/hooks/evolucionStock/useCargaArchivos';
import type { ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';

interface Props {
  onSuccess: (resultado: ResultadoCargaStock) => void;
}

export const CargaVentasDropzone: React.FC<Props> = ({ onSuccess }) => {
  const [archivo, setArchivo] = React.useState<File | null>(null);
  const [conflicto, setConflicto] = React.useState<ResultadoCargaStock | null>(null);
  const [sobreescribir, setSobreescribir] = React.useState(false);
  const cargarVentas = useCargarVentasMutation();

  const subir = async () => {
    if (!archivo) return;

    const error = evolucionStockService.validarArchivo(archivo);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const resultado = await cargarVentas.mutateAsync({ archivo, sobreescribir });
      toast.success('Ventas cargadas');
      setArchivo(null);
      setConflicto(null);
      setSobreescribir(false);
      onSuccess(resultado);
    } catch (error) {
      const data = (error as AxiosError<ResultadoCargaStock>).response?.data;
      if (data?.requiereConfirmacion) {
        setConflicto(data);
        return;
      }

      toast.error(data?.message ?? 'Error al cargar ventas');
    }
  };

  const puedeSubir = Boolean(archivo) &&
    !cargarVentas.isPending &&
    (!conflicto?.diasEnConflicto?.length || sobreescribir);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white">Subir ventas</h2>
        <p className="text-sm text-white/50">El rango de dias se toma desde la columna FECHA.</p>
      </div>

      <DropzoneExcel archivo={archivo} onArchivoChange={(file) => {
        setArchivo(file);
        setConflicto(null);
        setSobreescribir(false);
      }} disabled={cargarVentas.isPending} />

      <ConfirmacionReemplazo
        conflicto={conflicto}
        confirmarSobreescritura={sobreescribir}
        confirmarFacturas={false}
        onSobreescrituraChange={setSobreescribir}
        onFacturasChange={() => undefined}
      />

      <button
        onClick={subir}
        disabled={!puedeSubir}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#B695BF]/40 bg-[#B695BF]/20 px-5 py-3 font-medium text-[#E9D7EF] hover:bg-[#B695BF]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cargarVentas.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Cargar ventas
      </button>
    </div>
  );
};
