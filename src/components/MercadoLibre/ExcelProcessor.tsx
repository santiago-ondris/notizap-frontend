import { useState } from "react";
import { processExcel, saveExcelAnalysis } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";

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
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xl flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-2 text-center">Procesar Top Productos (Excel)</h2>
      <div>
        <label className="block font-medium mb-1 text-center">Archivo Excel</label>
        <input
          type="file"
          accept=".xlsx"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base hover:border-violet-400 outline-none"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Top</label>
          <input
            type="number"
            value={top}
            onChange={e => setTop(Number(e.target.value))}
            min={1}
            max={50}
            className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base hover:border-violet-400 outline-none text-center"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Año</label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            min={2022}
            className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base hover:border-violet-400 outline-none text-center"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Mes</label>
          <input
            type="number"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            min={1}
            max={12}
            className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base hover:border-violet-400 outline-none text-center"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          type="button"
          className="bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2 transition hover:bg-[#ff5482]"
          disabled={loading || !file}
          onClick={handlePreview}
        >
          {loading ? "Procesando..." : "Previsualizar"}
        </button>
        {preview && (
          <button
            type="button"
            className="bg-[#51590E] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2 transition"
            disabled={loading}
            onClick={handleGuardar}
          >
            Guardar análisis
          </button>
        )}
      </div>
      {preview && (
        <div className="w-full">
          <h3 className="text-2xl font-bold mt-8 mb-4 text-center tracking-tight">
            Top {top} productos por color
          </h3>
          <div className="w-full overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow text-center">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-center font-semibold border-b text-base">Modelo + Color</th>
                  <th className="px-6 py-3 text-center font-semibold border-b text-base">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((prod, idx) => (
                  <tr key={idx} className="border-t hover:bg-violet-50 transition">
                    <td className="px-6 py-2 text-center">{prod.modeloColor}</td>
                    <td className="px-6 py-2 text-center font-semibold">{prod.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
