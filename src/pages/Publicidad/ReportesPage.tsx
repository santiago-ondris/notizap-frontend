import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  RefreshCw, 
  ArrowLeft,
  BarChart3,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import ReportesTable from '@/components/Publicidad/Reportes/ReportesTable';
import { reportesService } from '@/services/publicidad/reportesService';
import type { AdReportDto } from '@/types/publicidad/reportes';

const ReportesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados
  const [reportes, setReportes] = useState<AdReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cargar reportes
  const loadReportes = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    setError(null);

    try {
      const data = await reportesService.getAllReportes();
      setReportes(data);
      setLastUpdated(new Date());
      
      if (!showLoading) {
        toast.success('Reportes actualizados correctamente');
      }
    } catch (err: any) {
      console.error('Error cargando reportes:', err);
      setError(err.message || 'Error al cargar los reportes');
      
      if (!showLoading) {
        toast.error('Error al actualizar los reportes');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    loadReportes();
  }, [loadReportes]);

  // Handlers
  const handleRefresh = useCallback(() => {
    loadReportes(false);
  }, [loadReportes]);

  const handleCreate = () => {
    navigate('/publicidad/reportes/nuevo');
  };

  const handleEdit = (reporte: AdReportDto) => {
    navigate(`/publicidad/campanas/editar/${reporte.id}`);
  };

  const handleView = (reporte: AdReportDto) => {
    navigate(`/publicidad/reportes/${reporte.id}`);
  };

  const handleDelete = async (reporte: AdReportDto) => {
    try {
      await reportesService.deleteReporte(reporte.id);
      toast.success('Reporte eliminado correctamente');
      
      // Actualizar lista local
      setReportes(prev => prev.filter(r => r.id !== reporte.id));
    } catch (error: any) {
      toast.error('Error al eliminar el reporte: ' + error.message);
    }
  };

  // Loading inicial
  if (isLoading && !reportes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-white/60 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Cargando Reportes</h2>
              <p className="text-white/60">Obteniendo todos los reportes de campañas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !reportes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Error al cargar reportes</h2>
              <p className="text-white/70 mb-6">{error}</p>
              <button
                onClick={() => loadReportes()}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => navigate('/publicidad')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Publicidad
          </button>
          <span className="text-white/40">/</span>
          <span className="text-white/80">Reportes</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/publicidad')}
              className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </button>
            
            <div>
              <h1 className="text-3xl font-bold text-white">📋 Reportes de Campañas</h1>
              <p className="text-white/70">
                Gestiona todos los reportes manuales de publicidad
              </p>
              {lastUpdated && (
                <p className="text-xs text-white/50 mt-1">
                  Última actualización: {lastUpdated.toLocaleString('es-AR')}
                </p>
              )}
            </div>
          </div>

          {/* Acciones del header */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </span>
            </button>

            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg text-[#D94854] hover:bg-[#D94854]/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nuevo Reporte</span>
            </button>
          </div>
        </div>

        {/* Indicador de estado */}
        {isRefreshing && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-blue-400">Actualizando lista de reportes...</span>
            </div>
          </div>
        )}

        {/* Resumen rápido */}
        {reportes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#D94854]/20">
                  <BarChart3 className="w-4 h-4 text-[#D94854]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{reportes.length}</div>
                  <div className="text-xs text-white/60">Total Reportes</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#B695BF]/20">
                  <BarChart3 className="w-4 h-4 text-[#B695BF]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {reportes.reduce((sum, r) => sum + r.campañas.length, 0)}
                  </div>
                  <div className="text-xs text-white/60">Total Campañas</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#51590E]/20">
                  <BarChart3 className="w-4 h-4 text-[#51590E]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {reportesService.formatCurrency(
                      reportes.reduce((sum, r) => 
                        sum + r.campañas.reduce((cSum, c) => cSum + c.montoInvertido, 0), 0
                      )
                    )}
                  </div>
                  <div className="text-xs text-white/60">Inversión Total</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#e327c4]/20">
                  <BarChart3 className="w-4 h-4 text-[#e327c4]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {[...new Set(reportes.map(r => `${r.unidadNegocio}-${r.plataforma}`))].length}
                  </div>
                  <div className="text-xs text-white/60">Combinaciones</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de reportes */}
        <ReportesTable
          reportes={reportes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>
    </div>
  );
};

export default ReportesPage;