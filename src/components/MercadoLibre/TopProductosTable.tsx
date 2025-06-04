type TopProducto = {
  modeloColor: string;
  cantidad: number;
  year?: number;
  month?: number;
};

export default function TopProductosTable({ data }: { data: TopProducto[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No hay análisis de productos cargados aún.
      </div>
    );
  }

  const agrupado = data.reduce((acc, item) => {
    const key = `${item.year}-${item.month}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, TopProducto[]>);

  return (
    <div className="mt-8">
      {Object.keys(agrupado)
        .sort((a, b) => b.localeCompare(a)) // más recientes primero
        .map(periodo => (
          <div key={periodo} className="mb-10 w-full">
            <div className="w-full overflow-x-auto">
              <table className="w-full bg-white rounded-2xl shadow text-center">
                <thead className="bg-violet-100">
                  <tr>
                    <th className="px-6 py-3 text-center font-semibold border-b text-base">Modelo + Color</th>
                    <th className="px-6 py-3 text-center font-semibold border-b text-base">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupado[periodo]
                    .slice(0, 10) // SOLO los primeros 10
                    .map((prod, idx) => (
                      <tr key={idx} className="border-t hover:bg-violet-50 transition">
                        <td className="px-6 py-2 text-center">{prod.modeloColor}</td>
                        <td className="px-6 py-2 text-center font-semibold">{prod.cantidad}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}
