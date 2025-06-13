import api from "@/api/api";
import type {
  Gasto,
  CreateGastoDto,
  UpdateGastoDto,
  GastoFiltros,
  GastoResumen,
  GastoPorCategoria,
  GastoTendencia,
  GastoResponse
} from '../../types/gastos';

const API_BASE_URL = '/api/v1/gastos';

export class GastoService {

  static async obtenerTodos(): Promise<Gasto[]> {
    const response = await api.get<Gasto[]>(API_BASE_URL);
    return response.data;
  }

  static async obtenerPorId(id: number): Promise<Gasto> {
    const response = await api.get<Gasto>(`${API_BASE_URL}/${id}`);
    return response.data;
  }

  static async crear(gasto: CreateGastoDto): Promise<Gasto> {
    const response = await api.post<Gasto>(API_BASE_URL, gasto);
    return response.data;
  }

  static async actualizar(id: number, gasto: UpdateGastoDto): Promise<Gasto> {
    const response = await api.put<Gasto>(`${API_BASE_URL}/${id}`, gasto);
    return response.data;
  }

  static async eliminar(id: number): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
  }

  static async obtenerConFiltros(filtros: GastoFiltros): Promise<GastoResponse> {
    const response = await api.post<GastoResponse>(`${API_BASE_URL}/filtrar`, filtros);
    return response.data;
  }

  static async obtenerResumenMensual(año: number, mes: number): Promise<GastoResumen> {
    const response = await api.get<GastoResumen>(`${API_BASE_URL}/resumen`, {
      params: { año, mes }
    });
    return response.data;
  }

  static async obtenerGastosPorCategoria(desde?: string, hasta?: string): Promise<GastoPorCategoria[]> {
    const response = await api.get<GastoPorCategoria[]>(`${API_BASE_URL}/por-categoria`, {
      params: { desde, hasta }
    });
    return response.data;
  }

  static async obtenerCategorias(): Promise<string[]> {
    const response = await api.get<string[]>(`${API_BASE_URL}/categorias`);
    return response.data;
  }

  static async obtenerTendenciaMensual(meses: number = 12): Promise<GastoTendencia[]> {
    const response = await api.get<GastoTendencia[]>(`${API_BASE_URL}/tendencia`, {
      params: { meses }
    });
    return response.data;
  }

  static async obtenerGastosRecurrentes(): Promise<Gasto[]> {
    const response = await api.get<Gasto[]>(`${API_BASE_URL}/recurrentes`);
    return response.data;
  }

  static async obtenerTopGastos(cantidad: number = 5, desde?: string, hasta?: string): Promise<Gasto[]> {
    const response = await api.get<Gasto[]>(`${API_BASE_URL}/top`, {
      params: { cantidad, desde, hasta }
    });
    return response.data;
  }

  // Métodos auxiliares: se mantienen igual

  static formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(monto);
  }

  static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static formatearFechaInput(fecha: string): string {
    return new Date(fecha).toISOString().split('T')[0];
  }

  static async obtenerResumenMesActual(): Promise<GastoResumen> {
    const hoy = new Date();
    return this.obtenerResumenMensual(hoy.getFullYear(), hoy.getMonth() + 1);
  }

  static async obtenerGastosMesActual(): Promise<Gasto[]> {
    const hoy = new Date();
    const primerDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    const filtros: GastoFiltros = {
      fechaDesde: primerDiaDelMes.toISOString().split('T')[0],
      fechaHasta: ultimoDiaDelMes.toISOString().split('T')[0],
      ordenarPor: 'Fecha',
      descendente: true,
      pagina: 1,
      tamañoPagina: 100
    };

    const response = await this.obtenerConFiltros(filtros);
    return response.gastos;
  }

  static calcularPorcentajeCambio(valorActual: number, valorAnterior: number): number {
    if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
    return ((valorActual - valorAnterior) / valorAnterior) * 100;
  }

  static validarFecha(fecha: string): boolean {
    const fechaGasto = new Date(fecha);
    const hoy = new Date();
    const hace5Anos = new Date();
    hace5Anos.setFullYear(hoy.getFullYear() - 5);
    return fechaGasto <= hoy && fechaGasto >= hace5Anos;
  }

  static crearFiltrosPeriodo(periodo: 'este-mes' | 'mes-anterior' | 'trimestre' | 'año'): Partial<GastoFiltros> {
    const hoy = new Date();
    switch (periodo) {
      case 'este-mes':
        return {
          fechaDesde: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0],
          fechaHasta: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
        };
      case 'mes-anterior':
        return {
          fechaDesde: new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1).toISOString().split('T')[0],
          fechaHasta: new Date(hoy.getFullYear(), hoy.getMonth(), 0).toISOString().split('T')[0]
        };
      case 'trimestre':
        const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
        return {
          fechaDesde: inicioTrimestre.toISOString().split('T')[0],
          fechaHasta: hoy.toISOString().split('T')[0]
        };
      case 'año':
        return {
          fechaDesde: new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0],
          fechaHasta: hoy.toISOString().split('T')[0]
        };
      default:
        return {};
    }
  }
}
