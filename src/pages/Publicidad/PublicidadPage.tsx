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
} from 'lucide-react';

const PublicidadPageImproved = () => {
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

        {/* Sección Principal - Grid optimizado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Dashboard - Más prominente */}
          <div 
            onClick={() => handleNavigate('/dashboard')}
            className="lg:col-span-5 group cursor-pointer bg-gradient-to-br from-[#D94854]/20 to-[#D94854]/10 backdrop-blur-sm border border-[#D94854]/30 rounded-2xl p-6 hover:from-[#D94854]/30 hover:to-[#D94854]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-[#D94854]/30 border border-[#D94854]/40">
                <BarChart3 className="w-8 h-8 text-[#D94854]" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Estadisticas de publicidad</h3>
            <p className="text-white/70 mb-4">Vista completa de datos</p>
            
          </div>

          {/* Reportes Manuales */}
          {canManage && (
            <div 
              onClick={() => handleNavigate('/reportes')}
              className="lg:col-span-4 group cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#B695BF]/20 border border-[#B695BF]/30">
                  <FileText className="w-6 h-6 text-[#B695BF]" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Reportes Manuales</h3>
              <p className="text-white/60 text-sm mb-4">Gestión de campañas manuales</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">📝 Crear y editar</span>
                  <PlusCircle className="w-3 h-3 text-[#B695BF]" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">📊 Ver métricas</span>
                  <Eye className="w-3 h-3 text-[#B695BF]" />
                </div>
              </div>
            </div>
          )}

          {/* Sincronización */}
          {canSync && (
            <div 
              onClick={() => handleNavigate('/sync')}
              className="lg:col-span-3 group cursor-pointer bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#51590E]/20 border border-[#51590E]/30">
                  <SyncIcon className="w-6 h-6 text-[#51590E]" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">Sync Meta API</h3>
              <p className="text-white/60 text-xs mb-3">Importar datos</p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Zap className="w-3 h-3 text-[#51590E]" />
                  <span>Auto-sync</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/70">
                  <Eye className="w-3 h-3 text-[#51590E]" />
                  <span>Preview</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicidadPageImproved;