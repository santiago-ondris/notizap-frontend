import { create } from "zustand";

// Tipos para los filtros de clientes
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

// Filtros aplicados para el backend (formato que se envía a la API)
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

// Estado inicial de los filtros
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
  // Estado
  filters: ClienteFilters;
  hasActiveFilters: boolean;
  lastAppliedFilters: ClienteFiltrosAplicados | null;
  
  // Acciones para actualizar filtros individuales
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
  
  // Acciones para gestionar filtros
  applyFilters: () => ClienteFiltrosAplicados;
  clearFilters: () => void;
  restoreFilters: (filters: ClienteFilters) => void;
  setLastAppliedFilters: (filters: ClienteFiltrosAplicados) => void;
  
  // Helpers
  checkHasActiveFilters: () => void;
}

export const useClienteFiltersStore = create<ClienteFiltersStore>((set, get) => ({
  // Estado inicial
  filters: initialFilters,
  hasActiveFilters: false,
  lastAppliedFilters: null,
  
  // Acciones para actualizar filtros individuales
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
  
  // Aplicar filtros - convierte el estado actual a formato para API
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
    
    // Guardar los filtros aplicados
    set({ lastAppliedFilters: filtrosAplicados });
    get().checkHasActiveFilters();
    
    return filtrosAplicados;
  },
  
  // Limpiar todos los filtros
  clearFilters: () => set(() => ({
    filters: initialFilters,
    hasActiveFilters: false,
    lastAppliedFilters: null,
  })),
  
  // Restaurar filtros desde un estado específico
  restoreFilters: (filters) => set(() => ({
    filters,
  })),
  
  // Establecer los últimos filtros aplicados
  setLastAppliedFilters: (filters) => set(() => ({
    lastAppliedFilters: filters,
  })),
  
  // Verificar si hay filtros activos
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

// Hook para verificar si hay filtros activos (para usar en componentes)
export const useHasActiveClienteFilters = () => {
  const hasActiveFilters = useClienteFiltersStore((state) => state.hasActiveFilters);
  const lastAppliedFilters = useClienteFiltersStore((state) => state.lastAppliedFilters);
  
  return hasActiveFilters && lastAppliedFilters !== null;
};