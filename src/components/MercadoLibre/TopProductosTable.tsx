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
      <div className="mt-4">
        {Object.keys(agrupado)
          .sort((a, b) => b.localeCompare(a)) // más recientes primero
          .map(periodo => (
            <div key={periodo} className="mb-6">
              <h3 className="text-md font-bold mb-2">
                {(() => {
                  const [y, m] = periodo.split("-");
                  return `Top productos por color – ${m.padStart(2, "0")}/${y}`;
                })()}
              </h3>
              <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-3 py-1 text-left">Modelo + Color</th>
                    <th className="px-3 py-1 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupado[periodo].map((prod, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-1">{prod.modeloColor}</td>
                      <td className="px-3 py-1 text-right">{prod.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    );
  }
  