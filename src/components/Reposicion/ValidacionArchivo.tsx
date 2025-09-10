import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileSpreadsheet, 
  Building2, 
  Package, 
  Layers,
  AlertCircle
} from 'lucide-react';
import type { ResultadoValidacionArchivo } from '../../types/reposicion/reposicionTypes';

interface ValidacionArchivoProps {
  archivo: File;
  validacion: ResultadoValidacionArchivo;
  onContinuar?: () => void;
  onCancelar?: () => void;
  mostrarAcciones?: boolean;
}

export const ValidacionArchivo: React.FC<ValidacionArchivoProps> = ({
  archivo,
  validacion,
  onContinuar,
  onCancelar,
  mostrarAcciones = true
}) => {
  const tieneAdvertencias = validacion.advertencias.length > 0;
  const tieneSucursalesFaltantes = validacion.sucursalesFaltantes.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[#B695BF]/20 border border-[#B695BF]/30 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-[#B695BF]" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Información del Archivo
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Nombre:</span>
                <span className="text-white font-medium">{archivo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Tipo:</span>
                <span className="text-white">{archivo.type || 'Excel'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`
        rounded-xl backdrop-blur-sm border p-6
        ${validacion.esValido 
          ? 'bg-[#51590E]/10 border-[#51590E]/30' 
          : 'bg-[#D94854]/10 border-[#D94854]/30'
        }
      `}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {validacion.esValido ? (
              <CheckCircle className="w-8 h-8 text-[#51590E]" />
            ) : (
              <XCircle className="w-8 h-8 text-[#D94854]" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-semibold mb-3 ${
              validacion.esValido ? 'text-[#51590E]' : 'text-[#D94854]'
            }`}>
              {validacion.esValido ? 'Archivo Válido' : 'Archivo Inválido'}
            </h3>
            
            {validacion.errores.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium text-[#D94854]">Errores encontrados:</h4>
                <ul className="space-y-1">
                  {validacion.errores.map((error, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <XCircle className="w-4 h-4 text-[#D94854] mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validacion.esValido && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Package className="w-5 h-5 text-[#D94854]" />
                  <div>
                    <p className="text-sm text-white/70">Productos</p>
                    <p className="font-semibold text-white">{validacion.cantidadProductosAproximada}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Layers className="w-5 h-5 text-[#B695BF]" />
                  <div>
                    <p className="text-sm text-white/70">Variantes</p>
                    <p className="font-semibold text-white">{validacion.cantidadVariantesAproximada}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {validacion.esValido && validacion.sucursalesEncontradas.length > 0 && (
        <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#B695BF]/20 border border-[#B695BF]/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#B695BF]" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-3">
                Sucursales Encontradas
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {validacion.sucursalesEncontradas.map(sucursal => (
                  <div
                    key={sucursal}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#51590E]/10 border border-[#51590E]/30"
                  >
                    <CheckCircle className="w-4 h-4 text-[#51590E]" />
                    <span className="text-sm text-white">{sucursal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tieneSucursalesFaltantes && (
        <div className="rounded-xl bg-[#FFD700]/10 backdrop-blur-sm border border-[#FFD700]/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-[#FFD700]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#FFD700] mb-3">
                Sucursales Faltantes
              </h3>
              <p className="text-white/80 text-sm mb-3">
                Las siguientes sucursales no se encontraron en el archivo. 
                El análisis continuará sin estas sucursales.
              </p>
              
              <div className="space-y-2">
                {validacion.sucursalesFaltantes.map(sucursal => (
                  <div
                    key={sucursal}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30"
                  >
                    <AlertCircle className="w-4 h-4 text-[#FFD700]" />
                    <span className="text-sm text-white">{sucursal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tieneAdvertencias && (
        <div className="rounded-xl bg-[#FFD700]/10 backdrop-blur-sm border border-[#FFD700]/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#FFD700]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#FFD700] mb-3">
                Advertencias
              </h3>
              
              <ul className="space-y-2">
                {validacion.advertencias.map((advertencia, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                    <AlertTriangle className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" />
                    <span>{advertencia}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validacion.informacionEstructura && (
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
          <p className="text-sm text-white/70 leading-relaxed">
            <strong className="text-white">Estructura:</strong> {validacion.informacionEstructura}
          </p>
        </div>
      )}

      {mostrarAcciones && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={onCancelar}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
          >
            Cambiar Archivo
          </button>
          
          <button
            onClick={onContinuar}
            disabled={!validacion.puedeProceder}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all
              ${validacion.puedeProceder
                ? 'bg-[#51590E]/20 hover:bg-[#51590E]/30 border border-[#51590E]/30 text-[#51590E] hover:text-white'
                : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
              }
            `}
          >
            {tieneSucursalesFaltantes ? 'Continuar de Todas Formas' : 'Continuar'}
          </button>
        </div>
      )}
    </div>
  );
};