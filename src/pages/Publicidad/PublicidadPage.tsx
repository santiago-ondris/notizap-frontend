import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  PlusCircle, 
  FileText, 
  Zap as SyncIcon, 
  Target,
  Eye,
  Zap,
  AlertCircle,
  ArrowRight,
  Settings
} from 'lucide-react';

const PublicidadPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  
  // Permisos
  const canView = ['viewer', 'admin', 'superadmin'].includes(role || '');
  const canManage = ['admin', 'superadmin'].includes(role || '');
  const canSync = role === 'superadmin';

  // Navegación
  const handleNavigate = (path: string) => {
    navigate(`/publicidad${path}`);
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#212026] via-[#1a1d22] to-[#2a1f2b]">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
          <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
              <p className="text-white/70 mb-6">
                No tienes permisos para acceder al módulo de publicidad.
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Volver al inicio
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
        {/* Header Principal */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#D94854]/20 border border-[#D94854]/30">
              <Target className="w-10 h-10 text-[#D94854]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">📊 Módulo de Publicidad</h1>
              <p className="text-white/70 text-lg">
                Centro de control para campañas publicitarias
              </p>
            </div>
          </div>
        </div>

        {/* Grid Principal - 4 Cards del mismo tamaño */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Dashboard - Análisis y métricas */}
          <div 
            onClick={() => handleNavigate('/dashboard')}
            className="group cursor-pointer bg-gradient-to-br from-[#D94854]/20 to-[#D94854]/10 backdrop-blur-sm border border-[#D94854]/30 rounded-2xl p-6 hover:from-[#D94854]/30 hover:to-[#D94854]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#D94854]/30 border border-[#D94854]/40">
                <BarChart3 className="w-8 h-8 text-[#D94854]" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Dashboard Analytics</h3>
            <p className="text-white/70 mb-4">Vista completa de métricas y estadísticas</p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Eye className="w-4 h-4 text-[#D94854]" />
                <span>Análisis ejecutivo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BarChart3 className="w-4 h-4 text-[#D94854]" />
                <span>ROI y rendimiento</span>
              </div>
            </div>
          </div>

          {/* Gestión de Campañas */}
          {canManage && (
            <div 
              onClick={() => handleNavigate('/campanas')}
              className="group cursor-pointer bg-gradient-to-br from-[#B695BF]/20 to-[#B695BF]/10 backdrop-blur-sm border border-[#B695BF]/30 rounded-2xl p-6 hover:from-[#B695BF]/30 hover:to-[#B695BF]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#B695BF]/30 border border-[#B695BF]/40">
                  <Target className="w-8 h-8 text-[#B695BF]" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Gestión de Campañas</h3>
              <p className="text-white/70 mb-4">Administra todas las campañas activas</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Settings className="w-4 h-4 text-[#B695BF]" />
                  <span>Configurar campañas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Eye className="w-4 h-4 text-[#B695BF]" />
                  <span>Monitoreo en tiempo real</span>
                </div>
              </div>
            </div>
          )}

          {/* Reportes Manuales */}
          {canManage && (
            <div 
              onClick={() => handleNavigate('/reportes')}
              className="group cursor-pointer bg-gradient-to-br from-[#e327c4]/20 to-[#e327c4]/10 backdrop-blur-sm border border-[#e327c4]/30 rounded-2xl p-6 hover:from-[#e327c4]/30 hover:to-[#e327c4]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#e327c4]/30 border border-[#e327c4]/40">
                  <FileText className="w-8 h-8 text-[#e327c4]" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Reportes Manuales</h3>
              <p className="text-white/70 mb-4">Gestión de campañas manuales</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <PlusCircle className="w-4 h-4 text-[#e327c4]" />
                  <span>Crear y editar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Eye className="w-4 h-4 text-[#e327c4]" />
                  <span>Ver histórico</span>
                </div>
              </div>
            </div>
          )}

          {/* Sincronización Meta API */}
          {canSync && (
            <div 
              onClick={() => handleNavigate('/sync')}
              className="group cursor-pointer bg-gradient-to-br from-[#51590E]/20 to-[#51590E]/10 backdrop-blur-sm border border-[#51590E]/30 rounded-2xl p-6 hover:from-[#51590E]/30 hover:to-[#51590E]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#51590E]/30 border border-[#51590E]/40">
                  <SyncIcon className="w-8 h-8 text-[#51590E]" />
                </div>
                <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Sync Meta API</h3>
              <p className="text-white/70 mb-4">Importar datos automáticamente</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Zap className="w-4 h-4 text-[#51590E]" />
                  <span>Auto-sync</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Eye className="w-4 h-4 text-[#51590E]" />
                  <span>Preview y validación</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicidadPage;