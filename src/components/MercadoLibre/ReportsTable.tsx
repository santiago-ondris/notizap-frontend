import { useEffect, useState } from "react";
import { getManualReports, deleteManualReport } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Trash2, 
  Loader2,
  AlertTriangle 
} from "lucide-react";

type ManualReport = {
  id: number;
  year: number;
  month: number;
  unitsSold: number;
  revenue: number;
};

export default function ReportsTable({ adminView = false }: { adminView?: boolean }) {
  const [reports, setReports] = useState<ManualReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const resp = await getManualReports();
      setReports(resp.data);
    } catch {
      toast.error("No se pudieron cargar los informes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Eliminar (solo admin/superadmin)
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este informe? Esta acción no puede deshacerse.")) return;
    try {
      await deleteManualReport(id);
      toast.success("Informe eliminado");
      fetchReports();
    } catch {
      toast.error("No se pudo eliminar el informe");
    }
  };

  // Ordenamos por año y mes descendente
  const sortedReports = [...reports].sort(
    (a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month
  );

  function getVariation(current: number, previous: number | undefined) {
    if (previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  }

  const formatVar = (v: number | null) => {
    if (v === null) return (
      <span className="flex items-center gap-1 text-white/40 text-sm">
        <span>–</span>
      </span>
    );
    if (v > 0) return (
      <span className="flex items-center gap-1 text-[#51590E] font-semibold text-sm">
        <TrendingUp className="w-3 h-3" />
        +{v.toFixed(1)}%
      </span>
    );
    if (v < 0) return (
      <span className="flex items-center gap-1 text-[#D94854] font-semibold text-sm">
        <TrendingDown className="w-3 h-3" />
        {v.toFixed(1)}%
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-white/60 text-sm">
        <span>0%</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📊 Cargando informes manuales...</p>
        </div>
      </div>
    );
  }

  if (sortedReports.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">📋 No hay informes cargados aún.</p>
          <p className="text-white/50 text-xs">Los informes manuales aparecerán aquí una vez que agregues datos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header de la tabla */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#51590E]" />
          <h3 className="text-lg font-semibold text-white">📋 Informes Manuales de Ventas</h3>
          <span className="ml-auto bg-[#51590E]/20 text-[#51590E] px-3 py-1 rounded-lg text-sm font-medium">
            {sortedReports.length} informes
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
              <th className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                  <Package className="w-4 h-4" />
                  Unidades
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                  <TrendingUp className="w-4 h-4" />
                  Var. % Unidades
                </div>
              </th>
              <th className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                  <DollarSign className="w-4 h-4" />
                  Facturación
                </div>
              </th>
              <th className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                  <TrendingUp className="w-4 h-4" />
                  Var. % Facturación
                </div>
              </th>
              {adminView && (
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                    <Trash2 className="w-4 h-4" />
                    Acción
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedReports.map((rep) => {
              const prev = sortedReports.find(
                r =>
                  (rep.month === 1 ? rep.year - 1 : rep.year) === r.year &&
                  (rep.month === 1 ? 12 : rep.month - 1) === r.month
              );
              const varUnits = getVariation(rep.unitsSold, prev?.unitsSold);
              const varRevenue = getVariation(rep.revenue, prev?.revenue);

              return (
                <tr 
                  key={rep.id} 
                  className="hover:bg-white/5 transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium">{rep.year}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white/80 font-medium">{rep.month}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-semibold">
                      {rep.unitsSold.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {formatVar(varUnits)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[#51590E] font-bold">
                      ${rep.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {formatVar(varRevenue)}
                    </div>
                  </td>
                  {adminView && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(rep.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-[#D94854]/20 hover:bg-[#D94854]/30 text-[#D94854] border border-[#D94854]/30 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white/60">
              Total informes: <span className="text-white font-medium">{sortedReports.length}</span>
            </span>
            <span className="text-white/60">
              Total unidades: <span className="text-white font-medium">
                {sortedReports.reduce((sum, r) => sum + r.unitsSold, 0).toLocaleString()}
              </span>
            </span>
          </div>
          <span className="text-white/60">
            Facturación total: <span className="text-[#51590E] font-semibold">
              ${sortedReports.reduce((sum, r) => sum + r.revenue, 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>

      {/* Nota informativa sobre variaciones */}
      {sortedReports.length > 1 && (
        <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <AlertTriangle className="w-3 h-3" />
            💡 Las variaciones se calculan comparando con el mes anterior
          </div>
        </div>
      )}
    </div>
  );
}