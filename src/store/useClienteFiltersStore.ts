import { create } from "zustand";

export interface ClienteFilters {
  desde: string;
  hasta: string;
  canalesSeleccionados: string[];
  sucursalesSeleccionadas: string[];
  marcasSeleccionadas: string[];
  categoriasSeleccionadas: string[];
  ordenarPor: string;
  modoExclusivoCanal: boolean;
  modoExclusivoSucursal: boolean;
  modoExclusivoMarca: boolean;
  modoExclusivoCategoria: boolean;
}

export interface ClienteFiltrosAplicados {
  desde?: string;
  hasta?: string;
  canal?: string;
  sucursal?: string;
  marca?: string;
  categoria?: string;
  ordenarPor: string;
  modoExclusivoCanal: boolean;
  modoExclusivoSucursal: boolean;
  modoExclusivoMarca: boolean;
  modoExclusivoCategoria: boolean;
}

const initialFilters: ClienteFilters = {
  desde: "",
  hasta: "",
  canalesSeleccionados: [],
  sucursalesSeleccionadas: [],
  marcasSeleccionadas: [],
  categoriasSeleccionadas: [],
  ordenarPor: "montoTotal",
  modoExclusivoCanal: false,
  modoExclusivoSucursal: false,
  modoExclusivoMarca: false,
  modoExclusivoCategoria: false,
};

interface ClienteFiltersStore {
  filters: ClienteFilters;
  hasActiveFilters: boolean;
  lastAppliedFilters: ClienteFiltrosAplicados | null;
  
  setDesde: (desde: string) => void;
  setHasta: (hasta: string) => void;
  setCanalesSeleccionados: (canales: string[]) => void;
  setSucursalesSeleccionadas: (sucursales: string[]) => void;
  setMarcasSeleccionadas: (marcas: string[]) => void;
  setCategoriasSeleccionadas: (categorias: string[]) => void;
  setOrdenarPor: (ordenarPor: string) => void;
  setModoExclusivoCanal: (modo: boolean) => void;
  setModoExclusivoSucursal: (modo: boolean) => void;
  setModoExclusivoMarca: (modo: boolean) => void;
  setModoExclusivoCategoria: (modo: boolean) => void;
  
  applyFilters: () => ClienteFiltrosAplicados;
  clearFilters: () => void;
  restoreFilters: (filters: ClienteFilters) => void;
  setLastAppliedFilters: (filters: ClienteFiltrosAplicados) => void;
  
  checkHasActiveFilters: () => void;
}

export const useClienteFiltersStore = create<ClienteFiltersStore>((set, get) => ({
  filters: initialFilters,
  hasActiveFilters: false,
  lastAppliedFilters: null,
  
  setDesde: (desde) => set((state) => {
    const newFilters = { ...state.filters, desde };
    return { filters: newFilters };
  }),
  
  setHasta: (hasta) => set((state) => {
    const newFilters = { ...state.filters, hasta };
    return { filters: newFilters };
  }),
  
  setCanalesSeleccionados: (canales) => set((state) => {
    const newFilters = { ...state.filters, canalesSeleccionados: canales };
    return { filters: newFilters };
  }),
  
  setSucursalesSeleccionadas: (sucursales) => set((state) => {
    const newFilters = { ...state.filters, sucursalesSeleccionadas: sucursales };
    return { filters: newFilters };
  }),
  
  setMarcasSeleccionadas: (marcas) => set((state) => {
    const newFilters = { ...state.filters, marcasSeleccionadas: marcas };
    return { filters: newFilters };
  }),
  
  setCategoriasSeleccionadas: (categorias) => set((state) => {
    const newFilters = { ...state.filters, categoriasSeleccionadas: categorias };
    return { filters: newFilters };
  }),
  
  setOrdenarPor: (ordenarPor) => set((state) => {
    const newFilters = { ...state.filters, ordenarPor };
    return { filters: newFilters };
  }),
  
  setModoExclusivoCanal: (modo) => set((state) => {
    const newFilters = { ...state.filters, modoExclusivoCanal: modo };
    return { filters: newFilters };
  }),
  
  setModoExclusivoSucursal: (modo) => set((state) => {
    const newFilters = { ...state.filters, modoExclusivoSucursal: modo };
    return { filters: newFilters };
  }),
  
  setModoExclusivoMarca: (modo) => set((state) => {
    const newFilters = { ...state.filters, modoExclusivoMarca: modo };
    return { filters: newFilters };
  }),
  
  setModoExclusivoCategoria: (modo) => set((state) => {
    const newFilters = { ...state.filters, modoExclusivoCategoria: modo };
    return { filters: newFilters };
  }),
  
  applyFilters: () => {
    const { filters } = get();
    
    const filtrosAplicados: ClienteFiltrosAplicados = {
      desde: filters.desde || undefined,
      hasta: filters.hasta || undefined,
      canal: filters.canalesSeleccionados.length > 0 ? filters.canalesSeleccionados.join(',') : undefined,
      sucursal: filters.sucursalesSeleccionadas.length > 0 ? filters.sucursalesSeleccionadas.join(',') : undefined,
      marca: filters.marcasSeleccionadas.length > 0 ? filters.marcasSeleccionadas.join(',') : undefined,
      categoria: filters.categoriasSeleccionadas.length > 0 ? filters.categoriasSeleccionadas.join(',') : undefined,
      ordenarPor: filters.ordenarPor,
      modoExclusivoCanal: filters.modoExclusivoCanal,
      modoExclusivoSucursal: filters.modoExclusivoSucursal,
      modoExclusivoMarca: filters.modoExclusivoMarca,
      modoExclusivoCategoria: filters.modoExclusivoCategoria,
    };
    
    set({ lastAppliedFilters: filtrosAplicados });
    get().checkHasActiveFilters();
    
    return filtrosAplicados;
  },
  
  clearFilters: () => set(() => ({
    filters: initialFilters,
    hasActiveFilters: false,
    lastAppliedFilters: null,
  })),
  
  restoreFilters: (filters) => set(() => ({
    filters,
  })),
  
  setLastAppliedFilters: (filters) => set(() => ({
    lastAppliedFilters: filters,
  })),
  
  checkHasActiveFilters: () => set((state) => {
    const { filters } = state;
    const hasFilters = !!(
      filters.desde ||
      filters.hasta ||
      filters.canalesSeleccionados.length > 0 ||
      filters.sucursalesSeleccionadas.length > 0 ||
      filters.marcasSeleccionadas.length > 0 ||
      filters.categoriasSeleccionadas.length > 0
    );
    
    return { hasActiveFilters: hasFilters };
  }),
}));

export const useHasActiveClienteFilters = () => {
  const hasActiveFilters = useClienteFiltersStore((state) => state.hasActiveFilters);
  const lastAppliedFilters = useClienteFiltersStore((state) => state.lastAppliedFilters);
  
  return hasActiveFilters && lastAppliedFilters !== null;
};