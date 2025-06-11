import React from "react";
import { LineChart, NotepadTextDashed, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EvolucionPageHeaderProps {
  navigate: any;
}

export const EvolucionPageHeader: React.FC<EvolucionPageHeaderProps> = ({ navigate }) => {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-sm">Módulos</span>
        <span className="text-white/40">/</span>
        <span className="text-white/60 text-sm">Análisis de Stock</span>
        <span className="text-white/40">/</span>
        <span className="text-[#D94854] text-sm font-medium">Evolución de Stock</span>
      </div>

      {/* Main Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#51590E] to-[#B695BF] flex items-center justify-center shadow-lg">
            <LineChart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Evolución de Stock
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Visualiza la evolución temporal del stock de un producto específico
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <Button
          onClick={() => navigate("/analisis")}
          className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#D94854] to-[#F23D5E] hover:from-[#F23D5E] hover:to-[#D94854] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#D94854]/25 transition-all transform hover:scale-105"
        >
          <NotepadTextDashed className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Volver a análisis de rotación</span>
        </Button>
        
        <Button
          onClick={() => navigate("/analisis/ventas")}
          className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#51590E] to-[#B695BF] hover:from-[#B695BF] hover:to-[#51590E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#B695BF]/25 transition-all transform hover:scale-105"
        >
          <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Ver evolución de ventas</span>
        </Button>
      </div>
    </div>
  );
};