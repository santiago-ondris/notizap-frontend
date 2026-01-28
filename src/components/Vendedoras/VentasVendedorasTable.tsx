import React, { useState, useEffect } from 'react';
import {
  Table,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Building2,
  Package,
  DollarSign,
  Clock,
  AlertTriangle,
  Gift
} from 'lucide-react';
import type {
  VentaVendedora,
  VentasResponse,
  VentaVendedoraStats
} from '@/types/vendedoras/ventaVendedoraTypes';
import type {
  VentaVendedoraFilters,
} from '@/types/vendedoras/filtrosTypes';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';
import { turnoHelpers } from '@/utils/vendedoras/turnoHelpers';
import { estadisticasHelpers } from '@/utils/vendedoras/estadisticasHelpers';
import { ventasVendedorasService } from '@/services/vendedoras/ventasVendedorasService';

interface Props {
  data: VentasResponse;
  stats: VentaVendedoraStats;
  filtros: VentaVendedoraFilters;
  onFiltrosChange: (filtros: VentaVendedoraFilters) => void;
  loading?: boolean;
}

export const VentasVendedorasTable: React.FC<Props> = ({
  data,
  stats,
  filtros,
  onFiltrosChange,
  loading = false
}) => {
  const montoTotalCorrecto = stats.todasVendedoras?.length > 0
    ? stats.todasVendedoras.reduce((sum, v) => sum + v.montoTotal, 0)
    : stats.montoTotal; // fallback al valor del backend si no hay vendedoras

  const [totalProductos, setTotalProductos] = useState<number>(0);
  const [loadingContador, setLoadingContador] = useState(false);

  useEffect(() => {
    const cargarContadorProductos = async () => {
      if (!filtros.productoNombre || filtros.productoNombre.trim() === '') {
        setTotalProductos(0);
        return;
      }

      try {
        setLoadingContador(true);
        const resultado = await ventasVendedorasService.contarProductos(filtros);
        setTotalProductos(resultado.totalProductosEncontrados);
      } catch (error) {
        console.error('Error al contar productos:', error);
        setTotalProductos(0);
      } finally {
        setLoadingContador(false);
      }
    };

    cargarContadorProductos();
  }, [filtros.productoNombre, filtros.fechaInicio, filtros.fechaFin, filtros.sucursalNombre, filtros.vendedorNombre, filtros.turno]);

  const handleSort = (campo: VentaVendedoraFilters['orderBy']) => {
    const nuevaDireccion = filtros.orderBy === campo && filtros.orderDesc ? false : true;

    onFiltrosChange({
      ...filtros,
      orderBy: campo,
      orderDesc: nuevaDireccion,
      page: 1 // Reset página al cambiar ordenamiento
    });
  };

  const handlePageChange = (nuevaPagina: number) => {
    onFiltrosChange({
      ...filtros,
      page: nuevaPagina
    });
  };

  const getSortIcon = (campo: VentaVendedoraFilters['orderBy']) => {
    if (filtros.orderBy !== campo) {
      return <ArrowUpDown className="w-4 h-4 text-white/40" />;
    }
    return filtros.orderDesc
      ? <ArrowDown className="w-4 h-4 text-violet-400" />
      : <ArrowUp className="w-4 h-4 text-violet-400" />;
  };

  const renderFilaVenta = (venta: VentaVendedora) => {
    const fechaFormateada = dateHelpers.formatearFechaConDia(venta.fecha);
    const turnoInfo = turnoHelpers.obtenerInfoTurno(venta.turno as any);
    const emojiDia = dateHelpers.obtenerEmojiDia(venta.fecha);

    return (
      <tr
        key={venta.id}
        className="border-b border-white/10 hover:bg-white/5 transition-colors group"
      >
        {/* Fecha */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">{emojiDia}</span>
            <div>
              <p className="text-sm font-medium text-white">{fechaFormateada}</p>
              <p className="text-xs text-white/60">{venta.diaSemana}</p>
            </div>
          </div>
        </td>

        {/* Vendedora */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">{venta.vendedorNombre}</p>
              <p className="text-xs text-white/60">Vendedora</p>
            </div>
          </div>
        </td>

        {/* Sucursal */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">{venta.sucursalNombre}</p>
              {!venta.sucursalAbreSabadoTarde && dateHelpers.esSabado(venta.fecha) && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-yellow-400" />
                  <p className="text-xs text-yellow-400">Horario especial</p>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Turno */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: turnoInfo.color }}
            />
            <div>
              <p className="text-sm font-medium text-white">
                {turnoInfo.emoji} {venta.turno}
              </p>
              <p className="text-xs text-white/60">{turnoInfo.horario}</p>
            </div>
          </div>
        </td>

        {/* Producto */}
        <td className="px-4 py-4">
          <div className="flex items-start gap-2">
            {venta.esProductoDescuento ? (
              <Gift className="w-4 h-4 text-yellow-400 mt-0.5" />
            ) : (
              <Package className="w-4 h-4 text-green-400 mt-0.5" />
            )}
            <div className="max-w-xs">
              <p className="text-sm text-white leading-tight">{venta.producto}</p>
              {venta.esProductoDescuento && (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mt-1 inline-block">
                  Descuento
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Cantidad */}
        <td className="px-4 py-4">
          <div className="text-center">
            <p className="text-sm font-medium text-white">{venta.cantidad}</p>
            {venta.cantidad !== venta.cantidadReal && (
              <p className="text-xs text-white/60">
                Real: {venta.cantidadReal}
              </p>
            )}
          </div>
        </td>

        {/* Total */}
        <td className="px-4 py-4">
          <div className="text-right">
            <p className={`text-sm font-bold ${venta.cantidad < 0
                ? 'text-red-400'
                : 'text-green-400'
              }`}>
              {venta.cantidad < 0
                ? `-${estadisticasHelpers.formatearMoneda(Math.abs(venta.total))}`
                : estadisticasHelpers.formatearMoneda(venta.total)
              }
            </p>
            <p className="text-xs text-white/60">
              {estadisticasHelpers.formatearMonedaCompacta(venta.total)}
            </p>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Table className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">📋 Tabla de Ventas</h3>
            <p className="text-sm text-white/60">Cargando datos...</p>
          </div>
        </div>

        {/* Skeleton loader */}
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-12 bg-white/10 rounded-lg flex-1"></div>
              <div className="h-12 bg-white/10 rounded-lg flex-1"></div>
              <div className="h-12 bg-white/10 rounded-lg flex-1"></div>
              <div className="h-12 bg-white/10 rounded-lg flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalPaginas = data.totalPaginas;
  const paginaActual = data.pagina;

  // Calcular páginas a mostrar
  const generarPaginas = () => {
    const paginas: (number | string)[] = [];
    const maxPaginas = 7;

    if (totalPaginas <= maxPaginas) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaActual <= 4) {
        for (let i = 1; i <= 5; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 3) {
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 4; i <= totalPaginas; i++) paginas.push(i);
      } else {
        paginas.push(1);
        paginas.push('...');
        for (let i = paginaActual - 1; i <= paginaActual + 1; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }

    return paginas;
  };

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
      {/* Contador de productos encontrados */}
      {filtros.productoNombre && (
        <div className="mb-4 px-4 py-3 bg-violet-500/20 border border-violet-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-violet-400" />
            <div className="flex-1">
              {loadingContador ? (
                <span className="text-sm text-violet-300">
                  Buscando productos...
                </span>
              ) : (
                <span className="text-sm font-medium text-violet-300">
                  Se {totalProductos === 1 ? 'encontró' : 'encontraron'} en total{' '}
                  <strong className="text-violet-200">{totalProductos}</strong>{' '}
                  {totalProductos === 1 ? 'producto' : 'productos'} con el nombre{' '}
                  <strong className="text-violet-200">"{filtros.productoNombre}"</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
            <Table className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">📋 Tabla de Ventas</h3>
            <p className="text-sm text-white/60">
              {estadisticasHelpers.formatearNumero(stats.cantidadTotal)} ventas netas encontradas
            </p>
            <p className="text-sm text-white/60">
              {estadisticasHelpers.formatearMonedaCompleta(montoTotalCorrecto)} monto neto
            </p>
          </div>
        </div>

        {/* Resumen de página */}
        <div className="text-right">
          <p className="text-sm text-white/80">
            Página {paginaActual} de {totalPaginas}
          </p>
          <p className="text-xs text-white/60">
            Mostrando {((paginaActual - 1) * data.pageSize) + 1} - {Math.min(paginaActual * data.pageSize, data.totalRegistros)} de {data.totalRegistros}
          </p>
        </div>
      </div>

      {/* Tabla */}
      {data.data.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Table className="w-8 h-8 text-white/40" />
          </div>
          <h4 className="text-lg font-medium text-white/80 mb-2">No se encontraron ventas</h4>
          <p className="text-sm text-white/60">
            Intenta ajustar los filtros para encontrar datos
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('fecha')}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                  >
                    <Calendar className="w-4 h-4" />
                    Fecha
                    {getSortIcon('fecha')}
                  </button>
                </th>

                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('vendedor')}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                  >
                    <User className="w-4 h-4" />
                    Vendedora
                    {getSortIcon('vendedor')}
                  </button>
                </th>

                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('sucursal')}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors group"
                  >
                    <Building2 className="w-4 h-4" />
                    Sucursal
                    {getSortIcon('sucursal')}
                  </button>
                </th>

                <th className="px-4 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Clock className="w-4 h-4" />
                    Turno
                  </div>
                </th>

                <th className="px-4 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Package className="w-4 h-4" />
                    Producto
                  </div>
                </th>

                <th className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleSort('cantidad')}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors mx-auto group"
                  >
                    <Package className="w-4 h-4" />
                    Cantidad
                    {getSortIcon('cantidad')}
                  </button>
                </th>

                <th className="px-4 py-4 text-right">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors ml-auto group"
                  >
                    <DollarSign className="w-4 h-4" />
                    Total
                    {getSortIcon('total')}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {data.data.map(venta => renderFilaVenta(venta))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${paginaActual === 1
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          </div>

          <div className="flex items-center gap-1">
            {generarPaginas().map((pagina, index) => {
              if (pagina === '...') {
                return (
                  <span key={index} className="px-2 py-1 text-white/60">
                    ...
                  </span>
                );
              }

              const esPaginaActual = pagina === paginaActual;

              return (
                <button
                  key={index}
                  onClick={() => handlePageChange(pagina as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${esPaginaActual
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                >
                  {pagina}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${paginaActual === totalPaginas
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                }`}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};