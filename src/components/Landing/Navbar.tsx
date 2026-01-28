import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const location = useLocation();
  const { isAuthenticated, username, email, role, logout } = useAuth();
  const isLanding = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      {/* Backdrop blur container */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${isScrolled
          ? 'bg-[#212026] shadow-lg shadow-black/20'
          : 'bg-[#212026]'
        }
      `}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Left side - Logo and nav items */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link
                to="/"
                className="group flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D94854] to-[#F23D5E] flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#D94854] to-[#F23D5E] opacity-0 group-hover:opacity-20 transition-opacity blur-md" />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">
                  Notizap
                </span>
              </Link>

              {/* Navigation items */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/"
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${isLanding
                      ? "bg-gradient-to-r from-[#D94854] to-[#F23D5E] text-white shadow-lg shadow-[#D94854]/25"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <Home className="w-4 h-4" />
                  Inicio
                </Link>

                {isAuthenticated && role === "superadmin" && (
                  <Link
                    to="/usuarios"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-[#B695BF] to-[#B695BF]/80 text-[#212026] hover:from-[#F23D5E] hover:to-[#D94854] hover:text-white transition-all shadow-lg shadow-[#B695BF]/25"
                  >
                    <Users className="w-4 h-4" />
                    Usuarios
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - User menu or login */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B695BF] to-[#D94854] flex items-center justify-center text-white text-sm font-semibold">
                      {(username || email)?.charAt(0).toUpperCase()}
                    </div>

                    {/* User info */}
                    <div className="hidden md:block text-left">
                      <div className="text-white text-sm font-medium">
                        {username || email}
                      </div>
                      <div className="text-xs text-[#B695BF] font-medium uppercase tracking-wide">
                        {role}
                      </div>
                    </div>

                    <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#212026]/FE border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                        <div className="text-white font-medium">
                          {username || email}
                        </div>
                        <div className="text-xs text-[#B695BF] mt-1 flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full bg-[#B695BF]/20 text-[#B695BF] uppercase font-bold tracking-wide">
                            {role}
                          </span>
                        </div>
                      </div>

                      {/* Mobile navigation items */}
                      <div className="md:hidden border-b border-white/10">
                        <Link
                          to="/"
                          className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Home className="w-4 h-4" />
                          Inicio
                        </Link>
                        {role === "superadmin" && (
                          <Link
                            to="/usuarios"
                            className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Users className="w-4 h-4" />
                            Usuarios
                          </Link>
                        )}
                      </div>

                      {/* Logout button */}
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D94854] to-[#F23D5E] text-white font-medium hover:shadow-lg hover:shadow-[#D94854]/25 transition-all transform hover:scale-105"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};