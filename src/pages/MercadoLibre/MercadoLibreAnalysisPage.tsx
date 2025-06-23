import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getManualReports, 
  getAllAds, 
  getExcelAnalysisHistory 
} from "@/services/mercadolibre/mercadolibreService";
import { MercadoLibreAnalysisService } from "@/services/mercadolibre/MLanalisisService";
import MetricsCards from "@/components/MercadoLibre/Analysis/MetricsCards";
import SalesVsInvestmentChart from "@/components/MercadoLibre/Analysis/SalesVsInvestmentChart";
import ROIChart from "@/components/MercadoLibre/Analysis/ROIChart";
import InvestmentDistribution from "@/components/MercadoLibre/Analysis/InvestmentDistribution";
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  ArrowRight, 
  Loader2,
  Calendar,
  RefreshCw
} from "lucide-react";
import type { 
  MercadoLibreManualReport, 
  ReadAdDto, 
  ExcelTopProductoDto,
  AnalysisMetrics,
  ChartDataPoint,
  CampaignROI
} from "@/types/mercadolibre/ml";

export default function MercadoLibreAnalysisPage() {
  const [reports, setReports] = useState<MercadoLibreManualReport[]>([]);
  const [adsReports, setAdsReports] = useState<ReadAdDto[]>([]);
  const [excelData, setExcelData] = useState<ExcelTopProductoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Estados para análisis
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [roiData, setRoiData] = useState<CampaignROI[]>([]);
  const [investmentData, setInvestmentData] = useState<any[]>([]);

  // Filtros
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const { role } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, adsRes, excelRes] = await Promise.all([
        getManualReports(),
        getAllAds(),
        getExcelAnalysisHistory()
      ]);

      setReports(reportsRes.data);
      setAdsReports(adsRes.data);
      setExcelData(excelRes.data);
      setLastUpdated(new Date().toLocaleString('es-AR'));

      // Procesar datos para análisis
      processAnalysisData(reportsRes.data, adsRes.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalysisData = (manualReports: MercadoLibreManualReport[], ads: ReadAdDto[]) => {
    // Filtrar por año si está seleccionado
    const filteredReports = selectedYear 
      ? manualReports.filter(r => r.year === selectedYear)
      : manualReports;
    
    const filteredAds = selectedYear 
      ? ads.filter(a => a.year === selectedYear)
      : ads;

    // Calcular métricas
    const calculatedMetrics = MercadoLibreAnalysisService.calculateMetrics(filteredReports, filteredAds);
    setMetrics(calculatedMetrics);

    // Preparar datos para gráfico temporal
    const chartPoints = MercadoLibreAnalysisService.prepareChartData(filteredReports, filteredAds);
    setChartData(chartPoints);

    // Analizar ROI por tipo de campaña
    const roiAnalysis = MercadoLibreAnalysisService.analyzeCampaignROI(filteredAds);
    setRoiData(roiAnalysis);

    // Calcular distribución de inversión
    const investmentDistribution = MercadoLibreAnalysisService.calculateInvestmentDistribution(filteredAds);
    setInvestmentData(investmentDistribution);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (reports.length > 0 || adsReports.length > 0) {
      processAnalysisData(reports, adsReports);
    }
  }, [selectedYear, reports, adsReports]);

  // Obtener años disponibles
  const availableYears = Array.from(
    new Set([...reports.map(r => r.year), ...adsReports.map(a => a.year)])
  ).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
            <h2 className="text-xl font-semibold text-white">📊 Procesando análisis...</h2>
            <p className="text-white/60 text-sm text-center">
              Calculando métricas, ROI y preparando visualizaciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
                    📊 Análisis Inteligente MercadoLibre
                  </h1>
                  <p className="text-white/60 text-sm">
                    Dashboard avanzado con insights, tendencias y métricas de performance
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Filtro de año */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/60" />
                  <select
                    value={selectedYear || ""}
                    onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : 0)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm backdrop-blur-sm focus:border-[#B695BF] focus:outline-none"
                  >
                    <option value="">Todos los años</option>
                    {availableYears.map(year => (
                      <option key={year} value={year} className="bg-[#212026] text-white">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2 rounded-lg transition-all text-sm backdrop-blur-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>

                {/* Acceso a administración */}
                {(role === "admin" || role === "superadmin") && (
                  <Link
                    to="/mercadolibre/admin"
                    className="flex items-center gap-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        {metrics && (
          <div className="mb-8">
            <MetricsCards metrics={metrics} loading={false} />
          </div>
        )}

        {/* Gráfico principal de evolución */}
        <div className="mb-8">
          <SalesVsInvestmentChart data={chartData} loading={false} />
        </div>

        {/* Análisis ROI por tipo de campaña */}
        <div className="mb-8">
          <ROIChart data={roiData} loading={false} />
        </div>

        {/* Distribución de inversión */}
        <div className="mb-8">
          <InvestmentDistribution data={investmentData} loading={false} />
        </div>

        {/* Información del dashboard */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-[#51590E]" />
              <h3 className="font-semibold text-white">💡 Insights del Dashboard</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">📈 Evolución Temporal</h4>
                <p className="text-white/70">
                  Análisis comparativo de ventas vs inversión publicitaria con cálculo automático de ROI mensual
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">🎯 ROI por Campaña</h4>
                <p className="text-white/70">
                  Segmentación de retorno de inversión por Product Ads, Brand Ads y Display Ads
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">📊 Métricas Clave</h4>
                <p className="text-white/70">
                  Facturación total, inversión, ticket promedio y análisis de crecimiento mensual
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con metadata */}
        <div className="mt-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-white/60">
                  📅 Última actualización: <span className="text-white font-medium">{lastUpdated}</span>
                </span>
                <span className="text-white/60">
                  📊 Reportes analizados: <span className="text-white font-medium">
                    {reports.length} ventas + {adsReports.length} campañas
                  </span>
                </span>
                {selectedYear && (
                  <span className="text-white/60">
                    🗓️ Filtrado por: <span className="text-[#B695BF] font-medium">{selectedYear}</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-white/60">
                  💾 Datos Excel: <span className="text-white font-medium">{excelData.length} productos</span>
                </span>
                <Link
                  to="/mercadolibre"
                  className="flex items-center gap-2 text-[#B695BF] hover:text-white transition-colors"
                >
                  Ver reportes detallados
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}