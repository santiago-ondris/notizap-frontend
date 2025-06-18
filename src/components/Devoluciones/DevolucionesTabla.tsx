import React, { useState } from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Package, 
  Calendar,
  Phone,
  Loader2,
  AlertTriangle,
  DollarSign,
  FileText,
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { 
  type DevolucionDto, 
  type EstadosDevolucion 
} from '@/types/cambios/devolucionesTypes';
import devolucionesService from '@/services/cambios/devolucionesService';

interface DevolucionesTablaProps {
  devoluciones: DevolucionDto[];
  onActualizarEstados: (id: number, estados: EstadosDevolucion) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (devolucion: DevolucionDto) => void;
  onEditar: (devolucion: DevolucionDto) => void;
  puedeEditar: boolean;
  cargando?: boolean;
}

/**
 * Componente de checkbox editable inline
 */
const CheckboxInline: React.FC<{
  valor: boolean;
  onCambio: (nuevoValor: boolean) => void;
  deshabilitado?: boolean;
  color: string;
  label: string;
}> = ({ valor, onCambio, deshabilitado = false, color, label }) => {
  const [actualizando, setActualizando] = useState(false);

  const handleClick = async () => {
    if (deshabilitado || actualizando) return;
    
    setActualizando(true);
    try {
      await onCambio(!valor);
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        disabled={deshabilitado || actualizando}
        className={`
          relative w-5 h-5 rounded border-2 transition-all
          ${deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${valor ? 'border-transparent' : 'border-white/40 hover:border-white/60'}
        `}
        style={{
          backgroundColor: valor ? color : 'transparent'
        }}
        title={label}
      >
        {actualizando ? (
          <Loader2 className="w-3 h-3 animate-spin text-white absolute inset-0 m-auto" />
        ) : valor ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        ) : null}
      </button>
    </div>
  );
};

/**
 * Componente de fila de devolución
 */
