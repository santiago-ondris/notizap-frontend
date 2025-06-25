import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import ReporteForm from '@/components/Publicidad/Reportes/ReporteForm';
import { reportesService } from '@/services/publicidad/reportesService';
import type { ReporteFormData } from '@/types/publicidad/reportes';

const CrearReportePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Para modo edición
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<ReporteFormData | undefined>();
  const [isLoadingData, setIsLoadingData] = useState(!!id);

  const isEditMode = !!id;

  // Cargar datos para edición
  React.useEffect(() => {
    if (isEditMode && id) {
      const loadReportData = async () => {
        try {
          setIsLoadingData(true);
          const reportData = await reportesService.getReporteById(parseInt(id));
          const formData = reportesService.transformDtoToForm(reportData);
          setInitialData(formData);
        } catch (error: any) {
          toast.error('Error al cargar el reporte: ' + error.message);
          navigate('/publicidad/reportes');
        } finally {
          setIsLoadingData(false);
        }
      };

      loadReportData();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (formData: ReporteFormData) => {
    setIsLoading(true);
    
    try {
      const dto = reportesService.transformFormToDto(formData);
      
      if (isEditMode && id) {
        await reportesService.updateReporte(parseInt(id), dto);
        toast.success('✅ Reporte actualizado correctamente');
      } else {
        await reportesService.createReporte(dto);
        toast.success('✅ Reporte creado correctamente');
      }
      
      navigate('/publicidad/reportes');
    } catch (error: any) {
      toast.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el reporte: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/publicidad/reportes');
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-[#D94854] border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Cargando reporte</h2>
              <p className="text-white/60">Por favor espera...</p>
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
          <button
            onClick={() => navigate('/publicidad/reportes')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Reportes
          </button>
          <span className="text-white/40">/</span>
          <span className="text-white/80">
            {isEditMode ? 'Editar reporte' : 'Crear reporte'}
          </span>
        </div>

        {/* Header con botón de regreso */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleCancel}
            className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditMode ? '✏️ Editar Reporte' : '📝 Crear Nuevo Reporte'}
            </h1>
            <p className="text-white/70">
              {isEditMode 
                ? 'Modifica los datos del reporte de campañas manuales'
                : 'Agrega un nuevo reporte para Google Ads o Facebook Kids'
              }
            </p>
          </div>
        </div>

        {/* Formulario */}
        <ReporteForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/publicidad/reportes')}
          isLoading={isLoading}
          mode={isEditMode ? 'edit' : 'create'}
        />
      </div>
    </div>
  );
};

export default CrearReportePage;