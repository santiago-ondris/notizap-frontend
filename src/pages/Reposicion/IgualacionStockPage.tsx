import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileUp, Settings, ArrowRightLeft } from 'lucide-react';
import type {
  IgualacionPageState,
  ConfiguracionIgualacion,
  TransferenciaEditable,
} from '../../types/reposicion/igualacionTypes';
import type { ResultadoValidacionArchivo } from '../../types/reposicion/reposicionTypes';
import { igualacionService } from '../../services/reposicion/igualacionService';
import { FileUploader } from '../../components/Reposicion/FileUploader';
import { ValidacionArchivo } from '../../components/Reposicion/ValidacionArchivo';
import { ConfiguracionPrioridad } from '../../components/Reposicion/ConfiguracionPrioridad';
import { ResultadoIgualacion } from '../../components/Reposicion/ResultadoIgualacion';
import { ProgressBar } from '../../components/Reposicion/ProgressBar';

const SUCURSALES_DEFAULT = ['DEAN FUNES', 'GENERAL PAZ', 'BARRIO JARDIN', '25 DE MAYO', 'ITUZAINGO NVA CBA'];

const configuracionInicial = (): ConfiguracionIgualacion => ({
  sucursalesParticipantes: [...SUCURSALES_DEFAULT],
  ordenPrioridad: [...SUCURSALES_DEFAULT],
  ordenPrioridadDonante: [...SUCURSALES_DEFAULT].reverse(),
});

const estadoInicial = (): IgualacionPageState => ({
  paso: 'upload',
  upload: { archivo: null, validando: false, validacion: null, error: null },
  configuracion: { configuracion: configuracionInicial() },
  analisis: {
    analizando: false,
    resultado: null,
    transferenciasEditables: [],
    error: null,
    progreso: 0,
    mensaje: '',
  },
});

