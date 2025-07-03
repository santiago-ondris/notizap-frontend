export interface VentaWooCommerce {
    id: number;
    tienda: string;
    mes: number;
    año: number;
    montoFacturado: number;
    unidadesVendidas: number;
    topProductos: string[];
    topCategorias: string[];
    fechaCreacion: string;
    fechaActualizacion?: string;
    periodoCompleto: string;
  }
  
  export interface CreateVentaWooCommerce {
    tienda: string;
    mes: number;
    año: number;
    montoFacturado: number;
    unidadesVendidas: number;
    topProductos: string[];
    topCategorias: string[];
  }
  
  export interface UpdateVentaWooCommerce extends CreateVentaWooCommerce {
    id: number;
  }
  
  export interface VentaWooCommerceQuery {
    tienda?: string;
    mes?: number;
    año?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    pageNumber?: number;
    pageSize?: number;
    orderBy?: string;
    orderDescending?: boolean;
  }
  
  export interface ResumenVentas {
    tienda: string;
    montoFacturado: number;
    unidadesVendidas: number;
    topProductos: string[];
    topCategorias: string[];
  }
  
  export interface TotalesVentas {
    totalFacturado: number;
    totalUnidades: number;
    ventasPorTienda: ResumenVentas[];
    mes: number;
    año: number;
    periodoCompleto: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }
  
  export interface EstadisticasTienda {
    tienda: string;
    año: number;
    totalFacturado: number;
    totalUnidades: number;
  }
  
  export interface CrecimientoMensual {
    tienda: string;
    periodoActual: string;
    periodoAnterior: string;
    crecimientoPorcentual: number;
  }
  
  export interface AuxiliaresVentas {
    tiendas: string[];
    años: number[];
  }
  
  // Tipos para integración con MercadoLibre (reutilización)
  export interface DatosMercadoLibre {
    tienda: string;
    montoFacturado: number;
    unidadesVendidas: number;
    topProductos: string[];
    topCategorias: string[];
    mes: number;
    año: number;
  }
  
  // Tipo unificado para el dashboard (WooCommerce + MercadoLibre)
  export interface DashboardVentas {
    woocommerce: TotalesVentas;
    mercadolibre: DatosMercadoLibre[];
    totalGeneral: {
      montoFacturado: number;
      unidadesVendidas: number;
    };
    mes: number;
    año: number;
    periodoCompleto: string;
  }
  
  // Estados para UI
  export interface VentasUIState {
    loading: boolean;
    error: string | null;
    selectedMes: number;
    selectedAño: number;
    modoAdmin: boolean;
    filtros: VentaWooCommerceQuery;
  }
  
  // Constantes útiles
  export const TIENDAS_WOOCOMMERCE = ['MONTELLA', 'ALENKA'] as const;
  export const MESES = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ] as const;
  
  export const AÑOS_DISPONIBLES = Array.from(
      { length: 11 }, 
      (_, i) => 2020 + i
  );