export interface CreateCambioSimpleDto {
  fecha: string;
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

export interface CambioSimpleDto extends CreateCambioSimpleDto {
  id: number;
  llegoAlDeposito: boolean;
  yaEnviado: boolean;
  cambioRegistradoSistema: boolean;
  etiquetaDespachada: boolean;
}

export interface EstadosCambio {
  llegoAlDeposito: boolean;
  yaEnviado: boolean;
  cambioRegistradoSistema: boolean;
  parPedido : boolean;
}

export interface CambiosFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  pedido?: string;
  celular?: string;
  nombre?: string;
  motivo?: string;
  estado?: EstadoCambioFiltro;
  envio?: string;
  mes?: number;
  año?: number;
}

export interface OpcionMes {
  valor: string;
  etiqueta: string; 
  mes: number; 
  año: number; 
  nombre: string; 
}

export type EstadoCambioFiltro = 
  | 'todos'
  | 'pendiente_llegada'    
  | 'listo_envio'          
  | 'enviado'            
  | 'completado'           
  | 'sin_registrar';  

export interface CambiosEstadisticasData {
  totalCambios: number;
  pendientesLlegada: number;
  listosParaEnvio: number;
  enviados: number;
  completados: number;
  sinRegistrar: number;
  diferenciaAbonada: number;
  diferenciaAFavor: number;
  diferencianNeta: number; 
}

export const MOTIVOS_CAMBIO = [
  'Talle',
  'Modelo',
  'Falla de fábrica',
  'No le gustó',
  'Otro'
] as const;

export type MotivoCambio = typeof MOTIVOS_CAMBIO[number];

export const COLORES_ESTADO = {
  pendiente_llegada: '#FFD700',     
  listo_envio: '#B695BF',         
  enviado: '#51590E',            
  completado: '#51590E',          
  sin_registrar: '#D94854',     
  todos: '#FFFFFF'                 
} as const;

export const LABELS_ESTADO = {
  pendiente_llegada: 'Pendiente llegada',
  listo_envio: 'Listo para envío',
  enviado: 'Enviado',
  completado: 'Completado',
  sin_registrar: 'Sin registrar en sistema',
  todos: 'Todos los estados'
} as const;

export interface ActualizarEtiquetaDto {
  etiqueta: string;
  etiquetaDespachada: boolean;
}

export interface EstadoEtiqueta {
  valor: string;
  despachada: boolean;
}

export class MesesUtils {
  private static readonly NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];


  static obtenerMesActual(): { mes: number; año: number } {
    const fecha = new Date();
    return {
      mes: fecha.getMonth() + 1, 
      año: fecha.getFullYear()
    };
  }

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

  static convertirMesAFiltros(valorMes: string): { fechaDesde: string; fechaHasta: string } {
    const [año, mes] = valorMes.split('-').map(Number);
    const fechaDesde = new Date(año, mes - 1, 1);
    const fechaHasta = new Date(año, mes, 0); 

    return {
      fechaDesde: fechaDesde.toISOString().split('T')[0],
      fechaHasta: fechaHasta.toISOString().split('T')[0]
    };
  }

  static formatearMes(mes: number, año: number): string {
    const nombre = this.NOMBRES_MESES[mes - 1];
    return `${nombre} ${año}`;
  }
}