/**
 * DTO para crear una nueva devolución
 * Corresponde al CreateDevolucionDto del backend
 */
export interface CreateDevolucionDto {
    fecha: string;                   
    pedido: string;                 
    celular: string;                  
    modelo: string;              
    motivo: string;                  
    monto?: number;                   
    pagoEnvio?: number;               
    responsable: string;             
  }
  
  /**
   * DTO completo de devolución (incluye estados y ID)
   * Corresponde al DevolucionDto del backend
   */
  export interface DevolucionDto extends CreateDevolucionDto {
    id: number;                      
    llegoAlDeposito: boolean;         
    dineroDevuelto: boolean;         
    notaCreditoEmitida: boolean;    
  }
  
  /**
   * Estados de una devolución (para actualización inline)
   */
  export interface EstadosDevolucion {
    llegoAlDeposito: boolean;
    dineroDevuelto: boolean;
    notaCreditoEmitida: boolean;
  }
  
  // ================================
  // FILTROS Y BÚSQUEDA
  // ================================
  
  /**
   * Tipos para filtrado por estado
   */
  export type EstadoDevolucionFiltro = 
    | 'todos'
    | 'pendiente_llegada'     
    | 'llegado_sin_procesar'   
    | 'dinero_devuelto'        
    | 'nota_emitida'           
    | 'completado'             
    | 'sin_llegar';            
  
  /**
   * Filtros para devoluciones
   */
  export interface DevolucionesFiltros {
    // Búsquedas de texto
    pedido?: string;
    celular?: string;
    modelo?: string;
    responsable?: string;
    
    // Filtros por estado
    estado?: EstadoDevolucionFiltro;
    motivo?: string;
    
    // Rango de fechas
    fechaDesde?: string;
    fechaHasta?: string;
    
    // Filtros por montos
    montoMinimo?: number;
    montoMaximo?: number;
  }
  
  // ================================
  // ESTADÍSTICAS
  // ================================
  
  /**
   * Datos para las estadísticas de devoluciones
   */
  export interface DevolucionesEstadisticasData {
    // Contadores principales
    totalDevoluciones: number;
    pendientesLlegada: number;
    llegadosSinProcesar: number;
    completados: number;
    
    // Estados específicos
    dineroDevuelto: number;
    notasEmitidas: number;
    sinProcesar: number;
    
    // Montos
    montoTotalDevoluciones: number;
    montoTotalPagosEnvio: number;
    montoPromedioDevolucion: number;
    
    // Métricas adicionales
    devolucionesMesActual: number;
    porcentajeCompletadas: number;
  }
  
  // ================================
  // CONSTANTES Y CONFIGURACIÓN
  // ================================
  
  /**
   * Motivos comunes de devolución
   */
  export const MOTIVOS_DEVOLUCION = [
    'No le gustó',
    'Producto defectuoso',
    'Talle incorrecto',
    'Color incorrecto',
    'No era lo esperado',
    'Llegó dañado',
    'Error en el envío',
    'Cambio de opinión',
    'Producto usado/sucio',
    'Demora en la entrega',
    'Otro'
  ] as const;
  
  /**
   * Labels para mostrar en la UI según el estado
   */
  export const LABELS_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: 'Todos los estados',
    pendiente_llegada: 'Pendiente de llegada',
    llegado_sin_procesar: 'Llegado sin procesar',
    dinero_devuelto: 'Dinero devuelto',
    nota_emitida: 'Nota de crédito emitida',
    completado: 'Completado',
    sin_llegar: 'Sin llegar'
  };
  
  /**
   * Colores para cada estado de devolución
   */
  export const COLORES_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: '#FFFFFF',
    pendiente_llegada: '#FFD700',     // Dorado
    llegado_sin_procesar: '#e327c4',  // Fucsia
    dinero_devuelto: '#51590E',       // Verde oliva
    nota_emitida: '#B695BF',          // Violeta
    completado: '#51590E',            // Verde oliva
    sin_llegar: '#D94854'             // Rojo
  };
  
  /**
   * Iconos para cada estado (emojis)
   */
  export const ICONOS_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: '📋',
    pendiente_llegada: '⏳',
    llegado_sin_procesar: '📦',
    dinero_devuelto: '💰',
    nota_emitida: '🧾',
    completado: '✅',
    sin_llegar: '🚫'
  };
  
  // ================================
  // TIPOS AUXILIARES
  // ================================
  
  /**
   * Tipo para ordenamiento de la tabla
   */
  export type OrdenDevolucion = 
    | 'fecha_desc'
    | 'fecha_asc'
    | 'pedido_asc'
    | 'pedido_desc'
    | 'monto_desc'
    | 'monto_asc';
  
  /**
   * Configuración de paginación
   */
  export interface PaginacionDevoluciones {
    pagina: number;
    tamanoPagina: number;
    total: number;
  }
  
  /**
   * Respuesta paginada del backend
   */
  export interface DevolucionesPaginadasResponse {
    data: DevolucionDto[];
    pagination: PaginacionDevoluciones;
  }
  
  /**
   * Parámetros para la consulta al backend
   */
  export interface DevolucionesQueryParams {
    pagina?: number;
    tamanoPagina?: number;
    orden?: OrdenDevolucion;
    filtros?: DevolucionesFiltros;
  }
  
  // ================================
  // TIPOS PARA FORMULARIOS
  // ================================
  
  /**
   * Errores de validación para el formulario
   */
  export interface DevolucionFormErrors {
    fecha?: string;
    pedido?: string;
    celular?: string;
    modelo?: string;
    motivo?: string;
    monto?: string;
    pagoEnvio?: string;
    responsable?: string;
  }
  
  /**
   * Estado del formulario de devolución
   */
  export interface DevolucionFormState {
    data: Partial<CreateDevolucionDto>;
    errors: DevolucionFormErrors;
    isValid: boolean;
    isSubmitting: boolean;
  }
  
  // ================================
  // EXPORTACIONES POR DEFECTO
  // ================================
  
  export default {
    MOTIVOS_DEVOLUCION,
    LABELS_ESTADO_DEVOLUCION,
    COLORES_ESTADO_DEVOLUCION,
    ICONOS_ESTADO_DEVOLUCION
  };