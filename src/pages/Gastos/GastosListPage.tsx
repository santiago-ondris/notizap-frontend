import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  BarChart3, 
  Home, 
  Download, 
  Grid3X3,
  List as ListIcon,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

// Components
import { GastoTable } from '@/components/Gastos/GastoTable';
import { GastoFilters } from '@/components/Gastos/GastoFilters';
import { GastoForm } from '@/components/Gastos/GastoForm';
import { GastoCard } from '@/components/Gastos/GastoCard';

// Types & Services
import type { 
  Gasto, 
  GastoFiltros,
  GastoResponse,
  CreateGastoDto, 
  UpdateGastoDto 
} from '../../types/gastos';
import { GastoService } from '../../services/gastos/gastoService';

interface GastosListPageProps {
  // Props si las necesitas
}

export const GastosListPage: React.FC<GastosListPageProps> = () => {
  
  // Estados principales
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categorias, setCategorias] = useState<string[]>([]);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState<GastoFiltros>({
    ordenarPor: 'Fecha',
    descendente: true,
    pagina: 1,
    tamañoPagina: 20
  });

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [gastoParaEditar, setGastoParaEditar] = useState<Gasto | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vistaActual, setVistaActual] = useState<'tabla' | 'tarjetas'>('tabla');

  // Usuario actual (ajustar según tu implementación de auth)
  const userRole = 'admin'; // Hardcodeado por ahora, cambiar por user?.role

  // Cargar gastos con filtros (debounced)
  const cargarGastos = useCallback(async (filtrosActuales: GastoFiltros) => {
    try {
      setIsLoading(true);

      const response: GastoResponse = await GastoService.obtenerConFiltros(filtrosActuales);
      
      setGastos(response.gastos);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);

    } catch (error) {
      console.error('Error al cargar gastos:', error);
      toast.error('Error al cargar la lista de gastos');
      
      // Reset en caso de error
      setGastos([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar categorías disponibles
  const cargarCategorias = useCallback(async () => {
    try {
      const categoriasDisponibles = await GastoService.obtenerCategorias();
      setCategorias(categoriasDisponibles);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarCategorias();
    cargarGastos(filtros);
  }, []);

  // Efecto para recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarGastos(filtros);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [filtros, cargarGastos]);

  // Manejar cambio de filtros
  const handleFiltrosChange = (nuevosFiltros: GastoFiltros) => {
    setFiltros(nuevosFiltros);
  };

  // Refrescar datos
  const refrescarDatos = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        cargarCategorias(),
        cargarGastos(filtros)
      ]);
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
      
      // Recargar datos y categorías
      await Promise.all([
        cargarCategorias(),
        cargarGastos(filtros)
      ]);
      
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
      
      // Recargar datos
      await cargarGastos(filtros);
      
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
      
      // Recargar datos y ajustar página si es necesario
      const nuevaPage = gastos.length === 1 && filtros.pagina! > 1 
        ? filtros.pagina! - 1 
        : filtros.pagina;
        
      await cargarGastos({ ...filtros, pagina: nuevaPage });
      
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

  // Exportar datos (función básica, se puede mejorar)
  const exportarDatos = () => {
    // Implementar exportación a CSV/Excel
    toast.info('Funcionalidad de exportación próximamente');
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
              <Link to="/gastos" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>•</span>
              <span>Lista de Gastos</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">📋 Lista de Gastos</h1>
            <p className="text-white/70">
              Gestiona y filtra todos los gastos del equipo
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Cambiar vista */}
            <div className="flex items-center bg-white/10 border border-white/20 rounded-lg p-1">
              <button
                onClick={() => setVistaActual('tabla')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  vistaActual === 'tabla' 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <ListIcon className="w-4 h-4" />
                Tabla
              </button>
              <button
                onClick={() => setVistaActual('tarjetas')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${
                  vistaActual === 'tarjetas' 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Tarjetas
              </button>
            </div>

            {/* Botón de refrescar */}
            <button
              onClick={refrescarDatos}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            {/* Exportar */}
            <button
              onClick={exportarDatos}
              disabled={isLoading || gastos.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {/* Navegación */}
            <Link
              to="/gastos"
              className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 rounded-xl transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
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

        {/* Filtros */}
        <GastoFilters
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          categorias={categorias}
          isLoading={isLoading}
          totalResultados={totalCount}
        />

        {/* Resumen rápido */}
        {!isLoading && gastos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {GastoService.formatearMonto(
                  gastos.reduce((acc, gasto) => acc + gasto.monto, 0)
                )}
              </div>
              <div className="text-sm text-white/60">Total Mostrado</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{totalCount}</div>
              <div className="text-sm text-white/60">Total Gastos</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {gastos.length > 0 ? GastoService.formatearMonto(
                  gastos.reduce((acc, gasto) => acc + gasto.monto, 0) / gastos.length
                ) : '$0'}
              </div>
              <div className="text-sm text-white/60">Promedio</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {gastos.filter(g => g.esImportante).length}
              </div>
              <div className="text-sm text-white/60">Importantes</div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {vistaActual === 'tabla' ? (
          /* Vista de tabla */
          <GastoTable
            gastos={gastos}
            totalCount={totalCount}
            totalPages={totalPages}
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            onEdit={abrirFormularioEdicion}
            onDelete={handleEliminarGasto}
            isLoading={isLoading}
            userRole={userRole}
          />
        ) : (
          /* Vista de tarjetas */
          <div className="space-y-6">
            {/* Header de vista tarjetas */}
            <div className="flex items-center justify-between">
              <div className="text-white/80">
                Mostrando {gastos.length} de {totalCount} gastos
              </div>
              
              {/* Paginación simple para vista tarjetas */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFiltrosChange({ ...filtros, pagina: Math.max(1, (filtros.pagina || 1) - 1) })}
                    disabled={filtros.pagina === 1}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  
                  <span className="px-3 py-2 text-white/80">
                    Página {filtros.pagina} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handleFiltrosChange({ ...filtros, pagina: Math.min(totalPages, (filtros.pagina || 1) + 1) })}
                    disabled={filtros.pagina === totalPages}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>

            {/* Grid de tarjetas */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-white/20 rounded mb-4" />
                    <div className="h-6 bg-white/20 rounded mb-3" />
                    <div className="h-4 bg-white/20 rounded mb-2" />
                    <div className="h-3 bg-white/20 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : gastos.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">No se encontraron gastos</h3>
                <p className="text-white/60 mb-6">
                  Intenta ajustar los filtros de búsqueda o crear un nuevo gasto
                </p>
                {(userRole === 'admin' || userRole === 'superadmin') && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Primer Gasto
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {gastos.map(gasto => (
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
        )}

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