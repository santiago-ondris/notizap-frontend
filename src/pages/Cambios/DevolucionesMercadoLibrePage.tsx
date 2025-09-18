import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShoppingCart, Plus, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DevolucionesMercadoLibreEstadisticas from '@/components/Devoluciones/ML/DevolucionesMercadoLibreEstadisticasComp';
import DevolucionesMercadoLibreTabla from '@/components/Devoluciones/ML/DevolucionesMercadoLibreTabla';
import DevolucionesMercadoLibreFiltros from '@/components/Devoluciones/ML//DevolucionesMercadoLibreFiltros';
import DevolucionMercadoLibreModal from '@/components/Devoluciones/ML//DevolucionMercadoLibreModal';
import devolucionesMercadoLibreService from '@/services/cambios/devolucionesMercadoLibreService';
import { 
  type DevolucionMercadoLibreDto, 
  type CreateDevolucionMercadoLibreDto,
  type DevolucionesMercadoLibreFiltros as FiltrosType,
  type DevolucionesMercadoLibreEstadisticas as EstadisticasType
} from '@/types/cambios/devolucionesMercadoLibreTypes';
import { paginarArray, calcularTotalPaginas } from '@/utils/paginacion';

const DevolucionesMercadoLibrePage: React.FC = () => {
  const navigate = useNavigate();
  
  const { role } = useAuth();

  const [devoluciones, setDevoluciones] = useState<DevolucionMercadoLibreDto[]>([]);
  const [devolucionesFiltradas, setDevolucionesFiltradas] = useState<DevolucionMercadoLibreDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasType | null>(null);

  const [paginaActual, setPaginaActual] = useState<number>(1);
  const ELEMENTOS_POR_PAGINA = 15;

  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [devolucionSeleccionada, setDevolucionSeleccionada] = useState<DevolucionMercadoLibreDto | null>(null);

  const [filtros, setFiltros] = useState<FiltrosType>({});

  const puedeEditar = role === 'admin' || role === 'superadmin';
  const puedeVer = role === 'viewer' || role === 'admin' || role === 'superadmin';

  const cargarDevoluciones = async () => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const devolucionesData = await devolucionesMercadoLibreService.obtenerTodos();
      setDevoluciones(devolucionesData);
      
      if (devolucionesData.length === 0) {
        toast.info('No hay devoluciones de MercadoLibre registradas en el sistema');
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar devoluciones de MercadoLibre';
      setError(mensaje);
      toast.error(mensaje);
      setDevoluciones([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  const aplicarFiltros = useCallback(() => {
    const devolucionesFiltradosResult = devolucionesMercadoLibreService.filtrarDevoluciones(devoluciones, filtros);
    
    const totalPaginas = calcularTotalPaginas(devolucionesFiltradosResult.length, ELEMENTOS_POR_PAGINA);
    
    if (paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginaActual(1);
    }
    
    const devolucionesPaginadas = paginarArray(devolucionesFiltradosResult, paginaActual, ELEMENTOS_POR_PAGINA);
    
    setDevolucionesFiltradas(devolucionesPaginadas);
    
    const estadisticasCalculadas = devolucionesMercadoLibreService.calcularEstadisticas(devolucionesFiltradosResult);
    setEstadisticas(estadisticasCalculadas);
  }, [devoluciones, filtros, paginaActual]);

  const handleFiltrosChange = (nuevosFiltros: FiltrosType) => {
    setFiltros(nuevosFiltros);
    setPaginaActual(1); 
  };

  const handleCambioPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
  };

  const handleGuardarDevolucion = async (devolucionData: DevolucionMercadoLibreDto | CreateDevolucionMercadoLibreDto): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para modificar devoluciones de MercadoLibre');
      return false;
    }
  
    try {
      if ('id' in devolucionData && devolucionData.id) {
        await devolucionesMercadoLibreService.actualizar(devolucionData.id, devolucionData);
        toast.success('Devolución ML actualizada exitosamente');
      } else {
        await devolucionesMercadoLibreService.crear(devolucionData as CreateDevolucionMercadoLibreDto);
        toast.success('Devolución ML creada exitosamente');
      }
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar devolución de MercadoLibre';
      toast.error(mensaje);
      return false;
    }
  };

  const handleActualizarNotaCredito = async (id: number, notaCreditoEmitida: boolean): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar notas de crédito');
      return false;
    }

    try {
      await devolucionesMercadoLibreService.actualizarNotaCredito(id, notaCreditoEmitida);
      toast.success(`Nota de crédito ${notaCreditoEmitida ? 'marcada como emitida' : 'marcada como pendiente'}`);
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar nota de crédito';
      toast.error(mensaje);
      return false;
    }
  };

  const handleActualizarTrasladado = async (id: number, trasladado: boolean): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar el estado de trasladado');
      return false;
    }
  
    try {
      await devolucionesMercadoLibreService.actualizarTrasladado(id, trasladado);
      toast.success(`${trasladado ? 'Marcado como trasladado' : 'Marcado como no trasladado'}`);
      
      // Recargar datos
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar estado de trasladado';
      toast.error(mensaje);
      return false;
    }
  };

  const handleEliminarDevolucion = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar devoluciones de MercadoLibre');
      return false;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta devolución de MercadoLibre? Esta acción no se puede deshacer.')) {
      return false;
    }

    try {
      await devolucionesMercadoLibreService.eliminar(id);
      toast.success('Devolución ML eliminada exitosamente');
      
      await cargarDevoluciones();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar devolución de MercadoLibre';
      toast.error(mensaje);
      return false;
    }
  };

  const handleNuevaDevolucion = () => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para crear devoluciones de MercadoLibre');
      return;
    }
    setDevolucionSeleccionada(null);
    setModalCrearAbierto(true);
  };

  const handleEditarModal = (devolucion: DevolucionMercadoLibreDto) => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar devoluciones de MercadoLibre');
      return;
    }
    setDevolucionSeleccionada(devolucion);
    setModalEditarAbierto(true);
  };


  const handleVerDetalle = (devolucion: DevolucionMercadoLibreDto) => {
    const info = [
      `📅 Fecha: ${devolucionesMercadoLibreService.formatearFecha(devolucion.fecha)}`,
      `👤 Cliente: ${devolucion.cliente}`,
      `📦 Modelo: ${devolucion.modelo}`,
      `🛒 Pedido: ${devolucion.pedido}`,
      `🧾 Nota de Crédito: ${devolucionesMercadoLibreService.obtenerTextoNotaCredito(devolucion.notaCreditoEmitida)}`
    ].join('\n');
    
    toast.info(info, {
      autoClose: 5000,
      style: { whiteSpace: 'pre-line' }
    });
  };


  const cerrarModales = () => {
    setModalCrearAbierto(false);
    setModalEditarAbierto(false);
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
            No tienes permisos para acceder al módulo de devoluciones de MercadoLibre.
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
            <div className="p-2 bg-[#B695BF]/20 border border-[#B695BF]/30 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-[#B695BF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                🛒 Devoluciones MercadoLibre
              </h1>
              <p className="text-white/60 text-sm">
                Gestión de devoluciones y notas de crédito de MercadoLibre
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
                className="flex items-center gap-2 px-6 py-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 rounded-lg text-[#B695BF] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Devolución ML</span>
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
          <span className="text-white">MercadoLibre</span>
        </div>

        {/* Mensaje de permisos para viewers */}
        {!puedeEditar && (
          <div className="flex items-center gap-2 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
            <Eye className="w-5 h-5 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm">
              Estás en modo solo lectura. Solo usuarios administradores pueden crear y modificar devoluciones de MercadoLibre.
            </span>
          </div>
        )}

        {/* Filtros */}
        <DevolucionesMercadoLibreFiltros
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
          <DevolucionesMercadoLibreTabla
            devoluciones={devolucionesFiltradas}
            onActualizarNotaCredito={handleActualizarNotaCredito}
            onActualizarTrasladado={handleActualizarTrasladado}
            onEliminar={handleEliminarDevolucion}
            onVerDetalle={handleVerDetalle}
            onEditar={handleEditarModal}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
            paginaActual={paginaActual}
            totalPaginas={calcularTotalPaginas(
              devolucionesMercadoLibreService.filtrarDevoluciones(devoluciones, filtros).length, 
              ELEMENTOS_POR_PAGINA
            )}
            totalElementos={devolucionesMercadoLibreService.filtrarDevoluciones(devoluciones, filtros).length}
            onCambioPagina={handleCambioPagina}
          />
        )}

        {/* Cards de estadísticas */}
        <DevolucionesMercadoLibreEstadisticas
          estadisticas={estadisticas}
          cargando={cargandoDatos}
        />

      </div>

      {/* Modales */}
      
      {/* Modal de creación */}
      <DevolucionMercadoLibreModal
        isOpen={modalCrearAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarDevolucion}
        devolucion={null}
        cargando={cargandoDatos}
      />

      {/* Modal de edición */}
      <DevolucionMercadoLibreModal
        isOpen={modalEditarAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarDevolucion}
        devolucion={devolucionSeleccionada}
        cargando={cargandoDatos}
      />
    </div>
  );
};

export default DevolucionesMercadoLibrePage;