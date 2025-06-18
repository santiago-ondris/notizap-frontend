import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, Shield, Home } from "lucide-react";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, openLoginModal } = useAuth();

  // Si no está autenticado, muestra mensaje para iniciar sesión
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="bg-[#1A1A20]/5 backdrop-blur-sm border border-[#1A1A20]/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-[#B695BF]/20 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-8 h-8 text-[#B695BF]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A20] mb-2">🔐 Iniciar Sesión Requerido</h2>
            <p className="text-[#1A1A20]/70 text-sm">
              Necesitas iniciar sesión para acceder a esta sección del dashboard
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={openLoginModal}
              className="w-full bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] rounded-xl px-6 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </button>

            <a
              href="/"
              className="w-full bg-[#1A1A20]/10 hover:bg-[#1A1A20]/20 border border-[#1A1A20]/20 text-[#1A1A20]/70 rounded-xl px-6 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al Inicio
            </a>
          </div>

          <p className="text-[#1A1A20]/50 text-xs mt-4">
            💡 Si no tienes acceso, contacta al administrador
          </p>
        </div>
      </div>
    );
  }

  // Si el rol no está permitido, muestra mensaje de permisos
  if (!role || !allowedRoles.includes(role)) {
    const roleNames: Record<string, string> = {
      viewer: "Visualizador",
      admin: "Administrador",
      superadmin: "Super Administrador"
    };
    const requiredRoles = allowedRoles
      .map(r => roleNames[r] || r)
      .join(", ");

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
        <div className="bg-[#1A1A20]/5 backdrop-blur-sm border border-[#1A1A20]/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-[#D94854]/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-[#D94854]" />
            </div>
            <h2 className="text-2xl font-bold text-[#D94854] mb-2">⚠️ Acceso Restringido</h2>
            <p className="text-[#1A1A20]/70 text-sm mb-4">
              No tienes los permisos necesarios para acceder a esta sección
            </p>

            <div className="bg-[#1A1A20]/5 rounded-lg p-3 mb-4">
              <p className="text-[#1A1A20]/60 text-xs mb-1">Tu rol actual:</p>
              <span className="inline-block bg-[#B695BF]/20 text-[#B695BF] px-2 py-1 rounded text-sm font-medium">
                {role ? roleNames[role] : "Rol desconocido"}
              </span>

              <p className="text-[#1A1A20]/60 text-xs mt-2 mb-1">Roles requeridos:</p>
              <span className="inline-block bg-[#51590E]/20 text-[#51590E] px-2 py-1 rounded text-sm font-medium">
                {requiredRoles}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="/"
              className="w-full bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] rounded-xl px-6 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Volver al Dashboard
            </a>
          </div>

          <p className="text-[#1A1A20]/50 text-xs mt-4">
            🙋‍♂️ Contacta al administrador si necesitas acceso adicional
          </p>
        </div>
      </div>
    );
  }

  // Si todo está OK, renderiza la ruta
  return <>{children}</>;
};
