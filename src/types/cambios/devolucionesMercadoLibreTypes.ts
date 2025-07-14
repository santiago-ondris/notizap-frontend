export interface DevolucionMercadoLibreDto {
    id: number;
    fecha: string;
    cliente: string;
    modelo: string;
    notaCreditoEmitida: boolean;
    trasladado : boolean;
    fechaCreacion: string;
    fechaActualizacion?: string;
    pedido: string;
  }
  
  export interface CreateDevolucionMercadoLibreDto {
    fecha: string;
    cliente: string;
    modelo: string;
    notaCreditoEmitida?: boolean;
    trasladado?: boolean;
    pedido: string;
  }
  
  export interface UpdateDevolucionMercadoLibreDto {
    fecha: string;
    cliente: string;
    modelo: string;
    notaCreditoEmitida: boolean;
    trasladado: boolean;
    pedido: string;
  }
  
  // Interfaces para filtros
  export interface DevolucionesMercadoLibreFiltros {
    año?: number;
    mes?: number;
    cliente?: string;
    modelo?: string;
    notaCreditoEmitida?: boolean;
    pedido?: string;
  }
  
  // Interfaces para estadísticas
  export interface DevolucionesMercadoLibreEstadisticas {
    totalDevoluciones: number;
    notasCreditoEmitidas: number;
    notasCreditoPendientes: number;
    devolucionesMesActual: number;
    porcentajeNotasEmitidas: number;
    estadisticasPorMes: EstadisticasMensualDto[];
  }
  
  export interface EstadisticasMensualDto {
    año: number;
    mes: number;
    nombreMes: string;
    totalDevoluciones: number;
    notasCreditoEmitidas: number;
    notasCreditoPendientes: number;
  }
  
  // Interface para meses disponibles
  export interface MesDisponible {
    año: number;
    mes: number;
    nombreMes: string;
    valor: string; // "2024-06"
    etiqueta: string; // "Junio 2024"
  }
  
  // Interface para errores de formulario
  export interface DevolucionMercadoLibreFormErrors {
    fecha?: string;
    cliente?: string;
    modelo?: string;
    pedido?: string;
  }
  
  // Estados del filtro de notas de crédito
  export type FiltroNotaCredito = 'todos' | 'emitidas' | 'pendientes';
  
  // Labels para el filtro de notas de crédito
  export const LABELS_FILTRO_NOTA_CREDITO: Record<FiltroNotaCredito, string> = {
    todos: 'Todas las devoluciones',
    emitidas: 'Notas de crédito emitidas',
    pendientes: 'Notas de crédito pendientes'
  };
  
  // Colores para estados de nota de crédito
  export const COLORES_NOTA_CREDITO = {
    emitida: '#51590E', // Verde oliva
    pendiente: '#D94854', // Rojo principal
    neutral: '#B695BF'  // Violeta
  };
  
  // Opciones para el selector de año
  export const obtenerOpcionesAño = (): Array<{ value: number; label: string }> => {
    const añoActual = new Date().getFullYear();
    const años = [];
    
    for (let i = añoActual; i >= añoActual - 5; i--) {
      años.push({
        value: i,
        label: i.toString()
      });
    }
    
    return años;
  };
  
  // Opciones para el selector de mes
  export const OPCIONES_MES = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];