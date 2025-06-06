import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type VentasSinComprasItem = {
  producto: string;
  color: string;
  puntoDeVenta: string;
  cantidadVendida: number;
};

interface Props {
  ventasSinCompras: VentasSinComprasItem[];
  pagina: number;
  setPagina: (p: number) => void;
  filasPorPagina: number;
  setFilasPorPagina: (n: number) => void;
}

const opcionesPorPagina = [15, 30, 50, 100];

export const VentasSinComprasTable: React.FC<Props> = ({
  ventasSinCompras,
  pagina,
  setPagina,
  filasPorPagina,
  setFilasPorPagina,
}) => {
  const totalPaginas = Math.ceil(ventasSinCompras.length / filasPorPagina);
  const inicio = (pagina - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const datosPagina = ventasSinCompras.slice(inicio, fin);

  const handleFilasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilasPorPagina(Number(e.target.value));
    setPagina(1);
  };

  return (
    <Card className="mt-4 bg-[#ffffff] p-0 rounded-2xl shadow-none border-none">
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-[#D94854] mb-3">
          Productos vendidos sin compras ({ventasSinCompras.length} resultados)
        </h3>
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div>
            <label className="font-medium mr-1 text-[#212026]">Filas por página:</label>
            <select
              className="border rounded px-2 py-1 bg-white text-[#212026]"
              value={filasPorPagina}
              onChange={handleFilasChange}
            >
              {opcionesPorPagina.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mr-2 text-[#51590E]">
              Página {pagina} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="mr-1 border-[#51590E] text-[#51590E] hover:bg-[#B695BF] hover:border-[#D94854]"
              onClick={() => setPagina(Math.max(1, pagina - 1))}
              disabled={pagina === 1}
            >
              {"<"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[#51590E] text-[#51590E] hover:bg-[#B695BF] hover:border-[#D94854]"
              onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
              disabled={pagina === totalPaginas}
            >
              {">"}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 overflow-x-auto rounded-xl">
      <table className="min-w-[800px] w-full divide-y divide-[#D94854]">
          <thead className="bg-[#D94854] text-white">
            <tr>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Color</th>
              <th className="px-4 py-2 text-left">Sucursal</th>
              <th className="px-4 py-2 text-right">Vendidos</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map((item, i) => (
              <tr key={i} className="hover:bg-[#F23D5E]/10 text-[#212026]">
                <td className="px-4 py-2">{item.producto}</td>
                <td className="px-4 py-2">{item.color}</td>
                <td className="px-4 py-2">{item.puntoDeVenta}</td>
                <td className="px-4 py-2 text-right">{item.cantidadVendida}</td>
              </tr>
            ))}
            {datosPagina.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-4 text-[#51590E]"
                >
                  No hay datos en esta página.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
