import React, { useState } from "react";
import { VentasUploadForm } from "@/components/Analisis/ventas/VentasUploadForm";
import { VentasResultados } from "@/components/Analisis/ventas/VentasResultados";
import { fetchEvolucionVentas, fetchFechasCompra } from "@/services/analisis/analisisService";
import { Loader, FileUp, NotepadTextDashed, FileArchive, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";

const VentasPage: React.FC = () => {
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

  const handleUpload = async (
    fileVentas: File,
    fileCabecera: File,
    fileDetalles: File
  ) => {
    setLoading(true);
    try {
      setArchivo("archivoVentasEvolucion", fileVentas);
      setArchivo("archivoEvolucionStockCabecera", fileCabecera);
      setArchivo("archivoEvolucionStockDetalles", fileDetalles);
      setArchivosLocales({ ventas: fileVentas, cabecera: fileCabecera, detalles: fileDetalles });

      const data = await fetchEvolucionVentas(fileVentas);
      setResultadoVentas(data);

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

  const handleReset = () => {
    limpiarResultadoVentas();
    setArchivo("archivoVentasEvolucion", undefined as any);
    setArchivo("archivoEvolucionStockCabecera", undefined as any);
    setArchivo("archivoEvolucionStockDetalles", undefined as any);
    setFechasCompra([]);
    setArchivosLocales({});
  };

  // Callback para cuando el usuario cambia el producto en el selector:
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
    <div className="max-w-5xl w-full mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-[#D94854] text-center flex flex-col items-center gap-2 mb-8">
        <span className="flex items-center gap-2">
          <FileUp className="w-8 h-8 text-[#D94854]" />
          Análisis de Ventas Diarias
        </span>
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
          onClick={() => navigate("/analisis/grafico")}
        >
          <LineChart className="w-5 h-5" />
          Ver gráfico de evolución de stock
        </Button>
      </div>
      <Button
        onClick={handleReset}
        className="bg-[#B695BF] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2"
      >
        <FileArchive className="w-5 h-5" />
        Subir otro archivo
      </Button>
      {/* Mostramos nombre de archivo y fecha si hay */}
      {archivos.archivoVentasEvolucion && (
        <div className="mb-4 text-sm text-[#51590E] text-center">
          Archivo cargado: <span className="font-semibold">{archivos.archivoVentasEvolucion.name}</span>
          {fechaVentas && (
            <>
              <br />
              Último análisis: {new Date(fechaVentas).toLocaleString()}
            </>
          )}
        </div>
      )}

      {!resultadoVentas ? (
        <VentasUploadForm onUpload={handleUpload} loading={loading} />
      ) : (
        <div>
          <VentasResultados
            data={resultadoVentas}
            fechasCompra={fechasCompra}
            onProductoChange={handleProductoChange}
          />
        </div>
      )}
      {loading && <Loader className="animate-spin mx-auto mt-6" />}
    </div>
  );
};

export default VentasPage;
