import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  Calendar,
  Phone,
  Mail,
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
  const [stepActual, setStepActual] = useState(1);
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
          fecha: cambio.fecha.split('T')[0]
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

  const irAlSiguienteStep = () => {
    if (validarStep(stepActual) && stepActual < steps.length) {
      setStepActual(prev => prev + 1);
    }
  };
  const irAlStepAnterior = () => {
    if (stepActual > 1) setStepActual(prev => prev - 1);
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
        fecha: new Date(formData.fecha).toISOString(),
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
      <div className="bg-[#212026] border border-white/20 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {cambio ? '✏️ Editar Cambio' : '➕ Nuevo Cambio'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {cambio ? `Modificando cambio #${cambio.id}` : 'Registrar un nuevo cambio'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Steps indicator */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.numero}>
                <div className={`flex items-center gap-3 ${step.numero === stepActual ? 'text-[#B695BF]' : 'text-white/40'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${step.numero === stepActual ? 'border-[#B695BF] bg-[#B695BF]/20' : 'border-white/40'}`}>
                    {step.numero}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-medium text-sm">{step.titulo}</div>
                    <div className="text-xs opacity-70">{step.descripcion}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 bg-white/20`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {stepActual === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-[#B695BF]" />
                <h3 className="text-xl font-semibold text-white">Datos del Cliente</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre" required error={errores.nombre}>
                  <input type="text" value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Nombre" />
                </FormField>
                <FormField label="Apellido" error={errores.apellido}>
                  <input type="text" value={formData.apellido || ''} onChange={e => handleInputChange('apellido', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Apellido" />
                </FormField>
                <FormField label="Celular" error={errores.celular}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input type="tel" value={formData.celular} onChange={e => handleInputChange('celular', e.target.value)} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Celular" />
                  </div>
                </FormField>
                <FormField label="Email" error={errores.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="correo@ejemplo.com" />
                  </div>
                </FormField>
              </div>
            </div>
          )}
          {stepActual === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-[#D94854]" />
                <h3 className="text-xl font-semibold text-white">Información del Cambio</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Número de Pedido" required error={errores.pedido}>
                  <input type="text" value={formData.pedido} onChange={e => handleInputChange('pedido', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="12345" />
                </FormField>
                <FormField label="Fecha del Cambio" required error={errores.fecha}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input type="date" value={formData.fecha} onChange={e => handleInputChange('fecha', e.target.value)} className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
                  </div>
                </FormField>
                <FormField label="Modelo Original" required error={errores.modeloOriginal}>
                  <input type="text" value={formData.modeloOriginal} onChange={e => handleInputChange('modeloOriginal', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Original" />
                </FormField>
                <FormField label="Modelo de Cambio" required error={errores.modeloCambio}>
                  <input type="text" value={formData.modeloCambio} onChange={e => handleInputChange('modeloCambio', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Cambio" />
                </FormField>
                <FormField label="Motivo del Cambio" required error={errores.motivo}>
                  <select value={formData.motivo} onChange={e => handleInputChange('motivo', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="">Seleccionar</option>
                    {MOTIVOS_CAMBIO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FormField>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="font-medium text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#51590E]" />Diferencia de Precio</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Diferencia Abonada">
                    <input type="number" min="0" step="0.01" value={formData.diferenciaAbonada || ''} onChange={e => handleInputChange('diferenciaAbonada', e.target.value ? parseFloat(e.target.value) : undefined)} disabled={!!formData.diferenciaAFavor} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="Cliente paga" />
                  </FormField>
                  <FormField label="Diferencia a Favor">
                    <input type="number" min="0" step="0.01" value={formData.diferenciaAFavor || ''} onChange={e => handleInputChange('diferenciaAFavor', e.target.value ? parseFloat(e.target.value) : undefined)} disabled={!!formData.diferenciaAbonada} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" placeholder="A favor" />
                  </FormField>
                </div>
                <p className="text-xs text-white/60 mt-2">💡 Solo una diferencia: abonada o a favor.</p>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stepActual > 1 && <button onClick={irAlStepAnterior} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">← Anterior</button>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={guardando} className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg text-white">Cancelar</button>
            {stepActual < steps.length && <button onClick={irAlSiguienteStep} disabled={guardando} className="px-6 py-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg text-[#B695BF]">Siguiente →</button>}
            {stepActual === steps.length && <button onClick={handleSubmit} disabled={guardando || cargando} className="flex items-center gap-2 px-6 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg text-[#51590E]">{guardando ? <><Loader2 className="w-4 h-4 animate-spin"/>Guardando...</> : <><Save className="w-4 h-4"/>{cambio ? 'Actualizar' : 'Crear'} Cambio</>}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CambioModal;
