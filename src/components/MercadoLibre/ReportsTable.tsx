import { useEffect, useState } from "react";
import { getManualReports, deleteManualReport } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";

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
    if (v === null) return <span className="text-gray-400">–</span>;
    if (v > 0) return <span className="text-green-700 font-semibold">+{v.toFixed(1)}%</span>;
    if (v < 0) return <span className="text-red-600 font-semibold">{v.toFixed(1)}%</span>;
    return <span className="text-gray-500">0%</span>;
  };

  return (
    <div className="mt-8">
      {loading ? (
        <div className="p-4 text-center text-white">Cargando...</div>
      ) : sortedReports.length === 0 ? (
        <div className="p-4 text-center text-white-500">No hay informes cargados aún.</div>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-violet-100">
            <tr>
              <th className="px-4 py-2 text-left">Año</th>
              <th className="px-4 py-2 text-left">Mes</th>
              <th className="px-4 py-2 text-right">Unidades</th>
              <th className="px-4 py-2 text-right">Var. % Unidades</th>
              <th className="px-4 py-2 text-right">Facturación</th>
              <th className="px-4 py-2 text-right">Var. % Facturación</th>
              {adminView && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {sortedReports.map((rep) => {
              const prev = sortedReports.find(
                r =>
                  (rep.month === 1 ? rep.year - 1 : rep.year) === r.year &&
                  (rep.month === 1 ? 12 : rep.month - 1) === r.month
              );
              const varUnits = getVariation(rep.unitsSold, prev?.unitsSold);
              const varRevenue = getVariation(rep.revenue, prev?.revenue);

              return (
                <tr key={rep.id} className="border-t hover:bg-violet-50 transition">
                  <td className="px-4 py-2">{rep.year}</td>
                  <td className="px-4 py-2">{rep.month}</td>
                  <td className="px-4 py-2 text-right">{rep.unitsSold}</td>
                  <td className="px-4 py-2 text-right">{formatVar(varUnits)}</td>
                  <td className="px-4 py-2 text-right">
                    ${rep.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-right">{formatVar(varRevenue)}</td>
                  {adminView && (
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(rep.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
