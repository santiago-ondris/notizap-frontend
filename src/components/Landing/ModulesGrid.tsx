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
  ImageIcon,
  ChartNoAxesCombined
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    title: "Analisis stock",
    description: "Tasa de rotación y gráfico de evolución",
    icon: ChartNoAxesCombined,
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
    title: "Instagram",
    description: "Reels, posteos, historias y seguidores",
    icon: Instagram,
    color: "#B695BF",
    to: "/instagram",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "MercadoLibre",
    description: "Estadísticas y reportes manuales",
    icon: DollarSign,
    color: "#D94854",
    to: "/mercadolibre",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Gastos",
    description: "Control y registro de gastos mensuales",
    icon: Package,
    color: "#B695BF",
    to: "/gastos",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Envíos",
    description: "Envíos diarios y resúmenes por tipo",
    icon: Send,
    color: "#F23D5E",
    to: "/envios",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "Cambios/Devoluciones",
    description: "Gestión estructurada de cambios y devoluciones",
    icon: Repeat,
    color: "#D94854",
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
    description: "Redimensiona, convierte y descarga imágenes en lote",
    icon: ImageIcon,
    color: "#F23D5E",
    to: "/procesador-imagenes",
    roles: ["viewer", "admin", "superadmin"]
  },
  {
    title: "WooCommerce",
    description: "Ventas, productos y reportes de tienda",
    icon: ShoppingCart,
    color: "#F23D5E",
    to: "/woocommerce",
    roles: ["viewer", "admin", "superadmin"]
  }
];

export const ModulesGrid: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated)
    return (
      <section className="pt-4 pb-10 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 flex justify-center items-center gap-3 relative">
          <span>Módulos principales</span>
        </h2>
        <div className="flex justify-center items-center py-24">
          <span className="text-lg text-gray-300">
            Inicia sesión para acceder a los módulos de Notizap.
          </span>
        </div>
      </section>
    );

  // Filtrar los módulos por rol
  const filteredModules = modules.filter((mod) => mod.roles.includes(role!));

  return (
    <section className="pt-4 pb-10 max-w-6xl mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 flex justify-center items-center gap-3 relative">
        <span>Módulos principales</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredModules.map((mod) => (
          <ModuleCard key={mod.title} {...mod} />
        ))}
      </div>
    </section>
  );
};
