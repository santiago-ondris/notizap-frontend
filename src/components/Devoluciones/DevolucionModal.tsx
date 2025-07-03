import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  Calendar, 
  Phone, 
  Package, 
  FileText, 
  DollarSign, 
  CreditCard,
  User,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { 
  type DevolucionDto,
  type CreateDevolucionDto,
  type DevolucionFormErrors,
  MOTIVOS_DEVOLUCION
} from '@/types/cambios/devolucionesTypes';
import { fechaInputAISO, fechaISOAInput } from '@/utils/envios/fechaHelpers';

interface DevolucionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (devolucion: DevolucionDto | CreateDevolucionDto) => Promise<boolean>;
  devolucion: DevolucionDto | null; // null = crear, objeto = editar
  cargando?: boolean;
}

/**
 * Componente de dropdown para motivos con portal
 */
const MotivoDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number; openUp: boolean } | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < 300 && spaceAbove > 200;
      
      setDropdownPosition({
        top: openUp ? rect.top - 10 : rect.bottom + 10,
        left: rect.left,
        width: rect.width,
        openUp
      });
    } else {
      setDropdownPosition(null);
    }
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (motivo: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    onChange(motivo);
    setIsOpen(false);
    setDropdownPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        // Verificar si el clic fue en el dropdown portal
        const dropdownElement = document.querySelector('[data-dropdown-portal="motivo-dropdown"]');
        if (dropdownElement && dropdownElement.contains(event.target as Node)) {
          return; // No cerrar si el clic fue dentro del dropdown
        }
        
        setIsOpen(false);
        setDropdownPosition(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 bg-white/10 border rounded-lg text-white text-sm transition-all
          ${error ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/15'}
        `}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white/40" />
          <span className={value ? 'text-white' : 'text-white/50'}>
            {value || 'Seleccionar motivo...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && dropdownPosition && !disabled && createPortal(
        <div 
          data-dropdown-portal="motivo-dropdown"
          className={`
            fixed bg-[#212026] border border-white/20 rounded-lg shadow-2xl z-[9999] overflow-y-auto
          `}
          style={{ 
            top: dropdownPosition.openUp ? 'auto' : dropdownPosition.top,
            bottom: dropdownPosition.openUp ? window.innerHeight - dropdownPosition.top : 'auto',
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, 250),
            maxHeight: '280px'
          }}
          onWheel={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()} // Evitar que el clic cierre el modal
        >
          {MOTIVOS_DEVOLUCION.map((motivo) => (
            <button
              key={motivo}
              type="button"
              onClick={(e) => handleOptionClick(motivo, e)}
              className={`
                w-full text-left px-3 py-2 text-sm transition-colors
                ${value === motivo ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}
              `}
            >
              {motivo}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

/**
 * Componente principal del modal de devolución
 */
export const DevolucionModal: React.FC<DevolucionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  devolucion,
  cargando = false
}) => {
  // Estados del formulario
  const [formData, setFormData] = useState<Partial<CreateDevolucionDto>>({
    fecha: '',
    pedido: '',
    celular: '',
    modelo: '',
    motivo: '',
    monto: undefined,
    pagoEnvio: undefined,
    responsable: ''
  });

  const [errors, setErrors] = useState<DevolucionFormErrors>({});
  const [guardando, setGuardando] = useState(false);

  // Determinar si es edición o creación
  const esEdicion = devolucion !== null;
  const titulo = esEdicion ? 'Editar Devolución' : 'Nueva Devolución';

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (esEdicion && devolucion) {
        // Cargar datos para edición
        setFormData({
          fecha: fechaISOAInput(devolucion.fecha),
          pedido: devolucion.pedido,
          celular: devolucion.celular,
          modelo: devolucion.modelo,
          motivo: devolucion.motivo,
          monto: devolucion.monto,
          pagoEnvio: devolucion.pagoEnvio,
          responsable: devolucion.responsable
        });
      } else {
        // Resetear para creación
        const fechaHoy = new Date().toISOString().split('T')[0];
        setFormData({
          fecha: fechaHoy,
          pedido: '',
          celular: '',
          modelo: '',
          motivo: '',
          monto: undefined,
          pagoEnvio: undefined,
          responsable: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, esEdicion, devolucion]);

  // Validar formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: DevolucionFormErrors = {};

    if (!formData.fecha) {
      nuevosErrores.fecha = 'La fecha es obligatoria';
    }

    if (!formData.pedido?.trim()) {
      nuevosErrores.pedido = 'El número de pedido es obligatorio';
    }

    if (!formData.celular?.trim()) {
      nuevosErrores.celular = 'El celular es obligatorio';
    } else if (!/^\d+$/.test(formData.celular.trim())) {
      nuevosErrores.celular = 'El celular debe contener solo números';
    }

    if (!formData.modelo?.trim()) {
      nuevosErrores.modelo = 'El modelo es obligatorio';
    }

    if (!formData.motivo?.trim()) {
      nuevosErrores.motivo = 'El motivo es obligatorio';
    }

    if (!formData.responsable?.trim()) {
      nuevosErrores.responsable = 'El responsable es obligatorio';
    }

    // Validar montos si están presentes
    if (formData.monto !== undefined && formData.monto < 0) {
      nuevosErrores.monto = 'El monto no puede ser negativo';
    }

    if (formData.pagoEnvio !== undefined && formData.pagoEnvio < 0) {
      nuevosErrores.pagoEnvio = 'El pago de envío no puede ser negativo';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambio en campos del formulario
  const handleInputChange = (campo: keyof CreateDevolucionDto, valor: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo si existe
    if (errors[campo]) {
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
      // Preparar datos para envío con fecha correcta
      const datosCompletos: CreateDevolucionDto = {
        ...formData as CreateDevolucionDto,
        fecha: fechaInputAISO(formData.fecha!)
      };
      
      let resultado: boolean;
    
      if (esEdicion && devolucion) {
        // Actualizar devolución existente
        const devolucionActualizada: DevolucionDto = {
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
      console.error('Error al guardar devolución:', error);
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
      <div className="bg-[#212026] border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
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
              <h2 className="text-xl font-bold text-white">{titulo}</h2>
              <p className="text-white/60 text-sm">
                {esEdicion ? 'Modifica los datos de la devolución' : 'Completa la información de la nueva devolución'}
              </p>
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
        <div 
          className="flex-1 overflow-y-auto p-6 custom-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fila 1: Fecha y Pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Fecha */}
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
                      ${errors.fecha ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
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

              {/* Pedido */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  🛒 Número de Pedido *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.pedido || ''}
                    onChange={(e) => handleInputChange('pedido', e.target.value)}
                    placeholder="Ej: 1234567"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.pedido ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
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
            </div>

            {/* Fila 2: Celular y Modelo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Celular */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  📱 Celular *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.celular || ''}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    placeholder="Ej: 1123456789"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.celular ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.celular && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.celular}
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
                      ${errors.modelo ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
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

            {/* Fila 3: Motivo */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                ❓ Motivo de la Devolución *
              </label>
              <MotivoDropdown
                value={formData.motivo || ''}
                onChange={(value) => handleInputChange('motivo', value)}
                error={errors.motivo}
                disabled={guardando || cargando}
              />
              {errors.motivo && (
                <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.motivo}
                </p>
              )}
            </div>

            {/* Fila 4: Montos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  💰 Monto de Devolución
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monto || ''}
                    onChange={(e) => handleInputChange('monto', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0.00"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.monto ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.monto && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.monto}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">Opcional - Monto a devolver al cliente</p>
              </div>

              {/* Pago Envío */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  🚚 Pago de Envío
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pagoEnvio || ''}
                    onChange={(e) => handleInputChange('pagoEnvio', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="0.00"
                    disabled={guardando || cargando}
                    className={`
                      w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                      ${errors.pagoEnvio ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
                      disabled:opacity-50
                    `}
                  />
                </div>
                {errors.pagoEnvio && (
                  <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.pagoEnvio}
                  </p>
                )}
                <p className="text-white/50 text-xs mt-1">Opcional - Costo del envío de devolución</p>
              </div>
            </div>

            {/* Fila 5: Responsable */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                👨‍💼 Responsable *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={formData.responsable || ''}
                  onChange={(e) => handleInputChange('responsable', e.target.value)}
                  placeholder="Ej: Gringon"
                  disabled={guardando || cargando}
                  className={`
                    w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50 transition-all
                    ${errors.responsable ? 'border-[#D94854]' : 'border-white/20 focus:border-[#D94854]'}
                    disabled:opacity-50
                  `}
                />
              </div>
              {errors.responsable && (
                <p className="text-[#D94854] text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.responsable}
                </p>
              )}
            </div>

            {/* Información adicional para edición */}
            {esEdicion && devolucion && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  📊 Estados Actuales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`flex items-center gap-2 ${devolucion.llegoAlDeposito ? 'text-[#FFD700]' : 'text-white/50'}`}>
                    <div className={`w-2 h-2 rounded-full ${devolucion.llegoAlDeposito ? 'bg-[#FFD700]' : 'bg-white/20'}`}></div>
                    Llegó al depósito
                  </div>
                  <div className={`flex items-center gap-2 ${devolucion.dineroDevuelto ? 'text-[#51590E]' : 'text-white/50'}`}>
                    <div className={`w-2 h-2 rounded-full ${devolucion.dineroDevuelto ? 'bg-[#51590E]' : 'bg-white/20'}`}></div>
                    Dinero devuelto
                  </div>
                  <div className={`flex items-center gap-2 ${devolucion.notaCreditoEmitida ? 'text-[#B695BF]' : 'text-white/50'}`}>
                    <div className={`w-2 h-2 rounded-full ${devolucion.notaCreditoEmitida ? 'bg-[#B695BF]' : 'bg-white/20'}`}></div>
                    Nota de crédito
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-2">
                  Los estados se actualizan desde la tabla principal con los checkboxes
                </p>
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
            className="flex items-center gap-2 px-6 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all disabled:opacity-50"
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

export default DevolucionModal;