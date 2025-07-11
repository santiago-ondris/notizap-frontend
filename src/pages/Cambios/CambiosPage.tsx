import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Plus, RefreshCw, AlertCircle, Eye, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import CambiosEstadisticas from '@/components/Cambios/CambiosEstadisticas';
import CambiosTabla from '@/components/Cambios/CambiosTabla';
import CambiosFiltros from '@/components/Cambios/CambiosFiltros';
import CambioModal from '@/components/Cambios/CambioModal';
import cambiosService from '@/services/cambios/cambiosService';
import { 
  type CambioSimpleDto, 
  type CreateCambioSimpleDto,
  type CambiosFiltros as FiltrosType,
  type CambiosEstadisticasData as EstadisticasType,
  type EstadosCambio
} from '@/types/cambios/cambiosTypes';
import { useNavigate } from 'react-router';

const CambiosPage: React.FC = () => {
  // Context de autenticación
  const { role } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [cambios, setCambios] = useState<CambioSimpleDto[]>([]);
  const [cambiosFiltrados, setCambiosFiltrados] = useState<CambioSimpleDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasType | null>(null);

  // Estados de UI
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [cambioSeleccionado, setCambioSeleccionado] = useState<CambioSimpleDto | null>(null);

  // Estados de filtros
  const [filtros, setFiltros] = useState<FiltrosType>({});

  // Verificar permisos
  const puedeEditar = role === 'admin' || role === 'superadmin';
  const puedeVer = role === 'viewer' || role === 'admin' || role === 'superadmin';

  /**
   * Cargar todos los cambios desde la API
   */
  const cargarCambios = async () => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const cambiosData = await cambiosService.obtenerTodos();
      setCambios(cambiosData);
      
      // Mostrar mensaje si no hay datos
      if (cambiosData.length === 0) {
        toast.info('No hay cambios registrados en el sistema');
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar cambios';
      setError(mensaje);
      toast.error(mensaje);
      setCambios([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  /**
   * Aplicar filtros a los cambios
   */
  const aplicarFiltros = useCallback(() => {
    const cambiosFiltradosResult = cambiosService.filtrarCambios(cambios, filtros);
    setCambiosFiltrados(cambiosFiltradosResult);
    
    // Calcular estadísticas solo de los cambios filtrados
    const estadisticasCalculadas = cambiosService.calcularEstadisticas(cambiosFiltradosResult);
    setEstadisticas(estadisticasCalculadas);
  }, [cambios, filtros]);

  /**
   * Manejar cambio de filtros
   */
  const handleFiltrosChange = (nuevosFiltros: FiltrosType) => {
    setFiltros(nuevosFiltros);
  };

  const handleActualizarEnvio = async (id: number, envio: string): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar envío');
      return false;
    }
  
    try {
      await cambiosService.actualizarEnvio(id, envio);
      toast.success('Envío actualizado correctamente');
      await cargarCambios(); // Recargar datos
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar envío';
      toast.error(mensaje);
      return false;
    }
  };

  const handleGuardarCambio = async (cambioData: CambioSimpleDto | CreateCambioSimpleDto): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para modificar cambios');
      return false;
    }
  
    try {
      // Verificar si es edición (tiene id) o creación
      if ('id' in cambioData && cambioData.id) {
        // Es edición
        await cambiosService.actualizar(cambioData.id, cambioData);
        toast.success('Cambio actualizado exitosamente');
      } else {
        // Es creación
        await cambiosService.crear(cambioData as CreateCambioSimpleDto);
        toast.success('Cambio creado exitosamente');
      }
      
      // Recargar datos
      await cargarCambios();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar cambio';
      toast.error(mensaje);
      return false;
    }
  };

  /**
   * Manejar actualización de estados (checkboxes inline)
   */
  const handleActualizarEstados = async (id: number, estados: EstadosCambio): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar estados');
      return false;
    }

    try {
      await cambiosService.actualizarEstados(id, estados);
      toast.success('Estado actualizado correctamente');
      
      // Recargar datos
      await cargarCambios();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar estado';
      toast.error(mensaje);
      return false;
    }
  };

  /**
   * Manejar eliminación de un cambio
   */
  const handleEliminarCambio = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar cambios');
      return false;
    }

    // Confirmación antes de eliminar
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cambio? Esta acción no se puede deshacer.')) {
      return false;
    }

    try {
      await cambiosService.eliminar(id);
      toast.success('Cambio eliminado exitosamente');
      
      // Recargar datos
      await cargarCambios();
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar cambio';
      toast.error(mensaje);
      return false;
    }
  };

  const handleActualizarEtiqueta = async (id: number, etiqueta: string, etiquetaDespachada: boolean): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar etiquetas');
      return false;
    }

    try {
      await cambiosService.actualizarEtiqueta(id, etiqueta, etiquetaDespachada);
      toast.success('Etiqueta actualizada correctamente');
      await cargarCambios();
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar etiqueta';
      toast.error(mensaje);
      return false;
    }
  };

  /**
   * Manejar apertura del modal de creación
   */
  const handleNuevoCambio = () => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para crear cambios');
      return;
    }
    setCambioSeleccionado(null);
    setModalCrearAbierto(true);
  };

  /**
   * Manejar apertura del modal de edición
   */
  const handleEditarModal = (cambio: CambioSimpleDto) => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar cambios');
      return;
    }
    setCambioSeleccionado(cambio);
    setModalEditarAbierto(true);
  };

  /**
   * Cerrar todos los modales
   */
  const cerrarModales = () => {
    setModalCrearAbierto(false);
    setModalEditarAbierto(false);
    setCambioSeleccionado(null);
  };

  /**
   * Recargar todos los datos
   */
  const recargarDatos = () => {
    cargarCambios();
  };

  // Effect para cargar datos al montar el componente
  useEffect(() => {
    if (puedeVer) {
      cargarCambios();
    }
  }, [puedeVer]);

  // Effect para aplicar filtros cuando cambian los datos o filtros
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  // Verificar permisos de acceso
  if (!puedeVer) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center p-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-[#D94854] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Acceso Denegado
          </h2>
          <p className="text-white/70">
            No tienes permisos para acceder al módulo de cambios.
            Contacta con un administrador para obtener acceso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-none xl:max-w-screen-2xl mx-auto space-y-6 px-4">
        
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
            <ArrowRightLeft className="w-6 h-6 text-[#D94854]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              🔄 Gestión de Cambios
            </h1>
            <p className="text-white/60 text-sm">
              Control de cambios de productos y seguimiento de estados
            </p>
          </div>
        </div>

      {/* Controles del header */}
      <div className="flex items-center gap-3">
        
        {/* Botón Ver Devoluciones */}
        <button
          onClick={() => navigate('/cambios/devoluciones')}
          className="flex items-center gap-2 px-4 py-2 bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 rounded-lg text-[#B695BF] transition-all"
          title="Ver módulo de devoluciones"
        >
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Devoluciones</span>
        </button>

        {/* Botón Ver DevolucionesML */}
        <button
          onClick={() => navigate('/cambios/devolucionesML')}
          className="flex items-center gap-2 px-4 py-2 bg-[#000000]/10 hover:bg-[#0033A0]/20 border border-[#0033A0]/30 rounded-lg text-[#FFE600] transition-all"
          title="Ver devoluciones ML"
        >
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Devoluciones ML</span>
        </button>
        
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

        {/* Botón crear nuevo cambio */}
        {puedeEditar && (
          <button
            onClick={handleNuevoCambio}
            className="flex items-center gap-2 px-6 py-2 bg-[#D94854]/20 hover:bg-[#51590E]/30 border border-[white]/30 rounded-lg text-[white] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cambio</span>
          </button>
        )}
      </div>
    </div>

        {/* Mensaje de permisos para viewers */}
        {!puedeEditar && (
          <div className="flex items-center gap-2 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
            <Eye className="w-5 h-5 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm">
              Estás en modo solo lectura. Solo usuarios administradores pueden crear y modificar cambios.
            </span>
          </div>
        )}

        {/* Filtros */}
        <CambiosFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          totalCambios={cambios.length}
          cambiosFiltrados={cambiosFiltrados.length}
          cargando={cargandoDatos}
        />

        {/* Tabla principal */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <AlertCircle className="w-8 h-8 text-[#D94854] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar datos</h3>
            <p className="text-white/60 text-sm mb-4 text-center max-w-md">{error}</p>
            <button
              onClick={recargarDatos}
              className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <CambiosTabla
            cambios={cambiosFiltrados}
            onActualizarEstados={handleActualizarEstados}
            onEliminar={handleEliminarCambio}
            onEditar={handleEditarModal}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
            onActualizarEnvio={handleActualizarEnvio}
            onActualizarEtiqueta={handleActualizarEtiqueta}
          />
        )}
        {/* Cards de estadísticas */}
        <CambiosEstadisticas
          estadisticas={estadisticas}
          cargando={cargandoDatos}
        />


      </div>

      {/* Modales */}
      
      {/* Modal de creación */}
      <CambioModal
        isOpen={modalCrearAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarCambio}
        cambio={null}
        cargando={cargandoDatos}
      />

      {/* Modal de edición */}
      <CambioModal
        isOpen={modalEditarAbierto}
        onClose={cerrarModales}
        onSave={handleGuardarCambio}
        cambio={cambioSeleccionado}
        cargando={cargandoDatos}
      />
    </div>
  );
};

export default CambiosPage;