import { type ClienteResumenDto } from "@/types/cliente/cliente";
import { 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  MapPin, 
  TrendingUp,
  Eye,
  Store
} from "lucide-react";

interface Props {
  cliente: ClienteResumenDto;
  children?: React.ReactNode;
}

export default function ClienteCard({ cliente, children }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getChannelColor = (channel: string) => {
    const colors: { [key: string]: string } = {
      'KIBOO': 'bg-[#D94854]/10 text-[#D94854]',
      'WOOCOMMERCE': 'bg-[#B695BF]/10 text-[#B695BF]',
      'MERCADOLIBRE': 'bg-[#51590E]/10 text-[#51590E]',
      'E-COMMERCE': 'bg-[#F23D5E]/10 text-[#F23D5E]',
    };
    return colors[channel.toUpperCase()] || 'bg-gray-100 text-[#212026]';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#B695BF]/30 transition-all duration-300 cursor-pointer overflow-hidden w-full max-w-md mx-auto">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-[#B695BF] to-[#D94854] p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">
              {cliente.nombre}
            </h3>
            <div className="flex items-center gap-2 text-white/80">
              <Eye size={14} />
              <span className="text-sm">Ver detalles</span>
            </div>
          </div>
          <div className="bg-white/20 rounded-full p-2">
            <TrendingUp className="text-white" size={20} />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Stats principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#D94854]/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="text-[#D94854]" size={16} />
              <span className="text-[#D94854] text-sm font-medium">Compras</span>
            </div>
            <div className="text-2xl font-bold text-[#212026]">
              {cliente.cantidadCompras}
            </div>
          </div>

          <div className="bg-[#51590E]/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-[#51590E]" size={16} />
              <span className="text-[#51590E] text-sm font-medium">Gastado</span>
            </div>
            <div className="text-sm font-bold text-[#212026] leading-tight">
              {formatCurrency(cliente.montoTotalGastado)}
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-gray-600">Primera:</span>
            <span className="font-medium text-[#212026]">
              {formatDate(cliente.fechaPrimeraCompra)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-gray-600">Última:</span>
            <span className="font-medium text-[#212026]">
              {formatDate(cliente.fechaUltimaCompra)}
            </span>
          </div>
        </div>

        {/* Canales */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-gray-400" size={16} />
            <span className="text-gray-600 text-sm">Canales:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {cliente.canales.split(',').map((canal, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(canal.trim())}`}
              >
                {canal.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Sucursales */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Store className="text-gray-400" size={16} />
            <span className="text-gray-600 text-sm">Sucursales:</span>
          </div>
          <div className="text-sm text-[#212026] font-medium leading-tight">
            {cliente.sucursales && cliente.sucursales.length > 50 
              ? `${cliente.sucursales.substring(0, 50)}...` 
              : cliente.sucursales || "—"
            }
          </div>
        </div>

        {/* Observaciones si existen */}
        {cliente.observaciones && (
          <div className="bg-[#51590E]/10 border border-[#51590E]/20 rounded-xl p-3">
            <div className="text-[#51590E] text-sm font-medium mb-1">Observaciones:</div>
            <div className="text-[#212026] text-sm">{cliente.observaciones}</div>
          </div>
        )}

        {/* Contenido adicional */}
        {children && (
          <div className="pt-4 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#B695BF]/5 to-[#D94854]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}