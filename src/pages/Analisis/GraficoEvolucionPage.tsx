import React from "react";
import { Navbar } from "@/components/Landing/Navbar";
import { EvolucionStockForm } from "@/components/Analisis/grafico/EvolucionStockForm";
import { EvolucionStockCharts } from "@/components/Analisis/grafico/EvolucionStockCharts";
import { fetchEvolucionStock } from "@/services/analisis/analisisService";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { LineChart, NotepadTextDashed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis"; // 👈
import type { EvolucionStockRequest } from "@/types/analisis/analisis";

const GraficoEvolucionPage: React.FC = () => {
  const {
    archivos,
    setArchivo,
    resultadoEvolucionStock,
    setResultadoEvolucionStock,
    // limpiarResultadoEvolucionStock,
    fechaEvolucionStock,
  } = useArchivosAnalisis();

  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: EvolucionStockRequest) => {
    setLoading(true);
    setResultadoEvolucionStock(undefined as any); 
    setArchivo("archivoEvolucionStockCabecera", data.archivoCabecera);
    setArchivo("archivoEvolucionStockDetalles", data.archivoDetalles);
    setArchivo("archivoEvolucionStockVentas", data.archivoVentas);
    try {
      const res = await fetchEvolucionStock(data);
      setResultadoEvolucionStock(res);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "No se pudo procesar la evolución de stock. Verifica los archivos y el producto."
      );
    }
    setLoading(false);
  };

  // const handleReset = () => {
  //   limpiarResultadoEvolucionStock();
  //   setArchivo("archivoEvolucionStockCabecera", undefined as any);
  //   setArchivo("archivoEvolucionStockDetalles", undefined as any);
  //   setArchivo("archivoEvolucionStockVentas", undefined as any);
  // };

  return (
    <div className="bg-[#212026] min-h-screen w-full">
      <Navbar onLoginClick={function (): void { throw new Error("Function not implemented."); }} />
      <main className="max-w-6xl mx-auto px-4 pt-8 pb-8">
        <h1 className="text-4xl font-bold text-[#D94854] mb-10 text-center">
          Gráfico de evolución de stock
        </h1>
        <div className="flex justify-center gap-4 mb-8">
          <Button
            className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow"
            onClick={() => navigate("/analisis")}
          >
            <NotepadTextDashed className="w-5 h-5" />
            Volver a tasa de rotación
          </Button>
          <Button
            className="bg-[#51590E] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow"
            onClick={() => navigate("/analisis/ventas")}
          >
            <LineChart className="w-5 h-5" />
            Ver grafico de evolución de ventas
          </Button>
        </div>
        {/* Info de archivos cargados y fecha */}
        {(archivos.archivoEvolucionStockCabecera || archivos.archivoEvolucionStockDetalles || archivos.archivoEvolucionStockVentas) && (
          <div className="mb-4 text-xs text-[#51590E] text-center">
            {archivos.archivoEvolucionStockCabecera && (
              <>Cabecera: <span className="font-semibold">{archivos.archivoEvolucionStockCabecera.name}</span><br /></>
            )}
            {archivos.archivoEvolucionStockDetalles && (
              <>Detalles: <span className="font-semibold">{archivos.archivoEvolucionStockDetalles.name}</span><br /></>
            )}
            {archivos.archivoEvolucionStockVentas && (
              <>Ventas: <span className="font-semibold">{archivos.archivoEvolucionStockVentas.name}</span><br /></>
            )}
            {fechaEvolucionStock && (
              <>Último análisis: {new Date(fechaEvolucionStock).toLocaleString()}</>
            )}
          </div>
        )}
        <EvolucionStockForm onSubmit={handleSubmit} loading={loading} />
        {resultadoEvolucionStock && <EvolucionStockCharts data={resultadoEvolucionStock} />}
      </main>
    </div>
  );
};

export default GraficoEvolucionPage;
