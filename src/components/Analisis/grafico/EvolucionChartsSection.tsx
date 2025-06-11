// components/Analisis/grafico/EvolucionChartsSection.tsx
import React from "react";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { type EvolucionStockPorPuntoDeVenta } from "@/types/analisis/analisis";
import { EvolucionStockChart } from "./EvolucionStockChart";

interface EvolucionChartsSectionProps {
  data: EvolucionStockPorPuntoDeVenta[];
}

export const EvolucionChartsSection: React.FC<EvolucionChartsSectionProps> = ({ data }) => {
  // Filtrar datos globales
  const dataGlobal = data.filter((d) => d.puntoDeVenta === "GLOBAL");

  // Calcular estadísticas generales
  const totalPuntosDeVenta = data.length;
  const puntosConDatos = data.filter(d => d.evolucion && d.evolucion.length > 0).length;

  if (dataGlobal.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No hay datos disponibles</h3>
            <p className="text-white/60">
              No se encontraron datos de evolución de stock para el producto seleccionado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <BarChart3 className="w-7 h-7 text-[#51590E]" />
              Evolución de Stock
            </h2>
            <p className="text-white/60">
              Visualización temporal del comportamiento del stock del producto seleccionado
            </p>
          </div>
          
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#51590E]">
                {totalPuntosDeVenta}
              </div>
              <div className="text-white/60 text-xs">
                Puntos de venta
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#B695BF]">
                {puntosConDatos}
              </div>
              <div className="text-white/60 text-xs">
                Con datos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="space-y-6">
        {dataGlobal.map((sucursal) => (
          <EvolucionStockChart 
            key={sucursal.puntoDeVenta}
            data={sucursal}
          />
        ))}
      </div>

      {/* Resumen estadístico */}
      {dataGlobal.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#B695BF]" />
            Resumen del análisis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataGlobal.map((sucursal) => {
              const stocks = sucursal.evolucion.map((e) => e.stock);
              const fechas = sucursal.evolucion.map((e) => new Date(e.fecha));
              
              const minStock = Math.min(...stocks);
              const maxStock = Math.max(...stocks);
              const stockPromedio = stocks.reduce((acc, val) => acc + val, 0) / stocks.length;
              
              const fechaInicio = new Date(Math.min(...fechas.map(f => f.getTime())));
              const fechaFin = new Date(Math.max(...fechas.map(f => f.getTime())));
              
              return (
                <div key={sucursal.puntoDeVenta} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-3">{sucursal.puntoDeVenta}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Stock máximo:</span>
                      <span className="text-green-400 font-semibold">{maxStock.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Stock mínimo:</span>
                      <span className="text-red-400 font-semibold">{minStock.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Promedio:</span>
                      <span className="text-[#B695BF] font-semibold">{Math.round(stockPromedio).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-white/10">
                      <span className="text-white/50">Período:</span>
                      <span className="text-white/70">
                        {fechaInicio.toLocaleDateString()} - {fechaFin.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};