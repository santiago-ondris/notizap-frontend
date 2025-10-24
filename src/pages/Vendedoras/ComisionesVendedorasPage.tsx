import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Building2, Calculator, Table, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComisionesCalendario } from '@/components/Vendedoras/Comisiones/ComisionesCalendario';
import { ComisionDiaModal } from '@/components/Vendedoras/Comisiones/ComisionDiaModal';
import { ComisionesCalculadora } from '@/components/Vendedoras/Comisiones/ComisionesCalculadora';
import { ComisionesPorVendedora } from '@/components/Vendedoras/Comisiones/ComisionesPorVendedora';
import { ComisionesPorSucursal } from '@/components/Vendedoras/Comisiones/ComisionesPorSucursal';
import { ComisionesTable } from '@/components/Vendedoras/Comisiones/ComisionesTable';
import { ComisionesFilters } from '@/components/Vendedoras/Comisiones/ComisionesFilters';
import { comisionesVendedorasService } from '@/services/vendedoras/comisionesVendedorasService';
import { comisionFechas } from '@/utils/vendedoras/comisionHelpers';
import { toast } from 'react-toastify';
import type { 
  DiaCalendario,
  ComisionesResponse,
  DatosMaestrosComisiones
} from '@/types/vendedoras/comisionTypes';
import type { 
  VistaComision,
  ComisionVendedoraFilters 
} from '@/types/vendedoras/comisionFiltersTypes';

type VistaActual = VistaComision | 'tabla-general';

interface OpcionVista {
  key: VistaActual;
  label: string;
  icono: React.ComponentType<{ className?: string }>;
  descripcion: string;
}

const OPCIONES_VISTA: OpcionVista[] = [
  {
    key: 'calendario',
    label: 'Calendario',
    icono: Calendar,
    descripcion: 'Vista mensual con estados de comisiones'
  },
  {
    key: 'por-vendedora',
    label: 'Por vendedora',
    icono: User,
    descripcion: 'Comisiones de una vendedora específica'
  },
  {
    key: 'por-sucursal',
    label: 'Por sucursal',
    icono: Building2,
    descripcion: 'Comisiones por sucursal y turno'
  },
  {
    key: 'tabla-general',
    label: 'Tabla general',
    icono: Table,
    descripcion: 'Vista completa de todas las comisiones'
  }
];

