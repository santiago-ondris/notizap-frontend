import { useEffect, useState } from "react";
import { getManualReports, getAllAds, getExcelAnalysisHistory } from "@/services/mercadolibre/mercadolibreService";
import TopProductosTable from "@/components/MercadoLibre/TopProductosTable";
import AdsReportsTable from "@/components/MercadoLibre/AdsReportsTable";

type ManualReport = {
  id: number;
  year: number;
  month: number;
  unitsSold: number;
  revenue: number;
};

export default function MercadoLibreReportsPage() {
  const [manualReports, setManualReports] = useState<ManualReport[]>([]);
  const [adsReports, setAdsReports] = useState([]);
  const [excelTop, setExcelTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getManualReports().then(r => setManualReports(r.data)),
      getAllAds().then(r => setAdsReports(r.data)),
      getExcelAnalysisHistory().then(r => setExcelTop(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-[#D94854]">Informes MercadoLibre</h1>
      {loading ? (
        <div className="p-8 text-center">Cargando datos...</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-[#51590E]">Informes de Ventas</h2>
            {manualReports.length === 0 ? (
              <div className="text-gray-500">No hay informes cargados aún.</div>
            ) : (
              <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                <thead className="bg-violet-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Año</th>
                    <th className="px-4 py-2 text-left">Mes</th>
                    <th className="px-4 py-2 text-right">Unidades</th>
                    <th className="px-4 py-2 text-right">Facturación</th>
                  </tr>
                </thead>
                <tbody>
                  {manualReports.map(rep => (
                    <tr key={rep.id} className="border-t hover:bg-violet-50 transition">
                      <td className="px-4 py-2">{rep.year}</td>
                      <td className="px-4 py-2">{rep.month}</td>
                      <td className="px-4 py-2 text-right">{rep.unitsSold}</td>
                      <td className="px-4 py-2 text-right">${rep.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-[#51590E]">Reportes Publicitarios</h2>
            <AdsReportsTable data={adsReports} />
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-[#51590E]">Top Productos por Color (Excel)</h2>
            <TopProductosTable data={excelTop} />
          </section>
        </>
      )}
    </div>
  );
}
