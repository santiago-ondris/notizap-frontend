import { DollarSign, Package, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatearMonedaArg, formatearNumeroArg, formatearPeriodoCompleto, formatearVariacion } from "@/utils/ventas/ventasUtils";

interface TarjetaTotalesProps {
  totalFacturado: number;
  totalUnidades: number;
  mes: number;
  año: number;
  cantidadTiendas: number;
  variacionFacturado?: number | null;
  variacionUnidades?: number | null;
  periodoAnterior?: string;
}

export default function TarjetaTotales({
  totalFacturado,
  totalUnidades,
  mes,
  año,
  cantidadTiendas,
  variacionFacturado,
  variacionUnidades,
  periodoAnterior
}: TarjetaTotalesProps) {
  
  const variacionFacturadoFormateada = formatearVariacion(variacionFacturado ?? null);
  const variacionUnidadesFormateada = formatearVariacion(variacionUnidades ?? null);

  const renderIconoVariacion = (variacion: { icono: string; color: string }) => {
    switch (variacion.icono) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 col-span-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-xl font-bold text-white">Totales Generales</h3>
            <p className="text-sm text-white/60">
              {formatearPeriodoCompleto(mes, año)} • {cantidadTiendas} tiendas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg">
          <Calendar className="w-4 h-4 text-[#51590E]" />
          <span className="text-sm font-medium text-[#51590E]">
            {String(mes).padStart(2, '0')}/{año}
          </span>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Total facturado */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4A8C8C]/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-[white]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/80">Total Facturado</h4>
                {periodoAnterior && (
                  <p className="text-xs text-white/50">vs {periodoAnterior}</p>
                )}
              </div>
            </div>
            {variacionFacturado !== undefined && (
              <div className={`flex items-center gap-2 ${variacionFacturadoFormateada.color} font-semibold`}>
                {renderIconoVariacion(variacionFacturadoFormateada)}
                <span className="text-sm">{variacionFacturadoFormateada.texto}</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-[white]">
            {formatearMonedaArg(totalFacturado)}
          </p>
        </div>

        {/* Total unidades */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#D94854]/20 rounded-lg">
                <Package className="w-5 h-5 text-[#D94854]" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white/80">Total Unidades</h4>
                {periodoAnterior && (
                  <p className="text-xs text-white/50">vs {periodoAnterior}</p>
                )}
              </div>
            </div>
            {variacionUnidades !== undefined && (
              <div className={`flex items-center gap-2 ${variacionUnidadesFormateada.color} font-semibold`}>
                {renderIconoVariacion(variacionUnidadesFormateada)}
                <span className="text-sm">{variacionUnidadesFormateada.texto}</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-white">
            {formatearNumeroArg(totalUnidades)}
          </p>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ticket promedio */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <h5 className="text-xs font-medium text-white/60 mb-2">Ticket Promedio</h5>
          <p className="text-lg font-bold text-white/90">
            {totalUnidades > 0 
              ? formatearMonedaArg(totalFacturado / totalUnidades)
              : "$ 0"
            }
          </p>
        </div>

        {/* Facturación por tienda */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <h5 className="text-xs font-medium text-white/60 mb-2">Promedio por Tienda</h5>
          <p className="text-lg font-bold text-white/90">
            {formatearMonedaArg(totalFacturado / cantidadTiendas)}
          </p>
        </div>

        {/* Unidades por tienda */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <h5 className="text-xs font-medium text-white/60 mb-2">Unidades por Tienda</h5>
          <p className="text-lg font-bold text-white/90">
            {formatearNumeroArg(Math.round(totalUnidades / cantidadTiendas))}
          </p>
        </div>

        {/* Tiendas activas */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center">
          <h5 className="text-xs font-medium text-white/60 mb-2">Tiendas Activas</h5>
          <p className="text-lg font-bold text-[#B695BF]">
            {cantidadTiendas}
          </p>
        </div>
      </div>

      {/* Footer con información adicional */}
      {(variacionFacturado !== undefined || variacionUnidades !== undefined) && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>💡</span>
            <span>
              Las variaciones se calculan comparando con el período anterior
              {periodoAnterior && ` (${periodoAnterior})`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}