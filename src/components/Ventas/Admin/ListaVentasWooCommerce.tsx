import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Building2, 
  Package, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";
import { getVentasPaged, deleteVenta } from "@/services/woocommerce/wooService";
import { formatearMonedaArg, formatearNumeroArg, formatearPeriodoCompleto } from "@/utils/ventas/ventasUtils";
import type { VentaWooCommerce, VentaWooCommerceQuery, PaginatedResponse } from "@/types/woocommerce/wooTypes";
import { TIENDAS_WOOCOMMERCE, MESES, AÑOS_DISPONIBLES } from "@/types/woocommerce/wooTypes";

interface ListaVentasWooCommerceProps {
  refreshKey: number;
  onEditar: (venta: VentaWooCommerce) => void;
  mostrarDetalles: boolean;
  mesSeleccionado?: number;
  añoSeleccionado?: number;
}

export default function ListaVentasWooCommerce({
  refreshKey,
  onEditar,
  mostrarDetalles,
  mesSeleccionado,
  añoSeleccionado
}: ListaVentasWooCommerceProps) {
  
  const [ventas, setVentas] = useState<VentaWooCommerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Estados de filtros y paginación
  const [filtros, setFiltros] = useState<VentaWooCommerceQuery>({
    tienda: '',
    mes: mesSeleccionado,
    año: añoSeleccionado,
    pageNumber: 1,
    pageSize: 10,
    orderBy: 'FechaCreacion',
    orderDescending: true
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Cargar datos
  const cargarVentas = async () => {
    setLoading(true);
    setError(null);

    try {
      const query: VentaWooCommerceQuery = {
        ...filtros,
        tienda: busqueda.trim() || filtros.tienda || undefined
      };

      const response: PaginatedResponse<VentaWooCommerce> = await getVentasPaged(query);
      
      setVentas(response.items);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "Error al cargar las ventas");
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [refreshKey, filtros, busqueda]);

  // Handlers de filtros
  const aplicarFiltros = (nuevosFiltros: Partial<VentaWooCommerceQuery>) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros,
      pageNumber: 1 // Reset página al cambiar filtros
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      pageNumber: 1,
      pageSize: 10,
      orderBy: 'FechaCreacion',
      orderDescending: true
    });
    setBusqueda('');
  };

  // Paginación
  const cambiarPagina = (nuevaPagina: number) => {
    setFiltros(prev => ({ ...prev, pageNumber: nuevaPagina }));
  };

  // Eliminar venta
  const handleEliminar = async (venta: VentaWooCommerce) => {
    if (!window.confirm(`¿Eliminar la venta de ${venta.tienda} del período ${venta.periodoCompleto}?\n\nEsta acción no puede deshacerse.`)) {
      return;
    }

    try {
      await deleteVenta(venta.id);
      toast.success("✅ Venta eliminada exitosamente");
      cargarVentas(); // Refrescar lista
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar la venta");
    }
  };

  // Obtener color de tienda
  const obtenerColorTienda = (tienda: string): string => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
        return "#D94854";
      case 'ALENKA':
        return "#B695BF";
      default:
        return "#B695BF";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📋 Cargando lista de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-[#D94854]" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar la lista</h3>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button
              onClick={cargarVentas}
              className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y filtros */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar por tienda..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#51590E]/50 focus:bg-white/15 transition-all"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            
            {(filtros.tienda || filtros.mes || filtros.año || busqueda) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-3 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg font-medium transition-all"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Panel de filtros */}
        {mostrarFiltros && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro tienda */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Tienda
                </label>
                <select
                  value={filtros.tienda || ''}
                  onChange={(e) => aplicarFiltros({ tienda: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 transition-all"
                >
                  <option value="" className="bg-[#212026] text-white">Todas las tiendas</option>
                  {TIENDAS_WOOCOMMERCE.map(tienda => (
                    <option key={tienda} value={tienda} className="bg-[#212026] text-white">
                      {tienda}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro mes */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Mes
                </label>
                <select
                  value={filtros.mes || ''}
                  onChange={(e) => aplicarFiltros({ mes: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 transition-all"
                >
                  <option value="" className="bg-[#212026] text-white">Todos los meses</option>
                  {MESES.map(mes => (
                    <option key={mes.value} value={mes.value} className="bg-[#212026] text-white">
                      {mes.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro año */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Año
                </label>
                <select
                  value={filtros.año || ''}
                  onChange={(e) => aplicarFiltros({ año: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 transition-all"
                >
                  <option value="" className="bg-[#212026] text-white">Todos los años</option>
                  {AÑOS_DISPONIBLES.map(año => (
                    <option key={año} value={año} className="bg-[#212026] text-white">
                      {año}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de ventas */}
      {ventas.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-8 h-8 text-white/40" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No hay ventas registradas</h3>
              <p className="text-white/60 text-sm">
                {(filtros.tienda || filtros.mes || filtros.año || busqueda) 
                  ? "No se encontraron ventas con los filtros aplicados" 
                  : "Aún no hay ventas de WooCommerce registradas"
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {/* Header de la tabla */}
          <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#51590E]" />
                <h3 className="text-lg font-semibold text-white">📋 Lista de Ventas WooCommerce</h3>
              </div>
              <span className="bg-[#51590E]/20 text-white px-3 py-1 rounded-lg text-sm font-medium">
                {totalCount} registro{totalCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Building2 className="w-4 h-4" />
                      Tienda
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                      <Calendar className="w-4 h-4" />
                      Período
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                      <Package className="w-4 h-4" />
                      Unidades
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                      <DollarSign className="w-4 h-4" />
                      Facturación
                    </div>
                  </th>
                  {mostrarDetalles && (
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                        <Eye className="w-4 h-4" />
                        Productos
                      </div>
                    </th>
                  )}
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {ventas.map((venta) => (
                  <tr 
                    key={venta.id}
                    className="hover:bg-white/5 transition-all duration-200 group"
                  >
                    {/* Tienda */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-6 rounded-full"
                          style={{ backgroundColor: obtenerColorTienda(venta.tienda) }}
                        />
                        <span className="text-white font-medium">{venta.tienda}</span>
                      </div>
                    </td>

                    {/* Período */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-white/80 text-sm">
                        {formatearPeriodoCompleto(venta.mes, venta.año)}
                      </span>
                    </td>

                    {/* Unidades */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-white font-semibold">
                        {formatearNumeroArg(venta.unidadesVendidas)}
                      </span>
                    </td>

                    {/* Facturación */}
                    <td className="px-6 py-4 text-right">
                      <span 
                        className="font-bold"
                        style={{ color: obtenerColorTienda(venta.tienda) }}
                      >
                        {formatearMonedaArg(venta.montoFacturado)}
                      </span>
                    </td>

                    {/* Productos (solo si mostrarDetalles) */}
                    {mostrarDetalles && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {venta.topProductos.length > 0 ? (
                            <span className="text-xs text-white/60">
                              {venta.topProductos.length} producto{venta.topProductos.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-white/40">-</span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => onEditar(venta)}
                          className="p-2 text-[#B695BF] hover:bg-[#B695BF]/20 rounded transition-all"
                          title="Editar venta"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(venta)}
                          className="p-2 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-all"
                          title="Eliminar venta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer con paginación */}
          {totalPages > 1 && (
            <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/60">
                  Mostrando {((filtros.pageNumber! - 1) * filtros.pageSize!) + 1} - {Math.min(filtros.pageNumber! * filtros.pageSize!, totalCount)} de {totalCount} registros
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarPagina(filtros.pageNumber! - 1)}
                    disabled={filtros.pageNumber === 1}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <span className="px-3 py-1 bg-white/10 rounded text-white text-sm">
                    {filtros.pageNumber} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => cambiarPagina(filtros.pageNumber! + 1)}
                    disabled={filtros.pageNumber === totalPages}
                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}