import React, { useState, useMemo } from "react";
import { type EvolucionStockPorPuntoDeVenta } from "@/types/analisis/analisis";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type Props = {
  data: EvolucionStockPorPuntoDeVenta[];
};

export const EvolucionStockCharts: React.FC<Props> = ({ data }) => {
  const [sucursal, setSucursal] = useState<string>("TODOS");

  const dataFiltradaPorSucursal = useMemo(() => {
    if (sucursal === "TODOS") return data;
    return data.filter(
      (d) =>
        d.puntoDeVenta === sucursal ||
        (sucursal === "GLOBAL" && d.puntoDeVenta === "GLOBAL")
    );
  }, [data, sucursal]);

  return (
    <div className="space-y-8">
      <Card className="bg-[#ffffff] px-8 py-6 rounded-2xl border-none shadow-none flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="font-semibold text-[#212026] mr-2">Sucursal:</label>
          <select
            className="border rounded p-2 text-[#212026]"
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
          >
            <option value="TODOS">Todas (Global y sucursales)</option>
            <option value="GLOBAL">Solo Global</option>
            {data
              .filter((d) => d.puntoDeVenta !== "GLOBAL")
              .map((d) => (
                <option key={d.puntoDeVenta} value={d.puntoDeVenta}>
                  {d.puntoDeVenta}
                </option>
              ))}
          </select>
        </div>
      </Card>
      {dataFiltradaPorSucursal.length === 0 ? (
        <div className="text-[#212026] text-lg font-semibold p-6">
          No hay datos para la sucursal seleccionada.
        </div>
      ) : (
        dataFiltradaPorSucursal.map((sucursal) => {
          const stocks = sucursal.evolucion.map((e) => e.stock);
          const minStock = Math.min(...stocks);
          const maxStock = Math.max(...stocks);

          return (
            <Card
              key={sucursal.puntoDeVenta}
              className="bg-[#ffffff] p-8 rounded-2xl border-none shadow-none"
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <h3 className="text-xl font-bold text-[#D94854]">
                  Evolución de stock - {sucursal.puntoDeVenta}
                </h3>
                <div className="flex gap-6 text-[#212026] text-base font-semibold">
                  <span>
                    <span className="text-[#51590E] mr-1">Máximo stock:</span>
                    <span className="">{maxStock}</span>
                  </span>
                  <span>
                    <span className="text-[#51590E] mr-1">Mínimo stock:</span>
                    <span className="">{minStock}</span>
                  </span>
                </div>
              </div>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={sucursal.evolucion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="fecha"
                      tick={{ fontSize: 12, fill: "#212026" }}
                      tickFormatter={(fecha) =>
                        new Date(fecha).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                        })
                      }
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#212026" }}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      labelFormatter={(label) =>
                        `Fecha: ${new Date(label).toLocaleDateString("es-AR")}`
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="stock"
                      stroke="#51590E"
                      strokeWidth={3}
                      dot={{ r: 2 }}
                      name="Stock"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};
