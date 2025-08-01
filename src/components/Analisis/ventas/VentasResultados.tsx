import React, { useState, useEffect } from "react";
import { Loader2, Calendar } from "lucide-react";
import { VentasProductSelector } from "./VentasProductSelector";
import { VentasChartMulti } from "./VentasChartMulti";
import { VentasColorSelector } from "./VentasColorSelector";

interface VentasResultadosProps {
  data: any;
  fechasCompra: string[];
  onProductoChange: (producto: string) => void;
  loading?: boolean;
}

export const VentasResultados: React.FC<VentasResultadosProps> = ({ 
  data, 
  fechasCompra, 
  onProductoChange,
  loading = false 
}) => {
  const productos = data.productos.map((p: any) => p.nombre);
  const [producto, setProducto] = useState<string>(productos[0] ?? "");
  const productoObj = data.productos.find((p: any) => p.nombre === producto);

  const sucursales = productoObj?.sucursales.map((s: any) => s.sucursal) ?? [];
  const [sucursal, setSucursal] = useState<string>();
  const sucursalObj = productoObj?.sucursales.find((s: any) => s.sucursal === sucursal);

  const variantesPorColor = sucursalObj?.variantesPorColor ?? [];
  const [coloresSeleccionados, setColoresSeleccionados] = useState<string[]>([]);

  // Efecto para cambio de producto
  useEffect(() => {
    setColoresSeleccionados([]);
    if (producto) {
      onProductoChange(producto);
    }
  }, [producto]);

  // Preparar datos para el gráfico
  const series = [
    {
      nombre: "GLOBAL",
      serie: sucursalObj?.serie ?? [],
      colorLinea: "#51590E",
      visible: true,
    },
    ...variantesPorColor
      .filter((v: any) => coloresSeleccionados.includes(v.color))
      .map((v: any) => ({
        nombre: v.color,
        serie: v.serie,
        visible: true,
      })),
  ];

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-white/60 mx-auto mb-4 animate-spin" />
              <p className="text-white/60">Actualizando datos de fechas de compra...</p>
            </div>
          </div>
        </div>
      )}

      {/* Selectores en grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selector de productos y sucursales */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Configuración del análisis</h3>
          <VentasProductSelector
            productos={productos}
            productoSeleccionado={producto}
            setProducto={setProducto}
            sucursales={sucursales}
            sucursalSeleccionada={sucursal ?? ""}
            setSucursal={setSucursal}
          />
        </div>

        {/* Selector de colores */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Comparar por colores</h3>
          <VentasColorSelector
            variantesPorColor={variantesPorColor}
            coloresSeleccionados={coloresSeleccionados}
            setColoresSeleccionados={setColoresSeleccionados}
          />
        </div>
      </div>

      {/* Gráfico */}
      <VentasChartMulti
        fechas={data.fechas}
        series={series}
        fechasCompra={fechasCompra} modoComparacion={"colores"}      />

      {/* Información de fechas de compra */}
      {fechasCompra && fechasCompra.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#B695BF]" />
            Fechas de Compra del Producto
            <span className="text-white/60 text-sm font-normal ml-2">
              ({fechasCompra.length} {fechasCompra.length === 1 ? 'fecha' : 'fechas'})
            </span>
          </h3>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 max-h-32 overflow-y-auto text-white/80 text-sm"
              style={{ scrollbarWidth: "thin" }}
            >
              {fechasCompra.map((fecha, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/10 rounded-lg px-2 py-1 text-center hover:bg-white/20 transition-colors"
                >
                  {new Date(fecha).toLocaleDateString("es-AR")}
                </div>
              ))}
            </div>
            
            {fechasCompra.length > 24 && (
              <div className="mt-3 text-white/50 text-xs text-center">
                Mostrando todas las {fechasCompra.length} fechas de compra
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};