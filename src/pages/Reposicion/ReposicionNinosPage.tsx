import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Baby, Loader2, MapPin, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { FileUploader } from '@/components/Reposicion/FileUploader';
import { ValidacionArchivo } from '@/components/Reposicion/ValidacionArchivo';
import { ResultadoAnalisis } from '@/components/Reposicion/ResultadoAnalisis';
import { ProgressBar } from '@/components/Reposicion/ProgressBar';

import { reposicionNinosService } from '@/services/reposicion/reposicionNinosService';
import { 
    CONFIGURACION_NINOS_DEFAULT,
  type EstadoAnalisisNinos,
} from '@/types/reposicion/reposicionNinosTypes';
import type { ResultadoValidacionArchivo } from '@/types/reposicion/reposicionTypes';

const estadoInicial: EstadoAnalisisNinos = {
  paso: 'upload',
  upload: {
    archivo: null,
    validacion: null,
    subiendo: false,
    error: null
  },
  analisis: {
    analizando: false,
    resultado: null,
    error: null,
    progreso: 0,
    mensaje: ''
  },
  configuracion: {
    configuracion: CONFIGURACION_NINOS_DEFAULT,
    cambiosPendientes: false
  },
  descarga: {
    descargando: false,
    error: null
  }
};

export const ReposicionNinosPage: React.FC = () => {
  const navigate = useNavigate();
  const [estado, setEstado] = useState<EstadoAnalisisNinos>(estadoInicial);
  const [tiempoEjecucion, setTiempoEjecucion] = useState<number>(0);
  const [nombreArchivo, setNombreArchivo] = useState<string>('');
  const [validandoArchivo, setValidandoArchivo] = useState(false);

  const volverAlSelector = () => {
    navigate('/reposicion');
  };

  const manejarArchivoSeleccionado = (archivo: File) => {
    setValidandoArchivo(true);
    setEstado(prev => ({
      ...prev,
      upload: {
        archivo,
        validacion: null,
        subiendo: false,
        error: null
      }
    }));
  };

  const manejarValidacionCompleta = (validacion: ResultadoValidacionArchivo) => {
    setValidandoArchivo(false);
    setEstado(prev => ({
      ...prev,
      upload: {
        ...prev.upload,
        validacion,
        error: validacion.esValido ? null : 'Archivo inválido'
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
        mensaje: 'Iniciando análisis de productos de niños...'
      }
    }));

    try {
      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 30, mensaje: 'Validando archivo de niños...' }
      }));

      const inicioTiempo = Date.now();
      
      const response = await reposicionNinosService.previewAnalisis({
        archivo: estado.upload.archivo!,
        usuarioAnalisis: 'Usuario Actual',
        continuarConSucursalesFaltantes: true,
        configuracion: estado.configuracion.configuracion
      });

      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 60, mensaje: 'Procesando reposiciones para GP Y BJ...' }
      }));

      await new Promise(resolve => setTimeout(resolve, 500));

      setEstado(prev => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 90, mensaje: 'Finalizando análisis...' }
      }));

      const tiempoTotal = Date.now() - inicioTiempo;
      setTiempoEjecucion(tiempoTotal);

      if (response.exitoso && response.resultado) {
        setNombreArchivo(response.nombreArchivo || reposicionNinosService.formatearNombreArchivo());
        
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
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
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
    if (!estado.upload.archivo) return;

    setEstado(prev => ({
      ...prev,
      descarga: {
        descargando: true,
        error: null
      }
    }));

    try {
      const blob = await reposicionNinosService.analizarReposicion({
        archivo: estado.upload.archivo,
        usuarioAnalisis: 'Usuario Actual',
        continuarConSucursalesFaltantes: true,
        configuracion: estado.configuracion.configuracion
      });

      await reposicionNinosService.descargarArchivo(blob, nombreArchivo);

      setEstado(prev => ({
        ...prev,
        descarga: {
          descargando: false,
          error: null
        }
      }));
    } catch (error) {
      console.error('Error al descargar:', error);
      const mensaje = error instanceof Error ? error.message : 'Error al descargar el archivo';
      setEstado(prev => ({
        ...prev,
        descarga: {
          descargando: false,
          error: mensaje
        }
      }));
    }
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

  const reiniciarProceso = () => {
    setEstado(estadoInicial);
    setTiempoEjecucion(0);
    setNombreArchivo('');
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={volverAlSelector}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#51590E]/20 border border-[#51590E]/30">
                <Baby className="w-6 h-6 text-[#51590E]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  📦 Reposición - Productos Niños
                </h1>
                <p className="text-white/60">
                  Análisis y reposición para Kids
                </p>
              </div>
            </div>
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

        {/* Info del módulo */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#51590E]/20 border border-[#51590E]/30">
            <MapPin className="w-4 h-4 text-[#51590E]" />
            <span className="text-[#51590E] font-medium">
              Destinos: GENERAL PAZ y BARRIO JARDIN
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Target className="w-4 h-4 text-white/60" />
            <span className="text-white/60">
              Lógica: 2 unidades por talle, fallback a 1
            </span>
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
                validando={validandoArchivo}
                validacion={estado.upload.validacion}
                error={estado.upload.error}
              />

              {estado.upload.validacion && estado.upload.archivo && (
                <ValidacionArchivo
                  archivo={estado.upload.archivo}
                  validacion={estado.upload.validacion}
                  onContinuar={ejecutarAnalisis}
                  onCancelar={() => {
                    setEstado(prev => ({
                      ...prev,
                      upload: {
                        archivo: null,
                        validacion: null,
                        subiendo: false,
                        error: null
                      }
                    }));
                  }}
                />
              )}
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
                <div className="max-w-2xl mx-auto p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-red-400 mb-4">{estado.analisis.error}</p>
                  <button
                    onClick={volverAUpload}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
                  >
                    Volver al inicio
                  </button>
                </div>
              )}

              {estado.descarga.descargando && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="bg-[#212026] border border-white/20 rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#51590E]/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#51590E] animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        Generando archivo Excel...
                      </h3>
                      <p className="text-white/60 text-sm">
                        Esto puede tomar unos segundos
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {estado.descarga.error && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[#D94854]/10 border border-[#D94854]/30">
                  <AlertCircle className="w-5 h-5 text-[#D94854] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-[#D94854] mb-1">Error al descargar</h4>
                    <p className="text-sm text-white/80">{estado.descarga.error}</p>
                  </div>
                </div>
              )}

              {estado.analisis.resultado && (
                <ResultadoAnalisis
                  resultado={estado.analisis.resultado}
                  onDescargar={descargarReporte}
                  descargando={false}
                  nombreArchivo={nombreArchivo}
                  tiempoEjecucion={tiempoEjecucion}
                />
              )}

              {estado.analisis.resultado && (
                <div className="flex justify-center">
                  <button
                    onClick={volverAUpload}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Analizar otro archivo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};