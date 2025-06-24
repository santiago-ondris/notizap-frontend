import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  Package, 
  FileText, 
  AlertTriangle,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import { 
  type DevolucionMercadoLibreDto,
  type CreateDevolucionMercadoLibreDto,
  type DevolucionMercadoLibreFormErrors
} from '@/types/cambios/devolucionesMercadoLibreTypes';

interface DevolucionMercadoLibreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (devolucion: DevolucionMercadoLibreDto | CreateDevolucionMercadoLibreDto) => Promise<boolean>;
  devolucion: DevolucionMercadoLibreDto | null; // null = crear, objeto = editar
  cargando?: boolean;
}

/**
 * Componente principal del modal de devolución de MercadoLibre
 */
export const DevolucionMercadoLibreModal: React.FC<DevolucionMercadoLibreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  devolucion,
  cargando = false
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState<Partial<CreateDevolucionMercadoLibreDto>>({
    fecha: '',
    cliente: '',
    modelo: '',
    pedido: '',
    notaCreditoEmitida: false
  });

  const [errors, setErrors] = useState<DevolucionMercadoLibreFormErrors>({});
  const [guardando, setGuardando] = useState(false);

  // Determinar si es edición o creación
  const esEdicion = devolucion !== null;
  const titulo = esEdicion ? 'Editar Devolución ML' : 'Nueva Devolución ML';
  const subtitulo = esEdicion 
    ? 'Modifica los datos de la devolución de MercadoLibre'
    : 'Completa la información de la nueva devolución de MercadoLibre';

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (esEdicion && devolucion) {
        // Cargar datos para edición
        setFormData({
          fecha: devolucion.fecha.split('T')[0], // Extraer solo la fecha
          cliente: devolucion.cliente,
          pedido: devolucion.pedido,
          modelo: devolucion.modelo,
          notaCreditoEmitida: devolucion.notaCreditoEmitida
        });
      } else {
        // Resetear para creación
        const fechaHoy = new Date().toISOString().split('T')[0];
        setFormData({
          fecha: fechaHoy,
          cliente: '',
          pedido: '',
          modelo: '',
          notaCreditoEmitida: false
        });
      }
      setErrors({});
    }
  }, [isOpen, esEdicion, devolucion]);

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: DevolucionMercadoLibreFormErrors = {};

    if (!formData.fecha) {
      nuevosErrores.fecha = 'La fecha es obligatoria';
    }

    if (!formData.cliente?.trim()) {
      nuevosErrores.cliente = 'El cliente es obligatorio';
    } else if (formData.cliente.trim().length < 2) {
      nuevosErrores.cliente = 'El cliente debe tener al menos 2 caracteres';
    }

    if (!formData.modelo?.trim()) {
      nuevosErrores.modelo = 'El modelo es obligatorio';
    } else if (formData.modelo.trim().length < 2) {
      nuevosErrores.modelo = 'El modelo debe tener al menos 2 caracteres';
    }

    if (!formData.pedido?.trim()) {
      nuevosErrores.pedido = 'El número de pedido es obligatorio';
    } else if (formData.pedido.trim().length < 3) {
      nuevosErrores.pedido = 'El número de pedido debe tener al menos 3 caracteres';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambio en campos del formulario
  const handleInputChange = (campo: keyof CreateDevolucionMercadoLibreDto, valor: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo si existe
    if (errors[campo as keyof DevolucionMercadoLibreFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [campo]: undefined
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      // Preparar datos para envío
      const datosCompletos: CreateDevolucionMercadoLibreDto = {
        fecha: formData.fecha!,
        cliente: formData.cliente!.trim(),
        pedido: formData.pedido!.trim(),
        modelo: formData.modelo!.trim(),
        notaCreditoEmitida: formData.notaCreditoEmitida || false
      };
      
      let resultado: boolean;

      if (esEdicion && devolucion) {
        // Actualizar devolución existente
        const devolucionActualizada: DevolucionMercadoLibreDto = {
          ...devolucion,
          ...datosCompletos
        };
        resultado = await onSave(devolucionActualizada);
      } else {
        // Crear nueva devolución
        resultado = await onSave(datosCompletos);
      }

      if (resultado) {
        onClose();
      }
    } catch (error) {
      console.error('Error al guardar devolución ML:', error);
    } finally {
      setGuardando(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = () => {
    if (!guardando) {
      onClose();
    }
  };

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#212026] border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
              <div className="flex items-center gap-1">
                <ShoppingCart className="w-5 h-5 text-[#B695BF]" />
                <Package className="w-5 h-5 text-[#B695BF]" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{titulo}</h2>
              <p className="text-white/60 text-sm">{subtitulo}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={guardando}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fila 1: Fecha */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                📅 Fecha *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  disabled={guardando || cargando}
                  className={`
                    w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white transition-all
                    ${errors.fecha ? 'border-[#D94854]' : 'border-white/20 focus:border-[#B695BF]'}
                    disabled:opacity-50
                  `}
                />
              </div>
              {errors.fecha && (
                <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.fecha}
                </p>
              )}
            </div>

            {/* Fila 2: Cliente, Modelo, Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  👤 Cliente *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.cliente || ''}
                    onChange={(e) => handleInputChange('cliente', e.target.value)}
                    placeholder="Ej: Le Gringo Le Parfum"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.cliente ? 'border-[#D94854]' : 'border-white/20 focus:border-[#B695BF]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.cliente && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.cliente}
                  </p>
                )}
              </div>

              {/* Pedido */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  🛒 Número de Pedido ML *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.pedido || ''}
                    onChange={(e) => handleInputChange('pedido', e.target.value)}
                    placeholder="Ej: 2000007861504737"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.pedido ? 'border-[#D94854]' : 'border-white/20 focus:border-[#B695BF]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.pedido && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.pedido}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  📦 Modelo *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.modelo || ''}
                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                    placeholder="Ej: Carito beige 36"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.modelo ? 'border-[#D94854]' : 'border-white/20 focus:border-[#B695BF]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.modelo && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.modelo}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 3: Nota de Crédito */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                🧾 Estado de Nota de Crédito
              </label>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="notaCredito"
                    checked={formData.notaCreditoEmitida || false}
                    onChange={(e) => handleInputChange('notaCreditoEmitida', e.target.checked)}
                    disabled={guardando || cargando}
                    className="sr-only"
                  />
                  <label
                    htmlFor="notaCredito"
                    className={`
                      flex items-center justify-center w-6 h-6 border-2 rounded cursor-pointer transition-all
                      ${formData.notaCreditoEmitida 
                        ? 'bg-[#51590E] border-[#51590E]' 
                        : 'border-white/40 hover:border-white/60'
                      }
                      ${guardando || cargando ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {formData.notaCreditoEmitida && (
                      <FileText className="w-3 h-3 text-white" />
                    )}
                  </label>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      Nota de crédito emitida
                    </span>
                    <span className={`
                      text-xs px-2 py-1 rounded
                      ${formData.notaCreditoEmitida 
                        ? 'bg-[#51590E]/20 text-[#51590E]' 
                        : 'bg-[#D94854]/20 text-[#D94854]'
                      }
                    `}>
                      {formData.notaCreditoEmitida ? 'Emitida' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Marca esta opción si ya se emitió la nota de crédito para esta devolución
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional para edición */}
            {esEdicion && devolucion && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  📊 Información de la Devolución
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
                  <div>
                    <span className="font-medium">Fecha de creación:</span>
                    <div className="text-white/50">
                      {new Date(devolucion.fechaCreacion).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {devolucion.fechaActualizacion && (
                    <div>
                      <span className="font-medium">Última actualización:</span>
                      <div className="text-white/50">
                        {new Date(devolucion.fechaActualizacion).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer del modal */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={guardando}
            className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={guardando || cargando}
            className="flex items-center gap-2 px-6 py-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 rounded-lg text-[#B695BF] transition-all disabled:opacity-50"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{esEdicion ? 'Actualizar' : 'Crear'} Devolución</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevolucionMercadoLibreModal;