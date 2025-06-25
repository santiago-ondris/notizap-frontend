import { ModuleCard } from "./ModuleCard";
import {
  ShoppingCart,
  Instagram,
  Mail,
  DollarSign,
  Package,
  Repeat,
  Send,
  Megaphone,
  Image,
  BarChart3,
  Receipt,
  User,
  Grid3X3,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    title: "Analisis stock",
    description: "Tasa de rotación y gráfico de evolución",
    icon: BarChart3,
    color: "#F23D5E",
    to: "/analisis",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Mailing",
    description: "Campañas y métricas de Mailchimp",
    icon: Mail,
    color: "#51590E",
    to: "/mailing",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Clientes",
    description: "Analisis de clientes de Montella",
    icon: User,
    color: "#B695BF",
    to: "/clientes",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "MercadoLibre",
    description: "Estadísticas y reportes manuales",
    icon: DollarSign,
    color: "#F23D5E",
    to: "/mercadolibre",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Gastos",
    description: "Control y registro de gastos mensuales",
    icon: Package,
    color: "#51590E",
    to: "/gastos",
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
    description: "Gestión estructurada de cambios y devoluciones",
    icon: Repeat,
    color: "#F23D5E",
    to: "/cambios",
    roles: ["admin", "superadmin"]
  },
  {
    title: "Publicidad",
    description: "Métricas y campañas publicitarias",
    icon: Megaphone,
    color: "#51590E",
    to: "/publicidad",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Procesador de Imágenes",
    description: "Redimensiona, convierte y descarga imágenes",
    icon: Image,
    color: "#B695BF",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "WooCommerce",
    description: "Ventas, productos y reportes de tienda",
    icon: ShoppingCart,
    color: "#F23D5E",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Mayorista",
    description: "Gestion de clientes mayoristas",
    icon: Receipt,
    color: "#51590E",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Instagram",
    description: "Reels, posteos, historias y seguidores",
    icon: Instagram,
    color: "#B695BF",
    roles: ["viewer", "admin", "superadmin"]
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