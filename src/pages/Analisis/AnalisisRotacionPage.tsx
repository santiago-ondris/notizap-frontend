import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import AnalisisRotacionForm from "@/components/Analisis/rotacion/AnalisisRotacionForm";
import { VentasSinComprasTable } from "@/components/Analisis/rotacion/VentasSinComprasTable";
import { Navbar } from "@/components/Landing/Navbar";
import { Button } from "@/components/ui/button";
import { 
  agruparRotacionPorProductoColor, 
  filtrarRotacionPorSucursal, 
  ordenarRotacion 
} from "@/utils/analisis/analisisRotacion";
import { paginarArray, calcularTotalPaginas } from "@/utils/paginacion";
import { RotacionTable } from "@/components/Analisis/rotacion/RotacionTable";
import { LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";

const opcionesPorPagina = [15, 30, 50, 100];

const AnalisisRotacionPage: React.FC = () => {
  // Estado principal
  const { resultado, setResultado } = useArchivosAnalisis();
  const [isLoading, setIsLoading] = useState(false);
  const [puntoDeVenta, setPuntoDeVenta] = useState<string>("TODOS");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("TODAS");
  const [busqueda, setBusqueda] = useState<string>("");

  const navigate = useNavigate();

  // Paginación tabla de rotación
  const [paginaRotacion, setPaginaRotacion] = useState(1);
  const [filasPorPaginaRotacion, setFilasPorPaginaRotacion] = useState(15);

  // Paginación productos vendidos sin compras
  const [mostrarVentasSinCompras, setMostrarVentasSinCompras] = useState(false);
  const [paginaVSC, setPaginaVSC] = useState(1);
  const [filasPorPaginaVSC, setFilasPorPaginaVSC] = useState(15);

  // Orden
  const [columnaOrden, setColumnaOrden] = useState<"comprado" | "vendido" | "rotacion">("comprado");
  const [ordenAsc, setOrdenAsc] = useState(false);

  // Cambia columna y sentido de orden
  const cambiarOrden = (columna: "comprado" | "vendido" | "rotacion") => {
    if (columnaOrden === columna) {
      setOrdenAsc((a) => !a);
    } else {
      setColumnaOrden(columna);
      setOrdenAsc(false);
    }
  };

  // Sucursales únicas
  const puntosDeVenta = resultado
    ? Array.from(new Set(resultado.rotacion.map((r) => r.puntoDeVenta)))
    : [];
    
  const categoriasDisponibles = resultado
    ? Array.from(new Set(resultado.rotacion.map((r) => r.categoria || "Sin Categoría"))).sort()
    : [];

  // Cambio de sucursal
  const handleSucursalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPuntoDeVenta(e.target.value);
    setBusqueda("");
    setPaginaRotacion(1);
  };

  // Cambio de filas por página
  const handleFilasChangeRotacion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilasPorPaginaRotacion(Number(e.target.value));
    setPaginaRotacion(1);
  };

  // Procesamiento de datos usando utils
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

  return (
    <div className="bg-[#212026] min-h-screen w-full">
      <Navbar
        onLoginClick={() => { throw new Error("Function not implemented."); }}
      />
      <main className="max-w-6xl mx-auto px-4 pt-8 pb-8">
        <h1 className="text-4xl font-bold text-[#D94854] mb-10 text-center">
          Análisis de Rotación de Productos
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow"
            onClick={() => navigate("/analisis/grafico")}
          >
            <LineChart className="w-5 h-5" />
            Ver gráfico de evolución de stock
          </Button>
          <Button
            className="bg-[#51590E] hover:bg-[#B695BF] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow"
            onClick={() => navigate("/analisis/ventas")}
          >
            <LineChart className="w-5 h-5" />
            Ver gráfico de evolución de ventas
          </Button>
        </div>

        {/* Formulario de carga */}
        <AnalisisRotacionForm
          onSuccess={setResultado}
          loading={isLoading}
          setLoading={setIsLoading}
        />

        {/* Botón de productos vendidos sin compras */}
        {resultado && resultado.ventasSinCompras.length > 0 && (
          <div className="flex flex-col items-center gap-2 mt-6 mb-6">
            <Button
              variant="default"
              className="bg-[#D94854] text-white hover:bg-[#F23D5E] shadow-none"
              onClick={() => setMostrarVentasSinCompras((prev) => !prev)}
            >
              {mostrarVentasSinCompras
                ? "Ocultar productos vendidos sin compras"
                : "Ver productos vendidos sin compras"}
            </Button>
            {mostrarVentasSinCompras && (
              <VentasSinComprasTable
                ventasSinCompras={resultado.ventasSinCompras}
                pagina={paginaVSC}
                setPagina={setPaginaVSC}
                filasPorPagina={filasPorPaginaVSC}
                setFilasPorPagina={setFilasPorPaginaVSC}
              />
            )}
          </div>
        )}

        {resultado && (
          <section className="space-y-6 mt-8">
            <Card className="bg-[#ffffff] p-6 flex flex-col md:flex-row md:items-center gap-4 shadow-none border-none">
              {/* Selector de sucursal */}
              <div>
                <label className="font-semibold text-[#212026]">Sucursal:</label>
                <select
                  className="ml-2 p-1 rounded-md border"
                  value={puntoDeVenta}
                  onChange={handleSucursalChange}
                  style={{ color: "#212026" }}
                >
                  <option value="TODOS">Todas</option>
                  {puntosDeVenta.map((suc) => (
                    <option key={suc} value={suc}>
                      {suc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-[#212026]">Categoría:</label>
                <select
                  className="ml-2 p-1 rounded-md border"
                  value={categoriaSeleccionada}
                  onChange={(e) => {
                    setCategoriaSeleccionada(e.target.value);
                    setPaginaRotacion(1); // opcional: volver a página 1 al filtrar
                  }}
                  style={{ color: "#212026" }}
                >
                  <option value="TODAS">Todas</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {/* Búsqueda */}
              <div className="flex-1">
                <input
                  type="text"
                  className="p-2 border rounded-md w-full"
                  placeholder="Buscar producto o color..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ color: "#212026" }}
                />
              </div>
            </Card>

            {/* Controles de paginación para la tabla principal */}
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2 px-4 pt-4">
              <div>
                <label className="font-medium mr-1 text-[#ffffff]">Filas por página:</label>
                <select
                  className="border rounded px-2 py-1 bg-white text-[#212026]"
                  value={filasPorPaginaRotacion}
                  onChange={handleFilasChangeRotacion}
                >
                  {opcionesPorPagina.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="mr-2 text-[#51590E]">
                  Página {paginaRotacion} de {totalPaginasRotacion}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-1 border-[#51590E] text-[#51590E] hover:bg-[#B695BF] hover:border-[#D94854]"
                  onClick={() => setPaginaRotacion(Math.max(1, paginaRotacion - 1))}
                  disabled={paginaRotacion === 1}
                >
                  {"<"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#51590E] text-[#51590E] hover:bg-[#B695BF] hover:border-[#D94854]"
                  onClick={() => setPaginaRotacion(Math.min(totalPaginasRotacion, paginaRotacion + 1))}
                  disabled={paginaRotacion === totalPaginasRotacion}
                >
                  {">"}
                </Button>
              </div>
            </div>

            {/* Tabla principal como componente modular */}
            <Card className="bg-[#ffffff] p-0 rounded-2xl border-none shadow-none">
              <RotacionTable
                datos={datosPaginaRotacion}
                puntoDeVenta={puntoDeVenta}
                columnaOrden={columnaOrden}
                ordenAsc={ordenAsc}
                cambiarOrden={cambiarOrden}
              />
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default AnalisisRotacionPage;
