export type ProductoBase = {
  codigo: string;
  nombre: string;
};

export type EvolucionStockRequest = {
  archivoCabecera: File;
  archivoDetalles: File;
  archivoVentas: File;
  producto: string;
};

export type EvolucionStockPorPuntoDeVenta = {
  puntoDeVenta: string;
  evolucion: { fecha: string; stock: number }[];
};