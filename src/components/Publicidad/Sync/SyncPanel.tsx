import React, { useState, useEffect } from 'react';
import { 
  Bubbles, 
  Eye, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Calendar,
  Target,
  Loader2,
  Zap,
  Database,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { syncService } from '@/services/publicidad/syncService';
import type { 
  MetaCampaignInsightDto,
  SyncResultDto,
  AdReportDto
} from '@/types/publicidad/reportes';

interface SyncPanelProps {
  onSyncComplete?: (result: SyncResultDto) => void;
}

interface SyncPreviewData {
  insights: MetaCampaignInsightDto[];
  existingReport?: AdReportDto;
  summary: {
    totalCampaigns: number;
    totalSpend: number;
    dateRange: {
      from: string;
      to: string;
    };
    unidad: string;
  };
}

type SyncStep = 'configure' | 'preview' | 'executing' | 'completed';

const SyncPanel: React.FC<SyncPanelProps> = ({ onSyncComplete }) => {
  const [currentStep, setCurrentStep] = useState<SyncStep>('configure');
  const [selectedUnidad, setSelectedUnidad] = useState<string>('montella');
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0].slice(0, 7) + '-01', // Primer día del mes actual
    to: new Date().toISOString().split('T')[0] // Día actual
  });
  
  const [previewData, setPreviewData] = useState<SyncPreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResultDto | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);

  // Verificar estado de la API al cargar
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const isConnected = await syncService.validateApiConnection(selectedUnidad);
        setApiStatus(isConnected);
      } catch (error) {
        setApiStatus(false);
      }
    };

    checkApiStatus();
  }, [selectedUnidad]);

  // Obtener rango recomendado cuando cambie la unidad
  useEffect(() => {
    const recommended = syncService.getRecommendedDateRange();
    setDateRange(recommended);
  }, [selectedUnidad]);

  const handleGetPreview = async () => {
    if (!selectedUnidad || !dateRange.from || !dateRange.to) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoadingPreview(true);
    
    try {
      const preview = await syncService.getPreviewData(selectedUnidad, dateRange.from, dateRange.to);
      const validation = syncService.validateSyncData(preview);
      const recommendations = syncService.generateRecommendations(preview);
      
      setPreviewData(preview);
      setValidationResult({ ...validation, recommendations });
      
      if (validation.isValid) {
        setCurrentStep('preview');
        toast.success('Preview cargado correctamente');
      } else {
        toast.error('Hay errores que deben corregirse antes de continuar');
      }
    } catch (error: any) {
      toast.error('Error obteniendo preview: ' + error.message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteSync = async () => {
    if (!previewData || !validationResult?.isValid) {
      toast.error('No se puede ejecutar la sincronización');
      return;
    }

    setIsSyncing(true);
    setCurrentStep('executing');
    
    try {
      const result = await syncService.executeSync(selectedUnidad, dateRange.from, dateRange.to);
      setSyncResult(result);
      setCurrentStep('completed');
      
      const statusMessage = syncService.formatSyncResult(result);
      toast.success('Sincronización completada: ' + statusMessage);
      
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (error: any) {
      toast.error('Error en la sincronización: ' + error.message);
      setCurrentStep('preview');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('configure');
    setPreviewData(null);
    setSyncResult(null);
    setValidationResult(null);
  };

  const availableUnits = syncService.getAvailableUnits();

  // Calcular métricas de comparación si hay preview
  const comparisonMetrics = previewData ? syncService.calculateComparisonMetrics(previewData) : null;

  return (
    <div className="space-y-6">
      {/* Header con estado */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#51590E]/20 border border-[#51590E]/30">
              <Bubbles className="w-6 h-6 text-[#51590E]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">🔄 Panel de Sincronización</h2>
              <p className="text-white/70">Importa datos desde Meta API (Montella/Alenka)</p>
            </div>
          </div>

          {/* Estado de la API */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === true ? 'bg-green-400' : 
              apiStatus === false ? 'bg-red-400' : 'bg-yellow-400'
            }`} />
            <span className="text-sm text-white/70">
              API {apiStatus === true ? 'Conectada' : apiStatus === false ? 'Error' : 'Verificando...'}
            </span>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-4">
          {(['configure', 'preview', 'executing', 'completed'] as SyncStep[]).map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                currentStep === step ? 'bg-[#51590E] text-white' :
                index < (['configure', 'preview', 'executing', 'completed'] as SyncStep[]).indexOf(currentStep) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/20 text-white/60'
              }`}>
                {index < (['configure', 'preview', 'executing', 'completed'] as SyncStep[]).indexOf(currentStep) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-sm ${
                currentStep === step ? 'text-white font-medium' : 'text-white/60'
              }`}>
                {step === 'configure' ? 'Configurar' :
                 step === 'preview' ? 'Preview' :
                 step === 'executing' ? 'Sincronizando' : 'Completado'}
              </span>
              {index < 3 && <div className="w-8 h-px bg-white/20" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Configuración */}
      {currentStep === 'configure' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#51590E]" />
            Configuración de Sincronización
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Selección de unidad */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Unidad de Negocio
              </label>
              <select
                value={selectedUnidad}
                onChange={(e) => setSelectedUnidad(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#51590E]/50 focus:outline-none"
              >
                {availableUnits.map(unit => (
                  <option 
                    key={unit.value} 
                    value={unit.value} 
                    disabled={!unit.apiSupported}
                    className="bg-[#212026] text-white"
                  >
                    {unit.label} {!unit.apiSupported && '(No disponible)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/50">
                Solo Montella y Alenka tienen API configurada
              </p>
            </div>

            {/* Fecha desde */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#51590E]/50 focus:outline-none"
              />
            </div>

            {/* Fecha hasta */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#51590E]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Información del período */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-400 mb-2">Información del Período</h4>
                <div className="text-xs text-white/70 space-y-1">
                  <p>• Período: {syncService.formatDate(dateRange.from)} - {syncService.formatDate(dateRange.to)}</p>
                  <p>• Unidad: {availableUnits.find(u => u.value === selectedUnidad)?.label}</p>
                  <p>• Los datos se guardarán en el reporte mensual correspondiente</p>
                  <p>• Si ya existe un reporte, se actualizarán las campañas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de preview */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleGetPreview}
              disabled={isLoadingPreview || !apiStatus}
              className="flex items-center gap-2 px-6 py-3 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg text-[#51590E] hover:bg-[#51590E]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingPreview ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="font-medium">
                {isLoadingPreview ? 'Obteniendo Preview...' : 'Obtener Preview'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {currentStep === 'preview' && previewData && validationResult && (
        <div className="space-y-6">
          {/* Resumen del preview */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#51590E]" />
              Preview de Sincronización
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#D94854]">
                  {previewData.summary.totalCampaigns}
                </div>
                <div className="text-xs text-white/60">Campañas</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#51590E]">
                  {syncService.formatCurrency(previewData.summary.totalSpend)}
                </div>
                <div className="text-xs text-white/60">Gasto Total</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#B695BF]">
                  {comparisonMetrics ? syncService.formatNumber(comparisonMetrics.totalClicks) : '0'}
                </div>
                <div className="text-xs text-white/60">Total Clicks</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-[#e327c4]">
                  {comparisonMetrics ? comparisonMetrics.averageCtr.toFixed(2) + '%' : '0%'}
                </div>
                <div className="text-xs text-white/60">CTR Promedio</div>
              </div>
            </div>

            {/* Validaciones */}
            {validationResult.errors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Errores encontrados</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Advertencias */}
            {validationResult.warnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-400 mb-2">Advertencias</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {validationResult.recommendations && validationResult.recommendations.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Recomendaciones</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      {validationResult.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reporte existente */}
            {previewData.existingReport && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Reporte Existente
                </h4>
                <div className="text-xs text-white/70">
                  <p>Se encontró un reporte existente para {previewData.existingReport.unidadNegocio} - {previewData.existingReport.plataforma}</p>
                  <p>Período: {previewData.existingReport.month}/{previewData.existingReport.year}</p>
                  <p>Campañas actuales: {previewData.existingReport.campañas.length}</p>
                  <p className="text-yellow-400 mt-2">Las campañas se actualizarán o agregarán según corresponda</p>
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
              >
                Volver a Configurar
              </button>

              <button
                onClick={handleExecuteSync}
                disabled={!validationResult.isValid}
                className="flex items-center gap-2 px-6 py-3 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg text-[#51590E] hover:bg-[#51590E]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                <span className="font-medium">Ejecutar Sincronización</span>
              </button>
            </div>
          </div>

          {/* Lista de campañas del preview */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h4 className="text-lg font-medium text-white mb-4">Campañas a Sincronizar</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {previewData.insights.map((insight) => (
                <div key={insight.campaignId} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{insight.campaignName}</div>
                      <div className="text-xs text-white/60">ID: {insight.campaignId}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#D94854]">
                        {syncService.formatCurrency(insight.spend)}
                      </div>
                      <div className="text-xs text-white/60">
                        {insight.clicks} clicks • {insight.impressions} imp.
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Ejecutando */}
      {currentStep === 'executing' && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#51590E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#51590E]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sincronizando con Meta API</h3>
            <p className="text-white/70 mb-6">
              Procesando {previewData?.summary.totalCampaigns} campañas de {selectedUnidad}...
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-xs text-white/60">
                Este proceso puede tomar algunos minutos dependiendo de la cantidad de campañas.
                No cierres esta ventana hasta que termine.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Completado */}
      {currentStep === 'completed' && syncResult && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Sincronización Completada
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {syncResult.updatedCampaigns.length}
              </div>
              <div className="text-xs text-white/60">Actualizadas</div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {syncResult.unchangedCampaigns.length}
              </div>
              <div className="text-xs text-white/60">Sin Cambios</div>
            </div>

            <div className="bg-[#B695BF]/10 border border-[#B695BF]/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-[#B695BF]">
                #{syncResult.reportId}
              </div>
              <div className="text-xs text-white/60">ID Reporte</div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Resultado</h4>
                <p className="text-xs text-white/70">
                  {syncService.formatSyncResult(syncResult)}
                </p>
              </div>
            </div>
          </div>

          {/* Campañas actualizadas */}
          {syncResult.updatedCampaigns.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Campañas Actualizadas</h4>
              <div className="text-xs text-white/60 space-y-1">
                {syncResult.updatedCampaigns.map(id => (
                  <div key={id}>• {id}</div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones finales */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
            >
              Nueva Sincronización
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open('/publicidad/dashboard', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">Ver Dashboard</span>
              </button>

              <button
                onClick={() => window.open(`/publicidad/reportes/${syncResult.reportId}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-[#51590E]/20 border border-[#51590E]/30 rounded-lg text-[#51590E] hover:bg-[#51590E]/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Ver Reporte</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncPanel;