import React from "react";
import { TrendingUp, NotepadTextDashed, LineChart, FileArchive, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VentasPageHeaderProps {
  navigate: any;
  onReset: () => void;
  archivosInfo: {
    ventas: File | null;
    fecha: string | null;
  };
}

export const VentasPageHeader: React.FC<VentasPageHeaderProps> = ({ 
  navigate, 
  onReset, 
  archivosInfo 
}) => {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/60 text-sm">Módulos</span>
        <span className="text-white/40">/</span>
        <span className="text-white/60 text-sm">Análisis de Stock</span>
        <span className="text-white/40">/</span>
        <span className="text-[#D94854] text-sm font-medium">Análisis de Ventas</span>
      </div>

      {/* Main Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D94854] to-[#F23D5E] flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Análisis de Ventas Diarias
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Visualiza la evolución de ventas por producto, sucursal y color con comparativas temporales
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
          onClick={() => navigate("/analisis/ventas/resumen")}
          className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#B695BF] to-[#51590E] hover:from-[#51590E] hover:to-[#B695BF] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#B695BF]/25 transition-all transform hover:scale-105"
        >
          <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Resumen por sucursal</span>
        </Button>
        
        <Button
          onClick={() => navigate("/analisis/grafico")}
          className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#51590E] to-[#B695BF] hover:from-[#B695BF] hover:to-[#51590E] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#B695BF]/25 transition-all transform hover:scale-105"
        >
          <LineChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Ver evolución de stock</span>
        </Button>

        <Button
          onClick={onReset}
          className="group flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#B695BF] to-[#51590E] hover:from-[#51590E] hover:to-[#B695BF] text-white font-semibold rounded-xl shadow-lg hover:shadow-[#B695BF]/25 transition-all transform hover:scale-105"
        >
          <FileArchive className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Subir otros archivos</span>
        </Button>
      </div>

      {/* Info de archivos cargados */}
      {archivosInfo.ventas && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 max-w-2xl mx-auto">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B695BF]" />
            Archivo cargado
          </h3>
          <div className="text-white/70 text-sm space-y-1">
            <div>
              Archivo: <span className="font-semibold text-[#D94854]">{archivosInfo.ventas.name}</span>
            </div>
            {archivosInfo.fecha && (
              <div>
                Último análisis: <span className="font-semibold text-white/80">
                  {new Date(archivosInfo.fecha).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};