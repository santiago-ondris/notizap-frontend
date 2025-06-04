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
      fetchReports(); // Refresca la lista
    } catch {
      toast.error("No se pudo eliminar el informe");
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2 text-center text-[#51590E]">Informes Cargados</h2>
      {loading ? (
        <div className="p-4 text-center">Cargando...</div>
      ) : reports.length === 0 ? (
        <div className="p-4 text-center text-white-500">No hay informes cargados aún.</div>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
          <thead className="bg-violet-100">
            <tr>
              <th className="px-4 py-2 text-left">Año</th>
              <th className="px-4 py-2 text-left">Mes</th>
              <th className="px-4 py-2 text-right">Unidades</th>
              <th className="px-4 py-2 text-right">Facturación</th>
              {adminView && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {reports.map(rep => (
              <tr key={rep.id} className="border-t hover:bg-violet-50 transition">
                <td className="px-4 py-2">{rep.year}</td>
                <td className="px-4 py-2">{rep.month}</td>
                <td className="px-4 py-2 text-right">{rep.unitsSold}</td>
                <td className="px-4 py-2 text-right">${rep.revenue.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                {adminView && (
                  <td className="px-4 py-2 text-right">
                    {/* Editar se suma más adelante */}
                    <button
                      onClick={() => handleDelete(rep.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
