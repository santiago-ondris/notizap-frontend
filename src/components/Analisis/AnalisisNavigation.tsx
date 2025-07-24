import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, Building2, TrendingUp } from "lucide-react";

interface NavigationItem {
  key: string;
  title: string;
  icon: React.ElementType;
  route: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    key: "home",
    title: "Inicio",
    icon: Home,
    route: "/analisis",
    color: "#B695BF"
  },
  {
    key: "ventas-resumen", 
    title: "Ventas Resumen",
    icon: BarChart3,
    route: "/analisis/ventas-resumen",
    color: "#F23D5E"
  },
  {
    key: "ventas",
    title: "Ventas Productos",
    icon: Building2, 
    route: "/analisis/ventas",
    color: "#B695BF"
  },
  {
    key: "grafico",
    title: "Evolución", 
    icon: TrendingUp,
    route: "/analisis/grafico",
    color: "#51590E"
  }
];

export const AnalisisNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentRoute = () => {
    const path = location.pathname;
    
    if (path === "/analisis") return "/analisis";
    if (path.startsWith("/analisis/ventas-resumen")) return "/analisis/ventas-resumen";
    if (path.startsWith("/analisis/ventas")) return "/analisis/ventas";
    if (path.startsWith("/analisis/grafico")) return "/analisis/grafico";
    
    return "/analisis";
  };

  const currentRoute = getCurrentRoute();

  return (
    <div className="inline-block bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6 mx-auto">
      
      {/* Simple breadcrumb */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span>Análisis</span>
          <span className="text-white/40">/</span>
          <span className="text-white/80">
            {navigationItems.find(item => item.route === currentRoute)?.title || "Inicio"}
          </span>
        </div>
      </div>

      {/* Compact navigation */}
      <div className="inline-flex items-center gap-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentRoute === item.route;
          
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-white/15 text-white border border-white/20' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }
              `}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ 
                  color: isActive ? item.color : undefined 
                }} 
              />
              <span className="hidden sm:block">{item.title}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};