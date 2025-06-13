export interface Gasto {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria: string;
    monto: number;
    fecha: string;
    proveedor?: string;
    metodoPago?: string;
    esRecurrente: boolean;
    frecuenciaRecurrencia?: string;
    esImportante: boolean;
    fechaCreacion: string;
  }
  
  export interface CreateGastoDto {
    nombre: string;
    descripcion?: string;
    categoria: string;
    monto: number;
    fecha?: string;
    proveedor?: string;
    metodoPago?: string;
    esRecurrente?: boolean;
    frecuenciaRecurrencia?: string;
    esImportante?: boolean;
  }
  
  export interface UpdateGastoDto {
    nombre: string;
    descripcion?: string;
    categoria: string;
    monto: number;
    fecha: string;
    proveedor?: string;
    metodoPago?: string;
    esRecurrente: boolean;
    frecuenciaRecurrencia?: string;
    esImportante: boolean;
  }
  
  export interface GastoFiltros {
    fechaDesde?: string;
    fechaHasta?: string;
    categoria?: string;
    montoMinimo?: number;
    montoMaximo?: number;
    busqueda?: string;
    esImportante?: boolean;
    esRecurrente?: boolean;
    ordenarPor?: 'Fecha' | 'Monto' | 'Nombre' | 'Categoria';
    descendente?: boolean;
    pagina?: number;
    tamañoPagina?: number;
  }
  
  export interface GastoResumen {
    totalMes: number;
    totalMesAnterior: number;
    porcentajeCambio: number;
    categoriaMasGastada: string;
    montoCategoriaMasGastada: number;
    promedioMensual: number;
    cantidadGastos: number;
  }
  
  export interface GastoPorCategoria {
    categoria: string;
    totalMonto: number;
    cantidadGastos: number;
    porcentaje: number;
  }
  
  export interface GastoTendencia {
    año: number;
    mes: number;
    mesNombre: string;
    totalMonto: number;
    cantidadGastos: number;
    promedioGasto: number;
  }
  
  export interface GastoResponse {
    gastos: Gasto[];
    totalCount: number;
    totalPages: number;
  }
  
  // Tipos para filtros predefinidos
  export type MetodoPago = 
    | 'Efectivo'
    | 'Tarjeta de Crédito'
    | 'Tarjeta de Débito'
    | 'Transferencia'
    | 'Cheque'
    | 'Otros';
  
  export type FrecuenciaRecurrencia =
    | 'mensual'
    | 'bimestral'
    | 'trimestral'
    | 'semestral'
    | 'anual';
  
  export type CategoriaGasto =
    | 'Herramientas Digitales'
    | 'Producción de Contenido'
    | 'Insumos E-commerce'
    | 'Marketing'
    | 'Infraestructura'
    | 'Otros';
  
  // Constantes para uso en componentes
  export const METODOS_PAGO: MetodoPago[] = [
    'Efectivo',
    'Tarjeta de Crédito',
    'Tarjeta de Débito',
    'Transferencia',
    'Cheque',
    'Otros'
  ];
  
  export const FRECUENCIAS_RECURRENCIA: FrecuenciaRecurrencia[] = [
    'mensual',
    'bimestral',
    'trimestral',
    'semestral',
    'anual'
  ];
  
  export const CATEGORIAS_PREDEFINIDAS: CategoriaGasto[] = [
    'Herramientas Digitales',
    'Producción de Contenido',
    'Insumos E-commerce',
    'Marketing',
    'Infraestructura',
    'Otros'
  ];
  
  export const CATEGORIA_CONFIG = {
    'Herramientas Digitales': {
      icon: 'Settings',
      color: '#B695BF', // Violeta
      emoji: '🛠️'
    },
    'Producción de Contenido': {
      icon: 'Camera',
      color: '#D94854',
      emoji: '📸'
    },
    'Insumos E-commerce': {
      icon: 'Package',
      color: '#51590E', 
      emoji: '📦'
    },
    'Marketing': {
      icon: 'TrendingUp',
      color: '#F23D5E', 
      emoji: '📊'
    },
    'Infraestructura': {
      icon: 'Server',
      color: '#B695BF', 
      emoji: '🏗️'
    },
    'Otros': {
      icon: 'MoreHorizontal',
      color: 'rgba(255,255,255,0.7)', 
      emoji: '💼'
    }
  } as const;