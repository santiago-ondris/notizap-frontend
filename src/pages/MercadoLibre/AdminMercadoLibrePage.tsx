import { useState } from "react";
import ReporteManualForm from "@/components/MercadoLibre/ReporteManualForm";
import AdsReportForm from "@/components/MercadoLibre/AdsReportForm";
import DisplayAdsForm from "@/components/MercadoLibre/DisplayAdsForm";
import ExcelProcessor from "@/components/MercadoLibre/ExcelProcessor";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function AdminMercadoLibrePage() {
  const [modo, setModo] = useState<"reportes" | "ads" | "display" | "excel">("reportes");

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="max-w-4xl mx-auto py-8 relative">
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 mt-2 text-[#D94854] text-center drop-shadow-sm">
          Administración MercadoLibre
        </h1>
        <Link
          to="/mercadolibre/"
          className="absolute right-0 top-8 inline-block px-6 py-2 rounded-2xl bg-[#B695BF] text-white font-semibold shadow hover:bg-[#D94854] transition"
        >
          Ir a reportes
        </Link>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        <Button onClick={() => setModo("reportes")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Informe ventas</Button>
        <Button onClick={() => setModo("ads")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Product/Brand Ads</Button>
        <Button onClick={() => setModo("display")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Display Ads</Button>
        <Button onClick={() => setModo("excel")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Procesar Excel</Button>
      </div>
      <div className="flex justify-center">
      {modo === "reportes" && <ReporteManualForm />}
      {modo === "ads" && <AdsReportForm />}
      {modo === "display" && <DisplayAdsForm />}
      {modo === "excel" && <ExcelProcessor />}
      </div>
    </div>
  );
}
