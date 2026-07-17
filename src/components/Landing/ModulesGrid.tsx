import { ModuleCard } from "./ModuleCard";
import {
  Repeat,
  BarChart3,
  Grid3X3,
  Lock,
  Fish,
  ShoppingBag,
  ImagePlus,
  LineChart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ventasVendedorasService } from "@/services/vendedoras/ventasVendedorasService";
import { vendedorasKeys } from "@/hooks/vendedoras/useVentasVendedoras";

const modules = [
  {
    title: "Reposicion stock",
    description: "Reposicion de stock por sucursal full rápido",
    icon: BarChart3,
    color: "#F23D5E",
    to: "/reposicion",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Cambios/Devoluciones",
    description: "Gestión de cambios y devoluciones",
    icon: Repeat,
    color: "#51590E",
    to: "/cambios",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Vendedoras",
    description: "Rendimientos por sucursal y comisiones",
    icon: Fish,
    color: "#B695BF",
    to: "/vendedoras",
    roles: ["admin", "superadmin", "hr"]
  },
  {
    title: "Catálogo Meta",
    description: "Gestión de catálogo para anuncios",
    icon: ShoppingBag,
    color: "#1877F2",
    to: "/meta-catalog",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Conversor de Imagenes",
    description: "Optimizacion de imagenes a WebP",
    icon: ImagePlus,
    color: "#22C55E",
    to: "/conversor-imagenes",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Evolucion stock",
    description: "Compras, ventas, rotacion y remitos internos",
    icon: LineChart,
    color: "#F23D5E",
    to: "/evolucion-stock",
    roles: ["admin", "superadmin"]
  }
];

export const ModulesGrid: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const queryClient = useQueryClient();

  const precargarModulo = (ruta: string) => {
    if (ruta === '/vendedoras') {
      void import('@/pages/Vendedoras/VentasVendedorasPage');
      void queryClient.prefetchQuery({
        queryKey: vendedorasKeys.initialData(),
        queryFn: () => ventasVendedorasService.obtenerDatosIniciales(),
        staleTime: 1000 * 60 * 30
      });
    } else if (ruta === '/cambios') {
      void import('@/pages/Cambios/CambiosPage');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="py-20 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Grid3X3 className="w-4 h-4 text-[#B695BF]" />
            <span className="text-sm text-white/80 font-medium">Módulos del sistema</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Jovito
          </h2>
        </div>

        {/* Login prompt */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            {/* Glassmorphism card */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D94854]/20 to-[#F23D5E]/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#D94854]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Acceso requerido
              </h3>
              <p className="text-white/70 mb-8 leading-relaxed">
                Inicio de sesión obligatorio
              </p>
            </div>

            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D94854]/10 to-[#B695BF]/10 rounded-2xl -z-10"></div>
          </div>
        </div>
      </section>
    );
  }

  // Filter modules by role
  const filteredModules = modules.filter((mod) => mod.roles.includes(role!));

  return (
    <section id="modules-section" className="py-20 max-w-4xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
          <Grid3X3 className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/80 font-medium">Módulos disponibles</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Panel de modulos
        </h2>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredModules.map((module, index) => (
          <div
            key={module.title}
            className="opacity-0 animate-fadeIn"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <ModuleCard {...module} onIntent={() => precargarModulo(module.to)} />
          </div>
        ))}
      </div>

      {/* Role indicator */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-[#B695BF] animate-pulse"></div>
          <span className="text-sm text-white/60">
            Mostrando {filteredModules.length} módulos para rol:
            <span className="text-[#B695BF] font-semibold ml-1 uppercase">{role}</span>
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
          }
        `}
      </style>
    </section>
  );
};
