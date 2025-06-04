import { useEffect, useState } from "react";
import { getAllAds, getExcelAnalysisHistory } from "@/services/mercadolibre/mercadolibreService";
import TopProductosTable from "@/components/MercadoLibre/TopProductosTable";
import AdsReportsTable from "@/components/MercadoLibre/AdsReportsTable";
import ReportsTable from "@/components/MercadoLibre/ReportsTable";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function MercadoLibreReportsPage() {
  const [adsReports, setAdsReports] = useState([]);
  const [excelTop, setExcelTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllAds().then(r => setAdsReports(r.data)),
      getExcelAnalysisHistory().then(r => setExcelTop(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const { role } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 mt-2 text-[#D94854] text-center drop-shadow-sm">
        Informes MercadoLibre
      </h1>

      {(role === "admin" || role === "superadmin") && (
      <div className="flex justify-end mb-4">
        <Link
          to="/mercadolibre/admin"
          className="inline-block px-6 py-2 rounded-2xl bg-[#B695BF] text-white font-semibold shadow hover:bg-[#D94854] transition"
        >
          Ir a administración
        </Link>
      </div>
    )}

      {loading ? (
        <div className="p-8 text-center text-white">Cargando datos...</div>
      ) : (
        <>
          <section className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-6 mt-4 text-[#51590E] text-center drop-shadow-sm">
            Informes de Ventas
          </h2>
            <ReportsTable adminView={false} />
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-6 mt-4 text-[#51590E] text-center drop-shadow-sm">Reportes Publicitarios</h2>
            <AdsReportsTable data={adsReports} />
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight mb-6 mt-4 text-[#51590E] text-center drop-shadow-sm">Top Productos por Color (Excel)</h2>
            <TopProductosTable data={excelTop} />
          </section>
        </>
      )}
    </div>
  );
}
