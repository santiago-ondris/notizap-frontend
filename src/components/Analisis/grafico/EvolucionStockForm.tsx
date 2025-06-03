import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ProductoBase, type EvolucionStockRequest } from "@/types/analisis/analisis";
import { getProductosDeCompras } from "@/utils/analisis/getProductosDeCompras";

type Props = {
  onSubmit: (data: EvolucionStockRequest) => void;
  loading: boolean;
};

export const EvolucionStockForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [archivoCabecera, setArchivoCabecera] = useState<File | null>(null);
  const [archivoDetalles, setArchivoDetalles] = useState<File | null>(null);
  const [archivoVentas, setArchivoVentas] = useState<File | null>(null);
  const [producto, setProducto] = useState<string>("");
  const [productos, setProductos] = useState<ProductoBase[]>([]);
  const [buscandoProductos, setBuscandoProductos] = useState(false);

  // Cuando se selecciona el archivo de detalles, se leen productos unicos
  const handleDetallesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivoDetalles(file);
    setProductos([]);
    setProducto("");
    if (file) {
      setBuscandoProductos(true);
      try {
        const prods = await getProductosDeCompras(file);
        setProductos(prods);
      } catch (err) {
        alert(
          "No se pudo leer productos del archivo de compras. ¿Seguro que seleccionaste el archivo correcto?"
        );
      }
      setBuscandoProductos(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archivoCabecera || !archivoDetalles || !archivoVentas || !producto) {
      alert("Completa todos los campos y selecciona un producto");
      return;
    }
    onSubmit({
      archivoCabecera,
      archivoDetalles,
      archivoVentas,
      producto,
    });
  };

  return (
    <Card className="bg-[#ffffff] p-8 max-w-2xl mx-auto mb-8 shadow-none border-none">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold text-[#D94854] text-center mb-2">
          Evolución de Stock: Selecciona archivos y producto
        </h2>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <label className="flex-1">
            <span className="block font-semibold mb-1 text-[#212026]">Cabecera de compras</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setArchivoCabecera(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-2 bg-white"
              required
            />
          </label>
          <label className="flex-1">
            <span className="block font-semibold mb-1 text-[#212026]">Detalle de compras</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleDetallesChange}
              className="w-full border rounded-lg p-2 bg-white"
              required
            />
            {buscandoProductos && (
              <span className="text-xs text-[#51590E]">Buscando productos...</span>
            )}
          </label>
          <label className="flex-1">
            <span className="block font-semibold mb-1 text-[#212026]">Ventas</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setArchivoVentas(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-2 bg-white"
              required
            />
          </label>
        </div>
        <div>
          <span className="block font-semibold mb-1 text-[#212026]">Producto a analizar</span>
          <input
            type="text"
            list="productos-list"
            className="w-full border rounded-lg p-2 bg-white"
            placeholder="Buscar producto base..."
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            disabled={productos.length === 0}
            required
            autoComplete="off"
          />
          <datalist id="productos-list">
            {productos.map((p) => (
              <option key={p.codigo} value={p.nombre} />
            ))}
          </datalist>
          {productos.length === 0 && (
            <span className="text-xs text-[#51590E]">
              Selecciona un archivo de detalles de compras para buscar productos.
            </span>
          )}
        </div>
        <Button type="submit" className="mx-auto w-56" disabled={loading || buscandoProductos}>
          {loading ? "Procesando..." : "Ver evolución"}
        </Button>
      </form>
    </Card>
  );
};
