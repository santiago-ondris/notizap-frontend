/**
 * DTO para crear un nuevo cambio (versión simplificada)
 */
export interface CreateCambioSimpleDto {
  fecha: string; // ISO string
  pedido: string;
  celular: string;
  nombre: string;
  apellido?: string;
  email: string;
  modeloOriginal: string;
  modeloCambio: string;
  motivo: string;
  parPedido: boolean;
  diferenciaAbonada?: number;
  diferenciaAFavor?: number;
  envio?: string;
  observaciones?: string;
  etiqueta?: string;
}

/**
 * DTO completo del cambio (incluye ID y estados)
 */
export interface CambioSimpleDto extends CreateCambioSimpleDto {
  id: number;
  llegoAlDeposito: boolean;
  yaEnviado: boolean;
  cambioRegistradoSistema: boolean;
  etiquetaDespachada: boolean;
}

/**
 * Estados posibles de un cambio
 */
export interface EstadosCambio {
  llegoAlDeposito: boolean;
  yaEnviado: boolean;
  cambioRegistradoSistema: boolean;
  parPedido : boolean;
}

/**
 * Filtros para la tabla de cambios
 */
export interface CambiosFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  pedido?: string;
  celular?: string;
  nombre?: string;
  motivo?: string;
  estado?: EstadoCambioFiltro;
  envio?: string;
}

/**
 * Tipos de filtro por estado
 */
export type EstadoCambioFiltro = 
  | 'todos'
  | 'pendiente_llegada'     // !llegoAlDeposito
  | 'listo_envio'          // llegoAlDeposito && !yaEnviado
  | 'enviado'              // yaEnviado
  | 'completado'           // llegoAlDeposito && yaEnviado && cambioRegistradoSistema
  | 'sin_registrar';  
         // !cambioRegistradoSistema

/**
 * Estadísticas del módulo de cambios
 */
export interface CambiosEstadisticasData {
  totalCambios: number;
  pendientesLlegada: number;
  listosParaEnvio: number;
  enviados: number;
  completados: number;
  sinRegistrar: number;
  diferenciaAbonada: number;
  diferenciaAFavor: number;
  diferencianNeta: number; // diferenciaAbonada - diferenciaAFavor
}

/**
 * Motivos comunes de cambio (para dropdown)
 */
export const MOTIVOS_CAMBIO = [
  'Talle',
  'Modelo',
  'Falla de fábrica',
  'No le gustó',
  'Otro'
] as const;

export type MotivoCambio = typeof MOTIVOS_CAMBIO[number];

/**
 * Configuración de colores para estados
 */
export const COLORES_ESTADO = {
  pendiente_llegada: '#FFD700',     // Dorado
  listo_envio: '#B695BF',          // Violeta
  enviado: '#51590E',              // Verde oliva
  completado: '#51590E',           // Verde oliva
  sin_registrar: '#D94854',        // Rojo
  todos: '#FFFFFF'                 // Blanco
} as const;

/**
 * Labels para estados
 */
export const LABELS_ESTADO = {
  pendiente_llegada: 'Pendiente llegada',
  listo_envio: 'Listo para envío',
  enviado: 'Enviado',
  completado: 'Completado',
  sin_registrar: 'Sin registrar en sistema',
  todos: 'Todos los estados'
} as const;

/**
 * DTO para actualizar solo etiqueta y estado de despacho
 */
export interface ActualizarEtiquetaDto {
  etiqueta: string;
  etiquetaDespachada: boolean;
}

/**
 * Estados de etiqueta para el componente
 */
export interface EstadoEtiqueta {
  valor: string;
  despachada: boolean;
}