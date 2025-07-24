import React from "react";
import { Package, ShoppingCart, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalisisTablePanelProps {
  datosFiltrados: any[];
  datosPaginaRotacion: any[];
  puntoDeVenta: string;
  paginaRotacion: number;
  totalPaginasRotacion: number;
  filasPorPaginaRotacion: number;
  opcionesPorPagina: number[];
  columnaOrden: "comprado" | "vendido" | "rotacion";
  ordenAsc: boolean;
  onSortChange: (columna: "comprado" | "vendido" | "rotacion") => void;
  onPaginationChange: {
    setFilasPorPaginaRotacion: (value: number) => void;
    setPaginaRotacion: (value: number) => void;
  };
}

export const AnalisisTablePanel: React.FC<AnalisisTablePanelProps> = ({
  datosFiltrados,
  datosPaginaRotacion,
  puntoDeVenta,
  paginaRotacion,
  totalPaginasRotacion,
  filasPorPaginaRotacion,
  opcionesPorPagina,
  columnaOrden,
  ordenAsc,
  onSortChange,
  onPaginationChange
}) => {
  const getSortIcon = (columna: "comprado" | "vendido" | "rotacion") => {
    if (columnaOrden !== columna) return "";
    return ordenAsc ? "▲" : "▼";
  };

  const getRotationColor = (rotacion: number) => {
    if (rotacion >= 0.8) return "text-green-400 bg-green-400/20";
    if (rotacion >= 0.5) return "text-yellow-400 bg-yellow-400/20";
    return "text-red-400 bg-red-400/20";
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#B695BF]" />
              Análisis de rotación
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Mostrando {datosPaginaRotacion.length} de {datosFiltrados.length} productos
            </p>
          </div>
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-white/70 text-sm font-medium">Filas:</label>
            <div className="relative">
              <select
                value={filasPorPaginaRotacion}
                onChange={e => onPaginationChange.setFilasPorPaginaRotacion(Number(e.target.value))}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B695BF] transition-all appearance-none cursor-pointer pr-8"
              >
                {opcionesPorPagina.map((opcion) => (
                  <option key={opcion} value={opcion} className="bg-[#212026] text-white">
                    {opcion}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3 h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                  Producto
                </th>
                <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                  Color
                </th>
                <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                  Categoría
                </th>
                {puntoDeVenta !== "TODOS" && (
                  <th className="text-left px-6 py-4 font-semibold text-white/80 text-sm">
                    Sucursal
                  </th>
                )}
                <th 
                  className="text-center px-6 py-4 font-semibold text-white/80 text-sm cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => onSortChange("comprado")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Package className="w-4 h-4" />
                    Comprado
                    <span className="text-xs w-2">{getSortIcon("comprado")}</span>
                  </div>
                </th>
                <th 
                  className="text-center px-6 py-4 font-semibold text-white/80 text-sm cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => onSortChange("vendido")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Vendido
                    <span className="text-xs w-2">{getSortIcon("vendido")}</span>
                  </div>
                </th>
                <th 
                  className="text-center px-6 py-4 font-semibold text-white/80 text-sm cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => onSortChange("rotacion")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Rotación
                    <span className="text-xs w-2">{getSortIcon("rotacion")}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {datosPaginaRotacion.length > 0 ? (
                datosPaginaRotacion.map((item, index) => {
                  const rotacion = item.tasaRotacion || 0;

                  return (
                    <tr 
                      key={index}
                      className={`
                        border-b border-white/5 hover:bg-white/5 transition-colors
                        ${index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                      `}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {item.producto}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/70">
                          {item.color}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/70 text-sm">
                          {item.categoria || "Sin categoría"}
                        </div>
                      </td>
                      {puntoDeVenta !== "TODOS" && (
                        <td className="px-6 py-4">
                          <div className="text-white/70 text-sm">
                            {item.puntoDeVenta}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-[#D94854]/20 text-[#D94854] font-semibold text-sm">
                          {item.cantidadComprada?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-[#F23D5E]/20 text-[#F23D5E] font-semibold text-sm">
                          {item.cantidadVendida?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-2 py-1 rounded-lg font-semibold text-sm ${getRotationColor(rotacion)}`}>
                          {Math.round(rotacion * 100)}%
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={puntoDeVenta !== "TODOS" ? 7 : 6}
                    className="p-8 text-center text-white/60"
                  >
                    No hay resultados para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPaginasRotacion > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Página {paginaRotacion} de {totalPaginasRotacion}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onPaginationChange.setPaginaRotacion(Math.max(1, paginaRotacion - 1))}
              disabled={paginaRotacion === 1}
              variant="outline"
              size="sm"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${paginaRotacion === 1 
                  ? 'bg-white/5 text-white/40 cursor-not-allowed border-white/10' 
                  : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 border-white/20'
                }
              `}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            
            <Button
              onClick={() => onPaginationChange.setPaginaRotacion(Math.min(totalPaginasRotacion, paginaRotacion + 1))}
              disabled={paginaRotacion === totalPaginasRotacion}
              variant="outline"
              size="sm"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${paginaRotacion === totalPaginasRotacion 
                  ? 'bg-white/5 text-white/40 cursor-not-allowed border-white/10' 
                  : 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 border-white/20'
                }
              `}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};