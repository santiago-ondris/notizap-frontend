import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, X, AlertTriangle } from 'lucide-react';
import { ventasVendedorasService } from '@/services/vendedoras/ventasVendedorasService';
import { validationHelpers } from '@/services/vendedoras/ventasVendedorasService';
import type { VentaVendedoraStats } from '@/types/vendedoras/ventaVendedoraTypes';

interface Props {
  onUploadSuccess: (stats: VentaVendedoraStats) => void;
  onUploadError: (error: string) => void;
}

export const VentasVendedorasUpload: React.FC<Props> = ({ onUploadSuccess, onUploadError }) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [validando, setValidando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);
  const [sobreescribir, setSobreescribir] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validacion = validationHelpers.esArchivoValido(file);
    if (!validacion.valido) {
      onUploadError(validacion.mensaje || 'Archivo inválido');
      return;
    }

    setArchivo(file);
    setErroresValidacion([]);
    
    // Validar contenido
    await validarArchivo(file);
  };

  const validarArchivo = async (file: File) => {
    setValidando(true);
    try {
      const validacion = await ventasVendedorasService.validarArchivo(file);
      setErroresValidacion(validacion.errores);
      
      if (validacion.errores.length > 0) {
        // Si hay errores de duplicados, mostrar opción de sobreescribir
        const hayDuplicados = validacion.errores.some(error => 
          error.includes('Ya existen datos para')
        );
        
        if (hayDuplicados) {
          setMostrarConfirmacion(true);
        }
      }
    } catch (error) {
      console.error('Error validando archivo:', error);
      setErroresValidacion(['Error al validar el archivo']);
    } finally {
      setValidando(false);
    }
  };

  const handleUpload = async () => {
    if (!archivo) return;

    setSubiendo(true);
    try {
      const resultado = await ventasVendedorasService.subirArchivo({
        archivo,
        sobreescribirDuplicados: sobreescribir
      });

      if (resultado.stats) {
        onUploadSuccess(resultado.stats);
        resetForm();
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'Error al subir el archivo';
      onUploadError(mensaje);
    } finally {
      setSubiendo(false);
    }
  };

  const resetForm = () => {
    setArchivo(null);
    setErroresValidacion([]);
    setSobreescribir(false);
    setMostrarConfirmacion(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      const validacion = validationHelpers.esArchivoValido(file);
      if (!validacion.valido) {
        onUploadError(validacion.mensaje || 'Archivo inválido');
        return;
      }
      
      setArchivo(file);
      validarArchivo(file);
    }
  };

  const puedeSubir = archivo && !validando && !subiendo && 
    (erroresValidacion.length === 0 || sobreescribir);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">📊 Subir Datos de Ventas</h3>
          <p className="text-sm text-white/60">Archivo Excel (.xlsx) con datos del ERP</p>
        </div>
      </div>

      {/* Zona de drop */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          archivo 
            ? 'border-green-400/40 bg-green-400/10' 
            : 'border-white/30 hover:border-white/50 hover:bg-white/5'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {archivo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-400" />
              <div>
                <p className="font-medium text-white">{archivo.name}</p>
                <p className="text-sm text-white/60">
                  {(archivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {validando && (
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Validando archivo...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-white/40 mx-auto" />
            <div>
              <p className="text-white/80 mb-2">
                Arrastra tu archivo Excel aquí o{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-red-400 hover:text-red-300 underline"
                >
                  selecciona un archivo
                </button>
              </p>
              <p className="text-sm text-white/50">
                Solo archivos .xlsx • Máximo 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Errores de validación */}
      {erroresValidacion.length > 0 && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="font-medium text-red-400">Problemas encontrados</h4>
          </div>
          <div className="space-y-2">
            {erroresValidacion.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-red-300">
                <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmación de sobreescritura */}
      {mostrarConfirmacion && (
        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-medium text-yellow-400">Datos duplicados encontrados</h4>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sobreescribir}
                onChange={(e) => setSobreescribir(e.target.checked)}
                className="w-4 h-4 rounded border border-white/30 bg-white/10 text-red-500 focus:ring-red-500/20"
              />
              <span className="text-sm text-white/80">
                Sobreescribir datos existentes
              </span>
            </label>
          </div>
          
          <p className="text-xs text-white/50 mt-2">
            ⚠️ Esta acción eliminará los datos existentes en las fechas del archivo
          </p>
        </div>
      )}

      {/* Botón de subida */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!puedeSubir}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            puedeSubir
              ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400'
              : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {subiendo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Subir archivo
            </>
          )}
        </button>
      </div>

      {/* Ayuda */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="font-medium text-blue-400 mb-2">💡 Formato esperado</h4>
        <div className="text-sm text-white/70 space-y-1">
          <p>• Columnas requeridas: SUCURSAL, VENDEDOR, PRODUCTO, FECHA, CANTIDAD, TOTAL</p>
          <p>• Los turnos se asignan automáticamente según la hora</p>
          <p>• Se detectan automáticamente productos de descuento</p>
        </div>
      </div>
    </div>
  );
};