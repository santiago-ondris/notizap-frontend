import api from "@/api/api";
import { type EvolucionStockRequest, type EvolucionStockPorPuntoDeVenta } from "@/types/analisis/analisis";

export const fetchEvolucionStock = async (
  data: EvolucionStockRequest
): Promise<EvolucionStockPorPuntoDeVenta[]> => {
  const formData = new FormData();
  formData.append("ArchivoComprasCabecera", data.archivoCabecera);
  formData.append("ArchivoComprasDetalles", data.archivoDetalles);
  formData.append("ArchivoVentas", data.archivoVentas);
  formData.append("Producto", data.producto);

  const response = await api.post("/api/v1/analisis/rotacion/evolucion-stock", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export async function fetchEvolucionVentas(archivo: File) {
  const formData = new FormData();
  formData.append("ArchivoVentas", archivo);

  const response = await api.post("/api/v1/analisis/rotacion/evolucion-ventas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export const fetchFechasCompra = async (
  archivoCabecera: File,
  archivoDetalles: File,
  producto: string
): Promise<string[]> => {
  const formData = new FormData();
  formData.append("ArchivoCabecera", archivoCabecera);
  formData.append("ArchivoDetalles", archivoDetalles);
  formData.append("Producto", producto);

  const response = await api.post("/api/v1/analisis/rotacion/compras/fechas-compra", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchEvolucionVentasResumen = async (archivoVentas: File) => {
  const formData = new FormData();
  formData.append("archivoVentas", archivoVentas);

  const response = await api.post(
    "/api/v1/analisis/rotacion/evolucion-ventas/resumen",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
