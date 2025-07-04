import api from "@/api/api";
import type {
  ComisionOnline,
  CreateComisionOnline,
  UpdateComisionOnline,
  ComisionOnlineQuery,
  PaginatedComisionResponse,
  CalculoComision,
  CalcularComisionRequest,
  AuxiliaresComision
} from "@/types/woocommerce/comisionTypes";

const BASE_URL = "/api/v1/comisiones-online";

// CRUD Básico
export async function getComisionById(id: number): Promise<ComisionOnline> {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
}

export async function getAllComisiones(): Promise<ComisionOnline[]> {
  const response = await api.get(`${BASE_URL}`);
  return response.data;
}

export async function getComisionesPaged(
  query: ComisionOnlineQuery = {}
): Promise<PaginatedComisionResponse> {
  const response = await api.get(`${BASE_URL}/paged`, { params: query });
  return response.data;
}

export async function createComision(
  comision: CreateComisionOnline
): Promise<ComisionOnline> {
  const response = await api.post(`${BASE_URL}`, comision);
  return response.data;
}

export async function updateComision(
  comision: UpdateComisionOnline
): Promise<ComisionOnline> {
  const response = await api.put(`${BASE_URL}/${comision.id}`, comision);
  return response.data;
}

export async function deleteComision(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}

// Consultas específicas del negocio
export async function getComisionByPeriodo(
  mes: number,
  año: number
): Promise<ComisionOnline | null> {
  try {
    const response = await api.get(`${BASE_URL}/periodo/${mes}/${año}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getComisionesByAño(año: number): Promise<ComisionOnline[]> {
  const response = await api.get(`${BASE_URL}/año/${año}`);
  return response.data;
}

// Cálculos
export async function calcularComision(
  request: CalcularComisionRequest
): Promise<CalculoComision> {
  const response = await api.post(`${BASE_URL}/calcular`, request);
  return response.data;
}

// Validaciones
export async function existeComision(
  mes: number,
  año: number
): Promise<boolean> {
  const response = await api.get(`${BASE_URL}/exists/periodo/${mes}/${año}`);
  return response.data.exists;
}

// Operaciones de eliminación
export async function deleteComisionByPeriodo(
  mes: number,
  año: number
): Promise<void> {
  await api.delete(`${BASE_URL}/periodo/${mes}/${año}`);
}

// Datos auxiliares
export async function getAuxiliares(): Promise<AuxiliaresComision> {
  const response = await api.get(`${BASE_URL}/auxiliares`);
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

export function formatearMonedaConDecimales(monto: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function validarPeriodo(mes: number, año: number): boolean {
  return mes >= 1 && mes <= 12 && año >= 2020 && año <= 2030;
}

export function obtenerMesAnterior(mes: number, año: number): { mes: number; año: number } {
  if (mes === 1) {
    return { mes: 12, año: año - 1 };
  }
  return { mes: mes - 1, año };
}

export function obtenerMesSiguiente(mes: number, año: number): { mes: number; año: number } {
  if (mes === 12) {
    return { mes: 1, año: año + 1 };
  }
  return { mes: mes + 1, año };
}

// Validaciones de formulario
export function validarMonto(valor: string): string | null {
  if (!valor || valor.trim() === '') {
    return 'Este campo es requerido';
  }
  
  const numero = parseFloat(valor.replace(/[^\d.-]/g, ''));
  
  if (isNaN(numero)) {
    return 'Debe ser un número válido';
  }
  
  if (numero < 0) {
    return 'El monto no puede ser negativo';
  }
  
  if (numero > 999999999) {
    return 'El monto es demasiado grande';
  }
  
  return null;
}

export function validarFormularioComision(
  totalSinNC: string,
  montoAndreani: string,
  montoOCA: string,
  montoCaddy: string
): { valido: boolean; errores: Record<string, string> } {
  const errores: Record<string, string> = {};
  
  const errorTotalSinNC = validarMonto(totalSinNC);
  if (errorTotalSinNC) errores.totalSinNC = errorTotalSinNC;
  
  const errorAndreani = validarMonto(montoAndreani);
  if (errorAndreani) errores.montoAndreani = errorAndreani;
  
  const errorOCA = validarMonto(montoOCA);
  if (errorOCA) errores.montoOCA = errorOCA;
  
  const errorCaddy = validarMonto(montoCaddy);
  if (errorCaddy) errores.montoCaddy = errorCaddy;
  
  return {
    valido: Object.keys(errores).length === 0,
    errores
  };
}

// Parsear strings de moneda a números
export function parsearMonto(valor: string): number {
  if (!valor || valor.trim() === '') return 0;
  
  // Remover símbolos de moneda y espacios, mantener solo números, puntos y comas
  const cleaned = valor.replace(/[^\d.,-]/g, '');
  
  // Convertir comas a puntos para parseFloat
  const normalized = cleaned.replace(',', '.');
  
  const numero = parseFloat(normalized);
  return isNaN(numero) ? 0 : numero;
}

// Formatear número para input
export function formatearParaInput(numero: number): string {
  if (numero === 0) return '';
  return numero.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

// Calcular porcentajes para mostrar distribución
export function calcularPorcentajeEnvio(montoEmpresa: number, totalEnvios: number): number {
  if (totalEnvios === 0) return 0;
  return (montoEmpresa / totalEnvios) * 100;
}

// Obtener color de empresa
export function obtenerColorEmpresa(empresa: string): string {
  switch (empresa.toUpperCase()) {
    case 'ANDREANI':
      return '#D94854';
    case 'OCA':
      return '#B695BF';
    case 'CADDY':
      return '#51590E';
    default:
      return '#FFD700';
  }
}

// Obtener emoji de empresa
export function obtenerEmojiEmpresa(empresa: string): string {
  switch (empresa.toUpperCase()) {
    case 'ANDREANI':
      return '🚚';
    case 'OCA':
      return '📦';
    case 'CADDY':
      return '🛵';
    default:
      return '💰';
  }
}