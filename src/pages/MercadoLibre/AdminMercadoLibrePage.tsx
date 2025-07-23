import { useState } from "react";
import ReporteManualForm from "@/components/MercadoLibre/ReporteManualForm";
import AdsReportForm from "@/components/MercadoLibre/AdsReportForm";
import DisplayAdsForm from "@/components/MercadoLibre/DisplayAdsForm";
import { Link } from "react-router";
import { 
  FileText, 
  Target, 
  Monitor, 
  BarChart3, 
  ArrowRight,
  Shield
} from "lucide-react";
import React from "react";

export default function AdminMercadoLibrePage() {
  const [modo, setModo] = useState<"reportes" | "ads" | "display" >("reportes");

  const modos = [
    {
      key: "reportes",
      label: "Informe Ventas",
      icon: FileText,
      description: "Cargar datos manuales de ventas",
      emoji: "📋"
    },
    {
      key: "ads",
      label: "Product/Brand Ads",
      icon: Target,
      description: "Gestionar campañas publicitarias",
      emoji: "🎯"
    },
    {
      key: "display",
      label: "Display Ads",
      icon: Monitor,
      description: "Administrar anuncios display",
      emoji: "📺"
    },
  ];

  const getModoActual = () => modos.find(m => m.key === modo);

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header de la página */}
        <div className="relative mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#D94854]/20 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-[#D94854]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    🛠️ Administración MercadoLibre
                  </h1>
                  <p className="text-white/60 text-sm">
                    Panel de control para gestionar datos y reportes
                  </p>
                </div>
              </div>
              
              <Link
                to="/mercadolibre/"
                className="flex items-center gap-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] font-semibold px-4 py-2 rounded-xl transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Ver Reportes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {modos.map((modoItem) => {
                const IconComponent = modoItem.icon;
                const isActive = modo === modoItem.key;
                
                return (
                  <button
                    key={modoItem.key}
                    onClick={() => setModo(modoItem.key as any)}
                    className={`
                      group relative p-4 rounded-xl transition-all duration-200 text-left
                      ${isActive 
                        ? 'bg-[#D94854]/20 border border-[#D94854]/30' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-[#D94854]/30 text-[#D94854]' 
                          : 'bg-white/10 text-white/60 group-hover:text-white/80'
                        }
                      `}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{modoItem.emoji}</span>
                          <h3 className={`
                            font-semibold text-sm truncate
                            ${isActive ? 'text-[#D94854]' : 'text-white group-hover:text-white'}
                          `}>
                            {modoItem.label}
                          </h3>
                        </div>
                        <p className={`
                          text-xs leading-tight
                          ${isActive ? 'text-[#D94854]/80' : 'text-white/50 group-hover:text-white/70'}
                        `}>
                          {modoItem.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-[#D94854] rounded-full animate-pulse" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Título de la sección activa */}
        {getModoActual() && (
          <div className="mb-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#D94854]/20 p-2 rounded-lg">
                  {React.createElement(getModoActual()!.icon, { 
                    className: "w-5 h-5 text-[#D94854]" 
                  })}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {getModoActual()!.emoji} {getModoActual()!.label}
                  </h2>
                  <p className="text-white/60 text-sm">{getModoActual()!.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del modo seleccionado */}
        <div className="flex justify-center">
          {modo === "reportes" && <ReporteManualForm />}
          {modo === "ads" && <AdsReportForm />}
          {modo === "display" && <DisplayAdsForm />}
        </div>
      </div>
    </div>
  );
}