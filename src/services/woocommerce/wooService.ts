import api from "@/api/api";
import type {
  VentaWooCommerce,
  CreateVentaWooCommerce,
  UpdateVentaWooCommerce,
  VentaWooCommerceQuery,
  TotalesVentas,
  ResumenVentas,
  PaginatedResponse,
  EstadisticasTienda,
  CrecimientoMensual,
  AuxiliaresVentas,
} from "@/types/woocommerce/wooTypes";

const BASE_URL = "/api/v1/ventas-woocommerce";

// CRUD Básico
export async function getVentaById(id: number): Promise<VentaWooCommerce> {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
}

export async function getVentasPaged(
  query: VentaWooCommerceQuery = {}
): Promise<PaginatedResponse<VentaWooCommerce>> {
  const response = await api.get(`${BASE_URL}`, { params: query });
  return response.data;
}

export async function createVenta(
  venta: CreateVentaWooCommerce
): Promise<VentaWooCommerce> {
  const response = await api.post(`${BASE_URL}`, venta);
  return response.data;
}

export async function updateVenta(
  venta: UpdateVentaWooCommerce
): Promise<VentaWooCommerce> {
  const response = await api.put(`${BASE_URL}/${venta.id}`, venta);
  return response.data;
}

export async function deleteVenta(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}

// Consultas específicas
export async function getVentaByTiendaYPeriodo(
  tienda: string,
  mes: number,
  año: number
): Promise<VentaWooCommerce | null> {
  try {
    const response = await api.get(
      `${BASE_URL}/tienda/${encodeURIComponent(tienda)}/periodo/${mes}/${año}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getVentasByPeriodo(
  mes: number,
  año: number
): Promise<VentaWooCommerce[]> {
  const response = await api.get(`${BASE_URL}/periodo/${mes}/${año}`);
  return response.data;
}

export async function getVentasByTienda(
  tienda: string
): Promise<VentaWooCommerce[]> {
  const response = await api.get(
    `${BASE_URL}/tienda/${encodeURIComponent(tienda)}`
  );
  return response.data;
}

export async function getVentasByAño(año: number): Promise<VentaWooCommerce[]> {
  const response = await api.get(`${BASE_URL}/año/${año}`);
  return response.data;
}

// Dashboard y reportes (clave para replicar tu Excel)
export async function getTotalesByPeriodo(
  mes: number,
  año: number
): Promise<TotalesVentas> {
  const response = await api.get(`${BASE_URL}/dashboard/totales/${mes}/${año}`);
  return response.data;
}

export async function getResumenByPeriodo(
  mes: number,
  año: number
): Promise<ResumenVentas[]> {
  const response = await api.get(`${BASE_URL}/dashboard/resumen/${mes}/${año}`);
  return response.data;
}

export async function getTotalesByAño(
  año: number
): Promise<TotalesVentas[]> {
  const response = await api.get(`${BASE_URL}/dashboard/año/${año}`);
  return response.data;
}

// Validaciones
export async function existeVenta(
  tienda: string,
  mes: number,
  año: number
): Promise<boolean> {
  const response = await api.get(
    `${BASE_URL}/exists/tienda/${encodeURIComponent(tienda)}/periodo/${mes}/${año}`
  );
  return response.data.exists;
}

// Estadísticas
export async function getEstadisticasTienda(
  tienda: string,
  año: number
): Promise<EstadisticasTienda> {
  const response = await api.get(
    `${BASE_URL}/estadisticas/tienda/${encodeURIComponent(tienda)}/año/${año}`
  );
  return response.data;
}

export async function getAuxiliares(): Promise<AuxiliaresVentas> {
  const response = await api.get(`${BASE_URL}/auxiliares`);
  return response.data;
}

// Operaciones de lote
export async function createVentasBatch(
  ventas: CreateVentaWooCommerce[]
): Promise<VentaWooCommerce[]> {
  const response = await api.post(`${BASE_URL}/batch`, ventas);
  return response.data;
}

export async function deleteVentasByPeriodo(
  mes: number,
  año: number
): Promise<void> {
  await api.delete(`${BASE_URL}/periodo/${mes}/${año}`);
}

// Comparaciones temporales
export async function getCrecimientoMensual(
  tienda: string,
  mesActual: number,
  añoActual: number,
  mesAnterior: number,
  añoAnterior: number
): Promise<CrecimientoMensual> {
  const response = await api.get(
    `${BASE_URL}/crecimiento/tienda/${encodeURIComponent(tienda)}/actual/${mesActual}/${añoActual}/anterior/${mesAnterior}/${añoAnterior}`
  );
  return response.data;
}

export async function getEvolucionAnual(
  tienda: string,
  año: number
): Promise<TotalesVentas[]> {
  const response = await api.get(
    `${BASE_URL}/evolucion/tienda/${encodeURIComponent(tienda)}/año/${año}`
  );
  return response.data;
}

// Funciones helper para el frontend
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-AR').format(numero);
}

export function formatearPeriodo(mes: number, año: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${meses[mes - 1]} ${año}`;
}

export function calcularCrecimiento(actual: number, anterior: number): number {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - anterior) / anterior) * 100);
}

export function obtenerMesAnterior(mes: number, año: number): { mes: number; año: number } {
  if (mes === 1) {
    return { mes: 12, año: año - 1 };
  }
  return { mes: mes - 1, año };
}

export function validarPeriodo(mes: number, año: number): boolean {
  return mes >= 1 && mes <= 12 && año >= 2020 && año <= 2030;
}