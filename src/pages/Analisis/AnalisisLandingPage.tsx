import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Building2, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AnalisisLandingPage: React.FC = () => {
  const navigate = useNavigate();

  const servicios = [
    {
      title: "Ventas Diarias y Acumuladas por Sucursal",
      description: "Visualización de ventas diarias y acumuladas por sucursal",
      icon: BarChart3,
      color: "#F23D5E",
      route: "/analisis/ventas-resumen",
      gradient: "from-[#F23D5E] to-[#D94854]"
    },
    {
      title: "Ventas de Productos Especificos por Sucursal", 
      description: "Ventas consolidadas y comparativas entre sucursales",
      icon: Building2,
      color: "#B695BF",
      route: "/analisis/ventas",
      gradient: "from-[#B695BF] to-[#9575A3]"
    },
    {
      title: "Gráfico de Evolución de Stock",
      description: "Tendencias temporales y evolución de métricas clave",
      icon: TrendingUp,
      color: "#51590E", 
      route: "/analisis/grafico",
      gradient: "from-[#51590E] to-[#6B7A0F]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A20] via-[#2D2D35] to-[#1A1A20] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Módulo de Análisis
          </h1>
          
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Selecciona el servicio que deseas consultar para obtener insights detallados 
            sobre el rendimiento de tu negocio
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {servicios.map((servicio, index) => {
            const IconComponent = servicio.icon;
            return (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                onClick={() => navigate(servicio.route)}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${servicio.gradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white/90">
                  {servicio.title}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {servicio.description}
                </p>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <Button
                    className={`bg-gradient-to-r ${servicio.gradient} hover:opacity-90 text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 group-hover:gap-3`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(servicio.route);
                    }}
                  >
                    Acceder
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <p className="text-white/50 text-sm">
              💡 <span className="text-white/70">Tip:</span> Todos los análisis incluyen filtros avanzados, 
              exportación de datos y visualizaciones interactivas
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalisisLandingPage;