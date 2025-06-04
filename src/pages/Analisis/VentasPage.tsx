import React, { useState } from "react";
import { VentasUploadForm } from "@/components/Analisis/ventas/VentasUploadForm";
import { VentasResultados } from "@/components/Analisis/ventas/VentasResultados";
import { fetchEvolucionVentas } from "@/services/analisis/analisisService";
import { Loader, FileUp, NotepadTextDashed, FileArchive } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const VentasPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const data = await fetchEvolucionVentas(file);
      setResult(data);
    } catch (err) {
      alert("Error procesando el archivo. Verifica que sea un Excel válido.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setResult(null);

  return (
     <div className="max-w-5xl w-full mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold text-[#D94854] text-center flex flex-col items-center gap-2 mb-8">
        <span className="flex items-center gap-2">
            <FileUp className="w-8 h-8 text-[#D94854]" />
            Análisis de Ventas Diarias
        </span>
        </h1>
        <div className="flex justify-center mb-8">
          <Button
            className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2"
            onClick={() => navigate("/analisis")}
          >
            <NotepadTextDashed className="w-5 h-5" />
            Volver a tasa de rotación
          </Button>
          <Button onClick={handleReset} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">
            <FileArchive className="w-5 h-5" />    
              Subir otro archivo
          </Button>
        </div>
        {!result ? (
          <VentasUploadForm onUpload={handleUpload} loading={loading} />
        ) : (
          <div>
            <VentasResultados data={result} />
          </div>
        )}
        {loading && <Loader className="animate-spin mx-auto mt-6" />}
      </div>
  );
};

export default VentasPage;
