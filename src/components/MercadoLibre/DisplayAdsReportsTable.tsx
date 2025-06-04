import { useEffect, useState } from "react";
import { getAllAds } from "@/services/mercadolibre/mercadolibreService";
import { toast } from "react-toastify";

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

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Campañas Display Ads</h2>
      {loading ? (
        <div className="p-4 text-center">Cargando...</div>
      ) : reports.length === 0 ? (
        <div className="p-4 text-center text-white-500">No hay campañas aún.</div>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
          <thead>
            <tr>
              <th className="px-3 py-1 text-left">Año</th>
              <th className="px-3 py-1 text-left">Mes</th>
              <th className="px-3 py-1 text-left">Campaña</th>
              <th className="px-3 py-1 text-right">Inversión</th>
              <th className="px-3 py-1 text-left">Anuncios</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, idx) => (
              <tr key={idx} className="border-t hover:bg-violet-50 transition">
                <td className="px-3 py-1">{r.year}</td>
                <td className="px-3 py-1">{r.month}</td>
                <td className="px-3 py-1">{r.nombreCampania}</td>
                <td className="px-3 py-1 text-right">${r.inversion?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                <td className="px-3 py-1">
                  {r.detalles?.anuncios?.length > 0
                    ? (
                      <ul className="list-disc pl-5">
                        {r.detalles.anuncios.map((a: any, i: number) => (
                          <li key={i}>{a.nombre} – {a.impresiones} impresiones, {a.clics} clics, {a.visitas} visitas, {a.ctr}% CTR</li>
                        ))}
                      </ul>
                    ) : <span className="text-white-500">Sin anuncios</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
