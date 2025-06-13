import { 
  Package, 
  Palette, 
  TrendingUp, 
  Hash,
  Trophy
} from "lucide-react";

type TopProducto = {
  modeloColor: string;
  cantidad: number;
  year?: number;
  month?: number;
};

export default function TopProductosTable({ data }: { data: TopProducto[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Package className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">🎨 No hay análisis de productos cargados aún.</p>
          <p className="text-white/50 text-xs">Los productos más vendidos aparecerán aquí una vez que proceses archivos Excel.</p>
        </div>
      </div>
    );
  }

  const agrupado = data.reduce((acc, item) => {
    const key = `${item.year}-${item.month}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, TopProducto[]>);

  const formatPeriodo = (periodo: string) => {
    const [year, month] = periodo.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-8">
      {Object.keys(agrupado)
        .sort((a, b) => b.localeCompare(a)) // más recientes primero
        .map(periodo => {
          const productos = agrupado[periodo].slice(0, 10); // SOLO los primeros 10
          const totalProductos = agrupado[periodo].length;
          const totalCantidad = productos.reduce((sum, p) => sum + p.cantidad, 0);

          return (
            <div key={periodo} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              {/* Header del período */}
              <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#51590E]" />
                    <h3 className="text-lg font-semibold text-white">
                      🏆 Top 10 - {formatPeriodo(periodo)}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-[#51590E]/20 text-[#51590E] px-3 py-1 rounded-lg text-sm font-medium">
                      {productos.length} productos
                    </span>
                    {totalProductos > 10 && (
                      <span className="bg-white/10 text-white/70 px-3 py-1 rounded-lg text-sm">
                        de {totalProductos} totales
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabla de productos */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                          <Hash className="w-4 h-4" />
                          Posición
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                          <Palette className="w-4 h-4" />
                          Modelo + Color
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                          <TrendingUp className="w-4 h-4" />
                          Cantidad
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                          <Package className="w-4 h-4" />
                          % del Top 10
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {productos.map((prod, idx) => {
                      const porcentaje = ((prod.cantidad / totalCantidad) * 100);
                      
                      return (
                        <tr 
                          key={idx} 
                          className="hover:bg-white/5 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`
                                inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                ${idx < 3 
                                  ? 'bg-[#51590E]/30 text-[#51590E]' 
                                  : 'bg-white/10 text-white/70'
                                }
                              `}>
                                {idx + 1}
                              </span>
                              {idx === 0 && <span className="text-lg">🥇</span>}
                              {idx === 1 && <span className="text-lg">🥈</span>}
                              {idx === 2 && <span className="text-lg">🥉</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-white font-medium group-hover:text-[#51590E] transition-colors">
                              {prod.modeloColor}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[#51590E] font-bold text-lg">
                              {prod.cantidad.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-white/10 rounded-full h-2">
                                <div 
                                  className="bg-[#51590E] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                              <span className="text-white/70 text-sm font-medium min-w-[3rem]">
                                {porcentaje.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer con estadísticas del período */}
              <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60">
                      Período: <span className="text-white font-medium">{formatPeriodo(periodo)}</span>
                    </span>
                    <span className="text-white/60">
                      Productos mostrados: <span className="text-white font-medium">{productos.length}</span>
                    </span>
                  </div>
                  <span className="text-white/60">
                    Total unidades (Top 10): <span className="text-[#51590E] font-semibold">
                      {totalCantidad.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}