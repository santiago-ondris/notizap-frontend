// components/Analisis/AnalisisStatsPanel.tsx
import React from "react";
import { TrendingUp, Package, ShoppingCart, BarChart3 } from "lucide-react";

interface AnalisisStatsPanelProps {
  datosFiltrados: any[];
  totalResultados: number;
}

export const AnalisisStatsPanel: React.FC<AnalisisStatsPanelProps> = ({
  datosFiltrados,
  totalResultados
}) => {
  // Calcular estadísticas
  const totalComprado = datosFiltrados.reduce((acc, item) => acc + (item.cantidadComprada || 0), 0);
  const totalVendido = datosFiltrados.reduce((acc, item) => acc + (item.cantidadVendida || 0), 0);
  const promedioRotacion = datosFiltrados.length > 0 
    ? datosFiltrados.reduce((acc, item) => acc + (item.tasaRotacion || 0), 0) / datosFiltrados.length 
    : 0;

  const stats = [
    {
      icon: Package,
      label: "Total Comprado",
      value: totalComprado.toLocaleString(),
      color: "#D94854",
      bgColor: "from-[#D94854]/20 to-[#F23D5E]/10",
      description: "Unidades compradas"
    },
    {
      icon: ShoppingCart,
      label: "Total Vendido", 
      value: totalVendido.toLocaleString(),
      color: "#F23D5E",
      bgColor: "from-[#F23D5E]/20 to-[#D94854]/10",
      description: "Unidades vendidas"
    },
    {
      icon: TrendingUp,
      label: "Rotación Promedio",
      value: `${(promedioRotacion * 100).toFixed(1)}%`,
      color: "#B695BF",
      bgColor: "from-[#B695BF]/20 to-[#51590E]/10",
      description: "Tasa de rotación media"
    },
    {
      icon: BarChart3,
      label: "Productos Filtrados",
      value: datosFiltrados.length.toString(),
      color: "#51590E",
      bgColor: "from-[#51590E]/20 to-[#B695BF]/10",
      description: `De ${totalResultados} totales`
    }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#B695BF]" />
        Estadísticas del análisis
      </h3>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${stat.bgColor} border border-white/10 p-4 group hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
                <div className="text-white font-bold text-xl mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-white/60 text-xs">
                  {stat.description}
                </div>
              </div>
            </div>
            
            {/* Decorative gradient */}
            <div 
              className="absolute top-0 right-0 w-12 h-12 opacity-10 blur-xl rounded-full"
              style={{ backgroundColor: stat.color }}
            />
          </div>
        ))}
      </div>

      {/* Efficiency Indicator */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Eficiencia de rotación:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              promedioRotacion >= 0.8 ? 'bg-green-400' :
              promedioRotacion >= 0.5 ? 'bg-yellow-400' :
              'bg-red-400'
            }`} />
            <span className={`font-semibold ${
              promedioRotacion >= 0.8 ? 'text-green-400' :
              promedioRotacion >= 0.5 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {promedioRotacion >= 0.8 ? 'Excelente' :
               promedioRotacion >= 0.5 ? 'Buena' :
               'Mejorable'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};