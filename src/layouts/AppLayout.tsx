import React from "react";
import { Navbar } from "@/components/Landing/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import "@/store/useArchivosAnalisis";

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { openLoginModal } = useAuth();

  return (
    <div className="relative min-h-screen w-full">
      {/* Background simplificado */}
      <div
        className="fixed inset-0 bg-[#1A1D22]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(217, 72, 84, 0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(182, 149, 191, 0.02) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLoginClick={openLoginModal} />

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
    </div>
  );
};

export default AppLayout;