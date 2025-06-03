import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Rocket } from "lucide-react";

interface HeroProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const letters = titleRef.current.innerText.split("");
      titleRef.current.innerHTML = letters
        .map((l) => `<span class='inline-block opacity-0' style='transform: translateY(32px)'>${l === " " ? "&nbsp;" : l}</span>`)
        .join("");
      gsap.to(titleRef.current.querySelectorAll("span"), {
        opacity: 1,
        y: 0,
        stagger: 0.06,
        duration: 0.7,
        ease: "back.out(1.7)"
      });
    }
    if (subtitleRef.current) {
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, delay: 0.6, duration: 0.8, ease: "power2.out" }
      );
    }
    if (rocketRef.current) {
      gsap.fromTo(
        rocketRef.current,
        { y: 0 },
        {
          y: -30,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          duration: 0.8,
          delay: 1.2
        }
      );
    }
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1
        ref={titleRef}
        className="text-[clamp(2.5rem,8vw,6rem)] font-extrabold text-[#D94854] tracking-tight text-center"
        style={{ letterSpacing: "0.08em" }}
      >
        Notizap
      </h1>
      <p
        ref={subtitleRef}
        className="text-[clamp(1.2rem,3vw,2rem)] text-[#B695BF] font-semibold text-center"
      >
        Para Montella
      </p>
      <div className="flex gap-4 mt-6">
        <button
          onClick={onLoginClick}
          className="px-8 py-3 rounded-2xl text-lg font-bold bg-[#D94854] text-white shadow-lg hover:bg-[#F23D5E] transition"
        >
          Login
        </button>
      </div>
      <div ref={rocketRef} className="mt-10">
        <Rocket className="w-16 h-16 text-[#51590E] drop-shadow-xl" strokeWidth={2.2} />
      </div>
    </section>
  );
};