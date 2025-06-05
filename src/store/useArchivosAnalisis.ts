import { create } from "zustand";

type ArchivosAnalisis = {
  cabecera?: File;
  detalle?: File;
  ventas?: File;
  archivoVentasEvolucion?: File;
  archivoEvolucionStockCabecera?: File;
  archivoEvolucionStockDetalles?: File;
  archivoEvolucionStockVentas?: File;
};

type RotacionResult = {
  rotacion: any[];
  ventasSinCompras: any[];
};

type VentasEvolucionResult = any;
type EvolucionStockResult = any;

interface ArchivosAnalisisStore {
  archivos: ArchivosAnalisis;
  resultado?: RotacionResult;
  fechaAnalisis?: string;
  setArchivo: (tipo: keyof ArchivosAnalisis, archivo: File) => void;
  limpiarArchivos: () => void;
  setResultado: (resultado: RotacionResult) => void;
  limpiarResultado: () => void;
  resultadoVentas?: VentasEvolucionResult;
  fechaVentas?: string;
  setResultadoVentas: (resultado: VentasEvolucionResult) => void;
  limpiarResultadoVentas: () => void;
  resultadoEvolucionStock?: EvolucionStockResult;
  fechaEvolucionStock?: string;
  setResultadoEvolucionStock: (resultado: EvolucionStockResult) => void;
  limpiarResultadoEvolucionStock: () => void;
}
console.log("Zustand store inicializado", new Date().toLocaleTimeString());

export const useArchivosAnalisis = create<ArchivosAnalisisStore>((set) => ({
  archivos: {},
  resultado: undefined,
  fechaAnalisis: undefined,
  setArchivo: (tipo, archivo) =>
    set((state) => ({
      archivos: { ...state.archivos, [tipo]: archivo },
    })),
  limpiarArchivos: () => set({ archivos: {} }),
  setResultado: (resultado) => set({ resultado, fechaAnalisis: new Date().toISOString() }),
  limpiarResultado: () => set({ resultado: undefined, fechaAnalisis: undefined }),
  resultadoVentas: undefined,
  fechaVentas: undefined,
  setResultadoVentas: (resultado) => set({ resultadoVentas: resultado, fechaVentas: new Date().toISOString() }),
  limpiarResultadoVentas: () => set({ resultadoVentas: undefined, fechaVentas: undefined }),
  resultadoEvolucionStock: undefined,
  fechaEvolucionStock: undefined,
  setResultadoEvolucionStock: (resultado) =>
    set({ resultadoEvolucionStock: resultado, fechaEvolucionStock: new Date().toISOString() }),
  limpiarResultadoEvolucionStock: () => set({ resultadoEvolucionStock: undefined, fechaEvolucionStock: undefined }),
}));
