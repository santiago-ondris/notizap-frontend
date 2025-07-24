import React from "react";
import { toast } from "react-toastify";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import { fetchEvolucionStock } from "@/services/analisis/analisisService";
import type { EvolucionStockRequest } from "@/types/analisis/analisis";

// Componentes modularizados
import { EvolucionUploadForm } from "@/components/Analisis/grafico/EvolucionUploadForm";
import { EvolucionChartsSection } from "@/components/Analisis/grafico/EvolucionChartsSection";
import { AnalisisNavigation } from "@/components/Analisis/AnalisisNavigation";

const GraficoEvolucionPage: React.FC = () => {
  // Estados y hooks
  const {
    archivos,
    setArchivo,
    resultadoEvolucionStock,
    setResultadoEvolucionStock,
    fechaEvolucionStock,
  } = useArchivosAnalisis();

  const [loading, setLoading] = React.useState(false);

  // Handler para el submit del formulario
  const handleSubmit = async (data: EvolucionStockRequest) => {
    setLoading(true);
    setResultadoEvolucionStock(undefined as any); 
    
    // Guardar archivos en el store
    setArchivo("archivoEvolucionStockCabecera", data.archivoCabecera);
    setArchivo("archivoEvolucionStockDetalles", data.archivoDetalles);
    setArchivo("archivoEvolucionStockVentas", data.archivoVentas);
    
    try {
      const res = await fetchEvolucionStock(data);
      setResultadoEvolucionStock(res);
      toast.success("¡Evolución de stock generada correctamente!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "No se pudo procesar la evolución de stock. Verifica los archivos y el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  // Información de archivos para mostrar
  const archivosInfo = {
    cabecera: archivos.archivoEvolucionStockCabecera ?? null,
    detalles: archivos.archivoEvolucionStockDetalles ?? null,
    ventas: archivos.archivoEvolucionStockVentas ?? null,
    fecha: fechaEvolucionStock ?? null
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
        <div className="flex justify-center">
          <AnalisisNavigation />
        </div>

        {/* Upload Form */}
        <EvolucionUploadForm 
          onSubmit={handleSubmit}
          loading={loading}
          archivosInfo={archivosInfo}
        />

        {/* Charts Section */}
        {resultadoEvolucionStock && (
          <EvolucionChartsSection data={resultadoEvolucionStock} />
        )}
      </div>
    </div>
  );
};

export default GraficoEvolucionPage;