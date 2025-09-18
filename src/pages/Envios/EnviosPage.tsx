import React, { useState, useEffect } from 'react';
import { Truck, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import EnviosSelectorMes from '@/components/Envios/EnviosSelectorMes';
import EnviosTabla from '@/components/Envios/EnviosTabla';
import EnviosResumen from '@/components/Envios/EnviosResumen';
import enviosService from '@/services/envios/enviosService';
import { 
  type EnvioDiario, 
  type EnvioResumenMensual,
  type CambioEnvio,
  type ResultadoLoteDto
} from '@/types/envios/enviosTypes';

const EnviosPage: React.FC = () => {
  const { role } = useAuth();
  
  const [enviosMensuales, setEnviosMensuales] = useState<EnvioDiario[]>([]);
  const [resumenMensual, setResumenMensual] = useState<EnvioResumenMensual | null>(null);
  
  const [añoActual, setAñoActual] = useState<number>(new Date().getFullYear());
  const [mesActual, setMesActual] = useState<number>(new Date().getMonth() + 1);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [cargandoResumen, setCargandoResumen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const puedeEditar = role === 'admin' || role === 'superadmin';

  const cargarEnviosMensuales = async (año: number, mes: number) => {
    setCargandoDatos(true);
    setError(null);
    
    try {
      const envios = await enviosService.getEnviosMensuales({ year: año, month: mes });
      
      const enviosCompletos = enviosService.generarDiasCompletos(envios, año, mes);
      
      setEnviosMensuales(enviosCompletos);
      
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

  const cargarResumenMensual = async (año: number, mes: number) => {
    setCargandoResumen(true);
    
    try {
      const resumen = await enviosService.getResumenMensual({ year: año, month: mes });
      setResumenMensual(resumen);
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      setResumenMensual(null);
    } finally {
      setCargandoResumen(false);
    }
  };

  const handleCambioFecha = (año: number, mes: number) => {
    setAñoActual(año);
    setMesActual(mes);
  };

  const handleGuardarLote = async (cambios: Map<string, CambioEnvio>): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para editar registros');
      return false;
    }

    if (cambios.size === 0) {
      toast.warning('No hay cambios para guardar');
      return false;
    }

    try {
      enviosService.debugCambios(cambios);

      const resultado: ResultadoLoteDto = await enviosService.guardarEnviosLote(cambios);
      
      if (resultado.todosExitosos) {
        toast.success(resultado.mensaje);
        
        await cargarEnviosMensuales(añoActual, mesActual);
        await cargarResumenMensual(añoActual, mesActual);
        
        return true;
      } else {
        
        toast.error(
          <div>
            <p className="font-semibold mb-2">Error al guardar cambios</p>
            <p className="text-sm">{resultado.mensaje}</p>
            {resultado.errores.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs opacity-80">Ver errores específicos</summary>
                <ul className="mt-1 text-xs opacity-70">
                  {resultado.errores.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </details>
            )}
            <p className="text-xs mt-2 opacity-80">
              💡 Intenta guardando celda por celda para encontrar el error específico
            </p>
          </div>,
          { autoClose: 8000 }
        );
        
        return false;
      }
      
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido al guardar cambios';
      
      toast.error(
        <div>
          <p className="font-semibold mb-2">Error crítico</p>
          <p className="text-sm">{mensaje}</p>
          <p className="text-xs mt-2 opacity-80">
            💡 Intenta guardando celda por celda para encontrar el error específico
          </p>
        </div>,
        { autoClose: 6000 }
      );
      
      return false;
    }
  };

  const handleEliminarEnvio = async (id: number): Promise<boolean> => {
    if (!puedeEditar) {
      toast.error('No tienes permisos para eliminar registros');
      return false;
    }

    try {
      await enviosService.eliminarEnvio(id);
      
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

  const recargarDatos = () => {
    cargarEnviosMensuales(añoActual, mesActual);
    cargarResumenMensual(añoActual, mesActual);
  };

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
                Control diario de envíos por tipo y destino • Modo Batch Save
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
            onGuardarLote={handleGuardarLote}
            onEliminarEnvio={handleEliminarEnvio}
            puedeEditar={puedeEditar}
            cargando={cargandoDatos}
          />
        )}

        {/* Cards de resumen */}
        <EnviosResumen 
          resumen={resumenMensual}
          cargando={cargandoResumen}
        />
      </div>
    </div>
  );
};

export default EnviosPage;