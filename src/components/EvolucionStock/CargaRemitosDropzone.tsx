import React from 'react';
import { AxiosError } from 'axios';
import { Loader2, MapPinned, RefreshCw, Truck, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { DiagnosticoRemitos } from './DiagnosticoRemitos';
import { DropzoneExcel } from './DropzoneExcel';
import { HistorialRemitos } from './HistorialRemitos';
import { MapeoDepositosModal } from './MapeoDepositosModal';
import { useCargarRemitosMutation, useValidarRemitosMutation } from '@/hooks/evolucionStock/useRemitos';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';
import type { ResultadoCargaRemitos, ValidacionRemitos } from '@/types/evolucionStock/remitosTypes';

interface Props {
  onSuccess: (resultado: ResultadoCargaRemitos) => void;
}

export const CargaRemitosDropzone: React.FC<Props> = ({ onSuccess }) => {
  const [archivo, setArchivo] = React.useState<File | null>(null);
  const [diagnostico, setDiagnostico] = React.useState<ValidacionRemitos | null>(null);
  const [confirmarReemplazo, setConfirmarReemplazo] = React.useState(false);
  const [depositoAMapear, setDepositoAMapear] = React.useState<string | null>(null);
  const secuenciaValidacion = React.useRef(0);
  const validarMutation = useValidarRemitosMutation();
  const cargarMutation = useCargarRemitosMutation();

  const validar = React.useCallback(async (file: File) => {
    const secuencia = ++secuenciaValidacion.current;
    try {
      const resultado = await validarMutation.mutateAsync(file);
      if (secuencia === secuenciaValidacion.current) {
        setDiagnostico(resultado);
        setConfirmarReemplazo(false);
      }
    } catch (error) {
      const data = (error as AxiosError<ValidacionRemitos>).response?.data;
      if (secuencia === secuenciaValidacion.current) setDiagnostico(null);
      toast.error(data?.message ?? 'No se pudo validar el archivo de remitos');
    }
  }, [validarMutation]);

  const cambiarArchivo = (file: File | null) => {
    setArchivo(file);
    setDiagnostico(null);
    setConfirmarReemplazo(false);
    secuenciaValidacion.current++;

    if (!file) return;
    const error = evolucionStockService.validarArchivo(file);
    if (error) {
      toast.error(error);
      setArchivo(null);
      return;
    }

    void validar(file);
  };

  const cargar = async () => {
    if (!archivo || !diagnostico) return;

    try {
      const resultado = await cargarMutation.mutateAsync({
        archivo,
        sobreescribir: diagnostico.remitosYaCargados.length > 0
      });
      toast.success('Remitos internos cargados');
      setArchivo(null);
      setDiagnostico(null);
      setConfirmarReemplazo(false);
      onSuccess(resultado);
    } catch (error) {
      const data = (error as AxiosError<ResultadoCargaRemitos>).response?.data;
      if (data?.requiereConfirmacion) {
        setDiagnostico(data);
        setConfirmarReemplazo(false);
        return;
      }
      toast.error(data?.message ?? 'No se pudieron cargar los remitos');
    }
  };

  const revalidar = async () => {
    if (archivo) await validar(archivo);
  };

  const tieneReemplazos = Boolean(diagnostico?.remitosYaCargados.length);
  const procesando = validarMutation.isPending || cargarMutation.isPending;
  const puedeCargar = Boolean(archivo && diagnostico?.success) &&
    !procesando &&
    (!tieneReemplazos || confirmarReemplazo);

  return (
    <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#F23D5E]/15 p-2.5"><Truck className="h-5 w-5 text-[#FCA5B5]" /></div>
          <div>
            <h2 className="text-lg font-semibold text-white">Remitos internos</h2>
            <p className="text-sm text-white/45">Transferencias entre depósitos y sucursales</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDepositoAMapear('')}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10"
        >
          <MapPinned className="h-4 w-4" /> Mapear depósitos
        </button>
      </div>

      <div className="grid gap-6 py-5 lg:grid-cols-[minmax(280px,0.8fr)_1.2fr]">
        <div className="space-y-4">
          <DropzoneExcel archivo={archivo} onArchivoChange={cambiarArchivo} disabled={procesando} />

          {validarMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-white/55"><Loader2 className="h-4 w-4 animate-spin" /> Validando archivo</div>
          )}

          {diagnostico && (
            <>
              {tieneReemplazos && (
                <label className="flex cursor-pointer items-start gap-3 border-l-2 border-[#FFD700] bg-[#FFD700]/5 px-4 py-3 text-sm text-white/75">
                  <input
                    type="checkbox"
                    checked={confirmarReemplazo}
                    onChange={event => setConfirmarReemplazo(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10"
                  />
                  <span>Reemplazar {diagnostico.remitosYaCargados.length} remitos ya cargados</span>
                </label>
              )}

              <button
                type="button"
                onClick={cargar}
                disabled={!puedeCargar}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#51590E]/50 bg-[#51590E]/25 px-5 py-3 font-medium text-[#DCE6B8] hover:bg-[#51590E]/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cargarMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {tieneReemplazos ? 'Reemplazar y cargar' : 'Confirmar carga'}
              </button>
            </>
          )}

          {archivo && diagnostico && (
            <button
              type="button"
              onClick={revalidar}
              disabled={procesando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-white/45 hover:bg-white/5 hover:text-white/70 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> Volver a validar
            </button>
          )}
        </div>

        <div className="min-w-0 border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {diagnostico ? (
            <DiagnosticoRemitos diagnostico={diagnostico} onMapearDeposito={setDepositoAMapear} />
          ) : (
            <div className="flex min-h-48 items-center justify-center text-center text-sm text-white/35">
              {validarMutation.isPending ? 'Analizando remitos…' : 'Seleccioná un archivo para ver el diagnóstico.'}
            </div>
          )}
        </div>
      </div>

      <HistorialRemitos onDeleted={revalidar} />

      <MapeoDepositosModal
        isOpen={depositoAMapear !== null}
        depositoInicial={depositoAMapear}
        onClose={() => setDepositoAMapear(null)}
        onMapped={revalidar}
      />
    </section>
  );
};
