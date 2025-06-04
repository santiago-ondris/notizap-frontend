import React, { useState } from "react";
import { Navbar } from "@/components/Landing/Navbar";
import LoginForm from "@/components/Login/LoginForm";
import RegisterForm from "@/components/Login/RegisterForm";
import ForgotPasswordForm from "@/components/Login/ForgotPasswordForm";
import { useAuth } from "@/contexts/AuthContext";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div className="bg-[#212026] min-h-screen w-full">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
      />
      {showLogin && !isAuthenticated && (
        <LoginForm
          onSuccess={() => setShowLogin(false)}
          onClose={() => setShowLogin(false)}
          onShowRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
          onShowForgot={() => {
            setShowLogin(false);
            setShowForgot(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterForm
          onSuccess={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
          onClose={() => setShowRegister(false)}
        />
      )}
      {showForgot && (
        <ForgotPasswordForm onClose={() => setShowForgot(false)} />
      )}
      <main className="pt-8">{children}</main>
      <footer className="w-full py-4 flex justify-center border-t border-white/10 mt-auto">
        <span className="text-xs text-gray-400">© 2025 Montella | Powered by Notizap</span>
      </footer>
    </div>
  );
};

export default AppLayout;
