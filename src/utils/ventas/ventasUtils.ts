import type { MercadoLibreManualReport } from "@/types/mercadolibre/ml";
import type { TotalesVentas, DashboardVentas, ResumenVentas } from "@/types/woocommerce/wooTypes";

// Mapeo de datos de MercadoLibre al formato del dashboard
export function mapearMercadoLibreAResumen(reports: MercadoLibreManualReport[], mes: number, año: number): ResumenVentas | null {
  const report = reports.find(r => r.month === mes && r.year === año);
  
  if (!report) return null;

  return {
    tienda: "MERCADOLIBRE",
    montoFacturado: report.revenue,
    unidadesVendidas: report.unitsSold,
    topProductos: [], // MercadoLibre no tiene esta data en el manual report
    topCategorias: [] // MercadoLibre no tiene esta data en el manual report
  };
}

// Crear dashboard unificado combinando WooCommerce + MercadoLibre
export function crearDashboardUnificado(
  woocommerce: TotalesVentas,
  mercadolibreReports: MercadoLibreManualReport[],
  mes: number,
  año: number
): DashboardVentas {
  const mlResumen = mapearMercadoLibreAResumen(mercadolibreReports, mes, año);
  
  // Convertir reports ML al formato que espera el dashboard
  const mlData = mercadolibreReports
    .filter(r => r.month === mes && r.year === año)
    .map(report => ({
      tienda: "MERCADOLIBRE",
      montoFacturado: report.revenue,
      unidadesVendidas: report.unitsSold,
      topProductos: [],
      topCategorias: [],
      mes: report.month,
      año: report.year
    }));

  // Calcular totales generales
  const totalWooCommerce = {
    monto: woocommerce.totalFacturado,
    unidades: woocommerce.totalUnidades
  };

  const totalMercadoLibre = {
    monto: mlResumen?.montoFacturado || 0,
    unidades: mlResumen?.unidadesVendidas || 0
  };

  return {
    woocommerce,
    mercadolibre: mlData,
    totalGeneral: {
      montoFacturado: totalWooCommerce.monto + totalMercadoLibre.monto,
      unidadesVendidas: totalWooCommerce.unidades + totalMercadoLibre.unidades
    },
    mes,
    año,
    periodoCompleto: formatearPeriodoCompleto(mes, año)
  };
}

// Formateo de período completo
export function formatearPeriodoCompleto(mes: number, año: number): string {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `${meses[mes - 1]} ${año}`;
}