export const IgualacionStockPage: React.FC = () => {
  const [estado, setEstado] = useState<IgualacionPageState>(estadoInicial());
  const [tiempoEjecucion, setTiempoEjecucion] = useState(0);
  const [descargando, setDescargando] = useState(false);

  const pasos = [
    { id: 'upload', titulo: 'Subir Archivo', icono: FileUp },
    { id: 'configuracion', titulo: 'Prioridad', icono: Settings },
    { id: 'resultado', titulo: 'Transferencias', icono: ArrowRightLeft },
  ];
  const pasoActualIndex = pasos.findIndex((p) => p.id === estado.paso);

  const manejarArchivoSeleccionado = (archivo: File) => {
    setEstado((prev) => ({
      ...prev,
      upload: { ...prev.upload, archivo, validando: true, error: null, validacion: null },
    }));
  };

  const manejarValidacionCompleta = (validacion: ResultadoValidacionArchivo) => {
    const sucursalesEncontradas = validacion.sucursalesEncontradas ?? [];

    // Filtrar config a las sucursales del archivo
    const participantes = SUCURSALES_DEFAULT.filter((s) =>
      sucursalesEncontradas.some((e) => e.toUpperCase() === s.toUpperCase())
    );

    setEstado((prev) => ({
      ...prev,
      upload: { ...prev.upload, validando: false, validacion, error: validacion.esValido ? null : 'Archivo inválido' },
      configuracion: {
        configuracion: {
          sucursalesParticipantes: participantes,
          ordenPrioridad: participantes,
          ordenPrioridadDonante: [...participantes].reverse(),
        },
      },
    }));
  };

  const irAConfiguracion = () => setEstado((prev) => ({ ...prev, paso: 'configuracion' }));
  const volverAUpload = () =>
    setEstado((prev) => ({
      ...prev,
      paso: 'upload',
      analisis: { ...estadoInicial().analisis },
    }));

  const manejarCambioConfiguracion = (nueva: ConfiguracionIgualacion) => {
    setEstado((prev) => ({ ...prev, configuracion: { configuracion: nueva } }));
  };

  const ejecutarAnalisis = async () => {
    if (!estado.upload.archivo) return;

    setEstado((prev) => ({
      ...prev,
      paso: 'resultado',
      analisis: { analizando: true, resultado: null, transferenciasEditables: [], error: null, progreso: 20, mensaje: 'Iniciando análisis...' },
    }));

    try {
      const inicio = Date.now();

      setEstado((prev) => ({
        ...prev,
        analisis: { ...prev.analisis, progreso: 50, mensaje: 'Calculando transferencias...' },
      }));

      const response = await igualacionService.previewIgualacion(
        estado.upload.archivo!,
        estado.configuracion.configuracion
      );

      setTiempoEjecucion(Date.now() - inicio);

      if (response.exitoso && response.resultado) {
        const editables: TransferenciaEditable[] = response.resultado.transferencias.map((t) => ({
          ...t,
          incluida: true,
          cantidadEditada: t.cantidad,
        }));

        setEstado((prev) => ({
          ...prev,
          analisis: {
            analizando: false,
            resultado: response.resultado!,
            transferenciasEditables: editables,
            error: null,
            progreso: 100,
            mensaje: 'Análisis completado',
          },
        }));
      } else {
        throw new Error(response.errores.join(', ') || 'Error en el análisis');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error inesperado';
      setEstado((prev) => ({
        ...prev,
        analisis: { ...prev.analisis, analizando: false, error: mensaje, progreso: 0, mensaje: '' },
      }));
    }
  };

  const manejarCambioTransferencias = (actualizadas: TransferenciaEditable[]) => {
    setEstado((prev) => ({
      ...prev,
      analisis: { ...prev.analisis, transferenciasEditables: actualizadas },
    }));
  };

  const descargar = async () => {
    const incluidas = estado.analisis.transferenciasEditables
      .filter((t) => t.incluida)
      .map(({ incluida: _i, cantidadEditada, ...t }) => ({ ...t, cantidad: cantidadEditada }));

    if (!incluidas.length) return;

    setDescargando(true);
    try {
      const blob = await igualacionService.generarExcel(incluidas);
      igualacionService.descargarArchivo(blob, igualacionService.formatearNombreArchivo());
    } catch {
      // error silencioso; el botón vuelve a su estado normal
    } finally {
      setDescargando(false);
    }
  };

  const reiniciar = () => {
    setEstado(estadoInicial());
    setTiempoEjecucion(0);
  };

  return (
    <div className="min-h-screen bg-[#1A1A20] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ⚖️ Igualación de stock
            </h1>
            <p className="text-white/60">
              Redistribuye el stock equitativamente entre sucursales de venta
            </p>
          </div>
          {estado.paso !== 'upload' && (
            <button
              onClick={reiniciar}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Nuevo Análisis
            </button>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-8">
            {pasos.map((paso, index) => {
              const estaActivo = estado.paso === paso.id;
              const estaCompletado = index < pasoActualIndex;
              const Icono = paso.icono;
              return (
                <div key={paso.id} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        estaActivo
                          ? 'border-[#B695BF] bg-[#B695BF]/20 text-[#B695BF]'
                          : estaCompletado
                          ? 'border-[#B695BF] bg-[#B695BF] text-white'
                          : 'border-white/30 bg-white/5 text-white/50'
                      }`}
                    >
                      <Icono className="w-5 h-5" />
                    </div>
                    <p
                      className={`font-medium transition-colors ${
                        estaActivo ? 'text-white' : estaCompletado ? 'text-[#B695BF]' : 'text-white/50'
                      }`}
                    >
                      {paso.titulo}
                    </p>
                  </div>
                  {index < pasos.length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-6 transition-colors ${
                        index < pasoActualIndex ? 'bg-[#B695BF]' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Paso 1: Upload */}
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
                  onContinuar={irAConfiguracion}
                  onCancelar={() =>
                    setEstado((prev) => ({
                      ...prev,
                      upload: { archivo: null, validando: false, validacion: null, error: null },
                    }))
                  }
                />
              )}
            </div>
          )}

          {/* Paso 2: Configuración de prioridad */}
          {estado.paso === 'configuracion' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <ConfiguracionPrioridad
                  configuracion={estado.configuracion.configuracion}
                  sucursalesEncontradas={estado.upload.validacion?.sucursalesEncontradas ?? []}
                  onChange={manejarCambioConfiguracion}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={volverAUpload}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Archivo
                </button>
                <button
                  onClick={ejecutarAnalisis}
                  disabled={estado.configuracion.configuracion.sucursalesParticipantes.length < 2}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#B695BF]/20 hover:bg-[#B695BF]/30 border border-[#B695BF]/30 text-[#B695BF] hover:text-white transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Ejecutar Análisis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Resultado */}
          {estado.paso === 'resultado' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {estado.analisis.analizando && (
                <div className="max-w-md mx-auto">
                  <ProgressBar
                    progreso={estado.analisis.progreso}
                    mensaje={estado.analisis.mensaje}
                    color="#B695BF"
                  />
                </div>
              )}

              {estado.analisis.error && (
                <div className="max-w-2xl mx-auto rounded-xl bg-[#D94854]/10 border border-[#D94854]/30 p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#D94854] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#D94854] mb-2">Error en el análisis</h3>
                      <p className="text-white/80">{estado.analisis.error}</p>
                      <button
                        onClick={() => setEstado((prev) => ({ ...prev, paso: 'configuracion' }))}
                        className="mt-4 px-4 py-2 rounded-lg bg-[#D94854]/20 hover:bg-[#D94854]/30 border border-[#D94854]/30 text-[#D94854] hover:text-white transition-all"
                      >
                        Volver a Configuración
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {estado.analisis.resultado && (
                <ResultadoIgualacion
                  resultado={estado.analisis.resultado}
                  transferenciasEditables={estado.analisis.transferenciasEditables}
                  onTransferenciasChange={manejarCambioTransferencias}
                  onDescargar={descargar}
                  descargando={descargando}
                  tiempoEjecucion={tiempoEjecucion}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
