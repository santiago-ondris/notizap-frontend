import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const location = useLocation();
  const { isAuthenticated, username, email, role, logout } = useAuth();
  const isLanding = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 w-full z-20 bg-[#212026]/80 backdrop-blur border-b border-[#B695BF]/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-extrabold text-2xl text-[#D94854] tracking-wide hover:opacity-90 transition">
            Notizap
          </Link>
          <Link
            to="/"
            className={`flex items-center gap-1 px-3 py-1 rounded text-base font-semibold transition
              ${isLanding ? "bg-[#D94854] text-white" : "text-white/80 hover:bg-[#D94854] hover:text-white"}`}
            title="Ir al inicio"
          >
            <Home className="w-5 h-5" />
            Inicio
          </Link>
          {isAuthenticated && role === "superadmin" && (
            <Link
              to="/usuarios"
              className="flex items-center gap-1 px-3 py-1 rounded font-semibold text-base bg-[#B695BF] text-[#212026] hover:bg-[#F23D5E] hover:text-white transition"
              title="Gestión de usuarios"
            >
              <UsersIcon className="w-5 h-5" />
              Usuarios
            </Link>
          )}
        </div>
        <div className="flex gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-semibold text-sm">
                {username || email}
                <span className="ml-2 px-2 py-1 rounded bg-[#B695BF]/30 text-[#B695BF] text-xs font-bold uppercase">
                  {role}
                </span>
              </span>
              <button
                className="text-white/80 hover:text-white font-semibold px-3 py-1 rounded transition"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
          {!isAuthenticated && (
            <button
              className="text-white/80 hover:text-white font-semibold px-3 py-1 rounded transition"
              onClick={onLoginClick}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