export const ComisionesVendedorasPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [vistaActual, setVistaActual] = useState<VistaActual>('por-vendedora');
  
  const [modalDiaAbierto, setModalDiaAbierto] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaCalendario | null>(null);
  const [calculadoraAbierta, setCalculadoraAbierta] = useState(false);
  const [datosCalculadora, setDatosCalculadora] = useState<{
    fecha: string;
    sucursal: string;
    turno: string;
    esRecalculo: boolean;
  } | null>(null);

  const [comisionesGenerales, setComisionesGenerales] = useState<ComisionesResponse | null>(null);
  const [datosMaestros, setDatosMaestros] = useState<DatosMaestrosComisiones | null>(null);
  const [loadingTablaGeneral, setLoadingTablaGeneral] = useState(false);
  
  const rangoMesAnterior = comisionFechas.rangoMesAnterior();
  const [filtrosGenerales, setFiltrosGenerales] = useState<ComisionVendedoraFilters>({
    fechaInicio: comisionFechas.formatearParaApi(rangoMesAnterior.inicio),
    fechaFin: comisionFechas.formatearParaApi(rangoMesAnterior.fin),
    excluirDomingos: true,
    orderBy: 'fecha',
    orderDesc: true,
    page: 1,
    pageSize: 50
  });

  React.useEffect(() => {
    if (vistaActual === 'tabla-general') {
      cargarDatosMaestros();
      cargarTablaGeneral();
    }
  }, [vistaActual]);

  React.useEffect(() => {
    if (vistaActual === 'tabla-general' && datosMaestros) {
      cargarTablaGeneral();
    }
  }, [filtrosGenerales, vistaActual, datosMaestros]);

  const cargarDatosMaestros = async () => {
    if (datosMaestros) return; 
    
    try {
      const datos = await comisionesVendedorasService.obtenerDatosMaestros();
      setDatosMaestros(datos);
    } catch (err) {
      console.error('Error cargando datos maestros:', err);
      toast.error('Error al cargar datos maestros');
    }
  };

  const cargarTablaGeneral = async () => {
    try {
      setLoadingTablaGeneral(true);
      const comisiones = await comisionesVendedorasService.obtenerComisiones(filtrosGenerales);
      setComisionesGenerales(comisiones);
    } catch (err) {
      console.error('Error cargando tabla general:', err);
      toast.error('Error al cargar comisiones');
    } finally {
      setLoadingTablaGeneral(false);
    }
  };

  const handleDiaClick = (dia: DiaCalendario) => {
    setDiaSeleccionado(dia);
    setModalDiaAbierto(true);
  };

  const handleCalcularClick = (fecha: string, sucursal: string, turno: string) => {
    setDatosCalculadora({
      fecha,
      sucursal,
      turno,
      esRecalculo: false
    });
    setCalculadoraAbierta(true);
    setModalDiaAbierto(false);
  };

  const handleRecalcularClick = (fecha: string, sucursal: string, turno: string) => {
    setDatosCalculadora({
      fecha,
      sucursal,
      turno,
      esRecalculo: true
    });
    setCalculadoraAbierta(true);
    setModalDiaAbierto(false);
  };

  const handleCalculadoraSuccess = () => {
    toast.success('¡Comisiones calculadas correctamente!');
  };

  const handleFiltrosGeneralesChange = (filtros: Partial<ComisionVendedoraFilters>) => {
    setFiltrosGenerales(prev => ({
      ...prev,
      ...filtros
    }));
  };

  const renderVistaActual = () => {
    switch (vistaActual) {
      case 'calendario':
        return (
          <ComisionesCalendario onDiaClick={handleDiaClick} />
        );
        
      case 'por-vendedora':
        return (
          <ComisionesPorVendedora />
        );
        
      case 'por-sucursal':
        return (
          <ComisionesPorSucursal />
        );
        
      case 'calcular':
        return (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/80 mb-2">Calculadora de comisiones</h3>
            <p className="text-white/60 max-w-md mx-auto mb-6">
              Para calcular comisiones, ve al calendario y haz clic en un día específico, 
              o selecciona una fecha desde el modal del día.
            </p>
            <button
              onClick={() => setVistaActual('calendario')}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 transition-colors"
            >
              Ir al calendario
            </button>
          </div>
        );
        
      case 'tabla-general':
        return (
          <div className="space-y-6">
            {/* Filtros */}
            {datosMaestros && (
              <ComisionesFilters
                filtros={filtrosGenerales}
                onFiltrosChange={handleFiltrosGeneralesChange}
                sucursales={datosMaestros.sucursales}
                vendedores={datosMaestros.vendedores}
                loading={loadingTablaGeneral}
                showVendedorFilter={true}
                showMontoFilters={true}
                showAdvancedFilters={true}
              />
            )}

            {/* Tabla */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Table className="w-5 h-5" />
                Todas las comisiones
              </h3>

              {comisionesGenerales ? (
                <ComisionesTable
                  data={comisionesGenerales}
                  filtros={filtrosGenerales}
                  onFiltrosChange={handleFiltrosGeneralesChange}
                  loading={loadingTablaGeneral}
                />
              ) : (
                <div className="text-center py-8">
                  <Table className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/80 mb-2">
                    {loadingTablaGeneral ? 'Cargando comisiones...' : 'Sin comisiones'}
                  </h3>
                  <p className="text-white/60">
                    {loadingTablaGeneral 
                      ? 'Obteniendo todas las comisiones registradas'
                      : 'No hay comisiones para mostrar con los filtros aplicados'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              
              {/* Título y navegación */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/vendedoras')}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver a Vendedoras
                </button>

                <button
                  onClick={() => navigate('/vendedoras/comisioneslocales/info')}
                  className="flex items-center gap-2 px-3 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-xl text-violet-300 transition-all hover:text-violet-200"
                >
                  <Info className="w-4 h-4" />
                  ¿Cómo se calculan?
                </button>
                
                <div>
                  <h1 className="text-1xl text-white">Comisiones de Vendedoras</h1>
                </div>
              </div>

              {/* Selector de vista */}
              <div className="flex flex-wrap gap-2">
                {OPCIONES_VISTA.map(opcion => {
                  const IconComponent = opcion.icono;
                  return (
                    <button
                      key={opcion.key}
                      onClick={() => setVistaActual(opcion.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        vistaActual === opcion.key
                          ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                          : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white'
                      )}
                      title={opcion.descripcion}
                    >
                      <IconComponent className="w-4 h-4" />
                      {opcion.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          {renderVistaActual()}
        </div>

        {/* Modal del día */}
        {modalDiaAbierto && diaSeleccionado && (
          <ComisionDiaModal
            dia={diaSeleccionado}
            isOpen={modalDiaAbierto}
            onClose={() => setModalDiaAbierto(false)}
            onCalcularClick={handleCalcularClick}
            onRecalcularClick={handleRecalcularClick}
          />
        )}

        {/* Modal calculadora */}
        {calculadoraAbierta && datosCalculadora && (
          <ComisionesCalculadora
            fecha={datosCalculadora.fecha}
            sucursalNombre={datosCalculadora.sucursal}
            turno={datosCalculadora.turno}
            isOpen={calculadoraAbierta}
            onClose={() => setCalculadoraAbierta(false)}
            onSuccess={handleCalculadoraSuccess}
            esRecalculo={datosCalculadora.esRecalculo}
          />
        )}
      </div>
    </div>
  );
};