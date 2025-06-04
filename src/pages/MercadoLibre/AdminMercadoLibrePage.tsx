import { useState } from "react";
import ReporteManualForm from "@/components/MercadoLibre/ReporteManualForm";
import AdsReportForm from "@/components/MercadoLibre/AdsReportForm";
import DisplayAdsForm from "@/components/MercadoLibre/DisplayAdsForm";
import ExcelProcessor from "@/components/MercadoLibre/ExcelProcessor";
import ReportsTable from "@/components/MercadoLibre/ReportsTable";
import AdsReportsTable from "@/components/MercadoLibre/AdsReportsTable";
import DisplayAdsReportsTable from "@/components/MercadoLibre/DisplayAdsReportsTable";
import { Button } from "@/components/ui/button";

export default function AdminMercadoLibrePage() {
  const [modo, setModo] = useState<"reportes" | "ads" | "display" | "excel">("reportes");

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#D94854]">Administración MercadoLibre</h1>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => setModo("reportes")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Informe ventas</Button>
        <Button onClick={() => setModo("ads")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Product/Brand Ads</Button>
        <Button onClick={() => setModo("display")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Display Ads</Button>
        <Button onClick={() => setModo("excel")} className="bg-[#D94854] hover:bg-[#F23D5E] text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl shadow m-2">Procesar Excel</Button>
      </div>
      {modo === "reportes" && <ReporteManualForm />}
      {modo === "ads" && <AdsReportForm />}
      <AdsReportsTable data={[]} />
      {modo === "display" && <DisplayAdsForm />}
      <DisplayAdsReportsTable />
      {modo === "excel" && <ExcelProcessor />}
      <div className="mt-8">
        <ReportsTable adminView={true} />
      </div>
    </div>
  );
}
