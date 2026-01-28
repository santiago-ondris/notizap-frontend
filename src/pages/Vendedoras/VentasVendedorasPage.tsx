import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Settings,
  Building2,
  Calculator,
  User,
} from 'lucide-react';
import { VentasVendedorasUpload } from '@/components/Vendedoras/VentasVendedorasUpload';
import { VentasVendedorasFilters } from '@/components/Vendedoras/VentasVendedorasFilters';
import { VentasVendedorasStats } from '@/components/Vendedoras/VentasVendedorasStats';
import { VentasVendedorasTable } from '@/components/Vendedoras/VentasVendedorasTable';
import { VendedorasManagementModal } from '@/components/Vendedoras/VendedorasManagementModal';
import {
  useVentasVendedorasInitialData,
  useVentasVendedorasQuery,
  useVentasVendedorasStatsQuery,
  vendedorasKeys
} from '@/hooks/vendedoras/useVentasVendedoras';
import type {
  VentaVendedoraStats,
} from '@/types/vendedoras/ventaVendedoraTypes';
import type {
  VentaVendedoraFilters
} from '@/types/vendedoras/filtrosTypes';
import { dateHelpers } from '@/utils/vendedoras/dateHelpers';

type VistaActual = 'dashboard' | 'upload' | 'tabla' | 'comisiones';

