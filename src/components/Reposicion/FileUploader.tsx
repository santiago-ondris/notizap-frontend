import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, CheckCircle, X, FileSpreadsheet } from 'lucide-react';
import type { ResultadoValidacionArchivo } from '../../types/reposicion/reposicionTypes';
import { reposicionService } from '../../services/reposicion/reposicionService';

interface FileUploaderProps {
  onArchivoSeleccionado: (archivo: File) => void;
  onValidacionCompleta: (validacion: ResultadoValidacionArchivo) => void;
  archivo: File | null;
  validando: boolean;
  validacion: ResultadoValidacionArchivo | null;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onArchivoSeleccionado,
  onValidacionCompleta,
  archivo,
  validando,
  validacion,
  error
}) => {
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErrorValidacion(null);
    
    if (acceptedFiles.length === 0) return;

    const archivoSeleccionado = acceptedFiles[0];
    
    const errorArchivo = reposicionService.validarArchivosInput([archivoSeleccionado] as any);
    if (errorArchivo) {
      setErrorValidacion(errorArchivo);
      return;
    }

    onArchivoSeleccionado(archivoSeleccionado);

    try {
      const resultadoValidacion = await reposicionService.validarArchivo(archivoSeleccionado);
      onValidacionCompleta(resultadoValidacion);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al validar archivo';
      setErrorValidacion(mensaje);
    }
  }, [onArchivoSeleccionado, onValidacionCompleta]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 500 * 1024
  });

  const limpiarArchivo = () => {
    setErrorValidacion(null);
  };

  const hayError = error || errorValidacion || (validacion && !validacion.esValido);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-[#51590E] bg-[#51590E]/10' 
            : archivo 
              ? 'border-[#B695BF] bg-[#B695BF]/5'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            {validando ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#51590E]" />
            ) : archivo ? (
              <FileSpreadsheet className="w-8 h-8 text-[#B695BF]" />
            ) : (
              <Upload className="w-8 h-8 text-white/70" />
            )}
          </div>

          {archivo ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {archivo.name}
              </h3>
              {validando && (
                <p className="text-[#51590E] text-sm font-medium">
                  Validando archivo...
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">
                {isDragActive ? 'Suelta el archivo aquí' : 'Subir archivo de inventario'}
              </h3>
              <p className="text-white/60">
                Arrastra y suelta tu archivo Excel o{' '}
                <span className="text-[#B695BF] font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-white/50 text-sm">
                Archivos Excel (.xlsx, .xls) • Máximo 900KB
              </p>
            </div>
          )}
        </div>

        {archivo && !validando && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              limpiarArchivo();
            }}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        )}
      </div>

      {hayError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#D94854]/10 border border-[#D94854]/30">
          <AlertCircle className="w-5 h-5 text-[#D94854] mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-[#D94854]">Error en el archivo</h4>
            <div className="text-sm text-white/80 space-y-1">
              {error && <p>{error}</p>}
              {errorValidacion && <p>{errorValidacion}</p>}
              {validacion && !validacion.esValido && validacion.errores.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {validacion && validacion.esValido && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#51590E]/10 border border-[#51590E]/30">
          <CheckCircle className="w-5 h-5 text-[#51590E] mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-medium text-[#51590E]">Archivo válido</h4>
            <div className="text-sm text-white/80 space-y-1">
              <p>{validacion.cantidadProductosAproximada} productos • {validacion.cantidadVariantesAproximada} variantes</p>
              <p>Sucursales: {validacion.sucursalesEncontradas.join(', ')}</p>
              {validacion.sucursalesFaltantes.length > 0 && (
                <p className="text-[#FFD700]">
                  Faltantes: {validacion.sucursalesFaltantes.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {validacion && validacion.advertencias.length > 0 && (
        <div className="space-y-2">
          {validacion.advertencias.map((advertencia, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#FFD700]">
              <AlertCircle className="w-4 h-4" />
              <span>{advertencia}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};