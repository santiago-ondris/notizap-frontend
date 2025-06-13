import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  List, 
  BarChart3, 
  Calendar, 
  TrendingUp,
  Repeat,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import { GastoStats } from '@/components/Gastos/GastoStats';
import { GastoCard } from '@/components/Gastos/GastoCard';
import { GastoForm } from '@/components/Gastos/GastoForm';

// Types & Services
import type { 
  Gasto, 
  CreateGastoDto, 
  UpdateGastoDto, 
  GastoResumen,
  GastoPorCategoria 
} from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';


interface GastosPageProps {
  // Props desde el parent
}

export const GastosPage: React.FC<GastosPageProps> = () => {
  
  // Estados principales
  const [resumenMensual, setResumenMensual] = useState<GastoResumen | null>(null);
  const [gastosRecientes, setGastosRecientes] = useState<Gasto[]>([]);
  const [gastosRecurrentes, setGastosRecurrentes] = useState<Gasto[]>([]);
  const [, setTopGastos] = useState<Gasto[]>([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState<GastoPorCategoria[]>([]);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [gastoParaEditar, setGastoParaEditar] = useState<Gasto | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Usuario actual (ajustar según tu implementación de auth)
  // const { user } = useAuth();
  const userRole = 'admin'; // Hardcodeado por ahora, cambiar por user?.role

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos del dashboard
  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Ejecutar todas las llamadas en paralelo
      const [
        resumen,
        recientes,
        recurrentes,
        top,
        categorias
      ] = await Promise.all([
        GastoService.obtenerResumenMesActual(),
        GastoService.obtenerGastosMesActual(),
        GastoService.obtenerGastosRecurrentes(),
        GastoService.obtenerTopGastos(5),
        GastoService.obtenerGastosPorCategoria()
      ]);

      setResumenMensual(resumen);
      setGastosRecientes(recientes.slice(0, 6)); // Solo los 6 más recientes
      setGastosRecurrentes(recurrentes.slice(0, 4)); // Solo los 4 más importantes
      setTopGastos(top);
      setGastosPorCategoria(categorias.slice(0, 5)); // Top 5 categorías

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para refrescar datos
  const refrescarDatos = async () => {
    try {
      setIsRefreshing(true);
      await cargarDatos();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manejar creación de gasto
  const handleCrearGasto = async (gastoData: CreateGastoDto) => {
    try {
      setIsSubmitting(true);
      await GastoService.crear(gastoData);
      
      toast.success('✅ Gasto creado correctamente');
      setShowForm(false);
      await cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error('Error al crear gasto:', error);
      toast.error('Error al crear el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar edición de gasto
  const handleEditarGasto = async (gastoData: UpdateGastoDto) => {
    if (!gastoParaEditar) return;

    try {
      setIsSubmitting(true);
      await GastoService.actualizar(gastoParaEditar.id, gastoData);
      
      toast.success('✅ Gasto actualizado correctamente');
      setShowForm(false);
      setGastoParaEditar(undefined);
      await cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      toast.error('Error al actualizar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar eliminación de gasto
  const handleEliminarGasto = async (id: number) => {
    try {
      await GastoService.eliminar(id);
      
      toast.success('🗑️ Gasto eliminado correctamente');
      await cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  // Abrir formulario para editar
  const abrirFormularioEdicion = (gasto: Gasto) => {
    setGastoParaEditar(gasto);
    setShowForm(true);
  };

  // Cerrar formulario
  const cerrarFormulario = () => {
    setShowForm(false);
    setGastoParaEditar(undefined);
  };

  // Función para manejar envío del formulario
  const handleSubmitForm = async (gastoData: CreateGastoDto | UpdateGastoDto) => {
    if (gastoParaEditar) {
      await handleEditarGasto(gastoData as UpdateGastoDto);
    } else {
      await handleCrearGasto(gastoData as CreateGastoDto);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">💰 Dashboard de Gastos</h1>
            <p className="text-white/70">
              Gestiona y visualiza todos los gastos del equipo de e-commerce
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón de refrescar */}
            <button
              onClick={refrescarDatos}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            {/* Navegación rápida */}
            <Link
              to="/gastos/lista"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl transition-colors"
            >
              <List className="w-4 h-4" />
              Ver Lista
            </Link>

            <Link
              to="/gastos/analisis"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-xl transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Análisis
            </Link>

            {/* Botón crear gasto (solo para admin/superadmin) */}
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Nuevo Gasto
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas principales */}
        {resumenMensual && (
          <GastoStats 
            resumen={resumenMensual} 
            isLoading={isLoading} 
          />
        )}

        {/* Sección de gastos recientes y recurrentes */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Gastos recientes del mes */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">📅 Gastos Recientes</h2>
                  <p className="text-sm text-white/60">Últimos gastos de este mes</p>
                </div>
              </div>
              
              <Link
                to="/gastos/lista"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-white/20 rounded mb-3" />
                    <div className="h-6 bg-white/20 rounded mb-2" />
                    <div className="h-3 bg-white/20 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : gastosRecientes.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-medium text-white mb-2">No hay gastos este mes</h3>
                <p className="text-white/60 mb-4">Comienza registrando tu primer gasto</p>
                {(userRole === 'admin' || userRole === 'superadmin') && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primer Gasto
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gastosRecientes.map(gasto => (
                  <GastoCard
                    key={gasto.id}
                    gasto={gasto}
                    onEdit={abrirFormularioEdicion}
                    onDelete={handleEliminarGasto}
                    userRole={userRole}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar con información adicional */}
          <div className="space-y-6">
            
            {/* Gastos recurrentes */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <Repeat className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">🔄 Gastos Recurrentes</h3>
                  <p className="text-sm text-white/60">Gastos que se repiten</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 animate-pulse">
                      <div className="h-4 bg-white/20 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : gastosRecurrentes.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🔄</div>
                  <p className="text-sm text-white/60">No hay gastos recurrentes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gastosRecurrentes.map(gasto => (
                    <div key={gasto.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/15 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white truncate">{gasto.nombre}</h4>
                        <span className="text-green-400 font-semibold text-sm">
                          {GastoService.formatearMonto(gasto.monto)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 px-2 py-1 rounded">
                          {gasto.frecuenciaRecurrencia}
                        </span>
                        <span className="text-xs text-white/60">
                          {gasto.categoria}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top categorías */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">🏷️ Top Categorías</h3>
                  <p className="text-sm text-white/60">Más gastadas este período</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 animate-pulse">
                      <div className="h-4 bg-white/20 rounded mb-2" />
                      <div className="h-3 bg-white/20 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : gastosPorCategoria.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🏷️</div>
                  <p className="text-sm text-white/60">No hay categorías</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gastosPorCategoria.map((categoria) => (
                    <div key={categoria.categoria} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{categoria.categoria}</h4>
                        <span className="text-purple-400 font-semibold text-sm">
                          {categoria.porcentaje.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">
                          {GastoService.formatearMonto(categoria.totalMonto)}
                        </span>
                        <span className="text-xs text-white/50">
                          {categoria.cantidadGastos} gasto{categoria.cantidadGastos !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Formulario modal */}
        <GastoForm
          gasto={gastoParaEditar}
          isOpen={showForm}
          onClose={cerrarFormulario}
          onSubmit={handleSubmitForm}
          isLoading={isSubmitting}
        />

      </div>
    </div>
  );
};