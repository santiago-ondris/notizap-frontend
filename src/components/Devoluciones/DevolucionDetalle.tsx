import React from 'react';
import { 
  X, 
  Calendar, 
  Phone, 
  Package, 
  FileText, 
  DollarSign, 
  CreditCard,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
import { type DevolucionDto } from '@/types/cambios/devolucionesTypes';
import devolucionesService from '@/services/cambios/devolucionesService';

interface DevolucionDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  devolucion: DevolucionDto | null;
}

const CampoDetalle: React.FC<{
  label: string;
  valor: string | number | null | undefined;
  icono: React.ReactNode;
  copiable?: boolean;
  tipo?: 'texto' | 'dinero' | 'fecha';
}> = ({ label, valor, icono, copiable = false, tipo = 'texto' }) => {
  
  const handleCopy = async () => {
    if (valor && copiable) {
      try {
        await navigator.clipboard.writeText(valor.toString());
      } catch (error) {
        console.error('Error al copiar:', error);
      }
    }
  };

  const formatearValor = () => {
    if (valor === null || valor === undefined) return '-';
    
    switch (tipo) {
      case 'dinero':
        return devolucionesService.formatearDinero(Number(valor));
      case 'fecha':
        return devolucionesService.formatearFecha(valor.toString());
      default:
        return valor.toString();
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-white/60">{icono}</div>
          <span className="text-sm font-medium text-white/80">{label}</span>
        </div>
        {copiable && valor && (
          <button
            onClick={handleCopy}
            className="p-1 text-white/40 hover:text-white/80 hover:bg-white/10 rounded transition-all"
            title="Copiar al portapapeles"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="text-lg font-semibold text-white">
        {formatearValor()}
      </div>
    </div>
  );
};

const EstadoDetalle: React.FC<{
  titulo: string;
  activo: boolean;
  color: string;
  icono: React.ReactNode;
  descripcion: string;
}> = ({ titulo, activo, color, icono, descripcion }) => (
  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <div 
        className="p-2 rounded-lg border"
        style={{ 
          backgroundColor: activo ? `${color}20` : 'transparent',
          borderColor: activo ? `${color}30` : 'rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ color: activo ? color : 'rgba(255,255,255,0.4)' }}>
          {icono}
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white">{titulo}</h4>
        <p className="text-xs text-white/60">{descripcion}</p>
      </div>
      <div className="flex items-center">
        {activo ? (
          <CheckCircle className="w-5 h-5" style={{ color }} />
        ) : (
          <Clock className="w-5 h-5 text-white/40" />
        )}
      </div>
    </div>
    <div className="text-center">
      <span 
        className="text-xs font-medium px-2 py-1 rounded"
        style={{ 
          backgroundColor: activo ? `${color}20` : 'rgba(255,255,255,0.1)',
          color: activo ? color : 'rgba(255,255,255,0.6)'
        }}
      >
        {activo ? 'Completado' : 'Pendiente'}
      </span>
    </div>
  </div>
);

export const DevolucionDetalle: React.FC<DevolucionDetalleProps> = ({
  isOpen,
  onClose,
  devolucion
}) => {

  if (!isOpen || !devolucion) return null;

  const colorEstado = devolucionesService.obtenerColorEstado(devolucion);
  const descripcionEstado = devolucionesService.obtenerDescripcionEstado(devolucion);
  const iconoEstado = devolucionesService.obtenerIconoEstado(devolucion);
  const estaCompleta = devolucionesService.estaCompleta(devolucion);

  const costoTotal = (devolucion.monto || 0) + (devolucion.pagoEnvio || 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#212026] border border-white/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-5 h-5 text-[#D94854]" />
                <Package className="w-5 h-5 text-[#D94854]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                📋 Detalle de Devolución
              </h2>
              <p className="text-white/60 text-sm">
                Información completa del pedido #{devolucion.pedido}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            
            {/* Estado general destacado */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: `${colorEstado}20`,
                      borderColor: `${colorEstado}30`
                    }}
                  >
                    <span className="text-2xl">{iconoEstado}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Estado Actual: {descripcionEstado}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {estaCompleta 
                        ? 'Devolución procesada completamente'
                        : 'Devolución en proceso, revisa los estados pendientes'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold mb-1"
                    style={{ color: colorEstado }}
                  >
                    {estaCompleta ? '100%' : `${Math.round((
                      (devolucion.llegoAlDeposito ? 1 : 0) +
                      (devolucion.dineroDevuelto ? 1 : 0) +
                      (devolucion.notaCreditoEmitida ? 1 : 0)
                    ) / 3 * 100)}%`}
                  </div>
                  <div className="text-sm text-white/50">
                    Completado
                  </div>
                </div>
              </div>
            </div>

            {/* Información básica */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📋 Información General
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CampoDetalle
                  label="Fecha de Devolución"
                  valor={devolucion.fecha}
                  icono={<Calendar className="w-4 h-4" />}
                  tipo="fecha"
                />
                <CampoDetalle
                  label="Número de Pedido"
                  valor={devolucion.pedido}
                  icono={<FileText className="w-4 h-4" />}
                  copiable
                />
                <CampoDetalle
                  label="Celular del Cliente"
                  valor={devolucion.celular}
                  icono={<Phone className="w-4 h-4" />}
                  copiable
                />
                <CampoDetalle
                  label="Modelo Devuelto"
                  valor={devolucion.modelo}
                  icono={<Package className="w-4 h-4" />}
                />
                <CampoDetalle
                  label="Motivo de Devolución"
                  valor={devolucion.motivo}
                  icono={<AlertTriangle className="w-4 h-4" />}
                />
                <CampoDetalle
                  label="Responsable"
                  valor={devolucion.responsable}
                  icono={<User className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Información financiera */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                💰 Información Financiera
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CampoDetalle
                  label="Monto de Devolución"
                  valor={devolucion.monto}
                  icono={<DollarSign className="w-4 h-4" />}
                  tipo="dinero"
                />
                <CampoDetalle
                  label="Pago de Envío"
                  valor={devolucion.pagoEnvio}
                  icono={<CreditCard className="w-4 h-4" />}
                  tipo="dinero"
                />
                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium text-white/80">Costo Total</span>
                  </div>
                  <div className="text-lg font-bold text-[#D94854]">
                    {devolucionesService.formatearDinero(costoTotal)}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Devolución + Envío
                  </div>
                </div>
              </div>
            </div>

            {/* Estados del proceso */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📊 Estados del Proceso
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EstadoDetalle
                  titulo="Llegó al Depósito"
                  activo={devolucion.llegoAlDeposito}
                  color="#FFD700"
                  icono={<Package className="w-4 h-4" />}
                  descripcion="Producto recibido en depósito"
                />
                <EstadoDetalle
                  titulo="Dinero Devuelto"
                  activo={devolucion.dineroDevuelto}
                  color="#51590E"
                  icono={<DollarSign className="w-4 h-4" />}
                  descripcion="Reembolso procesado al cliente"
                />
                <EstadoDetalle
                  titulo="Nota de Crédito"
                  activo={devolucion.notaCreditoEmitida}
                  color="#B695BF"
                  icono={<FileText className="w-4 h-4" />}
                  descripcion="Nota de crédito emitida"
                />
              </div>
            </div>

            {/* Timeline del proceso */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🕐 Timeline del Proceso
              </h4>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="space-y-4">
                  
                  {/* Paso 1: Devolución registrada */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#D94854] rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">Devolución Registrada</div>
                      <div className="text-sm text-white/60">
                        {devolucionesService.formatearFecha(devolucion.fecha)} - Registrado por {devolucion.responsable}
                      </div>
                    </div>
                  </div>

                  {/* Línea conectora */}
                  <div className="ml-4 w-0.5 h-6 bg-white/20"></div>

                  {/* Paso 2: Llegada al depósito */}
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      devolucion.llegoAlDeposito ? 'bg-[#FFD700]' : 'bg-white/20'
                    }`}>
                      {devolucion.llegoAlDeposito ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${devolucion.llegoAlDeposito ? 'text-white' : 'text-white/50'}`}>
                        Llegada al Depósito
                      </div>
                      <div className="text-sm text-white/60">
                        {devolucion.llegoAlDeposito ? 'Producto recibido' : 'Esperando llegada del producto'}
                      </div>
                    </div>
                  </div>

                  {/* Línea conectora */}
                  <div className="ml-4 w-0.5 h-6 bg-white/20"></div>

                  {/* Paso 3: Procesamiento */}
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      (devolucion.dineroDevuelto || devolucion.notaCreditoEmitida) ? 'bg-[#51590E]' : 'bg-white/20'
                    }`}>
                      {(devolucion.dineroDevuelto || devolucion.notaCreditoEmitida) ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        (devolucion.dineroDevuelto || devolucion.notaCreditoEmitida) ? 'text-white' : 'text-white/50'
                      }`}>
                        Procesamiento Financiero
                      </div>
                      <div className="text-sm text-white/60">
                        {devolucion.dineroDevuelto && devolucion.notaCreditoEmitida 
                          ? 'Dinero devuelto y nota de crédito emitida'
                          : devolucion.dineroDevuelto 
                          ? 'Dinero devuelto - Pendiente nota de crédito'
                          : devolucion.notaCreditoEmitida
                          ? 'Nota de crédito emitida - Pendiente devolución dinero'
                          : 'Pendiente procesamiento financiero'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Línea conectora */}
                  <div className="ml-4 w-0.5 h-6 bg-white/20"></div>

                  {/* Paso 4: Completado */}
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      estaCompleta ? 'bg-[#51590E]' : 'bg-white/20'
                    }`}>
                      {estaCompleta ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Clock className="w-4 h-4 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${estaCompleta ? 'text-white' : 'text-white/50'}`}>
                        Proceso Completado
                      </div>
                      <div className="text-sm text-white/60">
                        {estaCompleta 
                          ? 'Devolución procesada completamente'
                          : 'Esperando finalización del proceso'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                ⚡ Acciones Rápidas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-left">
                  <Copy className="w-5 h-5 text-[#B695BF]" />
                  <div>
                    <div className="font-medium text-white">Copiar Información</div>
                    <div className="text-sm text-white/60">Copiar datos completos al portapapeles</div>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-left">
                  <ExternalLink className="w-5 h-5 text-[#FFD700]" />
                  <div>
                    <div className="font-medium text-white">Ver Pedido Original</div>
                    <div className="text-sm text-white/60">Abrir pedido #{devolucion.pedido}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
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

export default DevolucionDetalle;