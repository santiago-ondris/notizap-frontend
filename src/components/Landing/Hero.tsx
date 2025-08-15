import React, { useEffect, useRef } from "react";
import { Rocket, ArrowRight, Sparkles } from "lucide-react";

interface HeroProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  const rocketLeftRef = useRef<HTMLDivElement>(null);
  const rocketRightRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftRocket = rocketLeftRef.current;
    const rightRocket = rocketRightRef.current;
    
    if (leftRocket) {
      leftRocket.style.animation = 'float 3s ease-in-out infinite';
      leftRocket.style.animationDelay = '0s';
    }
    if (rightRocket) {
      rightRocket.style.animation = 'float 3s ease-in-out infinite';
      rightRocket.style.animationDelay = '1s';
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(217, 72, 84, 0.3); }
          50% { box-shadow: 0 0 40px rgba(217, 72, 84, 0.6), 0 0 60px rgba(242, 61, 94, 0.4); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
        }
      `}</style>
      
      <section 
        ref={heroRef}
        className="relative flex items-center justify-center min-h-[80vh] w-full px-6 pt-20 pb-20 overflow-hidden"
      >
        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated sparkles */}
          <div className="absolute top-1/4 left-1/4 text-[#B695BF]">
            <Sparkles className="w-6 h-6 opacity-40" style={{ animation: 'sparkle 4s ease-in-out infinite' }} />
          </div>
          <div className="absolute top-3/4 right-1/4 text-[#51590E]">
            <Sparkles className="w-4 h-4 opacity-30" style={{ animation: 'sparkle 3s ease-in-out infinite 1s' }} />
          </div>
          <div className="absolute top-1/2 right-1/3 text-[#D94854]">
            <Sparkles className="w-5 h-5 opacity-20" style={{ animation: 'sparkle 5s ease-in-out infinite 2s' }} />
          </div>
        </div>

        {/* Floating rockets */}
        <div
          ref={rocketLeftRef}
          className="hidden lg:block absolute left-[12%] top-1/2 -translate-y-1/2 text-[#51590E]/40 transform -rotate-12"
        >
          <Rocket className="w-24 h-24" strokeWidth={1.5} />
        </div>
        <div
          ref={rocketRightRef}
          className="hidden lg:block absolute right-[12%] top-1/2 -translate-y-1/2 text-[#B695BF]/40 transform rotate-12"
        >
          <Rocket className="w-20 h-20" strokeWidth={1.5} />
        </div>

        {/* Main hero content */}
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 hover:bg-white/10 transition-all cursor-default">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-white/80 font-medium">Gracias al team E-Commerce</span>
          </div>

          {/* Main heading */}
          <div className="space-y-4 mb-8">
            <h1 className="text-6xl md:text-7xl lg:text-9xl font-black tracking-tight">
              <span className="block bg-gradient-to-r from-[#D94854] via-[#F23D5E] to-[#D94854] bg-clip-text text-transparent drop-shadow-2xl">
                Notizap
              </span>
            </h1>
            <div className="space-y-2">
              <p className="text-xl md:text-2xl text-[#B695BF] font-semibold">
                Plataforma integral para
              </p>
              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Montella
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            Soluciones para el día a día de los equipos de e-commerce y marketing de Montella, más
            análisis de datos de la empresa.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLoginClick}
              className="group relative px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#D94854] to-[#F23D5E] text-white shadow-2xl hover:shadow-[#D94854]/25 transition-all duration-300 transform hover:scale-105 hover:rotate-1"
              style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Acceder al sistema
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#F23D5E] to-[#D94854] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>
            
            <button 
              onClick={() => {
                const modulesSection = document.getElementById('modules-section');
                modulesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-xl font-semibold text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Ver módulos
            </button>
          </div>

          {/* Stats or features preview */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#D94854]">26</div>
              <div className="text-white/60 text-sm">Yona, Carito, Viejito, Bianquita</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#B695BF]">03</div>
              <div className="text-white/60 text-sm">Nacho, equipo redes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#51590E]">2001</div>
              <div className="text-white/60 text-sm">Maria Pilar</div>
            </div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#D94854]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#B695BF]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#51590E]/5 rounded-full blur-3xl" />
        </div>
      </section>
    </>
  );
};