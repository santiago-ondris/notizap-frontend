import React from 'react';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalendarioCompras } from '@/components/EvolucionStock/CalendarioCompras';
import { CalendarioVentas } from '@/components/EvolucionStock/CalendarioVentas';
import { CargaComprasModal } from '@/components/EvolucionStock/CargaComprasModal';
import { CargaVentasDropzone } from '@/components/EvolucionStock/CargaVentasDropzone';
import { ResumenCarga } from '@/components/EvolucionStock/ResumenCarga';
import type { DiaCalendarioUi, ResultadoCargaStock } from '@/types/evolucionStock/evolucionStockTypes';

export const CargaArchivosPage: React.FC = () => {
  const navigate = useNavigate();
  const [mesActual, setMesActual] = React.useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [diaSeleccionado, setDiaSeleccionado] = React.useState<DiaCalendarioUi | null>(null);
  const [resultado, setResultado] = React.useState<ResultadoCargaStock | null>(null);

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <div>
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <FileSpreadsheet className="w-4 h-4 text-[#F23D5E]" />
                  Evolucion de stock
                </div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">Carga de archivos</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CalendarioCompras
                mesActual={mesActual}
                onMesChange={setMesActual}
                onDiaClick={setDiaSeleccionado}
              />
              <CalendarioVentas
                mesActual={mesActual}
                onMesChange={setMesActual}
              />
            </div>

            <ResumenCarga resultado={resultado} />
          </div>

          <CargaVentasDropzone onSuccess={setResultado} />
        </div>

        <CargaComprasModal
          dia={diaSeleccionado}
          isOpen={Boolean(diaSeleccionado)}
          onClose={() => setDiaSeleccionado(null)}
          onSuccess={setResultado}
        />
      </div>
    </div>
  );
};

export default CargaArchivosPage;
