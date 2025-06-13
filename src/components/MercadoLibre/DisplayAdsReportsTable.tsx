import { useEffect, useState } from "react";
import { getAllAds } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Target, 
  DollarSign, 
  Monitor, 
  TrendingUp, 
  MousePointer, 
  Eye, 
  Loader2 
} from "lucide-react";

export default function DisplayAdsReportsTable() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllAds()
      .then(r => setReports(r.data.filter((rep: any) => rep.tipo === "DisplayAds")))
      .catch(() => toast.error("No se pudieron cargar los reportes Display Ads"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📊 Cargando campañas Display Ads...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Monitor className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">📺 No hay campañas Display Ads aún.</p>
          <p className="text-white/50 text-xs">Las campañas aparecerán aquí una vez que agregues reportes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la tabla */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-[#B695BF]" />
            <h2 className="text-lg font-semibold text-white">📺 Campañas Display Ads</h2>
            <span className="ml-auto bg-[#B695BF]/20 text-[#B695BF] px-3 py-1 rounded-lg text-sm font-medium">
              {reports.length} campañas
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Calendar className="w-4 h-4" />
                    Año
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Calendar className="w-4 h-4" />
                    Mes
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Target className="w-4 h-4" />
                    Campaña
                  </div>
                </th>
                <th className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                    <DollarSign className="w-4 h-4" />
                    Inversión
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Monitor className="w-4 h-4" />
                    Anuncios
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reports.map((r, idx) => (
                <tr 
                  key={idx} 
                  className="hover:bg-white/5 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium">{r.year}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium">{r.month}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium group-hover:text-[#B695BF] transition-colors">
                      {r.nombreCampania}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#51590E] font-semibold">
                      ${r.inversion?.toLocaleString("es-AR", { minimumFractionDigits: 2 }) || "0.00"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.detalles?.anuncios?.length > 0 ? (
                      <div className="space-y-2">
                        {r.detalles.anuncios.map((a: any, i: number) => (
                          <div 
                            key={i} 
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-xs"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Monitor className="w-3 h-3 text-[#B695BF]" />
                              <span className="text-white font-medium">{a.nombre}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-white/70">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{a.impresiones?.toLocaleString() || 0} impresiones</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3" />
                                <span>{a.clics?.toLocaleString() || 0} clics</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{a.visitas?.toLocaleString() || 0} visitas</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                <span className="text-[#51590E] font-medium">{a.ctr || 0}% CTR</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Monitor className="w-4 h-4" />
                        Sin anuncios
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer con estadísticas */}
        <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-white/60">
                Total de campañas: <span className="text-white font-medium">{reports.length}</span>
              </span>
              <span className="text-white/60">
                Total anuncios: <span className="text-white font-medium">
                  {reports.reduce((sum, r) => sum + (r.detalles?.anuncios?.length || 0), 0)}
                </span>
              </span>
            </div>
            <span className="text-white/60">
              Inversión total: <span className="text-[#51590E] font-semibold">
                ${reports.reduce((sum, r) => sum + (r.inversion || 0), 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}