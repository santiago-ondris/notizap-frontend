import type {
    ResultadoValidacionArchivo,
    ResultadoAnalisisReposicion,
  } from './reposicionTypes';
  
  export interface ConfiguracionAnalisisNinos {
    sucursalesDestino: string[];
    stockObjetivoPrimario: number;
    stockObjetivoSecundario: number;
    continuarConSucursalesFaltantes: boolean;
    sucursalesFaltantes: string[];
    mensajesInformativos: string[];
  }
  
  export interface AnalisisReposicionNinosRequest {
    archivo: File;
    usuarioAnalisis?: string;
    continuarConSucursalesFaltantes?: boolean;
    configuracion?: ConfiguracionAnalisisNinos;
  }
  
  export interface AnalisisReposicionNinosResponse {
    exitoso: boolean;
    resultado: ResultadoAnalisisReposicion | null;
    errores: string[];
    mensajesInformativos: string[];
    nombreArchivo: string | null;
    tiempoEjecucionMs: number;
    tipoAnalisis: string;
  }
  
  export interface ConfiguracionPorDefectoNinosResponse {
    configuracion: ConfiguracionAnalisisNinos;
  }
  
  export interface EstadoAnalisisNinos {
    paso: 'upload' | 'resultado';
    upload: {
      archivo: File | null;
      validacion: ResultadoValidacionArchivo | null;
      subiendo: boolean;
      error: string | null;
    };
    analisis: {
      analizando: boolean;
      resultado: ResultadoAnalisisReposicion | null;
      error: string | null;
      progreso: number;
      mensaje: string;
    };
    configuracion: {
      configuracion: ConfiguracionAnalisisNinos;
      cambiosPendientes: boolean;
    };
    descarga: {
      descargando: boolean;
      error: string | null;
    };
  }
  
  export interface InformacionModuloNinos {
    modulo: string;
    sucursalesDestino: string[];
    sucursalOrigen: string;
    logicaReposicion: string;
    tiposArchivo: string[];
    tamañoMaximo: string;
    version: string;
  }
  
  export const CONFIGURACION_NINOS_DEFAULT: ConfiguracionAnalisisNinos = {
    sucursalesDestino: ['GENERAL PAZ', "BARRIO JARDIN"],
    stockObjetivoPrimario: 2,
    stockObjetivoSecundario: 1,
    continuarConSucursalesFaltantes: true,
    sucursalesFaltantes: [],
    mensajesInformativos: []
  };
  
  export const MENSAJES_NINOS = {
    TITULO_MODULO: 'Reposición Stock - Productos Niños',
    DESCRIPCION_MODULO: 'Análisis y reposición de stock para productos de KIDS',
    SUCURSALES_DESTINO: 'GENERAL PAZ Y BARRIO JARDIN',
    LOGICA_REPOSICION: 'Intentar 2 unidades por talle, si no es posible 1 unidad',
    ARCHIVO_PROCESANDO: 'Procesando archivo de productos de niños...',
    ANALISIS_COMPLETADO: 'Análisis de productos de niños completado',
    SIN_CONFIGURACION_CURVAS: 'Los productos de niños no requieren configuración de curvas de talles'
  } as const;
  
  export const COLORES_NINOS = {
    PRIMARIO: '#51590E',
    SECUNDARIO: '#B695BF',
    DESTINO: '#D94854',
    EXITO: '#28a745',
    ERROR: '#dc3545',
    ADVERTENCIA: '#ffc107'
  } as const;
  
  export type TipoReposicion = 'adultos' | 'ninos';
  
  export interface SelectorReposicion {
    tipo: TipoReposicion;
    titulo: string;
    descripcion: string;
    icono: string;
    color: string;
    ruta: string;
    caracteristicas: string[];
  }