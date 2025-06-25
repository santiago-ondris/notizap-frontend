import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Clock,
} from 'lucide-react';
import SyncPanel from '@/components/Publicidad/Sync/SyncPanel';
import { syncService } from '@/services/publicidad/syncService';
import type { SyncResultDto } from '@/types/publicidad/reportes';

const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [, setLastSyncResult] = useState<SyncResultDto | null>(null);

  // Verificar permisos
  const canSync = role === 'superadmin';

  // Cargar historial al montar
  useEffect(() => {
    const history = syncService.getSyncHistory();
    setSyncHistory(history);
  }, []);

  const handleSyncComplete = (result: SyncResultDto) => {
    setLastSyncResult(result);
    
    // Actualizar historial
    const history = syncService.getSyncHistory();
    setSyncHistory(history);
  };

  const clearHistory = () => {
    syncService.clearSyncHistory();
    setSyncHistory([]);
  };

  if (!canSync) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30 w-fit mx-auto mb-6">
                <Shield className="w-16 h-16 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
              <p className="text-white/70 mb-6">
                Solo los SuperAdmins pueden acceder al panel de sincronización. 
                Esta función requiere permisos especiales para proteger la integridad de los datos.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/publicidad')}
                  className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white/80 hover:bg-white/15 transition-colors"
                >
                  Volver al Módulo
                </button>
                <button
                  onClick={() => navigate('/publicidad/dashboard')}
                  className="w-full px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors"
                >
                  Ver Dashboard
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
          <span className="text-white/80">Sincronización</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/publicidad')}
            className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-white">🔄 Sincronización con Meta API</h1>
            <p className="text-white/70">
              Importa datos automáticamente desde Facebook/Instagram Ads (Solo SuperAdmin)
            </p>
          </div>
        </div>

        {/* Warning de SuperAdmin */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-400 mb-1">
                ⚠️ Función Crítica - Solo SuperAdmin
              </h3>
              <div className="text-xs text-white/70 space-y-1">
                <p>• Esta función modifica directamente los datos en la base de datos</p>
                <p>• Siempre revisa el preview antes de ejecutar la sincronización</p>
                <p>• Los datos sincronizados aparecerán inmediatamente en el dashboard</p>
                <p>• Las campañas existentes se actualizarán, las nuevas se agregarán</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel principal de sincronización */}
        <SyncPanel onSyncComplete={handleSyncComplete} />

        {/* Historial de sincronizaciones */}
        {syncHistory.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B695BF]" />
                Historial de Sincronizaciones
              </h3>
              <button
                onClick={clearHistory}
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Limpiar historial
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {syncHistory.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white capitalize">
                        {item.unidad} - {syncService.formatDate(item.periodo.from)} a {syncService.formatDate(item.periodo.to)}
                      </div>
                      <div className="text-xs text-white/60">
                        {new Date(item.fechaSync).toLocaleString('es-AR')} por {item.usuario}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">
                        {item.resultado.updatedCampaigns.length} actualizadas
                      </div>
                      <div className="text-xs text-white/60">
                        Reporte #{item.resultado.reportId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncPage;