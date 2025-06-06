import React from "react";

interface RotacionTableProps {
  datos: any[];
  puntoDeVenta: string;
  columnaOrden: "comprado" | "vendido" | "rotacion";
  ordenAsc: boolean;
  cambiarOrden: (columna: "comprado" | "vendido" | "rotacion") => void;
}

export const RotacionTable: React.FC<RotacionTableProps> = ({
  datos,
  puntoDeVenta,
  columnaOrden,
  ordenAsc,
  cambiarOrden,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-[800px] w-full divide-y divide-[#D94854]">
        <thead className="bg-[#D94854] text-white">
          <tr>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2 text-left">Color</th>
            <th className="px-4 py-2 text-left">Categoría</th>
            {puntoDeVenta !== "TODOS" && (
              <th className="px-4 py-2 text-left">Sucursal</th>
            )}
            <th
              className="px-4 py-2 text-right cursor-pointer select-none"
              onClick={() => cambiarOrden("comprado")}
            >
              Comprado {columnaOrden === "comprado" && (ordenAsc ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer select-none"
              onClick={() => cambiarOrden("vendido")}
            >
              Vendido {columnaOrden === "vendido" && (ordenAsc ? "▲" : "▼")}
            </th>
            <th
              className="px-4 py-2 text-right cursor-pointer select-none"
              onClick={() => cambiarOrden("rotacion")}
            >
              Rotación (%) {columnaOrden === "rotacion" && (ordenAsc ? "▲" : "▼")}
            </th>
          </tr>
        </thead>
        <tbody>
          {datos.length > 0 ? (
            datos.map((r, i) => (
              <tr key={i} className="hover:bg-[#F23D5E]/10 text-[#212026]">
                <td className="px-4 py-2">{r.producto}</td>
                <td className="px-4 py-2">{r.color}</td>
                <td className="px-4 py-2">{r.categoria || "-"}</td>
                {puntoDeVenta !== "TODOS" && (
                  <td className="px-4 py-2">{r.puntoDeVenta}</td>
                )}
                <td className="px-4 py-2 text-right">{r.cantidadComprada}</td>
                <td className="px-4 py-2 text-right">{r.cantidadVendida}</td>
                <td className="px-4 py-2 text-right">{Math.round(r.tasaRotacion * 100)}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={puntoDeVenta !== "TODOS" ? 6 : 5}
                className="p-4 text-center text-[#51590E]"
              >
                No hay resultados para los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
