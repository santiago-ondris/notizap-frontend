import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface SerieData {
  nombre: string;
  serie: number[];
  colorLinea?: string;
  visible?: boolean;
}

interface Props {
  fechas: string[];
  series: SerieData[];
  fechasCompra?: string[];
}

const coloresPorDefecto = [
  "#51590E", // 1. Verde oliva (global, fijo)
  "#D94854", // 2. Rojo
  "#B695BF", // 3. Violeta
  "#212026", // 4. Gris oscuro
  "#FFD700", // 5. Dorado
  "#00D5D5", // 6. Azul aqua
  "#465005", // 7. Verde oscuro
  "#e327c4", // 8. Fucsia
  "#523b4e", // 9. Ciruela
  "#0febcd", // 10. Cyan vibrante
  "#0feb7d", // 11. Verde lima
  "#d4fc93", // 12. Verde pastel
  "#875f1e", // 13. Marrón
  "#2e2f69", // 14. Azul navy
  "#020208", // 15. Negro azulado
  "#772f00", // 16. Marrón rojizo
  "#E67E22", // 17. Naranja
  "#9B59B6", // 18. Púrpura
  "#27AE60", // 19. Verde clásico
  "#F39C12", // 20. Amarillo mango
  "#2980B9", // 21. Azul fuerte
  "#7F8C8D", // 22. Gris intermedio
  "#F06D6A", // 23. Coral
  "#34495E", // 24. Gris azul profundo
  "#16A085", // 25. Verde azulado
];

export const VentasChartMulti: React.FC<Props> = ({ fechas, series, fechasCompra }) => {
  const data = fechas.map((fecha, i) => {
    const point: any = { fecha: fecha.slice(5) };
    series.forEach((s) => {
      point[s.nombre] = s.serie[i] ?? 0;
    });
    if (fechasCompra?.includes(fecha)) {
      point.compra = 1; // valor dummy, solo para mostrar el punto
    } else {
      point.compra = null; // para que solo aparezcan los puntos, sin línea
    }
    return point;
  });

  return (
    <div className="rounded-2xl shadow-xl bg-white px-8 py-6 my-8 w-full">
      <div className="flex flex-col items-center mb-2">
        <h2 className="text-2xl font-bold text-[#D94854] text-center">
          Evolución de ventas - comparativa
        </h2>
      </div>

      {/* Leyenda personalizada fuera del gráfico */}
      <div className="flex flex-wrap justify-center mb-4">
        {series.map((s, idx) => (
          <div
            key={s.nombre}
            className="flex items-center mx-2 my-1"
            style={{ fontSize: 15, fontWeight: 500 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 6,
                backgroundColor: coloresPorDefecto[idx % coloresPorDefecto.length],
                marginRight: 8,
                borderRadius: 2,
              }}
            />
            {s.nombre === "GLOBAL" ? "Ventas acumuladas (GLOBAL)" : `Color: ${s.nombre}`}
          </div>
        ))}
        {/* Punto de milestone de compra */}
        {fechasCompra && fechasCompra.length > 0 && (
          <div
            className="flex items-center mx-2 my-1"
            style={{ fontSize: 15, fontWeight: 500 }}
          >
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                backgroundColor: "#e327c4",
                marginRight: 8,
                borderRadius: "50%",
                border: "2.5px solid #222",
              }}
            />
            Compra realizada
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid stroke="#eee" strokeDasharray="4 4" />
          <XAxis dataKey="fecha" tick={{ fontSize: 13, fill: "#212026" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: "#212026" }} />
          <Tooltip
            contentStyle={{ background: "#fff", borderColor: "#B695BF", color: "#212026" }}
            labelStyle={{ color: "#B695BF" }}
            cursor={{ stroke: "#B695BF", strokeWidth: 1 }}
            formatter={(value, name, props) => {
              if (props.dataKey === "compra" && value) {
                return ["Compra realizada"];
              }
              return [value, name];
            }}
          />

          {/* Líneas de ventas (colores) */}
          {series.map((s, idx) => (
            <Line
              key={s.nombre}
              type="monotone"
              dataKey={s.nombre}
              name={
                s.nombre === "GLOBAL"
                  ? "Ventas acumuladas (GLOBAL)"
                  : `Color: ${s.nombre}`
              }
              stroke={coloresPorDefecto[idx % coloresPorDefecto.length]}
              strokeWidth={3}
              dot={{
                stroke: coloresPorDefecto[idx % coloresPorDefecto.length],
                strokeWidth: 2,
                r: 4,
                fill: "#fff",
              }}
              activeDot={{
                stroke: "#B695BF",
                r: 7,
                fill: "#fff",
              }}
            />
          ))}

          {/* --- Puntos milestone: fechas de compra --- */}
          {fechasCompra && fechasCompra.length > 0 && (
            <Line
              type="monotone"
              dataKey="compra"
              name="Compra realizada"
              stroke="#222"
              strokeWidth={0}
              dot={{
                stroke: "#222",
                strokeWidth: 2,
                r: 7,
                fill: "#e327c4",
              }}
              activeDot={{
                stroke: "#F23D5E",
                strokeWidth: 2,
                fill: "#e327c4",
                r: 10,
              }}
              legendType="circle"
              isAnimationActive={false}
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
