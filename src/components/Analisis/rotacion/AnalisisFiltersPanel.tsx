import React from "react";
import { Filter, Search, MapPin, Tag } from "lucide-react";

interface AnalisisFiltersPanelProps {
  puntoDeVenta: string;
  setPuntoDeVenta: (value: string) => void;
  puntosDeVenta: string[];
  categoriaSeleccionada: string;
  setCategoriaSeleccionada: (value: string) => void;
  categoriasDisponibles: string[];
  busqueda: string;
  setBusqueda: (value: string) => void;
}

export const AnalisisFiltersPanel: React.FC<AnalisisFiltersPanelProps> = ({
  puntoDeVenta,
  setPuntoDeVenta,
  puntosDeVenta,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  categoriasDisponibles,
  busqueda,
  setBusqueda
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Filter className="w-5 h-5 text-[#B695BF]" />
        Filtros de búsqueda
      </h3>
      
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">
            Buscar producto
          </label>
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto o color..."
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/50 focus:outline-none focus:border-[#D94854] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          </div>
        </div>

        {/* Punto de Venta */}
        <div>
          <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Punto de venta
          </label>
          <select
            value={puntoDeVenta}
            onChange={e => setPuntoDeVenta(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#B695BF] transition-all appearance-none cursor-pointer"
          >
            <option value="TODOS" className="bg-[#212026] text-white">Todas las sucursales</option>
            {puntosDeVenta.map((punto) => (
              <option key={punto} value={punto} className="bg-[#212026] text-white">
                {punto}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Categoría
          </label>
          <select
            value={categoriaSeleccionada}
            onChange={e => setCategoriaSeleccionada(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#B695BF] transition-all appearance-none cursor-pointer"
          >
            <option value="TODAS" className="bg-[#212026] text-white">Todas las categorías</option>
            {categoriasDisponibles.map((categoria) => (
              <option key={categoria} value={categoria} className="bg-[#212026] text-white">
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};