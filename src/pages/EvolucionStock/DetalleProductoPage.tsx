import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { ArrowLeft, CircleHelp, Download, Loader2 } from 'lucide-react';
import { evolucionStockKeys, useDetalleProductoStock } from '@/hooks/evolucionStock/useCargaArchivos';
import { evolucionStockService } from '@/services/evolucionStock/evolucionStockService';
import { ProductoSearch } from '@/components/EvolucionStock/ProductoSearch';
import { GraficoEvolucion, type SerieEvolucion } from '@/components/EvolucionStock/charts/GraficoEvolucion';
import { CurvaTalles } from '@/components/EvolucionStock/charts/CurvaTalles';
import { AvisoNetoNegativo } from '@/components/EvolucionStock/AvisoNetoNegativo';
import { TablaSimple } from '@/components/EvolucionStock/TablaSimple';
import { exportDetalleProducto, porcentaje } from '@/utils/evolucionStock/exportHelpers';
import type { DesgloseColor, DesgloseSucursal, ProductoDetalleFiltros } from '@/types/evolucionStock/evolucionStockTypes';

const COLORES_SUCURSALES = ['#B695BF', '#F23D5E', '#51590E', '#FFD700', '#38BDF8', '#F97316', '#A3E635', '#F472B6'];

export const DetalleProductoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { codigo } = useParams();
  const codigoProducto = Number(codigo);
  const [filtros, setFiltros] = React.useState<ProductoDetalleFiltros>(() => ({
    desde: searchParams.get('desde') ?? undefined,
    hasta: searchParams.get('hasta') ?? undefined
  }));
  const [mostrarTotal, setMostrarTotal] = React.useState(true);
  const [exportando, setExportando] = React.useState(false);
  const [sucursalesSeleccionadas, setSucursalesSeleccionadas] = React.useState<string[]>([]);
  const [rangoInicialAplicado, setRangoInicialAplicado] = React.useState(false);
  const [desdeInput, setDesdeInput] = React.useState('');
  const [hastaInput, setHastaInput] = React.useState('');
  const filtrosBase = React.useMemo(() => ({
    desde: filtros.desde,
    hasta: filtros.hasta
  }), [filtros.desde, filtros.hasta]);
  const { data: dataSinFiltroColor } = useDetalleProductoStock(codigoProducto, filtrosBase, Number.isFinite(codigoProducto));
  const { data, isLoading, isError } = useDetalleProductoStock(codigoProducto, filtros, Number.isFinite(codigoProducto));
  const sucursales = React.useMemo(
    () => data?.desglosePorSucursal.map(sucursal => sucursal.sucursal).filter(Boolean) ?? [],
    [data?.desglosePorSucursal]
  );
  const colores = React.useMemo(
    () => dataSinFiltroColor?.desglosePorColor ?? data?.desglosePorColor ?? [],
    [dataSinFiltroColor?.desglosePorColor, data?.desglosePorColor]
  );
  const tieneDatosRemitos = React.useMemo(
    () => data?.desglosePorSucursal.some(sucursal => sucursal.recibido != null) ?? false,
    [data?.desglosePorSucursal]
  );

  React.useEffect(() => {
    if (rangoInicialAplicado || !data?.serieTemporal.length) return;

    const fechas = data.serieTemporal.map(evento => evento.fecha.slice(0, 10)).sort();
    setFiltros(prev => ({
      ...prev,
      desde: prev.desde ?? fechas[0],
      hasta: prev.hasta ?? fechas[fechas.length - 1]
    }));
    setRangoInicialAplicado(true);
  }, [data?.serieTemporal, rangoInicialAplicado]);

  React.useEffect(() => {
    setDesdeInput(formatearFechaInput(filtros.desde));
    setHastaInput(formatearFechaInput(filtros.hasta));
  }, [filtros.desde, filtros.hasta]);

  React.useEffect(() => {
    if (!sucursales.length) {
      setSucursalesSeleccionadas([]);
      return;
    }

    setSucursalesSeleccionadas(prev => {
      if (!prev.length) return sucursales;
      return prev.filter(sucursal => sucursales.includes(sucursal));
    });
  }, [sucursales]);

  const sucursalQueries = useQueries({
    queries: sucursalesSeleccionadas.map(sucursal => {
      const filtrosSucursal = { ...filtros, sucursal };
      return {
        queryKey: evolucionStockKeys.productoDetalle(codigoProducto, filtrosSucursal),
        queryFn: () => evolucionStockService.obtenerDetalleProducto(codigoProducto, filtrosSucursal),
        enabled: Number.isFinite(codigoProducto) && codigoProducto > 0,
        staleTime: 1000 * 60 * 5
      };
    })
  });

  const seriesGrafico = React.useMemo<SerieEvolucion[]>(() => {
    const series: SerieEvolucion[] = [];

    if (mostrarTotal && data) {
      series.push({
        key: 'total',
        nombre: 'Total',
        color: '#FFFFFF',
        eventos: data.serieTemporal
      });
    }

    return series;
  }, [data, mostrarTotal]);

  const seriesVentasPorSucursal = React.useMemo<SerieEvolucion[]>(() => {
    const series: SerieEvolucion[] = [];

    sucursalQueries.forEach((query, index) => {
      if (!query.data) return;

      const sucursal = sucursalesSeleccionadas[index];
      const colorIndex = Math.max(0, sucursales.indexOf(sucursal));
      const eventosVentas = query.data.serieTemporal.filter(evento =>
        evento.netoDelta < 0 || String(evento.tipo).includes('DevolucionCliente') || evento.tipo === 3
      ).map(evento => ({
        ...evento,
        netoDelta: evento.netoDelta < 0 ? evento.cantidad : -evento.cantidad
      }));

      series.push({
        key: keySucursal(sucursal),
        nombre: sucursal,
        color: COLORES_SUCURSALES[colorIndex % COLORES_SUCURSALES.length],
        eventos: eventosVentas,
        usarDeltaAcumulado: true
      });
    });

    return series;
  }, [sucursalQueries, sucursales, sucursalesSeleccionadas]);

  const toggleSucursal = (sucursal: string) => {
    setSucursalesSeleccionadas(prev =>
      prev.includes(sucursal)
        ? prev.filter(item => item !== sucursal)
        : [...prev, sucursal]
    );
  };

  const resumenEjecutivo = React.useMemo(() => {
    if (!data) return null;
    const topSucursal = [...data.desglosePorSucursal].sort((a, b) => b.netoVendido - a.netoVendido)[0];
    const topColor = [...data.desglosePorColor].sort((a, b) => b.vendido - a.vendido)[0];
    const topTalle = [...data.curvaTalles].sort((a, b) => b.vendido - a.vendido)[0];

    return {
      porcentajeVendido: porcentaje(data.vendido, data.comprado),
      topSucursal,
      topColor,
      topTalle
    };
  }, [data]);

  const exportarDetalle = async () => {
    if (!data) return;
    setExportando(true);
    try {
      exportDetalleProducto(data, { desde: filtros.desde, hasta: filtros.hasta });
    } finally {
      setExportando(false);
    }
  };

  const aplicarFecha = (campo: 'desde' | 'hasta', valor: string) => {
    const fecha = parsearFechaArgentina(valor);
    if (!fecha && valor.trim()) return;
    setFiltros(prev => ({ ...prev, [campo]: fecha }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
    setRangoInicialAplicado(false);
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_420px]">
          <div>
            <button
              onClick={() => navigate('/evolucion-stock')}
              className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="text-sm text-white/50">Detalle de producto</div>
            <h1 className="text-3xl font-bold text-white">{data ? `${data.codigoProducto} - ${data.nombreProducto}` : codigo}</h1>
          </div>
          <div className="space-y-3">
            <ProductoSearch />
            <button
              onClick={exportarDetalle}
              disabled={!data || exportando}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#51590E]/40 bg-[#51590E]/20 px-4 py-2 text-sm font-medium text-[#DDE8A2] hover:bg-[#51590E]/30 disabled:opacity-50"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar analisis
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-sm text-white/60">
            Periodo visible: <span className="font-medium text-white">{formatearFecha(filtros.desde)}</span>
            <span className="px-2 text-white/35">a</span>
            <span className="font-medium text-white">{formatearFecha(filtros.hasta)}</span>
          </div>
          <button
            onClick={limpiarFiltros}
            className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10"
          >
            Limpiar filtros
          </button>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-white/45">Desde</span>
              <input
                value={desdeInput}
                onChange={e => setDesdeInput(e.target.value)}
                onBlur={e => aplicarFecha('desde', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') aplicarFecha('desde', e.currentTarget.value);
                }}
                placeholder="dd/mm/aaaa"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/35"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-white/45">Hasta</span>
              <input
                value={hastaInput}
                onChange={e => setHastaInput(e.target.value)}
                onBlur={e => aplicarFecha('hasta', e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') aplicarFecha('hasta', e.currentTarget.value);
                }}
                placeholder="dd/mm/aaaa"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/35"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-white/45">Color</span>
              <select
                value={filtros.color ?? ''}
                onChange={e => setFiltros({ ...filtros, color: e.target.value || undefined })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                <option value="">Todos los colores</option>
                {colores.map(color => (
                  <option key={color.codigoColor} value={color.codigoColor}>
                    {color.codigoColor} - {color.nombreColor}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-white/50" /></div>}
        {isError && <div className="rounded-2xl border border-[#D94854]/30 bg-[#D94854]/10 p-6 text-[#FCA5A5]">No se pudo cargar el producto.</div>}

        {data && (
          <>
            {data.netoNegativo && <AvisoNetoNegativo />}
            {resumenEjecutivo && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Resumen ejecutivo</h2>
                <div className="grid gap-4 md:grid-cols-4">
                  <ExecutiveMetric label="% vendido" value={`${resumenEjecutivo.porcentajeVendido}%`} />
                  <ExecutiveMetric label="Sucursal principal" value={resumenEjecutivo.topSucursal?.sucursal ?? '-'} detail={resumenEjecutivo.topSucursal ? `${resumenEjecutivo.topSucursal.netoVendido} u.` : undefined} />
                  <ExecutiveMetric label="Color principal" value={resumenEjecutivo.topColor ? `${resumenEjecutivo.topColor.codigoColor}` : '-'} detail={resumenEjecutivo.topColor?.nombreColor} />
                  <ExecutiveMetric label="Talle mas vendido" value={resumenEjecutivo.topTalle?.talle ?? '-'} detail={resumenEjecutivo.topTalle ? `${resumenEjecutivo.topTalle.vendido} u.` : undefined} />
                </div>
              </section>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <Metric label="Comprado" value={data.comprado} />
              <Metric label="Vendido neto" value={data.vendido} />
              <Metric label="Neto" value={data.neto} />
            </div>
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Evolucion neta total</h2>
                  <p className="text-sm text-white/50">
                    {filtros.color ? 'Vista filtrada por color.' : 'Vista de todos los colores.'} Compras nuevas suben la linea; ventas la bajan.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                    <input
                      type="checkbox"
                      checked={mostrarTotal}
                      onChange={event => setMostrarTotal(event.target.checked)}
                    />
                    <span className="h-2 w-2 rounded-full bg-white" />
                    Total
                  </label>
                </div>
              </div>
              <GraficoEvolucion eventos={data.serieTemporal} series={seriesGrafico} />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Ventas acumuladas por sucursal</h2>
                  <p className="text-sm text-white/50">
                    {filtros.color ? 'Filtrado por color seleccionado.' : 'Todos los colores sumados.'} Estas lineas no representan stock.
                  </p>
                </div>
                <div className="flex max-w-3xl flex-wrap gap-2">
                  {sucursales.map((sucursal, index) => (
                    <label key={sucursal} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                      <input
                        type="checkbox"
                        checked={sucursalesSeleccionadas.includes(sucursal)}
                        onChange={() => toggleSucursal(sucursal)}
                      />
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: COLORES_SUCURSALES[index % COLORES_SUCURSALES.length] }}
                      />
                      {sucursal}
                    </label>
                  ))}
                </div>
              </div>
              <GraficoEvolucion eventos={[]} series={seriesVentasPorSucursal} />
            </section>
            {data.curvaTalles.length > 0 && (
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Curva de talles</h2>
                <CurvaTalles data={data.curvaTalles} />
              </section>
            )}
            <div className="grid gap-6 xl:grid-cols-2">
              <TablaSimple<DesgloseColor>
                data={data.desglosePorColor}
                columns={[
                  { key: 'color', header: 'Color', render: row => `${row.codigoColor} - ${row.nombreColor}` },
                  { key: 'comprado', header: 'Comprado', align: 'right', render: row => row.comprado },
                  { key: 'vendido', header: 'Vendido', align: 'right', render: row => row.vendido },
                  { key: 'pct', header: '% vendido', align: 'right', render: row => `${row.porcentajeVendido}%` }
                ]}
              />
              <TablaSimple<DesgloseSucursal>
                data={data.desglosePorSucursal}
                columns={[
                  { key: 'sucursal', header: 'Sucursal', render: row => row.sucursal },
                  ...(tieneDatosRemitos ? [{
                    key: 'recibido',
                    header: (
                      <span className="inline-flex items-center gap-1">
                        Recibido
                        <span title="Surge de remitos internos y puede no cubrir periodos anteriores a la primera carga.">
                          <CircleHelp className="h-3.5 w-3.5 text-white/35" />
                        </span>
                      </span>
                    ),
                    align: 'right' as const,
                    render: (row: DesgloseSucursal) => row.recibido ?? 0
                  }] : []),
                  { key: 'vendido', header: 'Vendido', align: 'right', render: row => row.vendido },
                  { key: 'devoluciones', header: 'Dev.', align: 'right', render: row => row.devolucionesCliente },
                  { key: 'neto', header: 'Neto', align: 'right', render: row => row.netoVendido },
                  ...(tieneDatosRemitos ? [
                    {
                      key: 'enviado',
                      header: 'Enviado',
                      align: 'right' as const,
                      render: (row: DesgloseSucursal) => row.enviadoAOtras ?? 0
                    },
                    {
                      key: 'sellThrough',
                      header: 'Sell-through',
                      align: 'right' as const,
                      render: (row: DesgloseSucursal) => <SellThroughBadge valor={row.sellThrough} />
                    }
                  ] : [])
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const keySucursal = (sucursal: string) => `sucursal_${sucursal.replace(/[^a-zA-Z0-9]/g, '_')}`;

const SellThroughBadge = ({ valor }: { valor?: number | null }) => {
  if (valor == null) return <span className="text-white/30">-</span>;

  const clases = valor >= 70
    ? 'border-[#7A8420]/45 bg-[#51590E]/25 text-[#DDE8A2]'
    : valor >= 40
      ? 'border-[#FFD166]/40 bg-[#FFD166]/10 text-[#FFE3A1]'
      : 'border-[#D94854]/40 bg-[#D94854]/10 text-[#FFADB5]';

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${clases}`}>
      {valor}%
    </span>
  );
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return 'Cargando periodo';
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR');
};

const formatearFechaInput = (fecha?: string) => {
  if (!fecha) return '';
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
};

const parsearFechaArgentina = (valor: string) => {
  const limpio = valor.trim();
  if (!limpio) return undefined;

  const match = limpio.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return undefined;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div className="text-sm text-white/50">{label}</div>
    <div className="mt-1 text-3xl font-bold text-white">{value}</div>
  </div>
);

const ExecutiveMetric = ({ label, value, detail }: { label: string; value: string; detail?: string }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
    <div className="mt-2 truncate text-xl font-bold text-white">{value}</div>
    {detail && <div className="mt-1 truncate text-sm text-white/50">{detail}</div>}
  </div>
);

export default DetalleProductoPage;
