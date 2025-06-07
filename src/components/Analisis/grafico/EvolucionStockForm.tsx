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
        <div className="flex flex-col gap-4">
          {/* Archivo de ventas */}
          <div>
            <label className="block text-base text-[#51590E] mb-1 font-medium">
              Archivo de <span className="font-bold">ventas</span> (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleVentasChange}
              disabled={loading}
              className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
            />
            {archivos.archivoEvolucionStockVentas && (
              <span className="text-sm text-[#51590E]">
                Seleccionado: <b>{archivos.archivoEvolucionStockVentas.name}</b>
              </span>
            )}
          </div>
          {/* Cabecera de compras */}
          <div>
            <label className="block text-base text-[#51590E] mb-1 font-medium">
              Archivo de <span className="font-bold">compras (cabecera)</span> (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleCabeceraChange}
              disabled={loading}
              className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
            />
            {archivos.archivoEvolucionStockCabecera && (
              <span className="text-sm text-[#51590E]">
                Seleccionado: <b>{archivos.archivoEvolucionStockCabecera.name}</b>
              </span>
            )}
          </div>
          {/* Detalle de compras */}
          <div>
            <label className="block text-base text-[#51590E] mb-1 font-medium">
              Archivo de <span className="font-bold">compras (detalle)</span> (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleDetallesChange}
              disabled={loading}
              className="block w-full text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:bg-[#F9F6F2] file:text-[#51590E] hover:file:bg-[#F3ECE6]"
            />
            {buscandoProductos && (
              <span className="text-xs text-[#51590E]">Buscando productos...</span>
            )}
            {archivos.archivoEvolucionStockDetalles && (
              <span className="text-sm text-[#51590E]">
                Seleccionado: <b>{archivos.archivoEvolucionStockDetalles.name}</b>
              </span>
            )}
          </div>
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
