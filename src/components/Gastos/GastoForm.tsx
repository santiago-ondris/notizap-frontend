import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, User, CreditCard, Repeat, Star, Package } from 'lucide-react';
import type { Gasto, CreateGastoDto, UpdateGastoDto } from '../../types/gastos';
import { 
  METODOS_PAGO, 
  FRECUENCIAS_RECURRENCIA, 
  CATEGORIAS_PREDEFINIDAS,
} from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastoFormProps {
  gasto?: Gasto; // Si existe, es edición; si no, es creación
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gasto: CreateGastoDto | UpdateGastoDto) => Promise<void>;
  isLoading?: boolean;
}

export const GastoForm: React.FC<GastoFormProps> = ({
  gasto,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  
  const isEditing = !!gasto;
  
  // Estado del formulario
  const [formData, setFormData] = useState<CreateGastoDto>({
    nombre: '',
    descripcion: '',
    categoria: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    metodoPago: '',
    esRecurrente: false,
    frecuenciaRecurrencia: '',
    esImportante: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState('');

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cargar datos del gasto si estamos editando
  useEffect(() => {
    if (isEditing && gasto) {
      setFormData({
        nombre: gasto.nombre,
        descripcion: gasto.descripcion || '',
        categoria: gasto.categoria,
        monto: gasto.monto,
        fecha: GastoService.formatearFechaInput(gasto.fecha),
        proveedor: gasto.proveedor || '',
        metodoPago: gasto.metodoPago || '',
        esRecurrente: gasto.esRecurrente,
        frecuenciaRecurrencia: gasto.frecuenciaRecurrencia || '',
        esImportante: gasto.esImportante
      });
      
      // Si la categoría no está en las predefinidas, es personalizada
      if (!CATEGORIAS_PREDEFINIDAS.includes(gasto.categoria as any)) {
        setCategoriaPersonalizada(gasto.categoria);
      }
    } else {
      // Reset para nuevo gasto
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        proveedor: '',
        metodoPago: '',
        esRecurrente: false,
        frecuenciaRecurrencia: '',
        esImportante: false
      });
      setCategoriaPersonalizada('');
    }
    setErrors({});
  }, [gasto, isEditing, isOpen]);

  // Validaciones del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no debe superar los 100 caracteres';
    }

    if (!formData.categoria.trim() && !categoriaPersonalizada.trim()) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    if (formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a cero';
    } else if (formData.monto > 999999.99) {
      newErrors.monto = 'El monto no puede superar $999,999.99';
    }

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria';
    } else if (!GastoService.validarFecha(formData.fecha)) {
      newErrors.fecha = 'La fecha no puede ser futura ni mayor a 5 años atrás';
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no debe superar los 500 caracteres';
    }

    if (formData.proveedor && formData.proveedor.length > 100) {
      newErrors.proveedor = 'El proveedor no debe superar los 100 caracteres';
    }

    if (formData.esRecurrente && !formData.frecuenciaRecurrencia) {
      newErrors.frecuenciaRecurrencia = 'Debe especificar la frecuencia para gastos recurrentes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: keyof CreateGastoDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar cambio de categoría
  const handleCategoriaChange = (categoria: string) => {
    if (categoria === 'personalizada') {
      setFormData(prev => ({ ...prev, categoria: '' }));
    } else {
      setFormData(prev => ({ ...prev, categoria }));
      setCategoriaPersonalizada('');
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const finalData = {
        ...formData,
        categoria: categoriaPersonalizada || formData.categoria,
        // No enviar frecuencia si no es recurrente
        frecuenciaRecurrencia: formData.esRecurrente ? formData.frecuenciaRecurrencia : undefined
      };

      if (isEditing) {
        await onSubmit(finalData as UpdateGastoDto);
      } else {
        await onSubmit(finalData);
      }
      
    } catch (error) {
      console.error('Error al guardar gasto:', error);
    }
  };

  // Prevenir scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onWheel={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-[#212026] border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onWheel={(e) => e.stopPropagation()}
      >
        
        {/* Header - Fijo */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? '✏️ Editar Gasto' : '➕ Nuevo Gasto'}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del formulario - Scrolleable */}
        <div 
          className="flex-1 overflow-y-auto min-h-0"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent'
          }}
          onWheel={(e) => {
            e.stopPropagation();
            // Asegurar que el scroll funcione dentro del contenedor
            const target = e.currentTarget;
            const { scrollTop, scrollHeight, clientHeight } = target;
            
            // Si llegamos al final o al inicio, prevenir el scroll del fondo
            if ((scrollTop === 0 && e.deltaY < 0) || 
                (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)) {
              e.preventDefault();
            }
          }}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                💼 Nombre del Gasto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Canva Pro, Mailchimp..."
                className={`w-full px-4 py-3 bg-white/10 border ${errors.nombre ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                disabled={isLoading}
              />
              {errors.nombre && <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                🏷️ Categoría *
              </label>
              <select
                value={categoriaPersonalizada ? 'personalizada' : formData.categoria}
                onChange={(e) => handleCategoriaChange(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.categoria ? 'border-red-500' : 'border-white/20'} rounded-xl text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                disabled={isLoading}
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIAS_PREDEFINIDAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="personalizada">✏️ Categoría personalizada</option>
              </select>
              
              {/* Input para categoría personalizada */}
              {(categoriaPersonalizada || (!formData.categoria && !CATEGORIAS_PREDEFINIDAS.includes(formData.categoria as any))) && (
                <input
                  type="text"
                  value={categoriaPersonalizada}
                  onChange={(e) => setCategoriaPersonalizada(e.target.value)}
                  placeholder="Escribir nueva categoría..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors mt-2"
                  disabled={isLoading}
                />
              )}
              
              {errors.categoria && <p className="text-red-400 text-sm mt-1">{errors.categoria}</p>}
            </div>
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                💰 Monto *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  value={formData.monto || ''}
                  onChange={(e) => handleChange('monto', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${errors.monto ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                  disabled={isLoading}
                />
              </div>
              {errors.monto && <p className="text-red-400 text-sm mt-1">{errors.monto}</p>}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                📅 Fecha *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${errors.fecha ? 'border-red-500' : 'border-white/20'} rounded-xl text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                  disabled={isLoading}
                />
              </div>
              {errors.fecha && <p className="text-red-400 text-sm mt-1">{errors.fecha}</p>}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              📝 Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción opcional del gasto..."
              rows={3}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.descripcion ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors resize-none`}
              disabled={isLoading}
            />
            {errors.descripcion && <p className="text-red-400 text-sm mt-1">{errors.descripcion}</p>}
          </div>

          {/* Proveedor y Método de Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                👤 Proveedor
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => handleChange('proveedor', e.target.value)}
                  placeholder="Ej: Netflix, Adobe..."
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${errors.proveedor ? 'border-red-500' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                  disabled={isLoading}
                />
              </div>
              {errors.proveedor && <p className="text-red-400 text-sm mt-1">{errors.proveedor}</p>}
            </div>

            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                💳 Método de Pago
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <select
                  value={formData.metodoPago}
                  onChange={(e) => handleChange('metodoPago', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar método</option>
                  {METODOS_PAGO.map(metodo => (
                    <option key={metodo} value={metodo}>{metodo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-4">
            {/* Gasto Importante */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="esImportante"
                checked={formData.esImportante}
                onChange={(e) => handleChange('esImportante', e.target.checked)}
                className="w-5 h-5 text-yellow-400 bg-white/10 border border-white/20 rounded focus:ring-yellow-400 focus:ring-1"
                disabled={isLoading}
              />
              <label htmlFor="esImportante" className="flex items-center gap-2 text-white/80 cursor-pointer">
                <Star className="w-4 h-4 text-yellow-400" />
                ⭐ Marcar como gasto importante
              </label>
            </div>

            {/* Gasto Recurrente */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="esRecurrente"
                  checked={formData.esRecurrente}
                  onChange={(e) => handleChange('esRecurrente', e.target.checked)}
                  className="w-5 h-5 text-blue-400 bg-white/10 border border-white/20 rounded focus:ring-blue-400 focus:ring-1"
                  disabled={isLoading}
                />
                <label htmlFor="esRecurrente" className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <Repeat className="w-4 h-4 text-blue-400" />
                  🔄 Es un gasto recurrente
                </label>
              </div>

              {/* Frecuencia (solo si es recurrente) */}
              {formData.esRecurrente && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    📅 Frecuencia
                  </label>
                  <select
                    value={formData.frecuenciaRecurrencia}
                    onChange={(e) => handleChange('frecuenciaRecurrencia', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border ${errors.frecuenciaRecurrencia ? 'border-red-500' : 'border-white/20'} rounded-xl text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-colors`}
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar frecuencia</option>
                    {FRECUENCIAS_RECURRENCIA.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                  {errors.frecuenciaRecurrencia && <p className="text-red-400 text-sm mt-1">{errors.frecuenciaRecurrencia}</p>}
                </div>
              )}
            </div>
          </div>

          </form>
        </div>

        {/* Footer con botones - Fijo */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#212026] rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Gasto')}
          </button>
        </div>

      </div>
    </div>
  );
};