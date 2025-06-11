import React from "react";
import { Upload, FileText, Loader2, X, CheckCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import api from "@/api/api";

interface AnalisisUploadSectionProps {
  onSuccess: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AnalisisUploadSection: React.FC<AnalisisUploadSectionProps> = ({
  onSuccess,
  isLoading,
  setIsLoading,
}) => {
  const { archivos, setArchivo, limpiarArchivos } = useArchivosAnalisis();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "cabecera" | "detalle" | "ventas"
  ) => {
    const file = e.target.files?.[0];
    if (file && !file.name.endsWith(".xlsx")) {
      toast.error("Solo se permiten archivos .xlsx");
      e.target.value = "";
      return;
    }
    if (file) setArchivo(tipo, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivos.cabecera || !archivos.detalle || !archivos.ventas) {
      toast.error("Debes cargar los 3 archivos requeridos.");
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append("ArchivoComprasCabecera", archivos.cabecera);
    formData.append("ArchivoComprasDetalles", archivos.detalle);
    formData.append("ArchivoVentas", archivos.ventas);

    try {
      const res = await api.post(
        "/api/v1/analisis/rotacion",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("¡Análisis realizado correctamente!");
      onSuccess(res.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Error al procesar el análisis. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fileCabecera = archivos.cabecera || null;
  const fileDetalle = archivos.detalle || null;
  const fileVentas = archivos.ventas || null;
  const allFilesUploaded = fileCabecera && fileDetalle && fileVentas;

  const uploadConfigs = [
    {
      id: "ventas-upload",
      tipo: "ventas" as const,
      file: fileVentas,
      title: "Archivo de Ventas",
      description: "Datos de ventas en formato .xlsx",
      icon: FileText,
      color: "#D94854",
      hoverColor: "#F23D5E"
    },
    {
      id: "cabecera-upload", 
      tipo: "cabecera" as const,
      file: fileCabecera,
      title: "Compras - Cabecera",
      description: "Cabecera de compras .xlsx",
      icon: FileText,
      color: "#B695BF",
      hoverColor: "#B695BF"
    },
    {
      id: "detalle-upload",
      tipo: "detalle" as const, 
      file: fileDetalle,
      title: "Compras - Detalle",
      description: "Detalle de compras .xlsx",
      icon: FileText,
      color: "#51590E",
      hoverColor: "#51590E"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#51590E]/20 to-[#B695BF]/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-[#B695BF]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Cargar archivos para análisis
          </h2>
          <p className="text-white/60">
            Sube los archivos de ventas y compras en formato .xlsx para comenzar el análisis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uploadConfigs.map((config) => (
              <div key={config.id} className="relative">
                <div className={`
                  p-6 rounded-xl border-2 border-dashed transition-all
                  ${config.file 
                    ? `border-[${config.color}] bg-[${config.color}]/10` 
                    : `border-white/20 hover:border-[${config.color}]/50 hover:bg-white/5`
                  }
                `}>
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-[${config.color}]/20 flex items-center justify-center`}>
                      <config.icon className="w-6 h-6" style={{ color: config.color }} />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{config.title}</h3>
                    <p className="text-white/60 text-sm mb-4">{config.description}</p>
                    
                    <input
                      type="file"
                      accept=".xlsx"
                      onChange={e => handleFileChange(e, config.tipo)}
                      disabled={isLoading}
                      className="hidden"
                      id={config.id}
                    />
                    <label
                      htmlFor={config.id}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                        ${isLoading 
                          ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                          : `bg-[${config.color}] hover:bg-[${config.hoverColor}] text-white hover:scale-105`
                        }
                      `}
                      style={{
                        backgroundColor: isLoading ? undefined : config.color
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          (e.target as HTMLElement).style.backgroundColor = config.hoverColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          (e.target as HTMLElement).style.backgroundColor = config.color;
                        }
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Seleccionar archivo
                    </label>
                    
                    {config.file && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" style={{ color: config.color }} />
                        <span className="text-sm font-medium truncate max-w-32" style={{ color: config.color }}>
                          {config.file.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading || !allFilesUploaded}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
                ${isLoading || !allFilesUploaded
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D94854] to-[#F23D5E] hover:from-[#F23D5E] hover:to-[#D94854] text-white shadow-lg hover:shadow-[#D94854]/25 hover:scale-105'
                }
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Procesando análisis...
                </>
              ) : (
                <>
                  <BarChart3 className="w-6 h-6" />
                  Analizar rotación de productos
                </>
              )}
            </Button>

            {allFilesUploaded && !isLoading && (
              <Button
                type="button"
                onClick={limpiarArchivos}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-white/20 hover:border-white/40"
              >
                <X className="w-4 h-4" />
                Limpiar selección
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};