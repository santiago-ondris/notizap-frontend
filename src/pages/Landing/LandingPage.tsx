import React, { useState } from "react";
import { Hero } from "@/components/Landing/Hero";
import { ModulesGrid } from "@/components/Landing/ModulesGrid";
import LoginForm from "@/components/Login/LoginForm";
import RegisterForm from "@/components/Login/RegisterForm";
import ForgotPasswordForm from "@/components/Login/ForgotPasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Landing/Navbar";

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div className="bg-gradient-to-b from-[#23232e] to-[#191922] min-h-screen flex flex-col">
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
          onSuccess={() => setShowRegister(false)}
          onClose={() => setShowRegister(false)}
        />
      )}
      {showForgot && (
        <ForgotPasswordForm onClose={() => setShowForgot(false)} />
      )}
      <main className="pt-2 flex-1 flex flex-col">
        <Hero 
         onLoginClick={() => setShowLogin(true)}
         onRegisterClick={() => setShowRegister(true)}
        />
        <ModulesGrid />
      </main>
    </div>
  );
};

export default LandingPage;