// Formateo de moneda argentina
export function formatearMonedaArg(monto: number): string {
  return `$ ${monto.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// Formateo de números con separadores argentinos
export function formatearNumeroArg(numero: number): string {
  return numero.toLocaleString("es-AR");
}

// Calcular variación porcentual (igual que en ReportsTable)
export function calcularVariacion(actual: number, anterior: number | undefined): number | null {
  if (anterior === undefined || anterior === 0) return null;
  return ((actual - anterior) / anterior) * 100;
}

// Formatear variación con íconos (reutilizar lógica de ReportsTable)
export function formatearVariacion(variacion: number | null): {
  texto: string;
  color: string;
  icono: 'up' | 'down' | 'neutral' | 'none';
} {
  if (variacion === null) {
    return {
      texto: "–",
      color: "text-white/40",
      icono: 'none'
    };
  }
  
  if (variacion > 0) {
    return {
      texto: `+${variacion.toFixed(1)}%`,
      color: "text-[#BFB69B]",
      icono: 'up'
    };
  }
  
  if (variacion < 0) {
    return {
      texto: `${variacion.toFixed(1)}%`,
      color: "text-[#D94854]",
      icono: 'down'
    };
  }
  
  return {
    texto: "0%",
    color: "text-white/60",
    icono: 'neutral'
  };
}

// Obtener período anterior (para comparaciones)
export function obtenerPeriodoAnterior(mes: number, año: number): { mes: number; año: number } {
  if (mes === 1) {
    return { mes: 12, año: año - 1 };
  }
  return { mes: mes - 1, año };
}

export function obtenerPeriodoSiguiente(mes: number, año: number): { mes: number; año: number } {
  if (mes === 12) {
    return { mes: 1, año: año + 1 };
  }
  return { mes: mes + 1, año };
}

// Validar si un período es válido
export function esPeriodoValido(mes: number, año: number): boolean {
  return mes >= 1 && mes <= 12 && año >= 2020 && año <= 2030;
}

// Obtener el período actual
export function obtenerPeriodoActual(): { mes: number; año: number } {
  const fecha = new Date();
  return {
    mes: fecha.getMonth() + 1,
    año: fecha.getFullYear()
  };
}

// Crear estructura para tabla como la de MercadoLibre
export function crearFilaTablaVentas(
  tienda: string,
  datos: { montoFacturado: number; unidadesVendidas: number },
  datosPeriodoAnterior?: { montoFacturado: number; unidadesVendidas: number }
) {
  const varUnidades = calcularVariacion(datos.unidadesVendidas, datosPeriodoAnterior?.unidadesVendidas);
  const varMonto = calcularVariacion(datos.montoFacturado, datosPeriodoAnterior?.montoFacturado);

  return {
    tienda,
    unidadesVendidas: datos.unidadesVendidas,
    montoFacturado: datos.montoFacturado,
    variacionUnidades: formatearVariacion(varUnidades),
    variacionMonto: formatearVariacion(varMonto),
    unidadesFormateadas: formatearNumeroArg(datos.unidadesVendidas),
    montoFormateado: formatearMonedaArg(datos.montoFacturado)
  };
}

// Generar datos para gráficos (evolutivo anual)
export function generarDatosGrafico(
  ventasWooCommerce: TotalesVentas[],
  ventasMercadoLibre: MercadoLibreManualReport[],
  año: number
): Array<{
  mes: string;
  mesNumero: number;
  montellaWoo: number;
  alenkaWoo: number;
  mercadoLibre: number;
  total: number;
}> {
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  return Array.from({ length: 12 }, (_, index) => {
    const mesNum = index + 1;
    
    // Buscar datos de WooCommerce para este mes
    const wooMes = ventasWooCommerce.find(v => v.mes === mesNum && v.año === año);
    const montella = wooMes?.ventasPorTienda.find(t => t.tienda.includes('MONTELLA'))?.montoFacturado || 0;
    const alenka = wooMes?.ventasPorTienda.find(t => t.tienda.includes('ALENKA'))?.montoFacturado || 0;
    
    // Buscar datos de MercadoLibre para este mes
    const mlMes = ventasMercadoLibre.find(v => v.month === mesNum && v.year === año);
    const mercadoLibre = mlMes?.revenue || 0;
    
    return {
      mes: meses[index],
      mesNumero: mesNum,
      montellaWoo: montella,
      alenkaWoo: alenka,
      mercadoLibre: mercadoLibre,
      total: montella + alenka + mercadoLibre
    };
  });
}

// Filtrar top productos/categorías combinando todas las tiendas
export function combinarTopItems(ventasPorTienda: ResumenVentas[], tipo: 'productos' | 'categorias'): string[] {
  const todos = ventasPorTienda.flatMap(v => 
    tipo === 'productos' ? v.topProductos : v.topCategorias
  );
  
  // Contar ocurrencias
  const contador: Record<string, number> = {};
  todos.forEach(item => {
    contador[item] = (contador[item] || 0) + 1;
  });
  
  // Ordenar por ocurrencias y tomar los top 5
  return Object.entries(contador)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([item]) => item);
}

// Validar estructura de datos antes de mostrar
export function validarDatosDashboard(dashboard: DashboardVentas): {
  valido: boolean;
  errores: string[];
} {
  const errores: string[] = [];
  
  if (!esPeriodoValido(dashboard.mes, dashboard.año)) {
    errores.push("Período inválido");
  }
  
  if (dashboard.totalGeneral.montoFacturado < 0) {
    errores.push("Monto facturado no puede ser negativo");
  }
  
  if (dashboard.totalGeneral.unidadesVendidas < 0) {
    errores.push("Unidades vendidas no puede ser negativo");
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}