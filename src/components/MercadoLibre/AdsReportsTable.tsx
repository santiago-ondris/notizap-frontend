import { Calendar, Target, DollarSign, Package, TrendingUp } from "lucide-react";

export default function AdsReportsTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <TrendingUp className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">📊 No hay campañas cargadas aún.</p>
          <p className="text-white/50 text-xs">Los reportes aparecerán aquí una vez que agregues campañas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header de la tabla */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#D94854]" />
          <h3 className="text-lg font-semibold text-white">📊 Campañas Publicitarias</h3>
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
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Package className="w-4 h-4" />
                  Tipo
                </div>
              </th>
              <th className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                  <DollarSign className="w-4 h-4" />
                  Inversión
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {data.map((r, idx) => (
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
                  <span className="text-white font-medium group-hover:text-[#D94854] transition-colors">
                    {r.nombreCampania}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium
                    ${r.tipo === 'product' 
                      ? 'bg-[#D94854]/20 text-[#D94854] border border-[#D94854]/30' 
                      : 'bg-[#B695BF]/20 text-[#B695BF] border border-[#B695BF]/30'
                    }
                  `}>
                    {r.tipo === 'product' ? (
                      <>
                        <Package className="w-3 h-3" />
                        Product Ads
                      </>
                    ) : (
                      <>
                        <Target className="w-3 h-3" />
                        Brand Ads
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[#51590E] font-semibold">
                    ${r.inversion?.toLocaleString("es-AR", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">
            Total de campañas: <span className="text-white font-medium">{data.length}</span>
          </span>
          <span className="text-white/60">
            Inversión total: <span className="text-[#51590E] font-semibold">
              ${data.reduce((sum, r) => sum + (r.inversion || 0), 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}