import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import { fetchEvolucionVentas, fetchFechasCompra } from "@/services/analisis/analisisService";

// Componentes modularizados
import { VentasPageHeader } from "@/components/Analisis/ventas/VentasPageHeader";
import { VentasUploadForm } from "@/components/Analisis/ventas/VentasUploadForm";
import { VentasResultados } from "@/components/Analisis/ventas/VentasResultados";

const VentasPage: React.FC = () => {
  // Estados y hooks
  const {
    archivos,
    setArchivo,
    resultadoVentas,
    setResultadoVentas,
    limpiarResultadoVentas,
    fechaVentas,
  } = useArchivosAnalisis();

  const [loading, setLoading] = useState(false);
  const [fechasCompra, setFechasCompra] = useState<string[]>([]);
  const [archivosLocales, setArchivosLocales] = useState<{
    ventas?: File,
    cabecera?: File,
    detalles?: File,
  }>({});

  const navigate = useNavigate();

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

  // Información de archivos para mostrar
  const archivosInfo = {
    ventas: archivos.archivoVentasEvolucion || null,
    fecha: fechaVentas || null
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
        <VentasPageHeader 
          navigate={navigate}
          onReset={handleReset}
          archivosInfo={archivosInfo}
        />

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