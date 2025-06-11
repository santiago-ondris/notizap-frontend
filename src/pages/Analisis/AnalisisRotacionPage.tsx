// AnalisisRotacionPage.tsx - Componente principal (reducido a ~100 líneas)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import { 
  agruparRotacionPorProductoColor, 
  filtrarRotacionPorSucursal, 
  ordenarRotacion 
} from "@/utils/analisis/analisisRotacion";
import { paginarArray, calcularTotalPaginas } from "@/utils/paginacion";

// Componentes modularizados
import { AnalisisPageHeader } from "@/components/Analisis/rotacion/AnalisisPageHeader";
import { AnalisisUploadSection } from "@/components/Analisis/rotacion/AnalisisUploadSection";
import { AnalisisResultsSection } from "@/components/Analisis/rotacion/AnalisisResultsSection";

const opcionesPorPagina = [15, 30, 50, 100];

const AnalisisRotacionPage: React.FC = () => {
  // Estados principales
  const { resultado, setResultado } = useArchivosAnalisis();
  const [isLoading, setIsLoading] = useState(false);
  const [puntoDeVenta, setPuntoDeVenta] = useState<string>("TODOS");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("TODAS");
  const [busqueda, setBusqueda] = useState<string>("");
  const [paginaRotacion, setPaginaRotacion] = useState(1);
  const [filasPorPaginaRotacion, setFilasPorPaginaRotacion] = useState(15);
  const [columnaOrden, setColumnaOrden] = useState<"comprado" | "vendido" | "rotacion">("comprado");
  const [ordenAsc, setOrdenAsc] = useState(false);

  const navigate = useNavigate();

  // Lógica de negocio
  const cambiarOrden = (columna: "comprado" | "vendido" | "rotacion") => {
    if (columnaOrden === columna) {
      setOrdenAsc((a) => !a);
    } else {
      setColumnaOrden(columna);
      setOrdenAsc(false);
    }
  };

  // Datos derivados
  const puntosDeVenta = resultado
    ? Array.from(new Set(resultado.rotacion.map((r) => r.puntoDeVenta)))
    : [];
    
  const categoriasDisponibles = resultado
    ? Array.from(new Set(resultado.rotacion.map((r) => r.categoria || "Sin Categoría"))).sort()
    : [];

  // Procesamiento de datos
  let datosFiltrados: any[] = [];
  if (resultado) {
    let filtrados =
      puntoDeVenta === "TODOS"
        ? agruparRotacionPorProductoColor(resultado.rotacion, busqueda)
        : filtrarRotacionPorSucursal(resultado.rotacion, busqueda, puntoDeVenta);
  
    datosFiltrados = ordenarRotacion(filtrados, columnaOrden, ordenAsc);
    if (categoriaSeleccionada !== "TODAS") {
      datosFiltrados = datosFiltrados.filter(
        (item) => (item.categoria || "Sin Categoría") === categoriaSeleccionada
      );
    }
  }

  const totalPaginasRotacion = calcularTotalPaginas(
    datosFiltrados.length,
    filasPorPaginaRotacion
  );
  const datosPaginaRotacion = paginarArray(
    datosFiltrados,
    paginaRotacion,
    filasPorPaginaRotacion
  );

  // Handlers para pasar a componentes hijos
  const handleFilterChange = {
    setPuntoDeVenta: (value: string) => {
      setPuntoDeVenta(value);
      setBusqueda("");
      setPaginaRotacion(1);
    },
    setCategoriaSeleccionada: (value: string) => {
      setCategoriaSeleccionada(value);
      setPaginaRotacion(1);
    },
    setBusqueda,
    setFilasPorPaginaRotacion: (value: number) => {
      setFilasPorPaginaRotacion(value);
      setPaginaRotacion(1);
    },
    setPaginaRotacion
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <AnalisisPageHeader navigate={navigate} />

        {/* Upload Section */}
        <AnalisisUploadSection 
          onSuccess={setResultado}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {/* Results Section */}
        {resultado && (
          <AnalisisResultsSection
            // Data
            resultado={resultado}
            datosFiltrados={datosFiltrados}
            datosPaginaRotacion={datosPaginaRotacion}
            
            // Filter states
            puntoDeVenta={puntoDeVenta}
            categoriaSeleccionada={categoriaSeleccionada}
            busqueda={busqueda}
            puntosDeVenta={puntosDeVenta}
            categoriasDisponibles={categoriasDisponibles}
            
            // Pagination states
            paginaRotacion={paginaRotacion}
            totalPaginasRotacion={totalPaginasRotacion}
            filasPorPaginaRotacion={filasPorPaginaRotacion}
            opcionesPorPagina={opcionesPorPagina}
            
            // Sort states
            columnaOrden={columnaOrden}
            ordenAsc={ordenAsc}
            
            // Handlers
            onFilterChange={handleFilterChange}
            onSortChange={cambiarOrden}
          />
        )}
      </div>
    </div>
  );
};

export default AnalisisRotacionPage;