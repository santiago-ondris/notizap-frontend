import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

// Componentes
import CampaignEditForm from '@/components/Publicidad/Campaigns/CampaignEditForm';

// Servicios y tipos
import { campaignsService } from '@/services/publicidad/campaignsService';
import type { 
  AdCampaignReadDto,
  CampaignFormData 
} from '@/types/publicidad/campaigns';

const CampaignEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  
  // Estados
  const [campaign, setCampaign] = useState<AdCampaignReadDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permisos
  const canEdit = ['admin', 'superadmin'].includes(role || '');

  // Cargar campaña
  useEffect(() => {
    const loadCampaign = async () => {
      if (!id || !canEdit) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const campaignData = await campaignsService.getCampaignById(parseInt(id));
        setCampaign(campaignData);
      } catch (error: any) {
        console.error('Error cargando campaña:', error);
        setError(error.message || 'Error al cargar la campaña');
        toast.error('Error al cargar la campaña: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaign();
  }, [id, canEdit]);

  // Manejar actualización
  const handleSubmit = async (formData: CampaignFormData) => {
    if (!campaign || !id) return;

    setIsSaving(true);
    
    try {
      const dto = campaignsService.transformFormToDto(formData);
      const updatedCampaign = await campaignsService.updateCampaign(parseInt(id), dto);
      
      setCampaign(updatedCampaign);
      toast.success('✅ Campaña actualizada correctamente');
      
      // Opcional: redirigir después de guardar
      // navigate('/publicidad/campanas');
    } catch (error: any) {
      toast.error(`Error al actualizar la campaña: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/publicidad/campanas');
  };

  // Control de acceso
  if (!canEdit) {
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
              <h2 className="text-2xl font-bold text-white mb-4">Sin Permisos de Edición</h2>
              <p className="text-white/70 mb-6">
                No tienes permisos para editar campañas. Contacta con tu administrador.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/publicidad/campanas')}
                  className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
                >
                  Ver Campañas
                </button>
                <button
                  onClick={() => navigate('/publicidad')}
                  className="w-full px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Volver al Módulo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ID inválido
  if (!id) {
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
              <h2 className="text-2xl font-bold text-white mb-4">ID de Campaña Inválido</h2>
              <p className="text-white/70 mb-6">
                No se proporcionó un ID válido para la campaña.
              </p>
              <button
                onClick={() => navigate('/publicidad/campanas')}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Volver a Campañas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading inicial
  if (isLoading) {
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
              <h2 className="text-xl font-semibold text-white mb-2">Cargando Campaña</h2>
              <p className="text-white/60">Obteniendo datos de la campaña...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
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
              <h2 className="text-2xl font-bold text-white mb-4">Error al Cargar Campaña</h2>
              <p className="text-white/70 mb-6">
                {error || 'No se pudo encontrar la campaña solicitada'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={() => navigate('/publicidad/campanas')}
                  className="w-full px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Volver a Campañas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8">
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
            onClick={() => navigate('/publicidad/campanas')}
            className="text-white/60 hover:text-white transition-colors"
          >
            Gestión de Campañas
          </button>
          <span className="text-white/40">/</span>
          <span className="text-white/80">Editar Campaña</span>
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
              ✏️ Editar Campaña
            </h1>
            <p className="text-white/70">
              Modifica los datos de la campaña: {campaign.nombre}
            </p>
          </div>
        </div>

        {/* Formulario de edición */}
        <CampaignEditForm
          campaign={campaign}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSaving}
        />

        {/* Footer con información adicional */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-white/60">
              💡 <strong>Tip:</strong> Los cambios se guardan inmediatamente. 
              Las métricas editadas manualmente pueden diferir de los datos originales de la API.
            </div>
            
            <div className="text-xs text-white/50">
              ID de campaña: {campaign.id} | Reporte: {campaign.month}/{campaign.year}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignEditPage;