import React, { useEffect, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle, BarChart3, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis";
import { getProductosDeCompras } from "@/utils/analisis/getProductosDeCompras";
import { type ProductoBase, type EvolucionStockRequest } from "@/types/analisis/analisis";

interface EvolucionUploadFormProps {
  onSubmit: (data: EvolucionStockRequest) => void;
  loading: boolean;
  archivosInfo: {
    cabecera: File | null;
    detalles: File | null;
    ventas: File | null;
    fecha: string | null;
  };
}

export const EvolucionUploadForm: React.FC<EvolucionUploadFormProps> = ({
  onSubmit,
  loading,
  archivosInfo
}) => {
  const { archivos, setArchivo } = useArchivosAnalisis();
  const [producto, setProducto] = useState<string>("");
  const [productos, setProductos] = useState<ProductoBase[]>([]);
  const [buscandoProductos, setBuscandoProductos] = useState(false);

  // Efecto para buscar productos cuando se carga el archivo de detalles
  useEffect(() => {
    if (archivos.archivoEvolucionStockDetalles && productos.length === 0) {
      setBuscandoProductos(true);
      getProductosDeCompras(archivos.archivoEvolucionStockDetalles)
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setBuscandoProductos(false));
    }
  }, [archivos.archivoEvolucionStockDetalles]);

  // Handlers para cambios de archivos
  const handleDetallesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setArchivo("archivoEvolucionStockDetalles", file);
      setProductos([]);
      setProducto("");
      setBuscandoProductos(true);
      try {
        const prods = await getProductosDeCompras(file);
        setProductos(prods);
      } catch (err) {
        alert(
          "No se pudo leer productos del archivo de compras. ¿Seguro que seleccionaste el archivo correcto?"
        );
      }
      setBuscandoProductos(false);
    }
  };

  const handleCabeceraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setArchivo("archivoEvolucionStockCabecera", file);
  };

  const handleVentasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setArchivo("archivoEvolucionStockVentas", file);
  };

  // Handler del submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !archivos.archivoEvolucionStockCabecera ||
      !archivos.archivoEvolucionStockDetalles ||
      !archivos.archivoEvolucionStockVentas ||
      !producto
    ) {
      alert("Completa todos los campos y selecciona un producto");
      return;
    }
    onSubmit({
      archivoCabecera: archivos.archivoEvolucionStockCabecera,
      archivoDetalles: archivos.archivoEvolucionStockDetalles,
      archivoVentas: archivos.archivoEvolucionStockVentas,
      producto,
    });
  };

  // Configuración de los uploads
  const uploadConfigs = [
    {
      id: "ventas-upload",
      file: archivos.archivoEvolucionStockVentas,
      title: "Archivo de Ventas",
      description: "Datos de ventas en formato .xlsx",
      icon: FileText,
      color: "#D94854",
      onChange: handleVentasChange
    },
    {
      id: "cabecera-upload", 
      file: archivos.archivoEvolucionStockCabecera,
      title: "Compras - Cabecera",
      description: "Cabecera de compras .xlsx",
      icon: FileText,
      color: "#B695BF",
      onChange: handleCabeceraChange
    },
    {
      id: "detalles-upload",
      file: archivos.archivoEvolucionStockDetalles,
      title: "Compras - Detalle",
      description: "Detalle de compras .xlsx",
      icon: FileText,
      color: "#51590E",
      onChange: handleDetallesChange
    }
  ];

  const allFilesUploaded = archivos.archivoEvolucionStockCabecera && 
                          archivos.archivoEvolucionStockDetalles && 
                          archivos.archivoEvolucionStockVentas;

  return (
    <div className="space-y-6">
      {/* Info de archivos anteriores */}
      {(archivosInfo.cabecera || archivosInfo.detalles || archivosInfo.ventas) && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B695BF]" />
            Archivos cargados anteriormente
          </h3>
          <div className="text-white/60 text-xs space-y-1">
            {archivosInfo.cabecera && (
              <div>Cabecera: <span className="font-semibold text-[#B695BF]">{archivosInfo.cabecera.name}</span></div>
            )}
            {archivosInfo.detalles && (
              <div>Detalles: <span className="font-semibold text-[#51590E]">{archivosInfo.detalles.name}</span></div>
            )}
            {archivosInfo.ventas && (
              <div>Ventas: <span className="font-semibold text-[#D94854]">{archivosInfo.ventas.name}</span></div>
            )}
            {archivosInfo.fecha && (
              <div>Último análisis: <span className="font-semibold text-white/80">{new Date(archivosInfo.fecha).toLocaleString()}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Formulario principal */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#51590E]/20 to-[#B695BF]/20 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#B695BF]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Cargar archivos y seleccionar producto
            </h2>
            <p className="text-white/60">
              Sube los archivos necesarios y selecciona el producto para analizar su evolución
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
                        onChange={config.onChange}
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

            {/* Product Selector */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-[#B695BF]" />
                Seleccionar producto a analizar
              </h3>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    list="productos-list"
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-[#51590E] transition-all"
                    placeholder="Buscar producto base..."
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    disabled={productos.length === 0}
                    autoComplete="off"
                  />
                  <datalist id="productos-list">
                    {productos.map((p) => (
                      <option key={p.codigo} value={p.nombre} />
                    ))}
                  </datalist>
                </div>
                
                {buscandoProductos && (
                  <div className="flex items-center gap-2 text-[#B695BF] text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando productos en el archivo...
                  </div>
                )}
                
                {productos.length === 0 && !buscandoProductos && (
                  <div className="text-white/60 text-sm">
                    Selecciona un archivo de detalles de compras para buscar productos.
                  </div>
                )}
                
                {productos.length > 0 && (
                  <div className="text-[#51590E] text-sm">
                    {productos.length} productos disponibles para análisis
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                disabled={loading || buscandoProductos || !allFilesUploaded || !producto}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
                  ${loading || buscandoProductos || !allFilesUploaded || !producto
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#51590E] to-[#B695BF] hover:from-[#B695BF] hover:to-[#51590E] text-white shadow-lg hover:shadow-[#B695BF]/25 hover:scale-105'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Procesando evolución...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-6 h-6" />
                    Generar evolución de stock
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};