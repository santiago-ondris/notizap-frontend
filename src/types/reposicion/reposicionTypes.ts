export interface CurvaTalles {
    talle34: number;
    talle35: number;
    talle36: number;
    talle37: number;
    talle38: number;
    talle39: number;
    talle40: number;
    talle41: number;
  }
  
  export interface ConfiguracionAnalisis {
    curvasPorSucursal: Record<string, CurvaTalles>;
    sucursalesObjetivo: string[];
    ordenPrioridad: string[];
    sucursalesFaltantes: string[];
    continuarConSucursalesFaltantes: boolean;
  }
  
  export interface ProductoInventario {
    nombre: string;
    color: string;
    talle: number;
    stockPorSucursal: Record<string, number>;
  }
  
  export interface ItemReposicion {
    producto: string;
    color: string;
    talle: number;
    cantidadAReponer: number;
    stockActual: number;
    stockIdeal: number;
    sucursalDestino: string;
  }
  
  export interface ReposicionPorSucursal {
    nombreSucursal: string;
    items: ItemReposicion[];
    totalItems: number;
    totalUnidades: number;
  }
  
  export interface ResultadoAnalisisReposicion {
    reposicionesPorSucursal: ReposicionPorSucursal[];
    sucursalesAnalizadas: string[];
    sucursalesSinReposicion: string[];
    productosSinStockDepositoCentral: string[];
    fechaAnalisis: string;
    usuarioAnalisis: string;
    mensajesInformativos: string[];
  }
  
  export interface AnalisisReposicionRequest {
    archivo: File;
    usuarioAnalisis?: string;
    continuarConSucursalesFaltantes?: boolean;
    configuracion?: ConfiguracionAnalisis;
  }
  
  export interface AnalisisReposicionResponse {
    exitoso: boolean;
    mensaje: string;
    resultado?: ResultadoAnalisisReposicion;
    errores: string[];
    advertencias: string[];
    urlDescarga?: string;
    nombreArchivo?: string;
    tiempoEjecucionMs: number;
  }
  
  export interface ResultadoValidacionArchivo {
    esValido: boolean;
    errores: string[];
    advertencias: string[];
    sucursalesEncontradas: string[];
    sucursalesFaltantes: string[];
    cantidadProductosAproximada: number;
    cantidadVariantesAproximada: number;
    informacionEstructura: string;
    puedeProceder: boolean;
  }
  
  export interface ConfiguracionPorDefectoResponse {
    configuracion: ConfiguracionAnalisis;
    descripcion: string;
    informacionCurva: Record<string, string>;
  }
  
  export const SUCURSALES_ESPERADAS = [
    "25 DE MAYO",
    "CASA CENTRAL",
    "DEAN FUNES",
    "GENERAL PAZ",
    "ITUZAINGO NVA CBA",
    "BARRIO JARDIN"
  ] as const;
  
  export const SUCURSALES_OBJETIVO = [
    "DEAN FUNES",
    "GENERAL PAZ",
    "BARRIO JARDIN",
    "25 DE MAYO",
    "ITUZAINGO NVA CBA"
  ] as const;
  
  export const ORDEN_PRIORIDAD_DEFECTO = [
    "DEAN FUNES",
    "GENERAL PAZ",
    "BARRIO JARDIN",
    "25 DE MAYO",
    "ITUZAINGO NVA CBA"
  ] as const;
  
  export const CURVA_TALLES_DEFECTO: CurvaTalles = {
    talle34: 1,
    talle35: 1,
    talle36: 2,
    talle37: 3,
    talle38: 3,
    talle39: 2,
    talle40: 1,
    talle41: 1
  };
  
  export const TALLES_DISPONIBLES = [34, 35, 36, 37, 38, 39, 40, 41] as const;
  
  export type TalleDisponible = typeof TALLES_DISPONIBLES[number];
  export type SucursalEsperada = typeof SUCURSALES_ESPERADAS[number];
  export type SucursalObjetivo = typeof SUCURSALES_OBJETIVO[number];
  
  export interface EstadoUploadArchivo {
    archivo: File | null;
    arrastrando: boolean;
    subiendo: boolean;
    validando: boolean;
    validacion: ResultadoValidacionArchivo | null;
    error: string | null;
  }
  
  export interface EstadoConfiguracionCurvas {
    configuracion: ConfiguracionAnalisis;
    sucursalEditando: string | null;
    curvaEditando: CurvaTalles | null;
    cambiosPendientes: boolean;
    erroresValidacion: Record<string, string>;
  }
  
  export interface EstadoAnalisis {
    analizando: boolean;
    resultado: ResultadoAnalisisReposicion | null;
    error: string | null;
    progreso: number;
    mensaje: string;
  }
  
  export interface ReposicionPageState {
    paso: 'upload' | 'configuracion' | 'resultado';
    upload: EstadoUploadArchivo;
    configuracion: EstadoConfiguracionCurvas;
    analisis: EstadoAnalisis;
  }
  
  export interface CurvaEditorProps {
    sucursal: string;
    curva: CurvaTalles;
    onChange: (curva: CurvaTalles) => void;
    errores?: Record<string, string>;
    disabled?: boolean;
  }
  
  export interface TablaReposicionProps {
    reposicion: ReposicionPorSucursal;
    mostrarSucursal?: boolean;
    compacta?: boolean;
  }
  
  export interface ResumenReposicionProps {
    resultado: ResultadoAnalisisReposicion;
    onDescargar: () => void;
    descargando?: boolean;
  }
  
  export const COLORES_SUCURSAL: Record<string, string> = {
    "DEAN FUNES": "#B695BF",
    "GENERAL PAZ": "#51590E",
    "BARRIO JARDIN": "#3B82F6", 
    "25 DE MAYO": "#D94854",
    "ITUZAINGO NVA CBA": "#e327c4",
    "CASA CENTRAL": "#FFD700"
  };
  
  export const ICONOS_SUCURSAL: Record<string, string> = {
    "DEAN FUNES": "🏪",
    "GENERAL PAZ": "🏬",
    "BARRIO JARDIN": "🏡", 
    "25 DE MAYO": "🏭",
    "ITUZAINGO NVA CBA": "🏢",
    "CASA CENTRAL": "🏛️"
  };
  
  export interface ErroresValidacionCurva {
    [talle: string]: string;
  }
  
  export interface FormularioCurvaState {
    curva: CurvaTalles;
    errores: ErroresValidacionCurva;
    esValido: boolean;
    modificado: boolean;
  }
  
  export const MENSAJES_ERROR = {
    ARCHIVO_REQUERIDO: "El archivo es requerido",
    ARCHIVO_INVALIDO: "El archivo debe ser un Excel (.xlsx o .xls)",
    ARCHIVO_MUY_GRANDE: "El archivo no puede superar los 500KB",
    ARCHIVO_VACIO: "El archivo está vacío",
    SIN_DEPOSITO_CENTRAL: "No se encontró CASA CENTRAL en el archivo",
    ERROR_PROCESAMIENTO: "Error al procesar el archivo",
    CURVA_INVALIDA: "La curva de talles no es válida",
    SUCURSAL_INVALIDA: "Sucursal no válida"
  } as const;
  
  export const MENSAJES_EXITO = {
    ARCHIVO_VALIDADO: "Archivo validado correctamente",
    ANALISIS_COMPLETADO: "Análisis de reposición completado",
    CONFIGURACION_GUARDADA: "Configuración guardada correctamente",
    DESCARGA_INICIADA: "Descarga iniciada correctamente"
  } as const;