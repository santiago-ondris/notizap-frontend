import { type ClienteResumenDto } from "@/types/cliente/cliente";
import { 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  MapPin, 
  TrendingUp,
  Eye,
  Store,
  AlertTriangle,
  MessageCircle,
  Phone
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import AgregarTelefonoModal from "./AgregarTelefonoModal";
import PlantillaWhatsAppModal from "../WhatsApp/PlantillaWhatsAppModal";
import { actualizarTelefonoCliente } from "@/services/cliente/clienteService";

interface Props {
  cliente: ClienteResumenDto;
  children?: React.ReactNode;
  onClienteUpdated?: (clienteActualizado: ClienteResumenDto) => void;
  onVerDetalles?: () => void; // <- CAMBIO: onCardClick → onVerDetalles
}

export default function ClienteCard({ cliente, children, onClienteUpdated, onVerDetalles }: Props) {
  const [showAgregarTelefonoModal, setShowAgregarTelefonoModal] = useState(false);
  const [showPlantillaWhatsAppModal, setShowPlantillaWhatsAppModal] = useState(false);
  const [clienteLocal, setClienteLocal] = useState(cliente);

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

  const calcularDiasSinComprar = (fechaUltimaCompra: string) => {
    const hoy = new Date();
    const ultimaCompra = new Date(fechaUltimaCompra);
    const diferenciaTiempo = hoy.getTime() - ultimaCompra.getTime();
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24));
    return diferenciaDias;
  };

  const getEstiloAlerta = (dias: number) => {
    if (dias <= 30) return "text-green-600 bg-green-50 border-green-200";
    if (dias <= 90) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (dias <= 180) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
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

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // evita cualquier propagación
    if (clienteLocal.telefono && clienteLocal.telefono.trim()) {
      setShowPlantillaWhatsAppModal(true);
    } else {
      setShowAgregarTelefonoModal(true);
    }
  };

  const handleVerDetalles = (e: React.MouseEvent) => {
    e.stopPropagation(); // evita cualquier propagación
    onVerDetalles?.();
  };

  const handleTelefonoGuardado = async (telefono: string) => {
    try {
      await actualizarTelefonoCliente(clienteLocal.id, telefono);
      const clienteActualizado = { ...clienteLocal, telefono };
      setClienteLocal(clienteActualizado);
      if (onClienteUpdated) {
        onClienteUpdated(clienteActualizado);
      }
      setShowPlantillaWhatsAppModal(true);
      console.log("Teléfono guardado exitosamente");
    } catch (error) {
      console.error("Error al guardar teléfono:", error);
      throw error;
    }
  };

  const diasSinComprar = calcularDiasSinComprar(clienteLocal.fechaUltimaCompra);

  return (
    <div
      className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-[#B695BF]/30 transition-all duration-300 overflow-hidden w-full min-w-[320px]"
      // ❌ REMOVIDO: onClick={onCardClick} - Ya no toda la card es clickeable
      // ❌ REMOVIDO: cursor-pointer - Ya no hay cursor pointer en toda la card
    >
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-[#B695BF] to-[#D94854] p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">
              {clienteLocal.nombre}
            </h3>
            {/* ✅ NUEVO: Botón específico para ver detalles */}
            <Button
              onClick={handleVerDetalles}
              variant="ghost"
              size="sm"
              className="text-white/90 hover:text-white hover:bg-white/20 p-0 h-auto font-normal"
            >
              <Eye size={14} className="mr-1" />
              Ver detalles
            </Button>
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
              {clienteLocal.cantidadCompras}
            </div>
          </div>

          <div className="bg-[#51590E]/10 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-[#51590E]" size={16} />
              <span className="text-[#51590E] text-sm font-medium">Gastado</span>
            </div>
            <div className="text-sm font-bold text-[#212026] leading-tight">
              {formatCurrency(clienteLocal.montoTotalGastado)}
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-gray-600">Primera:</span>
            <span className="font-medium text-[#212026]">
              {formatDate(clienteLocal.fechaPrimeraCompra)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-gray-600">Última:</span>
            <span className="font-medium text-[#212026]">
              {formatDate(clienteLocal.fechaUltimaCompra)}
            </span>
          </div>
          
          {/* Indicador de días sin comprar */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getEstiloAlerta(diasSinComprar)}`}>
            {diasSinComprar > 90 && <AlertTriangle size={14} />}
            <span>No compra hace {diasSinComprar} día{diasSinComprar !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Canales */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-gray-400" size={16} />
            <span className="text-gray-600 text-sm">Canales:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {clienteLocal.canales.split(',').map((canal, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelColor(canal.trim())}`}
              >
                {canal.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-2 border-t border-gray-100 space-y-3">
          {/* Botón WhatsApp */}
          <Button
            onClick={handleWhatsAppClick}
            className={`w-full flex items-center gap-2 h-9 text-white ${
              clienteLocal.telefono && clienteLocal.telefono.trim()
                ? 'bg-[#25D366] hover:bg-[#128C7E]'
                : 'bg-[#B695BF] hover:bg-[#9A7BA8]'
            }`}
          >
            {clienteLocal.telefono && clienteLocal.telefono.trim() ? (
              <>
                <MessageCircle size={16} />
                Enviar WhatsApp
              </>
            ) : (
              <>
                <Phone size={16} />
                Agregar teléfono
              </>
            )}
          </Button>

          {/* ✅ NUEVO: Botón secundario "Ver detalles completos" */}
          <Button
            onClick={handleVerDetalles}
            variant="outline"
            className="w-full flex items-center gap-2 h-9 bg-[#B695BF]/10 border-[#B695BF]/30 text-[#B695BF] hover:bg-[#B695BF]/20 hover:text-[#B695BF]"
          >
            <Eye size={16} />
            Ver detalles completos
          </Button>
        </div>

        {/* Sucursales */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Store className="text-gray-400" size={16} />
            <span className="text-gray-600 text-sm">Sucursales:</span>
          </div>
          <div className="text-sm text-[#212026] font-medium leading-tight">
            {clienteLocal.sucursales && clienteLocal.sucursales.length > 50 
              ? `${clienteLocal.sucursales.substring(0, 50)}...` 
              : clienteLocal.sucursales || "—"
            }
          </div>
        </div>

        {/* Observaciones si existen */}
        {clienteLocal.observaciones && (
          <div className="bg-[#51590E]/10 border border-[#51590E]/20 rounded-xl p-3">
            <div className="text-[#51590E] text-sm font-medium mb-1">Observaciones:</div>
            <div className="text-[#212026] text-sm">{clienteLocal.observaciones}</div>
          </div>
        )}

        {/* Contenido adicional */}
        {children && (
          <div className="pt-4 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>

      {/* ❌ REMOVIDO: Hover effect overlay - Ya no es necesario */}

      {/* Modales */}
      <AgregarTelefonoModal
        isOpen={showAgregarTelefonoModal}
        onClose={() => setShowAgregarTelefonoModal(false)}
        clienteNombre={clienteLocal.nombre}
        onTelefonoGuardado={handleTelefonoGuardado}
      />

      <PlantillaWhatsAppModal
        isOpen={showPlantillaWhatsAppModal}
        onClose={() => setShowPlantillaWhatsAppModal(false)}
        cliente={clienteLocal}
      />
    </div>
  );
}