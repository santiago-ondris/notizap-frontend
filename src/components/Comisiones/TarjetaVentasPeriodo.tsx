import { Package, TrendingUp, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { formatearMoneda, formatearPeriodo } from "@/services/woocommerce/comisionService";
import type { DatosVentasPeriodo } from "@/types/woocommerce/comisionTypes";

interface TarjetaVentasPeriodoProps {
  mes: number;
  año: number;
  datosVentas: DatosVentasPeriodo | null;
  loading: boolean;
  error: string | null;
  onRecargar?: () => void;
}

export default function TarjetaVentasPeriodo({
  mes,
  año,
  datosVentas,
  loading,
  error,
  onRecargar
}: TarjetaVentasPeriodoProps) {

  const obtenerColorTienda = (tienda: string) => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
        return "#D94854"; // Rojo principal
      case 'ALENKA':
        return "#B695BF"; // Violeta
      case 'MERCADOLIBRE':
        return "#51590E"; // Verde oliva
      default:
        return "#FFD700"; // Dorado
    }
  };

  const obtenerEmojiTienda = (tienda: string) => {
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-white">Facturación del Período</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
            <Calendar className="w-4 h-4 text-[#51590E]" />
            <span className="text-sm font-medium text-[#51590E]">
              {formatearPeriodo(mes, año)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
          <p className="text-white/70 text-sm">📈 Cargando datos de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-white">Facturación del Período</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
            <Calendar className="w-4 h-4 text-[#51590E]" />
            <span className="text-sm font-medium text-[#51590E]">
              {formatearPeriodo(mes, año)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-6">
          <AlertTriangle className="w-6 h-6 text-[#D94854]" />
          <div className="text-center">
            <p className="text-white/80 text-sm mb-2">Error al cargar datos de ventas</p>
            <p className="text-white/60 text-xs mb-4">{error}</p>
            {onRecargar && (
              <button
                onClick={onRecargar}
                className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg text-sm font-medium transition-all"
              >
                🔄 Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!datosVentas) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-white">Facturación del Período</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
            <Calendar className="w-4 h-4 text-[#51590E]" />
            <span className="text-sm font-medium text-[#51590E]">
              {formatearPeriodo(mes, año)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-6">
          <Package className="w-6 h-6 text-white/40" />
          <p className="text-white/60 text-sm text-center">
            📋 No hay datos de ventas para este período.<br />
            <span className="text-xs text-white/50">Los datos aparecerán aquí una vez que agregues ventas en el módulo correspondiente.</span>
          </p>
        </div>
      </div>
    );
  }

  const tiendas = [
    { nombre: 'MONTELLA', monto: datosVentas.montella },
    { nombre: 'ALENKA', monto: datosVentas.alenka },
    { nombre: 'ML', monto: datosVentas.mercadoLibre }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-lg font-bold text-white">Facturación del Período</h3>
            <p className="text-sm text-white/60">Datos obtenidos del módulo de ventas</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
          <Calendar className="w-4 h-4 text-[#51590E]" />
          <span className="text-sm font-medium text-[#51590E]">
            {formatearPeriodo(mes, año)}
          </span>
        </div>
      </div>

      {/* Grid de tiendas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tiendas.map((tienda) => (
          <div 
            key={tienda.nombre}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{obtenerEmojiTienda(tienda.nombre)}</span>
                <span className="text-sm font-medium text-white/80">{tienda.nombre}</span>
              </div>
              <div 
                className="w-2 h-6 rounded-full"
                style={{ backgroundColor: obtenerColorTienda(tienda.nombre) }}
              />
            </div>
            <p 
              className="text-xl font-bold"
              style={{ color: obtenerColorTienda(tienda.nombre) }}
            >
              {formatearMoneda(tienda.monto)}
            </p>
          </div>
        ))}
      </div>

      {/* Total general */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFD700]/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/80">Total Facturado</h4>
              <p className="text-xs text-white/50">Suma de los 3 canales</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#FFD700]">
            {formatearMoneda(datosVentas.total)}
          </p>
        </div>
      </div>
    </div>
  );
}