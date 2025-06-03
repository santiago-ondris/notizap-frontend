import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no está permitido, muestra mensaje o redirige
  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <h2 className="text-xl text-[#D94854] font-semibold mb-4">Acceso restringido</h2>
        <p className="text-gray-300 mb-6">No tienes permisos para acceder a esta sección.</p>
        <a
          href="/"
          className="px-4 py-2 bg-[#B695BF] text-[#212026] rounded-xl font-semibold hover:bg-[#F23D5E] hover:text-white transition"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
