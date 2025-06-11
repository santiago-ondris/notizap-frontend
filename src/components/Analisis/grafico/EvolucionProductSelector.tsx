import React from "react";
import { Search, Loader2, Package } from "lucide-react";
import { type ProductoBase } from "@/types/analisis/analisis";

interface EvolucionProductSelectorProps {
  producto: string;
  setProducto: (producto: string) => void;
  productos: ProductoBase[];
  buscandoProductos: boolean;
  disabled?: boolean;
}

export const EvolucionProductSelector: React.FC<EvolucionProductSelectorProps> = ({
  producto,
  setProducto,
  productos,
  buscandoProductos,
  disabled = false
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-[#B695BF]" />
        Seleccionar producto a analizar
      </h3>
      
      <div className="space-y-3">
        {/* Input con datalist */}
        <div className="relative">
          <input
            type="text"
            list="productos-list"
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-[#51590E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Buscar producto base..."
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            disabled={disabled || productos.length === 0}
            autoComplete="off"
          />
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          
          <datalist id="productos-list">
            {productos.map((p) => (
              <option key={p.codigo} value={p.nombre} />
            ))}
          </datalist>
        </div>
        
        {/* Estados del selector */}
        {buscandoProductos && (
          <div className="flex items-center gap-2 text-[#B695BF] text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando productos en el archivo...
          </div>
        )}
        
        {productos.length === 0 && !buscandoProductos && (
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Search className="w-4 h-4" />
            Selecciona un archivo de detalles de compras para buscar productos.
          </div>
        )}
        
        {productos.length > 0 && !buscandoProductos && (
          <div className="flex items-center justify-between">
            <div className="text-[#51590E] text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              {productos.length} productos disponibles para análisis
            </div>
            
            {producto && productos.some(p => p.nombre === producto) && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                Producto seleccionado
              </div>
            )}
          </div>
        )}

        {/* Lista de productos más populares (primeros 5) */}
        {productos.length > 0 && !producto && (
          <div className="mt-4">
            <p className="text-white/60 text-xs mb-2">Productos disponibles:</p>
            <div className="flex flex-wrap gap-2">
              {productos.slice(0, 5).map((p) => (
                <button
                  key={p.codigo}
                  onClick={() => setProducto(p.nombre)}
                  className="px-3 py-1 bg-white/10 hover:bg-[#51590E]/20 text-white/80 hover:text-white text-xs rounded-lg transition-all hover:scale-105"
                >
                  {p.nombre}
                </button>
              ))}
              {productos.length > 5 && (
                <span className="px-3 py-1 text-white/50 text-xs">
                  +{productos.length - 5} más...
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};