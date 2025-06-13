import { useState } from "react";
import { createManualReport } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { 
  Calendar, 
  Package, 
  DollarSign, 
  FileText, 
  Loader2,
  TrendingUp 
} from "lucide-react";

export default function ReporteManualForm() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [unitsSold, setUnitsSold] = useState("");
  const [revenue, setRevenue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createManualReport({
        year,
        month,
        unitsSold: Number(unitsSold),
        revenue: Number(revenue)
      });
      toast.success("Informe guardado correctamente");
      setUnitsSold("");
      setRevenue("");
    } catch (err: any) {
      toast.error("Error al guardar el informe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-[#51590E]" />
        <h2 className="text-xl font-semibold text-white">📋 Cargar Informe Manual de Ventas</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos de fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              max={2100}
              required
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
              required
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white text-center placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Métricas de ventas */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Package className="w-4 h-4" />
              Unidades Vendidas
            </label>
            <input
              type="number"
              value={unitsSold}
              onChange={e => setUnitsSold(e.target.value)}
              min={0}
              required
              placeholder="Cantidad de productos vendidos"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <DollarSign className="w-4 h-4" />
              Monto Facturado ($)
            </label>
            <input
              type="number"
              value={revenue}
              onChange={e => setRevenue(e.target.value)}
              min={0}
              step="0.01"
              required
              placeholder="0.00"
              className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Preview de métricas calculadas */}
        {unitsSold && revenue && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#51590E]" />
              <h3 className="text-sm font-medium text-white">📊 Resumen</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#51590E]">
                  {Number(unitsSold).toLocaleString()}
                </div>
                <div className="text-xs text-white/60">Unidades</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#51590E]">
                  ${Number(revenue).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-white/60">Facturado</div>
              </div>
            </div>
            {Number(unitsSold) > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <div className="text-sm text-white/70">
                  Precio promedio por unidad: 
                  <span className="text-[#51590E] font-semibold ml-1">
                    ${(Number(revenue) / Number(unitsSold)).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón submit */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            className="bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 min-w-[180px] justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Guardar informe
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}