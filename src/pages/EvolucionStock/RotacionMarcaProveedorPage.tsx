import React from 'react';
import { ArrowLeft, Download, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TablaSimple } from '@/components/EvolucionStock/TablaSimple';
import { useRotacionMarcasStock, useRotacionProveedoresStock } from '@/hooks/evolucionStock/useCargaArchivos';
import { exportRotacionAgregada } from '@/utils/evolucionStock/exportHelpers';
import type { RotacionAgregado, RotacionAgregadoFiltros } from '@/types/evolucionStock/evolucionStockTypes';

export const RotacionMarcaProveedorPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = React.useState<RotacionAgregadoFiltros>({});
  const [exportando, setExportando] = React.useState(false);
  const marcas = useRotacionMarcasStock(filtros);
  const proveedores = useRotacionProveedoresStock(filtros);

  const columns = [
    { key: 'nombre', header: 'Nombre', render: (row: RotacionAgregado) => row.nombre },
    { key: 'comprado', header: 'Comprado', align: 'right' as const, render: (row: RotacionAgregado) => row.unidadesCompradas },
    { key: 'vendido', header: 'Vendido', align: 'right' as const, render: (row: RotacionAgregado) => row.unidadesVendidas },
    { key: 'pct', header: '% rotacion', align: 'right' as const, render: (row: RotacionAgregado) => `${row.porcentajeRotacion}%` }
  ];

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <button
            onClick={() => navigate('/evolucion-stock')}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Rotacion por marca y proveedor</h1>
              <p className="mt-2 text-sm text-white/55">Unidades compradas, vendidas y porcentaje de rotacion en el periodo.</p>
            </div>
            <button
              onClick={() => {
                setExportando(true);
                exportRotacionAgregada(marcas.data ?? [], proveedores.data ?? []);
                setExportando(false);
              }}
              disabled={exportando || marcas.isLoading || proveedores.isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#51590E]/40 bg-[#51590E]/20 px-4 py-2 text-sm font-medium text-[#DDE8A2] hover:bg-[#51590E]/30 disabled:opacity-50"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <button
            onClick={() => setFiltros({})}
            className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </button>
          <div className="grid gap-3 md:grid-cols-2">
            <input type="date" value={filtros.desde ?? ''} onChange={e => setFiltros({ ...filtros, desde: e.target.value || undefined })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
            <input type="date" value={filtros.hasta ?? ''} onChange={e => setFiltros({ ...filtros, hasta: e.target.value || undefined })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Marcas</h2>
            {marcas.isLoading ? <Loading /> : <TablaSimple<RotacionAgregado> data={marcas.data ?? []} columns={columns} />}
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Proveedores</h2>
            {proveedores.isLoading ? <Loading /> : <TablaSimple<RotacionAgregado> data={proveedores.data ?? []} columns={columns} />}
          </section>
        </div>
      </div>
    </div>
  );
};

const Loading = () => <div className="rounded-2xl border border-white/10 bg-white/5 p-12"><Loader2 className="mx-auto h-7 w-7 animate-spin text-white/50" /></div>;

export default RotacionMarcaProveedorPage;
