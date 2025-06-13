import { useState } from "react";
import { processExcel, saveExcelAnalysis } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { 
  FileSpreadsheet, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Save, 
  Upload, 
  Palette,
  Package,
  Loader2,
  Hash
} from "lucide-react";

type TopProducto = {
  modeloColor: string;
  cantidad: number;
};

export default function ExcelProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [top, setTop] = useState(10);
  const [preview, setPreview] = useState<TopProducto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Handler para previsualizar el excel
  const handlePreview = async () => {
    if (!file) return toast.error("Seleccioná un archivo Excel");
    setLoading(true);
    try {
      const resp = await processExcel(file, top);
      setPreview(resp.data);
      toast.success("Previsualización generada");
    } catch {
      toast.error("Error al procesar el archivo");
    } finally {
      setLoading(false);
    }
  };

  // Handler para guardar el análisis en BD
  const handleGuardar = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await saveExcelAnalysis(file, year, month);
      toast.success("Análisis guardado correctamente");
      setPreview(null);
      setFile(null);
    } catch {
      toast.error("No se pudo guardar el análisis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-center gap-2 mb-6">
        <FileSpreadsheet className="w-5 h-5 text-[#51590E]" />
        <h2 className="text-xl font-semibold text-white">📊 Procesar Top Productos (Excel)</h2>
      </div>

      {/* Sección de carga de archivo */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-4 h-4 text-[#51590E]" />
          <h3 className="text-sm font-medium text-white">📁 Archivo Excel</h3>
        </div>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#51590E]/20 file:text-[#51590E] hover:file:bg-[#51590E]/30"
          />
          {file && (
            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              <FileSpreadsheet className="w-4 h-4 text-[#51590E]" />
              <span>Archivo seleccionado: {file.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuración de parámetros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
            <TrendingUp className="w-4 h-4" />
            Top productos
          </label>
          <input
            type="number"
            value={top}
            onChange={e => setTop(Number(e.target.value))}
            min={1}
            max={50}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white text-center placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
            <Calendar className="w-4 h-4" />
            Año
          </label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            min={2022}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white text-center placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
            <Calendar className="w-4 h-4" />
            Mes
          </label>
          <input
            type="number"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            min={1}
            max={12}
            className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white text-center placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          className="bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || !file}
          onClick={handlePreview}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Previsualizar
            </>
          )}
        </button>
        
        {preview && (
          <button
            type="button"
            className="bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            disabled={loading}
            onClick={handleGuardar}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar análisis
              </>
            )}
          </button>
        )}
      </div>

      {/* Previsualización de resultados */}
      {preview && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          {/* Header de la tabla de resultados */}
          <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#51590E]" />
              <h3 className="text-lg font-semibold text-white">
                🎨 Top {top} productos por color
              </h3>
              <span className="ml-auto bg-[#51590E]/20 text-[#51590E] px-3 py-1 rounded-lg text-sm font-medium">
                {preview.length} productos
              </span>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Hash className="w-4 h-4" />
                      Posición
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Package className="w-4 h-4" />
                      Modelo + Color
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                      <TrendingUp className="w-4 h-4" />
                      Cantidad
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {preview.map((prod, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-white/5 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`
                          inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                          ${idx < 3 
                            ? 'bg-[#51590E]/30 text-[#51590E]' 
                            : 'bg-white/10 text-white/70'
                          }
                        `}>
                          {idx + 1}
                        </span>
                        {idx === 0 && <span className="text-lg">🥇</span>}
                        {idx === 1 && <span className="text-lg">🥈</span>}
                        {idx === 2 && <span className="text-lg">🥉</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium group-hover:text-[#51590E] transition-colors">
                        {prod.modeloColor}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[#51590E] font-bold text-lg">
                        {prod.cantidad.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer con estadísticas */}
          <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/60">
                Productos analizados: <span className="text-white font-medium">{preview.length}</span>
              </span>
              <span className="text-white/60">
                Total cantidad: <span className="text-[#51590E] font-semibold">
                  {preview.reduce((sum, p) => sum + p.cantidad, 0).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}