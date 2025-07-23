import { useEffect, useState } from "react";
import { getAllAds } from "@/services/mercadolibre/mercadolibreService";
import AdsReportsTable from "@/components/MercadoLibre/AdsReportsTable";
import ReportsTable from "@/components/MercadoLibre/ReportsTable";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Settings, 
  ArrowRight, 
  Loader2,
} from "lucide-react";

export default function MercadoLibreReportsPage() {
  const [, setAdsReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllAds().then(r => setAdsReports(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const { role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
            <h2 className="text-xl font-semibold text-white">📊 Cargando informes...</h2>
            <p className="text-white/60 text-sm text-center">
              Obteniendo datos de ventas, publicidad y análisis de productos
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#D94854]/20 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-[#D94854]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    📊 Informes MercadoLibre
                  </h1>
                  <p className="text-white/60 text-sm">
                    Dashboard de análisis de ventas, publicidad y productos
                  </p>
                </div>
              </div>
              
              {(role === "admin" || role === "superadmin") && (
                <Link
                  to="/mercadolibre/admin"
                  className="flex items-center gap-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Administración
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

                <Link
                  to="/mercadolibre/analysisML"
                  className="flex items-center gap-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Analisis
                  <ArrowRight className="w-4 h-4" />
                </Link>
        
            </div>
          </div>
        </div>

        {/* Sección de Informes de Ventas */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#51590E]/20 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-[#51590E]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">📋 Informes de Ventas</h2>
                <p className="text-white/60 text-sm">
                  Reportes manuales con comparativas mensuales y análisis de tendencias
                </p>
              </div>
            </div>
          </div>
          <ReportsTable adminView={false} />
        </section>

        {/* Sección de Reportes Publicitarios */}
        <section className="mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#D94854]/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#D94854]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">🎯 Reportes Publicitarios</h2>
                <p className="text-white/60 text-sm">
                  Campañas de Product Ads, Brand Ads y Display Ads con métricas de inversión
                </p>
              </div>
            </div>
          </div>
          <AdsReportsTable />
        </section>

      </div>
    </div>
  );
}