export const VentasVendedorasPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [vistaActual, setVistaActual] = useState<VistaActual>('dashboard');
  const [modoAdmin, setModoAdmin] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  const {
    data: initialData,
    isLoading: loadingInicial,
    refetch: refetchInitial
  } = useVentasVendedorasInitialData();

  const [filtros, setFiltros] = useState<VentaVendedoraFilters>({
    incluirProductosDescuento: true,
    excluirDomingos: true,
    orderBy: 'fecha',
    orderDesc: true,
    page: 1,
    pageSize: 50
  });

  // Inicializar filtros con fechas de la última semana cuando cargan los datos iniciales
  useEffect(() => {
    if (initialData?.rangoFechas?.ultimaSemana?.fechaInicio && !filtros.fechaInicio) {
      setFiltros(prev => ({
        ...prev,
        fechaInicio: initialData.rangoFechas.ultimaSemana.fechaInicio || undefined,
        fechaFin: initialData.rangoFechas.ultimaSemana.fechaFin || undefined
      }));
    }
  }, [initialData, filtros.fechaInicio]);

  const {
    data: ventasData,
    isLoading: loadingVentas,
    refetch: refetchVentas
  } = useVentasVendedorasQuery(filtros, !!filtros.fechaInicio);

  const {
    data: stats,
    isLoading: loadingStats,
    refetch: refetchStats
  } = useVentasVendedorasStatsQuery(filtros, !!filtros.fechaInicio);

  const loading = loadingVentas || loadingStats;

  const handleUploadSuccess = async () => {
    toast.success('¡Archivo subido exitosamente!', {
      icon: <CheckCircle2 className="text-green-500" />
    });

    // Invalidar todas las queries para refrescar datos
    queryClient.invalidateQueries({ queryKey: vendedorasKeys.all });
    setVistaActual('dashboard');
  };

  const handleUploadError = (error: string) => {
    toast.error(error, {
      icon: <AlertCircle className="text-red-500" />
    });
  };

  const handleFiltrosChange = (nuevosFiltros: VentaVendedoraFilters) => {
    setFiltros(nuevosFiltros);
  };

  const refrescarDatos = async () => {
    await Promise.all([
      refetchInitial(),
      refetchVentas(),
      refetchStats()
    ]);
    toast.success('Datos actualizados');
  };


  const opcionesVista = [
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      icono: BarChart3,
      descripcion: 'Vista general con estadísticas'
    },
    {
      id: 'upload',
      label: '📤 Subir Datos',
      icono: Upload,
      descripcion: 'Cargar archivos Excel',
      soloAdmin: true
    },
    {
      id: 'tabla',
      label: '📋 Tabla Detallada',
      icono: Eye,
      descripcion: 'Vista detallada de ventas'
    },
    {
      id: 'locales',
      label: '🏢 Rendimiento por Locales',
      icono: Building2,
      descripcion: 'Análisis diario por sucursal',
      esNavegacion: true,
      ruta: '/vendedoras/rendimiento'
    },
    {
      id: 'comisiones',
      label: '💰 Comisiones',
      icono: Calculator,
      descripcion: 'Calcular y gestionar comisiones',
      esNavegacion: true,
      ruta: '/vendedoras/comisioneslocales'
    },
    {
      id: 'gestion-vendedoras',
      label: '👥 Gestionar Vendedoras',
      icono: User,
      descripcion: 'Activar/Desactivar vendedoras',
      soloAdmin: true
    }
  ];

  if (loadingInicial) {
    return (
      <div className="min-h-screen bg-[#1A1A20] flex items-center justify-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Cargando Notizap</h2>
            <p className="text-white/60">Inicializando módulo de ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A20] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header principal */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">📊 Rendimiento de Vendedoras</h1>
                <p className="text-white/70 mt-1">
                  Que la suerte este de su lado.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón de refrescar */}
              <button
                onClick={refrescarDatos}
                disabled={loading || loadingStats}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/80 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || loadingStats) ? 'animate-spin' : ''}`} />
                Actualizar
              </button>

              {/* Toggle modo admin */}
              <button
                onClick={() => setModoAdmin(!modoAdmin)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${modoAdmin
                  ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
                  }`}
              >
                <Settings className="w-4 h-4" />
                {modoAdmin ? 'Modo Admin' : 'Vista Básica'}
              </button>
            </div>
          </div>
        </div>

        {/* Navegación de vistas */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          <div className="flex flex-wrap gap-3">
            {opcionesVista
              .filter(opcion => !opcion.soloAdmin || modoAdmin)
              .map(opcion => (
                <button
                  key={opcion.id}
                  onClick={() => {
                    if (opcion.id === 'gestion-vendedoras') {
                      setIsManagementModalOpen(true);
                    } else if (opcion.esNavegacion && opcion.ruta) {
                      navigate(opcion.ruta);
                    } else {
                      setVistaActual(opcion.id as VistaActual);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${vistaActual === opcion.id
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                    : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30'
                    }`}
                >
                  <opcion.icono className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">{opcion.label}</p>
                    <p className="text-xs opacity-70">{opcion.descripcion}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Información de datos cargados */}
        {initialData?.rangoFechas && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-blue-400 font-medium">
                  💡 Datos disponibles desde{' '}
                  {initialData.rangoFechas.fechaMinima ?
                    dateHelpers.formatearFechaCompleta(initialData.rangoFechas.fechaMinima) :
                    'N/A'
                  } hasta{' '}
                  {initialData.rangoFechas.fechaMaxima ?
                    dateHelpers.formatearFechaCompleta(initialData.rangoFechas.fechaMaxima) :
                    'N/A'
                  }
                </p>
                <p className="text-blue-300/70 text-sm">
                  {initialData.sucursales.length} sucursales • {initialData.vendedores.length} vendedoras registradas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal según la vista */}
        {vistaActual === 'dashboard' && (
          <div className="space-y-6">
            {/* Filtros */}
            <VentasVendedorasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              sucursales={initialData?.sucursales || []}
              vendedores={initialData?.vendedores || []}
              rangoFechasDisponible={initialData?.rangoFechas ? {
                fechaMinima: initialData.rangoFechas.fechaMinima,
                fechaMaxima: initialData.rangoFechas.fechaMaxima
              } : undefined}
              loading={loading}
            />

            {/* Estadísticas */}
            <VentasVendedorasStats
              stats={stats || {} as VentaVendedoraStats}
              loading={loadingStats}
              mostrarComparacionSucursales={
                !filtros.sucursalNombre || filtros.sucursalNombre === ''
              }
            />
          </div>
        )}

        {vistaActual === 'upload' && modoAdmin && (
          <VentasVendedorasUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {vistaActual === 'tabla' && (
          <div className="space-y-6">
            {/* Filtros */}
            <VentasVendedorasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              sucursales={initialData?.sucursales || []}
              vendedores={initialData?.vendedores || []}
              rangoFechasDisponible={initialData?.rangoFechas ? {
                fechaMinima: initialData.rangoFechas.fechaMinima,
                fechaMaxima: initialData.rangoFechas.fechaMaxima
              } : undefined}
              loading={loading}
            />

            {/* Tabla completa */}
            <VentasVendedorasTable
              data={ventasData || { data: [], totalRegistros: 0, pagina: 1, pageSize: 50, totalPaginas: 0 }}
              stats={stats ?? ({} as VentaVendedoraStats)}
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              loading={loading}
            />
          </div>
        )}

        {/* Estado sin datos */}
        {!loadingInicial && initialData?.sucursales.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No hay datos cargados
            </h3>
            <p className="text-white/70 mb-6">
              Para comenzar el análisis, necesitas subir un archivo Excel con datos de ventas
            </p>
            {modoAdmin ? (
              <button
                onClick={() => setVistaActual('upload')}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl mx-auto transition-all"
              >
                <Upload className="w-5 h-5" />
                Subir primer archivo
              </button>
            ) : (
              <p className="text-white/50 text-sm">
                Contacta al administrador para cargar datos iniciales
              </p>
            )}
          </div>
        )}

        {/* Modals */}
        <VendedorasManagementModal
          isOpen={isManagementModalOpen}
          onClose={() => setIsManagementModalOpen(false)}
          onUpdate={refetchInitial}
        />

      </div>
    </div>
  );
};