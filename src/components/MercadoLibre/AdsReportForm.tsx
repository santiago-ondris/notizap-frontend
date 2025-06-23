import { useState } from "react";
import { createProductAd, createBrandAd } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import DecimalInput from "../ui/DecimalInput";
import { Package, Target, Calendar, DollarSign, MousePointer, TrendingUp, Loader2 } from "lucide-react";

export default function AdsReportForm() {
  const [tipo, setTipo] = useState<"product" | "brand">("product");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [nombreCampania, setNombreCampania] = useState("");
  
  // Campos específicos Product - todos como string para manejar comas
  const [acosObjetivo, setAcosObjetivo] = useState("");
  const [ventasPads, setVentasPads] = useState("");
  const [acosReal, setAcosReal] = useState("");
  const [impresiones, setImpresiones] = useState("");
  const [clics, setClics] = useState("");
  const [ingresos, setIngresos] = useState("");
  
  // Campos específicos Brand - todos como string para manejar comas
  const [presupuesto, setPresupuesto] = useState("");
  const [ventasBrand, setVentasBrand] = useState("");
  const [clicsBrand, setClicsBrand] = useState("");
  const [ingresosBrand, setIngresosBrand] = useState("");
  const [cpc, setCpc] = useState("");
  
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNombreCampania("");
    setAcosObjetivo(""); setVentasPads(""); setAcosReal("");
    setImpresiones(""); setClics(""); setIngresos("");
    setPresupuesto(""); setVentasBrand(""); setClicsBrand("");
    setIngresosBrand(""); setCpc("");
  };

  // Helper para convertir string a número seguro
  const toNumber = (value: string): number => {
    if (!value || value === "") return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tipo === "product") {
        await createProductAd({
          year,
          month,
          nombreCampania,
          acosObjetivo: toNumber(acosObjetivo),
          ventasPads: toNumber(ventasPads),
          acosReal: toNumber(acosReal),
          impresiones: toNumber(impresiones),
          clics: toNumber(clics),
          ingresos: toNumber(ingresos),
        });
        toast.success("✅ Reporte Product Ads guardado correctamente");
      } else {
        await createBrandAd({
          year,
          month,
          nombreCampania,
          presupuesto: toNumber(presupuesto),
          ventas: toNumber(ventasBrand),
          clics: toNumber(clicsBrand),
          ingresos: toNumber(ingresosBrand),
          cpc: toNumber(cpc),
        });
        toast.success("✅ Reporte Brand Ads guardado correctamente");
      }
      resetForm();
    } catch {
      toast.error("❌ Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass = "w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none transition-all";

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[#D94854]" />
        <h2 className="text-xl font-semibold text-white">📊 Cargar Reporte Publicitario</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Radio buttons para tipo */}
        <div className="flex gap-3 justify-center">
          <label className={`
            flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all
            ${tipo === "product"
              ? "bg-[#D94854]/20 border-[#D94854]/30 text-[#D94854]"
              : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
            }
          `}>
            <input
              type="radio"
              checked={tipo === "product"}
              onChange={() => setTipo("product")}
              className="sr-only"
            />
            <Package className="w-4 h-4" />
            <span className="font-medium text-sm">Product Ads</span>
          </label>

          <label className={`
            flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all
            ${tipo === "brand"
              ? "bg-[#D94854]/20 border-[#D94854]/30 text-[#D94854]"
              : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
            }
          `}>
            <input
              type="radio"
              checked={tipo === "brand"}
              onChange={() => setTipo("brand")}
              className="sr-only"
            />
            <Target className="w-4 h-4" />
            <span className="font-medium text-sm">Brand Ads</span>
          </label>
        </div>

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
              className={inputBaseClass}
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
              className={inputBaseClass}
            />
          </div>
        </div>

        {/* Nombre campaña */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
            <Target className="w-4 h-4" />
            Nombre Campaña
          </label>
          <input 
            type="text" 
            value={nombreCampania} 
            onChange={e => setNombreCampania(e.target.value)} 
            required
            placeholder="Ingresa el nombre de la campaña"
            className={inputBaseClass}
          />
        </div>

        {/* Campos específicos por tipo */}
        {tipo === "product" ? (
          <div className="space-y-4">
            <div className="bg-[#D94854]/10 border border-[#D94854]/20 rounded-xl p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D94854]" />
                📦 Métricas Product Ads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Target className="w-4 h-4" />
                    ACoS Objetivo (%)
                  </label>
                  <DecimalInput
                    value={acosObjetivo}
                    onChange={setAcosObjetivo}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                    max={100}
                  />
                  <p className="text-xs text-white/50 mt-1">💡 Puedes usar coma (,) como separador decimal</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Package className="w-4 h-4" />
                    Ventas Pads
                  </label>
                  <input 
                    type="number" 
                    value={ventasPads} 
                    onChange={e => setVentasPads(e.target.value)} 
                    min={0}
                    placeholder="0"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Target className="w-4 h-4" />
                    ACoS Real (%)
                  </label>
                  <DecimalInput
                    value={acosReal}
                    onChange={setAcosReal}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                    max={100}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Impresiones
                  </label>
                  <input 
                    type="number" 
                    value={impresiones} 
                    onChange={e => setImpresiones(e.target.value)} 
                    min={0}
                    placeholder="0"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <MousePointer className="w-4 h-4" />
                    Clics
                  </label>
                  <input 
                    type="number" 
                    value={clics} 
                    onChange={e => setClics(e.target.value)} 
                    min={0}
                    placeholder="0"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Ingresos ($)
                  </label>
                  <DecimalInput
                    value={ingresos}
                    onChange={setIngresos}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#B695BF]/10 border border-[#B695BF]/20 rounded-xl p-4">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#B695BF]" />
                🎯 Métricas Brand Ads
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Presupuesto ($)
                  </label>
                  <DecimalInput
                    value={presupuesto}
                    onChange={setPresupuesto}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                  />
                  <p className="text-xs text-white/50 mt-1">💡 Puedes usar coma (,) como separador decimal</p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <Package className="w-4 h-4" />
                    Ventas
                  </label>
                  <input 
                    type="number" 
                    value={ventasBrand} 
                    onChange={e => setVentasBrand(e.target.value)} 
                    min={0}
                    placeholder="0"
                    className={inputBaseClass}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <MousePointer className="w-4 h-4" />
                    Clics
                  </label>
                  <input 
                    type="number" 
                    value={clicsBrand} 
                    onChange={e => setClicsBrand(e.target.value)} 
                    min={0}
                    placeholder="0"
                    className={inputBaseClass}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Ingresos ($)
                  </label>
                  <DecimalInput
                    value={ingresosBrand}
                    onChange={setIngresosBrand}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                    <MousePointer className="w-4 h-4" />
                    CPC ($)
                  </label>
                  <DecimalInput
                    value={cpc}
                    onChange={setCpc}
                    placeholder="0,00"
                    className={inputBaseClass}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón submit */}
        <div className="flex justify-center pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 min-w-[180px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Guardar reporte
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}