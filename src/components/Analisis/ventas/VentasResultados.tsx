import React, { useState, useEffect } from "react";
import { VentasProductSelector } from "./VentasProductSelector";
import { VentasChartMulti } from "./VentasChartMulti";

interface Props {
  data: any;
  fechasCompra: string[];
  onProductoChange: (producto: string) => void;
}

export const VentasResultados: React.FC<Props> = ({ data, fechasCompra, onProductoChange }) => {
  const productos = data.productos.map((p: any) => p.nombre);
  const [producto, setProducto] = useState<string>(productos[0] ?? "");
  const productoObj = data.productos.find((p: any) => p.nombre === producto);

  const sucursales = productoObj?.sucursales.map((s: any) => s.sucursal) ?? [];
  const [sucursal, setSucursal] = useState<string>("GLOBAL");
  const sucursalObj = productoObj?.sucursales.find((s: any) => s.sucursal === sucursal);

  const variantesPorColor = sucursalObj?.variantesPorColor ?? [];
  const [coloresSeleccionados, setColoresSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    setColoresSeleccionados([]);
    if (producto) {
      onProductoChange(producto);
    }
  }, [producto]);

  const handleToggleColor = (color: string) => {
    setColoresSeleccionados((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

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
    <div className="flex flex-col gap-6 p-4">

      <VentasProductSelector
        productos={productos}
        productoSeleccionado={producto}
        setProducto={setProducto}
        sucursales={sucursales}
        sucursalSeleccionada={sucursal}
        setSucursal={setSucursal}
      />
      <div className="flex gap-4 flex-wrap items-center mb-4">
        <label className="font-semibold text-[#51590E]">Comparar por color:</label>
        {variantesPorColor.map((v: any) => (
          <label key={v.color} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={coloresSeleccionados.includes(v.color)}
              onChange={() => handleToggleColor(v.color)}
            />
            <span className="text-[#ffffff]">{v.color}</span>
          </label>
        ))}
      </div>
      <VentasChartMulti
        fechas={data.fechas}
        series={series}
        fechasCompra={fechasCompra}
      />

      {/* Leyenda de fechas de compra */}
      {fechasCompra && fechasCompra.length > 0 && (
        <div className="bg-[#F9F6F2] rounded-xl shadow mt-6 mb-2 p-4 max-w-2xl w-full mx-auto">
          <div className="font-semibold text-[#51590E] mb-1">
            Artículo comprado el:
            <span className="ml-2 text-xs text-[#B695BF]">
              {fechasCompra.length > 10 && `(Mostrando ${fechasCompra.length} fechas)`}
            </span>
          </div>
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-1 max-h-40 overflow-y-auto text-[#51590E] text-sm pr-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {fechasCompra.map((f, idx) => (
              <div key={idx} className="whitespace-nowrap">
                {new Date(f).toLocaleDateString("es-AR")}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
