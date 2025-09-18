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
  
  export interface DevolucionDto extends CreateDevolucionDto {
    id: number;                      
    llegoAlDeposito: boolean;         
    dineroDevuelto: boolean;         
    notaCreditoEmitida: boolean;    
  }
  
  export interface EstadosDevolucion {
    llegoAlDeposito: boolean;
    dineroDevuelto: boolean;
    notaCreditoEmitida: boolean;
  }
  
  export type EstadoDevolucionFiltro = 
    | 'todos'
    | 'pendiente_llegada'     
    | 'llegado_sin_procesar'   
    | 'dinero_devuelto'        
    | 'nota_emitida'           
    | 'completado'             
    | 'sin_llegar';            
  
  export interface DevolucionesFiltros {
    pedido?: string;
    celular?: string;
    modelo?: string;
    responsable?: string;
    
    estado?: EstadoDevolucionFiltro;
    motivo?: string;
    
    fechaDesde?: string;
    fechaHasta?: string;
    
    montoMinimo?: number;
    montoMaximo?: number;
  }
  
  export interface DevolucionesEstadisticasData {
    totalDevoluciones: number;
    pendientesLlegada: number;
    llegadosSinProcesar: number;
    completados: number;
    
    dineroDevuelto: number;
    notasEmitidas: number;
    sinProcesar: number;
    
    montoTotalDevoluciones: number;
    montoTotalPagosEnvio: number;
    montoPromedioDevolucion: number;
    
    devolucionesMesActual: number;
    porcentajeCompletadas: number;
  }
  
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
  
  export const LABELS_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: 'Todos los estados',
    pendiente_llegada: 'Pendiente de llegada',
    llegado_sin_procesar: 'Llegado sin procesar',
    dinero_devuelto: 'Dinero devuelto',
    nota_emitida: 'Nota de crédito emitida',
    completado: 'Completado',
    sin_llegar: 'Sin llegar'
  };
  
  export const COLORES_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: '#FFFFFF',
    pendiente_llegada: '#FFD700',  
    llegado_sin_procesar: '#e327c4', 
    dinero_devuelto: '#51590E',       
    nota_emitida: '#B695BF',         
    completado: '#51590E',            
    sin_llegar: '#D94854'            
  };
  
  export const ICONOS_ESTADO_DEVOLUCION: Record<EstadoDevolucionFiltro, string> = {
    todos: '📋',
    pendiente_llegada: '⏳',
    llegado_sin_procesar: '📦',
    dinero_devuelto: '💰',
    nota_emitida: '🧾',
    completado: '✅',
    sin_llegar: '🚫'
  };
  
  export type OrdenDevolucion = 
    | 'fecha_desc'
    | 'fecha_asc'
    | 'pedido_asc'
    | 'pedido_desc'
    | 'monto_desc'
    | 'monto_asc';
  
  export interface PaginacionDevoluciones {
    pagina: number;
    tamanoPagina: number;
    total: number;
  }
  

  export interface DevolucionesPaginadasResponse {
    data: DevolucionDto[];
    pagination: PaginacionDevoluciones;
  }
  

  export interface DevolucionesQueryParams {
    pagina?: number;
    tamanoPagina?: number;
    orden?: OrdenDevolucion;
    filtros?: DevolucionesFiltros;
  }
  
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
  

  export interface DevolucionFormState {
    data: Partial<CreateDevolucionDto>;
    errors: DevolucionFormErrors;
    isValid: boolean;
    isSubmitting: boolean;
  }
  

  export default {
    MOTIVOS_DEVOLUCION,
    LABELS_ESTADO_DEVOLUCION,
    COLORES_ESTADO_DEVOLUCION,
    ICONOS_ESTADO_DEVOLUCION
  };