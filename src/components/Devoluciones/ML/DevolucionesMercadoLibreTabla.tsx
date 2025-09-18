import React, { useState } from 'react';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Package, 
  Calendar,
  User,
  Loader2,
  AlertTriangle,
  FileText,
  ShoppingCart,
  Copy
} from 'lucide-react';
import { 
  type DevolucionMercadoLibreDto
} from '@/types/cambios/devolucionesMercadoLibreTypes';
import devolucionesMercadoLibreService from '@/services/cambios/devolucionesMercadoLibreService';
import { copiarAlPortapapeles } from '@/utils/clipboard';
import { toast } from 'react-toastify';
import Paginacion from '@/components/ui/Paginacion';

interface DevolucionesMercadoLibreTablaProps {
  devoluciones: DevolucionMercadoLibreDto[];
  onActualizarNotaCredito: (id: number, notaCreditoEmitida: boolean) => Promise<boolean>;
  onActualizarTrasladado: (id: number, trasladado: boolean) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (devolucion: DevolucionMercadoLibreDto) => void;
  onEditar: (devolucion: DevolucionMercadoLibreDto) => void;
  puedeEditar: boolean;
  cargando?: boolean;
  paginaActual?: number;
  totalPaginas?: number;
  totalElementos?: number;
  onCambioPagina?: (pagina: number) => void;
}

const CheckboxNotaCredito: React.FC<{
  valor: boolean;
  onCambio: (nuevoValor: boolean) => void;
  deshabilitado?: boolean;
}> = ({ valor, onCambio, deshabilitado = false }) => {
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

  const color = devolucionesMercadoLibreService.obtenerColorNotaCredito(valor);

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handleClick}
        disabled={deshabilitado || actualizando}
        className={`
          relative w-6 h-6 rounded border-2 transition-all
          ${deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${valor ? 'border-transparent' : 'border-white/40 hover:border-white/60'}
        `}
        style={{
          backgroundColor: valor ? color : 'transparent'
        }}
        title={valor ? 'Nota de crédito emitida - Click para marcar como pendiente' : 'Nota de crédito pendiente - Click para marcar como emitida'}
      >
        {actualizando ? (
          <Loader2 className="w-4 h-4 animate-spin text-white absolute inset-0 m-auto" />
        ) : valor ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-3 h-3 text-white" />
          </div>
        ) : null}
      </button>
    </div>
  );
};

