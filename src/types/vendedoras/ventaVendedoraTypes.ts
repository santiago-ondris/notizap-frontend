export interface VentaVendedora {
    id: number;
    sucursalNombre: string;
    vendedorNombre: string;
    producto: string;
    fecha: string; 
    cantidad: number;
    cantidadReal: number; 
    total: number;
    turno: 'Mañana' | 'Tarde';
    esProductoDescuento: boolean;
    diaSemana: string;
    sucursalAbreSabadoTarde: boolean;
  }
  
  export interface VentaVendedoraCreate {
    sucursalId: number;
    vendedorId: number;
    sucursalNombre: string;
    vendedorNombre: string;
    producto: string;
    fecha: string;
    cantidad: number;
    total: number;
  }
  
  export interface VentaVendedoraUpload {
    archivo: File;
    sobreescribirDuplicados: boolean;
  }
  
  export interface VentaVendedoraStats {
    totalVentas: number;
    montoTotal: number;
    cantidadTotal: number;
    promedioVentaPorDia: number;
    promedioVentaPorVendedora: number;
    diasConVentas: number;
    todasVendedoras: VentaPorVendedora[];
    topVendedoras?: VentaPorVendedora[];
    ventasPorSucursal: VentaPorSucursal[];
    ventasPorTurno: VentaPorTurno[];
    ventasPorDia: VentaPorDia[];
  }
  
  export interface VentaPorVendedora {
    vendedorNombre: string;
    totalVentas: number;
    montoTotal: number;
    cantidadTotal: number;
    promedio: number;
    sucursalesQueTrabaja: string[];
  }
  
  export interface VentaPorSucursal {
    sucursalNombre: string;
    totalVentas: number;
    montoTotal: number;
    cantidadTotal: number;
    abreSabadoTarde: boolean;
  }
  
  export interface VentaPorTurno {
    turno: string;
    totalVentas: number;
    montoTotal: number;
    cantidadTotal: number;
  }
  
  export interface VentaPorDia {
    fecha: string; // ISO string
    diaSemana: string;
    totalVentas: number;
    montoTotal: number;
    cantidadTotal: number;
    esDomingo: boolean;
  }
  
  export interface RangoFechas {
    fechaMinima: string | null;
    fechaMaxima: string | null;
    ultimaSemana: {
      fechaInicio: string | null;
      fechaFin: string | null;
    };
  }
  
  export interface UploadResult {
    success: boolean;
    message: string;
    stats?: VentaVendedoraStats;
  }
  
  export interface ValidacionArchivo {
    errores: string[];
    esValido: boolean;
  }
  
  export interface VentasResponse {
    data: VentaVendedora[];
    totalRegistros: number;
    pagina: number;
    pageSize: number;
    totalPaginas: number;
  }

  export interface VendedorasResponse {
    data: VentaPorVendedora[];
    totalVendedoras: number;
    pagina: number;
    pageSize: number;
    totalPaginas: number;
  }

  export interface ContadorProductos {
    totalProductosEncontrados: number;
  }