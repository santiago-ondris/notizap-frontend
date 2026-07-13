import { create } from "zustand";

type ArchivosAnalisis = {
  cabecera?: File;
  detalle?: File;
  ventas?: File;
};

type RotacionResult = {
  rotacion: any[];
  ventasSinCompras: any[];
};

type VentasEvolucionResult = any;

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
}

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
}));
