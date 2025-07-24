import React, { useState } from "react";
import { Search, Package, MapPin, ChevronDown, Check } from "lucide-react";

interface VentasProductSelectorProps {
  productos: string[];
  productoSeleccionado: string;
  setProducto: (prod: string) => void;
  sucursales: string[];
  sucursalSeleccionada: string;
  setSucursal: (suc: string) => void;
}

export const VentasProductSelector: React.FC<VentasProductSelectorProps> = ({
  productos,
  productoSeleccionado,
  setProducto,
  sucursales,
  sucursalSeleccionada,
  setSucursal,
}) => {
  const [openProducto, setOpenProducto] = useState(false);
  const [openSucursal, setOpenSucursal] = useState(false);
  const [searchProducto, setSearchProducto] = useState("");
  const [, setSearchSucursal] = useState("");

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.toLowerCase().includes(searchProducto.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Selector de Producto */}
      <div>
        <label className="mb-2 text-sm font-medium text-white/80 flex items-center gap-2">
          <Package className="w-4 h-4 text-[#D94854]" />
          Producto a analizar
        </label>
        
        <div className="relative">
          <button
            onClick={() => setOpenProducto(!openProducto)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-left text-white focus:outline-none focus:border-[#D94854] transition-all hover:bg-white/15 flex items-center justify-between"
          >
            <span className={productoSeleccionado ? "text-white" : "text-white/50"}>
              {productoSeleccionado || "Seleccionar producto..."}
            </span>
            <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${openProducto ? 'rotate-180' : ''}`} />
          </button>

          {openProducto && (
            <div className="absolute z-10 w-full mt-1 bg-[#212026] border border-white/20 rounded-xl shadow-2xl max-h-60 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-[#D94854] transition-all"
                  />
                </div>
              </div>

              {/* Options */}
              <div 
                className="max-h-40 overflow-y-auto"
                onWheel={(e) => {
                  e.stopPropagation();
                  const container = e.currentTarget;
                  container.scrollTop += e.deltaY;
                }}
              >
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((producto) => (
                    <button
                      key={producto}
                      onClick={() => {
                        setProducto(producto);
                        setOpenProducto(false);
                        setSearchProducto("");
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center justify-between"
                    >
                      <span>{producto}</span>
                      {productoSeleccionado === producto && (
                        <Check className="w-4 h-4 text-[#D94854]" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-white/60 text-sm">
                    No se encontraron productos
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {productoSeleccionado && (
          <div className="mt-2 text-xs text-[#D94854] flex items-center gap-1">
            <Check className="w-3 h-3" />
            Producto seleccionado
          </div>
        )}
      </div>

      {/* Selector de Sucursal (grid sin scroll) */}
      <div>
        <label className="mb-2 text-sm font-medium text-white/80 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#B695BF]" />
          Sucursales ({sucursales.length})
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sucursales.map((sucursal) => {
            const isSelected = sucursal === sucursalSeleccionada;
            return (
              <button
                key={sucursal}
                onClick={() => setSucursal(sucursal)}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all border-2
                  ${isSelected
                    ? 'bg-[#B695BF]/20 border-[#B695BF] text-white'
                    : 'bg-white/5 border-white/20 hover:border-white/40 text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className="font-medium">{sucursal}</span>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>

        {sucursalSeleccionada && (
          <div className="mt-2 text-xs text-[#B695BF] flex items-center gap-1">
            <Check className="w-3 h-3" />
            Sucursal seleccionada: 
            <span className="font-semibold ml-1">{sucursalSeleccionada}</span>
          </div>
        )}

        <div className="text-xs text-white/50 text-center">
          💡 Selecciona la sucursal que quieres analizar
        </div>
      </div>

      {/* Info de selección */}
      {productoSeleccionado && sucursalSeleccionada && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-white/80 text-sm">
            <div className="font-medium mb-1">Configuración actual:</div>
            <div className="text-xs space-y-1">
              <div>📦 <span className="text-[#D94854]">{productoSeleccionado}</span></div>
              <div>📍 <span className="text-[#B695BF]">{sucursalSeleccionada}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {(openProducto || openSucursal) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setOpenProducto(false);
            setOpenSucursal(false);
            setSearchProducto("");
            setSearchSucursal("");
          }}
        />
      )}
    </div>
  );
};