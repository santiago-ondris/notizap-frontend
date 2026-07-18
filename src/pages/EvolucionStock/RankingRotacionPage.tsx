import React from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Download, Eye, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Paginacion from '@/components/ui/Paginacion';
import { useRankingRotacionStock } from '@/hooks/evolucionStock/useCargaArchivos';
import { exportRankingRotacion } from '@/utils/evolucionStock/exportHelpers';
import type { RankingRotacion, RankingRotacionFiltros } from '@/types/evolucionStock/evolucionStockTypes';

const initialFiltros: RankingRotacionFiltros = {
  orderBy: 'porcentajeVendido',
  orderDesc: true,
  page: 1,
  pageSize: 25
};

export const RankingRotacionPage: React.FC = () => {
  const navigate = useNavigate();
  const [filtros, setFiltros] = React.useState<RankingRotacionFiltros>(initialFiltros);
  const [exportando, setExportando] = React.useState(false);
  const { data, isLoading } = useRankingRotacionStock(filtros);
  const candidatosRecompra = React.useMemo(
    () => data?.data.filter(row => !row.tieneNetoNegativo && row.porcentajeVendido >= 70).slice(0, 5) ?? [],
    [data?.data]
  );
  const productosLentos = React.useMemo(
    () => data?.data.filter(row => !row.tieneNetoNegativo && row.porcentajeVendido <= 25 && row.unidadesCompradas > 0).slice(0, 5) ?? [],
    [data?.data]
  );

  const sort = (orderBy: string) => {
    setFiltros(prev => ({
      ...prev,
      orderBy,
      orderDesc: prev.orderBy === orderBy ? !prev.orderDesc : true,
      page: 1
    }));
  };

  const sortIcon = (key: string) => {
    if (filtros.orderBy !== key) return <ArrowUpDown className="h-4 w-4 text-white/35" />;
    return filtros.orderDesc ? <ArrowDown className="h-4 w-4 text-[#B695BF]" /> : <ArrowUp className="h-4 w-4 text-[#B695BF]" />;
  };

  const limpiarFiltros = () => setFiltros(initialFiltros);

  const exportar = async () => {
    try {
      setExportando(true);
      await exportRankingRotacion(filtros);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo exportar el ranking');
    } finally {
      setExportando(false);
    }
  };

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
              <h1 className="text-3xl font-bold text-white">Ranking de rotacion</h1>
              <p className="mt-2 text-sm text-white/55">
                Ventas netas del periodo sobre el total comprado hasta la fecha de cierre.
              </p>
            </div>
            <button
              onClick={exportar}
              disabled={exportando || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#51590E]/40 bg-[#51590E]/20 px-4 py-2 text-sm font-medium text-[#DDE8A2] hover:bg-[#51590E]/30 disabled:opacity-50"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <PresetButton label="Ultimos 30 dias" onClick={() => setFiltros({ ...filtros, ...rangoUltimosDias(30), page: 1 })} />
            <PresetButton label="Mes actual" onClick={() => setFiltros({ ...filtros, ...rangoMesActual(), page: 1 })} />
            <PresetButton label="Mes anterior" onClick={() => setFiltros({ ...filtros, ...rangoMesAnterior(), page: 1 })} />
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
          <input type="date" value={filtros.desde ?? ''} onChange={e => setFiltros({ ...filtros, desde: e.target.value || undefined, page: 1 })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
          <input type="date" value={filtros.hasta ?? ''} onChange={e => setFiltros({ ...filtros, hasta: e.target.value || undefined, page: 1 })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" />
          <input placeholder="Marca" value={filtros.marca ?? ''} onChange={e => setFiltros({ ...filtros, marca: e.target.value || undefined, page: 1 })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/35" />
          <input placeholder="Proveedor" value={filtros.proveedor ?? ''} onChange={e => setFiltros({ ...filtros, proveedor: e.target.value || undefined, page: 1 })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/35" />
          <select value={filtros.pageSize} onChange={e => setFiltros({ ...filtros, pageSize: Number(e.target.value), page: 1 })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
            {[25, 50, 100, 200].map(size => <option key={size} value={size}>{size} filas</option>)}
          </select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <InsightCard title="Candidatos a recompra" rows={candidatosRecompra} empty="No hay candidatos fuertes en esta pagina." />
          <InsightCard title="Productos lentos" rows={productosLentos} empty="No hay productos lentos en esta pagina." />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <Th onClick={() => sort('codigo')} icon={sortIcon('codigo')}>Codigo</Th>
                <Th onClick={() => sort('producto')} icon={sortIcon('producto')}>Producto</Th>
                <Th>Proveedor</Th>
                <Th align="right" onClick={() => sort('comprado')} icon={sortIcon('comprado')}>Comprado acum.</Th>
                <Th align="right" onClick={() => sort('vendido')} icon={sortIcon('vendido')}>Vendido periodo</Th>
                <Th align="right" onClick={() => sort('porcentajeVendido')} icon={sortIcon('porcentajeVendido')}>% periodo</Th>
                <Th align="right" onClick={() => sort('porcentaje7')} icon={sortIcon('porcentaje7')}>7 dias</Th>
                <Th align="right" onClick={() => sort('porcentaje14')} icon={sortIcon('porcentaje14')}>14 dias</Th>
                <Th align="right" onClick={() => sort('porcentaje30')} icon={sortIcon('porcentaje30')}>30 dias</Th>
                <Th align="right">Detalle</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={10} className="py-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-white/50" /></td></tr>
              )}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-white/50">Sin datos</td></tr>
              )}
              {data?.data.map(row => <RankingRow key={row.codigoProducto} row={row} onVerDetalle={() => navigate(`/evolucion-stock/producto/${row.codigoProducto}`)} />)}
            </tbody>
          </table>
        </div>

        {data && (
          <Paginacion
            paginaActual={data.pagina}
            totalPaginas={data.totalPaginas}
            totalElementos={data.totalRegistros}
            elementosPorPagina={data.pageSize}
            onCambioPagina={(page) => setFiltros(prev => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
};

const Th = ({ children, icon, onClick, align = 'left' }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void; align?: 'left' | 'right' }) => (
  <th className={`px-4 py-3 text-${align} text-xs font-medium uppercase tracking-wide text-white/50`}>
    {onClick ? <button onClick={onClick} className="inline-flex items-center gap-2 hover:text-white">{children}{icon}</button> : children}
  </th>
);

const RankingRow = ({ row, onVerDetalle }: { row: RankingRotacion; onVerDetalle: () => void }) => (
  <tr className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${row.tieneNetoNegativo ? 'bg-[#FFD700]/5' : ''}`}>
    <td className="px-4 py-3 text-sm font-medium text-white">{row.codigoProducto}</td>
    <td className="px-4 py-3 text-sm text-white/75">
      <div>{row.nombreProducto}</div>
      {row.tieneNetoNegativo && <div className="text-xs text-[#FFD700]">No comparable: stock previo probable</div>}
    </td>
    <td className="px-4 py-3 text-sm text-white/60">{row.proveedor ?? '-'}</td>
    <td className="px-4 py-3 text-right text-sm text-white/75">{row.unidadesCompradas}</td>
    <td className="px-4 py-3 text-right text-sm text-white/75">{row.unidadesVendidas}</td>
    <td className="px-4 py-3 text-right text-sm font-semibold text-[#B695BF]">{row.porcentajeVendido}%</td>
    <td className="px-4 py-3 text-right text-sm text-white/75">{row.porcentajeVendido7Dias}%</td>
    <td className="px-4 py-3 text-right text-sm text-white/75">{row.porcentajeVendido14Dias}%</td>
    <td className="px-4 py-3 text-right text-sm text-white/75">{row.porcentajeVendido30Dias}%</td>
    <td className="px-4 py-3 text-right">
      <button
        onClick={onVerDetalle}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10"
      >
        <Eye className="h-3.5 w-3.5" />
        Ver
      </button>
    </td>
  </tr>
);

const InsightCard = ({ title, rows, empty }: { title: string; rows: RankingRotacion[]; empty: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
    {rows.length === 0 ? (
      <p className="text-sm text-white/45">{empty}</p>
    ) : (
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.codigoProducto} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">{row.codigoProducto} - {row.nombreProducto}</div>
              <div className="text-xs text-white/45">{row.proveedor ?? 'Sin proveedor'}</div>
            </div>
            <div className="shrink-0 text-sm font-semibold text-[#B695BF]">{row.porcentajeVendido}%</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const PresetButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10">
    {label}
  </button>
);

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
const rangoUltimosDias = (dias: number) => {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(hasta.getDate() - dias);
  return { desde: toIsoDate(desde), hasta: toIsoDate(hasta) };
};
const rangoMesActual = () => {
  const hoy = new Date();
  return { desde: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)) };
};
const rangoMesAnterior = () => {
  const hoy = new Date();
  return { desde: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)), hasta: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth(), 0)) };
};

export default RankingRotacionPage;
