import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Package, Plus, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DevolucionesEstadisticas from '@/components/Devoluciones/DevolucionesEstadisticas';
import DevolucionesTabla from '@/components/Devoluciones/DevolucionesTabla';
import DevolucionesFiltros from '@/components/Devoluciones/DevolucionesFiltros';
import DevolucionModal from '@/components/Devoluciones/DevolucionModal';
import DevolucionDetalle from '@/components/Devoluciones/DevolucionDetalle';
import devolucionesService from '@/services/cambios/devolucionesService';
import { 
  type DevolucionDto, 
  type CreateDevolucionDto,
  type DevolucionesFiltros as FiltrosType,
  type DevolucionesEstadisticasData as EstadisticasType,
  type EstadosDevolucion
} from '@/types/cambios/devolucionesTypes';

const DevolucionesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { role } = useAuth();

  const [devoluciones, setDevoluciones] = useState<DevolucionDto[]>([]);
  const [devolucionesFiltradas, setDevolucionesFiltradas] = useState<DevolucionDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasType | null>(null);

  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState<boolean>(false);
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState<DevolucionDto | null>(null);

  const [filtros, setFiltros] = useState<FiltrosType>({});

  const puedeEditar = role === 'admin' || role === 'superadmin';
  const puedeVer = role === 'viewer' || role === 'admin' || role === 'superadmin';

  const cargarDevoluciones = async () => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const devolucionesData = await devolucionesService.obtenerTodos();
      setDevoluciones(devolucionesData);
      
      if (devolucionesData.length === 0) {
        toast.info('No hay devoluciones registradas en el sistema');
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar devoluciones';
      setError(mensaje);
      toast.error(mensaje);
      setDevoluciones([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  const aplicarFiltros = useCallback(() => {
    const devolucionesFiltradosResult = devolucionesService.filtrarDevoluciones(devoluciones, filtros);
    setDevolucionesFiltradas(devolucionesFiltradosResult);
    
    const estadisticasCalculadas = devolucionesService.calcularEstadisticas(devolucionesFiltradosResult);
    setEstadisticas(estadisticasCalculadas);
  }, [devoluciones, filtros]);

  const handleFiltrosChange = (nuevosFiltros: FiltrosType) => {
    setFiltros(nuevosFiltros);
  };

  const handleGuardarDevolucion = async (devolucionData: DevolucionDto | CreateDevolucionDto): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para modificar devoluciones');
      return false;
    }
  
    try {
      if ('id' in devolucionData && devolucionData.id) {
        await devolucionesService.actualizar(devolucionData.id, devolucionData);
        toast.success('Devolución actualizada exitosamente');
      } else {
        await devolucionesService.crear(devolucionData as CreateDevolucionDto);
        toast.success('Devolución creada exitosamente');
      }
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar devolución';
      toast.error(mensaje);
      return false;
    }
  };

  const handleActualizarEstados = async (id: number, estados: EstadosDevolucion): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar estados');
      return false;
    }

    try {
      await devolucionesService.actualizarEstados(id, estados);
      toast.success('Estado actualizado correctamente');
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar estado';
      toast.error(mensaje);
      return false;
    }
  };

  const handleEliminarDevolucion = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar devoluciones');
      return false;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta devolución? Esta acción no se puede deshacer.')) {
      return false;
    }

    try {
      await devolucionesService.eliminar(id);
      toast.success('Devolución eliminada exitosamente');
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar devolución';
      toast.error(mensaje);
      return false;
    }
  };

  const handleNuevaDevolucion = () => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para crear devoluciones');
      return;
    }
    setDevolucionSeleccionada(null);
    setModalCrearAbierto(true);
  };

  const handleEditarModal = (devolucion: DevolucionDto) => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar devoluciones');
      return;
    }
    setDevolucionSeleccionada(devolucion);
    setModalEditarAbierto(true);
  };

  const handleVerDetalle = (devolucion: DevolucionDto) => {
    setDevolucionSeleccionada(devolucion);
    setModalDetalleAbierto(true);
  };

  const cerrarModales = () => {
    setModalCrearAbierto(false);
    setModalEditarAbierto(false);
    setModalDetalleAbierto(false);
    setDevolucionSeleccionada(null);
  };

  const recargarDatos = () => {
    cargarDevoluciones();
  };

  const volverACambios = () => {
    navigate('/cambios');
  };

  useEffect(() => {
    if (puedeVer) {
      cargarDevoluciones();
    }
  }, [puedeVer]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  if (!puedeVer) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#D94854] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-white/70 mb-4">
            No tienes permisos para acceder al módulo de devoluciones.
            Contacta con un administrador para obtener acceso.
          </p>
          <button
            onClick={volverACambios}
            className="px-4 py-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 rounded-lg text-[#B695BF] transition-all"
          >
            Volver a Cambios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Botón volver */}
            <button
              onClick={volverACambios}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Volver a Cambios"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {/* Título */}
            <div className="p-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-6 h-6 text-[#D94854]" />
                <Package className="w-6 h-6 text-[#D94854]" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                📋 Gestión de Devoluciones
              </h1>
              <p className="text-white/60 text-sm">
                Control de devoluciones de productos y seguimiento de estados
              </p>
            </div>
          </div>

          {/* Controles del header */}
          <div className="flex items-center gap-3">
            
            {/* Botón de recarga */}
            <button
              onClick={recargarDatos}
              disabled={cargandoDatos}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 transition-all disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargandoDatos ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Botón crear nueva devolución */}
            {puedeEditar && (
              <button
                onClick={handleNuevaDevolucion}
                className="flex items-center gap-2 px-6 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Devolución</span>
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <button
            onClick={volverACambios}
            className="hover:text-white transition-colors"
          >
            Cambios
          </button>
          <span>/</span>
          <span className="text-white">Devoluciones</span>
        </div>

        {/* Mensaje de permisos para viewers */}
        {!puedeEditar && (
          <div className="flex items-center gap-2 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
            <Eye className="w-5 h-5 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm">
              Estás en modo solo lectura. Solo usuarios administradores pueden crear y modificar devoluciones.
            </span>
          </div>
        )}

        {/* Filtros */}
        <DevolucionesFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          totalDevoluciones={devoluciones.length}
          devolucionesFiltradas={devolucionesFiltradas.length}
          cargando={cargandoDatos}
        />
        
        {/* Tabla principal */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <AlertCircle className="w-8 h-8 text-[#D94854] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar datos</h3>
            <p className="text-white/60 text-sm mb-4 text-center max-w-md">{error}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={recargarDatos}
                className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all"
              >
                Reintentar
              </button>
              <button
                onClick={volverACambios}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 transition-all"
              >
                Volver a Cambios
              </button>
            </div>
          </div>
        ) : (
          <DevolucionesTabla
            devoluciones={devolucionesFiltradas}
            onActualizarEstados={handleActualizarEstados}
            onEliminar={handleEliminarDevolucion}
            onVerDetalle={handleVerDetalle}
            onEditar={handleEditarModal}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
          />
        )}
        {/* Cards de estadísticas */}
        <DevolucionesEstadisticas
          estadisticas={estadisticas}
          cargando={cargandoDatos}
        />


      </div>

      {/* Modales */}
      
      {/* Modal de creación */}
      <DevolucionModal
        isOpen={modalCrearAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarDevolucion}
        devolucion={null}
        cargando={cargandoDatos}
      />

      {/* Modal de edición */}
      <DevolucionModal
        isOpen={modalEditarAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarDevolucion}
        devolucion={devolucionSeleccionada}
        cargando={cargandoDatos}
      />

      {/* Modal de detalle */}
      <DevolucionDetalle
        isOpen={modalDetalleAbierto}
        onClose={cerrarModales}
        devolucion={devolucionSeleccionada}
      />
    </div>
  );
};

export default DevolucionesPage;