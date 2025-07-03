import { useState, useEffect } from "react";
import { Filter, X, Search, Calendar, Building2, RotateCcw } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import SelectorPeriodo from "./SelectorPeriodo";
import type { VentaWooCommerceQuery } from "@/types/woocommerce/wooTypes";
import { TIENDAS_WOOCOMMERCE } from "@/types/woocommerce/wooTypes";

interface FiltrosAvanzadosProps {
  filtros: VentaWooCommerceQuery;
  onCambiarFiltros: (filtros: VentaWooCommerceQuery) => void;
  onLimpiarFiltros: () => void;
  mostrarBotonLimpiar?: boolean;
  compacto?: boolean;
}

export default function FiltrosAvanzados({
  filtros,
  onCambiarFiltros,
  onLimpiarFiltros,
  mostrarBotonLimpiar = true,
  compacto = false
}: FiltrosAvanzadosProps) {

  const [abierto, setAbierto] = useState(!compacto);
  const [filtrosLocales, setFiltrosLocales] = useState<VentaWooCommerceQuery>(filtros);

  // Sincronizar filtros locales con props
  useEffect(() => {
    setFiltrosLocales(filtros);
  }, [filtros]);

  // Aplicar filtros con debounce
  const aplicarFiltros = (nuevosFiltros: Partial<VentaWooCommerceQuery>) => {
    const filtrosActualizados = { ...filtrosLocales, ...nuevosFiltros };
    setFiltrosLocales(filtrosActualizados);
    onCambiarFiltros(filtrosActualizados);
  };

  // Contar filtros activos
  const contarFiltrosActivos = (): number => {
    let count = 0;
    if (filtrosLocales.tienda) count++;
    if (filtrosLocales.mes) count++;
    if (filtrosLocales.año) count++;
    if (filtrosLocales.fechaDesde) count++;
    if (filtrosLocales.fechaHasta) count++;
    return count;
  };

  const filtrosActivos = contarFiltrosActivos();

  // Verificar si hay filtros aplicados
  const hayFiltros = filtrosActivos > 0;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header del panel */}
      <Collapsible.Root open={abierto} onOpenChange={setAbierto}>
        <Collapsible.Trigger className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border-b border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#B695BF]" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-white">🔍 Filtros Avanzados</h3>
                <p className="text-sm text-white/60">
                  {filtrosActivos > 0 
                    ? `${filtrosActivos} filtro${filtrosActivos !== 1 ? 's' : ''} activo${filtrosActivos !== 1 ? 's' : ''}`
                    : 'Personaliza tu búsqueda'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Contador de filtros activos */}
              {filtrosActivos > 0 && (
                <span className="px-2 py-1 bg-[#B695BF]/20 text-[#B695BF] rounded-lg text-sm font-medium">
                  {filtrosActivos}
                </span>
              )}

              {/* Indicador de estado */}
              <div className={`w-2 h-2 rounded-full transition-colors ${abierto ? 'bg-[#51590E]' : 'bg-white/40'}`} />
            </div>
          </div>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <div className="p-6 space-y-6">
            {/* Fila 1: Búsqueda por tienda */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Selector de tienda */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Tienda específica
                </label>
                <div className="relative">
                  <select
                    value={filtrosLocales.tienda || ''}
                    onChange={(e) => aplicarFiltros({ tienda: e.target.value || undefined })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#212026] text-white">Todas las tiendas</option>
                    {TIENDAS_WOOCOMMERCE.map(tienda => (
                      <option key={tienda} value={tienda} className="bg-[#212026] text-white">
                        {tienda}
                      </option>
                    ))}
                  </select>
                  <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
                </div>
              </div>

              {/* Búsqueda libre */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  <Search className="w-4 h-4 inline mr-2" />
                  Búsqueda libre
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Buscar en nombre de tienda..."
                    value={filtrosLocales.tienda || ''}
                    onChange={(e) => aplicarFiltros({ tienda: e.target.value || undefined })}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: Período específico */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Período específico
              </label>
              <div className="flex items-center gap-4">
                <SelectorPeriodo
                  mesSeleccionado={filtrosLocales.mes || new Date().getMonth() + 1}
                  añoSeleccionado={filtrosLocales.año || new Date().getFullYear()}
                  onCambiarPeriodo={(mes, año) => aplicarFiltros({ mes, año })}
                  mostrarNavegacion={false}
                  size="sm"
                />
                
                {(filtrosLocales.mes || filtrosLocales.año) && (
                  <button
                    onClick={() => aplicarFiltros({ mes: undefined, año: undefined })}
                    className="px-3 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                  >
                    <X className="w-3 h-3" />
                    Quitar
                  </button>
                )}
              </div>
            </div>

            {/* Fila 3: Rango de fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  📅 Fecha desde
                </label>
                <input
                  type="date"
                  value={filtrosLocales.fechaDesde || ''}
                  onChange={(e) => aplicarFiltros({ fechaDesde: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#51590E]/50 focus:bg-white/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  📅 Fecha hasta
                </label>
                <input
                  type="date"
                  value={filtrosLocales.fechaHasta || ''}
                  onChange={(e) => aplicarFiltros({ fechaHasta: e.target.value || undefined })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#51590E]/50 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Fila 4: Ordenamiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  📊 Ordenar por
                </label>
                <select
                  value={filtrosLocales.orderBy || 'FechaCreacion'}
                  onChange={(e) => aplicarFiltros({ orderBy: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all"
                >
                  <option value="FechaCreacion" className="bg-[#212026] text-white">Fecha de creación</option>
                  <option value="Mes" className="bg-[#212026] text-white">Mes</option>
                  <option value="Año" className="bg-[#212026] text-white">Año</option>
                  <option value="MontoFacturado" className="bg-[#212026] text-white">Monto facturado</option>
                  <option value="UnidadesVendidas" className="bg-[#212026] text-white">Unidades vendidas</option>
                  <option value="Tienda" className="bg-[#212026] text-white">Tienda</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  🔄 Dirección
                </label>
                <select
                  value={filtrosLocales.orderDescending ? 'desc' : 'asc'}
                  onChange={(e) => aplicarFiltros({ orderDescending: e.target.value === 'desc' })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all"
                >
                  <option value="desc" className="bg-[#212026] text-white">Descendente (Mayor a menor)</option>
                  <option value="asc" className="bg-[#212026] text-white">Ascendente (Menor a mayor)</option>
                </select>
              </div>
            </div>

            {/* Configuración de paginación */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">
                📄 Resultados por página
              </label>
              <div className="flex items-center gap-4">
                <select
                  value={filtrosLocales.pageSize || 10}
                  onChange={(e) => aplicarFiltros({ pageSize: parseInt(e.target.value), pageNumber: 1 })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#B695BF]/50 focus:bg-white/15 transition-all"
                >
                  <option value={5} className="bg-[#212026] text-white">5 registros</option>
                  <option value={10} className="bg-[#212026] text-white">10 registros</option>
                  <option value={25} className="bg-[#212026] text-white">25 registros</option>
                  <option value={50} className="bg-[#212026] text-white">50 registros</option>
                  <option value={100} className="bg-[#212026] text-white">100 registros</option>
                </select>
                
                <span className="text-sm text-white/60">
                  Mostrando hasta {filtrosLocales.pageSize || 10} resultados por página
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="text-sm text-white/60">
                {hayFiltros ? (
                  <span>✅ {filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} aplicado{filtrosActivos !== 1 ? 's' : ''}</span>
                ) : (
                  <span>🔍 Sin filtros aplicados</span>
                )}
              </div>

              {mostrarBotonLimpiar && hayFiltros && (
                <button
                  onClick={onLimpiarFiltros}
                  className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}