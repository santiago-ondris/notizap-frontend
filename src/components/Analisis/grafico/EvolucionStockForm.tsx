import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ProductoBase, type EvolucionStockRequest } from "@/types/analisis/analisis";
import { getProductosDeCompras } from "@/utils/analisis/getProductosDeCompras";
import { useArchivosAnalisis } from "@/store/useArchivosAnalisis"; // 👈 ¡IMPORTANTE!

type Props = {
  onSubmit: (data: EvolucionStockRequest) => void;
  loading: boolean;
};

export const EvolucionStockForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const { archivos, setArchivo } = useArchivosAnalisis();
  const [producto, setProducto] = useState<string>("");
  const [productos, setProductos] = useState<ProductoBase[]>([]);
  const [buscandoProductos, setBuscandoProductos] = useState(false);

  useEffect(() => {
    if (archivos.archivoEvolucionStockDetalles && productos.length === 0) {
      setBuscandoProductos(true);
      getProductosDeCompras(archivos.archivoEvolucionStockDetalles)
        .then(setProductos)
        .catch(() => setProductos([]))
        .finally(() => setBuscandoProductos(false));
    }
  }, [archivos.archivoEvolucionStockDetalles]);

  const handleDetallesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo("archivoEvolucionStockDetalles", file!);
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

  const handleCabeceraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo("archivoEvolucionStockCabecera", file!);
  };

  const handleVentasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivo("archivoEvolucionStockVentas", file!);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !archivos.archivoEvolucionStockCabecera ||
      !archivos.archivoEvolucionStockDetalles ||
      !archivos.archivoEvolucionStockVentas ||
      !producto
    ) {
      alert("Completa todos los campos y selecciona un producto");
      return;
    }
    onSubmit({
      archivoCabecera: archivos.archivoEvolucionStockCabecera,
      archivoDetalles: archivos.archivoEvolucionStockDetalles,
      archivoVentas: archivos.archivoEvolucionStockVentas,
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
              onChange={handleCabeceraChange}
              className="w-full border rounded-lg p-2 bg-white"
            />
            {archivos.archivoEvolucionStockCabecera && (
              <span className="text-xs text-[#51590E] block mt-1">
                Archivo cargado: <b>{archivos.archivoEvolucionStockCabecera.name}</b>
              </span>
            )}
          </label>
          <label className="flex-1">
            <span className="block font-semibold mb-1 text-[#212026]">Detalle de compras</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleDetallesChange}
              className="w-full border rounded-lg p-2 bg-white"
            />
            {buscandoProductos && (
              <span className="text-xs text-[#51590E]">Buscando productos...</span>
            )}
            {archivos.archivoEvolucionStockDetalles && (
              <span className="text-xs text-[#51590E] block mt-1">
                Archivo cargado: <b>{archivos.archivoEvolucionStockDetalles.name}</b>
              </span>
            )}
          </label>
          <label className="flex-1">
            <span className="block font-semibold mb-1 text-[#212026]">Ventas</span>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleVentasChange}
              className="w-full border rounded-lg p-2 bg-white"
            />
            {archivos.archivoEvolucionStockVentas && (
              <span className="text-xs text-[#51590E] block mt-1">
                Archivo cargado: <b>{archivos.archivoEvolucionStockVentas.name}</b>
              </span>
            )}
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
