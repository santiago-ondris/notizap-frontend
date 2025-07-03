import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  AlertTriangle,
  Save,
  Loader2,
  DollarSign
} from 'lucide-react';
import {
  type CambioSimpleDto,
  type CreateCambioSimpleDto,
  MOTIVOS_CAMBIO,
} from '@/types/cambios/cambiosTypes';
import { MultiProductInput } from './MultiProductInput';
import { fechaInputAISO, fechaISOAInput } from '@/utils/envios/fechaHelpers';

interface CambioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cambio: CreateCambioSimpleDto | CambioSimpleDto) => Promise<boolean>;
  cambio?: CambioSimpleDto | null;
  cargando?: boolean;
}

interface FormData extends Omit<CreateCambioSimpleDto, 'fecha'> {
  fecha: string;
}

/**
 * Campo de formulario genérico
 */
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}> = ({ label, required = false, children, error }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-white/80">
      {label}
      {required && <span className="text-[#D94854] ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-[#D94854] flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

/**
 * Modal de cambio simplificado a 2 pasos
 */
export const CambioModal: React.FC<CambioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cambio = null,
  cargando = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    fecha: '',
    pedido: '',
    celular: '',
    nombre: '',
    apellido: '',
    modeloOriginal: '',
    modeloCambio: '',
    motivo: '',
    parPedido: false,
    diferenciaAbonada: undefined,
    diferenciaAFavor: undefined,
    email: '',
    observaciones: '',
    envio: ''
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [, setStepActual] = useState(1);
  const [guardando, setGuardando] = useState(false);

  // Definición de los 2 pasos
  const steps = [
    { numero: 1, titulo: '👤 Cliente', descripcion: 'Datos del cliente' },
    { numero: 2, titulo: '📦 Producto', descripcion: 'Información del cambio' }
  ];

  // Inicializar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (cambio) {
        setFormData({
          ...cambio,
          fecha: fechaISOAInput(cambio.fecha)
        });
      } else {
        const hoy = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, fecha: hoy }));
      }
      setErrores({});
      setStepActual(1);
    }
  }, [isOpen, cambio]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'diferenciaAbonada' && value > 0) {
      setFormData(prev => ({ ...prev, diferenciaAFavor: undefined }));
    }
    if (field === 'diferenciaAFavor' && value > 0) {
      setFormData(prev => ({ ...prev, diferenciaAbonada: undefined }));
    }
  };

  const validarStep = (step: number): boolean => {
    const nuevosErrores: Record<string, string> = {};
    if (step === 1) {
      if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
      if (!formData.celular.trim()) nuevosErrores.celular = 'El celular es obligatorio';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nuevosErrores.email = 'Formato de email inválido';
      }
    }
    if (step === 2) {
      if (!formData.pedido.trim()) nuevosErrores.pedido = 'El número de pedido es obligatorio';
      if (!formData.modeloOriginal.trim()) nuevosErrores.modeloOriginal = 'El modelo original es obligatorio';
      if (!formData.modeloCambio.trim()) nuevosErrores.modeloCambio = 'El modelo de cambio es obligatorio';
      if (!formData.motivo.trim()) nuevosErrores.motivo = 'El motivo es obligatorio';
      if (!formData.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    // Validar ambos pasos
    for (let i = 1; i <= steps.length; i++) {
      if (!validarStep(i)) {
        setStepActual(i);
        return;
      }
    }
    setGuardando(true);
    try {
      const datosParaEnvio: CreateCambioSimpleDto | CambioSimpleDto = {
        ...formData,
        fecha: fechaInputAISO(formData.fecha),
        ...(cambio && { id: cambio.id, llegoAlDeposito: cambio.llegoAlDeposito, yaEnviado: cambio.yaEnviado, cambioRegistradoSistema: cambio.cambioRegistradoSistema })
      };
      const exito = await onSave(datosParaEnvio);
      if (exito) onClose();
    } catch (error) {
      console.error('Error al guardar cambio:', error);
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#212026] border border-white/20 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header compacto */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {cambio ? '✏️ Editar Cambio' : '➕ Nuevo Cambio'}
          </h2>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
  
        {/* Content en grid 2 columnas - CON SCROLL FUNCIONANDO */}
        <div 
          className="flex-1 overflow-y-auto p-6 custom-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna izquierda: Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#B695BF]" />
                👤 Cliente
              </h3>
              
              <FormField label="Nombre" required error={errores.nombre}>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={e => handleInputChange('nombre', e.target.value)} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="Nombre" 
                />
              </FormField>
  
              <FormField label="Apellido">
                <input 
                  type="text" 
                  value={formData.apellido || ''} 
                  onChange={e => handleInputChange('apellido', e.target.value)} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="Apellido" 
                />
              </FormField>
  
              <FormField label="Celular" required error={errores.celular}>
                <input 
                  type="tel" 
                  value={formData.celular} 
                  onChange={e => handleInputChange('celular', e.target.value)} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="Celular" 
                />
              </FormField>
  
              <FormField label="Email">
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => handleInputChange('email', e.target.value)} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="correo@ejemplo.com" 
                />
              </FormField>
            </div>
  
            {/* Columna derecha: Cambio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D94854]" />
                📦 Cambio
              </h3>
  
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Pedido" required error={errores.pedido}>
                  <input 
                    type="text" 
                    value={formData.pedido} 
                    onChange={e => handleInputChange('pedido', e.target.value)} 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                    placeholder="12345" 
                  />
                </FormField>
  
                <FormField label="Fecha" required error={errores.fecha}>
                  <input 
                    type="date" 
                    value={formData.fecha} 
                    onChange={e => handleInputChange('fecha', e.target.value)} 
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  />
                </FormField>
              </div>
  
              {/* Productos compactos */}
              <MultiProductInput
                label="📦 Productos Originales"
                value={formData.modeloOriginal}
                onChange={(value) => handleInputChange('modeloOriginal', value)}
                placeholder="Ej: Bota negra 37"
                error={errores.modeloOriginal}
                required
              />
  
              <MultiProductInput
                label="🔄 Productos de Cambio"
                value={formData.modeloCambio}
                onChange={(value) => handleInputChange('modeloCambio', value)}
                placeholder="Ej: Sandalia rosa 37"
                error={errores.modeloCambio}
                required
              />
  
              <FormField label="Motivo" required error={errores.motivo}>
                <select 
                  value={formData.motivo} 
                  onChange={e => handleInputChange('motivo', e.target.value)} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                >
                  <option value="">Seleccionar</option>
                  {MOTIVOS_CAMBIO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>
            </div>
          </div>
  
          {/* Diferencia de precio - Ancho completo */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-3 flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-[#51590E]" />
              💰 Diferencia de Precio
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Diferencia Abonada">
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.diferenciaAbonada || ''} 
                  onChange={e => handleInputChange('diferenciaAbonada', e.target.value ? parseFloat(e.target.value) : undefined)} 
                  disabled={!!formData.diferenciaAFavor} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="Cliente paga" 
                />
              </FormField>
              <FormField label="Diferencia a Favor">
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.diferenciaAFavor || ''} 
                  onChange={e => handleInputChange('diferenciaAFavor', e.target.value ? parseFloat(e.target.value) : undefined)} 
                  disabled={!!formData.diferenciaAbonada} 
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" 
                  placeholder="A favor" 
                />
              </FormField>
            </div>
          </div>
        </div>
  
        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={guardando} 
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={guardando || cargando} 
            className="flex items-center gap-2 px-6 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg text-[#51590E] text-sm"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin"/>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4"/>
                {cambio ? 'Actualizar' : 'Crear'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CambioModal;
