// components/Analisis/AnalisisResultsSection.tsx
import React from "react";
import { AnalisisFiltersPanel } from "./AnalisisFiltersPanel";
import { AnalisisStatsPanel } from "./AnalisisStatsPanel";
import { AnalisisTablePanel } from "./AnalisisTablePanel";

interface AnalisisResultsSectionProps {
  // Data
  resultado: any;
  datosFiltrados: any[];
  datosPaginaRotacion: any[];
  
  // Filter states
  puntoDeVenta: string;
  categoriaSeleccionada: string;
  busqueda: string;
  puntosDeVenta: string[];
  categoriasDisponibles: string[];
  
  // Pagination states
  paginaRotacion: number;
  totalPaginasRotacion: number;
  filasPorPaginaRotacion: number;
  opcionesPorPagina: number[];
  
  // Sort states
  columnaOrden: "comprado" | "vendido" | "rotacion";
  ordenAsc: boolean;
  
  // Handlers
  onFilterChange: {
    setPuntoDeVenta: (value: string) => void;
    setCategoriaSeleccionada: (value: string) => void;
    setBusqueda: (value: string) => void;
    setFilasPorPaginaRotacion: (value: number) => void;
    setPaginaRotacion: (value: number) => void;
  };
  onSortChange: (columna: "comprado" | "vendido" | "rotacion") => void;
}

export const AnalisisResultsSection: React.FC<AnalisisResultsSectionProps> = ({
  resultado,
  datosFiltrados,
  datosPaginaRotacion,
  puntoDeVenta,
  categoriaSeleccionada,
  busqueda,
  puntosDeVenta,
  categoriasDisponibles,
  paginaRotacion,
  totalPaginasRotacion,
  filasPorPaginaRotacion,
  opcionesPorPagina,
  columnaOrden,
  ordenAsc,
  onFilterChange,
  onSortChange
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column - Filters & Stats */}
      <div className="lg:col-span-4 space-y-6">
        {/* Filters */}
        <AnalisisFiltersPanel
          puntoDeVenta={puntoDeVenta}
          setPuntoDeVenta={onFilterChange.setPuntoDeVenta}
          puntosDeVenta={puntosDeVenta}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={onFilterChange.setCategoriaSeleccionada}
          categoriasDisponibles={categoriasDisponibles}
          busqueda={busqueda}
          setBusqueda={onFilterChange.setBusqueda}
        />

        {/* Stats */}
        <AnalisisStatsPanel 
          datosFiltrados={datosFiltrados}
          totalResultados={resultado.rotacion.length}
        />
      </div>

      {/* Right Column - Table */}
      <div className="lg:col-span-8">
        <AnalisisTablePanel
          datosFiltrados={datosFiltrados}
          datosPaginaRotacion={datosPaginaRotacion}
          puntoDeVenta={puntoDeVenta}
          paginaRotacion={paginaRotacion}
          totalPaginasRotacion={totalPaginasRotacion}
          filasPorPaginaRotacion={filasPorPaginaRotacion}
          opcionesPorPagina={opcionesPorPagina}
          columnaOrden={columnaOrden}
          ordenAsc={ordenAsc}
          onSortChange={onSortChange}
          onPaginationChange={{
            setFilasPorPaginaRotacion: onFilterChange.setFilasPorPaginaRotacion,
            setPaginaRotacion: onFilterChange.setPaginaRotacion
          }}
        />
      </div>
    </div>
  );
};