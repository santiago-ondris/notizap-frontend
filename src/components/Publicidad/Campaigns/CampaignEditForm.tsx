import React, { useState, useEffect } from 'react';
import { 
  Save, 
  DollarSign, 
  Calendar, 
  Target, 
  Users, 
  MousePointer,
  Eye,
  BarChart3,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { 
  AdCampaignReadDto,
  CampaignFormData, 
  CampaignValidationErrors 
} from '@/types/publicidad/campaigns';
import { 
  TIPOS_CAMPAÑA_OPTIONS, 
  OBJETIVOS_CAMPAÑA_OPTIONS,
  isCampaignFromApi 
} from '@/types/publicidad/campaigns';
import { campaignsService } from '@/services/publicidad/campaignsService';

interface CampaignEditFormProps {
  campaign: AdCampaignReadDto;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const CampaignEditForm: React.FC<CampaignEditFormProps> = ({
  campaign,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  // Estado del formulario
  const [formData, setFormData] = useState<CampaignFormData>(() => 
    campaignsService.transformDtoToForm(campaign)
  );
  
  const [errors, setErrors] = useState<CampaignValidationErrors>({});
  const [showMetricsSection, setShowMetricsSection] = useState(formData.showMetricsSection);

  // Detectar si la campaña viene de API
  const isFromApi = isCampaignFromApi(campaign);

  // Actualizar formulario cuando cambie la campaña
  useEffect(() => {
    const newFormData = campaignsService.transformDtoToForm(campaign);
    setFormData(newFormData);
    setShowMetricsSection(newFormData.showMetricsSection);
    setErrors({});
  }, [campaign]);

  // Manejar cambios en campos
  const handleFieldChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[field as keyof CampaignValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const validationErrors = campaignsService.validateCampaignForm(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores antes de continuar');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la campaña');
    }
  };

  // Toggle sección de métricas
  const toggleMetricsSection = () => {
    const newValue = !showMetricsSection;
    setShowMetricsSection(newValue);
    setFormData(prev => ({
      ...prev,
      showMetricsSection: newValue
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header del formulario */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-[#D94854]" />
              Editar Campaña
            </h3>
            <p className="text-white/70">
              Modifica los datos de la campaña {isFromApi ? '(sincronizada desde API)' : '(manual)'}
            </p>
          </div>
          
          {/* Indicador de fuente */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isFromApi 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-blue-500/20 border border-blue-500/30'
          }`}>
            {isFromApi ? (
              <>
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Campaña API</span>
              </>
            ) : (
              <>
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Campaña Manual</span>
              </>
            )}
          </div>
        </div>

        {/* Info adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
          <div className="text-center">
            <div className="text-sm font-medium text-white">
              {campaignsService.formatCurrency(campaign.montoInvertido)}
            </div>
            <div className="text-xs text-white/60">Inversión Original</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">
              {campaign.unidadNegocio} / {campaign.plataforma}
            </div>
            <div className="text-xs text-white/60">Unidad / Plataforma</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">
              {campaign.month}/{campaign.year}
            </div>
            <div className="text-xs text-white/60">Período del Reporte</div>
          </div>
        </div>
      </div>

      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Información básica */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-[#B695BF]" />
            Información Básica
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID de Campaña */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                🔖 ID de Campaña *
              </label>
              <input
                type="text"
                value={formData.campaignId}
                onChange={(e) => handleFieldChange('campaignId', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.campaignId ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                placeholder="ej: META_001_2025"
              />
              {errors.campaignId && (
                <p className="text-red-400 text-sm mt-1">{errors.campaignId}</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                📝 Nombre de Campaña *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleFieldChange('nombre', e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-white/10 border ${errors.nombre ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                placeholder="ej: Campaña Invierno 2025"
              />
              {errors.nombre && (
                <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                🎯 Tipo de Campaña
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleFieldChange('tipo', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_CAMPAÑA_OPTIONS.map(tipo => (
                  <option key={tipo.value} value={tipo.value} className="bg-[#212026] text-white">
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Objetivo */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                🎯 Objetivo
              </label>
              <select
                value={formData.objetivo}
                onChange={(e) => handleFieldChange('objetivo', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
              >
                <option value="">Seleccionar objetivo</option>
                {OBJETIVOS_CAMPAÑA_OPTIONS.map(objetivo => (
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
                  value={formData.montoInvertido}
                  onChange={(e) => handleFieldChange('montoInvertido', parseFloat(e.target.value) || '')}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.montoInvertido ? 'border-red-500' : 'border-white/20'} rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                  placeholder="0.00"
                />
              </div>
              {errors.montoInvertido && (
                <p className="text-red-400 text-sm mt-1">{errors.montoInvertido}</p>
              )}
            </div>

            {/* Followers */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                👥 Followers Obtenidos
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="number"
                  min="0"
                  value={typeof formData.followersCount === 'number' ? formData.followersCount : ''}
                  onChange={(e) => handleFieldChange('followersCount', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50"
                  placeholder="Cantidad de followers"
                />
              </div>
            </div>

            {/* Fechas */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                📅 Fecha de Inicio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="date"
                  value={formData.fechaInicio ? formData.fechaInicio.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('fechaInicio', e.target.value ? new Date(e.target.value) : null)}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.fechaInicio ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                />
              </div>
              {errors.fechaInicio && (
                <p className="text-red-400 text-sm mt-1">{errors.fechaInicio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                📅 Fecha de Fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="date"
                  value={formData.fechaFin ? formData.fechaFin.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('fechaFin', e.target.value ? new Date(e.target.value) : null)}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${errors.fechaFin ? 'border-red-500' : 'border-white/20'} rounded-lg text-white focus:border-[#D94854]/50 focus:outline-none disabled:opacity-50`}
                />
              </div>
              {errors.fechaFin && (
                <p className="text-red-400 text-sm mt-1">{errors.fechaFin}</p>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white/80 mb-2">
              📋 Descripción de Resultados
            </label>
            <textarea
              value={formData.resultados}
              onChange={(e) => handleFieldChange('resultados', e.target.value)}
              disabled={isLoading}
              placeholder="ej: 150 nuevos seguidores, 23 ventas generadas..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#D94854]/50 focus:outline-none resize-none disabled:opacity-50"
            />
            <p className="text-xs text-white/50 mt-1">
              Describe los resultados específicos obtenidos con esta campaña
            </p>
          </div>
        </div>

        {/* Sección de métricas (opcional/expandible) */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#51590E]" />
              Métricas Avanzadas
            </h4>
            
            <button
              type="button"
              onClick={toggleMetricsSection}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
            >
              <span className="text-sm">
                {showMetricsSection ? 'Ocultar' : 'Mostrar'}
              </span>
              {showMetricsSection ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {isFromApi && !showMetricsSection && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="text-xs text-white/70">
                  Esta campaña tiene métricas automáticas de la API. Puedes editarlas manualmente si es necesario.
                </div>
              </div>
            </div>
          )}

          {showMetricsSection && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Clicks */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    👆 Clicks
                  </label>
                  <div className="relative">
                    <MousePointer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="number"
                      min="0"
                      value={typeof formData.clicks === 'number' ? formData.clicks : ''}
                      onChange={(e) => handleFieldChange('clicks', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Impressions */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    👀 Impresiones
                  </label>
                  <div className="relative">
                    <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="number"
                      min="0"
                      value={typeof formData.impressions === 'number' ? formData.impressions : ''}
                      onChange={(e) => handleFieldChange('impressions', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Reach */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    📢 Alcance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={typeof formData.reach === 'number' ? formData.reach : ''}
                    onChange={(e) => handleFieldChange('reach', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none disabled:opacity-50"
                    placeholder="0"
                  />
                </div>

                {/* CTR */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    📈 CTR (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={typeof formData.ctr === 'number' ? formData.ctr : ''}
                    onChange={(e) => handleFieldChange('ctr', e.target.value === '' ? '' : parseFloat(e.target.value))}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>

                {/* Valor Resultado */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    🎯 Resultado Descriptivo
                  </label>
                  <input
                    type="text"
                    value={typeof formData.valorResultado === 'string' ? formData.valorResultado : ''}
                    onChange={(e) => handleFieldChange('valorResultado', e.target.value)}
                    disabled={isLoading}
                    placeholder="ej: 150 nuevos seguidores, 23 ventas..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-[#51590E]/50 focus:outline-none disabled:opacity-50"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    Describe el resultado principal obtenido
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div className="text-xs text-white/70">
                    <p className="font-medium text-yellow-400 mb-1">⚠️ Edición de métricas</p>
                    <p>Las métricas editadas manualmente pueden diferir de los datos originales de la API. Los cambios se guardarán permanentemente.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="text-sm text-white/60">
            * Campos obligatorios
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
              type="submit"
              disabled={isLoading || Object.keys(errors).some(key => errors[key as keyof CampaignValidationErrors])}
              className="flex items-center gap-2 px-6 py-3 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CampaignEditForm;