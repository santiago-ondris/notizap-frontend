import React, { useEffect, useRef } from "react";
import { Rocket } from "lucide-react";
import gsap from "gsap";

interface HeroProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  // Refs para ambos cohetes
  const rocketLeftRef = useRef<HTMLDivElement>(null);
  const rocketRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animación rebote en ambos cohetes (sólo desktop)
    if (rocketLeftRef.current) {
      gsap.fromTo(
        rocketLeftRef.current,
        { y: 0 },
        {
          y: -30,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          duration: 0.8,
          delay: 1.2,
        }
      );
    }
    if (rocketRightRef.current) {
      gsap.fromTo(
        rocketRightRef.current,
        { y: 0 },
        {
          y: -30,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          duration: 0.8,
          delay: 1.4, // Leve desfase para que no vayan exactos
        }
      );
    }
  }, []);

  return (
    <section
      className="relative flex items-center justify-center min-h-[60vh] w-full py-16 bg-gradient-to-br from-[#26263a] via-[#2f283a] to-[#1a1c23] overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 16px 16px",
      }}
    >
      {/* SVG decorations... */}

      <div
        ref={rocketLeftRef}
        className="hidden md:block absolute left-[16vw] top-1/2 -translate-y-1/2 z-10 opacity-40"
      >
        <Rocket className="w-28 h-28 text-[#51590E]" strokeWidth={2.2} />
      </div>
      <div
        ref={rocketRightRef}
        className="hidden md:block absolute right-[16vw] top-1/2 -translate-y-1/2 z-10 opacity-40"
      >
        <Rocket className="w-28 h-28 text-[#51590E]" strokeWidth={2.2} />
      </div>

      {/* Central glass card */}
      <div className="relative z-20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl px-14 py-10 shadow-2xl border border-white/10 max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-extrabold text-[#D94854] tracking-tight text-center drop-shadow-sm">
          Notizap
        </h1>
        <p className="mt-2 text-2xl text-[#B695BF] font-semibold text-center">
          Para Montella
        </p>
        <button
          onClick={onLoginClick}
          className="mt-7 px-10 py-3 rounded-xl text-lg font-bold bg-[#D94854] text-white shadow-lg hover:bg-[#F23D5E] transition"
        >
          Login
        </button>
      </div>
      {/* Otros decorativos opcionales */}
      <svg className="absolute top-0 left-0 w-32 h-32 opacity-40" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="#B695BF" fillOpacity="0.1" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-48 h-48 opacity-30" viewBox="0 0 200 200">
        <rect x="40" y="40" width="120" height="120" rx="60" fill="#D94854" fillOpacity="0.1" />
      </svg>
      <svg className="absolute top-1/3 right-0 w-28 h-20 opacity-10" viewBox="0 0 200 80">
        <ellipse cx="100" cy="40" rx="90" ry="30" fill="#51590E" fillOpacity="0.5" />
      </svg>
    </section>
  );
};