const FilaDevolucion: React.FC<{
  devolucion: DevolucionDto;
  onActualizarEstados: (id: number, estados: EstadosDevolucion) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (devolucion: DevolucionDto) => void;
  onEditar: (devolucion: DevolucionDto) => void;
  puedeEditar: boolean;
}> = ({ 
  devolucion, 
  onActualizarEstados, 
  onEliminar, 
  onVerDetalle, 
  onEditar, 
  puedeEditar 
}) => {
  const [eliminando, setEliminando] = useState(false);

  // Manejar actualización de un estado específico
  const handleActualizarEstado = async (
    campo: keyof EstadosDevolucion, 
    nuevoValor: boolean
  ) => {
    const estadosActualizados: EstadosDevolucion = {
      llegoAlDeposito: devolucion.llegoAlDeposito,
      dineroDevuelto: devolucion.dineroDevuelto,
      notaCreditoEmitida: devolucion.notaCreditoEmitida,
      [campo]: nuevoValor
    };

    return await onActualizarEstados(devolucion.id, estadosActualizados);
  };

  // Manejar eliminación
  const handleEliminar = async () => {
    if (!puedeEditar) return;
    
    setEliminando(true);
    try {
      await onEliminar(devolucion.id);
    } finally {
      setEliminando(false);
    }
  };

  // Obtener color del estado general
  const colorEstado = devolucionesService.obtenerColorEstado(devolucion);
  const descripcionEstado = devolucionesService.obtenerDescripcionEstado(devolucion);
  const iconoEstado = devolucionesService.obtenerIconoEstado(devolucion);

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      
      {/* Fecha */}
      <td className="px-4 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white">
            {devolucionesService.formatearFecha(devolucion.fecha)}
          </span>
        </div>
      </td>

      {/* Pedido */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D94854]" />
          <span className="text-sm font-medium text-white">
            {devolucion.pedido}
          </span>
        </div>
      </td>

      {/* Celular */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/80">
            {devolucion.celular}
          </span>
        </div>
      </td>

      {/* Modelo */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#D94854]" />
          <span className="text-sm text-white/80">
            {devolucion.modelo}
          </span>
        </div>
      </td>

      {/* Motivo */}
      <td className="px-3 py-3 border-r border-white/10">
        <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
          {devolucion.motivo}
        </span>
      </td>

      {/* Monto */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="text-center">
          {devolucion.monto ? (
            <div className="flex items-center gap-1 justify-center">
              <DollarSign className="w-3 h-3 text-[#D94854]" />
              <span className="text-sm font-medium text-[#D94854]">
                {devolucionesService.formatearDinero(devolucion.monto)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-white/50">-</span>
          )}
        </div>
      </td>

      {/* Pago Envío */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="text-center">
          {devolucion.pagoEnvio ? (
            <div className="flex items-center gap-1 justify-center">
              <CreditCard className="w-3 h-3 text-[#FFD700]" />
              <span className="text-sm font-medium text-[#FFD700]">
                {devolucionesService.formatearDinero(devolucion.pagoEnvio)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-white/50">-</span>
          )}
        </div>
      </td>

      {/* Estado General */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="text-center">
          <span 
            className="text-xs font-medium px-2 py-1 rounded flex items-center gap-1 justify-center"
            style={{ 
              backgroundColor: `${colorEstado}20`,
              color: colorEstado
            }}
          >
            <span>{iconoEstado}</span>
            <span className="hidden lg:inline">{descripcionEstado}</span>
          </span>
        </div>
      </td>

      {/* Checkbox: Llegó al Depósito */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={devolucion.llegoAlDeposito}
          onCambio={(valor) => handleActualizarEstado('llegoAlDeposito', valor)}
          deshabilitado={!puedeEditar}
          color="#FFD700"
          label="Llegó al depósito"
        />
      </td>

      {/* Checkbox: Dinero Devuelto */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={devolucion.dineroDevuelto}
          onCambio={(valor) => handleActualizarEstado('dineroDevuelto', valor)}
          deshabilitado={!puedeEditar}
          color="#51590E"
          label="Dinero devuelto"
        />
      </td>

      {/* Checkbox: Nota de Crédito Emitida */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={devolucion.notaCreditoEmitida}
          onCambio={(valor) => handleActualizarEstado('notaCreditoEmitida', valor)}
          deshabilitado={!puedeEditar}
          color="#B695BF"
          label="Nota de crédito emitida"
        />
      </td>

      {/* Responsable */}
      <td className="px-3 py-3 border-r border-white/10">
        <span className="text-xs text-white/70">
          {devolucion.responsable || '-'}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          
          {/* Ver detalle */}
          <button
            onClick={() => onVerDetalle(devolucion)}
            className="p-1 text-[#B695BF] hover:bg-[#B695BF]/20 rounded transition-colors"
            title="Ver detalles completos"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Editar */}
          {puedeEditar && (
            <button
              onClick={() => onEditar(devolucion)}
              className="p-1 text-[#FFD700] hover:bg-[#FFD700]/20 rounded transition-colors"
              title="Editar devolución"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Eliminar */}
          {puedeEditar && (
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="p-1 text-[#D94854] hover:bg-[#D94854]/20 rounded transition-colors disabled:opacity-50"
              title="Eliminar devolución"
            >
              {eliminando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

/**
 * Componente principal de la tabla de devoluciones
 */
export const DevolucionesTabla: React.FC<DevolucionesTablaProps> = ({
  devoluciones,
  onActualizarEstados,
  onEliminar,
  onVerDetalle,
  onEditar,
  puedeEditar,
  cargando = false
}) => {

  // Estado de carga
  if (cargando) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D94854] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Cargando devoluciones...</h3>
          <p className="text-white/60 text-sm">Obteniendo lista de devoluciones registradas</p>
        </div>
      </div>
    );
  }

  // Sin datos
  if (devoluciones.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-8 h-8 text-white/40" />
            <Package className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay devoluciones registradas
          </h3>
          <p className="text-white/60 text-sm">
            {puedeEditar 
              ? 'Comienza creando la primera devolución con el botón "Nueva Devolución"'
              : 'Aún no se han registrado devoluciones en el sistema'
            }
          </p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas rápidas para el footer
  const llegaron = devoluciones.filter(d => d.llegoAlDeposito).length;
  const dineroDevuelto = devoluciones.filter(d => d.dineroDevuelto).length;
  const notasEmitidas = devoluciones.filter(d => d.notaCreditoEmitida).length;
  const completadas = devoluciones.filter(d => devolucionesService.estaCompleta(d)).length;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      
      {/* Header de la tabla */}
      <div className="bg-white/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-[#D94854]" />
              <Package className="w-5 h-5 text-[#D94854]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              📋 Registro de Devoluciones
            </h3>
            <span className="text-sm text-white/60 ml-2">
              ({devoluciones.length} {devoluciones.length === 1 ? 'devolución' : 'devoluciones'})
            </span>
          </div>
          
          {!puedeEditar && (
            <div className="flex items-center gap-2 text-[#FFD700] text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Solo lectura</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px]">
          
          {/* Header de columnas */}
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                📅 Fecha
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                🛒 Pedido
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                📱 Celular
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                📦 Modelo
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                ❓ Motivo
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                💰 Monto
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                🚚 Envío
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                📊 Estado
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#FFD700] border-r border-white/10">
                🏠 Llegó
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#51590E] border-r border-white/10">
                💰 Dinero
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#B695BF] border-r border-white/10">
                🧾 Nota
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                👨‍💼 Responsable
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80">
                ⚙️ Acciones
              </th>
            </tr>
          </thead>

          {/* Cuerpo de la tabla */}
          <tbody>
            {devoluciones.map((devolucion) => (
              <FilaDevolucion
                key={devolucion.id}
                devolucion={devolucion}
                onActualizarEstados={onActualizarEstados}
                onEliminar={onEliminar}
                onVerDetalle={onVerDetalle}
                onEditar={onEditar}
                puedeEditar={puedeEditar}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-4">
            <span>📋 Total: {devoluciones.length} devoluciones</span>
            <span>🏠 Llegaron: {llegaron}</span>
            <span>💰 Dinero: {dineroDevuelto}</span>
            <span>🧾 Notas: {notasEmitidas}</span>
            <span>✅ Completadas: {completadas}</span>
          </div>
          {puedeEditar && (
            <div className="flex items-center gap-2">
              <span className="text-[#FFD700]">
                💡 Haz clic en los checkboxes para actualizar estados
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevolucionesTabla;