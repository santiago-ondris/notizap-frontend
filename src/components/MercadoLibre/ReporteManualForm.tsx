import { useState } from "react";
import { createManualReport } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { Button } from "../ui/button";


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
      // llamar a onSucces()?
    } catch (err: any) {
      toast.error("Error al guardar el informe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-4 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-2 text-center">Cargar Informe Manual de Ventas</h2>
      <div>
        <label className="block font-medium mb-1 text-center">Año</label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          min={2022}
          max={2100}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-center">Mes</label>
        <input
          type="number"
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          min={1}
          max={12}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-center">Unidades Vendidas</label>
        <input
          type="number"
          value={unitsSold}
          onChange={e => setUnitsSold(e.target.value)}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          min={0}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-center">Monto Facturado ($)</label>
        <input
          type="number"
          value={revenue}
          onChange={e => setRevenue(e.target.value)}
          className="w-full rounded-2xl border-2 border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 bg-white shadow transition p-2 text-base placeholder-gray-400 hover:border-violet-400 outline-none"
          min={0}
          step="0.01"
          required
        />
      </div>
      <Button
        type="submit"
        className="bg-[#51590E] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2"
        disabled={loading}
      >
        {loading ? "Guardando..." : "Guardar informe"}
      </Button>
    </form>
  );
}
