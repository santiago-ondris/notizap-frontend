import React, { useState, useEffect } from 'react';
import { Truck, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import EnviosSelectorMes from '@/components/Envios/EnviosSelectorMes';
import EnviosTabla from '@/components/Envios/EnviosTabla';
import EnviosResumen from '@/components/Envios/EnviosResumen';
import enviosService from '@/services/envios/enviosService';
import { 
  type EnvioDiario, 
  type EnvioResumenMensual, 
  type CreateEnvioDiarioDto,
  type UpdateEnvioDiarioDto 
} from '@/types/envios/enviosTypes';

const EnviosPage: React.FC = () => {
  // Context de autenticación
  const { role } = useAuth();
  
  // Estados principales
  const [enviosMensuales, setEnviosMensuales] = useState<EnvioDiario[]>([]);
  const [resumenMensual, setResumenMensual] = useState<EnvioResumenMensual | null>(null);
  
  // Estados de UI
  const [añoActual, setAñoActual] = useState<number>(new Date().getFullYear());
  const [mesActual, setMesActual] = useState<number>(new Date().getMonth() + 1);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [cargandoResumen, setCargandoResumen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario puede editar
  const puedeEditar = role === 'admin' || role === 'superadmin';

  /**
   * Cargar envíos mensuales desde la API
   */
  const cargarEnviosMensuales = async (año: number, mes: number) => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const envios = await enviosService.getEnviosMensuales({ year: año, month: mes });
      
      // Generar días completos del mes (incluye días sin registro)
      const enviosCompletos = enviosService.generarDiasCompletos(envios, año, mes);
      
      setEnviosMensuales(enviosCompletos);
      
      // Mostrar mensaje si no hay datos
      if (envios.length === 0) {
        toast.info(`No hay registros de envíos para ${mes}/${año}`);
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar envíos';
      setError(mensaje);
      toast.error(mensaje);
      setEnviosMensuales([]);
    } finally {
      setCargandoDatos(false);
    }
  };

  /**
   * Cargar resumen mensual desde la API
   */
  const cargarResumenMensual = async (año: number, mes: number) => {
    setCargandoResumen(true);
    
    try {
      const resumen = await enviosService.getResumenMensual({ year: año, month: mes });
      setResumenMensual(resumen);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      // No mostramos toast para el resumen, solo console.error
      setResumenMensual(null);
    } finally {
      setCargandoResumen(false);
    }
  };

  /**
   * Manejar cambio de mes/año desde el selector
   */
  const handleCambioFecha = (año: number, mes: number) => {
    setAñoActual(año);
    setMesActual(mes);
  };

  /**
   * Manejar guardado de un envío desde la tabla
   */
  const handleGuardarEnvio = async (
    envioData: CreateEnvioDiarioDto | UpdateEnvioDiarioDto, 
    id?: number
  ): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar registros');
      return false;
    }

    try {
      // Validar datos antes de enviar
      const validacion = enviosService.validarEnvio(envioData);
      if (validacion !== true) {
        toast.error(validacion);
        return false;
      }

      // Guardar en la API
      await enviosService.guardarEnvio(envioData, id);
      
      // Recargar datos completos para asegurar sincronización
      await cargarEnviosMensuales(añoActual, mesActual);
      await cargarResumenMensual(añoActual, mesActual);
      
      toast.success(id ? 'Envío actualizado correctamente' : 'Envío creado correctamente');
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al guardar envío';
      toast.error(mensaje);
      return false;
    }
  };

  /**
   * Manejar eliminación de un envío
   */
  const handleEliminarEnvio = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar registros');
      return false;
    }

    try {
      await enviosService.eliminarEnvio(id);
      
      // Recargar datos completos para asegurar sincronización
      await cargarEnviosMensuales(añoActual, mesActual);
      await cargarResumenMensual(añoActual, mesActual);
      
      toast.success('Envío eliminado correctamente');
      return true;
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar envío';
      toast.error(mensaje);
      return false;
    }
  };

  /**
   * Recargar todos los datos
   */
  const recargarDatos = () => {
    cargarEnviosMensuales(añoActual, mesActual);
    cargarResumenMensual(añoActual, mesActual);
  };

  // Effect para cargar datos cuando cambia el mes/año
  useEffect(() => {
    cargarEnviosMensuales(añoActual, mesActual);
    cargarResumenMensual(añoActual, mesActual);
  }, [añoActual, mesActual]);

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D94854]/20 border border-[#D94854]/30 rounded-lg">
              <Truck className="w-6 h-6 text-[#D94854]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                📦 Gestión de Envíos
              </h1>
              <p className="text-white/60 text-sm">
                Control diario de envíos por tipo y destino
              </p>
            </div>
          </div>

          {/* Botón de recarga */}
          <button
            onClick={recargarDatos}
            disabled={cargandoDatos || cargandoResumen}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-white/80 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(cargandoDatos || cargandoResumen) ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Selector de mes/año */}
        <EnviosSelectorMes
          año={añoActual}
          mes={mesActual}
          onCambioFecha={handleCambioFecha}
          cargando={cargandoDatos}
        />

        {/* Cards de resumen */}
        <EnviosResumen 
          resumen={resumenMensual}
          cargando={cargandoResumen}
        />

        {/* Mensaje de permisos */}
        {!puedeEditar && (
          <div className="flex items-center gap-2 p-4 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#FFD700]" />
            <span className="text-[#FFD700] text-sm">
              Solo usuarios administradores pueden editar los registros de envíos
            </span>
          </div>
        )}

        {/* Tabla principal */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <AlertCircle className="w-8 h-8 text-[#D94854] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error al cargar datos</h3>
            <p className="text-white/60 text-sm mb-4 text-center">{error}</p>
            <button
              onClick={recargarDatos}
              className="px-4 py-2 bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 rounded-lg text-[#D94854] transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <EnviosTabla
            envios={enviosMensuales}
            onGuardarEnvio={handleGuardarEnvio}
            onEliminarEnvio={handleEliminarEnvio}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
          />
        )}

        {/* Información adicional */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-[#51590E] mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-white">💡 Información sobre envíos</h4>
              <div className="text-sm text-white/70 space-y-1">
                <p>• <strong>Córdoba Capital:</strong> Incluye Roberto, Tino y Caddy</p>
                <p>• <strong>Totales automáticos:</strong> Se calculan al guardar cada registro</p>
                <p>• <strong>Edición:</strong> Haz clic en cualquier celda para editar el valor</p>
                {puedeEditar && (
                  <p>• <strong>Eliminar:</strong> Botón disponible en cada fila con datos</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnviosPage;