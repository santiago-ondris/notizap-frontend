import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import TarjetaResumenTienda from "./TarjetaResumenTienda";
import TarjetaTotales from "./TarjetaTotales";
import { getTotalesByPeriodo } from "@/services/woocommerce/wooService";
import { getManualReports } from "@/services/mercadolibre/mercadolibreService";
import { crearDashboardUnificado, obtenerPeriodoAnterior, calcularVariacion } from "@/utils/ventas/ventasUtils";
import type { DashboardVentas as DashboardVentasType } from "@/types/woocommerce/wooTypes";

interface DashboardVentasProps {
  mes: number;
  año: number;
  mostrarComparacion?: boolean;
}

export default function DashboardVentas({ 
  mes, 
  año, 
  mostrarComparacion = true 
}: DashboardVentasProps) {
  const [dashboard, setDashboard] = useState<DashboardVentasType | null>(null);
  const [dashboardAnterior, setDashboardAnterior] = useState<DashboardVentasType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos del período actual
      const [wooCommerce, mercadoLibreReports] = await Promise.all([
        getTotalesByPeriodo(mes, año),
        getManualReports()
      ]);

      // Crear dashboard unificado del período actual
      const dashboardActual = crearDashboardUnificado(
        wooCommerce, 
        mercadoLibreReports.data,
        mes, 
        año
      );
      
      setDashboard(dashboardActual);

      // Si se requiere comparación, cargar período anterior
      if (mostrarComparacion) {
        try {
          const { mes: mesAnterior, año: añoAnterior } = obtenerPeriodoAnterior(mes, año);
          
          const [wooCommerceAnterior] = await Promise.all([
            getTotalesByPeriodo(mesAnterior, añoAnterior)
          ]);

          const dashboardPrevio = crearDashboardUnificado(
            wooCommerceAnterior,
            mercadoLibreReports.data,
            mesAnterior,
            añoAnterior
          );
          
          setDashboardAnterior(dashboardPrevio);
        } catch (errorAnterior) {
          console.warn("No se pudieron cargar datos del período anterior:", errorAnterior);
          setDashboardAnterior(null);
        }
      }

    } catch (err: any) {
      setError(err.message || "Error al cargar los datos del dashboard");
      toast.error("No se pudieron cargar los datos de ventas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mes, año, mostrarComparacion]);

  // Calcular variaciones
  const calcularVariaciones = () => {
    if (!dashboard || !dashboardAnterior) return {};

    return {
      variacionFacturado: calcularVariacion(
        dashboard.totalGeneral.montoFacturado,
        dashboardAnterior.totalGeneral.montoFacturado
      ),
      variacionUnidades: calcularVariacion(
        dashboard.totalGeneral.unidadesVendidas,
        dashboardAnterior.totalGeneral.unidadesVendidas
      )
    };
  };

  const variaciones = calcularVariaciones();

  // Estados de carga y error
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading para totales */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            <p className="text-white/70 text-sm">📊 Cargando dashboard de ventas...</p>
          </div>
        </div>

        {/* Loading para tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg" />
                  <div className="h-4 bg-white/20 rounded w-24" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-white/20 rounded" />
                  <div className="h-6 bg-white/20 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-[#D94854]" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar el dashboard</h3>
            <p className="text-white/60 text-sm mb-4">
              {error || "No se pudieron obtener los datos de ventas"}
            </p>
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

  // Preparar datos para las tarjetas de tiendas
  const tiendas = [
    ...dashboard.woocommerce.ventasPorTienda,
    ...dashboard.mercadolibre
  ];

  const obtenerVariacionesTienda = (tienda: string) => {
    if (!dashboardAnterior) return { variacionMonto: undefined, variacionUnidades: undefined };

    const tiendaActual = tiendas.find(t => t.tienda === tienda);
    const tiendasAnteriores = [
      ...dashboardAnterior.woocommerce.ventasPorTienda,
      ...dashboardAnterior.mercadolibre
    ];
    const tiendaAnterior = tiendasAnteriores.find(t => t.tienda === tienda);

    return {
      variacionMonto: tiendaAnterior ? 
        calcularVariacion(tiendaActual?.montoFacturado || 0, tiendaAnterior.montoFacturado) : 
        undefined,
      variacionUnidades: tiendaAnterior ? 
        calcularVariacion(tiendaActual?.unidadesVendidas || 0, tiendaAnterior.unidadesVendidas) : 
        undefined
    };
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de totales generales */}
      <TarjetaTotales
        totalFacturado={dashboard.totalGeneral.montoFacturado}
        totalUnidades={dashboard.totalGeneral.unidadesVendidas}
        mes={dashboard.mes}
        año={dashboard.año}
        cantidadTiendas={tiendas.length}
        variacionFacturado={variaciones.variacionFacturado}
        variacionUnidades={variaciones.variacionUnidades}
        periodoAnterior={dashboardAnterior?.periodoCompleto}
      />

      {/* Grid de tarjetas por tienda */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiendas.map((tienda) => {
          const variacionesTienda = obtenerVariacionesTienda(tienda.tienda);
          
          return (
            <TarjetaResumenTienda
              key={tienda.tienda}
              tienda={tienda.tienda}
              montoFacturado={tienda.montoFacturado}
              unidadesVendidas={tienda.unidadesVendidas}
              topProductos={tienda.topProductos}
              topCategorias={tienda.topCategorias}
              variacionMonto={variacionesTienda.variacionMonto}
              variacionUnidades={variacionesTienda.variacionUnidades}
            />
          );
        })}
      </div>

      {/* Estado vacío si no hay tiendas */}
      {tiendas.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">📊</span>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No hay datos para este período</h3>
              <p className="text-white/60 text-sm">
                No se encontraron ventas para {dashboard.periodoCompleto}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}