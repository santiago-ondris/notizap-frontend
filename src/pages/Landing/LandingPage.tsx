import React, { useState } from "react";
import { Hero } from "@/components/Landing/Hero";
import { ModulesGrid } from "@/components/Landing/ModulesGrid";
import LoginForm from "@/components/Login/LoginForm";
import RegisterForm from "@/components/Login/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="relative">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]" />
        
        {/* Animated mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, rgba(217, 72, 84, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(182, 149, 191, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(81, 89, 14, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Hero 
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
        />
        
        {/* Separator with gradient line */}
        <div className="relative py-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-[#212026] px-6">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#D94854] to-[#F23D5E] animate-pulse" />
            </div>
          </div>
        </div>
        
        <ModulesGrid />
      </div>

      {/* Modal Forms */}
      {showLogin && !isAuthenticated && (
        <LoginForm
          onSuccess={() => setShowLogin(false)}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showRegister && (
        <RegisterForm
          onSuccess={() => setShowRegister(false)}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
};

export default LandingPage;