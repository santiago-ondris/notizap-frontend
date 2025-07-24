export interface EnvioDiario {
  id: number;
  fecha: string; // ISO string format "2025-06-11T19:07:27.112Z"
  
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

/**
 * DTO para crear un nuevo envío diario
 * No incluye id ni totales calculados
 */
export interface CreateEnvioDiarioDto {
  fecha: string; // ISO string format
  
  // ✅ CAMPOS NULLABLE para updates parciales
  oca?: number | null;
  andreani?: number | null;
  retirosSucursal?: number | null;
  roberto?: number | null;
  tino?: number | null;
  caddy?: number | null;
  mercadoLibre?: number | null;
}

/**
 * DTO para actualizar un envío existente
 * Mismo formato que CreateEnvioDiarioDto
 */
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

/**
 * Resumen mensual con totales por tipo de envío
 * Usado para mostrar cards de estadísticas
 */
export interface EnvioResumenMensual {
  totalOca: number;
  totalAndreani: number;
  totalRetirosSucursal: number;
  totalRoberto: number;
  totalTino: number;
  totalCaddy: number;
  totalMercadoLibre: number;
  totalCordobaCapital: number; // roberto + tino + caddy
  totalGeneral: number; // suma de todos
}

/**
 * Parámetros para filtrar por mes y año
 */
export interface EnviosFiltros {
  year: number;
  month: number; // 1-12
}

/**
 * Parámetros para filtrar por fecha específica
 */
export interface EnviosFecha {
  fecha: string; // formato "YYYY-MM-DD"
}

/**
 * Tipo para representar una celda editable en la tabla
 */
export interface CeldaEditable {
  dia: number;
  campo: keyof Omit<EnvioDiario, 'id' | 'fecha' | 'totalCordobaCapital' | 'totalEnvios'>;
  valor: number | null; // ✅ También nullable
}

/**
 * Estados de la aplicación para el módulo de envíos
 */
export interface EnviosState {
  enviosMensuales: EnvioDiario[];
  resumenMensual: EnvioResumenMensual | null;
  mesActual: number;
  añoActual: number;
  cargando: boolean;
  error: string | null;
  editando: CeldaEditable | null;
}

/**
 * Respuesta de la API para operaciones CRUD
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
* Representa un cambio pendiente en una celda
*/
export interface CambioEnvio {
dia: number;
fecha: string;
campo: TipoEnvio;
valorAnterior: number | null;
valorNuevo: number | null;
}

/**
* DTO para enviar múltiples envíos al backend
*/
export interface GuardarEnviosLoteDto {
envios: CreateEnvioDiarioDto[];
}

/**
* Respuesta del backend para operaciones en lote
*/
export interface ResultadoLoteDto {
exitosos: number;
fallidos: number;
errores: string[];
mensaje: string;
todosExitosos: boolean;
}

/**
* Estado de edición local para la tabla
*/
export interface EstadoEdicionLocal {
cambiosPendientes: Map<string, CambioEnvio>;
filasModificadas: Set<number>;
tieneChangesPendientes: boolean;
}

/**
 * Tipos de envío disponibles (para UI)
 */
export const TIPOS_ENVIO = {
  oca: { label: 'OCA', color: '#D94854' },
  andreani: { label: 'Andreani', color: '#B695BF' },
  retirosSucursal: { label: 'Retiros Sucursal', color: '#51590E' },
  roberto: { label: 'Roberto', color: '#F23D5E' },
  tino: { label: 'Tino', color: '#FFD700' },
  caddy: { label: 'Caddy', color: '#00D5D5' },
  mercadoLibre: { label: 'Mercado Libre', color: '#e327c4' }
} as const;

/**
 * Utility type para los nombres de los campos editables
 */
export type TipoEnvio = keyof typeof TIPOS_ENVIO;