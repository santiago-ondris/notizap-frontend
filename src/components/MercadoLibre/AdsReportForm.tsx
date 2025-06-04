import { useState } from "react";
import { createProductAd, createBrandAd } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

export default function AdsReportForm() {
  const [tipo, setTipo] = useState<"product" | "brand">("product");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [nombreCampania, setNombreCampania] = useState("");
  // Campos específicos Product
  const [acosObjetivo, setAcosObjetivo] = useState("");
  const [ventasPads, setVentasPads] = useState("");
  const [acosReal, setAcosReal] = useState("");
  const [impresiones, setImpresiones] = useState("");
  const [clics, setClics] = useState("");
  const [ingresos, setIngresos] = useState("");
  // Campos específicos Brand
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tipo === "product") {
        await createProductAd({
          year,
          month,
          nombreCampania,
          acosObjetivo: Number(acosObjetivo),
          ventasPads: Number(ventasPads),
          acosReal: Number(acosReal),
          impresiones: Number(impresiones),
          clics: Number(clics),
          ingresos: Number(ingresos),
        });
        toast.success("Reporte Product Ads guardado");
      } else {
        await createBrandAd({
          year,
          month,
          nombreCampania,
          presupuesto: Number(presupuesto),
          ventas: Number(ventasBrand),
          clics: Number(clicsBrand),
          ingresos: Number(ingresosBrand),
          cpc: Number(cpc),
        });
        toast.success("Reporte Brand Ads guardado");
      }
      resetForm();
    } catch {
      toast.error("Error al guardar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      <h2 className="text-xl font-bold mb-2 text-center">Cargar Reporte Publicitario</h2>
      <div className="flex gap-2 mt-2 justify-center">
      <label
        className={`flex items-center px-4 py-2 rounded-2xl border-2 cursor-pointer transition
          ${tipo === "product"
            ? "bg-violet-100 border-violet-500 text-violet-800 shadow"
            : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"}`}
      >
        <input
          type="radio"
          checked={tipo === "product"}
          onChange={() => setTipo("product")}
          className="sr-only"
        />
        <span className="font-semibold flex items-center gap-1">
          <svg width="20" height="20" fill="none" className={tipo === "product" ? "text-violet-500" : "text-gray-300"}>
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            {tipo === "product" && <circle cx="10" cy="10" r="5" fill="currentColor" />}
          </svg>
          Product Ads
        </span>
      </label>

      <label
        className={`flex items-center px-4 py-2 rounded-2xl border-2 cursor-pointer transition
          ${tipo === "brand"
            ? "bg-violet-100 border-violet-500 text-violet-800 shadow"
            : "bg-white border-gray-300 text-gray-600 hover:border-violet-400"}`}
      >
        <input
          type="radio"
          checked={tipo === "brand"}
          onChange={() => setTipo("brand")}
          className="sr-only"
        />
        <span className="font-semibold flex items-center gap-1">
          <svg width="20" height="20" fill="none" className={tipo === "brand" ? "text-violet-500" : "text-gray-300"}>
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
            {tipo === "brand" && <circle cx="10" cy="10" r="5" fill="currentColor" />}
          </svg>
          Brand Ads
        </span>
      </label>
    </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-medium mb-1 text-center">Año</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} min={2022} max={2100} required
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-center">Mes</label>
          <input type="number" value={month} onChange={e => setMonth(Number(e.target.value))} min={1} max={12} required
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1 text-center">Nombre Campaña</label>
        <input type="text" value={nombreCampania} onChange={e => setNombreCampania(e.target.value)} required
        className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
        />
      </div>
      {tipo === "product" ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-center">ACoS Objetivo (%)</label>
              <input type="number" value={acosObjetivo} onChange={e => setAcosObjetivo(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">Ventas Pads</label>
              <input type="number" value={ventasPads} onChange={e => setVentasPads(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">ACoS Real (%)</label>
              <input type="number" value={acosReal} onChange={e => setAcosReal(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-center">Impresiones</label>
              <input type="number" value={impresiones} onChange={e => setImpresiones(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">Clics</label>
              <input type="number" value={clics} onChange={e => setClics(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">Ingresos ($)</label>
              <input type="number" value={ingresos} onChange={e => setIngresos(e.target.value)} min={0} step="0.01"
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1 text-center">Presupuesto ($)</label>
              <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} min={0} step="0.01"
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">Ventas</label>
              <input type="number" value={ventasBrand} onChange={e => setVentasBrand(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">Clics</label>
              <input type="number" value={clicsBrand} onChange={e => setClicsBrand(e.target.value)} min={0}
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-center">Ingresos ($)</label>
              <input type="number" value={ingresosBrand} onChange={e => setIngresosBrand(e.target.value)} min={0} step="0.01"
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-center">CPC ($)</label>
              <input type="number" value={cpc} onChange={e => setCpc(e.target.value)} min={0} step="0.01"
              className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
              />
            </div>
          </div>
        </>
      )}
      <Button type="submit" disabled={loading}
      className="bg-[#51590E] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2"
      >
        {loading ? "Guardando..." : "Guardar reporte"}
      </Button>
    </form>
  );
}
