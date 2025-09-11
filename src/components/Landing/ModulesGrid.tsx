import { ModuleCard } from "./ModuleCard";
import {
  Mail,
  Repeat,
  Send,
  BarChart3,
  User,
  Grid3X3,
  Lock,
  Fish,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
    title: "Mailing",
    description: "Campañas y métricas de Mailchimp",
    icon: Mail,
    color: "#B695BF",
    to: "/mailing",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Clientes",
    description: "Comportamientos de compra y segmentación",
    icon: User,
    color: "#F23D5E",
    to: "/clientes",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Envíos",
    description: "Envíos diarios y resúmenes por tipo",
    icon: Send,
    color: "#B695BF",
    to: "/envios",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Cambios/Devoluciones",
    description: "Gestión de cambios y devoluciones",
    icon: Repeat,
    color: "#F23D5E",
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
  }
];

export const ModulesGrid: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return (
      <section className="py-20 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
            <Grid3X3 className="w-4 h-4 text-[#B695BF]" />
            <span className="text-sm text-white/80 font-medium">Módulos del sistema</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Herramientas integradas
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Accede a todos los módulos disponibles
          </p>
        </div>

        {/* Login prompt */}
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            {/* Glassmorphism card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center max-w-md mx-auto shadow-2xl">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#D94854]/20 to-[#F23D5E]/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#D94854]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Acceso requerido
              </h3>
              <p className="text-white/70 mb-8 leading-relaxed">
                Inicia sesión para acceder a todos los módulos y herramientas de gestión de Notizap
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-2 h-2 rounded-full bg-[#51590E]"></div>
                  <span>Análisis en tiempo real</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-2 h-2 rounded-full bg-[#B695BF]"></div>
                  <span>Gestión centralizada</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <div className="w-2 h-2 rounded-full bg-[#D94854]"></div>
                  <span>Reportes automatizados</span>
                </div>
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#D94854]/10 to-[#B695BF]/10 rounded-2xl blur-xl -z-10"></div>
          </div>
        </div>
      </section>
    );
  }

  // Filter modules by role
  const filteredModules = modules.filter((mod) => mod.roles.includes(role!));

  return (
    <section id="modules-section" className="py-20 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-6">
          <Grid3X3 className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/80 font-medium">Módulos disponibles</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Panel de control
        </h2>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module, index) => (
          <div
            key={module.title}
            className="opacity-0 animate-fadeIn"
            style={{ 
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <ModuleCard {...module} />
          </div>
        ))}
      </div>

      {/* Role indicator */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
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