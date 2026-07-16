import React from 'react';
import * as Switch from '@radix-ui/react-switch';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  EyeOff,
  Loader2,
  PackageSearch,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Paginacion from '@/components/ui/Paginacion';
import {
  useActualizarProductoOculto,
  useProductosGestor
} from '@/hooks/evolucionStock/useProductosGestor';
import type {
  ProductoGestor,
  ProductosGestorFiltros
} from '@/types/evolucionStock/productosGestorTypes';

const filtrosIniciales: ProductosGestorFiltros = {
  soloOcultos: false,
  orderBy: 'vendido',
  orderDesc: false,
  page: 1,
  pageSize: 25
};

export const GestorProductosPage: React.FC = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = React.useState('');
  const [filtros, setFiltros] = React.useState<ProductosGestorFiltros>(filtrosIniciales);
  const { data, isLoading, isFetching, isError } = useProductosGestor(filtros);
  const actualizarOculto = useActualizarProductoOculto();

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFiltros(prev => ({
        ...prev,
        q: busqueda.trim() || undefined,
        page: 1
      }));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [busqueda]);

  const ordenar = (orderBy: string) => {
    setFiltros(prev => ({
      ...prev,
      orderBy,
      orderDesc: prev.orderBy === orderBy ? !prev.orderDesc : false,
      page: 1
    }));
  };

  const iconoOrden = (key: string) => {
    if (filtros.orderBy !== key)
      return <ArrowUpDown className="h-4 w-4 text-white/35" />;

    return filtros.orderDesc
      ? <ArrowDown className="h-4 w-4 text-[#B695BF]" />
      : <ArrowUp className="h-4 w-4 text-[#B695BF]" />;
  };

  const cambiarOculto = (producto: ProductoGestor) => {
    const nuevoEstado = !producto.oculto;
    actualizarOculto.mutate(
      { codigoProducto: producto.codigoProducto, oculto: nuevoEstado },
      {
        onSuccess: () => toast.success(
          nuevoEstado
            ? 'Producto excluido de los análisis'
            : 'Producto incluido nuevamente en los análisis'
        ),
        onError: () => toast.error('No se pudo actualizar el producto')
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <button
            onClick={() => navigate('/evolucion-stock')}
            className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-[#D94854]/35 bg-[#D94854]/10 p-3">
              <PackageSearch className="h-7 w-7 text-[#FF7B86]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Gestor de productos</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/55">
                Excluí productos irrelevantes o basura de todos los análisis. Sus movimientos no se borran y podés volver a incluirlos cuando quieras.
              </p>
            </div>
          </div>
        </header>

        <section className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={busqueda}
                onChange={event => setBusqueda(event.target.value)}
                placeholder="Buscar por código o nombre"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white outline-none placeholder:text-white/35 focus:border-[#B695BF]/60"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-white/70">
              <Switch.Root
                checked={filtros.soloOcultos}
                onCheckedChange={soloOcultos => setFiltros(prev => ({ ...prev, soloOcultos, page: 1 }))}
                className="relative h-6 w-11 rounded-full border border-white/15 bg-white/10 transition-colors data-[state=checked]:border-[#D94854]/60 data-[state=checked]:bg-[#D94854]"
              >
                <Switch.Thumb className="block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-6" />
              </Switch.Root>
              Solo excluidos
            </label>

            <select
              value={filtros.pageSize}
              onChange={event => setFiltros(prev => ({ ...prev, pageSize: Number(event.target.value), page: 1 }))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
            >
              {[25, 50, 100, 200].map(size => <option key={size} value={size}>{size} filas</option>)}
            </select>
          </div>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <Th onClick={() => ordenar('codigo')} icon={iconoOrden('codigo')}>Código</Th>
                <Th onClick={() => ordenar('producto')} icon={iconoOrden('producto')}>Producto</Th>
                <Th align="right" onClick={() => ordenar('comprado')} icon={iconoOrden('comprado')}>Comprado</Th>
                <Th align="right" onClick={() => ordenar('vendido')} icon={iconoOrden('vendido')}>Vendido</Th>
                <Th onClick={() => ordenar('ultimoMovimiento')} icon={iconoOrden('ultimoMovimiento')}>Último movimiento</Th>
                <Th align="right">Excluir</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-white/50" /></td></tr>
              )}
              {!isLoading && isError && (
                <tr><td colSpan={6} className="py-12 text-center text-[#FFADB5]">No se pudo cargar el catálogo de productos.</td></tr>
              )}
              {!isLoading && !isError && data?.data.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-white/50">No hay productos para estos filtros.</td></tr>
              )}
              {data?.data.map(producto => {
                const mutando = actualizarOculto.isPending &&
                  actualizarOculto.variables?.codigoProducto === producto.codigoProducto;

                return (
                  <tr
                    key={producto.codigoProducto}
                    className={`border-b border-white/5 last:border-0 hover:bg-white/5 ${producto.oculto ? 'bg-[#D94854]/5 opacity-55' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">{producto.codigoProducto}</td>
                    <td className="px-4 py-3 text-sm text-white/75">
                      <div className="flex items-center gap-2">
                        <span>{producto.nombreProducto}</span>
                        {producto.oculto && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#D94854]/45 bg-[#D94854]/15 px-2 py-0.5 text-[11px] font-semibold text-[#FFADB5]">
                            <EyeOff className="h-3 w-3" />
                            Excluido
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white/75">{producto.unidadesCompradas}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/75">{producto.unidadesVendidas}</td>
                    <td className="px-4 py-3 text-sm text-white/65">
                      <div>{formatearFecha(producto.ultimoMovimiento)}</div>
                      <div className="text-xs text-white/35">Desde {formatearFecha(producto.primerMovimiento)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {mutando && <Loader2 className="h-4 w-4 animate-spin text-white/45" />}
                        <Switch.Root
                          checked={producto.oculto}
                          disabled={actualizarOculto.isPending}
                          onCheckedChange={() => cambiarOculto(producto)}
                          aria-label={`${producto.oculto ? 'Incluir' : 'Excluir'} ${producto.nombreProducto}`}
                          className="relative h-6 w-11 rounded-full border border-white/15 bg-white/10 transition-colors disabled:cursor-wait disabled:opacity-50 data-[state=checked]:border-[#D94854]/60 data-[state=checked]:bg-[#D94854]"
                        >
                          <Switch.Thumb className="block h-4 w-4 translate-x-1 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-6" />
                        </Switch.Root>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isFetching && !isLoading && (
            <div className="border-t border-white/5 px-4 py-2 text-right text-xs text-white/35">Actualizando…</div>
          )}
        </section>

        {data && (
          <Paginacion
            paginaActual={data.pagina}
            totalPaginas={data.totalPaginas}
            totalElementos={data.totalRegistros}
            elementosPorPagina={data.pageSize}
            onCambioPagina={page => setFiltros(prev => ({ ...prev, page }))}
          />
        )}
      </div>
    </div>
  );
};

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
  <th className={`px-4 py-3 text-${align} text-xs font-medium uppercase tracking-wide text-white/50`}>
    {onClick
      ? <button onClick={onClick} className="inline-flex items-center gap-2 hover:text-white">{children}{icon}</button>
      : children}
  </th>
);

const formatearFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es-AR');

export default GestorProductosPage;
