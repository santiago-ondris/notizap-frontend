import { useState, useEffect } from "react";
import { 
  Calendar, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Loader2,
  AlertTriangle,
  Minus
} from "lucide-react";
import { toast } from "react-toastify";
import { getTotalesByAño } from "@/services/woocommerce/wooService";
import { getManualReports } from "@/services/mercadolibre/mercadolibreService";
import { crearFilaTablaVentas, formatearMonedaArg, formatearNumeroArg, formatearPeriodoCompleto } from "@/utils/ventas/ventasUtils";
import type { MercadoLibreManualReport } from "@/types/mercadolibre/ml";

interface FilaTabla {
  mes: number;
  año: number;
  periodo: string;
  tiendas: Array<{
    nombre: string;
    monto: number;
    unidades: number;
    variacionMonto: { texto: string; color: string; icono: string };
    variacionUnidades: { texto: string; color: string; icono: string };
    color: string;
  }>;
  totalMonto: number;
  totalUnidades: number;
}

interface TablaVentasUnificadaProps {
  año: number;
  mostrarVariaciones?: boolean;
}

export default function TablaVentasUnificada({ 
  año, 
  mostrarVariaciones = true 
}: TablaVentasUnificadaProps) {
  const [filas, setFilas] = useState<FilaTabla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerColorTienda = (tienda: string): string => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
        return "#D94854";
      case 'ALENKA':
        return "#B695BF";
      case 'MERCADOLIBRE':
        return "#51590E";
      default:
        return "#B695BF";
    }
  };

  const obtenerEmojiTienda = (tienda: string): string => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
        return "🏢";
      case 'ALENKA':
        return "🏪";
      case 'MERCADOLIBRE':
        return "🛒";
      default:
        return "🏬";
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      const [ventasWooCommerce, reportesMercadoLibre] = await Promise.all([
        getTotalesByAño(año),
        getManualReports()
      ]);

      const reportesML: MercadoLibreManualReport[] = reportesMercadoLibre.data;
      
      // Procesar datos por mes
      const filasPorMes: FilaTabla[] = [];

      for (let mes = 1; mes <= 12; mes++) {
        // Buscar datos de WooCommerce para este mes
        const wooMes = ventasWooCommerce.find(v => v.mes === mes);
        
        // Buscar datos de MercadoLibre para este mes
        const mlMes = reportesML.find(r => r.month === mes && r.year === año);

        // Datos del mes anterior para comparaciones
        const mesAnterior = mes === 1 ? 12 : mes - 1;
        const añoAnterior = mes === 1 ? año - 1 : año;
        
        const wooMesAnterior = ventasWooCommerce.find(v => v.mes === mesAnterior && v.año === añoAnterior);
        const mlMesAnterior = reportesML.find(r => r.month === mesAnterior && r.year === añoAnterior);

        // Preparar datos de tiendas
        const tiendas = [];

        // Agregar tiendas WooCommerce
        if (wooMes) {
          wooMes.ventasPorTienda.forEach(tienda => {
            const tiendaAnterior = wooMesAnterior?.ventasPorTienda.find(t => t.tienda === tienda.tienda);
            
            const fila = crearFilaTablaVentas(
              tienda.tienda,
              { montoFacturado: tienda.montoFacturado, unidadesVendidas: tienda.unidadesVendidas },
              tiendaAnterior ? { montoFacturado: tiendaAnterior.montoFacturado, unidadesVendidas: tiendaAnterior.unidadesVendidas } : undefined
            );

            tiendas.push({
              nombre: tienda.tienda,
              monto: tienda.montoFacturado,
              unidades: tienda.unidadesVendidas,
              variacionMonto: fila.variacionMonto,
              variacionUnidades: fila.variacionUnidades,
              color: obtenerColorTienda(tienda.tienda)
            });
          });
        }

        // Agregar MercadoLibre
        if (mlMes) {
          const filaML = crearFilaTablaVentas(
            "MERCADOLIBRE",
            { montoFacturado: mlMes.revenue, unidadesVendidas: mlMes.unitsSold },
            mlMesAnterior ? { montoFacturado: mlMesAnterior.revenue, unidadesVendidas: mlMesAnterior.unitsSold } : undefined
          );

          tiendas.push({
            nombre: "MERCADOLIBRE",
            monto: mlMes.revenue,
            unidades: mlMes.unitsSold,
            variacionMonto: filaML.variacionMonto,
            variacionUnidades: filaML.variacionUnidades,
            color: obtenerColorTienda("MERCADOLIBRE")
          });
        }

        // Solo agregar fila si hay datos
        if (tiendas.length > 0) {
          const totalMonto = tiendas.reduce((sum, t) => sum + t.monto, 0);
          const totalUnidades = tiendas.reduce((sum, t) => sum + t.unidades, 0);

          filasPorMes.push({
            mes,
            año,
            periodo: formatearPeriodoCompleto(mes, año),
            tiendas,
            totalMonto,
            totalUnidades
          });
        }
      }

      setFilas(filasPorMes.reverse()); // Más recientes primero

    } catch (err: any) {
      setError(err.message || "Error al cargar los datos");
      toast.error("No se pudieron cargar los datos de la tabla");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [año, mostrarVariaciones]);

  const renderIconoVariacion = (icono: string) => {
    switch (icono) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      case 'neutral':
        return <Minus className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📊 Cargando tabla de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-[#D94854]" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar la tabla</h3>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <button
              onClick={cargarDatos}
              className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-8 h-8 text-white/40" />
          <p className="text-white/60 text-sm">📋 No hay datos de ventas para {año}.</p>
          <p className="text-white/50 text-xs">Los datos aparecerán aquí una vez que agregues ventas.</p>
        </div>
      </div>
    );
  }

  // Calcular totales del año
  const totalAñoMonto = filas.reduce((sum, f) => sum + f.totalMonto, 0);
  const totalAñoUnidades = filas.reduce((sum, f) => sum + f.totalUnidades, 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
      {/* Header de la tabla */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#51590E]" />
            <h3 className="text-lg font-semibold text-white">📊 Ventas Consolidadas {año}</h3>
          </div>
          <span className="bg-[#51590E]/20 text-white px-3 py-1 rounded-lg text-sm font-medium">
            {filas.length} períodos
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Calendar className="w-4 h-4" />
                  Período
                </div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                  🏪 Tienda
                </div>
              </th>
              <th className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                  <Package className="w-4 h-4" />
                  Unidades
                </div>
              </th>
              {mostrarVariaciones && (
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                    <TrendingUp className="w-4 h-4" />
                    Var. % U
                  </div>
                </th>
              )}
              <th className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm font-medium text-white/80">
                  <DollarSign className="w-4 h-4" />
                  Facturación
                </div>
              </th>
              {mostrarVariaciones && (
                <th className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
                    <TrendingUp className="w-4 h-4" />
                    Var. % F
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filas.map((fila) => (
              fila.tiendas.map((tienda, index) => (
                <tr 
                  key={`${fila.mes}-${tienda.nombre}`}
                  className="hover:bg-white/5 transition-all duration-200 group"
                >
                  {/* Período (solo mostrar en la primera tienda del mes) */}
                  {index === 0 && (
                    <td 
                      className="px-6 py-4 border-r border-white/10" 
                      rowSpan={fila.tiendas.length}
                    >
                      <span className="text-white/80 font-medium text-sm">
                        {fila.periodo}
                      </span>
                    </td>
                  )}
                  
                  {/* Tienda */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{obtenerEmojiTienda(tienda.nombre)}</span>
                      <span className="text-white/80 font-medium text-sm">
                        {tienda.nombre}
                      </span>
                      <div 
                        className="w-2 h-6 rounded-full"
                        style={{ backgroundColor: tienda.color }}
                      />
                    </div>
                  </td>
                  
                  {/* Unidades */}
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-semibold">
                      {formatearNumeroArg(tienda.unidades)}
                    </span>
                  </td>
                  
                  {/* Variación unidades */}
                  {mostrarVariaciones && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1 ${tienda.variacionUnidades.color} font-semibold text-sm`}>
                          {renderIconoVariacion(tienda.variacionUnidades.icono)}
                          <span>{tienda.variacionUnidades.texto}</span>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {/* Facturación */}
                  <td className="px-6 py-4 text-right">
                    <span 
                      className="font-bold"
                      style={{ color: tienda.color }}
                    >
                      {formatearMonedaArg(tienda.monto)}
                    </span>
                  </td>
                  
                  {/* Variación facturación */}
                  {mostrarVariaciones && (
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className={`flex items-center gap-1 ${tienda.variacionMonto.color} font-semibold text-sm`}>
                          {renderIconoVariacion(tienda.variacionMonto.icono)}
                          <span>{tienda.variacionMonto.texto}</span>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white/60">
              📅 Año: <span className="text-white font-medium">{año}</span>
            </span>
            <span className="text-white/60">
              Total unidades: <span className="text-white font-medium">
                {formatearNumeroArg(totalAñoUnidades)}
              </span>
            </span>
          </div>
          <span className="text-white/60">
            Facturación total: <span className="text-[#51590E] font-semibold">
              {formatearMonedaArg(totalAñoMonto)}
            </span>
          </span>
        </div>
      </div>

      {/* Nota informativa */}
      {mostrarVariaciones && filas.length > 0 && (
        <div className="bg-white/5 backdrop-blur-sm border-t border-white/10 px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <AlertTriangle className="w-3 h-3" />
            💡 Las variaciones se calculan comparando con el mes anterior
          </div>
        </div>
      )}
    </div>
  );
}