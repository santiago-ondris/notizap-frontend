export default function AdsReportsTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-white">No hay campañas cargadas aún.</div>;
  }
  return (
    <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
      <thead className="bg-violet-100">
        <tr>
          <th className="px-4 py-2 text-left">Año</th>
          <th className="px-4 py-2 text-left">Mes</th>
          <th className="px-4 py-2 text-left">Campaña</th>
          <th className="px-4 py-2 text-left">Tipo</th>
          <th className="px-4 py-2 text-right">Inversión</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r, idx) => (
          <tr key={idx} className="border-t hover:bg-violet-50 transition">
            <td className="px-4 py-2">{r.year}</td>
            <td className="px-4 py-2">{r.month}</td>
            <td className="px-4 py-2">{r.nombreCampania}</td>
            <td className="px-4 py-2">{r.tipo}</td>
            <td className="px-4 py-2 text-right">${r.inversion?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
