import React, { useState } from "react";
import { Navbar } from "@/components/Landing/Navbar";
import LoginForm from "@/components/Login/LoginForm";
import RegisterForm from "@/components/Login/RegisterForm";
import ForgotPasswordForm from "@/components/Login/ForgotPasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import "@/store/useArchivosAnalisis";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background con patrón sutil */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#212026]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(217, 72, 84, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(182, 149, 191, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(81, 89, 14, 0.02) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#D94854]/10 to-[#F23D5E]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#B695BF]/10 to-[#51590E]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLoginClick={() => setShowLogin(true)} />
        
        {/* Main content wrapper */}
        <main className="flex-1 pt-16">
          <div className="relative">
            {children}
          </div>
        </main>

        {/* Modern footer */}
        <footer className="relative mt-auto">
          
          <div className="bg-[#212026]">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold bg-gradient-to-r from-[#D94854] to-[#F23D5E] bg-clip-text text-transparent">
                    Notizap
                  </div>
                  <div className="hidden md:block w-px h-4 bg-white/20" />
                  <span className="text-sm text-gray-400">
                    Powered by Montella
                  </span>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    © 2025
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs">Sistema activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modal Forms */}
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
    </div>
  );
};

export default AppLayout;