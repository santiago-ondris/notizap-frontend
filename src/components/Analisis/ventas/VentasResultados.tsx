import React, { useState } from "react";
import { VentasProductSelector } from "./VentasProductSelector";
import { VentasChartMulti } from "./VentasChartMulti";

interface Props {
  data: any;
}

export const VentasResultados: React.FC<Props> = ({ data }) => {
  const productos = data.productos.map((p: any) => p.nombre);
  const [producto, setProducto] = useState<string>(productos[0] ?? "");
  const productoObj = data.productos.find((p: any) => p.nombre === producto);

  const sucursales = productoObj?.sucursales.map((s: any) => s.sucursal) ?? [];
  const [sucursal, setSucursal] = useState<string>("GLOBAL");
  const sucursalObj = productoObj?.sucursales.find((s: any) => s.sucursal === sucursal);

  // Colores únicos
  const variantesPorColor = sucursalObj?.variantesPorColor ?? [];
  const [coloresSeleccionados, setColoresSeleccionados] = useState<string[]>([]);

  // Si el usuario cambia de producto, se limpia la seleccion de colores
  React.useEffect(() => {
    setColoresSeleccionados([]);
  }, [producto]);

  const handleToggleColor = (color: string) => {
    setColoresSeleccionados((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  // Series a mostrar: siempre global, y los colores seleccionados
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
      />
    </div>
  );
};
