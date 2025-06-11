// components/Analisis/ventas/VentasUploadForm.tsx
import React from "react";
import { Upload, FileText, Loader2, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VentasUploadFormProps {
  onUpload: (fileVentas: File, fileCabecera: File, fileDetalles: File) => void;
  loading: boolean;
}

export const VentasUploadForm: React.FC<VentasUploadFormProps> = ({ onUpload, loading }) => {
  const [fileVentas, setFileVentas] = React.useState<File | null>(null);
  const [fileCabecera, setFileCabecera] = React.useState<File | null>(null);
  const [fileDetalles, setFileDetalles] = React.useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileVentas && fileCabecera && fileDetalles) {
      onUpload(fileVentas, fileCabecera, fileDetalles);
    }
  };

  // Configuración de los uploads
  const uploadConfigs = [
    {
      id: "ventas-upload",
      file: fileVentas,
      setFile: setFileVentas,
      title: "Archivo de Ventas",
      description: "Datos de ventas diarias .xlsx",
      icon: FileText,
      color: "#D94854"
    },
    {
      id: "cabecera-upload", 
      file: fileCabecera,
      setFile: setFileCabecera,
      title: "Compras - Cabecera",
      description: "Cabecera de compras .xlsx",
      icon: FileText,
      color: "#B695BF"
    },
    {
      id: "detalles-upload",
      file: fileDetalles,
      setFile: setFileDetalles,
      title: "Compras - Detalle",
      description: "Detalle de compras .xlsx",
      icon: FileText,
      color: "#51590E"
    }
  ];

  const allFilesUploaded = fileVentas && fileCabecera && fileDetalles;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D94854]/20 to-[#F23D5E]/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-[#D94854]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Cargar archivos para análisis de ventas
          </h2>
          <p className="text-white/60">
            Sube los archivos de ventas y compras para generar el análisis comparativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Cards */}
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
                      onChange={e => config.setFile(e.target.files?.[0] || null)}
                      disabled={loading}
                      className="hidden"
                      id={config.id}
                    />
                    <label
                      htmlFor={config.id}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all
                        ${loading 
                          ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                          : 'text-white hover:scale-105'
                        }
                      `}
                      style={{
                        backgroundColor: loading ? undefined : config.color
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

          {/* Información sobre los archivos */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4">¿Qué archivos necesitas?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="text-[#D94854] font-medium">📊 Archivo de Ventas</div>
                <div className="text-white/70 text-xs">
                  Contiene las ventas diarias por producto, sucursal y color para generar las gráficas de evolución
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[#B695BF] font-medium">📋 Cabecera de Compras</div>
                <div className="text-white/70 text-xs">
                  Información general de las compras para identificar fechas de reposición de stock
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[#51590E] font-medium">📝 Detalle de Compras</div>
                <div className="text-white/70 text-xs">
                  Detalle específico de productos comprados para correlacionar con las ventas
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={loading || !allFilesUploaded}
              className={`
                flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
                ${loading || !allFilesUploaded
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#D94854] to-[#F23D5E] hover:from-[#F23D5E] hover:to-[#D94854] text-white shadow-lg hover:shadow-[#D94854]/25 hover:scale-105'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Procesando análisis de ventas...
                </>
              ) : (
                <>
                  <TrendingUp className="w-6 h-6" />
                  Analizar evolución de ventas
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};