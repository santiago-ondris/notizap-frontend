import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Package, 
  FileText,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { type CambioSimpleDto } from '@/types/cambios/cambiosTypes';
import cambiosService from '@/services/cambios/cambiosService';

interface CambioDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  cambio: CambioSimpleDto | null;
}

/**
 * Componente de sección de información
 */
const SeccionInfo: React.FC<{
  titulo: string;
  icono: React.ReactNode;
  color: string;
  children: React.ReactNode;
}> = ({ titulo, icono, color, children }) => (
  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-4">
      <div 
        className="p-2 rounded-lg border"
        style={{ 
          backgroundColor: `${color}20`,
          borderColor: `${color}30`
        }}
      >
        <div style={{ color }}>{icono}</div>
      </div>
      <h3 className="text-lg font-semibold text-white">{titulo}</h3>
    </div>
    {children}
  </div>
);

/**
 * Componente de campo de información
 */
const CampoInfo: React.FC<{
  label: string;
  valor: string | number | undefined;
  icono?: React.ReactNode;
  copiable?: boolean;
  enlace?: string;
}> = ({ label, valor, icono, copiable = false, enlace }) => {
  const valorTexto = valor?.toString() || '-';

  const handleCopiar = () => {
    if (valor) {
      navigator.clipboard.writeText(valorTexto);
      toast.success(`${label} copiado al portapapeles`);
    }
  };

  const handleAbrirEnlace = () => {
    if (enlace) {
      window.open(enlace, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2">
        {icono}
        <span className="text-sm text-white/60">{label}:</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white font-medium">{valorTexto}</span>
        {copiable && valor && (
          <button
            onClick={handleCopiar}
            className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
            title={`Copiar ${label}`}
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        {enlace && (
          <button
            onClick={handleAbrirEnlace}
            className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition-all"
            title="Abrir enlace"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Componente de estado con ícono
 */
const EstadoConIcono: React.FC<{
  activo: boolean;
  label: string;
  color: string;
  icono: React.ReactNode;
}> = ({ activo, label, color, icono }) => (
  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
    <div 
      className={`p-2 rounded-lg border-2 transition-all ${
        activo ? 'border-transparent' : 'border-white/20'
      }`}
      style={{ 
        backgroundColor: activo ? color : 'transparent',
        borderColor: activo ? color : undefined
      }}
    >
      <div style={{ color: activo ? 'white' : color }}>
        {icono}
      </div>
    </div>
    <div>
      <div className={`font-medium ${activo ? 'text-white' : 'text-white/60'}`}>
        {label}
      </div>
      <div 
        className="text-xs"
        style={{ color: activo ? color : '#666' }}
      >
        {activo ? '✓ Completado' : '○ Pendiente'}
      </div>
    </div>
  </div>
);

/**
 * Componente principal del modal de detalle
 */
export const CambioDetalle: React.FC<CambioDetalleProps> = ({
  isOpen,
  onClose,
  cambio
}) => {

  // No renderizar si no está abierto o no hay cambio
  if (!isOpen || !cambio) return null;

  // Calcular información adicional
  const estadoGeneral = cambiosService.obtenerDescripcionEstado(cambio);
  const colorEstado = cambiosService.obtenerColorEstado(cambio);
  const fechaFormateada = cambiosService.formatearFecha(cambio.fecha);


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#212026] border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        
        {/* Header del modal */}
        <div className="bg-white/10 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                📋 Detalle del Cambio #{cambio.id}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-white/60 text-sm">
                  Pedido: <strong className="text-white">{cambio.pedido}</strong>
                </span>
                <span className="text-white/60 text-sm">
                  Fecha: <strong className="text-white">{fechaFormateada}</strong>
                </span>
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${colorEstado}20`,
                    color: colorEstado
                  }}
                >
                  {estadoGeneral}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna izquierda */}
            <div className="space-y-6">
              
              {/* Información del cliente */}
              <SeccionInfo
                titulo="Información del Cliente"
                icono={<User className="w-5 h-5" />}
                color="#B695BF"
              >
                <div className="space-y-0">
                  <CampoInfo
                    label="Nombre completo"
                    valor={`${cambio.nombre} ${cambio.apellido || ''}`.trim()}
                    icono={<User className="w-4 h-4 text-white/40" />}
                  />
                  <CampoInfo
                    label="Celular"
                    valor={cambio.celular}
                    icono={<Phone className="w-4 h-4 text-white/40" />}
                    copiable
                    enlace={`tel:${cambio.celular}`}
                  />
                  <CampoInfo
                    label="Email"
                    valor={cambio.email}
                    icono={<Mail className="w-4 h-4 text-white/40" />}
                    copiable
                    enlace={`mailto:${cambio.email}`}
                  />
                </div>
              </SeccionInfo>

              {/* Información del cambio */}
              <SeccionInfo
                titulo="Detalles del Cambio"
                icono={<Package className="w-5 h-5" />}
                color="#D94854"
              >
                <div className="space-y-0">
                  <CampoInfo
                    label="Modelo original"
                    valor={cambio.modeloOriginal}
                    icono={<Package className="w-4 h-4 text-white/40" />}
                  />
                  <CampoInfo
                    label="Modelo nuevo"
                    valor={cambio.modeloCambio}
                    icono={<Package className="w-4 h-4 text-white/40" />}
                  />
                  <CampoInfo
                    label="Motivo"
                    valor={cambio.motivo}
                    icono={<AlertTriangle className="w-4 h-4 text-white/40" />}
                  />
                  <CampoInfo
                    label="Es par del pedido"
                    valor={cambio.parPedido ? 'Sí' : 'No'}
                    icono={<FileText className="w-4 h-4 text-white/40" />}
                  />
                  {cambio.envio && (
                    <CampoInfo
                      label="Envio"
                      valor={cambio.envio}
                      icono={<User className="w-4 h-4 text-white/40" />}
                    />
                  )}
                </div>
              </SeccionInfo>

              {/* Diferencias de precio */}
              {(cambio.diferenciaAbonada || cambio.diferenciaAFavor) && (
                <SeccionInfo
                  titulo="Diferencia de Precio"
                  icono={<DollarSign className="w-5 h-5" />}
                  color={cambio.diferenciaAbonada ? "#51590E" : "#D94854"}
                >
                  <div className="space-y-0">
                    {cambio.diferenciaAbonada && (
                      <CampoInfo
                        label="Diferencia abonada"
                        valor={cambiosService.formatearDinero(cambio.diferenciaAbonada)}
                        icono={<DollarSign className="w-4 h-4 text-[#51590E]" />}
                      />
                    )}
                    {cambio.diferenciaAFavor && (
                      <CampoInfo
                        label="Diferencia a favor"
                        valor={cambiosService.formatearDinero(cambio.diferenciaAFavor)}
                        icono={<DollarSign className="w-4 h-4 text-[#D94854]" />}
                      />
                    )}
                  </div>
                </SeccionInfo>
              )}
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              
              {/* Estados del proceso */}
              <SeccionInfo
                titulo="Estado del Proceso"
                icono={<CheckCircle className="w-5 h-5" />}
                color="#51590E"
              >
                <div className="space-y-3">
                  <EstadoConIcono
                    activo={cambio.llegoAlDeposito}
                    label="Llegó al Depósito"
                    color="#FFD700"
                    icono={<Clock className="w-5 h-5" />}
                  />
                  <EstadoConIcono
                    activo={cambio.yaEnviado}
                    label="Ya Enviado"
                    color="#B695BF"
                    icono={<Truck className="w-5 h-5" />}
                  />
                  <EstadoConIcono
                    activo={cambio.cambioRegistradoSistema}
                    label="Registrado en Sistema"
                    color="#51590E"
                    icono={<CheckCircle className="w-5 h-5" />}
                  />
                </div>
              </SeccionInfo>

            </div>
          </div>

            </div>

          {/* Observaciones */}
          {cambio.observaciones && (
            <div className="mt-6">
              <SeccionInfo
                titulo="Observaciones"
                icono={<FileText className="w-5 h-5" />}
                color="#B695BF"
              >
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {cambio.observaciones}
                  </p>
                </div>
              </SeccionInfo>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white/5 border-t border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/50">
              Cambio ID: {cambio.id} • Creado: {fechaFormateada}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
  );
};

export default CambioDetalle;