import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, FileUp, Settings, BarChart3 } from 'lucide-react';
import type {
    ReposicionPageState,
    ResultadoValidacionArchivo,
    ConfiguracionAnalisis
} from '../../types/reposicion/reposicionTypes';
import { reposicionService } from '../../services/reposicion/reposicionService';
import { crearConfiguracionDefecto } from '../../utils/reposicionUtils';
import { FileUploader } from '../../components/Reposicion/FileUploader';
import { ValidacionArchivo } from '../../components/Reposicion/ValidacionArchivo';
import { ConfiguracionCurvas } from '../../components/Reposicion/ConfiguracionCurvas';
import { ResultadoAnalisis } from '../../components/Reposicion/ResultadoAnalisis';
import { ProgressBar } from '../../components/Reposicion/ProgressBar';

export const ReposicionPage: React.FC = () => {
  const [estado, setEstado] = useState<ReposicionPageState>({
    paso: 'upload',
    upload: {
      archivo: null,
      arrastrando: false,
      subiendo: false,
      validando: false,
      validacion: null,
      error: null
    },
    configuracion: {
      configuracion: crearConfiguracionDefecto(),
      sucursalEditando: null,
      curvaEditando: null,
      cambiosPendientes: false,
      erroresValidacion: {}
    },
    analisis: {
      analizando: false,
      resultado: null,
      error: null,
      progreso: 0,
      mensaje: ''
    }
  });

  const [tiempoEjecucion, setTiempoEjecucion] = useState<number>(0);
  const [nombreArchivo, setNombreArchivo] = useState<string>('');

  useEffect(() => {
    if (estado.upload.validacion?.esValido && estado.upload.validacion.sucursalesEncontradas) {
      const configuracionActualizada = { ...estado.configuracion.configuracion };
      configuracionActualizada.sucursalesObjetivo = configuracionActualizada.sucursalesObjetivo
        .filter(sucursal => estado.upload.validacion!.sucursalesEncontradas.includes(sucursal));
      
      setEstado(prev => ({
        ...prev,
        configuracion: {
          ...prev.configuracion,
          configuracion: configuracionActualizada
        }
      }));
    }
  }, [estado.upload.validacion]);

  const manejarArchivoSeleccionado = (archivo: File) => {
    setEstado(prev => ({
      ...prev,
      upload: {
        ...prev.upload,
        archivo,
        validando: true,
        error: null,
        validacion: null
      }
    }));
  };

  const manejarValidacionCompleta = (validacion: ResultadoValidacionArchivo) => {
    setEstado(prev => ({
      ...prev,
      upload: {
        ...prev.upload,
        validando: false,
        validacion,
        error: validacion.esValido ? null : 'Archivo inválido'
      }
    }));
  };

  const irAPasoConfiguracion = () => {
    setEstado(prev => ({ ...prev, paso: 'configuracion' }));
  };

  const volverAUpload = () => {
    setEstado(prev => ({ 
      ...prev, 
      paso: 'upload',
      analisis: {
        analizando: false,
        resultado: null,
        error: null,
        progreso: 0,
        mensaje: ''
      }
    }));
  };

  const manejarCambioConfiguracion = (nuevaConfiguracion: ConfiguracionAnalisis) => {
    setEstado(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        configuracion: nuevaConfiguracion,
        cambiosPendientes: true
      }
    }));
  };

  const ejecutarAnalisis = async () => {
    if (!estado.upload.archivo) return;

    setEstado(prev => ({
      ...prev,
      paso: 'resultado',
      analisis: {
        analizando: true,
        resultado: null,
        error: null,
        progreso: 10,
        mensaje: 'Iniciando análisis...'
      }
    }));

    try {
      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 30, mensaje: 'Validando archivo...' }
      }));

      const inicioTiempo = Date.now();
      
      const response = await reposicionService.previewAnalisis({
        archivo: estado.upload.archivo!,
        usuarioAnalisis: 'Usuario Actual',
        continuarConSucursalesFaltantes: true,
        configuracion: estado.configuracion.configuracion
      });

      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 60, mensaje: 'Procesando reposiciones...' }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 90, mensaje: 'Finalizando análisis...' }
      }));

      const tiempoTotal = Date.now() - inicioTiempo;
      setTiempoEjecucion(tiempoTotal);

      if (response.exitoso && response.resultado) {
        setNombreArchivo(response.nombreArchivo || reposicionService.formatearNombreArchivo());
        
        setEstado(prev => ({
          ...prev,
          analisis: {
            analizando: false,
            resultado: response.resultado!,
            error: null,
            progreso: 100,
            mensaje: 'Análisis completado'
          }
        }));
      } else {
        throw new Error(response.errores.join(', ') || 'Error en el análisis');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error inesperado';
      setEstado(prev => ({
        ...prev,
        analisis: {
          analizando: false,
          resultado: null,
          error: mensaje,
          progreso: 0,
          mensaje: ''
        }
      }));
    }
  };

  const descargarReporte = async () => {
    if (!estado.analisis.resultado) return;

    try {
      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, mensaje: 'Generando archivo Excel...' }
      }));

      const blob = await reposicionService.analizarReposicion({
        archivo: estado.upload.archivo!,
        usuarioAnalisis: 'Usuario Actual',
        continuarConSucursalesFaltantes: true,
        configuracion: estado.configuracion.configuracion
      });

      reposicionService.descargarArchivo(blob, nombreArchivo);
      
      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, mensaje: 'Descarga completada' }
      }));

      setTimeout(() => {
        setEstado(prev => ({
          ...prev,
          analisis: { ...prev.analisis, mensaje: '' }
        }));
      }, 2000);

    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al descargar';
      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, error: mensaje }
      }));
    }
  };

  const reiniciarProceso = () => {
    setEstado({
      paso: 'upload',
      upload: {
        archivo: null,
        arrastrando: false,
        subiendo: false,
        validando: false,
        validacion: null,
        error: null
      },
      configuracion: {
        configuracion: crearConfiguracionDefecto(),
        sucursalEditando: null,
        curvaEditando: null,
        cambiosPendientes: false,
        erroresValidacion: {}
      },
      analisis: {
        analizando: false,
        resultado: null,
        error: null,
        progreso: 0,
        mensaje: ''
      }
    });
    setTiempoEjecucion(0);
    setNombreArchivo('');
  };

  const pasos = [
    { id: 'upload', titulo: 'Subir Archivo', icono: FileUp },
    { id: 'configuracion', titulo: 'Configuración', icono: Settings },
    { id: 'resultado', titulo: 'Resultado', icono: BarChart3 }
  ];

  const pasoActualIndex = pasos.findIndex(p => p.id === estado.paso);

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📦 Reposición de stock
            </h1>
            <p className="text-white/60">
              Lucas salame
            </p>
          </div>

          {estado.paso !== 'upload' && (
            <button
              onClick={reiniciarProceso}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Nuevo Análisis
            </button>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {pasos.map((paso, index) => {
              const estaActivo = estado.paso === paso.id;
              const estaCompletado = index < pasoActualIndex;
              const Icono = paso.icono;

              return (
                <div key={paso.id} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${estaActivo 
                        ? 'border-[#51590E] bg-[#51590E]/20 text-[#51590E]' 
                        : estaCompletado
                        ? 'border-[#51590E] bg-[#51590E] text-white'
                        : 'border-white/30 bg-white/5 text-white/50'
                      }
                    `}>
                      <Icono className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-medium transition-colors ${
                        estaActivo ? 'text-white' : estaCompletado ? 'text-[#51590E]' : 'text-white/50'
                      }`}>
                        {paso.titulo}
                      </p>
                    </div>
                  </div>
                  
                  {index < pasos.length - 1 && (
                    <div className={`w-16 h-0.5 mx-6 transition-colors ${
                      index < pasoActualIndex ? 'bg-[#51590E]' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-6">
          {estado.paso === 'upload' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <FileUploader
                onArchivoSeleccionado={manejarArchivoSeleccionado}
                onValidacionCompleta={manejarValidacionCompleta}
                archivo={estado.upload.archivo}
                validando={estado.upload.validando}
                validacion={estado.upload.validacion}
                error={estado.upload.error}
              />

              {estado.upload.validacion && estado.upload.archivo && (
                <ValidacionArchivo
                  archivo={estado.upload.archivo}
                  validacion={estado.upload.validacion}
                  onContinuar={irAPasoConfiguracion}
                  onCancelar={() => {
                    setEstado(prev => ({
                      ...prev,
                      upload: {
                        archivo: null,
                        arrastrando: false,
                        subiendo: false,
                        validando: false,
                        validacion: null,
                        error: null
                      }
                    }));
                  }}
                />
              )}
            </div>
          )}

          {estado.paso === 'configuracion' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <ConfiguracionCurvas
                configuracion={estado.configuracion.configuracion}
                onChange={manejarCambioConfiguracion}
                sucursalesEncontradas={estado.upload.validacion?.sucursalesEncontradas || []}
              />

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  onClick={volverAUpload}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Archivo
                </button>

                <button
                  onClick={ejecutarAnalisis}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:text-white transition-all font-medium"
                >
                  Ejecutar Análisis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {estado.paso === 'resultado' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {estado.analisis.analizando && (
                <div className="max-w-md mx-auto">
                  <ProgressBar
                    progreso={estado.analisis.progreso}
                    mensaje={estado.analisis.mensaje}
                    color="#51590E"
                  />
                </div>
              )}

              {estado.analisis.error && (
                <div className="max-w-2xl mx-auto rounded-xl bg-[#D94854]/10 border border-[#D94854]/30 p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D94854] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm">!</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#D94854] mb-2">Error en el análisis</h3>
                      <p className="text-white/80">{estado.analisis.error}</p>
                      <button
                        onClick={() => setEstado(prev => ({ ...prev, paso: 'configuracion' }))}
                        className="mt-4 px-4 py-2 rounded-lg bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] hover:text-white transition-all"
                      >
                        Volver a Configuración
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {estado.analisis.resultado && (
                <ResultadoAnalisis
                  resultado={estado.analisis.resultado}
                  onDescargar={descargarReporte}
                  descargando={estado.analisis.mensaje === 'Generando archivo Excel...'}
                  tiempoEjecucion={tiempoEjecucion}
                  nombreArchivo={nombreArchivo}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};