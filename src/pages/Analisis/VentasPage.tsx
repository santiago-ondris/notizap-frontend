import React, { useState } from "react";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import { fetchEvolucionVentas, fetchFechasCompra } from "@/services/analisis/analisisService";

// Componentes modularizados
import { VentasUploadForm } from "@/components/Analisis/ventas/VentasUploadForm";
import { VentasResultados } from "@/components/Analisis/ventas/VentasResultados";
import { AnalisisNavigation } from "@/components/Analisis/AnalisisNavigation";
import { RotateCcw } from "lucide-react";

const VentasPage: React.FC = () => {
  // Estados y hooks
  const {
    setArchivo,
    resultadoVentas,
    setResultadoVentas,
    limpiarResultadoVentas,
  } = useArchivosAnalisis();

  const [loading, setLoading] = useState(false);
  const [fechasCompra, setFechasCompra] = useState<string[]>([]);
  const [archivosLocales, setArchivosLocales] = useState<{
    ventas?: File,
    cabecera?: File,
    detalles?: File,
  }>({});

  // Handler para el upload de archivos
  const handleUpload = async (
    fileVentas: File,
    fileCabecera: File,
    fileDetalles: File
  ) => {
    setLoading(true);
    try {
      // Guardar archivos en el store
      setArchivo("archivoVentasEvolucion", fileVentas);
      setArchivo("archivoEvolucionStockCabecera", fileCabecera);
      setArchivo("archivoEvolucionStockDetalles", fileDetalles);
      setArchivosLocales({ ventas: fileVentas, cabecera: fileCabecera, detalles: fileDetalles });

      // Procesar datos de ventas
      const data = await fetchEvolucionVentas(fileVentas);
      setResultadoVentas(data);

      // Obtener fechas de compra del primer producto
      const primerProducto = data?.productos?.[0]?.nombre;
      if (primerProducto) {
        const fechas = await fetchFechasCompra(fileCabecera, fileDetalles, primerProducto);
        setFechasCompra(fechas);
      }
    } catch (err) {
      alert("Error procesando el archivo. Verifica que sea un Excel válido.");
    } finally {
      setLoading(false);
    }
  };

  // Handler para resetear datos
  const handleReset = () => {
    limpiarResultadoVentas();
    setArchivo("archivoVentasEvolucion", undefined as any);
    setArchivo("archivoEvolucionStockCabecera", undefined as any);
    setArchivo("archivoEvolucionStockDetalles", undefined as any);
    setFechasCompra([]);
    setArchivosLocales({});
  };

  // Callback para cuando el usuario cambia el producto en el selector
  const handleProductoChange = async (producto: string) => {
    if (archivosLocales.cabecera && archivosLocales.detalles && producto) {
      setLoading(true);
      try {
        const fechas = await fetchFechasCompra(
          archivosLocales.cabecera,
          archivosLocales.detalles,
          producto
        );
        setFechasCompra(fechas);
      } catch (err) {
        setFechasCompra([]);
      } finally {
        setLoading(false);
      }
    }
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

        {/* Nuevo analisis */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all flex items-center gap-2 text-white/80 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Nuevo análisis
            </button>
          </div>
        </div>  

        {/* Content */}
        {!resultadoVentas ? (
          <VentasUploadForm 
            onUpload={handleUpload} 
            loading={loading} 
          />
        ) : (
          <VentasResultados
            data={resultadoVentas}
            fechasCompra={fechasCompra}
            onProductoChange={handleProductoChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default VentasPage;