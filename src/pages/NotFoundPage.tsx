import React from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div className="min-h-[70vh] flex items-center justify-center p-6">
    <div className="bg-[#1A1A20]/5 backdrop-blur-sm border border-[#1A1A20]/10 rounded-2xl p-8 max-w-md w-full text-center">
      <h1 className="text-6xl font-bold text-[#D94854] mb-4">404</h1>
      <p className="text-lg text-[#1A1A20]/70 mb-6">Página no encontrada</p>

      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 w-full bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] rounded-xl px-6 py-3 font-semibold transition-all duration-200"
      >
        <Home className="w-5 h-5" />
        Volver al inicio
      </Link>

      <p className="text-[#1A1A20]/50 text-xs mt-4">
        💡 No vuelvas aca...
      </p>
    </div>
  </div>
);

export default NotFoundPage;
