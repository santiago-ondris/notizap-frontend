import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Loader2,
  RotateCcw,
  X
} from 'lucide-react';
import Paginacion from '@/components/ui/Paginacion';
import {
  useMatrizTransferencias,
  useProductosTransferidos
} from '@/hooks/evolucionStock/useTransferencias';
import type {
  ProductosTransferidosFiltros,
  RutaTransferencia,
  TransferenciasPeriodoFiltros
} from '@/types/evolucionStock/transferenciasTypes';

const rankingInicial = {
  orderBy: 'unidades',
  orderDesc: true,
  page: 1,
  pageSize: 25
};

export const TransferenciasPage: React.FC = () => {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = React.useState<TransferenciasPeriodoFiltros>({});
  const [rutaSeleccionada, setRutaSeleccionada] = React.useState<RutaTransferencia | null>(null);
  const [ranking, setRanking] = React.useState(rankingInicial);
  const { data: matriz, isLoading: cargandoMatriz, isError: errorMatriz } = useMatrizTransferencias(periodo);

  const filtrosProductos = React.useMemo<ProductosTransferidosFiltros>(() => ({
    ...periodo,
    origen: rutaSeleccionada?.origen,
    destino: rutaSeleccionada?.destino,
    ...ranking
  }), [periodo, ranking, rutaSeleccionada]);
  const { data: productos, isLoading: cargandoProductos, isError: errorProductos } =
    useProductosTransferidos(filtrosProductos);

  const rutasPorClave = React.useMemo(() => new Map(
    matriz?.rutas.map(ruta => [claveRuta(ruta.origen, ruta.destino), ruta] as const) ?? []
  ), [matriz?.rutas]);
  const maximoRuta = React.useMemo(
    () => Math.max(0, ...(matriz?.rutas.map(ruta => ruta.unidadesRecibidas) ?? [])),
    [matriz?.rutas]
  );
  const sucursales = matriz?.sucursales ?? [];

  const actualizarPeriodo = (cambio: TransferenciasPeriodoFiltros) => {
    setPeriodo(cambio);
    setRutaSeleccionada(null);
    setRanking(prev => ({ ...prev, page: 1 }));
  };

  const seleccionarRuta = (ruta: RutaTransferencia) => {
    setRutaSeleccionada(ruta);
    setRanking(prev => ({ ...prev, page: 1 }));
  };

  const sort = (orderBy: string) => {
    setRanking(prev => ({
      ...prev,
      orderBy,
      orderDesc: prev.orderBy === orderBy ? !prev.orderDesc : true,
      page: 1
    }));
  };

  const sortIcon = (key: string) => {
    if (ranking.orderBy !== key) return <ArrowUpDown className="h-4 w-4 text-white/30" />;
    return ranking.orderDesc
      ? <ArrowDown className="h-4 w-4 text-[#F23D5E]" />
      : <ArrowUp className="h-4 w-4 text-[#F23D5E]" />;
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="border-b border-white/10 pb-6">
          <button
            onClick={() => navigate('/evolucion-stock')}
            className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-start gap-3">
            <ArrowRightLeft className="mt-1 h-6 w-6 text-[#F23D5E]" />
            <div>
              <h1 className="text-3xl font-bold text-white">Transferencias internas</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/55">
                Flujo recibido entre depositos y productos que concentraron cada ruta.
              </p>
            </div>
          </div>
        </header>

        <section className="border-b border-white/10 pb-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <PresetButton label="Ultimos 30 dias" onClick={() => actualizarPeriodo(rangoUltimosDias(30))} />
            <PresetButton label="Mes actual" onClick={() => actualizarPeriodo(rangoMesActual())} />
            <PresetButton label="Mes anterior" onClick={() => actualizarPeriodo(rangoMesAnterior())} />
            <button
              onClick={() => actualizarPeriodo({})}
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
                value={periodo.desde ?? ''}
                onChange={event => actualizarPeriodo({ ...periodo, desde: event.target.value || undefined })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase text-white/45">Hasta</span>
              <input
                type="date"
                value={periodo.hasta ?? ''}
                onChange={event => actualizarPeriodo({ ...periodo, hasta: event.target.value || undefined })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </label>
          </div>
        </section>

        {errorMatriz && (
          <div className="rounded-lg border border-[#D94854]/30 bg-[#D94854]/10 p-4 text-sm text-[#FCA5A5]">
            No se pudo cargar la matriz de transferencias.
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Matriz origen y destino</h2>
              <p className="text-sm text-white/45">Selecciona una celda con movimiento para aislar esa ruta.</p>
            </div>
            {matriz && (
              <div className="flex gap-6 text-right">
                <Metric label="Unidades" value={matriz.totalUnidades} />
                <Metric label="Rutas" value={matriz.rutas.length} />
                <Metric label="Depositos" value={matriz.sucursales.length} />
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-max border-collapse bg-white/[0.02]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="sticky left-0 z-10 min-w-44 bg-[#25252B] px-4 py-3 text-left text-xs font-medium uppercase text-white/45">
                    Origen / destino
                  </th>
                  {sucursales.map(destino => (
                    <th key={destino} className="min-w-32 max-w-40 px-3 py-3 text-center text-xs font-medium text-white/55">
                      {destino}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargandoMatriz && (
                  <tr>
                    <td colSpan={sucursales.length + 1} className="h-40 text-center">
                      <Loader2 className="mx-auto h-7 w-7 animate-spin text-white/45" />
                    </td>
                  </tr>
                )}
                {!cargandoMatriz && sucursales.map(origen => (
                  <tr key={origen} className="border-b border-white/5 last:border-0">
                    <th className="sticky left-0 z-10 bg-[#202026] px-4 py-3 text-left text-sm font-medium text-white/75">
                      {origen}
                    </th>
                    {sucursales.map(destino => {
                      const ruta = rutasPorClave.get(claveRuta(origen, destino));
                      const seleccionada = rutaSeleccionada?.origen === origen && rutaSeleccionada.destino === destino;
                      return (
                        <td key={destino} className="h-16 border-l border-white/5 p-1.5 text-center">
                          {ruta ? (
                            <button
                              onClick={() => seleccionarRuta(ruta)}
                              title={`${origen} a ${destino}: ${ruta.unidadesRecibidas} unidades en ${ruta.remitosInvolucrados} remitos`}
                              className={`h-full w-full rounded-md border px-2 py-1 text-sm font-semibold transition-colors ${seleccionada ? 'border-white text-white ring-2 ring-[#F23D5E]/70' : 'border-white/10 text-white/85 hover:border-white/35'}`}
                              style={{ backgroundColor: colorIntensidad(ruta.unidadesRecibidas, maximoRuta) }}
                            >
                              <span className="block">{ruta.unidadesRecibidas}</span>
                              <span className="block text-[11px] font-normal text-white/55">{ruta.remitosInvolucrados} rem.</span>
                            </button>
                          ) : (
                            <span className="text-sm text-white/20">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {!cargandoMatriz && rutasPorClave.size === 0 && (
                  <tr><td className="h-32 px-4 text-center text-sm text-white/45">Sin transferencias en el periodo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Productos transferidos</h2>
                {rutaSeleccionada && (
                  <button
                    onClick={() => {
                      setRutaSeleccionada(null);
                      setRanking(prev => ({ ...prev, page: 1 }));
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-[#F23D5E]/35 bg-[#F23D5E]/10 px-2 py-1 text-xs text-[#FF9AAA]"
                    title="Quitar filtro de ruta"
                  >
                    {rutaSeleccionada.origen} a {rutaSeleccionada.destino}
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-white/45">
                {rutaSeleccionada ? `${rutaSeleccionada.unidadesRecibidas} unidades en la ruta seleccionada.` : 'Ranking del flujo total del periodo.'}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-white/55">
              Filas
              <select
                value={ranking.pageSize}
                onChange={event => setRanking(prev => ({ ...prev, pageSize: Number(event.target.value), page: 1 }))}
                className="rounded-lg border border-white/10 bg-[#25252B] px-3 py-2 text-white"
              >
                {[25, 50, 100, 200].map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>

          {errorProductos && (
            <div className="rounded-lg border border-[#D94854]/30 bg-[#D94854]/10 p-4 text-sm text-[#FCA5A5]">
              No se pudo cargar el ranking de productos.
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[760px] bg-white/[0.02]">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <Th onClick={() => sort('codigo')} icon={sortIcon('codigo')}>Codigo</Th>
                  <Th onClick={() => sort('producto')} icon={sortIcon('producto')}>Producto</Th>
                  <Th align="right" onClick={() => sort('unidades')} icon={sortIcon('unidades')}>Recibido</Th>
                  <Th align="right" onClick={() => sort('remitos')} icon={sortIcon('remitos')}>Remitos</Th>
                  <Th align="right">% del flujo</Th>
                  <Th align="right">Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {cargandoProductos && (
                  <tr><td colSpan={6} className="h-32 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-white/45" /></td></tr>
                )}
                {!cargandoProductos && productos?.data.length === 0 && (
                  <tr><td colSpan={6} className="h-32 text-center text-sm text-white/45">Sin productos transferidos.</td></tr>
                )}
                {productos?.data.map(producto => (
                  <tr key={`${producto.codigoProducto ?? 'pendiente'}-${producto.nombreProducto}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04]">
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {producto.codigoProducto ?? <span className="text-xs text-[#FFD166]">Sin match</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/75">{producto.nombreProducto}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-white">{producto.unidadesRecibidas}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/65">{producto.remitosInvolucrados}</td>
                    <td className="px-4 py-3 text-right text-sm text-[#B695BF]">{producto.porcentajeFlujo}%</td>
                    <td className="px-4 py-3 text-right">
                      {producto.codigoProducto ? (
                        <button
                          onClick={() => navigate(`/evolucion-stock/producto/${producto.codigoProducto}`)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                          title="Ver detalle del producto"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : <span className="text-white/20">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productos && (
            <Paginacion
              paginaActual={productos.pagina}
              totalPaginas={productos.totalPaginas}
              totalElementos={productos.totalRegistros}
              elementosPorPagina={productos.pageSize}
              onCambioPagina={page => setRanking(prev => ({ ...prev, page }))}
            />
          )}
        </section>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="text-xl font-semibold text-white">{value.toLocaleString('es-AR')}</div>
    <div className="text-xs uppercase text-white/40">{label}</div>
  </div>
);

const Th = ({
  children,
  icon,
  onClick,
  align = 'left'
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  align?: 'left' | 'right';
}) => (
  <th className={`px-4 py-3 text-xs font-medium uppercase text-white/50 ${align === 'right' ? 'text-right' : 'text-left'}`}>
    {onClick
      ? <button onClick={onClick} className="inline-flex items-center gap-2 hover:text-white">{children}{icon}</button>
      : children}
  </th>
);

const PresetButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/65 hover:bg-white/10">
    {label}
  </button>
);

const claveRuta = (origen: string, destino: string) => `${origen}\u0000${destino}`;

const colorIntensidad = (unidades: number, maximo: number) => {
  const intensidad = maximo > 0 ? unidades / maximo : 0;
  const alpha = 0.12 + intensidad * 0.58;
  return `rgba(242, 61, 94, ${alpha.toFixed(2)})`;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
const rangoUltimosDias = (dias: number) => {
  const hasta = new Date();
  const desde = new Date();
  desde.setDate(hasta.getDate() - dias);
  return { desde: toIsoDate(desde), hasta: toIsoDate(hasta) };
};
const rangoMesActual = () => {
  const hoy = new Date();
  return {
    desde: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0))
  };
};
const rangoMesAnterior = () => {
  const hoy = new Date();
  return {
    desde: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)),
    hasta: toIsoDate(new Date(hoy.getFullYear(), hoy.getMonth(), 0))
  };
};

export default TransferenciasPage;
