import { Package, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatearMonedaArg, formatearNumeroArg, formatearVariacion } from "@/utils/ventas/ventasUtils";

interface TarjetaResumenTiendaProps {
  tienda: string;
  montoFacturado: number;
  unidadesVendidas: number;
  topProductos: string[];
  topCategorias: string[];
  variacionMonto?: number | null;
  variacionUnidades?: number | null;
  colorTematico?: string;
}

export default function TarjetaResumenTienda({
  tienda,
  montoFacturado,
  unidadesVendidas,
  topProductos = [],
  topCategorias = [],
  variacionMonto,
  variacionUnidades,
  colorTematico = "#D94854"
}: TarjetaResumenTiendaProps) {
  
  const variacionMontoFormateada = formatearVariacion(variacionMonto ?? null);
  const variacionUnidadesFormateada = formatearVariacion(variacionUnidades ?? null);

  const getColorTematico = (tienda: string) => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
      case 'MONTELLA WOOCOMMERCE':
        return "#D94854"; // Rojo principal
      case 'ALENKA':
      case 'ALENKA WOOCOMMERCE':
        return "#B695BF"; // Violeta
      case 'MERCADOLIBRE':
        return "#4A8C8C"; // Verde oliva
      default:
        return colorTematico;
    }
  };

  const color = getColorTematico(tienda);

  const renderIconoVariacion = (variacion: { icono: string; color: string }) => {
    switch (variacion.icono) {
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

  const getTiendaEmoji = (tienda: string) => {
    switch (tienda.toUpperCase()) {
      case 'MONTELLA':
      case 'MONTELLA WOOCOMMERCE':
        return "🏢";
      case 'ALENKA':
      case 'ALENKA WOOCOMMERCE':
        return "🏪";
      case 'MERCADOLIBRE':
        return "🛒";
      default:
        return "🏬";
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
      {/* Header de la tienda */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getTiendaEmoji(tienda)}</span>
          <h3 className="text-lg font-bold text-white">{tienda}</h3>
        </div>
        <div 
          className="w-3 h-8 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Monto facturado */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color }} />
              <span className="text-sm font-medium text-white/80">Monto Facturado</span>
            </div>
            {variacionMonto !== undefined && (
              <div className={`flex items-center gap-1 ${variacionMontoFormateada.color} font-semibold text-xs`}>
                {renderIconoVariacion(variacionMontoFormateada)}
                <span>{variacionMontoFormateada.texto}</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color }}>
            {formatearMonedaArg(montoFacturado)}
          </p>
        </div>

        {/* Unidades vendidas */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color }} />
              <span className="text-sm font-medium text-white/80">Unidades Vendidas</span>
            </div>
            {variacionUnidades !== undefined && (
              <div className={`flex items-center gap-1 ${variacionUnidadesFormateada.color} font-semibold text-xs`}>
                {renderIconoVariacion(variacionUnidadesFormateada)}
                <span>{variacionUnidadesFormateada.texto}</span>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-white">
            {formatearNumeroArg(unidadesVendidas)}
          </p>
        </div>
      </div>

      {/* Top productos y categorías */}
      {(topProductos.length > 0 || topCategorias.length > 0) && (
        <div className="space-y-4">
          {/* Top productos */}
          {topProductos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                📦 Top Productos
              </h4>
              <div className="flex flex-wrap gap-1">
                {topProductos.slice(0, 3).map((producto, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-md border font-medium"
                    style={{ 
                      backgroundColor: `${color}20`, 
                      borderColor: `${color}30`,
                      color: color
                    }}
                  >
                    {producto}
                  </span>
                ))}
                {topProductos.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-md bg-white/10 border border-white/20 text-white/60">
                    +{topProductos.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Top categorías */}
          {topCategorias.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                🎨 Top Categorías
              </h4>
              <div className="flex flex-wrap gap-1">
                {topCategorias.slice(0, 3).map((categoria, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-md border font-medium"
                    style={{ 
                      backgroundColor: `${color}15`, 
                      borderColor: `${color}25`,
                      color: color
                    }}
                  >
                    {categoria}
                  </span>
                ))}
                {topCategorias.length > 3 && (
                  <span className="px-2 py-1 text-xs rounded-md bg-white/10 border border-white/20 text-white/60">
                    +{topCategorias.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de datos vacíos para WooCommerce */}
      {tienda.includes('WOOCOMMERCE') && topProductos.length === 0 && topCategorias.length === 0 && (
        <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs text-white/50 text-center">
            💡 Agregar productos y categorías en modo admin
          </p>
        </div>
      )}
    </div>
  );
}