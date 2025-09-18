export interface EnvioDiario {
  id: number;
  fecha: string;
  
  oca: number | null;
  andreani: number | null;
  retirosSucursal: number | null;
  roberto: number | null;
  tino: number | null;
  caddy: number | null;
  mercadoLibre: number | null;
  
  totalCordobaCapital: number; 
  totalEnvios: number;
}


export interface CreateEnvioDiarioDto {
  fecha: string; 
  
  oca?: number | null;
  andreani?: number | null;
  retirosSucursal?: number | null;
  roberto?: number | null;
  tino?: number | null;
  caddy?: number | null;
  mercadoLibre?: number | null;
}

export interface UpdateEnvioDiarioDto {
  fecha: string;
  oca?: number | null;
  andreani?: number | null;
  retirosSucursal?: number | null;
  roberto?: number | null;
  tino?: number | null;
  caddy?: number | null;
  mercadoLibre?: number | null;
}

export interface EnvioResumenMensual {
  totalOca: number;
  totalAndreani: number;
  totalRetirosSucursal: number;
  totalRoberto: number;
  totalTino: number;
  totalCaddy: number;
  totalMercadoLibre: number;
  totalCordobaCapital: number; 
  totalGeneral: number;
}

export interface EnviosFiltros {
  year: number;
  month: number; 
}


export interface EnviosFecha {
  fecha: string; 
}

export interface CeldaEditable {
  dia: number;
  campo: keyof Omit<EnvioDiario, 'id' | 'fecha' | 'totalCordobaCapital' | 'totalEnvios'>;
  valor: number | null; 
}

export interface EnviosState {
  enviosMensuales: EnvioDiario[];
  resumenMensual: EnvioResumenMensual | null;
  mesActual: number;
  añoActual: number;
  cargando: boolean;
  error: string | null;
  editando: CeldaEditable | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CambioEnvio {
dia: number;
fecha: string;
campo: TipoEnvio;
valorAnterior: number | null;
valorNuevo: number | null;
}

export interface GuardarEnviosLoteDto {
envios: CreateEnvioDiarioDto[];
}

export interface ResultadoLoteDto {
exitosos: number;
fallidos: number;
errores: string[];
mensaje: string;
todosExitosos: boolean;
}

export interface EstadoEdicionLocal {
cambiosPendientes: Map<string, CambioEnvio>;
filasModificadas: Set<number>;
tieneChangesPendientes: boolean;
}

export const TIPOS_ENVIO = {
  oca: { label: 'OCA', color: '#D94854' },
  andreani: { label: 'Andreani', color: '#B695BF' },
  retirosSucursal: { label: 'Retiros Sucursal', color: '#51590E' },
  caddy: { label: 'Caddy', color: '#00D5D5' },
  mercadoLibre: { label: 'Mercado Libre', color: '#e327c4' }
} as const;

export type TipoEnvio = keyof typeof TIPOS_ENVIO;