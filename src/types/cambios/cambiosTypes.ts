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
  // Nuevo: filtro por mes y año
  mes?: number;
  año?: number;
}

/**
 * Opciones para el selector de meses
 */
export interface OpcionMes {
  valor: string; // "2024-01"
  etiqueta: string; // "Enero 2024"
  mes: number; // 1
  año: number; // 2024
  nombre: string; // "Enero"
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

/**
 * Utilidades para manejo de meses
 */
export class MesesUtils {
  private static readonly NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  /**
   * Obtiene el mes y año actual
   */
  static obtenerMesActual(): { mes: number; año: number } {
    const fecha = new Date();
    return {
      mes: fecha.getMonth() + 1, // JavaScript usa 0-11, necesitamos 1-12
      año: fecha.getFullYear()
    };
  }

  /**
   * Genera opciones de meses para los últimos N meses
   */
  static generarOpcionesMeses(cantidadMeses = 12): OpcionMes[] {
    const opciones: OpcionMes[] = [];
    const fechaActual = new Date();

    for (let i = 0; i < cantidadMeses; i++) {
      const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
      const mes = fecha.getMonth() + 1;
      const año = fecha.getFullYear();
      const nombre = this.NOMBRES_MESES[fecha.getMonth()];

      opciones.push({
        valor: `${año}-${mes.toString().padStart(2, '0')}`,
        etiqueta: `${nombre} ${año}`,
        mes,
        año,
        nombre
      });
    }

    return opciones;
  }

  /**
   * Convierte valor de selector a filtros de fecha
   */
  static convertirMesAFiltros(valorMes: string): { fechaDesde: string; fechaHasta: string } {
    const [año, mes] = valorMes.split('-').map(Number);
    const fechaDesde = new Date(año, mes - 1, 1);
    const fechaHasta = new Date(año, mes, 0); // Último día del mes

    return {
      fechaDesde: fechaDesde.toISOString().split('T')[0],
      fechaHasta: fechaHasta.toISOString().split('T')[0]
    };
  }

  /**
   * Formatea un valor de mes para mostrar
   */
  static formatearMes(mes: number, año: number): string {
    const nombre = this.NOMBRES_MESES[mes - 1];
    return `${nombre} ${año}`;
  }
}