const CheckboxTrasladado: React.FC<{
  valor: boolean;
  onCambio: (nuevoValor: boolean) => void;
  deshabilitado?: boolean;
}> = ({ valor, onCambio, deshabilitado = false }) => {
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
          relative w-6 h-6 rounded border-2 transition-all
          ${deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${valor ? 'bg-[#FFD700] border-transparent' : 'border-white/40 hover:border-white/60 bg-transparent'}
        `}
        title={valor ? 'Trasladado - Click para desmarcar' : 'No trasladado - Click para marcar'}
      >
        {actualizando ? (
          <Loader2 className="w-4 h-4 animate-spin text-white absolute inset-0 m-auto" />
        ) : valor && (
          <span className="text-white text-sm font-bold absolute inset-0 flex items-center justify-center">✓</span>
        )}
      </button>
    </div>
  );
};

const FilaDevolucion: React.FC<{
  devolucion: DevolucionMercadoLibreDto;
  onActualizarNotaCredito: (id: number, notaCreditoEmitida: boolean) => Promise<boolean>;
  onActualizarTrasladado: (id: number, trasladado: boolean) => Promise<boolean>;
  onEliminar: (id: number) => Promise<boolean>;
  onVerDetalle: (devolucion: DevolucionMercadoLibreDto) => void;
  onEditar: (devolucion: DevolucionMercadoLibreDto) => void;
  puedeEditar: boolean;
}> = ({ 
  devolucion, 
  onActualizarNotaCredito, 
  onActualizarTrasladado,
  onEliminar, 
  onVerDetalle, 
  onEditar, 
  puedeEditar 
}) => {
  const [eliminando, setEliminando] = useState(false);

  const handleActualizarNotaCredito = async (nuevoValor: boolean) => {
    return await onActualizarNotaCredito(devolucion.id, nuevoValor);
  };

  const handleActualizarTrasladado = async (nuevoValor: boolean) => {
    return await onActualizarTrasladado(devolucion.id, nuevoValor);
  };

  const handleEliminar = async () => {
    if (!puedeEditar) return;
    
    setEliminando(true);
    try {
      await onEliminar(devolucion.id);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
      
      {/* Fecha */}
      <td className="px-4 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white">
            {devolucionesMercadoLibreService.formatearFecha(devolucion.fecha)}
          </span>
        </div>
      </td>

      {/* Cliente */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/90 max-w-[200px] truncate" title={devolucion.cliente}>
            {devolucion.cliente}
          </span>
        </div>
      </td>

      {/* Pedido */}
      <td className="px-3 py-3 border-r border-white/10">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors group"
          onClick={async () => {
            const exito = await copiarAlPortapapeles(devolucion.pedido);
            if (exito) {
              toast.success(`Pedido "${devolucion.pedido}" copiado al portapapeles`);
            } else {
              toast.error('Error al copiar al portapapeles');
            }
          }}
          title={`Click para copiar: ${devolucion.pedido}`}
        >
          <FileText className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/90 max-w-[150px] truncate">
            {devolucion.pedido}
          </span>
          <Copy className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </td>

      {/* Modelo */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#B695BF]" />
          <span className="text-sm text-white/90 max-w-[200px] truncate" title={devolucion.modelo}>
            {devolucion.modelo}
          </span>
        </div>
      </td>

      {/* Nota de Crédito (Checkbox) */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center justify-center gap-2">
          <CheckboxNotaCredito
            valor={devolucion.notaCreditoEmitida}
            onCambio={handleActualizarNotaCredito}
            deshabilitado={!puedeEditar}
          />
          <span className="text-xs text-white/60 hidden lg:inline">
            {devolucionesMercadoLibreService.obtenerTextoNotaCredito(devolucion.notaCreditoEmitida)}
          </span>
        </div>
      </td>

      {/* Trasladado (Checkbox simple) */}
      <td className="px-3 py-3 border-r border-white/10">
        <div className="flex items-center justify-center">
          <CheckboxTrasladado
            valor={devolucion.trasladado}
            onCambio={handleActualizarTrasladado}
            deshabilitado={!puedeEditar}
          />
        </div>
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
 * Componente principal de la tabla de devoluciones de MercadoLibre
 */
export const DevolucionesMercadoLibreTabla: React.FC<DevolucionesMercadoLibreTablaProps> = ({
  devoluciones,
  onActualizarNotaCredito,
  onActualizarTrasladado,
  onEliminar,
  onVerDetalle,
  onEditar,
  puedeEditar,
  cargando = false,
  paginaActual = 1,
  totalPaginas = 1,
  totalElementos = 0,
  onCambioPagina
}) => {

  // Estado de carga
  if (cargando) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#B695BF] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Cargando devoluciones de MercadoLibre...</h3>
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
            <ShoppingCart className="w-8 h-8 text-white/40" />
            <Package className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No hay devoluciones de MercadoLibre registradas
          </h3>
          <p className="text-white/60 text-sm">
            {puedeEditar 
              ? 'Comienza creando la primera devolución con el botón "Nueva Devolución ML"'
              : 'Aún no se han registrado devoluciones de MercadoLibre en el sistema'
            }
          </p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas rápidas para el footer
  const notasEmitidas = devoluciones.filter(d => d.notaCreditoEmitida).length;
  const notasPendientes = devoluciones.length - notasEmitidas;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      
      {/* Header de la tabla */}
      <div className="bg-white/10 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#B695BF]" />
              <Package className="w-5 h-5 text-[#B695BF]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              🛒 Devoluciones MercadoLibre
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

      {/* Tabla con scroll horizontal en mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          
          {/* Header de columnas */}
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                📅 Fecha
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                👤 Cliente
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                🛒 Pedido
              </th>
              <th className="px-3 py-3 text-left text-sm font-medium text-white/80 border-r border-white/10">
                📦 Modelo
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#B695BF] border-r border-white/10">
                🧾 Nota de Crédito
              </th>
              <th className="px-3 py-3 text-center text-sm font-medium text-[#FFD700] border-r border-white/10">
                📦 Trasladado
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
                onActualizarNotaCredito={onActualizarNotaCredito}
                onActualizarTrasladado={onActualizarTrasladado}
                onEliminar={onEliminar}
                onVerDetalle={onVerDetalle}
                onEditar={onEditar}
                puedeEditar={puedeEditar}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {onCambioPagina && totalPaginas > 1 && (
        <div className="p-4 border-t border-white/10">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalElementos={totalElementos}
            elementosPorPagina={15}
            onCambioPagina={onCambioPagina}
          />
        </div>
      )}

      {/* Footer con estadísticas */}
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <div className="flex items-center gap-4">
            <span>🛒 Total: {devoluciones.length} devoluciones ML</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#51590E]"></div>
              Emitidas: {notasEmitidas}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#D94854]"></div>
              Pendientes: {notasPendientes}
            </span>
            {devoluciones.length > 0 && (
              <span className="text-[#B695BF]">
                📊 {Math.round((notasEmitidas / devoluciones.length) * 100)}% completado
              </span>
            )}
          </div>
          {puedeEditar && (
            <div className="flex items-center gap-2">
              <span className="text-[#FFD700]">
                💡 Haz clic en el checkbox para actualizar notas de crédito
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevolucionesMercadoLibreTabla;
