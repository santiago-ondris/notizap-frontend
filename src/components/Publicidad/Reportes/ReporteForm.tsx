import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  Copy,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { reportesService } from '@/services/publicidad/reportesService';
import type { 
  ReporteFormData, 
  CampañaFormData, 
  ReporteValidationErrors,
  CampañaValidationErrors
} from '@/types/publicidad/reportes';
import { 
  UNIDADES_OPCIONES, 
  PLATAFORMAS_OPCIONES, 
  TIPOS_CAMPAÑA, 
  OBJETIVOS_META 
} from '@/types/publicidad/reportes';

interface ReporteFormProps {
  initialData?: ReporteFormData;
  onSubmit: (data: ReporteFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const ReporteForm: React.FC<ReporteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const isEditing = mode === 'edit';
  
  // Estado del formulario - inicialización estable
  const [formData, setFormData] = useState<ReporteFormData>(() => {
    if (initialData) {
      return {
        ...initialData,
        campañas: initialData.campañas.map(c => ({
          ...c,
          followersMode: c.followersMode ?? 'default'
        }))
      };
    }
    return reportesService.createEmptyReporte();
  });

  const [errors, setErrors] = useState<ReporteValidationErrors>({});

  // Cargar datos iniciales solo cuando cambie initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        campañas: initialData.campañas.map(c => ({
          ...c,
          followersMode: c.followersMode ?? 'default'
        }))
      });
    } else {
      setFormData(reportesService.createEmptyReporte());
    }
    setErrors({});
  }, [initialData]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const validationErrors = reportesService.validateReporte(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Manejar cambios en campos del reporte
  const handleReporteChange = (field: keyof ReporteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Manejar cambios en campos de campaña
  const handleCampañaChange = (index: number, field: keyof CampañaFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      campañas: prev.campañas.map((campaña, i) => 
        i === index ? { ...campaña, [field]: value } : campaña
      )
    }));

    // Limpiar errores de la campaña si existen
    if (errors.campañas?.[index] && field in errors.campañas[index]) {
      setErrors(prev => ({
        ...prev,
        campañas: prev.campañas?.map((error, i) => 
          i === index ? { ...error, [field as keyof CampañaValidationErrors]: undefined } : error
        )
      }));
    }
  };

  // Agregar nueva campaña
  const addCampaña = () => {
    const newCampaña = reportesService.createEmptyCampaña();
    setFormData(prev => ({
      ...prev,
      campañas: [...prev.campañas, newCampaña]
    }));
  };

  // Eliminar campaña
  const removeCampaña = (index: number) => {
    if (formData.campañas.length <= 1) {
      toast.warning('Debe haber al menos una campaña');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      campañas: prev.campañas.filter((_, i) => i !== index)
    }));
  };

  // Duplicar campaña
  const duplicateCampaña = (index: number) => {
    const campaña = formData.campañas[index];
    const duplicated = {
      ...campaña,
      campaignId: `${campaña.campaignId}_copy`,
      nombre: `${campaña.nombre} (Copia)`
    };
    
    setFormData(prev => ({
      ...prev,
      campañas: [...prev.campañas.slice(0, index + 1), duplicated, ...prev.campañas.slice(index + 1)]
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores antes de continuar');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el reporte');
    }
  };

  // Calcular totales
  const totalInvertido = formData.campañas.reduce((sum, c) => 
    sum + (typeof c.montoInvertido === 'number' ? c.montoInvertido : 0), 0
  );
  
  const totalFollowers = formData.campañas.reduce((sum, c) => 
    sum + (typeof c.followersCount === 'number' ? c.followersCount : 0), 0
  );

  return (
    <div className="space-y-8">
      {/* Información del Reporte */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-[#D94854]" />
          Información del Reporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Unidad de Negocio */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              🏢 Unidad de Negocio *
            </label>
            <select
              value={formData.unidadNegocio}
              onChange={(e) => handleReporteChange('unidadNegocio', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.unidadNegocio ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
            >
              <option value="">Seleccionar unidad</option>
              {UNIDADES_OPCIONES.map(unidad => (
                <option key={unidad.value} value={unidad.value} className="bg-[#212026] text-white">
                  {unidad.label}
                </option>
              ))}
            </select>
            {errors.unidadNegocio && <p className="text-red-400 text-sm mt-1">{errors.unidadNegocio}</p>}
          </div>

          {/* Plataforma */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              📱 Plataforma *
            </label>
            <select
              value={formData.plataforma}
              onChange={(e) => handleReporteChange('plataforma', e.target.value)}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.plataforma ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
            >
              <option value="">Seleccionar plataforma</option>
              {PLATAFORMAS_OPCIONES.map(plataforma => (
                <option key={plataforma.value} value={plataforma.value} className="bg-[#212026] text-white">
                  {plataforma.label}
                </option>
              ))}
            </select>
            {errors.plataforma && <p className="text-red-400 text-sm mt-1">{errors.plataforma}</p>}
          </div>

          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              📅 Año *
            </label>
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear() + 1}
              value={formData.año}
              onChange={(e) => handleReporteChange('año', parseInt(e.target.value) || new Date().getFullYear())}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.año ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
            />
            {errors.año && <p className="text-red-400 text-sm mt-1">{errors.año}</p>}
          </div>

          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              📅 Mes *
            </label>
            <select
              value={formData.mes}
              onChange={(e) => handleReporteChange('mes', parseInt(e.target.value))}
              disabled={isLoading}
              className={`w-full px-4 py-3 bg-white/10 border ${errors.mes ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
            >
              <option value="">Seleccionar mes</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(mes => (
                <option key={mes} value={mes} className="bg-[#212026] text-white">
                  {new Date(2024, mes - 1).toLocaleDateString('es-AR', { month: 'long' })}
                </option>
              ))}
            </select>
            {errors.mes && <p className="text-red-400 text-sm mt-1">{errors.mes}</p>}
          </div>
        </div>

        {/* Resumen */}
        {(formData.unidadNegocio || formData.plataforma) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#D94854]">
                {reportesService.formatCurrency(totalInvertido)}
              </div>
              <div className="text-xs text-white/60">Total Invertido</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#B695BF]">
                {formData.campañas.length}
              </div>
              <div className="text-xs text-white/60">Campañas</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#51590E]">
                {totalFollowers}
              </div>
              <div className="text-xs text-white/60">Total Followers</div>
            </div>
          </div>
        )}
      </div>

      {/* Campañas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-[#D94854]" />
            Campañas ({formData.campañas.length})
          </h3>
          
          <button
            type="button"
            onClick={addCampaña}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg text-[#D94854] hover:bg-[#D94854]/30 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Agregar Campaña</span>
          </button>
        </div>

        {formData.campañas.map((campaña, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D94854]" />
                Campaña {index + 1}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => duplicateCampaña(index)}
                  disabled={isLoading}
                  className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                  title="Duplicar campaña"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {formData.campañas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCampaña(index)}
                    disabled={isLoading}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    title="Eliminar campaña"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID de Campaña */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🔖 ID de Campaña *
                </label>
                <input
                  type="text"
                  value={campaña.campaignId}
                  onChange={(e) => handleCampañaChange(index, 'campaignId', e.target.value)}
                  disabled={isLoading}
                  placeholder="ej: META_001_2025"
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.campañas?.[index]?.campaignId ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                />
                {errors.campañas?.[index]?.campaignId && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].campaignId}</p>
                )}
              </div>

              {/* Nombre de Campaña */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📝 Nombre de Campaña *
                </label>
                <input
                  type="text"
                  value={campaña.nombre}
                  onChange={(e) => handleCampañaChange(index, 'nombre', e.target.value)}
                  disabled={isLoading}
                  placeholder="ej: Campaña Invierno 2025"
                  className={`w-full px-4 py-3 bg-white/10 border ${errors.campañas?.[index]?.nombre ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                />
                {errors.campañas?.[index]?.nombre && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].nombre}</p>
                )}
              </div>

              {/* Tipo de Campaña */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🎯 Tipo de Campaña *
                </label>
                <select
                  value={campaña.tipo}
                  onChange={(e) => handleCampañaChange(index, 'tipo', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Seleccionar tipo</option>
                  {TIPOS_CAMPAÑA.map(tipo => (
                    <option key={tipo.value} value={tipo.value} className="bg-[#212026] text-white">
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🎯 Objetivo *
                </label>
                <select
                  value={campaña.objetivo}
                  onChange={(e) => handleCampañaChange(index, 'objetivo', e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Seleccionar objetivo</option>
                  {OBJETIVOS_META.map(objetivo => (
                    <option key={objetivo.value} value={objetivo.value} className="bg-[#212026] text-white">
                      {objetivo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monto Invertido */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  💰 Monto Invertido *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={campaña.montoInvertido}
                    onChange={(e) => handleCampañaChange(index, 'montoInvertido', parseFloat(e.target.value) || '')}
                    disabled={isLoading}
                    placeholder="0.00"
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.campañas?.[index]?.montoInvertido ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                  />
                </div>
                {errors.campañas?.[index]?.montoInvertido && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].montoInvertido}</p>
                )}
              </div>

              {/* Followers Obtenidos */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  👥 Followers Obtenidos
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <select
                    value={campaña.followersMode}
                    onChange={(e) => {
                      const modo = e.target.value as 'default' | 'especifica';
                      handleCampañaChange(index, 'followersMode', modo);
                      if (modo === 'default') {
                        handleCampañaChange(index, 'followersCount', '');
                      }
                    }}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
                  >
                    <option value="default">Seleccionar…</option>
                    <option value="especifica">Cantidad específica</option>
                  </select>
                </div>
                
                {campaña.followersMode === 'especifica' && (
                  <div className="relative mt-2">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="number"
                      min={0}
                      value={typeof campaña.followersCount === 'number' ? campaña.followersCount : ''}
                      onChange={(e) => handleCampañaChange(index, 'followersCount', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isLoading}
                      placeholder="Cantidad de followers"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                )}
                
                {errors.campañas?.[index]?.followersCount && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].followersCount}</p>
                )}
              </div>

              {/* Fecha de Inicio */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📅 Fecha de Inicio *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="date"
                    value={campaña.fechaInicio ? campaña.fechaInicio.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleCampañaChange(index, 'fechaInicio', e.target.value ? new Date(e.target.value) : null)}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.campañas?.[index]?.fechaInicio ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                  />
                </div>
                {errors.campañas?.[index]?.fechaInicio && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].fechaInicio}</p>
                )}
              </div>

              {/* Fecha de Fin */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📅 Fecha de Fin *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <input
                    type="date"
                    value={campaña.fechaFin ? campaña.fechaFin.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleCampañaChange(index, 'fechaFin', e.target.value ? new Date(e.target.value) : null)}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.campañas?.[index]?.fechaFin ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                  />
                </div>
                {errors.campañas?.[index]?.fechaFin && (
                  <p className="text-red-400 text-sm mt-1">{errors.campañas[index].fechaFin}</p>
                )}
              </div>

              {/* Descripción de Resultados */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  📋 Descripción de Resultados
                </label>
                <textarea
                  value={campaña.resultados}
                  onChange={(e) => handleCampañaChange(index, 'resultados', e.target.value)}
                  disabled={isLoading}
                  placeholder="ej: 25 conversiones, 150 leads generados..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <div className="text-sm text-white/60">
          {formData.campañas.length} campaña{formData.campañas.length !== 1 ? 's' : ''} • Total: {reportesService.formatCurrency(totalInvertido)}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(errors).some(key => errors[key as keyof ReporteValidationErrors])}
            className="flex items-center gap-2 px-6 py-3 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Reporte' : 'Crear Reporte')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReporteForm;