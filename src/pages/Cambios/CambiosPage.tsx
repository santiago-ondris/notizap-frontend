import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Plus, RefreshCw, AlertCircle, Eye, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import CambiosEstadisticas from '@/components/Cambios/CambiosEstadisticas';
import CambiosTabla from '@/components/Cambios/CambiosTabla';
import CambiosFiltros from '@/components/Cambios/CambiosFiltros';
import CambioModal from '@/components/Cambios/CambioModal';
import SelectorMeses from '@/components/Cambios/SelectorMeses';
import Paginacion from '@/components/ui/Paginacion';
import cambiosService from '@/services/cambios/cambiosService';
import { 
  type CambioSimpleDto, 
  type CreateCambioSimpleDto,
  type CambiosFiltros as FiltrosType,
  type CambiosEstadisticasData as EstadisticasType,
  type EstadosCambio,
  MesesUtils
} from '@/types/cambios/cambiosTypes';
import { useNavigate } from 'react-router';

const CambiosPage: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [cambios, setCambios] = useState<CambioSimpleDto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasType | null>(null);
  const [pagina, setPagina] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const pageSize = 50;

  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [modalCrearAbierto, setModalCrearAbierto] = useState<boolean>(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [cambioSeleccionado, setCambioSeleccionado] = useState<CambioSimpleDto | null>(null);

  const [filtros, setFiltros] = useState<FiltrosType>({});

  const [mesSeleccionado, setMesSeleccionado] = useState<string>(() => {
    return cambiosService.obtenerMesActualSelector();
  });

  const puedeEditar = role === 'admin' || role === 'superadmin';
  const puedeVer = role === 'viewer' || role === 'admin' || role === 'superadmin';

  const cargarCambiosPorMes = useCallback(async (
    valorMes: string,
    filtrosActuales: FiltrosType = filtros,
    paginaActual: number = pagina
  ) => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const [año, mes] = valorMes.split('-').map(Number);
      
      const filtrosMes = cambiosService.crearFiltrosDesdeMes(valorMes);
      const resultado = await cambiosService.obtenerPaginados(
        { ...filtrosMes, ...filtrosActuales },
        paginaActual,
        pageSize
      );
      setCambios(resultado.data);
      setEstadisticas(resultado.estadisticas);
      setTotalRegistros(resultado.totalRegistros);
      setTotalPaginas(resultado.totalPaginas);
      
      if (resultado.totalRegistros === 0) {
        toast.info(`No hay cambios registrados en ${MesesUtils.formatearMes(mes, año)}`);
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar cambios';
      setError(mensaje);
      toast.error(mensaje);
      setCambios([]);
      setTotalRegistros(0);
      setTotalPaginas(0);
    } finally {
      setCargandoDatos(false);
    }
  }, [filtros, pagina]);


  const handleCambioMes = (nuevoMes: string) => {
    setMesSeleccionado(nuevoMes);
    
    setFiltros({});
    setPagina(1);
  };

  const handleFiltrosChange = (nuevosFiltros: FiltrosType) => {
    setFiltros(nuevosFiltros);
    setPagina(1);
  };

  const handleActualizarEnvio = async (id: number, envio: string): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar envío');
      return false;
    }
  
    try {
      await cambiosService.actualizarEnvio(id, envio);
      toast.success('Envío actualizado correctamente');
      await cargarCambiosPorMes(mesSeleccionado); 
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
      if ('id' in cambioData && cambioData.id) {
        await cambiosService.actualizar(cambioData.id, cambioData);
        toast.success('Cambio actualizado exitosamente');
      } else {
        await cambiosService.crear(cambioData as CreateCambioSimpleDto);
        toast.success('Cambio creado exitosamente');
      }
      
      await cargarCambiosPorMes(mesSeleccionado);
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar cambio';
      toast.error(mensaje);
      return false;
    }
  };

  const handleActualizarEstados = async (id: number, estados: EstadosCambio): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para actualizar estados');
      return false;
    }

    try {
      await cambiosService.actualizarEstados(id, estados);
      toast.success('Estado actualizado correctamente');
      
      await cargarCambiosPorMes(mesSeleccionado);
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar estado';
      toast.error(mensaje);
      return false;
    }
  };

  const handleEliminarCambio = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar cambios');
      return false;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar este cambio? Esta acción no se puede deshacer.')) {
      return false;
    }

    try {
      await cambiosService.eliminar(id);
      toast.success('Cambio eliminado exitosamente');
      
      await cargarCambiosPorMes(mesSeleccionado);
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
      await cargarCambiosPorMes(mesSeleccionado);
      return true;
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar etiqueta';
      toast.error(mensaje);
      return false;
    }
  };

  const handleNuevoCambio = () => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para crear cambios');
      return;
    }
    setCambioSeleccionado(null);
    setModalCrearAbierto(true);
  };

  const handleEditarModal = (cambio: CambioSimpleDto) => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar cambios');
      return;
    }
    setCambioSeleccionado(cambio);
    setModalEditarAbierto(true);
  };

  const cerrarModales = () => {
    setModalCrearAbierto(false);
    setModalEditarAbierto(false);
    setCambioSeleccionado(null);
  };


  const recargarDatos = () => {
    cargarCambiosPorMes(mesSeleccionado);
  };

  useEffect(() => {
    if (!puedeVer) return;
    const timeoutId = window.setTimeout(() => {
      cargarCambiosPorMes(mesSeleccionado, filtros, pagina);
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [puedeVer, mesSeleccionado, filtros, pagina, cargarCambiosPorMes]);

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
              Control de cambios de productos y seguimiento de estados por mes
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

        {/* NUEVO: Selector de Meses */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <SelectorMeses
                valorSeleccionado={mesSeleccionado}
                onCambio={handleCambioMes}
                deshabilitado={cargandoDatos}
              />
              
              <div className="text-sm text-white/70">
                📊 Mostrando cambios de {(() => {
                  const [año, mes] = mesSeleccionado.split('-').map(Number);
                  return MesesUtils.formatearMes(mes, año);
                })()}
              </div>
            </div>

            {/* Contador de resultados del mes */}
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>
                Resultados: <strong className="text-white">{totalRegistros}</strong>
              </span>
              {filtros && Object.keys(filtros).length > 0 && (
                <span>
                  En esta pÃ¡gina: <strong className="text-[#B695BF]">{cambios.length}</strong>
                </span>
              )}
            </div>
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

        {/* Filtros adicionales */}
        <CambiosFiltros
          filtros={filtros}
          onFiltrosChange={handleFiltrosChange}
          totalCambios={totalRegistros}
          cambiosFiltrados={cambios.length}
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
            cambios={cambios}
            onActualizarEstados={handleActualizarEstados}
            onEliminar={handleEliminarCambio}
            onEditar={handleEditarModal}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
            onActualizarEnvio={handleActualizarEnvio}
            onActualizarEtiqueta={handleActualizarEtiqueta}
          />
        )}
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          totalElementos={totalRegistros}
          elementosPorPagina={pageSize}
          onCambioPagina={setPagina}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        />
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
