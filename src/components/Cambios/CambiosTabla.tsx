import React, { useState } from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Package, 
  Calendar,
  User,
  Phone,
  ArrowRightLeft,
  Loader2,
  AlertTriangle,
  DollarSign,
  FileText
} from 'lucide-react';
import { 
  type CambioSimpleDto, 
  type EstadosCambio 
} from '@/types/cambios/cambiosTypes';
import cambiosService from '@/services/cambios/cambiosService';

interface CambiosTablaProps {
  cambios: CambioSimpleDto[];
  onActualizarEstados: (id: number, estados: EstadosCambio) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (cambio: CambioSimpleDto) => void;
  onEditar: (cambio: CambioSimpleDto) => void;
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
 * Componente de fila de cambio
 */
const FilaCambio: React.FC<{
  cambio: CambioSimpleDto;
  onActualizarEstados: (id: number, estados: EstadosCambio) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (cambio: CambioSimpleDto) => void;
  onEditar: (cambio: CambioSimpleDto) => void;
  puedeEditar: boolean;
}> = ({ 
  cambio, 
  onActualizarEstados, 
  onEliminar, 
  onVerDetalle, 
  onEditar, 
  puedeEditar 
}) => {
  const [eliminando, setEliminando] = useState(false);

  // Manejar actualización de un estado específico
  const handleActualizarEstado = async (
    campo: keyof EstadosCambio, 
    nuevoValor: boolean
  ) => {
    const estadosActualizados: EstadosCambio = {
      llegoAlDeposito: cambio.llegoAlDeposito,
      yaEnviado: cambio.yaEnviado,
      cambioRegistradoSistema: cambio.cambioRegistradoSistema,
      [campo]: nuevoValor
    };

    return await onActualizarEstados(cambio.id, estadosActualizados);
  };

  // Manejar eliminación
  const handleEliminar = async () => {
    if (!puedeEditar) return;
    
    setEliminando(true);
    try {
      await onEliminar(cambio.id);
    } finally {
      setEliminando(false);
    }
  };

  // Obtener color del estado general
  const colorEstado = cambiosService.obtenerColorEstado(cambio);
  const descripcionEstado = cambiosService.obtenerDescripcionEstado(cambio);

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      
      {/* Fecha */}
      <td className="px-4 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white">
            {cambiosService.formatearFecha(cambio.fecha)}
          </span>
        </div>
      </td>

      {/* Pedido */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D94854]" />
          <span className="text-sm font-medium text-white">
            {cambio.pedido}
          </span>
        </div>
      </td>

      {/* Cliente */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#B695BF]" />
            <span className="text-sm font-medium text-white">
              {cambio.nombre} {cambio.apellido || ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-white/60" />
            <span className="text-xs text-white/70">
              {cambio.celular}
            </span>
          </div>
        </div>
      </td>

      {/* Modelos */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D94854]" />
            <span className="text-xs text-white/80">
              {cambio.modeloOriginal}
            </span>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRightLeft className="w-3 h-3 text-[#FFD700]" />
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#51590E]" />
            <span className="text-xs text-white/80">
              {cambio.modeloCambio}
            </span>
          </div>
        </div>
      </td>

      {/* Motivo */}
      <td className="px-3 py-3 border-r border-white/10">
        <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
          {cambio.motivo}
        </span>
      </td>

      {/* Diferencia */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="text-center">
          {cambio.diferenciaAbonada ? (
            <div className="flex items-center gap-1 justify-center">
              <DollarSign className="w-3 h-3 text-[#51590E]" />
              <span className="text-xs font-medium text-[#51590E]">
                +{cambiosService.formatearDinero(cambio.diferenciaAbonada)}
              </span>
            </div>
          ) : cambio.diferenciaAFavor ? (
            <div className="flex items-center gap-1 justify-center">
              <DollarSign className="w-3 h-3 text-[#D94854]" />
              <span className="text-xs font-medium text-[#D94854]">
                -{cambiosService.formatearDinero(cambio.diferenciaAFavor)}
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
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ 
              backgroundColor: `${colorEstado}20`,
              color: colorEstado
            }}
          >
            {descripcionEstado}
          </span>
        </div>
      </td>

      {/* Checkbox: Llegó al Depósito */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={cambio.llegoAlDeposito}
          onCambio={(valor) => handleActualizarEstado('llegoAlDeposito', valor)}
          deshabilitado={!puedeEditar}
          color="#FFD700"
          label="Llegó al depósito"
        />
      </td>

      {/* Checkbox: Ya Enviado */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={cambio.yaEnviado}
          onCambio={(valor) => handleActualizarEstado('yaEnviado', valor)}
          deshabilitado={!puedeEditar}
          color="#B695BF"
          label="Ya enviado"
        />
      </td>

      {/* Checkbox: Registrado en Sistema */}
      <td className="px-3 py-3 border-r border-white/10">
        <CheckboxInline
          valor={cambio.cambioRegistradoSistema}
          onCambio={(valor) => handleActualizarEstado('cambioRegistradoSistema', valor)}
          deshabilitado={!puedeEditar}
          color="#51590E"
          label="Registrado en sistema"
        />
      </td>

      {/* Responsable */}
      <td className="px-3 py-3 border-r border-white/10">
        <span className="text-xs text-white/70">
          {cambio.responsable || '-'}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          
          {/* Ver detalle */}
          <button
            onClick={() => onVerDetalle(cambio)}
            className="p-1 text-[#B695BF] hover:bg-[#B695BF]/20 rounded transition-colors"
            title="Ver detalles completos"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Editar */}
          {puedeEditar && (
            <button
              onClick={() => onEditar(cambio)}
              className="p-1 text-[#FFD700] hover:bg-[#FFD700]/20 rounded transition-colors"
              title="Editar cambio"
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
              title="Eliminar cambio"
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
 * Componente principal de la tabla de cambios
 */
export const CambiosTabla: React.FC<CambiosTablaProps> = ({
  cambios,
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
          <Loader2 className="w-8 h-8 animate-spin text-[#B695BF] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Cargando cambios...</h3>
          <p className="text-white/60 text-sm">Obteniendo lista de cambios registrados</p>
        </div>
      </div>
    );
  }

  // Sin datos
  if (cambios.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-white/40 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay cambios registrados
          </h3>
          <p className="text-white/60 text-sm">
            {puedeEditar 
              ? 'Comienza creando el primer cambio con el botón "Nuevo Cambio"'
              : 'Aún no se han registrado cambios en el sistema'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      
      {/* Header de la tabla */}
      <div className="bg-white/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D94854]" />
            <h3 className="text-lg font-semibold text-white">
              📋 Registro de Cambios
            </h3>
            <span className="text-sm text-white/60 ml-2">
              ({cambios.length} {cambios.length === 1 ? 'cambio' : 'cambios'})
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
        <table className="w-full min-w-[1200px]">
          
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
                👤 Cliente
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                📦 Modelos
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                ❓ Motivo
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                💰 Diferencia
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-white/80 border-r border-white/10">
                📊 Estado
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#FFD700] border-r border-white/10">
                🏠 Llegó
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#B695BF] border-r border-white/10">
                🚚 Enviado
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#51590E] border-r border-white/10">
                ✅ Sistema
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
            {cambios.map((cambio) => (
              <FilaCambio
                key={cambio.id}
                cambio={cambio}
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
            <span>📋 Total: {cambios.length} cambios</span>
            <span>🏠 Llegaron: {cambios.filter(c => c.llegoAlDeposito).length}</span>
            <span>🚚 Enviados: {cambios.filter(c => c.yaEnviado).length}</span>
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

export default CambiosTabla;