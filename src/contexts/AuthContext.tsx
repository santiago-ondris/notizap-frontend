import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/authService";
import LoginForm from "@/components/Login/LoginForm";

interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  username: string | null;
  email: string | null;
  login: (data: authService.LoginRequest) => Promise<void>;
  register: (data: authService.RegisterRequest) => Promise<void>;
  logout: () => void;
  openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem("userRole"));
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem("userName"));
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem("userEmail"));

  // Estado para controlar el LoginForm
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
    setRole(localStorage.getItem("userRole"));
    setUsername(localStorage.getItem("userName"));
    setEmail(localStorage.getItem("userEmail"));
  }, []);

  const login = async (data: authService.LoginRequest) => {
    const res = await authService.login(data);
    localStorage.setItem("token", res.token);
    localStorage.setItem("userRole", res.role);
    localStorage.setItem("userName", res.username || "");
    localStorage.setItem("userEmail", res.email || "");
    setIsAuthenticated(true);
    setRole(res.role);
    setUsername(res.username || "");
    setEmail(res.email || "");
  };

  const register = async (data: authService.RegisterRequest) => {
    await authService.register(data);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    setEmail(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  };

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        username,
        email,
        login,
        register,
        logout,
        openLoginModal,
      }}
    >
      {children}

      {/* Mostrar LoginForm cuando se requiera autenticación */}
      {loginModalOpen && (
        <LoginForm
          onSuccess={closeLoginModal}
          onClose={closeLoginModal}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
